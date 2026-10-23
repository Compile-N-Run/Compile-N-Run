// WeChat Official Account (公众号) sign-in through message push. The Worker makes no API calls (Workers have no
// fixed egress IP for the API whitelist). Default (mode 'scan'): `start` assigns the pending login a temporary
// parametric QR ticket from a pool that tools/wechat_qr_pool.py (on a whitelisted server) uploads to /pool; the
// reader scans it, WeChat pushes subscribe (EventKey qrscene_<scene>) or SCAN (EventKey <scene>) with the reader's
// openid, and that confirms the login. Fallback (mode 'code', pool empty): the page shows the account's static QR
// and a 6-digit code, and the reader sends the code as a message. Either way the browser that started the login
// (binding cookie) polls /status to consume the confirmed row once. Protocol reference: 公众号「消息管理 / 接收普通消息 /
// 接收事件推送 / 被动回复用户消息」, 「账号管理 / 生成带参数的二维码」 and the message encryption guide (WXBizMsgCrypt:
// AES-256-CBC, PKCS#7 with a 32-byte block).
import { siteName, siteOrigin, text } from '../lib/http.js';
import { limitedJSON } from '../lib/body.js';
import { PROVIDERS, response, cookie, readCookie, hash, randomToken, session, sameToken, now, providerIdentity, signInIdentity, saveProfile } from './core.js';

export const WECHAT_START = '/api/auth/wechat/start';
export const WECHAT_EVENTS = '/api/auth/wechat/events';
export const WECHAT_STATUS = '/api/auth/wechat/status';
export const WECHAT_POOL = '/api/auth/wechat/pool';
export const WECHAT_ROUTES = { [WECHAT_START]: 'POST', [WECHAT_EVENTS]: 'GET,POST', [WECHAT_STATUS]: 'GET', [WECHAT_POOL]: 'GET,POST' };
const WX_COOKIE = '__Host-cnr_wx';
const LOGIN_SECONDS = 600;
const MAX_SKEW = 300;
const MAX_PENDING = 20000;
const MAX_FAILURES = 10, FAILURE_WINDOW = 3600;
const OPENID = /^[A-Za-z0-9_-]{1,64}$/;
const CODE = /^\d{6}$/;
const SCENE = /^[A-Za-z0-9_-]{16,64}$/;
const TICKET = /^[\x21-\x7e]{1,512}$/;  // printable ASCII; WeChat tickets are base64
const QR_IMAGE = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=';
const POOL_BATCH = 500, POOL_BODY = 512 * 1024;
const TICKET_MAX_SECONDS = 2592000 + 86400;   // WeChat's 30-day maximum, plus clock slack
const ASSIGN_MARGIN = 900;    // a ticket handed to a login has at least 15 minutes left (the login lasts 10)
const AVAILABLE_MARGIN = 600; // what /pool counts as available
const EXPIRING_SOON = 86400;  // what /pool reports as expiringSoon: available now, gone within a day
const encoder = new TextEncoder(), decoder = new TextDecoder('utf-8', { fatal: true });

