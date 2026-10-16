/* CNR_PLAYWRIGHT_MODULE=/isolated/path/to/playwright node --test tests/profile.spec.js */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.CNR_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const VERIFY = 'v'.repeat(43), RESET = 'r'.repeat(43), PASSWORD = '  a sufficiently long password  ';
const EMAIL = 'learner@example.test';
const LOCAL = { v: 1, done: { '/docs/language/css/': 1 }, tuts: {} };
function user(extra = {}) { return { id: 'account-a', name: 'Alex', email: EMAIL, emailVerified: true, hasPassword: true, googleLinked: false, ...extra }; }
function model() { return { configured: true, providers: { google: true, email: true }, user: null, csrfToken: 'profile-csrf', credential: null, pending: null, calls: [], offline: false, linkURL: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test&state=one-time-test' }; }
let server, browser, origin;
const template = fs.readFileSync(path.join(root, 'hugo/layouts/profile/single.html'), 'utf8').replace(/{{[^}]*}}/g, '');
before(async () => {
  server = http.createServer((req, res) => {
    if (req.url === '/profile.js' || req.url === '/profile.css') { const ext = req.url.endsWith('.js') ? 'js' : 'css'; res.setHeader('Content-Type', ext === 'js' ? 'text/javascript' : 'text/css'); return res.end(fs.readFileSync(path.join(root, `hugo/assets/${ext}/profile.${ext}`))); }
    res.setHeader('Content-Type', 'text/html'); res.end(`<!doctype html><html data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><style>*{box-sizing:border-box}body{margin:0;padding:16px;font:16px/1.5 system-ui}.container{max-width:850px;margin:auto}:root{--ifm-color-primary:#245ab9;--ifm-font-family-base:system-ui}</style><link rel="stylesheet" href="/profile.css"></head><body>${template}<script src="/profile.js" defer></script></body></html>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); origin = `http://127.0.0.1:${server.address().port}`; browser = await chromium.launch({ headless: true });
});
after(async () => { await browser.close(); await new Promise(resolve => server.close(resolve)); });
async function setup(t, account = model(), suffix = '') {
  const context = await browser.newContext(); t.after(() => context.close());
  await context.addInitScript(data => { if (!localStorage.getItem('cnr_progress')) localStorage.setItem('cnr_progress', JSON.stringify(data)); }, LOCAL);
  await context.route('https://accounts.google.com/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Mock Google authorization</h1>' }));
  await context.route('**/api/**', async route => {
    const req = route.request(), pathname = new URL(req.url()).pathname, method = req.method(), body = req.postData() ? req.postDataJSON() : {};
    account.calls.push({ pathname, method, body, headers: req.headers(), url: req.url() });
    const reply = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    if (account.offline) return route.abort('internetdisconnected');
    if (pathname === '/api/auth/session') return reply({ configured: account.configured, providers: account.providers, user: account.user, ...(account.user ? { csrfToken: account.csrfToken } : {}) });
    if (pathname === '/api/auth/register') { account.pending = { email: body.email, password: body.password, name: body.name }; return reply({ ok: true }, 202); }
    if (pathname === '/api/auth/login') {
      if (!account.credential || body.email !== account.credential.email || body.password !== account.credential.password) return reply({ error: 'invalid_credentials' }, 401);
      account.user = user({ name: account.credential.name || 'Alex', email: account.credential.email, googleLinked: !!account.credential.googleLinked }); return reply({ ok: true });
    }
    if (pathname === '/api/auth/forgot-password' || pathname === '/api/auth/resend-verification') return reply({ ok: true }, 202);
    if (pathname === '/api/auth/verify-email') {
      if (body.token !== VERIFY || !account.pending || body.password !== account.pending.password) return reply({ error: 'invalid_verification' }, 400);
      account.credential = { ...account.pending, googleLinked: !!account.user?.googleLinked }; account.user = null; account.pending = null; return reply({ ok: true });
    }
    if (pathname === '/api/auth/reset-password') {
      if (body.token !== RESET) return reply({ error: 'invalid_reset' }, 400);
      account.credential = { email: EMAIL, password: body.password, name: 'Alex' }; account.user = null; return reply({ ok: true });
    }
    if (!account.user) return reply({ error: 'authentication_required' }, 401);
    if (req.headers()['x-cnr-user'] !== account.user.id) return reply({ error: 'account_changed' }, 409);
    if (req.headers()['x-csrf-token'] !== account.csrfToken) return reply({ error: 'csrf_failed' }, 403);
    if (pathname === '/api/auth/profile' && method === 'PATCH') { account.user.name = body.name; return reply({ ok: true }); }
    if (pathname === '/api/auth/password') {
      if (body.currentPassword !== PASSWORD) return reply({ error: 'invalid_credentials' }, 401);
      account.credential = { email: account.user.email, password: body.newPassword }; account.user = null; return reply({ ok: true });
    }
    if (pathname === '/api/auth/email' && method === 'DELETE') { account.pending = null; account.user.email = null; account.user.emailVerified = false; return reply({ ok: true }); }
    if (pathname === '/api/auth/email' && method === 'POST') { account.pending = { email: body.email, password: body.password, name: account.user.name }; account.user.email = body.email; account.user.emailVerified = false; return reply({ ok: true }, 202); }
    if (pathname === '/api/auth/google/link' && method === 'POST') return reply({ url: account.linkURL });
    if (pathname === '/api/auth/google/link' && method === 'DELETE') { if (!(account.user.hasPassword && account.user.emailVerified)) return reply({ error: 'last_method' }, 409); account.lastUnlinked = { ...account.user, googleLinked: false }; account.user = null; return reply({ ok: true }); }
    if (pathname === '/api/auth/logout') { account.user = null; return reply({ ok: true }); }
    if (pathname === '/api/auth/account' && method === 'DELETE') { account.user = null; account.credential = null; return reply({ ok: true }); }
    return reply({ error: 'not_found' }, 404);
  });
  const page = await context.newPage(); await page.goto(origin + '/profile/' + suffix); await idle(page); return { page, account, context };
}
async function idle(page) { await page.waitForFunction(() => document.querySelector('[data-profile]').getAttribute('aria-busy') === 'false' && !new URLSearchParams(location.hash.slice(1)).has('verify') && !new URLSearchParams(location.hash.slice(1)).has('reset')); }
async function fill(form, fields) { for (const [key, value] of Object.entries(fields)) await form.locator(`[name="${key}"]`).fill(value); }
async function signInFromPopup(page, account, signedIn) {
  // The navbar popup (auth-ui.js) owns sign-in and announces the new session to the profile.
  account.user = signedIn; const session = { configured: true, providers: account.providers, user: signedIn, csrfToken: account.csrfToken };
  await page.evaluate(detail => dispatchEvent(new CustomEvent('cnr:auth-changed', { detail })), { session }); await idle(page);
}
async function submit(page, kind, fields) { const form = page.locator(`[data-profile-form="${kind}"]`); await fill(form, fields); await form.locator('button[type=submit]').click(); await idle(page); return form; }

test('guests get the shared popup trigger instead of a second sign-in form; mail verification stays on the profile', async t => {
  const { page, account } = await setup(t);
  assert.equal(await page.locator('[data-profile-guest]').isVisible(), true); assert.equal(await page.locator('[data-profile-guest] [data-auth-open]').isVisible(), true);
  assert.equal(await page.locator('[data-profile-guest] form, [data-profile-guest] input').count(), 0); assert.equal(await page.locator('[data-profile-form=login], [data-profile-form=register], [data-profile-form=forgot]').count(), 0);
  account.pending = { email: EMAIL, password: PASSWORD, name: 'Alex Learner' };
  await page.goto(origin + '/profile/#verify=' + VERIFY); await idle(page);
  assert.equal(page.url(), origin + '/profile/'); assert.equal(account.calls.filter(c => c.pathname === '/api/auth/verify-email').length, 0);
  await submit(page, 'verify', { password: PASSWORD }); assert.match(await page.locator('[data-profile-status]').innerText(), /Email verified/);
  await signInFromPopup(page, account, user({ name: 'Alex Learner' })); assert.equal(await page.locator('[data-profile-name]').innerText(), 'Alex Learner'); assert.equal(await page.locator('[data-profile-guest]').isVisible(), false);
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage })); assert.equal(stored.includes(PASSWORD), false); assert.equal(stored.includes(VERIFY), false); assert.equal(stored.includes('profile-csrf'), false);
  assert(account.calls.every(c => !c.url.includes(VERIFY))); assert.equal(account.calls.find(c => c.pathname === '/api/auth/verify-email').headers.origin, origin);
});

