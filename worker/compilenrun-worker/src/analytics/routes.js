// Read-only analytics API for the dashboard on analytics.compilenrun.com (analytics-dashboard/ in the repo).
// Every query reads cnr_events (accounts-events-schema.sql) joined to the account tables, so signed-in activity
// carries names and emails. Only site administrators listed in ANALYTICS_ADMINS may call it.
//
// Sign-in hand-off: the dashboard lives on another origin, and the site session cookie is host-only (__Host-, Lax),
// so /api/analytics/connect runs as a top-level navigation on www: it checks the session, then redirects back to
// the dashboard with a 12-hour bearer token in the URL fragment (stored hashed in cnr_account_sso_grants).
import { limitedJSON } from '../lib/body.js';
import { siteOrigin } from '../lib/http.js';
import { session, hash, randomToken } from '../auth/core.js';

export const ANALYTICS_PREFIX = '/api/analytics/';
const CLIENT = 'analytics-dashboard', TOKEN_SECONDS = 12 * 3600, DAY = 86_400_000;
const PEOPLE = `people AS (
  SELECT u.id, u.display_name AS name, COALESCE(
    (SELECT c.email FROM cnr_account_password_credentials c WHERE c.user_id = u.id),
    (SELECT gp.email FROM cnr_account_google_identities g JOIN cnr_account_google_profiles gp ON gp.google_sub = g.google_sub WHERE g.user_id = u.id),
    (SELECT hp.email FROM cnr_account_github_identities h JOIN cnr_account_github_profiles hp ON hp.github_id = h.github_id WHERE h.user_id = u.id)
  ) AS email, u.created_at FROM cnr_account_users u)`;
const WHO = `COALESCE(p.name, json_extract(e.props,'$.moodle_name'), '') AS who, COALESCE(p.email, json_extract(e.props,'$.moodle_email'), '') AS email`;
const SECONDS = `CASE WHEN e.name='page_engaged' THEN json_extract(e.props,'$.seconds') END`;

const origins = env => String(env.ANALYTICS_ORIGINS || '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);
const admins = env => String(env.ANALYTICS_ADMINS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
export const analyticsConfigured = env => !!env.DB && admins(env).length > 0;

function cors(request, env) {
  const origin = request.headers.get('Origin') || '';
  if (!origin || origin === siteOrigin(env)) return {};
  if (!origins(env).includes(origin)) return null;
  return { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'authorization, content-type', 'access-control-max-age': '86400', vary: 'Origin' };
}
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers } });

function isAdmin(user, env) {
  const list = admins(env);
  const candidates = [user.id, user.emailVerified ? user.email : null, user.googleEmail].filter(Boolean).map(s => String(s).toLowerCase());
  return candidates.some(c => list.includes(c));
}
async function bearerUser(request, db) {
  const header = request.headers.get('Authorization') || '';
  const m = /^Bearer\s+([A-Za-z0-9_-]{20,200})$/.exec(header);
  if (!m) return null;
  const row = await db.prepare(`WITH ${PEOPLE} SELECT g.user_id AS id, p.name, p.email FROM cnr_account_sso_grants g JOIN people p ON p.id = g.user_id
    WHERE g.token_hash = ?1 AND g.kind = 'token' AND g.client_id = ?2 AND g.expires_at > ?3`).bind(await hash(m[1]), CLIENT, Math.floor(Date.now() / 1000)).first();
  return row ? { id: row.id, name: row.name, email: row.email } : null;
}

/* ---- range and filter parsing ---- */
function range(url) {
  const now = Date.now();
  let to = Number(url.searchParams.get('to')) || now, from = Number(url.searchParams.get('from'));
  if (!from) { const days = Math.min(400, Math.max(1, Number(url.searchParams.get('days')) || 30)); from = to - days * DAY; }
  from = Math.max(0, Math.min(from, to)); to = Math.min(to, now + DAY);
  const site = url.searchParams.get('site');
  return { from: Math.floor(from), to: Math.ceil(to), site: site === 'www' || site === 'moodle' ? site : null };
}
const where = (r, alias = 'e') => `${alias}.ts >= ${r.from} AND ${r.ts_to_excl ? '' : ''}${alias}.ts < ${r.to}${r.site ? ` AND ${alias}.site = '${r.site}'` : ''}`;
const all = async (db, sql, ...binds) => (await db.prepare(sql).bind(...binds).all()).results;

