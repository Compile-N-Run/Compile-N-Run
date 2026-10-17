export const SITE = 'https://www.compilenrun.com';

export function json(status, body, cors) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...cors } });
}

export function corsFor(origin) {
  const ok = origin === SITE || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return ok ? { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', vary: 'Origin' } : null;
}

export const validPath = (p) => typeof p === 'string' && /^\/(docs|blog)\/[\w\-./%]*$/.test(p) && !p.includes('..') && p.length <= 300;
