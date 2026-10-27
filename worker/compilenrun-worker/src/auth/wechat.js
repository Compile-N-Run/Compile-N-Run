// WeChat Official Account (公众号) sign-in through message push. The Worker makes no API calls (Workers have no
// fixed egress IP for the API whitelist). Default (mode 'scan'): `start` assigns the pending login a temporary
// parametric QR ticket from a pool that tools/wechat_qr_pool.py (on a whitelisted server) uploads to /pool; the
// reader scans it, WeChat pushes subscribe (EventKey qrscene_<scene>) or SCAN (EventKey <scene>) with the reader's
// openid, and that confirms the login. Fallback (mode 'code', pool empty): the page shows the account's static QR
// and a 6-digit code, and the reader sends the code as a message. Either way the browser that started the login
// (binding cookie) polls /status to consume the confirmed row once. Protocol reference: 公众号「消息管理 / 接收普通消息 /
// 接收事件推送 / 被动回复用户消息」, 「账号管理 / 生成带参数的二维码」 and the message encryption guide (WXBizMsgCrypt:
// AES-256-CBC, PKCS#7 with a 32-byte block).
import { siteName, siteOrigin, siteIsChinese, text } from '../lib/http.js';
import { limitedJSON } from '../lib/body.js';
import { PROVIDERS, response, cookie, readCookie, hash, randomToken, session, sameToken, now, providerIdentity, signInIdentity, saveProfile } from './core.js';

export const WECHAT_START = '/api/auth/wechat/start';
export const WECHAT_EVENTS = '/api/auth/wechat/events';
export const WECHAT_STATUS = '/api/auth/wechat/status';
export const WECHAT_POOL = '/api/auth/wechat/pool';
// 网页授权 (snsapi_userinfo), opened from a link in the account's reply: the only way to learn the reader's nickname
// and avatar, since message push carries just the openid and cgi-bin/user/info no longer returns them.
export const WECHAT_PROFILE = '/api/auth/wechat/profile';
export const WECHAT_PROFILE_START = '/api/auth/wechat/profile/start';
export const WECHAT_PROFILE_CALLBACK = '/api/auth/wechat/profile/callback';
export const WECHAT_PROFILE_PATHS = new Set([WECHAT_PROFILE, WECHAT_PROFILE_START, WECHAT_PROFILE_CALLBACK]);
export const WECHAT_ROUTES = { [WECHAT_START]: 'POST', [WECHAT_EVENTS]: 'GET,POST', [WECHAT_STATUS]: 'GET', [WECHAT_POOL]: 'GET,POST',
  [WECHAT_PROFILE]: 'GET', [WECHAT_PROFILE_START]: 'GET', [WECHAT_PROFILE_CALLBACK]: 'GET' };
const WX_COOKIE = '__Host-cnr_wx';
const WXP_COOKIE = '__Host-cnr_wxp';
const PROFILE_SECONDS = 600;
const PARKED_SECONDS = 60;    // a ticket detached from a browser's previous login waits this long for the new one
const AVATAR_URL = /^https?:\/\/(?:[a-z0-9-]+\.)*(?:qlogo\.cn|qpic\.cn)\/[\x21-\x7e]*$/i;
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
// Text replies may carry <a href> links; this one opens the 网页授权 page inside WeChat.
export const wechatProfileConfigured = env => typeof env.WECHAT_APP_SECRET === 'string' && !!env.WECHAT_APP_SECRET.trim() &&
  typeof env.WECHAT_APP_ID === 'string' && /^wx[0-9a-z]{10,}$/i.test(env.WECHAT_APP_ID);
const profileLink = env => wechatProfileConfigured(env)
  ? '\n' + text(env, `<a href="${siteOrigin(env) + WECHAT_PROFILE}">Show my WeChat name and photo on the site</a>`,
    `<a href="${siteOrigin(env) + WECHAT_PROFILE}">点此同步微信昵称和头像到网站</a>`)
  : '';
const signedIn = env => text(env, 'Signed in! Go back to the web page to continue.', '登录成功！回到网页即可继续。') + profileLink(env);

