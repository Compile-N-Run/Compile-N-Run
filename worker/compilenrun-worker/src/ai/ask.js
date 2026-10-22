import { siteOrigin, siteName, siteIsChinese, json, validPath } from '../lib/http.js';
import { humanCheck } from '../lib/turnstile.js';
import { getPage } from './page-content.js';

// Small and cheap: ~8 Neurons for an answer with a full tutorial as context (Gemma 4 26B was ~50).
const MODEL = '@cf/ibm-granite/granite-4.0-h-micro';
const MAX_QUESTION = 1000;
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_CHARS = 2000; // per message
const MAX_ANSWER_TOKENS = 700;

// The system prompt names this deployment's site (env.SITE_NAME / SITE_ORIGIN) and its language (env.SITE_LANG).
export function systemPrompt(env) {
  const host = new URL(siteOrigin(env)).host.replace(/^www\./, '');
  const chinese = siteIsChinese(env);
  return `You are "Ask AI", the assistant on ${siteName(env)} (${host}), a free programming tutorial site for beginners${chinese ? ' written in Simplified Chinese' : ''}.
The reader is on the tutorial page below and is asking about it. Answer their question:
- Base the answer on the tutorial when it covers the question; you may add general programming knowledge when it helps.
- Be concise and beginner-friendly. Use Markdown, and fenced code blocks with a language tag for code.
- If the tutorial looks wrong or outdated on a point, say so and give the correct information.
- Do not make up links. Refer to sections of this page by their heading instead.
- Only help with programming, software and computer science topics; politely decline anything else.
${chinese ? '- Answer in Simplified Chinese (简体中文), unless the reader clearly writes in another language. Keep code, identifiers and commands as they are.' : '- Reply in the language the reader writes in.'}`;
}



export async function ask(request, env, ctx, cors, ip) {
  const { success } = await env.ASK_LIMIT.limit({ key: ip });
  if (!success) return json(429, { error: 'You are asking too quickly. Please wait a minute and try again.' }, cors);

  let input;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: 'Invalid request.' }, cors);
  }
  const path = typeof input.path === 'string' ? input.path : '';
  const question = typeof input.question === 'string' ? input.question.trim() : '';
  if (!validPath(path)) return json(400, { error: 'Ask AI only works on tutorial pages.' }, cors);
  if (!question) return json(400, { error: 'Please type a question.' }, cors);
  if (question.length > MAX_QUESTION) return json(400, { error: `Please keep your question under ${MAX_QUESTION} characters.` }, cors);
  const history = (Array.isArray(input.history) ? input.history : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_CHARS) }));

  if (!(await humanCheck(input.turnstile, ip, env.TURNSTILE_SECRET))) {
    return json(403, { error: 'Could not verify that you are human. Please reload the page and try again.', turnstile: true }, cors);
  }

  // Site-wide daily cap so the free Workers AI allocation is not exhausted (or billed) by a few heavy users.
  const day = new Date().toISOString().slice(0, 10);
  const used = parseInt((await env.ASK_KV.get(`count:${day}`)) || '0', 10);
  if (used >= parseInt(env.DAILY_LIMIT || '200', 10)) {
    return json(429, { error: "Ask AI has reached today's limit. It resets at 00:00 UTC — please try again tomorrow." }, cors);
  }
  ctx.waitUntil(env.ASK_KV.put(`count:${day}`, String(used + 1), { expirationTtl: 3 * 86400 }));

  const page = await getPage(path, ctx, env);
  if (!page) return json(404, { error: 'Could not read this page.' }, cors);

  const messages = [
    { role: 'system', content: `${systemPrompt(env)}\n\nPage: ${page.title}\nURL: ${siteOrigin(env)}${path}\n\n<tutorial>\n${page.text}\n</tutorial>` },
    ...history,
    { role: 'user', content: question },
  ];
  try {
    const stream = await env.AI.run(MODEL, {
      messages,
      stream: true,
      max_tokens: MAX_ANSWER_TOKENS,
      temperature: 0.3,
      chat_template_kwargs: { enable_thinking: false },
    });
    return new Response(stream, { headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-store', ...cors } });
  } catch (e) {
    console.error('AI error', e && e.message);
    const quota = /neuron|quota|limit|429|4006/i.test(String(e && e.message));
    return json(quota ? 429 : 502, { error: quota ? "Ask AI has reached today's limit. Please try again tomorrow." : 'The AI service is unavailable right now. Please try again later.' }, cors);
  }
}
