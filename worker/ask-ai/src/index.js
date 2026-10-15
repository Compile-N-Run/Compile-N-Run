// Ask AI: answers a reader's question about the Compile N Run page they are on, using Workers AI.
// POST /api/ask {path, question, history} -> text/event-stream (OpenAI-style chat.completion.chunk events).

const SITE = 'https://www.compilenrun.com';
const MODEL = '@cf/google/gemma-4-26b-a4b-it';
const MAX_QUESTION = 1000;
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_CHARS = 2000; // per message
const MAX_PAGE_CHARS = 14000; // ~3.5k tokens of tutorial text
const MAX_ANSWER_TOKENS = 700;

const SYSTEM = `You are "Ask AI", the assistant on Compile N Run (compilenrun.com), a free programming tutorial site for beginners.
The reader is on the tutorial page below and is asking about it. Answer their question:
- Base the answer on the tutorial when it covers the question; you may add general programming knowledge when it helps.
- Be concise and beginner-friendly. Use Markdown, and fenced code blocks with a language tag for code.
- If the tutorial looks wrong or outdated on a point, say so and give the correct information.
- Do not make up links. Refer to sections of this page by their heading instead.
- Only help with programming, software and computer science topics; politely decline anything else.
- Reply in the language the reader writes in.`;

function json(status, body, cors) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...cors } });
}

function corsFor(origin) {
  const ok = origin === SITE || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return ok ? { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', vary: 'Origin' } : null;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", '#34': '"' };
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

// Turn the article HTML into Markdown-ish text the model can read: headings, paragraphs, lists and code blocks.
export function pageText(html) {
  const start = html.search(/data-pagefind-body[^>]*>/);
  if (start < 0) return null;
  let body = html.slice(start).replace(/^[^>]*>/, '');
  const end = body.search(/<footer|<\/article>|<\/main>/);
  if (end >= 0) body = body.slice(0, end);
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/\s*\|\s*Compile N Run\s*$/, '');
  const text = body
    .replace(/<(script|style|svg|button)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<a\b[^>]*hash-link[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<span class="?cnr-code-lang[\s\S]*?<\/span>/gi, '')
    .replace(/<pre\b[^>]*class="?[^>]*language-([\w+#-]+)[^>]*>/gi, '\n```$1\n')
    .replace(/<pre\b[^>]*>/gi, '\n```\n')
    .replace(/<\/pre>/gi, '\n```\n')
    .replace(/<h([1-6])\b[^>]*>/gi, (m, n) => '\n\n' + '#'.repeat(+n) + ' ')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<(br|hr)\b[^>]*>/gi, '\n')
    .replace(/<\/?(p|div|h[1-6]|ul|ol|table|tr|blockquote|header|section|details|summary)\b[^>]*>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ' | ')
    .replace(/<code\b[^>]*>/gi, (m) => (m.includes('codeBlockLines') ? '' : '`'))
    .replace(/<\/code>/gi, '`')
    .replace(/<[^>]+>/g, '')
    .replace(/`\n```/g, '\n```');
  const clean = decode(text).replace(/\u200b/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n- *\n+/g, '\n- ').replace(/\n{3,}/g, '\n\n').trim();
  return { title, text: clean.length > MAX_PAGE_CHARS ? clean.slice(0, MAX_PAGE_CHARS) + '\n\n[…page truncated…]' : clean };
}

async function getPage(path, ctx) {
  const cache = caches.default;
  const key = new Request(`${SITE}/__ask_ai_page${path}`);
  const hit = await cache.match(key);
  if (hit) return hit.json();
  const res = await fetch(SITE + path, { headers: { 'user-agent': 'CompileNRun-AskAI' }, cf: { cacheTtl: 3600 } });
  if (!res.ok) return null;
  const page = pageText(await res.text());
  if (!page || !page.text) return null;
  ctx.waitUntil(cache.put(key, new Response(JSON.stringify(page), { headers: { 'content-type': 'application/json', 'cache-control': 'max-age=86400' } })));
  return page;
}

export default {
  async fetch(request, env, ctx) {
    const cors = corsFor(request.headers.get('Origin') || '');
    if (request.method === 'OPTIONS') return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
    if (request.method !== 'POST') return json(405, { error: 'Use POST.' }, cors || {});
    if (!cors) return json(403, { error: 'Not allowed from this origin.' }, {});

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
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
    if (!/^\/(docs|blog)\/[\w\-./%]*$/.test(path) || path.includes('..') || path.length > 300) return json(400, { error: 'Ask AI only works on tutorial pages.' }, cors);
    if (!question) return json(400, { error: 'Please type a question.' }, cors);
    if (question.length > MAX_QUESTION) return json(400, { error: `Please keep your question under ${MAX_QUESTION} characters.` }, cors);
    const history = (Array.isArray(input.history) ? input.history : [])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_HISTORY_TURNS)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_CHARS) }));

    // Site-wide daily cap so the free Workers AI allocation is not exhausted (or billed) by a few heavy users.
    const day = new Date().toISOString().slice(0, 10);
    const used = parseInt((await env.ASK_KV.get(`count:${day}`)) || '0', 10);
    if (used >= parseInt(env.DAILY_LIMIT || '200', 10)) {
      return json(429, { error: "Ask AI has reached today's limit. It resets at 00:00 UTC — please try again tomorrow." }, cors);
    }
    ctx.waitUntil(env.ASK_KV.put(`count:${day}`, String(used + 1), { expirationTtl: 3 * 86400 }));

    const page = await getPage(path, ctx);
    if (!page) return json(404, { error: 'Could not read this page.' }, cors);

    const messages = [
      { role: 'system', content: `${SYSTEM}\n\nPage: ${page.title}\nURL: ${SITE}${path}\n\n<tutorial>\n${page.text}\n</tutorial>` },
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
  },
};