// ---- helpers ----
function randomCode() {
  const box = new Uint32Array(1);
  // Rejection sampling keeps the 1,000,000 codes uniform (4,294,000,000 is a multiple of 10^6).
  do crypto.getRandomValues(box); while (box[0] >= 4294000000);
  return String(box[0] % 1000000).padStart(6, '0');
}
async function sha1Hex(value) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-1', encoder.encode(value)));
  return Array.from(digest, b => b.toString(16).padStart(2, '0')).join('');
}
// WeChat signs the lexicographically sorted parts concatenated without a separator.
const signParts = parts => sha1Hex([...parts].sort().join(''));
const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) { out.set(p, offset); offset += p.length; }
  return out;
};
const fromBase64 = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
const toBase64 = bytes => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const cdata = value => '<![CDATA[' + String(value).replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';
const decodeEntities = value => value.replace(/&(lt|gt|quot|apos|amp);/g, (_, e) => ({ lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' })[e]);

// The push XML is flat (<xml><Tag>value</Tag>...</xml>); a regex reader avoids any DTD/entity processing.
export function xmlField(xml, tag) {
  const match = new RegExp(`<${tag}>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))\\s*</${tag}>`).exec(xml);
  if (!match) return '';
  return match[1] !== undefined ? match[1] : decodeEntities(match[2]).trim();
}
function parseMessage(xml) {
  const fields = {};
  for (const tag of ['ToUserName', 'FromUserName', 'CreateTime', 'MsgType', 'Content', 'Event', 'EventKey', 'Ticket', 'MsgId', 'Encrypt']) fields[tag] = xmlField(xml, tag);
  return fields;
}

async function readText(request, maximum) {
  const declared = request.headers.get('content-length');
  if (declared && Number(declared) > maximum) throw new RangeError('body_too_large');
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maximum) { await reader.cancel(); throw new RangeError('body_too_large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return decoder.decode(concat(...chunks));
}

// ---- message encryption (安全模式 / 兼容模式) ----
async function aesKey(env) {
  const raw = env.WECHAT_AES_KEY;
  if (typeof raw !== 'string' || !/^[A-Za-z0-9+/]{43}$/.test(raw)) throw new Error('wechat_aes_key_missing');
  const bytes = fromBase64(raw + '=');
  if (bytes.length !== 32) throw new Error('wechat_aes_key_invalid');
  return { key: await crypto.subtle.importKey('raw', bytes, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']), iv: bytes.slice(0, 16) };
}
// WebCrypto only strips 16-byte PKCS#7 padding and rejects WeChat's 32-byte-block padding (values 17-32), so one
// extra block that decrypts to a full block of 0x10 is appended; WebCrypto removes it, and WeChat's padding is
// removed here. The extra block is AES(0x10*16 XOR lastBlock): the first block of a CBC encryption with that IV.
export async function decryptMessage(env, encrypted) {
  const { key, iv } = await aesKey(env);
  const data = fromBase64(encrypted);
  if (data.length < 32 || data.length % 16) throw new Error('wechat_cipher_length');
  const extra = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-CBC', iv: data.slice(-16) }, key, new Uint8Array(16).fill(16))).slice(0, 16);
  const plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, concat(data, extra)));
  const pad = plain[plain.length - 1];
  if (pad < 1 || pad > 32 || pad > plain.length) throw new Error('wechat_padding');
  const body = plain.slice(16, plain.length - pad);  // 16 random bytes, then length, XML, appid
  if (body.length < 4) throw new Error('wechat_plain_length');
  const length = new DataView(body.buffer, body.byteOffset, 4).getUint32(0);
  if (length > body.length - 4) throw new Error('wechat_plain_length');
  return { xml: decoder.decode(body.slice(4, 4 + length)), appId: decoder.decode(body.slice(4 + length)) };
}
export async function encryptMessage(env, xml, appId) {
  const { key, iv } = await aesKey(env);
  const message = encoder.encode(xml), length = new Uint8Array(4);
  new DataView(length.buffer).setUint32(0, message.length);
  const body = concat(crypto.getRandomValues(new Uint8Array(16)), length, message, encoder.encode(appId));
  const pad = 32 - body.length % 32;
  const padded = concat(body, new Uint8Array(pad).fill(pad));
  // The input is block-aligned, so WebCrypto appends one whole padding block; drop it.
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, padded)).slice(0, padded.length);
  return toBase64(cipher);
}

// ---- WeChat → Worker ----
function plain(status, body, type = 'text/plain; charset=utf-8') {
  return new Response(body, { status, headers: { 'content-type': type, 'cache-control': 'no-store' } });
}
function replyXML(message, content) {
  return `<xml><ToUserName>${cdata(message.FromUserName)}</ToUserName><FromUserName>${cdata(message.ToUserName)}</FromUserName>` +
    `<CreateTime>${now()}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content>${cdata(content)}</Content></xml>`;
}

async function confirmCode(env, openid, code) {
  const time = now();
  const blocked = await env.DB.prepare('SELECT failures FROM cnr_account_wechat_attempts WHERE openid = ?1 AND window_start > ?2')
    .bind(openid, time - FAILURE_WINDOW).first();
  if (blocked && blocked.failures >= MAX_FAILURES) return 'throttled';
  // A retried push (no reply within 5 s) finds its own confirmation and gets the same answer.
  const confirmed = await env.DB.prepare(`UPDATE cnr_account_wechat_logins SET openid = ?1, confirmed_at = ?2
    WHERE code = ?3 AND expires_at > ?2 AND (confirmed_at IS NULL OR openid = ?1) RETURNING code`).bind(openid, time, code).first();
  if (confirmed) return 'confirmed';
  await env.DB.prepare(`INSERT INTO cnr_account_wechat_attempts (openid, window_start, failures) VALUES (?1, ?2, 1)
    ON CONFLICT(openid) DO UPDATE SET failures = CASE WHEN window_start <= ?3 THEN 1 ELSE failures + 1 END,
    window_start = CASE WHEN window_start <= ?3 THEN ?2 ELSE window_start END`).bind(openid, time, time - FAILURE_WINDOW).run();
  return 'invalid';
}

// A scan of a pooled ticket confirms the login the ticket is assigned to. A retried push (or a second scan by the same
// reader) finds its own confirmation; anyone else scanning the same code gets 'invalid'. No attempt counting: scenes
// are long random strings and only WeChat's signed pushes can carry one.
async function confirmScene(env, openid, scene) {
  const time = now();
  const confirmed = await env.DB.prepare(`UPDATE cnr_account_wechat_logins SET openid = ?1, confirmed_at = ?2
    WHERE code = (SELECT login_code FROM cnr_account_wechat_qr WHERE scene = ?3 AND expires_at > ?2 AND login_code IS NOT NULL)
    AND expires_at > ?2 AND (confirmed_at IS NULL OR openid = ?1) RETURNING code`).bind(openid, time, scene).first();
  return confirmed ? 'confirmed' : 'invalid';
}

const welcome = env => text(env,
  `Welcome to ${siteName(env)}! You can sign in on ${siteOrigin(env)} with WeChat: choose WeChat in the sign-in window.`,
  `欢迎关注${siteName(env)}！在 ${siteOrigin(env)} 登录时选择「微信登录」即可用微信登录。`);
const expiredQR = env => text(env, 'This QR code has expired. Please refresh the web page to get a new one.', '二维码已过期，请刷新网页后重新扫码。');

async function answerScan(env, message, scene, subscribed) {
  let outcome = 'invalid';
  if (SCENE.test(scene) && OPENID.test(message.FromUserName)) {
    try { outcome = await confirmScene(env, message.FromUserName, scene); } catch (_) {
      return text(env, 'Sign-in is temporarily unavailable. Please try again shortly.', '登录服务暂时不可用，请稍后再试。');
    }
  }
  if (outcome === 'confirmed') return subscribed
    ? text(env, `Thanks for following ${siteName(env)}! You are now signed in on the web page.\nWe publish programming tutorials at ${siteOrigin(env)}.`,
      `关注成功，网页已登录。\n欢迎来到${siteName(env)}，更多编程教程请访问 ${siteOrigin(env)}`)
    : text(env, 'Signed in! Go back to the web page to continue.', '登录成功！回到网页即可继续。');
  return subscribed ? welcome(env) + '\n' + expiredQR(env) : expiredQR(env);
}

async function answer(env, message) {
  const type = message.MsgType.toLowerCase();
  if (type === 'event') {
    const event = message.Event.toLowerCase(), key = message.EventKey;
    // A non-follower scanning a parametric QR follows first: subscribe with EventKey qrscene_<scene>. A follower
    // gets SCAN with EventKey <scene>. A plain follow (static QR, search) has no EventKey.
    if (event === 'subscribe' && key.startsWith('qrscene_')) return answerScan(env, message, key.slice('qrscene_'.length), true);
    if (event === 'scan' && key) return answerScan(env, message, key, false);
    if (event === 'subscribe') return welcome(env);
    return null;
  }
  if (type !== 'text') return null;
  const content = message.Content.trim();
  if (!CODE.test(content)) return text(env,
    `To sign in, send the 6-digit code shown on ${siteOrigin(env)}.`,
    `登录请发送网页上显示的 6 位验证码。网站：${siteOrigin(env)}`);
  if (!OPENID.test(message.FromUserName)) return null;
  let outcome;
  try { outcome = await confirmCode(env, message.FromUserName, content); } catch (_) {
    return text(env, 'Sign-in is temporarily unavailable. Please try again shortly.', '登录服务暂时不可用，请稍后再试。');
  }
  if (outcome === 'confirmed') return text(env, 'Signed in! Go back to the web page to continue.', '登录成功！回到网页即可继续。');
  if (outcome === 'throttled') return text(env, 'Too many wrong codes. Please try again in an hour.', '错误次数过多，请一小时后再试。');
  return text(env, 'This code is invalid or has expired. Please get a new one on the web page.', '验证码无效或已过期，请在网页上重新获取。');
}

export async function handleWechatEvents(request, env) {
  const url = new URL(request.url), q = url.searchParams;
  const token = env.WECHAT_TOKEN.trim();
  const timestamp = q.get('timestamp') || '', nonce = q.get('nonce') || '';
  if (!/^\d{1,12}$/.test(timestamp) || !nonce || nonce.length > 64) return plain(403, 'forbidden');
  if (!sameToken(q.get('signature') || '', await signParts([token, timestamp, nonce]))) return plain(403, 'forbidden');
  if (Math.abs(now() - Number(timestamp)) > MAX_SKEW) return plain(403, 'stale');
  if (request.method === 'GET') return plain(200, q.get('echostr') || '');  // 服务器配置 URL verification

  let xml;
  try { xml = await readText(request, 65536); } catch (_) { return plain(400, 'bad request'); }
  if (/<!(?:DOCTYPE|ENTITY)/i.test(xml)) return plain(400, 'bad request');
  let message = parseMessage(xml), appId = null;
  const encrypted = q.get('encrypt_type') === 'aes';
  if (encrypted) {
    if (!message.Encrypt || !sameToken(q.get('msg_signature') || '', await signParts([token, timestamp, nonce, message.Encrypt]))) return plain(403, 'forbidden');
    let inner;
    try { inner = await decryptMessage(env, message.Encrypt); } catch (_) { return plain(400, 'bad request'); }
    if (env.WECHAT_APP_ID && inner.appId !== env.WECHAT_APP_ID) return plain(403, 'forbidden');
    appId = inner.appId;
    message = parseMessage(inner.xml);
  }
  const content = await answer(env, message);
  // "success" (unencrypted even in safe mode) tells WeChat there is nothing to say and stops its retries.
  if (content === null || !message.FromUserName || !message.ToUserName) return plain(200, 'success');
  const reply = replyXML(message, content);
  if (!encrypted) return plain(200, reply, 'application/xml; charset=utf-8');
  const Encrypt = await encryptMessage(env, reply, env.WECHAT_APP_ID || appId);
  const TimeStamp = String(now()), Nonce = String(randomCode()) + randomCode();
  const MsgSignature = await signParts([token, TimeStamp, Nonce, Encrypt]);
  return plain(200, `<xml><Encrypt>${cdata(Encrypt)}</Encrypt><MsgSignature>${cdata(MsgSignature)}</MsgSignature>` +
    `<TimeStamp>${TimeStamp}</TimeStamp><Nonce>${cdata(Nonce)}</Nonce></xml>`, 'application/xml; charset=utf-8');
}

// ---- browser → Worker ----
// Hands the new pending login one free ticket (the one expiring soonest with at least 15 minutes left). Concurrent
// starts can pick the same row; `login_code IS NULL` lets only one win, and the loser tries the next one. Any failure
// (empty pool, table not migrated yet) falls back to the chat-code flow.
async function assignTicket(env, code, time) {
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const row = await env.DB.prepare(`UPDATE cnr_account_wechat_qr SET login_code = ?1, assigned_at = ?2
        WHERE scene = (SELECT scene FROM cnr_account_wechat_qr WHERE assigned_at IS NULL AND expires_at > ?3 ORDER BY expires_at LIMIT 1)
        AND login_code IS NULL RETURNING scene, ticket`).bind(code, time, time + ASSIGN_MARGIN).first();
      if (row) return row.ticket;
      const free = await env.DB.prepare('SELECT 1 AS ok FROM cnr_account_wechat_qr WHERE assigned_at IS NULL AND expires_at > ?1 LIMIT 1').bind(time + ASSIGN_MARGIN).first();
      if (!free) return null;
    }
  } catch (_) { /* fall back to the code flow */ }
  return null;
}
// Removes expired tickets and assigned ones whose login is gone. The foreign key cascade already does the latter when
// a login row is deleted; this also covers rows left by a database without foreign key enforcement.
async function sweepTickets(env, time) {
  try {
    await env.DB.prepare(`DELETE FROM cnr_account_wechat_qr WHERE expires_at <= ?1 OR (login_code IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM cnr_account_wechat_logins WHERE code = cnr_account_wechat_qr.login_code))`).bind(time).run();
  } catch (_) { /* table not migrated yet */ }
}

