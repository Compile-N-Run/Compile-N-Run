/* Run with Node's test runner and Playwright installed in an isolated environment:
 * CNR_PLAYWRIGHT_MODULE=/path/to/playwright node --test tests/learning.spec.js
 * No dependency or browser artifacts are written into this repository. */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.CNR_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const PAGE = '/docs/language/css/a/';
const OTHER = '/docs/language/css/b/';
const COURSE = 'language/css';
const now = () => Date.now() - 1000;
const progress = () => ({ v: 1, done: {}, tuts: { [COURSE]: { label: 'CSS', url: '/docs/category/css/', done: 0, total: 2, last: { path: PAGE, title: 'Lesson A' }, t: now() } } });
const learning = () => ({ v: 1, lessons: {} });
const playground = () => ({ version: 1, drafts: {} });
const lesson = (note = '') => ({ title: 'Lesson A', course: COURSE, visitedAt: now(), updatedAt: now(), practice: {}, note: { text: note, updatedAt: now() } });
const draft = (html) => ({ html, css: '', js: '', title: 'A draft', path: PAGE, course: COURSE, exerciseId: 'layout', updatedAt: new Date(now()).toISOString() });
function backup(overrides = {}) { return { format: 'cnr-learning-backup', version: 1, exportedAt: new Date().toISOString(), progress: progress(), learning: learning(), playground: playground(), ...overrides }; }
let server, browser, origin;
const tools = fs.readFileSync(path.join(root, 'hugo/layouts/partials/learning-tools.html'), 'utf8');
const dashboard = fs.readFileSync(path.join(root, 'hugo/layouts/learning/single.html'), 'utf8').replace(/{{[^}]*}}/g, '');
function html(route) {
  const isDashboard = route === '/learn/';
  const body = isDashboard ? dashboard : `<nav data-doc-sidebar data-tut="${COURSE}" data-tut-label="CSS" data-tut-url="/docs/category/css/"><ul class="theme-doc-sidebar-menu"><li class="theme-doc-sidebar-item-link"><a class="menu__link" href="${PAGE}">Lesson A</a></li><li class="theme-doc-sidebar-item-link"><a class="menu__link" href="${OTHER}">Lesson B</a></li></ul></nav><main><h1>Lesson A</h1>${tools}</main>`;
  return `<!doctype html><html data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lesson A | Compile N Run</title><style>*{box-sizing:border-box}body{margin:0;padding:16px;font:16px/1.5 system-ui}.container,main{max-width:1100px;margin:auto}nav{max-width:400px}button,input,textarea{font:inherit}:root{--ifm-color-primary:#245ab9;--ifm-color-primary-dark:#17418e;--ifm-background-surface-color:#fff;--ifm-color-emphasis-300:#aab6c8;--ifm-font-family-base:system-ui}</style><link rel="stylesheet" href="/learning.css"></head><body>${body}<script>window.CNR_PAGE=${JSON.stringify(isDashboard ? {} : { path: PAGE, title: 'Lesson A', course: COURSE, courseLabel: 'CSS', courseUrl: '/docs/category/css/' })}</script><script src="/learning.js" defer></script></body></html>`;
}
before(async () => {
  server = http.createServer((req, res) => {
    if (req.url === '/learning.js' || req.url === '/learning.css') {
      const ext = req.url.endsWith('.js') ? 'js' : 'css'; res.setHeader('Content-Type', ext === 'js' ? 'text/javascript' : 'text/css');
      return res.end(fs.readFileSync(path.join(root, `hugo/assets/${ext}/learning.${ext}`)));
    }
    if (req.url === '/learning-catalog.json') { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ v: 1, courses: [{ id: COURSE, label: 'CSS', url: '/docs/category/css/', lessons: [{ path: PAGE, title: 'Lesson A' }, { path: OTHER, title: 'Lesson B' }] }] })); }
    res.setHeader('Content-Type', 'text/html'); res.end(html(req.url));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
});
after(async () => { await browser.close(); await new Promise(resolve => server.close(resolve)); });
async function setup(t, seed = {}, route = PAGE) {
  const context = await browser.newContext(); t.after(() => context.close());
  await context.addInitScript(data => { if (!localStorage.getItem('__test_seed__')) { localStorage.setItem('__test_seed__', 'yes'); Object.entries(data).forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value))); } }, seed);
  const page = await context.newPage(); await page.goto(origin + route); await page.waitForFunction(() => !!window.CNRLearning); return { page, context };
}
async function snapshot(page) { return page.evaluate(() => window.CNRLearning.getSnapshot()); }

