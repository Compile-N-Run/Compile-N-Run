// Ask AI: answers a reader's question about the Compile N Run page they are on, using Workers AI.
// POST /api/ask {path, question, history, turnstile} -> text/event-stream (OpenAI-style chat.completion.chunk events).
// Also takes the "Was this page helpful?" votes:
// POST /api/feedback {path, vote: 1 | -1, comment?} -> {ok: true} (stored in the D1 database, see schema.sql).
// POST /api/quiz {path, round, turnstile, stream?} -> cached: {title, round, questions: [{question, code, options[4], answer, explanation}]};
//   new, with stream: application/x-ndjson lines {question} ... then {done, count} or {error} (without: one JSON answer)

const SITE = 'https://www.compilenrun.com';
// Small and cheap: ~8 Neurons for an answer with a full tutorial as context (Gemma 4 26B was ~50).
const MODEL = '@cf/ibm-granite/granite-4.0-h-micro';
const MAX_QUESTION = 1000;
const MAX_HISTORY_TURNS = 6;
const MAX_HISTORY_CHARS = 2000; // per message
const MAX_PAGE_CHARS = 14000; // ~3.5k tokens of tutorial text
const MAX_ANSWER_TOKENS = 700;
const MAX_COMMENT = 1000;

const SYSTEM = `You are "Ask AI", the assistant on Compile N Run (compilenrun.com), a free programming tutorial site for beginners.
The reader is on the tutorial page below and is asking about it. Answer their question:
- Base the answer on the tutorial when it covers the question; you may add general programming knowledge when it helps.
- Be concise and beginner-friendly. Use Markdown, and fenced code blocks with a language tag for code.
- If the tutorial looks wrong or outdated on a point, say so and give the correct information.
- Do not make up links. Refer to sections of this page by their heading instead.
- Only help with programming, software and computer science topics; politely decline anything else.
- Reply in the language the reader writes in.`;

// "Quiz me": one call writes a whole quiz as JSON; the page checks the answers. Quizzes are cached per page.
// Small models (Granite micro, Llama 8B) marked wrong answers as correct in tests. Writing a worked solution
// before the answer letter, plus a second pass that solves each question independently, catches the rest.
// Qwen3 30B-A3B does this as well as Gemma 4 26B but about 6x faster (~7 s instead of ~45 s for a new quiz),
// at ~50 Neurons.
const QUIZ_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8';
const QUIZ_QUESTIONS = 5; // asked for; questions the check pass disagrees with are dropped
const QUIZ_ROUNDS = 3; // different cached quizzes per page, for "New quiz"
const QUIZ_TTL = 30 * 86400;
const QUIZ_PROMPT = `Write a ${QUIZ_QUESTIONS}-question multiple-choice quiz that checks a beginner understood the tutorial below.
Rules:
- Each question has exactly 4 options (A, B, C, D) and exactly one correct option. Vary which letter is correct.
- Mix concept questions with "what does this code print/do" questions. Put code in the "code" field ("" if none). Keep code short.
- Base everything strictly on the tutorial.
- In "work", reason step by step: for code questions trace the code line by line and write the exact output; check every option.
- Then write "explanation" (1-2 sentences for the reader) and finally "answer", the letter of the correct option.`;
const QUIZ_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          code: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          work: { type: 'string' },
          explanation: { type: 'string' },
          answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
        },
        required: ['question', 'code', 'options', 'work', 'explanation', 'answer'],
      },
    },
  },
  required: ['questions'],
};

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