export async function startWechatLogin(request, env) {
  const time = now(), binding = randomToken(), bindingHash = await hash(binding);
  const login = await session(request, env.DB);
  const previous = readCookie(request, WX_COOKIE);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM cnr_account_wechat_logins WHERE expires_at <= ?1').bind(time),
    // A browser has one pending login at a time: starting again drops its previous code.
    env.DB.prepare('DELETE FROM cnr_account_wechat_logins WHERE binding_hash = ?1').bind(previous ? await hash(previous) : ''),
  ]);
  await sweepTickets(env, time);
  const pending = await env.DB.prepare('SELECT COUNT(*) AS n FROM cnr_account_wechat_logins WHERE expires_at > ?1').bind(time).first();
  if (pending && pending.n >= MAX_PENDING) return response(503, { error: 'wechat_busy' });
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randomCode();
    // Unique among stored rows (expired ones were just removed); a collision retries with another code.
    const inserted = await env.DB.prepare(`INSERT INTO cnr_account_wechat_logins (code, binding_hash, user_id, session_hash, created_at, expires_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT(code) DO NOTHING RETURNING code`)
      .bind(code, bindingHash, login ? login.user.id : null, login ? login.tokenHash : null, time, time + LOGIN_SECONDS).first();
    if (!inserted) continue;
    const ticket = await assignTicket(env, code, time);
    return response(200, { code, expiresAt: (time + LOGIN_SECONDS) * 1000, ...(ticket ? { mode: 'scan', qr: QR_IMAGE + encodeURIComponent(ticket) } : { mode: 'code' }) },
      [cookie(WX_COOKIE, binding, LOGIN_SECONDS)]);
  }
  return response(503, { error: 'wechat_busy' });
}

