// Single sign-on for sister sites (moodle.compilenrun.com): this Worker acts as an OAuth 2 authorization server
// (authorization-code grant) so Moodle's built-in OAuth 2 client logs readers in with their Compile N Run account.
// Three endpoints, no OpenID discovery: Moodle is configured with them directly (see ~/moodle-python-course/sso_setup.py).
//   GET  /api/auth/oauth/authorize  reader's browser; needs the site session cookie, else sends them to the login dialog
//   POST /api/auth/oauth/token      Moodle's server exchanges the code (client id + secret in the body or Basic auth)
//   GET  /api/auth/oauth/userinfo   Moodle's server reads the profile with the access token
// Config: SSO_CLIENT_ID and SSO_REDIRECT_URIS (vars), SSO_CLIENT_SECRET (secret). All three unset = feature off (404).
import { response, hash, randomToken, session, now, siteOrigin } from './core.js';
import { limitedJSON } from '../lib/body.js';

export const SSO_AUTHORIZE = '/api/auth/oauth/authorize';
export const SSO_TOKEN = '/api/auth/oauth/token';
export const SSO_USERINFO = '/api/auth/oauth/userinfo';
export const SSO_ROUTES = { [SSO_AUTHORIZE]: 'GET', [SSO_TOKEN]: 'POST', [SSO_USERINFO]: 'GET' };
const CODE_SECONDS = 300;
const TOKEN_SECONDS = 3600;
const SCOPES = new Set(['openid', 'profile', 'email']);

export function ssoConfigured(env) {
  return typeof env.SSO_CLIENT_ID === 'string' && env.SSO_CLIENT_ID.length > 0 && typeof env.SSO_CLIENT_SECRET === 'string' &&
    env.SSO_CLIENT_SECRET.length >= 32 && typeof env.SSO_REDIRECT_URIS === 'string' && env.SSO_REDIRECT_URIS.length > 0;
}
const redirectURIs = env => env.SSO_REDIRECT_URIS.split(',').map(s => s.trim()).filter(Boolean);
function constantEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function redirect(location) {
  return new Response(null, { status: 302, headers: { location, 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } });
}
function errorRedirect(uri, error, state) {
  const target = new URL(uri);
  target.searchParams.set('error', error);
  if (state) target.searchParams.set('state', state);
  return redirect(target.toString());
}
// Moodle posts application/x-www-form-urlencoded; accept JSON too. Body capped well below any legitimate size.
async function readParams(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return limitedJSON(request, 8192);
  const text = await request.text();
  if (text.length > 8192) throw new Error('body_too_large');
  return Object.fromEntries(new URLSearchParams(text));
}
function clientCredentials(request, params) {
  const basic = /^Basic (.+)$/.exec(request.headers.get('authorization') || '');
  if (basic) {
    try {
      const [id, ...rest] = atob(basic[1]).split(':');
      return { id: decodeURIComponent(id), secret: decodeURIComponent(rest.join(':')) };
    } catch (_) { return { id: '', secret: '' }; }
  }
  return { id: String(params.client_id || ''), secret: String(params.client_secret || '') };
}
// Split a display name for Moodle, which requires both a first and a last name. A single-word name gets its
// initial as the family name ("Ada" -> "Ada A."), which reads naturally in Moodle's user menu.
function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { given: 'Learner', family: 'L.' };
  if (parts.length === 1) return { given: parts[0], family: parts[0][0].toUpperCase() + '.' };
  return { given: parts.slice(0, -1).join(' '), family: parts[parts.length - 1] };
}

async function authorize(request, env) {
  const url = new URL(request.url);
  const q = url.searchParams;
  const clientId = q.get('client_id') || '', redirectUri = q.get('redirect_uri') || '', state = (q.get('state') || '').slice(0, 512);
  if (clientId !== env.SSO_CLIENT_ID || !redirectURIs(env).includes(redirectUri)) return response(400, { error: 'invalid_client' });
  if (q.get('response_type') !== 'code') return errorRedirect(redirectUri, 'unsupported_response_type', state);
  const scope = (q.get('scope') || 'openid profile email').split(/[\s+]+/).filter(s => SCOPES.has(s)).join(' ');
  const login = await session(request, env.DB);
  if (!login) {
    // No site session: show the normal sign-in dialog, which returns here once the reader is signed in.
    const back = url.pathname + url.search;
    return redirect(`${siteOrigin(env)}/?auth=login&next=${encodeURIComponent(back)}`);
  }
  const code = randomToken(), time = now();
  await env.DB.prepare(`INSERT INTO cnr_account_sso_grants (token_hash, kind, user_id, client_id, redirect_uri, scope, created_at, expires_at)
    VALUES (?1, 'code', ?2, ?3, ?4, ?5, ?6, ?7)`).bind(await hash(code), login.user.id, clientId, redirectUri, scope, time, time + CODE_SECONDS).run();
  const target = new URL(redirectUri);
  target.searchParams.set('code', code);
  if (state) target.searchParams.set('state', state);
  return redirect(target.toString());
}

