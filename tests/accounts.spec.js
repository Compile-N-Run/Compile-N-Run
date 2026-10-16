/* CNR_PLAYWRIGHT_MODULE=/isolated/path/to/playwright node --test tests/accounts.spec.js */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.CNR_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const PAGE = '/docs/language/css/a/';
const OTHER = '/docs/language/css/b/';
const stamp = () => Date.now() - 1000;
function base() { return { format: 'cnr-learning-backup', version: 1, exportedAt: new Date().toISOString(), progress: { v: 1, done: {}, tuts: {} }, learning: { v: 1, lessons: {} }, playground: { version: 1, drafts: {} } }; }
function note(value) { return { title: 'CSS lesson', course: 'language/css', visitedAt: stamp(), updatedAt: stamp(), practice: {}, note: { text: value, updatedAt: stamp() } }; }
function model() { return { configured: true, user: { id: 'account-a', name: 'Alex Learner' }, csrfToken: 'session-a-token', revision: 0, data: null, updatedAt: null, calls: [], saves: 0, offline: false }; }
let browser, server, origin;
const dashboard = fs.readFileSync(path.join(root, 'hugo/layouts/learning/single.html'), 'utf8').replace(/{{[^}]*}}/g, '');
before(async () => {
  server = http.createServer((req, res) => {
    const name = req.url.replace('/', '');
    if (['learning.js', 'accounts.js', 'learning.css', 'accounts.css'].includes(name)) { const ext = name.endsWith('.js') ? 'js' : 'css'; res.setHeader('Content-Type', ext === 'js' ? 'text/javascript' : 'text/css'); return res.end(fs.readFileSync(path.join(root, `hugo/assets/${ext}/${name}`))); }
    if (req.url === '/learning-catalog.json') { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ v: 1, courses: [] })); }
    res.setHeader('Content-Type', 'text/html');
    res.end(`<!doctype html><html data-theme="light"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;padding:16px;font:16px/1.5 system-ui}.container{max-width:1100px;margin:auto}:root{--ifm-color-primary:#245ab9;--ifm-color-primary-dark:#17418e;--ifm-font-family-base:system-ui;--ifm-background-surface-color:white;--ifm-color-emphasis-300:#b1bdcc}</style><link rel="stylesheet" href="/learning.css"><link rel="stylesheet" href="/accounts.css"></head><body>${dashboard}<script>window.CNR_PAGE={}</script><script src="/learning.js" defer></script><script src="/accounts.js" defer></script></body></html>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); origin = `http://127.0.0.1:${server.address().port}`; browser = await chromium.launch({ headless: true });
});
after(async () => { await browser.close(); await new Promise(resolve => server.close(resolve)); });
async function setup(t, account = model(), local = base()) {
  const context = await browser.newContext(); t.after(() => context.close());
  await context.addInitScript(data => { if (!localStorage.getItem('__seed__')) { localStorage.setItem('__seed__', 'yes'); localStorage.setItem('cnr_progress', JSON.stringify(data.progress)); localStorage.setItem('cnr_learning_v1', JSON.stringify(data.learning)); localStorage.setItem('cnr_playground_v1', JSON.stringify(data.playground)); } }, local);
  await context.route('**/api/**', async route => {
    const req = route.request(), url = new URL(req.url()), method = req.method(); account.calls.push({ path: url.pathname, method, headers: req.headers(), body: req.postData() ? JSON.parse(req.postData()) : null });
    if (account.offline) return route.abort('internetdisconnected');
    const respond = (value, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
    if (url.pathname === '/api/auth/session') return respond({ configured: account.configured, user: account.user, ...(account.user ? { csrfToken: account.csrfToken } : {}) });
    if (!account.user) return respond({ error: 'authentication_required' }, 401);
    if (account.switchOnPut && method === 'PUT') account.user = { id: 'account-b', name: 'Bea Learner' };
    if (req.headers()['x-cnr-user'] !== account.user.id) return respond({ error: 'account_changed' }, 409);
    if (method !== 'GET' && req.headers()['x-csrf-token'] !== account.csrfToken) return respond({ error: 'csrf_failed' }, 403);
    if (url.pathname === '/api/learning' && method === 'GET') return respond({ revision: account.revision, data: account.data, updatedAt: account.updatedAt });
    if (url.pathname === '/api/learning' && method === 'PUT') {
      const sent = req.postDataJSON(); if (sent.revision !== account.revision) return respond({ error: 'revision_conflict', revision: account.revision }, 409);
      if (account.beforeSave) await account.beforeSave();
      account.data = sent.data; account.revision++; account.updatedAt = new Date().toISOString(); account.saves++;
      return respond({ revision: account.revision, updatedAt: account.updatedAt });
    }
    if (url.pathname === '/api/auth/logout' && method === 'POST') { account.user = null; return respond({ ok: true }); }
    if (url.pathname === '/api/auth/account' && method === 'DELETE') { account.user = null; account.data = null; return respond({ ok: true }); }
    return respond({ error: 'not_found' }, 404);
  });
  const page = await context.newPage(); await page.goto(origin + '/learn/'); await page.waitForFunction(() => !!window.CNRLearning && document.querySelector('[data-accounts]').getAttribute('aria-busy') === 'false'); return { page, context, account };
}
async function previewAndMerge(page) { await page.locator('[data-account-preview]').click(); await page.locator('[data-account-merge-preview]').waitFor({ state: 'visible' }); await page.locator('[data-account-merge]').click(); await page.waitForFunction(() => document.querySelector('[data-account-save]').disabled === false); }

test('unconfigured accounts hide login while guest learning remains available', async t => {
  const a = model(); a.configured = false; a.user = null; const { page } = await setup(t, a);
  assert.equal(await page.locator('[data-accounts]').isVisible(), false); assert.equal(await page.locator('[data-learning-export]').isVisible(), true); assert.equal(a.calls.length, 1); assert.equal(a.saves, 0);
});

test('offline fallback leaves local data unchanged and can retry to Google sign-in', async t => {
  const a = model(); a.offline = true; a.user = null; const local = base(); local.learning.lessons[PAGE] = note('Keep offline notes');
  const { page } = await setup(t, a, local); assert.match(await page.locator('[data-account-status]').innerText(), /Could not reach/);
  assert.equal(await page.evaluate(p => window.CNRLearning.getSnapshot().learning.lessons[p].note.text, PAGE), 'Keep offline notes');
  a.offline = false; await page.locator('[data-account-retry]').click(); await page.getByRole('link', { name: 'Continue with Google' }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Continue with Google' }).getAttribute('href'), '/api/auth/google'); assert.equal(a.saves, 0);
});

test('authenticated load never uploads; explicit save binds identity and CSRF and reports timestamp', async t => {
  const local = base(); local.progress.done[PAGE] = stamp(); local.learning.lessons[PAGE] = note('Local note');
  const { page, account } = await setup(t, model(), local); assert.equal(account.saves, 0); assert.match(await page.locator('[data-account-name]').innerText(), /Alex Learner/);
  await page.locator('[data-account-save]').click(); await page.waitForFunction(() => document.querySelector('[data-account-status]').textContent.includes('Learning saved to your account'));
  assert.equal(account.saves, 1); assert.equal(account.data.learning.lessons[PAGE].note.text, 'Local note');
  const put = account.calls.find(call => call.method === 'PUT'); assert.equal(put.headers['x-cnr-user'], 'account-a'); assert.equal(put.headers['x-csrf-token'], 'session-a-token'); assert.equal(put.headers.origin, origin); assert.match(await page.locator('[data-account-saved-at]').innerText(), /Last saved to account/);
  assert.equal(JSON.stringify(account.data).includes('session-a-token'), false);
  await page.evaluate(p => window.CNRLearning.setRead(p, false), PAGE); assert.equal(account.saves, 1);
  await page.locator('[data-account-save]').click(); await page.waitForFunction(() => document.querySelector('[data-accounts]').getAttribute('aria-busy') === 'false'); assert.equal(account.data.progress.done[PAGE], undefined);
});

test('existing account data requires preview and explicit merge before a save', async t => {
  const a = model(); a.revision = 3; a.updatedAt = new Date().toISOString(); a.data = base(); a.data.learning.lessons[PAGE] = note('Cloud note'); a.data.progress.done[OTHER] = stamp();
  const local = base(); local.learning.lessons[PAGE] = note('Local note'); const { page } = await setup(t, a, local);
  assert.equal(await page.locator('[data-account-save]').isDisabled(), true); assert.equal(a.saves, 0);
  await page.locator('[data-account-preview]').click(); await page.locator('[data-account-merge-preview]').waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(p => window.CNRLearning.getSnapshot().learning.lessons[p].note.text, PAGE), 'Local note');
  await page.locator('[data-account-merge]').click(); await page.waitForFunction(() => !document.querySelector('[data-account-save]').disabled);
  const text = await page.evaluate(p => window.CNRLearning.getSnapshot().learning.lessons[p].note.text, PAGE); assert.match(text, /Local note/); assert.match(text, /Cloud note/); assert.equal(a.saves, 0);
  await page.locator('[data-account-save]').click(); await page.waitForFunction(() => document.querySelector('[data-accounts]').getAttribute('aria-busy') === 'false'); assert.equal(a.saves, 1);
});

test('revision conflict blocks overwrite until newer cloud data is previewed and merged', async t => {
  const a = model(); a.data = base(); a.data.learning.lessons[PAGE] = note('Initial cloud'); a.revision = 1; a.updatedAt = new Date().toISOString();
  const { page } = await setup(t, a); await previewAndMerge(page);
  a.revision = 2; a.data.learning.lessons[OTHER] = note('Added on another device');
  await page.locator('[data-account-save]').click(); await page.waitForFunction(() => document.querySelector('[data-accounts]').getAttribute('aria-busy') === 'false');
  assert.equal(a.saves, 0); assert.equal(await page.locator('[data-account-save]').isDisabled(), true); assert.match(await page.locator('[data-account-status]').innerText(), /newer account snapshot/);
  await previewAndMerge(page); assert.equal(await page.evaluate(p => window.CNRLearning.getSnapshot().learning.lessons[p].note.text, OTHER), 'Added on another device');
  await page.locator('[data-account-save]').click(); await page.waitForFunction(() => document.querySelector('[data-accounts]').getAttribute('aria-busy') === 'false'); assert.equal(a.saves, 1); assert.equal(a.revision, 3);
});

test('account switches prevent stale-tab saves both before and after the session check', async t => {
  const { page, account } = await setup(t); account.user = { id: 'account-b', name: 'Bea Learner' };
  await page.locator('[data-account-save]').click(); await page.waitForFunction(() => document.querySelector('[data-accounts]').getAttribute('aria-busy') === 'false');
  assert.equal(account.calls.filter(call => call.method === 'PUT').length, 0); assert.equal(await page.locator('[data-account-name]').innerText(), 'Bea Learner');
  account.user = { id: 'account-a', name: 'Alex Learner' }; await page.locator('[data-account-retry]').click(); await page.waitForFunction(() => !document.querySelector('[data-account-save]').disabled);
  account.switchOnPut = true; await page.locator('[data-account-save]').click(); await page.waitForFunction(() => document.querySelector('[data-accounts]').getAttribute('aria-busy') === 'false');
  assert.equal(account.saves, 0); assert.match(await page.locator('[data-account-status]').innerText(), /changed in another tab/);
});

test('logout and confirmed deletion leave browser learning untouched', async t => {
  const local = base(); local.learning.lessons[PAGE] = note('Browser copy'); const { page, account } = await setup(t, model(), local);
  await page.locator('[data-account-logout]').click(); await page.getByRole('link', { name: 'Continue with Google' }).waitFor();
  assert.equal(await page.evaluate(p => window.CNRLearning.getSnapshot().learning.lessons[p].note.text, PAGE), 'Browser copy');
  account.user = { id: 'account-a', name: 'Alex Learner' }; await page.locator('[data-account-retry]').click(); await page.waitForFunction(() => !document.querySelector('[data-account-delete]').disabled);
  await page.getByText('Manage account', { exact: true }).click(); page.once('dialog', dialog => dialog.dismiss()); await page.locator('[data-account-delete]').click(); assert.equal(account.calls.filter(call => call.method === 'DELETE').length, 0);
  page.once('dialog', dialog => dialog.accept()); await page.locator('[data-account-delete]').click(); await page.getByRole('link', { name: 'Continue with Google' }).waitFor();
  assert.equal(account.calls.filter(call => call.method === 'DELETE').length, 1); assert.equal(await page.evaluate(p => window.CNRLearning.getSnapshot().learning.lessons[p].note.text, PAGE), 'Browser copy');
});

test('invalid remote fields and unsafe paths cannot be merged or replaced silently', async t => {
  const a = model(); a.data = base(); a.data.extraUnsupportedData = { note: 'Do not discard me' }; a.revision = 1; a.updatedAt = new Date().toISOString();
  const { page } = await setup(t, a); assert.match(await page.locator('[data-account-status]').innerText(), /unsupported field/); assert.equal(await page.locator('[data-account-save]').isDisabled(), true); assert.equal(a.saves, 0);
  delete a.data.extraUnsupportedData; a.data.progress.done['//evil.example/'] = stamp(); await page.locator('[data-account-preview]').click(); await page.waitForFunction(() => document.querySelector('[data-accounts]').getAttribute('aria-busy') === 'false'); assert.match(await page.locator('[data-account-status]').innerText(), /invalid lesson path/); assert.equal(await page.locator('[data-account-merge-preview]').isVisible(), false);
});

test('large local backups remain downloadable and are not uploaded past the cloud cap', async t => {
  const local = base(); for (let i = 0; i < 90; i++) local.learning.lessons[`/docs/language/css/note-${i}/`] = note('x'.repeat(20000));
  const { page, account } = await setup(t, model(), local); await page.locator('[data-account-save]').click(); await page.waitForFunction(() => document.querySelector('[data-accounts]').getAttribute('aria-busy') === 'false');
  assert.equal(account.saves, 0); assert.equal(account.calls.filter(call => call.method === 'PUT').length, 0); assert.match(await page.locator('[data-account-status]').innerText(), /larger than the account limit/);
  assert((await page.evaluate(() => window.CNRLearning.exportBackup())).length > 1800000);
});

test('cloud and local-file previews cannot apply each other through a stale button', async t => {
  const a = model(); a.data = base(); a.data.learning.lessons[PAGE] = note('Cloud version'); a.revision = 1; a.updatedAt = new Date().toISOString();
  const { page } = await setup(t, a); await page.locator('[data-account-preview]').click(); await page.locator('[data-account-merge-preview]').waitFor({ state: 'visible' });
  const file = base(); file.learning.lessons[OTHER] = note('Local file version');
  await page.locator('[data-learning-import-file]').setInputFiles({ name: 'local.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(file)) }); await page.locator('[data-learning-import-preview]').waitFor({ state: 'visible' });
  await page.locator('[data-account-merge]').click(); await page.waitForFunction(() => document.querySelector('[data-accounts]').getAttribute('aria-busy') === 'false');
  assert.match(await page.locator('[data-account-status]').innerText(), /different backup/); assert.equal(await page.evaluate(p => !!window.CNRLearning.getSnapshot().learning.lessons[p], OTHER), false);
  await page.locator('[data-learning-import-apply]').click(); assert.equal(await page.evaluate(p => window.CNRLearning.getSnapshot().learning.lessons[p].note.text, OTHER), 'Local file version');
});

test('identity text is inert and account controls reflow with enlarged text', async t => {
  const a = model(); a.user.name = '<img src=x onerror=alert(1)> A long learner name'; const { page } = await setup(t, a);
  assert.equal(await page.locator('[data-account-name] img').count(), 0); assert.match(await page.locator('[data-account-name]').innerText(), /<img/);
  for (const width of [320, 768, 1440]) { await page.setViewportSize({ width, height: 900 }); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow ${width}`); }
});

test('edits made while a save is in flight remain local and need another explicit save', async t => {
  const local = base(); local.learning.lessons[PAGE] = note('Version sent to account'); const { page, account } = await setup(t, model(), local);
  account.beforeSave = async () => { account.beforeSave = null; await page.evaluate(p => window.CNRLearning.saveNote(p, 'New edit during upload'), PAGE); };
  await page.locator('[data-account-save]').click(); await page.waitForFunction(() => document.querySelector('[data-accounts]').getAttribute('aria-busy') === 'false');
  assert.equal(account.saves, 1); assert.equal(account.data.learning.lessons[PAGE].note.text, 'Version sent to account');
  assert.match(await page.locator('[data-account-status]').innerText(), /additional changes/);
  assert.equal(await page.evaluate(p => window.CNRLearning.getSnapshot().learning.lessons[p].note.text, PAGE), 'New edit during upload');
});
