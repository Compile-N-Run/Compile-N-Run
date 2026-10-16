// Google identity is verified through Google's authenticated UserInfo endpoint.
// Provider tokens never reach the browser or persist in D1. No ID token is trusted.
import { EMAIL_ROUTES, PUBLIC_EMAIL_ROUTES, emailConfigured, handleEmailAccount } from './email-accounts.js';
export const ACCOUNT_SITE = 'https://www.compilenrun.com';
export const OAUTH_CALLBACK = '/auth/google_oauth2/callback';
export const SNAPSHOT_MAX_BYTES = 1_800_000;
const SESSION_COOKIE = '__Host-cnr_session';
const OAUTH_COOKIE = '__Host-cnr_oauth';
const SESSION_SECONDS = 30 * 86400;
const CHALLENGE_SECONDS = 600;
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const ROUTES = new Set(['/api/auth/session', '/api/auth/google', '/api/auth/google/link', OAUTH_CALLBACK, '/api/auth/logout', '/api/auth/account', '/api/learning', ...Object.keys(EMAIL_ROUTES)]);
const encoder = new TextEncoder();
const now = () => Math.floor(Date.now() / 1000);

function response(status, body, cookies = []) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store, private',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'cross-origin-resource-policy': 'same-origin',
  });
  for (const value of cookies) headers.append('set-cookie', value);
  return new Response(JSON.stringify(body), { status, headers });
}

function cookie(name, value, seconds) {
  return `${name}=${value}; Path=/; Max-Age=${seconds}; HttpOnly; Secure; SameSite=Lax`;
}

function redirect(target, cookies = []) {
  const headers = new Headers({ location: target, 'cache-control': 'no-store, private', 'referrer-policy': 'no-referrer' });
  for (const value of cookies) headers.append('set-cookie', value);
  return new Response(null, { status: 303, headers });
}

function oauthError(linking = false) {
  return redirect(ACCOUNT_SITE + (linking ? '/profile/?auth=error' : '/learn/?auth=error'), [cookie(OAUTH_COOKIE, '', 0)]);
}

function readCookie(request, name) {
  const values = (request.headers.get('cookie') || '').split(';').map(part => part.trim()).filter(part => part.startsWith(name + '='));
  // Reject ambiguous duplicated cookies instead of choosing an attacker-controlled one.
  if (values.length !== 1) return null;
  const value = values[0].slice(name.length + 1);
  return TOKEN_PATTERN.test(value) ? value : null;
}

function base64url(bytes) {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function randomToken() { return base64url(crypto.getRandomValues(new Uint8Array(32))); }
async function hash(value) { return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))); }
function sameToken(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index++) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
}
function googleConfigured(env) {
  return typeof env.GOOGLE_CLIENT_ID === 'string' && !!env.GOOGLE_CLIENT_ID.trim() &&
    typeof env.GOOGLE_CLIENT_SECRET === 'string' && !!env.GOOGLE_CLIENT_SECRET.trim() && !!env.DB && !!env.AUTH_LIMIT;
}
function configured(env) { return googleConfigured(env) || emailConfigured(env); }

async function limitedJSON(message, maximum) {
  const declared = message.headers.get('content-length');
  if (declared && Number(declared) > maximum) throw new RangeError('body_too_large');
  if (!message.body) throw new SyntaxError('invalid_json');
  const reader = message.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maximum) {
        await reader.cancel();
        throw new RangeError('body_too_large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const joined = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(joined));
}

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function validateSnapshot(data) {
  if (!record(data) || data.format !== 'cnr-learning-backup' || data.version !== 1 ||
      typeof data.exportedAt !== 'string' || !Number.isFinite(Date.parse(data.exportedAt)) ||
      !record(data.progress) || data.progress.v !== 1 || !record(data.progress.done) || !record(data.progress.tuts) ||
      !record(data.learning) || data.learning.v !== 1 || !record(data.learning.lessons) ||
      !record(data.playground) || data.playground.version !== 1 || !record(data.playground.drafts)) {
    throw new TypeError('invalid_snapshot');
  }
  const pending = [[data, 0]];
  let count = 0;
  while (pending.length) {
    const [value, depth] = pending.pop();
    if (++count > 150000 || depth > 30) throw new TypeError('snapshot_too_complex');
    if (typeof value === 'string' && value.includes('\0')) throw new TypeError('invalid_snapshot');
    if (typeof value === 'number' && !Number.isFinite(value)) throw new TypeError('invalid_snapshot');
    if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new TypeError('unsafe_snapshot_key');
        pending.push([item, depth + 1]);
      }
    }
  }
  if (Object.keys(data.progress.done).length > 20000 || Object.keys(data.progress.tuts).length > 1000 ||
      Object.keys(data.learning.lessons).length > 5000 || Object.keys(data.playground.drafts).length > 100) {
    throw new TypeError('snapshot_too_complex');
  }
  const encoded = JSON.stringify(data);
  if (encoder.encode(encoded).byteLength > SNAPSHOT_MAX_BYTES) throw new RangeError('snapshot_too_large');
  return encoded;
}