async function answerScan(env, message, scene, subscribed) {
  let outcome = 'invalid';
  if (SCENE.test(scene) && OPENID.test(message.FromUserName)) {
    try { outcome = await confirmScene(env, message.FromUserName, scene); } catch (_) {
      return text(env, 'Sign-in is temporarily unavailable. Please try again shortly.', '登录服务暂时不可用，请稍后再试。');
    }
  }
  if (outcome === 'confirmed') return subscribed
    ? text(env, `Thanks for following ${siteName(env)}! You are now signed in on the web page.\nWe publish programming tutorials at ${siteOrigin(env)}.`,
      `关注成功，网页已登录。\n欢迎来到${siteName(env)}，更多编程教程请访问 ${siteOrigin(env)}`) + profileLink(env)
    : signedIn(env);
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
    `To sign in, scan the QR code shown on ${siteOrigin(env)} (or send its 6-digit code here).`,
    `登录请扫描 ${siteOrigin(env)} 登录窗口中的二维码（或在此发送网页显示的 6 位验证码）。`) + profileLink(env);
  if (!OPENID.test(message.FromUserName)) return null;
  let outcome;
  try { outcome = await confirmCode(env, message.FromUserName, content); } catch (_) {
    return text(env, 'Sign-in is temporarily unavailable. Please try again shortly.', '登录服务暂时不可用，请稍后再试。');
  }
  if (outcome === 'confirmed') return signedIn(env);
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
// A browser that starts again (another tab, or the page renewing an expired QR) keeps the ticket of its previous
// unscanned login: a QR still visible in an older tab then stays valid for this same browser, and the pool is not
// charged twice. The row is parked (assigned_at set, login_code NULL) so no concurrent start can take it before
// the new login re-attaches it; the deletion of the old login then cascades nowhere.
async function detachTicket(env, previousHash, time) {
  if (!previousHash) return null;
  try {
    return await env.DB.prepare(`UPDATE cnr_account_wechat_qr SET login_code = NULL, assigned_at = ?1
      WHERE login_code IN (SELECT code FROM cnr_account_wechat_logins WHERE binding_hash = ?2 AND confirmed_at IS NULL)
      AND expires_at > ?3 RETURNING scene`).bind(time, previousHash, time + ASSIGN_MARGIN).first();
  } catch (_) { return null; }
}
async function reattachTicket(env, scene, code, time) {
  try {
    const row = await env.DB.prepare(`UPDATE cnr_account_wechat_qr SET login_code = ?1, assigned_at = ?2
      WHERE scene = ?3 AND login_code IS NULL RETURNING ticket`).bind(code, time, scene).first();
    return row ? row.ticket : null;
  } catch (_) { return null; }
}
// Removes expired tickets, parked ones that were never re-attached, and assigned ones whose login is gone (the
// foreign key cascade already covers that when a login row is deleted; this also covers rows left by a database
// without foreign key enforcement). Runs from /api/auth/wechat/pool (the generator's 20-minute visit), not from
// `start`: a single OR-ed DELETE scanned the whole 2000-row pool on every login dialog open, which alone cost
// >4M D1 row reads a day. Each statement here walks an index (v8 schema) and touches only the rows it removes.
async function sweepTickets(env, time) {
  try {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM cnr_account_wechat_qr WHERE expires_at <= ?1').bind(time),
      env.DB.prepare(`DELETE FROM cnr_account_wechat_qr WHERE assigned_at IS NOT NULL AND assigned_at <= ?1 AND (login_code IS NULL
        OR NOT EXISTS (SELECT 1 FROM cnr_account_wechat_logins WHERE code = cnr_account_wechat_qr.login_code))`).bind(time - PARKED_SECONDS),
    ]);
  } catch (_) { /* table not migrated yet */ }
}

export async function startWechatLogin(request, env) {
  const time = now(), binding = randomToken(), bindingHash = await hash(binding);
  const login = await session(request, env.DB);
  const previous = readCookie(request, WX_COOKIE);
  const previousHash = previous ? await hash(previous) : '';
  const kept = await detachTicket(env, previousHash, time);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM cnr_account_wechat_logins WHERE expires_at <= ?1').bind(time),
    // A browser has one pending login at a time: starting again drops its previous code.
    env.DB.prepare('DELETE FROM cnr_account_wechat_logins WHERE binding_hash = ?1').bind(previousHash),
  ]);
  const pending = await env.DB.prepare('SELECT COUNT(*) AS n FROM cnr_account_wechat_logins WHERE expires_at > ?1').bind(time).first();
  if (pending && pending.n >= MAX_PENDING) return response(503, { error: 'wechat_busy' });
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randomCode();
    // Unique among stored rows (expired ones were just removed); a collision retries with another code.
    const inserted = await env.DB.prepare(`INSERT INTO cnr_account_wechat_logins (code, binding_hash, user_id, session_hash, created_at, expires_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT(code) DO NOTHING RETURNING code`)
      .bind(code, bindingHash, login ? login.user.id : null, login ? login.tokenHash : null, time, time + LOGIN_SECONDS).first();
    if (!inserted) continue;
    const ticket = (kept && await reattachTicket(env, kept.scene, code, time)) || await assignTicket(env, code, time);
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
  // Housekeeping happens here, on the generator's visits, so that `start` stays a few indexed row reads.
  await sweepTickets(env, time);
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
  const results = statements.length ? await env.DB.batch(statements) : [];
  const inserted = results.reduce((n, r) => n + (r.meta?.changes || 0), 0);
  const { available } = await poolCounts(env, time);
  return response(200, { ok: true, inserted, available });
}