test('reset link is consumed only on submission', async t => {
  const { page, account } = await setup(t);
  await page.goto(origin + '/profile/#reset=' + RESET); await idle(page); assert.equal(page.url(), origin + '/profile/'); assert.equal(account.calls.filter(c => c.pathname === '/api/auth/reset-password').length, 0);
  const next = 'another sufficiently long password'; await submit(page, 'reset', { password: next, confirm: next }); assert.equal(account.credential.password, next); assert.match(await page.locator('[data-profile-status]').innerText(), /Password reset/); assert.equal(await page.locator('[data-profile-reset]').isVisible(), false);
});

test('password validation counts Unicode codepoints and keeps spaces', async t => {
  const { page, account } = await setup(t, model(), '#reset=' + RESET);
  const short = '🌱'.repeat(14); let form = await submit(page, 'reset', { password: short, confirm: short }); assert.match(await form.locator('[data-profile-message]').innerText(), /15–128/); assert.equal(account.calls.filter(c => c.pathname === '/api/auth/reset-password').length, 0);
  const valid = ' 🌱'.repeat(15) + ' '; await submit(page, 'reset', { password: valid, confirm: valid }); assert.equal(account.credential.password, valid);
});

test('display-name and password changes use current identity and CSRF', async t => {
  const a = model(); a.user = user(); const { page, account } = await setup(t, a);
  await submit(page, 'name', { name: 'Changed learner' }); assert.equal(account.user.name, 'Changed learner'); assert.equal(await page.locator('[data-profile-name]').innerText(), 'Changed learner');
  const patch = account.calls.find(c => c.method === 'PATCH'); assert.equal(patch.headers['x-cnr-user'], 'account-a'); assert.equal(patch.headers['x-csrf-token'], 'profile-csrf');
  const next = 'new sufficiently long password'; await submit(page, 'password', { currentPassword: PASSWORD, newPassword: next, confirm: next }); assert.equal(account.credential.password, next); assert.equal(await page.locator('[data-profile-guest]').isVisible(), true);
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('cnr_progress'))), LOCAL);
});