async function session(request, db) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await hash(token);
  // Direct DB calls intentionally use the primary. Do not replace with a
  // first-unconstrained D1 Session: revoked logins must not reappear on replicas.
  const row = await db.prepare(`SELECT u.id, u.display_name, c.email, c.email_verified_at,
    CASE WHEN c.email_verified_at IS NOT NULL THEN 1 ELSE 0 END AS has_password, g.google_sub AS google_identity
    FROM cnr_account_sessions s JOIN cnr_account_users u ON u.id = s.user_id
    LEFT JOIN cnr_account_password_credentials c ON c.user_id = u.id
    LEFT JOIN cnr_account_google_identities g ON g.user_id = u.id
    WHERE s.token_hash = ?1 AND s.expires_at > ?2`).bind(tokenHash, now()).first();
  return row ? { user: { id: row.id, name: row.display_name, email: row.email || null,
    emailVerified: !!row.email_verified_at, hasPassword: !!row.has_password, googleLinked: !!row.google_identity },
    tokenHash, csrfToken: await hash('csrf:' + token) } : null;
}

async function issueSession(request, env, userID, credential = null, googleSub = '') {
  const token = randomToken(), tokenHash = await hash(token), time = now();
  const inserted = await env.DB.prepare(`INSERT INTO cnr_account_sessions (token_hash, user_id, created_at, expires_at)
    SELECT ?1, id, ?2, ?3 FROM cnr_account_users WHERE id = ?4 AND (?5 = 0 OR EXISTS
    (SELECT 1 FROM cnr_account_password_credentials WHERE user_id = ?4 AND version = ?5 AND password_hash = ?6 AND email_verified_at IS NOT NULL))
    AND (?7 = '' OR EXISTS (SELECT 1 FROM cnr_account_google_identities WHERE user_id = ?4 AND google_sub = ?7))
    RETURNING token_hash`).bind(tokenHash, time, time + SESSION_SECONDS, userID, credential?.version || 0, credential?.password_hash || '', googleSub).first();
  if (!inserted) return null;
  const old = readCookie(request, SESSION_COOKIE);
  if (old) await env.DB.prepare('DELETE FROM cnr_account_sessions WHERE token_hash = ?1').bind(await hash(old)).run();
  return cookie(SESSION_COOKIE, token, SESSION_SECONDS);
}

async function beginOAuth(request, env, linking = null) {
  const state = randomToken(), binding = randomToken(), verifier = randomToken();
  const stamp = now();
  const statements = [
    env.DB.prepare('DELETE FROM cnr_account_oauth_challenges WHERE expires_at <= ?1').bind(stamp),
    env.DB.prepare('DELETE FROM cnr_account_sessions WHERE expires_at <= ?1').bind(stamp),
    env.DB.prepare('INSERT INTO cnr_account_oauth_challenges (state_hash, binding_hash, verifier, expires_at) VALUES (?1, ?2, ?3, ?4)')
      .bind(await hash(state), await hash(binding), verifier, stamp + CHALLENGE_SECONDS),
  ];
  if (linking) statements.push(env.DB.prepare(`INSERT INTO cnr_account_oauth_links (state_hash, user_id, session_hash)
    SELECT ?1, user_id, token_hash FROM cnr_account_sessions WHERE token_hash = ?2 AND user_id = ?3 AND expires_at > ?4`)
    .bind(await hash(state), linking.tokenHash, linking.user.id, stamp));
  const result = await env.DB.batch(statements);
  if (linking && result[result.length - 1].meta.changes !== 1) return response(401, { error: 'authentication_required' });
  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID, redirect_uri: ACCOUNT_SITE + OAUTH_CALLBACK,
    response_type: 'code', scope: 'openid email profile', state,
    code_challenge: await hash(verifier), code_challenge_method: 'S256',
    access_type: 'online', include_granted_scopes: 'false', prompt: 'select_account',
  });
  return linking ? response(200, { url: url.href }, [cookie(OAUTH_COOKIE, binding, CHALLENGE_SECONDS)]) : redirect(url.href, [cookie(OAUTH_COOKIE, binding, CHALLENGE_SECONDS)]);
}

