// OAuth identities (Google, GitHub) are verified through each provider's authenticated user endpoint.
// Provider tokens never reach the browser or persist in D1. No ID token is trusted.
import { emailConfigured } from '../email-accounts.js';
import { limitedJSON } from '../lib/body.js';
export const ACCOUNT_SITE = 'https://www.compilenrun.com';
export const OAUTH_CALLBACK = '/auth/google_oauth2/callback';
export const GITHUB_CALLBACK = '/auth/github_oauth2/callback';
const SESSION_COOKIE = '__Host-cnr_session';
const OAUTH_COOKIE = '__Host-cnr_oauth';
const SESSION_SECONDS = 30 * 86400;
const CHALLENGE_SECONDS = 600;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const clean = (value, max) => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max) : '';
const cleanEmail = value => typeof value === 'string' && value.length <= 254 && !/[\u0000-\u001f\u007f\s]/.test(value) && value.includes('@') ? value.toLowerCase() : null;
async function providerJSON(url, token, extraHeaders = {}) {
  const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(10000),
    headers: { authorization: 'Bearer ' + token, accept: 'application/json', ...extraHeaders } });
  if (!res.ok) throw new Error('provider_' + res.status);
  return limitedJSON(res, 65536);
}
// Each provider: fixed endpoints, its identity/profile tables, and how to turn an access token into an identity
// { subject, name, email, emailVerified, login }. Table and column names here are trusted constants.
export const PROVIDERS = {
  google: {
    key: 'google', label: 'Google', start: '/api/auth/google', link: '/api/auth/google/link', callback: OAUTH_CALLBACK,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'openid email profile', authParams: { access_type: 'online', include_granted_scopes: 'false', prompt: 'select_account' },
    clientId: env => env.GOOGLE_CLIENT_ID, secret: env => env.GOOGLE_CLIENT_SECRET,
    identities: 'cnr_account_google_identities', profiles: 'cnr_account_google_profiles', column: 'google_sub', hasLogin: false,
    async identity(token) {
      const info = await providerJSON('https://openidconnect.googleapis.com/v1/userinfo', token);
      return { subject: typeof info.sub === 'string' ? info.sub : '', name: clean(info.name, 100), email: cleanEmail(info.email),
        emailVerified: info.email_verified === true, login: null };
    },
  },
  github: {
    key: 'github', label: 'GitHub', start: '/api/auth/github', link: '/api/auth/github/link', callback: GITHUB_CALLBACK,
    authUrl: 'https://github.com/login/oauth/authorize', tokenUrl: 'https://github.com/login/oauth/access_token',
    scope: 'read:user user:email', authParams: { allow_signup: 'true' },
    clientId: env => env.GITHUB_CLIENT_ID, secret: env => env.GITHUB_CLIENT_SECRET,
    identities: 'cnr_account_github_identities', profiles: 'cnr_account_github_profiles', column: 'github_id', hasLogin: true,
    async identity(token) {
      const headers = { accept: 'application/vnd.github+json', 'user-agent': 'compilenrun-worker', 'x-github-api-version': '2022-11-28' };
      const user = await providerJSON('https://api.github.com/user', token, headers);
      // The primary verified address comes from /user/emails; /user only shows a public email, if any.
      let email = null, emailVerified = false;
      try {
        const emails = await providerJSON('https://api.github.com/user/emails', token, headers);
        const pick = Array.isArray(emails) && (emails.find(e => e && e.primary && e.verified) || emails.find(e => e && e.verified));
        if (pick) { email = cleanEmail(pick.email); emailVerified = !!email; }
      } catch (_) { /* informational only */ }
      if (!email) email = cleanEmail(user.email);
      return { subject: Number.isInteger(user.id) && user.id > 0 ? String(user.id) : '', name: clean(user.name, 100) || clean(user.login, 100),
        email, emailVerified, login: clean(user.login, 39) || null };
    },
  },
};
const providerFor = (pathname, field) => Object.values(PROVIDERS).find(p => p[field] === pathname) || null;
const encoder = new TextEncoder();
const now = () => Math.floor(Date.now() / 1000);