/* ---- report queries ---- */
async function summary(db, r) {
  const span = r.to - r.from, prev = { ...r, from: r.from - span, to: r.from };
  const q = x => db.prepare(`SELECT COUNT(DISTINCT e.visitor_id) AS visitors, COUNT(DISTINCT e.user_id) AS learners,
      SUM(e.name='page_view') AS page_views, COUNT(*) AS events, ROUND(SUM(${SECONDS})/60.0) AS minutes,
      SUM(e.name IN ('run_code','answer_check','quiz_submit','practice_recorded')) AS practice,
      SUM(e.site='moodle' AND e.name='page_view') AS moodle_views
      FROM cnr_events e WHERE ${where(x)}`).first();
  const [current, previous, accounts] = await Promise.all([q(r), q(prev),
    db.prepare('SELECT COUNT(*) AS n FROM cnr_account_users WHERE created_at >= ?1 AND created_at < ?2').bind(Math.floor(r.from / 1000), Math.floor(r.to / 1000)).first()]);
  return { current: { ...current, new_accounts: accounts.n }, previous };
}
const daily = (db, r) => all(db, `SELECT date(e.ts/1000,'unixepoch') AS day, COUNT(DISTINCT e.visitor_id) AS visitors, COUNT(DISTINCT e.user_id) AS learners,
  SUM(e.name='page_view' AND e.site='www') AS www_views, SUM(e.name='page_view' AND e.site='moodle') AS moodle_views, COUNT(*) AS events,
  ROUND(SUM(${SECONDS})/60.0) AS minutes FROM cnr_events e WHERE ${where(r)} GROUP BY day ORDER BY day`);
const events = (db, r) => all(db, `SELECT e.name, e.site, COUNT(*) AS n, COUNT(DISTINCT e.visitor_id) AS visitors, COUNT(DISTINCT e.user_id) AS learners
  FROM cnr_events e WHERE ${where(r)} GROUP BY e.name, e.site ORDER BY n DESC`);
const pages = (db, r) => all(db, `SELECT e.site, e.path, SUM(e.name='page_view') AS views, COUNT(DISTINCT e.visitor_id) AS visitors, COUNT(DISTINCT e.user_id) AS learners,
  ROUND(AVG(${SECONDS})) AS avg_seconds, ROUND(AVG(CASE WHEN e.name='page_engaged' THEN json_extract(e.props,'$.scroll') END)) AS avg_scroll,
  SUM(e.name IN ('run_code','answer_check','quiz_submit')) AS practice
  FROM cnr_events e WHERE ${where(r)} AND e.name IN ('page_view','page_engaged','run_code','answer_check','quiz_submit') GROUP BY e.site, e.path HAVING views > 0 ORDER BY views DESC LIMIT 100`);
const learners = (db, r) => all(db, `WITH ${PEOPLE} SELECT e.user_id AS id, p.name, p.email, COUNT(*) AS events, SUM(e.name='page_view') AS views,
  SUM(e.site='moodle') AS moodle_events, SUM(e.name IN ('run_code','answer_check','quiz_submit','practice_recorded')) AS practice,
  SUM(e.name='lesson_read' AND json_extract(e.props,'$.on')=1) AS lessons_read, ROUND(SUM(${SECONDS})/60.0) AS minutes,
  COUNT(DISTINCT date(e.ts/1000,'unixepoch')) AS active_days, MIN(e.ts) AS first_seen, MAX(e.ts) AS last_seen, MAX(e.country) AS country
  FROM cnr_events e JOIN people p ON p.id = e.user_id WHERE ${where(r)} GROUP BY e.user_id ORDER BY last_seen DESC LIMIT 500`);
