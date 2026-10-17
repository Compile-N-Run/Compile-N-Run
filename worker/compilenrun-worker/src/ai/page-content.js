import { SITE } from '../lib/http.js';
const MAX_PAGE_CHARS = 14000;

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

export async function getPage(path, ctx) {
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