async function token(request, env) {
  let params;
  try { params = await readParams(request); } catch (_) { return response(400, { error: 'invalid_request' }); }
  const creds = clientCredentials(request, params);
  if (creds.id !== env.SSO_CLIENT_ID || !constantEqual(creds.secret, env.SSO_CLIENT_SECRET)) return response(401, { error: 'invalid_client' });
  if (params.grant_type !== 'authorization_code') return response(400, { error: 'unsupported_grant_type' });
  const code = String(params.code || '');
  if (!/^[A-Za-z0-9_-]{43}$/.test(code)) return response(400, { error: 'invalid_grant' });
  const time = now();
  const grant = await env.DB.prepare(`DELETE FROM cnr_account_sso_grants WHERE token_hash = ?1 AND kind = 'code' AND client_id = ?2
    RETURNING user_id, redirect_uri, scope, expires_at`).bind(await hash(code), creds.id).first();
  if (!grant || grant.expires_at <= time || (params.redirect_uri && params.redirect_uri !== grant.redirect_uri)) return response(400, { error: 'invalid_grant' });
  const access = randomToken();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO cnr_account_sso_grants (token_hash, kind, user_id, client_id, redirect_uri, scope, created_at, expires_at)
      VALUES (?1, 'token', ?2, ?3, '', ?4, ?5, ?6)`).bind(await hash(access), grant.user_id, creds.id, grant.scope, time, time + TOKEN_SECONDS),
    env.DB.prepare('DELETE FROM cnr_account_sso_grants WHERE expires_at <= ?1').bind(time),
  ]);
  return response(200, { access_token: access, token_type: 'Bearer', expires_in: TOKEN_SECONDS, scope: grant.scope });
}

async function userinfo(request, env) {
  const bearer = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(request.headers.get('authorization') || '');
  if (!bearer) return response(401, { error: 'invalid_token' });
  const row = await env.DB.prepare(`SELECT u.id, u.display_name, c.email AS login_email, c.email_verified_at,
      gp.email AS google_email, gp.email_verified AS google_verified, hp.email AS github_email, hp.email_verified AS github_verified
    FROM cnr_account_sso_grants g JOIN cnr_account_users u ON u.id = g.user_id
    LEFT JOIN cnr_account_password_credentials c ON c.user_id = u.id
    LEFT JOIN cnr_account_google_identities gi ON gi.user_id = u.id LEFT JOIN cnr_account_google_profiles gp ON gp.google_sub = gi.google_sub
    LEFT JOIN cnr_account_github_identities hi ON hi.user_id = u.id LEFT JOIN cnr_account_github_profiles hp ON hp.github_id = hi.github_id
    WHERE g.token_hash = ?1 AND g.kind = 'token' AND g.client_id = ?2 AND g.expires_at > ?3`).bind(await hash(bearer[1]), env.SSO_CLIENT_ID, now()).first();
  if (!row) return response(401, { error: 'invalid_token' });
  const email = row.login_email || row.google_email || row.github_email || null;
  const verified = row.login_email ? !!row.email_verified_at : row.google_email ? !!row.google_verified : row.github_email ? !!row.github_verified : false;
  const { given, family } = splitName(row.display_name);
  // Moodle keys the linked login on `preferred_username`; the account id never changes, unlike the email.
  return response(200, { sub: row.id, preferred_username: 'cnr-' + row.id.toLowerCase(), name: `${given} ${family}`.trim(),
    given_name: given, family_name: family, email, email_verified: verified });
}

export async function handleSSO(request, env) {
  const pathname = new URL(request.url).pathname;
  if (pathname === SSO_AUTHORIZE) return authorize(request, env);
  if (pathname === SSO_TOKEN) return token(request, env);
  return userinfo(request, env);
}