// A readable "signed in" hint next to the HttpOnly session cookie, so pages only ask /api/auth/session when a
// session may exist (guests skip the request entirely). It carries no secret: only the presence matters.
const HINT_COOKIE = 'cnr_signed_in';
function withHint(cookies) {
  const out = [];
  for (const value of cookies) {
    out.push(value);
    if (!value.startsWith(`${SESSION_COOKIE}=`)) continue;
    out.push(value.includes('Max-Age=0') ? `${HINT_COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=Lax`
      : `${HINT_COOKIE}=1; Path=/; Max-Age=${SESSION_SECONDS}; Secure; SameSite=Lax`);
  }
  return out;
}

function response(status, body, cookies = []) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store, private',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'cross-origin-resource-policy': 'same-origin',
  });
  for (const value of withHint(cookies)) headers.append('set-cookie', value);
  return new Response(JSON.stringify(body), { status, headers });
}

function cookie(name, value, seconds) {
  return `${name}=${value}; Path=/; Max-Age=${seconds}; HttpOnly; Secure; SameSite=Lax`;
}

function redirect(target, cookies = []) {
  const headers = new Headers({ location: target, 'cache-control': 'no-store, private', 'referrer-policy': 'no-referrer' });
  for (const value of withHint(cookies)) headers.append('set-cookie', value);
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
function providerConfigured(p, env) {
  const id = p.clientId(env), secret = p.secret(env);
  return typeof id === 'string' && !!id.trim() && typeof secret === 'string' && !!secret.trim() && !!env.DB && !!env.AUTH_LIMIT;
}
const googleConfigured = env => providerConfigured(PROVIDERS.google, env);
const githubConfigured = env => providerConfigured(PROVIDERS.github, env);
function configured(env) { return googleConfigured(env) || githubConfigured(env) || emailConfigured(env); }
function providerFlags(env) { return { google: googleConfigured(env), github: githubConfigured(env), email: emailConfigured(env) }; }

async function session(request, db) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = await hash(token);
  // Direct DB calls intentionally use the primary. Do not replace with a
  // first-unconstrained D1 Session: revoked logins must not reappear on replicas.
  const row = await db.prepare(`SELECT u.id, u.display_name, c.email, c.email_verified_at,
    CASE WHEN c.email_verified_at IS NOT NULL THEN 1 ELSE 0 END AS has_password, g.google_sub AS google_identity, gp.email AS google_email,
    h.github_id AS github_identity, hp.login AS github_login, hp.email AS github_email
    FROM cnr_account_sessions s JOIN cnr_account_users u ON u.id = s.user_id
    LEFT JOIN cnr_account_password_credentials c ON c.user_id = u.id
    LEFT JOIN cnr_account_google_identities g ON g.user_id = u.id
    LEFT JOIN cnr_account_google_profiles gp ON gp.google_sub = g.google_sub
    LEFT JOIN cnr_account_github_identities h ON h.user_id = u.id
    LEFT JOIN cnr_account_github_profiles hp ON hp.github_id = h.github_id
    WHERE s.token_hash = ?1 AND s.expires_at > ?2`).bind(tokenHash, now()).first();
  return row ? { user: { id: row.id, name: row.display_name, email: row.email || null,
    emailVerified: !!row.email_verified_at, hasPassword: !!row.has_password, googleLinked: !!row.google_identity,
    googleEmail: row.google_identity && row.google_email || null, githubLinked: !!row.github_identity,
    githubLogin: row.github_identity && row.github_login || null, githubEmail: row.github_identity && row.github_email || null },
    tokenHash, csrfToken: await hash('csrf:' + token) } : null;
}

async function issueSession(request, env, userID, credential = null, subject = '', provider = PROVIDERS.google) {
  const token = randomToken(), tokenHash = await hash(token), time = now();
  const inserted = await env.DB.prepare(`INSERT INTO cnr_account_sessions (token_hash, user_id, created_at, expires_at)
    SELECT ?1, id, ?2, ?3 FROM cnr_account_users WHERE id = ?4 AND (?5 = 0 OR EXISTS
    (SELECT 1 FROM cnr_account_password_credentials WHERE user_id = ?4 AND version = ?5 AND password_hash = ?6 AND email_verified_at IS NOT NULL))
    AND (?7 = '' OR EXISTS (SELECT 1 FROM ${provider.identities} WHERE user_id = ?4 AND ${provider.column} = ?7))
    RETURNING token_hash`).bind(tokenHash, time, time + SESSION_SECONDS, userID, credential?.version || 0, credential?.password_hash || '', subject).first();
  if (!inserted) return null;
  const old = readCookie(request, SESSION_COOKIE);
  if (old) await env.DB.prepare('DELETE FROM cnr_account_sessions WHERE token_hash = ?1').bind(await hash(old)).run();
  return cookie(SESSION_COOKIE, token, SESSION_SECONDS);
}