async function googleIdentity(db, subject) {
  let identity = await db.prepare('SELECT user_id AS id FROM cnr_account_google_identities WHERE google_sub = ?1').bind(subject).first();
  if (identity) return identity;
  // The old deployed Worker may create a legacy row after the migration's seed
  // and before the new deployment. Catch up that row once, preserving its ID.
  // A per-user marker survives unlink, preventing accidental provider relinking.
  const legacy = await db.prepare(`SELECT id FROM cnr_account_users WHERE google_sub = ?1 AND NOT EXISTS
    (SELECT 1 FROM cnr_account_legacy_google_migrations WHERE user_id = cnr_account_users.id)`).bind(subject).first();
  if (!legacy) return null;
  await db.batch([
    db.prepare(`INSERT OR IGNORE INTO cnr_account_google_identities (google_sub, user_id, linked_at)
      SELECT google_sub, id, ?1 FROM cnr_account_users WHERE id = ?2 AND google_sub = ?3 AND NOT EXISTS
      (SELECT 1 FROM cnr_account_legacy_google_migrations WHERE user_id = ?2)`).bind(now(), legacy.id, subject),
    db.prepare(`INSERT OR IGNORE INTO cnr_account_legacy_google_migrations (user_id)
      SELECT id FROM cnr_account_users WHERE id = ?1 AND EXISTS
      (SELECT 1 FROM cnr_account_google_identities WHERE user_id = ?1 AND google_sub = ?2)`).bind(legacy.id, subject),
  ]);
  identity = await db.prepare('SELECT user_id AS id FROM cnr_account_google_identities WHERE google_sub = ?1').bind(subject).first();
  return identity;
}

// Record what Google reports for this identity. Informational only (never used to
// authenticate or to match password accounts); a failure must not block sign-in.
async function saveGoogleProfile(db, identity, name, stamp) {
  const email = typeof identity.email === 'string' && identity.email.length <= 254 && !/[\u0000-\u001f\u007f\s]/.test(identity.email) && identity.email.includes('@') ? identity.email.toLowerCase() : null;
  try {
    await db.prepare(`INSERT INTO cnr_account_google_profiles (google_sub, email, email_verified, name, updated_at)
      SELECT ?1, ?2, ?3, ?4, ?5 WHERE EXISTS (SELECT 1 FROM cnr_account_google_identities WHERE google_sub = ?1)
      ON CONFLICT(google_sub) DO UPDATE SET email = excluded.email, email_verified = excluded.email_verified, name = excluded.name, updated_at = excluded.updated_at`)
      .bind(identity.sub, email, email && identity.email_verified === true ? 1 : 0, name || null, stamp).run();
  } catch (error) { console.warn('google profile not saved', error?.message); }
}