// Turnstile tokens are single-use; the widget fetches a fresh one for every question.
async function humanCheck(token, ip, secret) {
  if (typeof token !== 'string' || !token || token.length > 2048) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const out = await res.json().catch(() => ({}));
  return out.success === true;
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

const validPath = (p) => typeof p === 'string' && /^\/(docs|blog)\/[\w\-./%]*$/.test(p) && !p.includes('..') && p.length <= 300;

async function voterId(ip, salt) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}|${ip}`));
  return [...new Uint8Array(digest).slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Keep only well-formed questions; drop the model's working and any "A) " it put in front of options.
function cleanQuiz(raw) {
  let data = raw;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data.replace(/^```(?:json)?\s*|\s*```$/g, ''));
    } catch {
      return [];
    }
  }
  const text = (v) => (typeof v === 'string' ? (v.includes('\n') ? v : v.replace(/\\n/g, '\n')).trim() : '');
  // Models sometimes put one stray space before lines of code; real indentation comes in steps of 2 or 4.
  const code = (v) => {
    const t = text(v);
    const lines = t.split('\n');
    return lines.slice(1).some((l) => /^ \S/.test(l)) ? lines.map((l) => l.replace(/^ */, (m) => (m.length % 2 ? m.slice(1) : m))).join('\n') : t;
  };
  return (Array.isArray(data && data.questions) ? data.questions : [])
    .map((q) => ({
      question: text(q && q.question),
      code: code(q && q.code),
      options: Array.isArray(q && q.options) ? q.options.map((o) => text(o).replace(/^(?:\(?[A-D][).:][\s\u00a0]+)+/, '')) : [],
      answer: 'ABCD'.indexOf(q && q.answer),
      explanation: text(q && q.explanation),
    }))
    .filter((q) => q.question && q.options.length === 4 && q.options.every(Boolean) && q.answer >= 0 && new Set(q.options).size === 4)
    .slice(0, QUIZ_QUESTIONS);
}

// Qwen3 on Workers AI puts JSON-mode output in message.reasoning and leaves content null.
const aiText = (out) => {
  const msg = out.choices && out.choices[0] && out.choices[0].message;
  return out.response ?? (msg && (msg.content ?? msg.reasoning));
};

// A second pass answers each question without seeing the key, as soon as it is written; questions where the
// solver disagrees with the key are dropped.
const SOLVE_SCHEMA = {
  type: 'object',
  properties: { work: { type: 'string' }, answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] } },
  required: ['work', 'answer'],
};
async function solves(env, page, q) {
  try {
    const out = await env.AI.run(env.QUIZ_MODEL || QUIZ_MODEL, {
      messages: [
        { role: 'system', content: 'You are an expert programmer taking a quiz. Reply with JSON only.' },
        {
          role: 'user',
          content: `Answer this question about the tutorial below. First reason step by step in "work" (trace any code line by line and write its exact output), then give the letter of the single correct option in "answer".\n\nTutorial: ${page.title}\n<tutorial>\n${page.text}\n</tutorial>\n\nQuestion: ${q.question}${q.code ? `\n${q.code}` : ''}\n${q.options.map((o, j) => `${'ABCD'[j]}) ${o}`).join('\n')}`,
        },
      ],
      response_format: { type: 'json_schema', json_schema: SOLVE_SCHEMA },
      max_tokens: 1200,
      temperature: 0,
      chat_template_kwargs: { enable_thinking: false },
    });
    let solved = aiText(out);
    if (typeof solved === 'string') solved = JSON.parse(solved.replace(/^```(?:json)?\s*|\s*```$/g, ''));
    return 'ABCD'.indexOf(solved && solved.answer) === q.answer;
  } catch {
    return false;
  }
}

async function quiz(request, env, ctx, cors, ip) {
  const { success } = await env.ASK_LIMIT.limit({ key: ip });
  if (!success) return json(429, { error: 'Too many requests. Please wait a minute and try again.' }, cors);
  let input;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: 'Invalid request.' }, cors);
  }
  const { path } = input;
  if (!validPath(path)) return json(400, { error: 'Quizzes are only available on tutorial pages.' }, cors);
  const round = Math.abs(parseInt(input.round, 10) || 0) % QUIZ_ROUNDS;
  if (!(await humanCheck(input.turnstile, ip, env.TURNSTILE_SECRET))) {
    return json(403, { error: 'Could not verify that you are human. Please reload the page and try again.', turnstile: true }, cors);
  }
  const key = `quiz:v1:${round}:${path}`;
  const cached = await env.ASK_KV.get(key, 'json');
  if (cached) return json(200, cached, cors);

  const day = new Date().toISOString().slice(0, 10);
  const used = parseInt((await env.ASK_KV.get(`quizcount:${day}`)) || '0', 10);
  if (used >= parseInt(env.QUIZ_DAILY_LIMIT || '50', 10)) {
    return json(429, { error: "Today's new quizzes have run out. They reset at 00:00 UTC — please try again tomorrow." }, cors);
  }
  ctx.waitUntil(env.ASK_KV.put(`quizcount:${day}`, String(used + 1), { expirationTtl: 3 * 86400 }));
  const page = await getPage(path, ctx);
  if (!page) return json(404, { error: 'Could not read this page.' }, cors);

  // New quiz: stream it. Each question is checked as soon as the model has written it, and sent on (in order)
  // when it passes, so the reader starts on question 1 while the rest are still being written.
  const enc = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const send = (obj) => writer.write(enc.encode(JSON.stringify(obj) + '\n')).catch(() => {});
  ctx.waitUntil(
    (async () => {
      const kept = [];
      try {
        for (let attempt = 0; attempt < 2 && kept.length < 3; attempt++) {
          let chain = Promise.resolve();
          const split = questionSplitter((raw) => {
            let q = null;
            try {
              q = cleanQuiz({ questions: [JSON.parse(raw)] })[0];
            } catch {}
            if (!q) return;
            const checked = solves(env, page, q);
            chain = chain.then(async () => {
              if ((await checked) && kept.length < QUIZ_QUESTIONS && !kept.some((k) => k.question === q.question)) {
                kept.push(q);
                await send({ question: q });
              }
            });
          });
          try {
            const stream = await env.AI.run(env.QUIZ_MODEL || QUIZ_MODEL, {
              messages: [
                { role: 'system', content: 'You write accurate programming quizzes. Reply with JSON only.' },
                { role: 'user', content: `${QUIZ_PROMPT}${round ? `\n- This is quiz number ${round + 1} on this page: pick different parts of the tutorial than an obvious first quiz would.` : ''}\n\nTutorial: ${page.title}\n<tutorial>\n${page.text}\n</tutorial>` },
              ],
              response_format: { type: 'json_schema', json_schema: QUIZ_SCHEMA },
              max_tokens: 3000,
              temperature: attempt ? 0.2 : 0.4,
              stream: true,
              chat_template_kwargs: { enable_thinking: false },
            });
            await streamText(stream, split);
          } catch (e) {
            console.error('quiz AI error', e && e.message);
          }
          await chain;
        }
        if (!kept.length) {
          await send({ error: 'Could not write a quiz for this page right now. Please try again later.' });
        } else {
          await send({ done: true, count: kept.length });
          if (kept.length >= 3) await env.ASK_KV.put(key, JSON.stringify({ title: page.title, round, questions: kept }), { expirationTtl: QUIZ_TTL });
        }
      } catch (e) {
        console.error('quiz error', e && e.message);
        await send({ error: 'Something went wrong while writing the quiz. Please try again.' });
      } finally {
        await writer.close().catch(() => {});
      }
    })()
  );
  if (input.stream) return new Response(readable, { headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store', ...cors } });
  // Older pages ask without "stream": collect the streamed lines into one JSON answer.
  const lines = (await new Response(readable).text()).split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const questions = lines.filter((l) => l.question).map((l) => l.question);
  const err = lines.find((l) => l.error);
  if (!questions.length) return json(502, { error: (err && err.error) || 'Could not write a quiz for this page right now. Please try again later.' }, cors);
  return json(200, { title: page.title, round, questions }, cors);
}

// Text deltas from a streamed Workers AI response (SSE: "data: {...}" lines).
async function streamText(stream, onText) {
  const reader = stream.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const j = JSON.parse(data);
        const d = j.choices && j.choices[0] && j.choices[0].delta;
        // Prefer the delta text: Workers AI also sends it as "response", but JSON-parsed, so " true" arrives as true
        // and " 2" as 2, losing the space.
        const t = (d && (d.content ?? d.reasoning)) ?? (typeof j.response === 'string' ? j.response : null);
        if (t) onText(t);
      } catch {}
    }
  }
}

// Feeds streamed JSON text through and calls onObject with each complete {"questions": [ {...} ]} item.
export function questionSplitter(onObject) {
  let buf = '';
  let pos = 0;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let start = -1;
  return (chunk) => {
    buf += chunk;
    for (; pos < buf.length; pos++) {
      const c = buf[pos];
      if (inString) {
        if (escaped) escaped = false;
        else if (c === '\\') escaped = true;
        else if (c === '"') inString = false;
      } else if (c === '"') inString = true;
      else if (c === '{' || c === '[') {
        depth++;
        if (c === '{' && depth === 3) start = pos;
      } else if (c === '}' || c === ']') {
        if (c === '}' && depth === 3 && start >= 0) {
          onObject(buf.slice(start, pos + 1));
          start = -1;
        }
        depth--;
      }
    }
  };
}

async function feedback(request, env, ctx, cors, ip) {
  const { success } = await env.FEEDBACK_LIMIT.limit({ key: ip });
  if (!success) return json(429, { error: 'Too many votes. Please wait a minute.' }, cors);
  let input;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: 'Invalid request.' }, cors);
  }
  const { path, vote } = input;
  if (!validPath(path) || !path.startsWith('/docs/')) return json(400, { error: 'Unknown page.' }, cors);
  if (vote !== 1 && vote !== -1) return json(400, { error: 'Invalid vote.' }, cors);
  const comment = typeof input.comment === 'string' ? input.comment.trim().slice(0, MAX_COMMENT) || null : null;
  // Only real pages get rows (the page text is cached for Ask AI anyway).
  if (!(await getPage(path, ctx))) return json(404, { error: 'Unknown page.' }, cors);
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO votes (path, voter, vote, comment, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?5)
     ON CONFLICT (path, voter) DO UPDATE SET vote = excluded.vote, comment = COALESCE(excluded.comment, votes.comment), updated_at = excluded.updated_at`
  )
    .bind(path, await voterId(ip, env.IP_SALT || ''), vote, comment, now)
    .run();
  return json(200, { ok: true }, cors);
}

export default {
  async fetch(request, env, ctx) {
    const cors = corsFor(request.headers.get('Origin') || '');
    if (request.method === 'OPTIONS') return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
    if (request.method !== 'POST') return json(405, { error: 'Use POST.' }, cors || {});
    if (!cors) return json(403, { error: 'Not allowed from this origin.' }, {});

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const route = new URL(request.url).pathname;
    if (route === '/api/feedback') return feedback(request, env, ctx, cors, ip);
    if (route === '/api/quiz') return quiz(request, env, ctx, cors, ip);
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