async function beginOAuth(p, request, env, linking = null) {
  const state = randomToken(), binding = randomToken(), verifier = randomToken();
  const stamp = now();
  const statements = [
    env.DB.prepare('DELETE FROM cnr_account_oauth_challenges WHERE expires_at <= ?1').bind(stamp),
    env.DB.prepare('DELETE FROM cnr_account_sessions WHERE expires_at <= ?1').bind(stamp),
    env.DB.prepare('INSERT INTO cnr_account_oauth_challenges (state_hash, binding_hash, verifier, expires_at, provider) VALUES (?1, ?2, ?3, ?4, ?5)')
      .bind(await hash(state), await hash(binding), verifier, stamp + CHALLENGE_SECONDS, p.key),
  ];
  if (linking) statements.push(env.DB.prepare(`INSERT INTO cnr_account_oauth_links (state_hash, user_id, session_hash)
    SELECT ?1, user_id, token_hash FROM cnr_account_sessions WHERE token_hash = ?2 AND user_id = ?3 AND expires_at > ?4`)
    .bind(await hash(state), linking.tokenHash, linking.user.id, stamp));
  const result = await env.DB.batch(statements);
  if (linking && result[result.length - 1].meta.changes !== 1) return response(401, { error: 'authentication_required' });
  const url = new URL(p.authUrl);
  url.search = new URLSearchParams({
    client_id: p.clientId(env), redirect_uri: ACCOUNT_SITE + p.callback,
    response_type: 'code', scope: p.scope, state,
    code_challenge: await hash(verifier), code_challenge_method: 'S256', ...p.authParams,
  });
  return linking ? response(200, { url: url.href }, [cookie(OAUTH_COOKIE, binding, CHALLENGE_SECONDS)]) : redirect(url.href, [cookie(OAUTH_COOKIE, binding, CHALLENGE_SECONDS)]);
}