test('legacy read marks survive; visiting and plain practice never imply a passed check', async t => {
  const p = progress(); p.done[OTHER] = now(); p.tuts[COURSE].done = 1;
  const { page } = await setup(t, { cnr_progress: p });
  assert((await snapshot(page)).progress.done[OTHER]); assert.equal((await snapshot(page)).progress.done[PAGE], undefined);
  await page.locator('[data-mark-done]').click(); assert((await snapshot(page)).progress.done[PAGE]);
  await page.evaluate(p => window.dispatchEvent(new CustomEvent('cnr:practice', { detail: { path: p, exerciseId: 'layout' } })), PAGE);
  let s = await snapshot(page); assert.equal(s.learning.lessons[PAGE].practice.layout.passedAt, 0);
  await page.evaluate(p => window.dispatchEvent(new CustomEvent('cnr:practice', { detail: { path: p, exerciseId: 'layout', passed: false } })), PAGE);
  s = await snapshot(page); assert.equal(s.learning.lessons[PAGE].practice.layout.lastResult, 'not-passed'); assert.equal(s.learning.lessons[PAGE].practice.layout.passedAt, 0);
  await page.evaluate(p => window.dispatchEvent(new CustomEvent('cnr:practice', { detail: { path: p, exerciseId: 'layout', passed: true } })), PAGE);
  assert((await snapshot(page)).learning.lessons[PAGE].practice.layout.passedAt);
  await page.locator('[data-mark-done]').click(); assert.equal((await snapshot(page)).progress.done[PAGE], undefined); assert((await snapshot(page)).learning.lessons[PAGE].practice.layout.passedAt);
  assert.match(await page.locator('[data-learning-sidebar]').innerText(), /1 of 2 pages read/);
});

test('bookmarks and plain-text notes persist and cross-tab updates preserve unsaved text', async t => {
  const { page, context } = await setup(t);
  await page.locator('[data-learning-bookmark]').click();
  await page.getByText('Your lesson notes', { exact: true }).click();
  await page.locator('[data-learning-note]').fill('<img src=x onerror="window.pwned=1"> My note');
  await page.locator('[data-learning-save-note]').click();
  await page.reload(); assert.equal(await page.locator('[data-learning-bookmark]').getAttribute('aria-pressed'), 'true');
  await page.getByText('Your lesson notes', { exact: true }).click(); await page.locator('[data-learning-note]').fill('Unsaved local wording');
  const other = await context.newPage(); await other.goto(origin + PAGE); await other.waitForFunction(() => !!window.CNRLearning);
  await other.evaluate(p => window.CNRLearning.saveNote(p, 'Saved in the other tab'), PAGE);
  await page.waitForFunction(() => !document.querySelector('[data-learning-note-conflict]').hidden);
  assert.equal(await page.locator('[data-learning-note]').inputValue(), 'Unsaved local wording');
  await page.locator('[data-learning-reload-note]').click(); assert.equal(await page.locator('[data-learning-note]').inputValue(), 'Saved in the other tab');
  await other.goto(origin + '/learn/'); assert.equal(await other.locator('[data-learning-notes] img').count(), 0); assert.equal(await other.evaluate(() => window.pwned), undefined);
});