async function finishOAuth(request, env) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state'), code = url.searchParams.get('code');
  const binding = readCookie(request, OAUTH_COOKIE);
  if (!binding || !TOKEN_PATTERN.test(state || '') || typeof code !== 'string' || !code || code.length > 2048 ||
      url.searchParams.has('error') || url.searchParams.getAll('state').length !== 1 || url.searchParams.getAll('code').length !== 1) return oauthError();
  const stateHash = await hash(state);
  // Read purpose before consuming the parent challenge (FK cascade removes it).
  const linking = await env.DB.prepare('SELECT user_id, session_hash FROM cnr_account_oauth_links WHERE state_hash = ?1').bind(stateHash).first();
  // Atomic consume: simultaneous/replayed callbacks cannot both exchange codes.
  const challenge = await env.DB.prepare(`DELETE FROM cnr_account_oauth_challenges
    WHERE state_hash = ?1 AND binding_hash = ?2 AND expires_at > ?3 RETURNING verifier`)
    .bind(stateHash, await hash(binding), now()).first();
  if (!challenge) return oauthError();
  if (linking) {
    const current = await session(request, env.DB);
    if (!current || current.user.id !== linking.user_id || current.tokenHash !== linking.session_hash) return oauthError(true);
  }
  const exchanged = await fetch(TOKEN_URL, {
    method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(10000),
    headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
      code, grant_type: 'authorization_code', redirect_uri: ACCOUNT_SITE + OAUTH_CALLBACK, code_verifier: challenge.verifier }),
  });
  if (!exchanged.ok) return oauthError();
  const credentials = await limitedJSON(exchanged, 32768);
  if (typeof credentials.access_token !== 'string' || !credentials.access_token || credentials.access_token.length > 8192 ||
      String(credentials.token_type).toLowerCase() !== 'bearer') return oauthError();
  // Only a token obtained above from the fixed Google endpoint is accepted.
  // Do not authenticate from email, client-supplied tokens, or unverified JWTs.
  const identityResponse = await fetch(USERINFO_URL, {
    redirect: 'manual', signal: AbortSignal.timeout(10000),
    headers: { authorization: 'Bearer ' + credentials.access_token, accept: 'application/json' },
  });
  if (!identityResponse.ok) return oauthError();
  const identity = await limitedJSON(identityResponse, 32768);
  if (typeof identity.sub !== 'string' || !/^[A-Za-z0-9_-]{1,255}$/.test(identity.sub)) return oauthError();
  const name = typeof identity.name === 'string' ? identity.name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 100) : '';
  const stamp = now();
  let user = await googleIdentity(env.DB, identity.sub);
  if (linking) {
    if (user && user.id !== linking.user_id) return oauthError(true);
    const ownIdentity = await env.DB.prepare('SELECT google_sub FROM cnr_account_google_identities WHERE user_id = ?1').bind(linking.user_id).first();
    if (ownIdentity && ownIdentity.google_sub !== identity.sub) return oauthError(true);
    const current = await session(request, env.DB);
    if (!current || current.user.id !== linking.user_id || current.tokenHash !== linking.session_hash) return oauthError(true);
    if (!ownIdentity) {
      const added = await env.DB.prepare(`INSERT INTO cnr_account_google_identities (google_sub, user_id, linked_at)
        SELECT ?1, user_id, ?2 FROM cnr_account_sessions WHERE token_hash = ?3 AND user_id = ?4 AND expires_at > ?2 RETURNING user_id`)
        .bind(identity.sub, stamp, linking.session_hash, linking.user_id).first();
      if (!added) return oauthError(true);
    }
    await saveGoogleProfile(env.DB, identity, name, stamp);
    return redirect(ACCOUNT_SITE + '/profile/?auth=linked', [cookie(OAUTH_COOKIE, '', 0)]);
  }
  if (!user) {
    const id = crypto.randomUUID();
    try {
      await env.DB.batch([
        env.DB.prepare('INSERT INTO cnr_account_users (id, google_sub, display_name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)').bind(id, 'local:' + id, name || 'Learner', stamp),
        env.DB.prepare('INSERT INTO cnr_account_google_identities (google_sub, user_id, linked_at) VALUES (?1, ?2, ?3)').bind(identity.sub, id, stamp),
        env.DB.prepare('INSERT INTO cnr_account_learning (user_id, revision) VALUES (?1, 0)').bind(id),
      ]);
      user = { id };
    } catch (error) {
      if (!/UNIQUE constraint/i.test(String(error))) throw error;
      user = await env.DB.prepare('SELECT user_id AS id FROM cnr_account_google_identities WHERE google_sub = ?1').bind(identity.sub).first();
      if (!user) throw error;
    }
  }
  await saveGoogleProfile(env.DB, identity, name, stamp);
  const sessionCookie = await issueSession(request, env, user.id, null, identity.sub);
  return sessionCookie ? redirect(ACCOUNT_SITE + '/learn/', [cookie(OAUTH_COOKIE, '', 0), sessionCookie]) : oauthError();
}