async function providerIdentity(p, db, subject) {
  const identity = await db.prepare(`SELECT user_id AS id FROM ${p.identities} WHERE ${p.column} = ?1`).bind(subject).first();
  return identity || (p.key === 'google' ? googleLegacyIdentity(db, subject) : null);
}
async function googleLegacyIdentity(db, subject) {
  let identity = null;
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

// Record what the provider reports for this identity. Informational only (never used to
// authenticate or to match password accounts); a failure must not block sign-in.
async function saveProfile(p, db, identity, stamp) {
  try {
    if (p.hasLogin) {
      await db.prepare(`INSERT INTO ${p.profiles} (${p.column}, login, email, email_verified, name, updated_at)
        SELECT ?1, ?2, ?3, ?4, ?5, ?6 WHERE EXISTS (SELECT 1 FROM ${p.identities} WHERE ${p.column} = ?1)
        ON CONFLICT(${p.column}) DO UPDATE SET login = excluded.login, email = excluded.email, email_verified = excluded.email_verified, name = excluded.name, updated_at = excluded.updated_at`)
        .bind(identity.subject, identity.login, identity.email, identity.email && identity.emailVerified ? 1 : 0, identity.name || null, stamp).run();
    } else {
      await db.prepare(`INSERT INTO ${p.profiles} (${p.column}, email, email_verified, name, updated_at)
        SELECT ?1, ?2, ?3, ?4, ?5 WHERE EXISTS (SELECT 1 FROM ${p.identities} WHERE ${p.column} = ?1)
        ON CONFLICT(${p.column}) DO UPDATE SET email = excluded.email, email_verified = excluded.email_verified, name = excluded.name, updated_at = excluded.updated_at`)
        .bind(identity.subject, identity.email, identity.email && identity.emailVerified ? 1 : 0, identity.name || null, stamp).run();
    }
  } catch (error) { console.warn(p.key + ' profile not saved', error?.message); }
}

async function finishOAuth(p, request, env) {
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
    WHERE state_hash = ?1 AND binding_hash = ?2 AND expires_at > ?3 AND provider = ?4 RETURNING verifier`)
    .bind(stateHash, await hash(binding), now(), p.key).first();
  if (!challenge) return oauthError();
  if (linking) {
    const current = await session(request, env.DB);
    if (!current || current.user.id !== linking.user_id || current.tokenHash !== linking.session_hash) return oauthError(true);
  }
  const exchanged = await fetch(p.tokenUrl, {
    method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(10000),
    headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'compilenrun-worker' },
    body: new URLSearchParams({ client_id: p.clientId(env), client_secret: p.secret(env),
      code, grant_type: 'authorization_code', redirect_uri: ACCOUNT_SITE + p.callback, code_verifier: challenge.verifier }),
  });
  if (!exchanged.ok) return oauthError(!!linking);
  const credentials = await limitedJSON(exchanged, 32768);
  if (typeof credentials.access_token !== 'string' || !credentials.access_token || credentials.access_token.length > 8192 ||
      String(credentials.token_type).toLowerCase() !== 'bearer') return oauthError(!!linking);
  // Only a token obtained above from the provider's fixed token endpoint is accepted.
  // Do not authenticate from email, client-supplied tokens, or unverified JWTs.
  let identity;
  try { identity = await p.identity(credentials.access_token); } catch (_) { return oauthError(!!linking); }
  if (!/^[A-Za-z0-9_-]{1,255}$/.test(identity.subject)) return oauthError(!!linking);
  const stamp = now();
  let user = await providerIdentity(p, env.DB, identity.subject);
  if (linking) {
    if (user && user.id !== linking.user_id) return oauthError(true);
    const ownIdentity = await env.DB.prepare(`SELECT ${p.column} AS subject FROM ${p.identities} WHERE user_id = ?1`).bind(linking.user_id).first();
    if (ownIdentity && ownIdentity.subject !== identity.subject) return oauthError(true);
    const current = await session(request, env.DB);
    if (!current || current.user.id !== linking.user_id || current.tokenHash !== linking.session_hash) return oauthError(true);
    if (!ownIdentity) {
      const added = await env.DB.prepare(`INSERT INTO ${p.identities} (${p.column}, user_id, linked_at)
        SELECT ?1, user_id, ?2 FROM cnr_account_sessions WHERE token_hash = ?3 AND user_id = ?4 AND expires_at > ?2 RETURNING user_id`)
        .bind(identity.subject, stamp, linking.session_hash, linking.user_id).first();
      if (!added) return oauthError(true);
    }
    await saveProfile(p, env.DB, identity, stamp);
    return redirect(ACCOUNT_SITE + '/profile/?auth=linked', [cookie(OAUTH_COOKIE, '', 0)]);
  }
  if (!user) {
    const id = crypto.randomUUID();
    try {
      await env.DB.batch([
        env.DB.prepare('INSERT INTO cnr_account_users (id, google_sub, display_name, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)').bind(id, 'local:' + id, identity.name || 'Learner', stamp),
        env.DB.prepare(`INSERT INTO ${p.identities} (${p.column}, user_id, linked_at) VALUES (?1, ?2, ?3)`).bind(identity.subject, id, stamp),
        env.DB.prepare('INSERT INTO cnr_account_learning (user_id, revision) VALUES (?1, 0)').bind(id),
      ]);
      user = { id };
    } catch (error) {
      if (!/UNIQUE constraint/i.test(String(error))) throw error;
      user = await env.DB.prepare(`SELECT user_id AS id FROM ${p.identities} WHERE ${p.column} = ?1`).bind(identity.subject).first();
      if (!user) throw error;
    }
  }
  await saveProfile(p, env.DB, identity, stamp);
  const sessionCookie = await issueSession(request, env, user.id, null, identity.subject, p);
  return sessionCookie ? redirect(ACCOUNT_SITE + '/learn/', [cookie(OAUTH_COOKIE, '', 0), sessionCookie]) : oauthError();
}


export { response, cookie, oauthError, hash, randomToken, issueSession, session, configured, providerFlags, providerFor, providerConfigured, googleConfigured, emailConfigured, beginOAuth, finishOAuth, sameToken, now, SESSION_COOKIE, OAUTH_COOKIE };