export async function wechatLoginStatus(request, env) {
  const code = new URL(request.url).searchParams.get('code') || '';
  const binding = readCookie(request, WX_COOKIE);
  if (!CODE.test(code)) return response(400, { error: 'invalid_request' });
  if (!binding) return response(403, { error: 'forbidden' });
  const bindingHash = await hash(binding), time = now();
  const row = await env.DB.prepare('SELECT binding_hash, confirmed_at, expires_at FROM cnr_account_wechat_logins WHERE code = ?1').bind(code).first();
  if (!row) return response(404, { error: 'not_found' });
  if (!sameToken(row.binding_hash, bindingHash)) return response(403, { error: 'forbidden' });
  const clear = cookie(WX_COOKIE, '', 0);
  if (row.expires_at <= time) {
    await env.DB.prepare('DELETE FROM cnr_account_wechat_logins WHERE code = ?1 AND binding_hash = ?2').bind(code, bindingHash).run();
    return response(200, { status: 'expired' }, [clear]);
  }
  if (!row.confirmed_at) return response(200, { status: 'pending' });
  // Consumed exactly once: concurrent polls race on this DELETE and only one gets the row back.
  const done = await env.DB.prepare(`DELETE FROM cnr_account_wechat_logins WHERE code = ?1 AND binding_hash = ?2
    AND confirmed_at IS NOT NULL AND expires_at > ?3 RETURNING user_id, session_hash, openid`).bind(code, bindingHash, time).first();
  if (!done || !OPENID.test(done.openid || '')) return response(404, { error: 'not_found' }, [clear]);
  const p = PROVIDERS.wechat, identity = { subject: done.openid, name: text(env, 'WeChat reader', '微信用户'), email: null, emailVerified: false, login: null };
  const owner = await providerIdentity(p, env.DB, done.openid);
  if (!done.user_id) {
    const sessionCookie = await signInIdentity(p, request, env, identity, owner, time);
    return sessionCookie ? response(200, { status: 'done' }, [clear, sessionCookie]) : response(401, { error: 'authentication_required' }, [clear]);
  }
  const current = await session(request, env.DB);
  if (!current || current.user.id !== done.user_id || current.tokenHash !== done.session_hash) return response(401, { error: 'authentication_required' }, [clear]);
  if (owner && owner.id !== done.user_id) return response(200, { status: 'conflict' }, [clear]);
  if (!owner) {
    const own = await env.DB.prepare(`SELECT ${p.column} AS subject FROM ${p.identities} WHERE user_id = ?1`).bind(done.user_id).first();
    if (own) return response(200, { status: 'conflict' }, [clear]);  // a different WeChat account is already linked
    const added = await env.DB.prepare(`INSERT INTO ${p.identities} (${p.column}, user_id, linked_at)
      SELECT ?1, user_id, ?2 FROM cnr_account_sessions WHERE token_hash = ?3 AND user_id = ?4 AND expires_at > ?2
      ON CONFLICT DO NOTHING RETURNING user_id`).bind(done.openid, time, done.session_hash, done.user_id).first();
    if (!added) return response(200, { status: 'conflict' }, [clear]);
  }
  await saveProfile(p, env.DB, identity, time);
  return response(200, { status: 'linked' }, [clear]);
}