async function learner(db, r, id) {
  const [profile, timeline, days, top] = await Promise.all([
    db.prepare(`WITH ${PEOPLE} SELECT p.id, p.name, p.email, p.created_at,
      EXISTS(SELECT 1 FROM cnr_account_google_identities g WHERE g.user_id = p.id) AS google,
      EXISTS(SELECT 1 FROM cnr_account_github_identities h WHERE h.user_id = p.id) AS github,
      EXISTS(SELECT 1 FROM cnr_account_wechat_identities w WHERE w.user_id = p.id) AS wechat,
      EXISTS(SELECT 1 FROM cnr_account_password_credentials c WHERE c.user_id = p.id AND c.email_verified_at IS NOT NULL) AS email_login
      FROM people p WHERE p.id = ?1`).bind(id).first(),
    all(db, `SELECT e.ts, e.site, e.name, e.path, e.props, e.country, e.session_id FROM cnr_events e WHERE e.user_id = ?1 AND ${where(r)} ORDER BY e.ts DESC LIMIT 1000`, id),
    all(db, `SELECT date(e.ts/1000,'unixepoch') AS day, SUM(e.name='page_view') AS views, COUNT(*) AS events, ROUND(SUM(${SECONDS})/60.0) AS minutes
      FROM cnr_events e WHERE e.user_id = ?1 AND ${where(r)} GROUP BY day ORDER BY day`, id),
    all(db, `SELECT e.site, e.path, SUM(e.name='page_view') AS views, ROUND(SUM(${SECONDS})/60.0, 1) AS minutes FROM cnr_events e
      WHERE e.user_id = ?1 AND ${where(r)} GROUP BY e.site, e.path HAVING views > 0 ORDER BY views DESC LIMIT 25`, id),
  ]);
  return { profile, timeline, days, top };
}
async function funnel(db, r) {
  const w = where(r);
  const [totals, rows] = await Promise.all([
    db.prepare(`SELECT COUNT(DISTINCT CASE WHEN e.name='moodle_promo_click' THEN e.visitor_id END) AS clicked_promo,
      COUNT(DISTINCT CASE WHEN e.site='moodle' AND e.name='page_view' THEN e.visitor_id END) AS visited_moodle,
      COUNT(DISTINCT CASE WHEN e.name='login_click' THEN e.visitor_id END) AS clicked_login,
      COUNT(DISTINCT CASE WHEN e.name='enrol_submit' THEN e.visitor_id END) AS enrolled,
      COUNT(DISTINCT CASE WHEN e.name IN ('answer_check','quiz_submit') THEN e.visitor_id END) AS did_quiz,
      COUNT(DISTINCT CASE WHEN e.site='www' AND e.name='page_view' THEN e.visitor_id END) AS site_visitors
      FROM cnr_events e WHERE ${w}`).first(),
    all(db, `WITH ${PEOPLE}, k AS (SELECT COALESCE(e.user_id, 'v:' || e.visitor_id) AS k, e.user_id, e.name, e.site, e.ts FROM cnr_events e WHERE ${w})
      SELECT COALESCE(p.name, '') AS name, COALESCE(p.email, '') AS email, k.user_id AS id, SUM(k.name='moodle_promo_click') AS promo_clicks,
      SUM(k.site='moodle' AND k.name='page_view') AS moodle_views, SUM(k.name='enrol_submit') AS enrolments,
      SUM(k.name IN ('answer_check','quiz_submit')) AS quiz_actions, MAX(k.ts) AS last_seen
      FROM k LEFT JOIN people p ON p.id = k.user_id GROUP BY k.k HAVING promo_clicks > 0 OR moodle_views > 0 ORDER BY quiz_actions DESC, moodle_views DESC LIMIT 200`),
  ]);
  return { totals, rows };
}
async function moodle(db, r) {
  const m = { ...r, site: 'moodle' }, w = where(m);
  const [coursePages, modules, learnersRows] = await Promise.all([
    all(db, `SELECT json_extract(e.props,'$.course') AS course, json_extract(e.props,'$.modname') AS module, e.path, SUM(e.name='page_view') AS views,
      COUNT(DISTINCT e.visitor_id) AS visitors, SUM(e.name IN ('answer_check','quiz_submit')) AS quiz_actions, ROUND(AVG(${SECONDS})) AS avg_seconds
      FROM cnr_events e WHERE ${w} GROUP BY course, module, e.path ORDER BY views DESC LIMIT 100`),
    all(db, `SELECT COALESCE(json_extract(e.props,'$.course'), '(site)') AS course, COALESCE(NULLIF(json_extract(e.props,'$.modname'),''), 'course pages') AS module,
      SUM(e.name='page_view') AS views, COUNT(DISTINCT e.visitor_id) AS visitors, SUM(e.name IN ('answer_check','quiz_submit')) AS quiz_actions, ROUND(SUM(${SECONDS})/60.0) AS minutes
      FROM cnr_events e WHERE ${w} GROUP BY course, module ORDER BY views DESC`),
    all(db, `WITH ${PEOPLE} SELECT ${WHO}, e.user_id AS id, json_extract(e.props,'$.moodle_user_id') AS moodle_id, COUNT(*) AS events, SUM(e.name='page_view') AS views,
      SUM(e.name IN ('answer_check','quiz_submit')) AS quiz_actions, ROUND(SUM(${SECONDS})/60.0) AS minutes, MAX(e.ts) AS last_seen
      FROM cnr_events e LEFT JOIN people p ON p.id = e.user_id WHERE ${w} GROUP BY COALESCE(e.user_id, 'm:' || moodle_id, 'v:' || e.visitor_id) ORDER BY last_seen DESC LIMIT 200`),
  ]);
  return { pages: coursePages, modules, learners: learnersRows };
}
async function live(db) {
  const now = Date.now();
  const [active, recent] = await Promise.all([
    db.prepare('SELECT COUNT(DISTINCT visitor_id) AS visitors, COUNT(DISTINCT user_id) AS learners FROM cnr_events WHERE ts >= ?1').bind(now - 5 * 60_000).first(),
    all(db, `WITH ${PEOPLE} SELECT e.ts, e.site, e.name, e.path, e.country, e.visitor_id, e.user_id, ${WHO} FROM cnr_events e LEFT JOIN people p ON p.id = e.user_id
      WHERE e.ts >= ?1 ORDER BY e.ts DESC LIMIT 150`, now - 60 * 60_000),
  ]);
  return { active, recent, now };
}
const countries = (db, r) => all(db, `SELECT COALESCE(e.country,'?') AS country, COUNT(DISTINCT e.visitor_id) AS visitors, COUNT(DISTINCT e.user_id) AS learners, SUM(e.name='page_view') AS views
  FROM cnr_events e WHERE ${where(r)} GROUP BY e.country ORDER BY visitors DESC LIMIT 40`);
