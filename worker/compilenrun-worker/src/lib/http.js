// Each deployment (compilenrun-worker, echocool-worker) sets SITE_ORIGIN / SITE_NAME / SITE_LANG in its wrangler config.
// SITE is the fallback origin, kept for importers; per-request code must use siteOrigin(env).
export const SITE = 'https://www.compilenrun.com';
export const siteOrigin = (env) => String(env?.SITE_ORIGIN || SITE).replace(/\/+$/, '');
export const siteName = (env) => env?.SITE_NAME || 'Compile N Run';
export const siteLang = (env) => env?.SITE_LANG || 'en';
export const siteIsChinese = (env) => /^zh/i.test(siteLang(env));

export function json(status, body, cors) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...cors } });
}

export function corsFor(origin, env) {
  const ok = origin === siteOrigin(env) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return ok ? { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', vary: 'Origin' } : null;
}

export const validPath = (p) => typeof p === 'string' && /^\/(docs|blog)\/[\w\-./%]*$/.test(p) && !p.includes('..') && p.length <= 300;