test('Google-only accounts can enroll and resend a pending email without signing out', async t => {
  const a = model(); a.user = user({ email: null, emailVerified: false, hasPassword: false, googleLinked: true }); const { page, account } = await setup(t, a);
  assert.equal(await page.locator('[data-profile-unlink-google]').isDisabled(), true);
  await submit(page, 'enroll', { email: EMAIL, password: PASSWORD, confirm: PASSWORD }); assert.equal(account.pending.email, EMAIL); assert.equal(account.user.googleLinked, true);
  await page.getByText('Resend email verification', { exact: true }).click(); const resend = await submit(page, 'resend-member', { email: EMAIL }); assert.match(await resend.locator('[data-profile-message]').innerText(), /If this address needs verification/); assert(account.user);
  await page.goto(origin + '/profile/#verify=' + VERIFY); await idle(page); await submit(page, 'verify', { password: PASSWORD }); assert.equal(account.user, null); await signInFromPopup(page, account, user({ googleLinked: true })); assert.equal(account.user.emailVerified, true); assert.equal(account.user.hasPassword, true); assert.equal(account.user.googleLinked, true); assert.equal(await page.locator('[data-profile-unlink-google]').isDisabled(), false);
});

test('Google linking uses an authenticated explicit request and a restricted navigation destination', async t => {
  const a = model(); a.user = user(); a.linkURL = 'https://evil.example/'; const { page, account } = await setup(t, a);
  await page.locator('[data-profile-link-google]').click(); await idle(page); assert.equal(page.url(), origin + '/profile/'); assert.match(await page.locator('[data-profile-status]').innerText(), /No navigation/);
  const call = account.calls.find(c => c.pathname === '/api/auth/google/link'); assert.equal(call.headers['x-cnr-user'], 'account-a'); assert.equal(call.headers['x-csrf-token'], 'profile-csrf');
  account.linkURL = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test'; await page.locator('[data-profile-link-google]').click(); await page.waitForURL('https://accounts.google.com/o/oauth2/v2/auth?client_id=test');
});

