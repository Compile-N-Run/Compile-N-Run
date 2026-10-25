// First-party behaviour events: POST /api/events from the site and from Moodle (accounts-events-schema.sql).
// The site sends its session cookie; Moodle pages carry a token signed by local_cnranalytics with the SSO client
// secret, so the Worker can trust the Moodle user it names. Events are stored with the account id when one is
// known, so tools/events_report.py can join them to names and emails.
import { limitedJSON } from '../lib/body.js';
import { siteOrigin } from '../lib/http.js';
import { session } from '../auth/core.js';
const now = () => Date.now();  // milliseconds, unlike auth/core.js's seconds

export const EVENTS_ROUTE = '/api/events';
export const EVENTS_RETENTION_DAYS = 400;
const MAX_EVENTS = 25, MAX_BODY = 32 * 1024, MAX_PROPS = 2000, TOKEN_SKEW = 60_000;
const NAME = /^[a-z][a-z0-9_]{0,39}$/, ID = /^[A-Za-z0-9_-]{8,64}$/;
const encoder = new TextEncoder();

function moodleOrigins(env) {
  return String(env.EVENTS_EXTRA_ORIGINS || '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);
}
function cors(origin, env) {
  const ok = origin === siteOrigin(env) || moodleOrigins(env).includes(origin);
  return ok ? { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400', vary: 'Origin' } : null;
}
const reply = (status, headers = {}, body = null) => new Response(body, { status, headers: { 'cache-control': 'no-store', ...headers } });

function b64urlDecode(text) {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - text.length % 4) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}
async function hmacMatches(secret, message, signature) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  try { return await crypto.subtle.verify('HMAC', key, b64urlDecode(signature), encoder.encode(message)); } catch (_) { return false; }
}
// Token from local_cnranalytics: base64url(JSON{mu, su, em, nm, exp}) + '.' + base64url(HMAC-SHA256(secret, payload)).
async function moodleIdentity(token, env) {
  if (typeof token !== 'string' || token.length > 2000 || !env.SSO_CLIENT_SECRET) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !(await hmacMatches(env.SSO_CLIENT_SECRET, payload, signature))) return null;
  let claims;
  try { claims = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))); } catch (_) { return null; }
  if (!claims || typeof claims !== 'object' || typeof claims.exp !== 'number' || claims.exp * 1000 < now() - TOKEN_SKEW) return null;
  const str = (v, n) => (typeof v === 'string' && v.length <= n ? v : null);
  return { moodleUserId: Number.isInteger(claims.mu) ? claims.mu : null, siteUserId: str(claims.su, 64), email: str(claims.em, 254), name: str(claims.nm, 200) };
}
// Prefer the account the SSO link names; otherwise match the Moodle email to a verified site email.
async function resolveMoodleUser(identity, db) {
  if (identity.siteUserId) {
    const row = await db.prepare('SELECT id FROM cnr_account_users WHERE id = ?1').bind(identity.siteUserId).first();
    if (row) return row.id;
  }
  if (!identity.email) return null;
  const email = identity.email.toLowerCase();
  const row = await db.prepare(`SELECT user_id FROM (
      SELECT c.user_id, 0 AS rank FROM cnr_account_password_credentials c WHERE lower(c.email) = ?1 AND c.email_verified_at IS NOT NULL
      UNION ALL SELECT g.user_id, 1 FROM cnr_account_google_identities g JOIN cnr_account_google_profiles p ON p.google_sub = g.google_sub WHERE lower(p.email) = ?1 AND p.email_verified = 1
      UNION ALL SELECT h.user_id, 2 FROM cnr_account_github_identities h JOIN cnr_account_github_profiles p ON p.github_id = h.github_id WHERE lower(p.email) = ?1 AND p.email_verified = 1
    ) ORDER BY rank LIMIT 1`).bind(email).first();
  return row ? row.user_id : null;
}

function cleanEvent(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (!NAME.test(raw.name || '') || typeof raw.path !== 'string' || raw.path.length > 500 || !raw.path.startsWith('/')) return null;
  let props = raw.props && typeof raw.props === 'object' && !Array.isArray(raw.props) ? raw.props : {};
  let json = JSON.stringify(props);
  if (json.length > MAX_PROPS) { props = { truncated: true }; json = JSON.stringify(props); }
  const ts = Number.isFinite(raw.ts) && raw.ts > 1e12 && raw.ts < 1e13 ? Math.round(raw.ts) : null;
  return { name: raw.name, path: raw.path, props: json, ts };
}

export async function handleEvents(request, env, ctx) {
  const origin = request.headers.get('Origin') || '';
  const headers = cors(origin, env);
  if (request.method === 'OPTIONS') return reply(headers ? 204 : 403, headers || {});
  if (request.method !== 'POST') return reply(405, headers || {});
  // Same-origin beacons may omit Origin; browsers then send Sec-Fetch-Site: same-origin.
  const sameOrigin = !origin && request.headers.get('Sec-Fetch-Site') === 'same-origin';
  if (!headers && !sameOrigin) return reply(403, {});
  if (!env.DB) return reply(503, headers || {});
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.EVENTS_LIMIT) { const { success } = await env.EVENTS_LIMIT.limit({ key: ip }); if (!success) return reply(429, headers || {}); }
  let body;
  try { body = await limitedJSON(request, MAX_BODY); } catch (_) { return reply(400, headers || {}); }
  if (!body || typeof body !== 'object' || !Array.isArray(body.events) || !ID.test(body.visitor || '')) return reply(400, headers || {});
  const events = body.events.slice(0, MAX_EVENTS).map(cleanEvent).filter(Boolean);
  if (!events.length) return reply(204, headers || {});
  const site = body.site === 'moodle' ? 'moodle' : 'www';
  let userId = null, extra = null;
  try {
    if (site === 'moodle') {
      const identity = await moodleIdentity(body.token, env);
      if (identity) { userId = await resolveMoodleUser(identity, env.DB); extra = { moodle_user_id: identity.moodleUserId, moodle_name: identity.name, moodle_email: identity.email }; }
    } else {
      const current = await session(request, env.DB);
      userId = current ? current.user.id : null;
    }
  } catch (_) { /* identity is optional: keep the events anonymous */ }
  const country = request.headers.get('CF-IPCountry') || request.cf?.country || null;
  const ua = (request.headers.get('User-Agent') || '').slice(0, 200) || null;
  const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 500) : null;
  const sessionId = ID.test(body.session || '') ? body.session : null;
  const time = now();
  const insert = env.DB.prepare(`INSERT INTO cnr_events (ts, client_ts, site, user_id, visitor_id, session_id, name, path, props, referrer, country, ua)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`);
  const rows = events.map(e => {
    // Moodle-side identity rides along in props when no site account could be matched, so "who" is still answerable.
    const props = extra && !userId ? JSON.stringify({ ...JSON.parse(e.props), ...extra }) : (extra ? JSON.stringify({ ...JSON.parse(e.props), moodle_user_id: extra.moodle_user_id }) : e.props);
    return insert.bind(time, e.ts, site, userId, body.visitor, sessionId, e.name, e.path, props, e.name === 'page_view' ? referrer : null, country, ua);
  });
  const write = env.DB.batch(rows).catch(() => {});
  if (ctx?.waitUntil) ctx.waitUntil(write); else await write;
  return reply(204, headers || {});
}

// Nightly: drop events past the retention window (wrangler.jsonc triggers).
export async function purgeOldEvents(env) {
  if (!env.DB) return;
  await env.DB.prepare('DELETE FROM cnr_events WHERE ts < ?1').bind(now() - EVENTS_RETENTION_DAYS * 86_400_000).run();
}