// ---- ticket generator → Worker ----
// tools/wechat_qr_pool.py authenticates with `Authorization: Bearer <WECHAT_POOL_SECRET>`. Hashing both sides first
// makes the comparison constant-time and length-independent.
async function poolAuthorized(request, env) {
  const header = request.headers.get('authorization') || '';
  const match = /^Bearer ([\x21-\x7e]{1,512})$/.exec(header);
  if (!match) return false;
  return sameToken(await hash(match[1]), await hash(env.WECHAT_POOL_SECRET.trim()));
}
async function poolCounts(env, time) {
  const row = await env.DB.prepare(`SELECT COUNT(*) AS available, COALESCE(SUM(expires_at <= ?2), 0) AS expiringSoon
    FROM cnr_account_wechat_qr WHERE assigned_at IS NULL AND expires_at > ?1`).bind(time + AVAILABLE_MARGIN, time + AVAILABLE_MARGIN + EXPIRING_SOON).first();
  return { available: row?.available || 0, expiringSoon: row?.expiringSoon || 0 };
}
export const wechatPoolConfigured = env => typeof env.WECHAT_POOL_SECRET === 'string' && !!env.WECHAT_POOL_SECRET.trim() && !!env.DB;

export async function handleWechatPool(request, env) {
  if (!(await poolAuthorized(request, env))) return response(401, { error: 'unauthorized' });
  const time = now();
  if (request.method === 'GET') return response(200, await poolCounts(env, time));
  let body;
  try { body = await limitedJSON(request, POOL_BODY); } catch (error) {
    return response(error instanceof RangeError ? 413 : 400, { error: error instanceof RangeError ? 'body_too_large' : 'invalid_request' });
  }
  const tickets = body?.tickets;
  if (!Array.isArray(tickets) || tickets.length > POOL_BATCH) return response(400, { error: 'invalid_request' });
  for (const [index, t] of tickets.entries()) {
    if (!t || typeof t.scene !== 'string' || !SCENE.test(t.scene) || typeof t.ticket !== 'string' || !TICKET.test(t.ticket) ||
      !Number.isSafeInteger(t.expiresAt) || t.expiresAt <= time || t.expiresAt > time + TICKET_MAX_SECONDS) {
      return response(400, { error: 'invalid_ticket', index });
    }
  }
  const statements = tickets.map(t => env.DB.prepare(`INSERT OR IGNORE INTO cnr_account_wechat_qr (scene, ticket, created_at, expires_at)
    VALUES (?1, ?2, ?3, ?4)`).bind(t.scene, t.ticket, time, t.expiresAt));
  // Expired rows are useless whether or not they were ever assigned (an assigned ticket always outlives its login).
  statements.push(env.DB.prepare('DELETE FROM cnr_account_wechat_qr WHERE expires_at <= ?1').bind(time));
  const results = await env.DB.batch(statements);
  const inserted = results.slice(0, tickets.length).reduce((n, r) => n + (r.meta?.changes || 0), 0);
  const { available } = await poolCounts(env, time);
  return response(200, { ok: true, inserted, available });
}