// ---- 网页授权: nickname and avatar ----
// The reader taps the link in the account's reply; WeChat's in-app browser opens the landing page, the button leads
// to /profile/start, which sends them through open.weixin.qq.com (scope snsapi_userinfo) and back to the callback.
// The callback trades the code for the reader's openid and a 网页授权 access_token (api.weixin.qq.com/sns/*, which
// unlike cgi-bin/token has no IP whitelist), reads sns/userinfo, and stores nickname/avatar for the openid's account.
// Nothing here signs anyone in: the openid must already be linked by a scan or code login.
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function page(env, status, title, body, cookies = []) {
  const headers = new Headers({ 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store, private', 'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer', 'x-robots-tag': 'noindex',
    'content-security-policy': "default-src 'none'; img-src https://*.qlogo.cn https://*.qpic.cn; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'" });
  for (const value of cookies) headers.append('set-cookie', value);
  const html = `<!doctype html><html lang="${siteIsChinese(env) ? 'zh-CN' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<meta name="robots" content="noindex"><title>${escapeHTML(title)} · ${escapeHTML(siteName(env))}</title><style>body{margin:0;font:16px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC","Helvetica Neue",Arial,sans-serif;color:#1f2937;background:#f6f8fa}` +
    `main{max-width:28rem;margin:0 auto;padding:3rem 1.25rem;text-align:center}img{display:block;width:96px;height:96px;margin:0 auto 1rem;border-radius:50%;background:#e5e7eb}` +
    `h1{font-size:1.4rem;margin:0 0 .75rem;word-break:break-word}p{margin:0 0 1.5rem;color:#4b5563}.btn{display:inline-block;padding:.8rem 2rem;border-radius:999px;background:#07c160;color:#fff;text-decoration:none;font-weight:600}` +
    `.site{font-size:.85rem;color:#6b7280}</style></head><body><main>${body}<p class="site">${escapeHTML(siteName(env))} · ${escapeHTML(siteOrigin(env).replace(/^https?:\/\//, ''))}</p></main></body></html>`;
  return new Response(html, { status, headers });
}
const profileTitle = env => text(env, 'WeChat name and photo', '同步微信昵称和头像');
function profileLanding(env) {
  return page(env, 200, profileTitle(env), `<h1>${escapeHTML(profileTitle(env))}</h1><p>${escapeHTML(text(env,
    `Allow WeChat to share your nickname and profile photo, and ${siteName(env)} will show them instead of "WeChat reader".`,
    `授权后，${siteName(env)}将显示你的微信昵称和头像，代替「微信用户」。`))}</p><a class="btn" href="${WECHAT_PROFILE_START}">${escapeHTML(text(env, 'Continue with WeChat', '微信授权'))}</a>`);
}
function profileStart(env) {
  const state = randomToken();
  // WeChat documents this parameter order and the #wechat_redirect fragment.
  const params = new URLSearchParams({ appid: env.WECHAT_APP_ID, redirect_uri: siteOrigin(env) + WECHAT_PROFILE_CALLBACK, response_type: 'code', scope: 'snsapi_userinfo', state });
  const headers = new Headers({ location: 'https://open.weixin.qq.com/connect/oauth2/authorize?' + params + '#wechat_redirect', 'cache-control': 'no-store, private', 'referrer-policy': 'no-referrer' });
  headers.append('set-cookie', cookie(WXP_COOKIE, state, PROFILE_SECONDS));
  return new Response(null, { status: 302, headers });
}
async function wechatJSON(url) {
  const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(10000), headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('wechat_http_' + res.status);
  let body;
  try { body = JSON.parse(await readText(res, 65536)); } catch (_) { throw new Error('wechat_response'); }   // WeChat answers as text/plain
  if (!body || typeof body !== 'object') throw new Error('wechat_response');
  if (body.errcode) throw Object.assign(new Error('wechat_' + body.errcode), { wechat: { code: Number(body.errcode), message: String(body.errmsg || '') } });
  return body;
}
const cleanName = value => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 100).replace(/[\ud800-\udbff]$/, '') : '';
const cleanAvatar = value => typeof value === 'string' && value.length <= 512 && AVATAR_URL.test(value) ? value.replace(/^http:/i, 'https:') : null;
function profileFailure(env, error, cookies) {
  const detail = error?.wechat ? ` (WeChat ${error.wechat.code}: ${error.wechat.message})` : '';
  return page(env, 502, profileTitle(env), `<h1>${escapeHTML(text(env, 'Could not reach WeChat', '微信接口暂时不可用'))}</h1><p>${escapeHTML(text(env,
    'Please open the link in the chat again later.' + detail, '请稍后在公众号对话中重新点击链接。' + detail))}</p>`, cookies);
}
async function profileCallback(request, env) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') || '', code = url.searchParams.get('code') || '';
  const expected = readCookie(request, WXP_COOKIE), clear = [cookie(WXP_COOKIE, '', 0)];
  if (!expected || !sameToken(expected, state) || !/^[A-Za-z0-9_-]{1,512}$/.test(code) || url.searchParams.getAll('code').length !== 1) {
    return page(env, 400, profileTitle(env), `<h1>${escapeHTML(text(env, 'This link has expired', '链接已失效'))}</h1><p>${escapeHTML(text(env,
      'Open the link in the chat again and allow access within 10 minutes.', '请在公众号对话中重新点击链接，并在 10 分钟内完成授权。'))}</p>`, clear);
  }
  let token;
  try {
    token = await wechatJSON('https://api.weixin.qq.com/sns/oauth2/access_token?' + new URLSearchParams({ appid: env.WECHAT_APP_ID, secret: env.WECHAT_APP_SECRET.trim(), code, grant_type: 'authorization_code' }));
  } catch (error) { return profileFailure(env, error, clear); }
  const openid = typeof token.openid === 'string' ? token.openid : '';
  if (!OPENID.test(openid) || typeof token.access_token !== 'string' || !token.access_token) return profileFailure(env, new Error('wechat_token'), clear);
  const linked = await env.DB.prepare('SELECT user_id FROM cnr_account_wechat_identities WHERE wechat_openid = ?1').bind(openid).first();
  if (!linked) {
    return page(env, 200, profileTitle(env), `<h1>${escapeHTML(text(env, 'Sign in first', '请先登录网站'))}</h1><p>${escapeHTML(text(env,
      `Sign in on ${siteOrigin(env)} with WeChat first, then open this link again.`, `请先在 ${siteOrigin(env)} 用微信扫码登录，再回到公众号点击此链接。`))}</p>`, clear);
  }
  let info;
  try { info = await wechatJSON('https://api.weixin.qq.com/sns/userinfo?' + new URLSearchParams({ access_token: token.access_token, openid, lang: 'zh_CN' })); } catch (error) { return profileFailure(env, error, clear); }
  const nickname = cleanName(info.nickname), avatar = cleanAvatar(info.headimgurl);
  const unionid = typeof info.unionid === 'string' && OPENID.test(info.unionid) ? info.unionid : null;
  const time = now();
  const statements = [env.DB.prepare(`INSERT INTO cnr_account_wechat_userinfo (wechat_openid, nickname, avatar_url, unionid, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)
    ON CONFLICT(wechat_openid) DO UPDATE SET nickname = excluded.nickname, avatar_url = excluded.avatar_url, unionid = excluded.unionid, updated_at = excluded.updated_at`)
    .bind(openid, nickname || null, avatar, unionid, time)];
  // The reader asked for this explicitly, so the nickname replaces whatever the account was called.
  if (nickname) statements.push(env.DB.prepare('UPDATE cnr_account_users SET display_name = ?1, updated_at = ?2 WHERE id = ?3').bind(nickname, time, linked.user_id));
  await env.DB.batch(statements);
  return page(env, 200, profileTitle(env), `${avatar ? `<img src="${escapeHTML(avatar)}" alt="" width="96" height="96">` : ''}<h1>${escapeHTML(nickname || text(env, 'WeChat reader', '微信用户'))}</h1><p>${escapeHTML(text(env,
    `Your WeChat name and photo now show on ${siteName(env)}. Reload the page on your other device to see them.`,
    `已同步到${siteName(env)}账户。回到网页刷新即可看到你的昵称和头像。`))}</p>`, clear);
}
export async function handleWechatProfile(request, env) {
  const { pathname } = new URL(request.url);
  if (pathname === WECHAT_PROFILE) return profileLanding(env);
  if (pathname === WECHAT_PROFILE_START) return profileStart(env);
  return profileCallback(request, env);
}