test('unlink requires an alternative verified method and confirmation', async t => {
  const a = model(); a.user = user({ googleLinked: true }); const { page, account } = await setup(t, a);
  page.once('dialog', d => d.dismiss()); await page.locator('[data-profile-unlink-google]').click(); assert.equal(account.calls.filter(c => c.method === 'DELETE').length, 0);
  page.once('dialog', d => d.accept()); await page.locator('[data-profile-unlink-google]').click(); await idle(page); assert.equal(account.user, null); assert.equal(account.lastUnlinked.googleLinked, false); assert.equal(await page.locator('[data-profile-guest]').isVisible(), true);
});

test('a changed account cannot receive settings intended for the previous identity', async t => {
  const a = model(); a.user = user(); const { page, account } = await setup(t, a); account.user = user({ id: 'account-b', name: 'Bea' });
  await submit(page, 'name', { name: 'Name intended for Alex' }); assert.equal(account.calls.filter(c => c.method === 'PATCH').length, 0); assert.equal(account.user.name, 'Bea'); assert.match(await page.locator('[data-profile-form=name] [data-profile-message]').innerText(), /signed-in account changed/);
});

test('unavailable providers and network failures leave local learning untouched', async t => {
  const a = model(); a.providers.email = false; const { page, account } = await setup(t, a); assert.equal(await page.locator('[data-profile-guest] [data-auth-open]').isVisible(), true); assert.equal(await page.locator('[data-profile-refresh]').isVisible(), false);
  account.offline = true; await page.reload(); await idle(page); assert.match(await page.locator('[data-profile-status]').innerText(), /Could not reach/); assert.equal(await page.locator('[data-profile-refresh]').isVisible(), true); assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('cnr_progress'))), LOCAL);
});

test('logout and confirmed deletion retain browser learning', async t => {
  const a = model(); a.user = user(); const { page, account } = await setup(t, a);
  await page.locator('[data-profile-logout]').click(); await idle(page); assert.equal(account.user, null);
  await signInFromPopup(page, account, user()); await page.getByText('Delete account', { exact: true }).click(); page.once('dialog', d => d.accept()); await page.locator('[data-profile-delete]').click(); await idle(page); assert.equal(account.user, null); assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('cnr_progress'))), LOCAL);
});

test('malformed email fragments are removed without submission and profile forms remain responsive', async t => {
  const { page, account } = await setup(t, model(), '#reset=invalid&verify=' + VERIFY); assert.equal(page.url(), origin + '/profile/'); assert.match(await page.locator('[data-profile-status]').innerText(), /link is invalid/); assert.equal(account.calls.filter(c => c.method !== 'GET').length, 0);
  for (const width of [320, 768, 1440]) { await page.setViewportSize({ width, height: 900 }); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; document.documentElement.dataset.theme = 'dark'; }); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow ${width}`); }
});

test('a Google user can replace or cancel a pending email without losing the Google method', async t => {
  const a = model(); a.user = user({ email: 'old-pending@example.test', emailVerified: false, hasPassword: false, googleLinked: true }); a.pending = { email: a.user.email, password: PASSWORD, name: 'Alex' };
  const { page, account } = await setup(t, a);
  await submit(page, 'enroll', { email: 'corrected@example.test', password: PASSWORD, confirm: PASSWORD }); assert.equal(account.pending.email, 'corrected@example.test');
  await page.locator('[data-profile-cancel-email]').click(); await idle(page); assert.equal(account.pending, null); assert.equal(account.user.email, null); assert.equal(account.user.googleLinked, true); assert.equal(await page.locator('[data-profile-cancel-email]').isVisible(), false);
});
