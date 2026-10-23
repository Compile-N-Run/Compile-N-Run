import { json, validPath, text } from './lib/http.js';
import { getPage } from './ai/page-content.js';
const MAX_COMMENT = 1000;

async function voterId(ip, salt) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}|${ip}`));
  return [...new Uint8Array(digest).slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function feedback(request, env, ctx, cors, ip) {
  const { success } = await env.FEEDBACK_LIMIT.limit({ key: ip });
  if (!success) return json(429, { error: text(env, 'Too many votes. Please wait a minute.', '投票太频繁了，请稍等一分钟。') }, cors);
  let input;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: text(env, 'Invalid request.', '请求无效。') }, cors);
  }
  const { path, vote } = input;
  if (!validPath(path) || !path.startsWith('/docs/')) return json(400, { error: text(env, 'Unknown page.', '未知页面。') }, cors);
  if (vote !== 1 && vote !== -1) return json(400, { error: text(env, 'Invalid vote.', '投票无效。') }, cors);
  const comment = typeof input.comment === 'string' ? input.comment.trim().slice(0, MAX_COMMENT) || null : null;
  // Only real pages get rows (the page text is cached for Ask AI anyway).
  if (!(await getPage(path, ctx, env))) return json(404, { error: text(env, 'Unknown page.', '未知页面。') }, cors);
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO votes (path, voter, vote, comment, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?5)
     ON CONFLICT (path, voter) DO UPDATE SET vote = excluded.vote, comment = COALESCE(excluded.comment, votes.comment), updated_at = excluded.updated_at`
  )
    .bind(path, await voterId(ip, env.IP_SALT || ''), vote, comment, now)
    .run();
  return json(200, { ok: true }, cors);
}