export async function handleAccounts(request, env, ctx) {
  const url = new URL(request.url);
  if (!ROUTES.has(url.pathname)) return url.pathname.startsWith('/api/auth/') ? response(404, { error: 'not_found' }) : null;
  if (url.origin !== ACCOUNT_SITE) return response(403, { error: 'origin_not_allowed' });
  const origin = request.headers.get('origin');
  if (origin && origin !== ACCOUNT_SITE) return response(403, { error: 'origin_not_allowed' });
  const methods = { ...EMAIL_ROUTES, '/api/auth/session': 'GET', '/api/auth/google': 'GET', '/api/auth/google/link': 'POST,DELETE', [OAUTH_CALLBACK]: 'GET',
    '/api/auth/logout': 'POST', '/api/auth/account': 'DELETE', '/api/learning': 'GET,PUT' };
  if (!methods[url.pathname].split(',').includes(request.method)) return response(405, { error: 'method_not_allowed' });
  if (!configured(env)) {
    if (url.pathname === '/api/auth/session') return response(200, { configured: false, providers: { google: false, email: false }, googleConfigured: false, emailConfigured: false, user: null });
    if (url.pathname === OAUTH_CALLBACK || url.pathname === '/api/auth/google') return oauthError();
    return response(503, { error: 'accounts_not_configured' });
  }
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rate = await env.AUTH_LIMIT.limit({ key: await hash(ip) });
    if (!rate.success) return url.pathname === OAUTH_CALLBACK ? oauthError() : response(429, { error: 'rate_limited' });
    if (url.pathname === '/api/auth/google') return googleConfigured(env) ? await beginOAuth(request, env) : oauthError();
    if (url.pathname === OAUTH_CALLBACK) return googleConfigured(env) ? await finishOAuth(request, env) : oauthError();
    const kit = { reply: response, readJSON: limitedJSON, hash, randomToken, issueSession, expiredSessionCookie: () => cookie(SESSION_COOKIE, '', 0) };
    if (PUBLIC_EMAIL_ROUTES.has(url.pathname)) {
      if (origin !== ACCOUNT_SITE) return response(403, { error: 'csrf_failed' });
      return await handleEmailAccount(request, env, ctx, null, kit);
    }
    const login = await session(request, env.DB);
    if (url.pathname === '/api/auth/session') return response(200, { configured: true,
      providers: { google: googleConfigured(env), email: emailConfigured(env) }, googleConfigured: googleConfigured(env), emailConfigured: emailConfigured(env),
      user: login?.user || null, ...(login ? { csrfToken: login.csrfToken } : {}) });
    if (!login) return response(401, { error: 'authentication_required' });
    if (request.headers.get('X-CNR-User') !== login.user.id) return response(409, { error: 'account_changed' });
    if (request.method !== 'GET' && (origin !== ACCOUNT_SITE || !sameToken(request.headers.get('X-CSRF-Token'), login.csrfToken))) {
      return response(403, { error: 'csrf_failed' });
    }
    if (EMAIL_ROUTES[url.pathname]) return await handleEmailAccount(request, env, ctx, login, kit);
    if (url.pathname === '/api/auth/google/link') {
      if (request.method === 'POST') return googleConfigured(env) ? await beginOAuth(request, env, login) : response(503, { error: 'google_not_configured' });
      if (!emailConfigured(env)) return response(409, { error: 'last_login_method' });
      const guard = `EXISTS (SELECT 1 FROM cnr_account_password_credentials WHERE user_id = ?1 AND email_verified_at IS NOT NULL)
        AND EXISTS (SELECT 1 FROM cnr_account_sessions WHERE user_id = ?1 AND token_hash = ?2 AND expires_at > ?3)`;
      const removed = await env.DB.batch([
        // Explicit (not just cascaded) so the identity DELETE below reports exactly one change.
        env.DB.prepare(`DELETE FROM cnr_account_google_profiles WHERE google_sub IN
          (SELECT google_sub FROM cnr_account_google_identities WHERE user_id = ?1) AND ${guard}`).bind(login.user.id, login.tokenHash, now()),
        env.DB.prepare(`DELETE FROM cnr_account_oauth_challenges WHERE state_hash IN
          (SELECT state_hash FROM cnr_account_oauth_links WHERE user_id = ?1) AND ${guard}`).bind(login.user.id, login.tokenHash, now()),
        env.DB.prepare(`DELETE FROM cnr_account_google_identities WHERE user_id = ?1 AND ${guard}`).bind(login.user.id, login.tokenHash, now()),
        env.DB.prepare('DELETE FROM cnr_account_sessions WHERE user_id = ?1 AND changes() = 1').bind(login.user.id),
      ]);
      return removed[2].meta.changes === 1 ? response(200, { ok: true }, [cookie(SESSION_COOKIE, '', 0), cookie(OAUTH_COOKIE, '', 0)]) : response(409, { error: 'last_login_method' });
    }
    if (url.pathname === '/api/auth/logout') {
      await env.DB.prepare('DELETE FROM cnr_account_sessions WHERE token_hash = ?1').bind(login.tokenHash).run();
      return response(200, { ok: true }, [cookie(SESSION_COOKIE, '', 0)]);
    }
    if (url.pathname === '/api/auth/account') {
      const guard = '(SELECT 1 FROM cnr_account_sessions WHERE token_hash = ?2 AND user_id = ?1 AND expires_at > ?3)';
      const removed = await env.DB.batch([
        env.DB.prepare(`DELETE FROM cnr_account_oauth_challenges WHERE state_hash IN
          (SELECT state_hash FROM cnr_account_oauth_links WHERE user_id = ?1) AND EXISTS ${guard}`).bind(login.user.id, login.tokenHash, now()),
        env.DB.prepare(`DELETE FROM cnr_account_users WHERE id = ?1 AND EXISTS ${guard}`).bind(login.user.id, login.tokenHash, now()),
      ]);
      // D1 includes cascaded rows in meta.changes; deleting one account can change several rows.
      return removed[1].meta.changes > 0 ? response(200, { ok: true }, [cookie(SESSION_COOKIE, '', 0), cookie(OAUTH_COOKIE, '', 0)]) : response(401, { error: 'authentication_required' });
    }
    if (request.method === 'GET') {
      const stored = await env.DB.prepare(`SELECT l.revision, l.data_json, l.updated_at FROM cnr_account_learning l
        JOIN cnr_account_sessions s ON s.user_id = l.user_id WHERE l.user_id = ?1 AND s.token_hash = ?2 AND s.expires_at > ?3`)
        .bind(login.user.id, login.tokenHash, now()).first();
      if (!stored) return response(401, { error: 'authentication_required' });
      return response(200, { revision: stored.revision, data: stored.data_json === null ? null : JSON.parse(stored.data_json), updatedAt: stored.updated_at === null ? null : new Date(stored.updated_at * 1000).toISOString() });
    }
    if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return response(415, { error: 'json_required' });
    let input, encoded;
    try {
      input = await limitedJSON(request, SNAPSHOT_MAX_BYTES + 4096);
      if (!record(input) || !Number.isSafeInteger(input.revision) || input.revision < 0 || input.revision >= Number.MAX_SAFE_INTEGER) throw new TypeError('invalid_revision');
      encoded = validateSnapshot(input.data);
    } catch (error) {
      return response(error instanceof RangeError ? 413 : 400, { error: error instanceof RangeError ? 'snapshot_too_large' : 'invalid_snapshot' });
    }
    const stamp = now();
    const saved = await env.DB.prepare(`UPDATE cnr_account_learning SET data_json = ?1, revision = revision + 1, updated_at = ?2
      WHERE user_id = ?3 AND revision = ?4 AND EXISTS (SELECT 1 FROM cnr_account_sessions
        WHERE token_hash = ?5 AND user_id = ?3 AND expires_at > ?6) RETURNING revision`)
      .bind(encoded, stamp, login.user.id, input.revision, login.tokenHash, now()).first();
    if (!saved) {
      if (!await session(request, env.DB)) return response(401, { error: 'authentication_required' });
      const current = await env.DB.prepare('SELECT revision FROM cnr_account_learning WHERE user_id = ?1').bind(login.user.id).first();
      return response(409, { error: 'revision_conflict', revision: current?.revision ?? 0 });
    }
    return response(200, { revision: saved.revision, updatedAt: new Date(stamp * 1000).toISOString() });
  } catch (error) {
    // Never log OAuth codes, access tokens, cookie values, or private snapshots.
    return url.pathname === OAUTH_CALLBACK || url.pathname === '/api/auth/google' ? oauthError() : response(503, { error: error?.message === 'password_service_busy' ? 'password_service_busy' : 'accounts_unavailable' });
  }
}
