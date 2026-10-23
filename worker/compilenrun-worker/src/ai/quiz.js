import { json, validPath, siteIsChinese, text } from '../lib/http.js';
import { humanCheck } from '../lib/turnstile.js';
import { getPage } from './page-content.js';

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
// On a Chinese site (env.SITE_LANG zh*) the reader-facing fields are written in Simplified Chinese.
const QUIZ_CHINESE = `\n- Write "question", "options" and "explanation" in Simplified Chinese (简体中文); keep code, identifiers and program output unchanged. "work" may be in any language.`;
const quizPrompt = (env) => QUIZ_PROMPT + (siteIsChinese(env) ? QUIZ_CHINESE : '');
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

export async function quiz(request, env, ctx, cors, ip) {
  const { success } = await env.ASK_LIMIT.limit({ key: ip });
  if (!success) return json(429, { error: text(env, 'Too many requests. Please wait a minute and try again.', '请求太频繁了，请稍等一分钟再试。') }, cors);
  let input;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: text(env, 'Invalid request.', '请求无效。') }, cors);
  }
  const { path } = input;
  if (!validPath(path)) return json(400, { error: text(env, 'Quizzes are only available on tutorial pages.', '测验只能在教程页面使用。') }, cors);
  const round = Math.abs(parseInt(input.round, 10) || 0) % QUIZ_ROUNDS;
  if (!(await humanCheck(input.turnstile, ip, env.TURNSTILE_SECRET))) {
    return json(403, { error: text(env, 'Could not verify that you are human. Please reload the page and try again.', '无法完成人机验证，请刷新页面后重试。'), turnstile: true }, cors);
  }
  const key = `quiz:v1:${round}:${path}`;
  const cached = await env.ASK_KV.get(key, 'json');
  if (cached) return json(200, cached, cors);

  const day = new Date().toISOString().slice(0, 10);
  const used = parseInt((await env.ASK_KV.get(`quizcount:${day}`)) || '0', 10);
  if (used >= parseInt(env.QUIZ_DAILY_LIMIT || '50', 10)) {
    return json(429, { error: text(env, "Today's new quizzes have run out. They reset at 00:00 UTC — please try again tomorrow.", '今天的新测验额度已用完，将在 UTC 时间 00:00 重置，请明天再试。') }, cors);
  }
  ctx.waitUntil(env.ASK_KV.put(`quizcount:${day}`, String(used + 1), { expirationTtl: 3 * 86400 }));
  const page = await getPage(path, ctx, env);
  if (!page) return json(404, { error: text(env, 'Could not read this page.', '无法读取本页内容。') }, cors);

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
                { role: 'user', content: `${quizPrompt(env)}${round ? `\n- This is quiz number ${round + 1} on this page: pick different parts of the tutorial than an obvious first quiz would.` : ''}\n\nTutorial: ${page.title}\n<tutorial>\n${page.text}\n</tutorial>` },
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
          await send({ error: text(env, 'Could not write a quiz for this page right now. Please try again later.', '暂时无法为本页生成测验，请稍后再试。') });
        } else {
          await send({ done: true, count: kept.length });
          if (kept.length >= 3) await env.ASK_KV.put(key, JSON.stringify({ title: page.title, round, questions: kept }), { expirationTtl: QUIZ_TTL });
        }
      } catch (e) {
        console.error('quiz error', e && e.message);
        await send({ error: text(env, 'Something went wrong while writing the quiz. Please try again.', '生成测验时出了点问题，请重试。') });
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