const hours = (db, r) => all(db, `SELECT CAST(strftime('%w', e.ts/1000, 'unixepoch') AS INTEGER) AS weekday, CAST(strftime('%H', e.ts/1000, 'unixepoch') AS INTEGER) AS hour,
  SUM(e.name='page_view') AS views, COUNT(DISTINCT e.visitor_id) AS visitors FROM cnr_events e WHERE ${where(r)} GROUP BY weekday, hour`);
const retention = (db, r) => all(db, `WITH firsts AS (SELECT user_id, MIN(ts) AS first_ts FROM cnr_events WHERE user_id IS NOT NULL GROUP BY user_id)
  SELECT date(f.first_ts/1000,'unixepoch','weekday 1','-7 days') AS cohort_week, COUNT(DISTINCT f.user_id) AS learners,
    COUNT(DISTINCT CASE WHEN e.ts >= f.first_ts + ${DAY} AND e.ts < f.first_ts + 7*${DAY} THEN e.user_id END) AS back_in_week_1,
    COUNT(DISTINCT CASE WHEN e.ts >= f.first_ts + 7*${DAY} AND e.ts < f.first_ts + 14*${DAY} THEN e.user_id END) AS back_in_week_2,
    COUNT(DISTINCT CASE WHEN e.ts >= f.first_ts + 14*${DAY} AND e.ts < f.first_ts + 28*${DAY} THEN e.user_id END) AS back_in_weeks_3_4
  FROM firsts f JOIN cnr_events e ON e.user_id = f.user_id WHERE f.first_ts >= ${r.from} AND f.first_ts < ${r.to} GROUP BY cohort_week ORDER BY cohort_week`);

/* ---- ad-hoc SQL: a single SELECT, wrapped and capped ---- */
const FORBIDDEN = /\b(attach|detach|pragma|insert|update|delete|drop|alter|create|replace|vacuum|reindex|begin|commit|rollback|savepoint|release|sqlite_master|sqlite_schema|cnr_account_sessions|cnr_account_sso_grants|cnr_account_password_credentials|cnr_account_email_tokens|cnr_account_oauth_challenges|cnr_account_wechat_qr|cnr_account_wechat_attempts|token_hash|password_hash)\b/i;
async function query(db, sql) {
  if (typeof sql !== 'string' || sql.length > 8000) throw new Error('The query must be a string of at most 8000 characters.');
  const clean = sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/;+\s*$/, '');
  if (!clean || clean.includes(';')) throw new Error('One statement only, without semicolons.');
  if (!/^(with|select)\b/i.test(clean)) throw new Error('Only SELECT (or WITH ... SELECT) queries are allowed.');
  if (FORBIDDEN.test(clean)) throw new Error('That statement or table is not allowed here.');
  const withPeople = /\bpeople\b/i.test(clean) ? (/^with\b/i.test(clean) ? clean.replace(/^with\b/i, `WITH ${PEOPLE},`) : `WITH ${PEOPLE} ${clean}`) : clean;
  const started = Date.now();
  const result = await db.prepare(`SELECT * FROM (${withPeople}) LIMIT 1000`).all();
  return { rows: result.results, truncated: result.results.length >= 1000, ms: Date.now() - started, rows_read: result.meta?.rows_read };
}