test('backup preview is read-only; merge preserves read marks, notes and conflicting draft copies', async t => {
  const p = progress(); p.done[PAGE] = now(); const l = learning(); l.lessons[PAGE] = lesson('Existing note'); const d = playground(); d.drafts.workspace = draft('<p>Original</p>');
  const { page } = await setup(t, { cnr_progress: p, cnr_learning_v1: l, cnr_playground_v1: d }, '/learn/');
  const incoming = backup(); incoming.progress.done[OTHER] = now(); incoming.learning.lessons[PAGE] = lesson('<script>window.pwned=1</script>Imported note'); incoming.playground.drafts.workspace = draft('<p>Imported</p>');
  const before = await page.evaluate(() => localStorage.getItem('cnr_learning_v1'));
  await page.locator('[data-learning-import-file]').setInputFiles({ name: 'learning.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(incoming)) });
  await page.waitForFunction(() => !document.querySelector('[data-learning-import-preview]').hidden);
  assert.equal(await page.evaluate(() => localStorage.getItem('cnr_learning_v1')), before);
  await page.locator('[data-learning-import-apply]').click(); const s = await snapshot(page);
  assert(s.progress.done[PAGE] && s.progress.done[OTHER]); assert.match(s.learning.lessons[PAGE].note.text, /Existing note/); assert.match(s.learning.lessons[PAGE].note.text, /Imported note/);
  assert.equal(Object.keys(s.playground.drafts).length, 2); assert.equal(s.playground.drafts.workspace.html, '<p>Original</p>');
  await page.locator('[data-learning-notes] summary').click(); assert.equal(await page.locator('[data-learning-notes] script').count(), 0); assert.equal(await page.evaluate(() => window.pwned), undefined);
  const exported = JSON.parse(await page.evaluate(() => window.CNRLearning.exportBackup())); assert.equal(exported.version, 1); assert.equal(exported.format, 'cnr-learning-backup'); assert.equal(exported.settings, undefined);
  await page.evaluate(raw => { window.CNRLearning.prepareImport(raw); window.CNRLearning.applyImport(); }, JSON.stringify(incoming)); assert.equal(Object.keys((await snapshot(page)).playground.drafts).length, 2);
});

test('malformed, oversized, unsafe-path and prototype-pollution backups change nothing', async t => {
  const { page } = await setup(t, { cnr_progress: progress() }, '/learn/'); const before = await page.evaluate(() => localStorage.getItem('cnr_progress'));
  const badURL = backup(); badURL.progress.done['//evil.example/'] = now();
  const invalid = [ '{invalid', JSON.stringify({ ...backup(), version: 99 }), JSON.stringify(badURL), '{"__proto__":{"polluted":true}}', 'x'.repeat(6 * 1024 * 1024 + 1) ];
  for (const raw of invalid) { assert(await page.evaluate(raw => { try { window.CNRLearning.prepareImport(raw); return false; } catch { return true; } }, raw)); }
  assert.equal(await page.evaluate(() => localStorage.getItem('cnr_progress')), before); assert.equal(await page.evaluate(() => ({}).polluted), undefined);
});

test('partial quota failure rolls an import back without losing originals', async t => {
  const l = learning(); l.lessons[PAGE] = lesson('Keep this note');
  const { page } = await setup(t, { cnr_progress: progress(), cnr_learning_v1: l, cnr_playground_v1: playground() }, '/learn/');
  const original = await page.evaluate(() => ['cnr_progress', 'cnr_learning_v1', 'cnr_playground_v1'].map(k => localStorage.getItem(k)));
  const incoming = backup(); incoming.progress.done[OTHER] = now();
  await page.evaluate(raw => {
    window.CNRLearning.prepareImport(raw); const originalSet = Storage.prototype.setItem; let failed = false;
    Storage.prototype.setItem = function (key, value) { if (key === 'cnr_learning_v1' && !failed) { failed = true; throw new DOMException('Full', 'QuotaExceededError'); } return originalSet.call(this, key, value); };
  }, JSON.stringify(incoming));
  assert(await page.evaluate(() => { try { window.CNRLearning.applyImport(); return false; } catch { return true; } }));
  assert.deepEqual(await page.evaluate(() => ['cnr_progress', 'cnr_learning_v1', 'cnr_playground_v1'].map(k => localStorage.getItem(k))), original);
  assert.equal(await page.evaluate(() => localStorage.getItem('cnr_learning_import_journal_v1')), null);
});

test('failed local saves stay available for export and honestly report session-only storage', async t => {
  const { page } = await setup(t);
  await page.evaluate(() => { Storage.prototype.setItem = function () { throw new DOMException('Full', 'QuotaExceededError'); }; });
  await page.locator('[data-learning-bookmark]').click();
  assert.match(await page.locator('[data-learning-notice]').innerText(), /only in this tab/);
  const exported = JSON.parse(await page.evaluate(() => window.CNRLearning.exportBackup())); assert.equal(exported.learning.lessons[PAGE].bookmark.value, true);
});

test('dashboard uses catalog ordering for suggestions and fits narrow enlarged text', async t => {
  const p = progress(); p.done[PAGE] = now(); p.tuts[COURSE].done = 1;
  const { page } = await setup(t, { cnr_progress: p }, '/learn/');
  await page.getByText('Suggested next: Lesson B', { exact: true }).waitFor();
  for (const width of [320, 768, 1440]) { await page.setViewportSize({ width, height: 900 }); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow at ${width}`); }
});

test('a valid full lesson store refuses a new visit cleanly and preserves existing data', async t => {
  const full = learning();
  for (let i = 0; i < 5000; i++) full.lessons[`/docs/language/css/existing-${i}/`] = { title: 'Existing', course: COURSE, visitedAt: 1, updatedAt: 1, practice: {} };
  const { page } = await setup(t, { cnr_progress: progress(), cnr_learning_v1: full });
  assert.equal(Object.keys((await snapshot(page)).learning.lessons).length, 5000);
  assert.equal(await page.locator('[data-learning-tools]').isVisible(), true);
  assert.match(await page.locator('[data-learning-notice]').innerText(), /too many entries/);
  await page.locator('[data-learning-bookmark]').click();
  assert.equal(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('cnr_learning_v1')).lessons).length), 5000);
  await page.locator('[data-mark-done]').click(); assert((await snapshot(page)).progress.done[PAGE]);
});

test('interrupted import journal recovers the original records on reload', async t => {
  const old = { progress: progress(), learning: learning(), playground: playground() }; old.progress.done[PAGE] = now();
  const changed = progress(); changed.done[OTHER] = now();
  const journal = { v: 1, originals: Object.fromEntries(Object.entries(old).map(([name, value]) => [name, JSON.stringify(value)])) };
  const { page } = await setup(t, { cnr_progress: changed, cnr_learning_v1: learning(), cnr_playground_v1: playground(), cnr_learning_import_journal_v1: journal }, '/learn/');
  const s = await snapshot(page); assert(s.progress.done[PAGE]); assert.equal(s.progress.done[OTHER], undefined);
  assert.equal(await page.evaluate(() => localStorage.getItem('cnr_learning_import_journal_v1')), null);
});

test('Unicode draft metadata round-trips without truncation and stays within a byte limit', async t => {
  const d = playground(); d.drafts.workspace = { ...draft('<p>你好 🌱</p>'), title: '学习笔记 🌱'.repeat(20), exerciseId: '练习'.repeat(50) };
  const { page } = await setup(t, { cnr_playground_v1: d }, '/learn/');
  const out = JSON.parse(await page.evaluate(() => window.CNRLearning.exportBackup())); assert.deepEqual(out.playground.drafts.workspace, d.drafts.workspace);
});

test('aggregate size rejection preserves the edited note instead of restoring old text', async t => {
  const full = learning(); full.lessons[PAGE] = lesson('Old note');
  let i = 0;
  while (Buffer.byteLength(JSON.stringify(full)) < 2 * 1024 * 1024 - 21000) full.lessons[`/docs/language/css/filler-${i++}/`] = lesson('x'.repeat(20000));
  const finalKey = '/docs/language/css/last-filler/'; full.lessons[finalKey] = lesson('');
  const remaining = 2 * 1024 * 1024 - 100 - Buffer.byteLength(JSON.stringify(full));
  assert(remaining > 0 && remaining <= 20000); full.lessons[finalKey].note.text = 'x'.repeat(remaining);
  const { page } = await setup(t, { cnr_learning_v1: full, cnr_progress: progress() });
  await page.getByText('Your lesson notes', { exact: true }).click();
  const edited = 'A small but important edit. '.repeat(30); await page.locator('[data-learning-note]').fill(edited); await page.locator('[data-learning-save-note]').click();
  assert.equal(await page.locator('[data-learning-note]').inputValue(), edited);
  assert.equal(await page.evaluate(p => JSON.parse(localStorage.getItem('cnr_learning_v1')).lessons[p].note.text, PAGE), 'Old note');
  assert.match(await page.locator('[data-learning-note-status]').innerText(), /could not be saved/);
  assert.match(await page.locator('[data-learning-notice]').innerText(), /2 MB storage limit/);
});

test('future-version saved data is never silently reset by a lesson visit', async t => {
  const future = { v: 99, lessons: { precious: 'Keep me' } };
  const { page } = await setup(t, { cnr_learning_v1: future, cnr_progress: progress() });
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('cnr_learning_v1'))), future);
  assert.match(await page.locator('[data-learning-notice]').innerText(), /has not been replaced/);
});

test('lesson export can download session-only changes without leaving the page', async t => {
  const { page } = await setup(t);
  await page.evaluate(() => { Storage.prototype.setItem = function () { throw new DOMException('Full', 'QuotaExceededError'); }; });
  await page.locator('[data-learning-bookmark]').click();
  const downloaded = page.waitForEvent('download'); await page.locator('[data-learning-export]').click();
  const file = await downloaded; const body = JSON.parse(fs.readFileSync(await file.path(), 'utf8'));
  assert.equal(body.learning.lessons[PAGE].bookmark.value, true); assert.equal(new URL(page.url()).pathname, PAGE);
});

test('a successful retry flushes retained changes and preserves newer data from another tab', async t => {
  const { page, context } = await setup(t);
  await page.evaluate(() => { window.originalSet = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('Full', 'QuotaExceededError'); }; });
  await page.locator('[data-learning-bookmark]').click();
  const other = await context.newPage(); await other.goto(origin + PAGE); await other.waitForFunction(() => !!window.CNRLearning);
  await other.evaluate(p => window.CNRLearning.saveNote(p, 'New note in another tab'), OTHER);
  await page.evaluate(() => { Storage.prototype.setItem = window.originalSet; });
  await page.locator('[data-mark-done]').click();
  await page.reload(); const s = await snapshot(page);
  assert.equal(s.learning.lessons[PAGE].bookmark.value, true); assert.equal(s.learning.lessons[OTHER].note.text, 'New note in another tab'); assert(s.progress.done[PAGE]);
});

test('a slow previous file read cannot replace the newest import preview', async t => {
  const { page } = await setup(t, {}, '/learn/');
  await page.evaluate(() => { const original = File.prototype.text; File.prototype.text = function () { const value = original.call(this); return this.name === 'slow.json' ? new Promise(resolve => setTimeout(() => resolve(value), 300)) : value; }; });
  const slow = backup(); slow.progress.done[OTHER] = now(); const fast = backup(); fast.progress.done[PAGE] = now(); fast.progress.done[OTHER] = now();
  await page.locator('[data-learning-import-file]').setInputFiles({ name: 'slow.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(slow)) });
  await page.locator('[data-learning-import-file]').setInputFiles({ name: 'fast.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fast)) });
  await page.waitForTimeout(400);
  assert.match(await page.locator('[data-learning-import-counts]').innerText(), /^2 read marks/);
  await page.locator('[data-learning-import-apply]').click(); const s = await snapshot(page); assert(s.progress.done[PAGE] && s.progress.done[OTHER]);
});