/* ---- the hand-off that signs the dashboard in ---- */
async function connect(request, env, url) {
  const back = url.searchParams.get('return') || '';
  let target;
  try { target = new URL(back); } catch (_) { return json(400, { error: 'bad_return' }); }
  if (!origins(env).includes(target.origin)) return json(400, { error: 'return_not_allowed' });
  const current = await session(request, env.DB);
  const fail = reason => { target.hash = 'error=' + reason; return Response.redirect(target.href, 302); };
  if (!current) {
    // Not signed in on the site: open the site's sign-in dialog, then come back here.
    const again = new URL(url.pathname + url.search, siteOrigin(env));
    return Response.redirect(`${siteOrigin(env)}/?auth=login&next=${encodeURIComponent(again.pathname + again.search)}`, 302);
  }
  if (!isAdmin(current.user, env)) return fail('not_admin');
  const token = randomToken(), nowSec = Math.floor(Date.now() / 1000);
  await env.DB.prepare('INSERT INTO cnr_account_sso_grants (token_hash, kind, user_id, client_id, redirect_uri, scope, created_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)')
    .bind(await hash(token), 'token', current.user.id, CLIENT, target.origin, 'analytics', nowSec, nowSec + TOKEN_SECONDS).run();
  target.hash = 'token=' + token + '&expires=' + (nowSec + TOKEN_SECONDS);
  return Response.redirect(target.href, 302);
}

export async function handleAnalytics(request, env) {
  const url = new URL(request.url), name = url.pathname.slice(ANALYTICS_PREFIX.length);
  const headers = cors(request, env);
  if (request.method === 'OPTIONS') return new Response(null, { status: headers ? 204 : 403, headers: headers || {} });
  if (!headers) return json(403, { error: 'origin_not_allowed' });
  if (!analyticsConfigured(env)) return json(404, { error: 'not_found' }, headers);
  if (name === 'connect') return request.method === 'GET' ? connect(request, env, url) : json(405, { error: 'method_not_allowed' }, headers);
  const user = await bearerUser(request, env.DB);
  if (!user) return json(401, { error: 'sign_in_required' }, headers);
  if (!isAdmin(user, env)) return json(403, { error: 'not_admin' }, headers);
  const r = range(url), db = env.DB;
  try {
    if (request.method === 'POST') {
      if (name !== 'query') return json(405, { error: 'method_not_allowed' }, headers);
      let body; try { body = await limitedJSON(request, 16 * 1024); } catch (_) { return json(400, { error: 'invalid_json' }, headers); }
      try { return json(200, await query(db, body?.sql), headers); } catch (error) { return json(400, { error: 'query_failed', message: error.message }, headers); }
    }
    if (request.method !== 'GET') return json(405, { error: 'method_not_allowed' }, headers);
    switch (name) {
      case 'me': return json(200, { user, range: r }, headers);
      case 'summary': return json(200, await summary(db, r), headers);
      case 'daily': return json(200, await daily(db, r), headers);
      case 'events': return json(200, await events(db, r), headers);
      case 'pages': return json(200, await pages(db, r), headers);
      case 'learners': return json(200, await learners(db, r), headers);
      case 'learner': { const id = url.searchParams.get('id') || ''; if (!/^[0-9a-f-]{36}$/.test(id)) return json(400, { error: 'bad_id' }, headers); return json(200, await learner(db, r, id), headers); }
      case 'funnel': return json(200, await funnel(db, r), headers);
      case 'moodle': return json(200, await moodle(db, r), headers);
      case 'live': return json(200, await live(db), headers);
      case 'countries': return json(200, await countries(db, r), headers);
      case 'hours': return json(200, await hours(db, r), headers);
      case 'retention': return json(200, await retention(db, r), headers);
      case 'logout': { const m = /^Bearer\s+(\S+)$/.exec(request.headers.get('Authorization') || ''); if (m) await db.prepare('DELETE FROM cnr_account_sso_grants WHERE token_hash = ?1').bind(await hash(m[1])).run(); return json(200, { ok: true }, headers); }
      default: return json(404, { error: 'not_found' }, headers);
    }
  } catch (error) {
    return json(500, { error: 'query_error', message: String(error && error.message || error).slice(0, 300) }, headers);
  }
}
