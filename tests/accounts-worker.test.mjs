import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handleAccounts, ACCOUNT_SITE as SITE, OAUTH_CALLBACK, GITHUB_CALLBACK, SNAPSHOT_MAX_BYTES } from '../worker/compilenrun-worker/src/accounts.js';
import worker from '../worker/compilenrun-worker/src/index.js';

class D1 {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:');
    this.sqlite.exec(readFileSync(new URL('../worker/compilenrun-worker/accounts-schema.sql', import.meta.url), 'utf8'));
    this.sqlite.exec(readFileSync(new URL('../worker/compilenrun-worker/schema.sql', import.meta.url), 'utf8'));
    this.sqlite.exec(readFileSync(new URL('../worker/compilenrun-worker/accounts-email-schema.sql', import.meta.url), 'utf8'));
    this.sqlite.exec(readFileSync(new URL('../worker/compilenrun-worker/accounts-google-profile-schema.sql', import.meta.url), 'utf8'));
    this.sqlite.exec(readFileSync(new URL('../worker/compilenrun-worker/accounts-github-schema.sql', import.meta.url), 'utf8'));
  }
  prepare(sql) {
    const native = this.sqlite.prepare(sql);
    const executeWithD1Changes = values => {
      const before = this.sqlite.prepare('SELECT total_changes() AS n').get().n;
      const result = native.run(...values);
      const changes = this.sqlite.prepare('SELECT total_changes() AS n').get().n - before;
      return { success: true, meta: { ...result, changes } };
    };
    const statement = values => ({
      bind: (...args) => statement(args),
      first: async () => native.get(...values) || null,
      run: async () => executeWithD1Changes(values),
      runSync: () => executeWithD1Changes(values),
      all: async () => ({ success: true, results: native.all(...values) }),
    });
    return statement([]);
  }
  async batch(statements) {
    this.sqlite.exec('BEGIN');
    try {
      const results = [];
      for (const statement of statements) results.push(statement.runSync());
      this.sqlite.exec('COMMIT');
      return results;
    } catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
  }
}

let env, db, originalFetch, upstream, selectedSubject, selectedName, tokenFailure, mail, pendingMail;
const PASSWORD = 'A long practice password 42';
const NEW_PASSWORD = 'An entirely new passphrase 73';
const cookiePair = (response, name) => response.headers.getSetCookie().find(value => value.startsWith(name + '='))?.split(';')[0];
const snapshot = (note = '') => ({
  format: 'cnr-learning-backup', version: 1, exportedAt: '2026-10-15T12:00:00.000Z',
  progress: { v: 1, done: {}, tuts: {} },
  learning: { v: 1, lessons: note ? { '/docs/language/css/': { title: 'CSS', course: 'language/css', visitedAt: 0, updatedAt: 0, practice: {}, note: { text: note, updatedAt: 0 } } } : {} },
  playground: { version: 1, drafts: {} },
});
function request(path, { method = 'GET', cookie = '', body, headers = {} } = {}) {
  return new Request(SITE + path, { method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...headers }, ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
}
function authHeaders(login) { return { Origin: SITE, 'X-CNR-User': login.user.id, 'X-CSRF-Token': login.csrfToken, 'Content-Type': 'application/json' }; }
async function begin() {
  const response = await handleAccounts(request('/api/auth/google'), env);
  assert.equal(response.status, 303);
  return { response, url: new URL(response.headers.get('location')), cookie: cookiePair(response, '__Host-cnr_oauth') };
}
async function callback(challenge, extraCookie = '') {
  return handleAccounts(request(OAUTH_CALLBACK + '?state=' + challenge.url.searchParams.get('state') + '&code=test-code', { cookie: [challenge.cookie, extraCookie].filter(Boolean).join('; ') }), env);
}
async function login(subject = 'google-user-1', existingCookie = '') {
  selectedSubject = subject;
  const challenge = await begin();
  const response = await callback(challenge, existingCookie);
  assert.equal(response.headers.get('location'), SITE + '/learn/');
  const cookie = cookiePair(response, '__Host-cnr_session');
  const current = await handleAccounts(request('/api/auth/session', { cookie }), env);
  return { cookie, response, ...(await current.json()) };
}
beforeEach(() => {
  db = new D1();
  env = { DB: db, AUTH_LIMIT: { limit: async () => ({ success: true }) }, GOOGLE_CLIENT_ID: 'test.apps.googleusercontent.com', GOOGLE_CLIENT_SECRET: 'test-secret-not-real', GITHUB_CLIENT_ID: 'Iv1.test', GITHUB_CLIENT_SECRET: 'github-secret-not-real' };
  upstream = []; mail = []; pendingMail = []; selectedSubject = 'google-user-1'; selectedName = 'Practice Learner'; tokenFailure = false;
  originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    upstream.push({ url: String(url), options });
    if (url === 'https://api.brevo.com/v3/smtp/email') {
      assert.equal(options.headers['user-agent'], 'CompileNRun-Accounts/1.0');
      mail.push(JSON.parse(options.body));
      return Response.json({ messageId: 'mock-message' }, { status: 201 });
    }
    if (url === 'https://oauth2.googleapis.com/token') {
      assert.equal(options.method, 'POST');
      assert.equal(options.redirect, 'manual');
      const fields = new URLSearchParams(options.body);
      assert.equal(fields.get('redirect_uri'), SITE + OAUTH_CALLBACK);
      assert.equal(fields.get('grant_type'), 'authorization_code');
      assert.match(fields.get('code_verifier'), /^[A-Za-z0-9_-]{43}$/);
      return Response.json(tokenFailure ? { error: 'invalid_grant' } : { access_token: 'mock-token-do-not-store', token_type: 'Bearer', id_token: 'unverified-and-ignored' }, { status: tokenFailure ? 400 : 200 });
    }
    if (url === 'https://github.com/login/oauth/access_token') {
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.accept, 'application/json');
      const fields = new URLSearchParams(options.body);
      assert.equal(fields.get('redirect_uri'), SITE + GITHUB_CALLBACK);
      assert.equal(fields.get('client_id'), 'Iv1.test');
      assert.match(fields.get('code_verifier'), /^[A-Za-z0-9_-]{43}$/);
      return Response.json(tokenFailure ? { error: 'bad_verification_code' } : { access_token: 'gho_mock-token', token_type: 'bearer', scope: 'read:user,user:email' }, { status: tokenFailure ? 400 : 200 });
    }
    if (url === 'https://api.github.com/user') {
      assert.equal(options.headers.authorization, 'Bearer gho_mock-token');
      assert.ok(options.headers['user-agent']);
      return Response.json({ id: 4242, login: 'octocat', name: 'Mona Octocat', email: null });
    }
    if (url === 'https://api.github.com/user/emails') {
      return Response.json([{ email: 'old@example.invalid', primary: false, verified: true }, { email: 'Mona@Example.invalid', primary: true, verified: true }, { email: 'unverified@example.invalid', primary: false, verified: false }]);
    }
    assert.equal(url, 'https://openidconnect.googleapis.com/v1/userinfo');
    assert.equal(options.headers.authorization, 'Bearer mock-token-do-not-store');
    return Response.json({ sub: selectedSubject, name: selectedName, email: 'not-stored@example.invalid' });
  };
});
afterEach(() => { globalThis.fetch = originalFetch; db.sqlite.close(); });

function enableEmail() {
  Object.assign(env, { EMAIL_PASSWORD_ENABLED: 'true', PASSWORD_PEPPER: 'test-only-pepper-with-at-least-thirty-two-characters',
    BREVO_API_KEY: 'test-only-brevo-key', BREVO_SENDER_EMAIL: 'no-reply@compilenrun.com' });
}
async function emailRequest(route, data, current, method = 'POST') {
  const result = await handleAccounts(request(route, { method, cookie: current?.cookie || '',
    headers: current ? authHeaders(current) : { Origin: SITE, 'Content-Type': 'application/json' }, body: method === 'DELETE' ? undefined : data }), env,
    { waitUntil(promise) { pendingMail.push(promise); } });
  await Promise.all(pendingMail.splice(0));
  return result;
}
function emailedToken(purpose) {
  const message = [...mail].reverse().find(item => item.textContent.includes('#' + purpose + '='));
  assert(message, 'Expected a transactional email');
  return message.textContent.match(new RegExp('#' + purpose + '=([A-Za-z0-9_-]{43})'))[1];
}
async function passwordLogin(email, password = PASSWORD) {
  const result = await emailRequest('/api/auth/login', { email, password });
  assert.equal(result.status, 200);
  const cookie = cookiePair(result, '__Host-cnr_session');
  return { cookie, ...(await (await handleAccounts(request('/api/auth/session', { cookie }), env)).json()) };
}

test('disabled accounts expose configured:false without querying D1 or affecting AI paths', async () => {
  const disabled = { DB: { prepare() { throw new Error('Must not query'); } } };
  const response = await handleAccounts(request('/api/auth/session'), disabled);
  assert.deepEqual(await response.json(), { configured: false, providers: { google: false, github: false, email: false }, googleConfigured: false, emailConfigured: false, user: null });
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.equal(await handleAccounts(request('/api/ask'), disabled), null);
  assert.equal(await handleAccounts(request('/api/feedback'), disabled), null);
  const originDenied = await worker.fetch(request('/api/ask', { method: 'POST', body: '{}', headers: { Origin: 'https://attacker.invalid' } }), {}, {});
  assert.equal(originDenied.status, 403);
});

test('OAuth uses fixed Google endpoints, exact callback, state-cookie binding and S256 PKCE', async () => {
  const challenge = await begin();
  assert.equal(challenge.url.origin, 'https://accounts.google.com');
  assert.equal(challenge.url.searchParams.get('scope'), 'openid email profile');
  assert.equal(challenge.url.searchParams.get('redirect_uri'), SITE + '/auth/google_oauth2/callback');
  assert.equal(challenge.url.searchParams.get('code_challenge_method'), 'S256');
  assert.match(challenge.response.headers.get('set-cookie'), /__Host-cnr_oauth=.*Path=\/; Max-Age=600; HttpOnly; Secure; SameSite=Lax/);
  const response = await callback(challenge);
  const verifier = new URLSearchParams(upstream[0].options.body).get('code_verifier');
  const digest = Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))).toString('base64url');
  assert.equal(digest, challenge.url.searchParams.get('code_challenge'));
  assert.match(response.headers.getSetCookie().find(value => value.startsWith('__Host-cnr_session=')), /HttpOnly; Secure; SameSite=Lax/);
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.match(response.headers.get('cache-control'), /no-store/);
  const token = cookiePair(response, '__Host-cnr_session').split('=')[1];
  const stored = db.sqlite.prepare('SELECT * FROM cnr_account_sessions').get();
  assert.notEqual(stored.token_hash, token);
  assert.equal(stored.token_hash, Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))).toString('base64url'));
  const user = db.sqlite.prepare('SELECT * FROM cnr_account_users').get();
  assert.match(user.google_sub, /^local:/);
  assert.equal(db.sqlite.prepare('SELECT google_sub FROM cnr_account_google_identities WHERE user_id=?').get(user.id).google_sub, selectedSubject);
  assert(!JSON.stringify(user).includes('email'));
});

test('wrong binding, expired state, replay and upstream errors never establish a session', async () => {
  const first = await begin();
  const wrong = { ...first, cookie: '__Host-cnr_oauth=' + 'a'.repeat(43) };
  assert.equal((await callback(wrong)).headers.get('location'), SITE + '/learn/?auth=error');
  assert.equal(upstream.length, 0);
  assert.equal((await callback(first)).headers.get('location'), SITE + '/learn/');
  assert.equal((await callback(first)).headers.get('location'), SITE + '/learn/?auth=error');
  assert.equal(upstream.length, 2);
  const expired = await begin();
  db.sqlite.prepare('UPDATE cnr_account_oauth_challenges SET expires_at = 1').run();
  assert.equal((await callback(expired)).headers.get('location'), SITE + '/learn/?auth=error');
  tokenFailure = true;
  assert.equal((await callback(await begin())).headers.get('location'), SITE + '/learn/?auth=error');
});

test('session identity is stable by Google sub, rotates cookies, and expires', async () => {
  const first = await login();
  selectedName = 'Updated Name';
  const second = await login('google-user-1', first.cookie);
  assert.equal(second.user.id, first.user.id);
  assert.equal(second.user.name, 'Practice Learner'); // User-selected profile names survive later Google sign-ins.
  assert.notEqual(second.cookie, first.cookie);
  assert.equal((await (await handleAccounts(request('/api/auth/session', { cookie: first.cookie }), env)).json()).user, null);
  db.sqlite.prepare('UPDATE cnr_account_sessions SET expires_at = 1').run();
  assert.equal((await (await handleAccounts(request('/api/auth/session', { cookie: second.cookie }), env)).json()).user, null);
});

test('snapshots are isolated by identity and stale revisions cannot overwrite saved changes', async () => {
  const alice = await login('alice');
  const bob = await login('bob');
  const read = async current => (await handleAccounts(request('/api/learning', { cookie: current.cookie, headers: { 'X-CNR-User': current.user.id } }), env));
  assert.deepEqual(await (await read(alice)).json(), { revision: 0, data: null, updatedAt: null });
  const saved = await handleAccounts(request('/api/learning', { method: 'PUT', cookie: alice.cookie, headers: authHeaders(alice), body: { revision: 0, data: snapshot('Alice note') } }), env);
  assert.equal(saved.status, 200); assert.equal((await saved.json()).revision, 1);
  assert.equal((await (await read(bob)).json()).data, null);
  const stale = await handleAccounts(request('/api/learning', { method: 'PUT', cookie: alice.cookie, headers: authHeaders(alice), body: { revision: 0, data: snapshot('Stale edit') } }), env);
  assert.equal(stale.status, 409);
  assert.deepEqual(await stale.json(), { error: 'revision_conflict', revision: 1 });
  assert.match(JSON.stringify(await (await read(alice)).json()), /Alice note/);
  const switched = await handleAccounts(request('/api/learning', { cookie: bob.cookie, headers: { 'X-CNR-User': alice.user.id } }), env);
  assert.equal(switched.status, 409);
  assert.deepEqual(await switched.json(), { error: 'account_changed' });
});

test('mutation origin, identity, CSRF and content type are independently enforced', async () => {
  const current = await login();
  const body = { revision: 0, data: snapshot() };
  for (const changed of [{ Origin: 'https://evil.invalid' }, { Origin: '' }, { 'X-CSRF-Token': 'invalid' }, { 'X-CSRF-Token': '' }]) {
    const result = await handleAccounts(request('/api/learning', { method: 'PUT', cookie: current.cookie, headers: { ...authHeaders(current), ...changed }, body }), env);
    assert.equal(result.status, 403);
  }
  assert.equal((await handleAccounts(request('/api/learning', { method: 'PUT', cookie: current.cookie, headers: { ...authHeaders(current), 'Content-Type': 'text/plain' }, body }), env)).status, 415);
  assert.equal((await handleAccounts(request('/api/learning'), env)).status, 401);
  assert.equal((await handleAccounts(request('/api/auth/session', { headers: { Origin: 'http://localhost:8000' } }), env)).status, 403);
  assert.equal((await handleAccounts(request('/api/learning', { method: 'OPTIONS', headers: { Origin: 'https://evil.invalid' } }), env)).status, 403);
});

test('simultaneous saves from the same revision accept exactly one writer', async () => {
  const current = await login();
  const responses = await Promise.all(['first writer', 'second writer'].map(note => handleAccounts(request('/api/learning', {
    method: 'PUT', cookie: current.cookie, headers: authHeaders(current), body: { revision: 0, data: snapshot(note) },
  }), env)));
  assert.deepEqual(responses.map(result => result.status).sort(), [200, 409]);
  const stored = db.sqlite.prepare('SELECT revision, data_json FROM cnr_account_learning WHERE user_id=?').get(current.user.id);
  assert.equal(stored.revision, 1);
  assert.match(stored.data_json, /first writer|second writer/);
});

test('invalid provider identity and duplicate callback cookies cannot create a login', async () => {
  const challenge = await begin();
  const duplicate = { ...challenge, cookie: challenge.cookie + '; ' + challenge.cookie };
  assert.equal((await callback(duplicate)).headers.get('location'), SITE + '/learn/?auth=error');
  selectedSubject = '';
  assert.equal((await callback(challenge)).headers.get('location'), SITE + '/learn/?auth=error');
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_users').get().n, 0);
});

test('snapshot shape, unsafe keys, nesting and streamed byte limits reject input without writes', async () => {
  const current = await login();
  for (const data of [{}, { ...snapshot(), version: 2 }, JSON.parse(JSON.stringify(snapshot()).replace('"done":{}', '"done":{"__proto__":{}}'))]) {
    const result = await handleAccounts(request('/api/learning', { method: 'PUT', cookie: current.cookie, headers: authHeaders(current), body: { revision: 0, data } }), env);
    assert.equal(result.status, 400);
  }
  const oversized = snapshot('界'.repeat(Math.ceil(SNAPSHOT_MAX_BYTES / 3)));
  assert.equal((await handleAccounts(request('/api/learning', { method: 'PUT', cookie: current.cookie, headers: authHeaders(current), body: { revision: 0, data: oversized } }), env)).status, 413);
  let canceled = false;
  const body = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(65536).fill(32)); }, cancel() { canceled = true; } });
  const streamed = new Request(SITE + '/api/learning', { method: 'PUT', headers: { ...authHeaders(current), Cookie: current.cookie }, body, duplex: 'half' });
  assert.equal((await handleAccounts(streamed, env)).status, 413); assert(canceled);
  assert.equal(db.sqlite.prepare('SELECT revision FROM cnr_account_learning WHERE user_id=?').get(current.user.id).revision, 0);
});

test('logout revokes only its session; deletion cascades all account sessions and snapshots, preserving feedback', async () => {
  const first = await login('alice');
  const second = await login('alice');
  const bob = await login('bob');
  db.sqlite.prepare("INSERT INTO votes VALUES ('/docs/a/', 'reader', 1, NULL, 'today', 'today')").run();
  const logout = await handleAccounts(request('/api/auth/logout', { method: 'POST', cookie: first.cookie, headers: authHeaders(first) }), env);
  assert.equal(logout.status, 200);
  assert.equal((await (await handleAccounts(request('/api/auth/session', { cookie: first.cookie }), env)).json()).user, null);
  assert((await (await handleAccounts(request('/api/auth/session', { cookie: second.cookie }), env)).json()).user);
  const deletion = await handleAccounts(request('/api/auth/account', { method: 'DELETE', cookie: second.cookie, headers: authHeaders(second) }), env);
  assert.equal(deletion.status, 200);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_users WHERE id=?').get(first.user.id).n, 0);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_sessions WHERE user_id=?').get(first.user.id).n, 0);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_learning WHERE user_id=?').get(first.user.id).n, 0);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM votes').get().n, 1);
  assert((await (await handleAccounts(request('/api/auth/session', { cookie: bob.cookie }), env)).json()).user);
});

test('revocation between authentication and a write cannot recreate or overwrite account data', async () => {
  const current = await login();
  const originalPrepare = db.prepare.bind(db);
  db.prepare = sql => {
    if (sql.startsWith('UPDATE cnr_account_learning')) db.sqlite.prepare('DELETE FROM cnr_account_users WHERE id=?').run(current.user.id);
    return originalPrepare(sql);
  };
  const result = await handleAccounts(request('/api/learning', { method: 'PUT', cookie: current.cookie, headers: authHeaders(current), body: { revision: 0, data: snapshot('No resurrection') } }), env);
  assert.equal(result.status, 401);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_learning').get().n, 0);
});

test('rate limits and database failures fail safely without exposing upstream details', async () => {
  env.AUTH_LIMIT.limit = async () => ({ success: false });
  assert.equal((await handleAccounts(request('/api/auth/session'), env)).status, 429);
  env.AUTH_LIMIT.limit = async () => ({ success: true });
  env.DB.batch = async () => { throw new Error('sensitive SQL details'); };
  const failure = await handleAccounts(request('/api/auth/google'), env);
  assert.equal(failure.headers.get('location'), SITE + '/learn/?auth=error');
  assert.equal(await failure.text(), '');
});

test('email registration requires explicit password-confirmed verification before login and reset revokes sessions', async () => {
  enableEmail();
  const email = 'student@example.com';
  const registered = await emailRequest('/api/auth/register', { email, password: PASSWORD, name: 'Student' });
  assert.equal(registered.status, 202);
  const encoded = db.sqlite.prepare('SELECT password_hash FROM cnr_account_password_credentials WHERE email=?').get(email).password_hash;
  assert.match(encoded, /^scrypt-v1\$16384\$8\$5\$/); assert(!encoded.includes(PASSWORD));
  const token = emailedToken('verify');
  assert.equal((await emailRequest('/api/auth/login', { email, password: PASSWORD })).status, 401);
  assert.equal((await emailRequest('/api/auth/verify-email', { token, password: NEW_PASSWORD })).status, 400);
  assert.equal((await emailRequest('/api/auth/verify-email', { token, password: PASSWORD })).status, 200);
  assert.equal((await emailRequest('/api/auth/verify-email', { token, password: PASSWORD })).status, 400);
  const current = await passwordLogin(email);
  assert.equal(current.user.emailVerified, true); assert.equal(current.user.hasPassword, true); assert.equal(current.user.googleLinked, false);
  await emailRequest('/api/auth/forgot-password', { email });
  const reset = emailedToken('reset');
  assert.equal((await emailRequest('/api/auth/reset-password', { token: reset, password: NEW_PASSWORD })).status, 200);
  assert.equal((await (await handleAccounts(request('/api/auth/session', { cookie: current.cookie }), env)).json()).user, null);
  assert.equal((await emailRequest('/api/auth/login', { email, password: PASSWORD })).status, 401);
  assert((await passwordLogin(email, NEW_PASSWORD)).user);
  assert.equal((await emailRequest('/api/auth/reset-password', { token: reset, password: PASSWORD })).status, 400);
});

test('authenticated profile and password changes bind identity, verify the old password, and revoke sessions', async () => {
  enableEmail();
  await emailRequest('/api/auth/register', { email: 'profile@example.com', password: PASSWORD, name: 'Before' });
  await emailRequest('/api/auth/verify-email', { token: emailedToken('verify'), password: PASSWORD });
  const current = await passwordLogin('profile@example.com');
  assert.equal((await emailRequest('/api/auth/profile', { name: 'After' }, current, 'PATCH')).status, 200);
  assert.equal((await (await handleAccounts(request('/api/auth/session', { cookie: current.cookie }), env)).json()).user.name, 'After');
  assert.equal((await emailRequest('/api/auth/password', { currentPassword: 'Wrong long password', newPassword: NEW_PASSWORD }, current)).status, 403);
  assert.equal((await emailRequest('/api/auth/password', { currentPassword: PASSWORD, newPassword: NEW_PASSWORD }, current)).status, 200);
  assert.equal((await (await handleAccounts(request('/api/auth/session', { cookie: current.cookie }), env)).json()).user, null);
  assert((await passwordLogin('profile@example.com', NEW_PASSWORD)).user);
});

test('Google linking is explicit and session-bound, and unlink requires a verified usable alternative', async () => {
  enableEmail();
  await emailRequest('/api/auth/register', { email: 'link@example.com', password: PASSWORD, name: 'Local name' });
  await emailRequest('/api/auth/verify-email', { token: emailedToken('verify'), password: PASSWORD });
  const current = await passwordLogin('link@example.com');
  const start = await handleAccounts(request('/api/auth/google/link', { method: 'POST', cookie: current.cookie, headers: authHeaders(current) }), env);
  assert.equal(start.status, 200);
  const url = new URL((await start.json()).url);
  const completed = await callback({ url, cookie: cookiePair(start, '__Host-cnr_oauth') }, current.cookie);
  assert.equal(completed.headers.get('location'), SITE + '/profile/?auth=linked');
  const google = await login('google-user-1');
  assert.equal(google.user.id, current.user.id); assert.equal(google.user.name, 'Local name');
  const unlinked = await handleAccounts(request('/api/auth/google/link', { method: 'DELETE', cookie: current.cookie, headers: authHeaders(current) }), env);
  assert.equal(unlinked.status, 200);
  assert.equal((await (await handleAccounts(request('/api/auth/session', { cookie: google.cookie }), env)).json()).user, null);
  const onlyGoogle = await login('only-google');
  assert.equal((await handleAccounts(request('/api/auth/google/link', { method: 'DELETE', cookie: onlyGoogle.cookie, headers: authHeaders(onlyGoogle) }), env)).status, 409);
});

test('pending Google email can be replaced or canceled, and abandoned reservations expire', async () => {
  enableEmail();
  const current = await login('pending-owner');
  assert.equal((await emailRequest('/api/auth/email', { email: 'first@example.com', password: PASSWORD }, current)).status, 202);
  const oldToken = emailedToken('verify');
  assert.equal((await emailRequest('/api/auth/email', { email: 'second@example.com', password: NEW_PASSWORD }, current)).status, 202);
  assert.equal((await emailRequest('/api/auth/verify-email', { token: oldToken, password: PASSWORD })).status, 400);
  assert.equal((await emailRequest('/api/auth/email', {}, current, 'DELETE')).status, 200);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_password_credentials WHERE user_id=?').get(current.user.id).n, 0);
  await emailRequest('/api/auth/email', { email: 'expired@example.com', password: PASSWORD }, current);
  db.sqlite.prepare('UPDATE cnr_account_password_credentials SET updated_at=1 WHERE user_id=?').run(current.user.id);
  assert.equal((await emailRequest('/api/auth/register', { email: 'expired@example.com', password: NEW_PASSWORD, name: 'Mailbox owner' })).status, 202);
  const reserved = db.sqlite.prepare('SELECT user_id FROM cnr_account_password_credentials WHERE email=?').get('expired@example.com');
  assert.notEqual(reserved.user_id, current.user.id);
  assert(db.sqlite.prepare('SELECT id FROM cnr_account_users WHERE id=?').get(current.user.id));
});

test('v2 migration preserves legacy users/sessions/snapshots/votes and never relinks after reapplication', () => {
  const legacy = new DatabaseSync(':memory:');
  try {
    legacy.exec(readFileSync(new URL('../worker/compilenrun-worker/accounts-schema.sql', import.meta.url), 'utf8'));
    legacy.exec(readFileSync(new URL('../worker/compilenrun-worker/schema.sql', import.meta.url), 'utf8'));
    legacy.exec("INSERT INTO cnr_account_users VALUES ('legacy-id','legacy-google','Kept name',1,1); INSERT INTO cnr_account_sessions VALUES ('hash','legacy-id',1,9999999999); INSERT INTO cnr_account_learning VALUES ('legacy-id',3,'{}',1); INSERT INTO votes VALUES ('/docs/a/','voter',1,NULL,'before','before');");
    const migration = readFileSync(new URL('../worker/compilenrun-worker/accounts-email-schema.sql', import.meta.url), 'utf8');
    legacy.exec(migration);
    assert.equal(legacy.prepare('SELECT user_id FROM cnr_account_google_identities').get().user_id, 'legacy-id');
    assert.equal(legacy.prepare('SELECT user_id FROM cnr_account_legacy_google_migrations').get().user_id, 'legacy-id');
    assert.equal(legacy.prepare('SELECT revision FROM cnr_account_learning').get().revision, 3);
    assert.equal(legacy.prepare('SELECT COUNT(*) AS n FROM cnr_account_sessions').get().n, 1);
    assert.equal(legacy.prepare('SELECT COUNT(*) AS n FROM votes').get().n, 1);
    legacy.exec('DELETE FROM cnr_account_google_identities');
    legacy.exec(migration);
    assert.equal(legacy.prepare('SELECT COUNT(*) AS n FROM cnr_account_google_identities').get().n, 0);
  } finally { legacy.close(); }
});

test('a late v1 Google user is migrated once without relinking an intentionally unlinked legacy identity', async () => {
  db.sqlite.exec("INSERT INTO cnr_account_users VALUES ('late-legacy','late-google','Old name',1,1); INSERT INTO cnr_account_learning VALUES ('late-legacy',7,'{}',1);");
  const first = await login('late-google');
  assert.equal(first.user.id, 'late-legacy');
  assert.equal(db.sqlite.prepare('SELECT revision FROM cnr_account_learning WHERE user_id=?').get('late-legacy').revision, 7);
  assert.equal(db.sqlite.prepare('SELECT user_id FROM cnr_account_legacy_google_migrations WHERE user_id=?').get('late-legacy').user_id, 'late-legacy');
  db.sqlite.prepare('DELETE FROM cnr_account_google_identities WHERE user_id=?').run('late-legacy');
  const second = await login('late-google');
  assert.notEqual(second.user.id, 'late-legacy');
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_google_identities WHERE user_id=?').get('late-legacy').n, 0);
});


test('provider redirects are returned for rejection and never followed with credentials', async () => {
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(options.redirect, 'manual');
    return new Response(null, { status: 302, headers: { location: 'https://untrusted.example/collect' } });
  };
  const result = await callback(await begin());
  assert.equal(result.headers.get('location'), SITE + '/learn/?auth=error');
  assert.equal(calls, 1);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS count FROM cnr_account_sessions').get().count, 0);
  const { sendAccountEmail } = await import('../worker/compilenrun-worker/src/email.js');
  await assert.rejects(sendAccountEmail({ BREVO_API_KEY: 'test-only', BREVO_SENDER_EMAIL: 'no-reply@compilenrun.com' }, 'test@example.invalid', 'verify', 'A'.repeat(43)), error => error.status === 302);
  assert.equal(calls, 2);
});

async function beginGithub(cookie = '', headers = {}) {
  const response = await handleAccounts(request(cookie ? '/api/auth/github/link' : '/api/auth/github', cookie ? { method: 'POST', cookie, headers } : {}), env);
  const location = cookie ? (await response.json()).url : response.headers.get('location');
  return { response, url: new URL(location), cookie: cookiePair(response, '__Host-cnr_oauth') };
}
async function callbackGithub(challenge, extraCookie = '') {
  return handleAccounts(request(GITHUB_CALLBACK + '?state=' + challenge.url.searchParams.get('state') + '&code=gh-code', { cookie: [challenge.cookie, extraCookie].filter(Boolean).join('; ') }), env);
}
async function sessionOf(cookie) { return (await (await handleAccounts(request('/api/auth/session', { cookie }), env)).json()); }

test('GitHub sign-in creates an account with the login and primary verified email, and signs the same account in next time', async () => {
  const challenge = await beginGithub();
  assert.equal(challenge.url.origin + challenge.url.pathname, 'https://github.com/login/oauth/authorize');
  assert.equal(challenge.url.searchParams.get('scope'), 'read:user user:email');
  assert.equal(challenge.url.searchParams.get('code_challenge_method'), 'S256');
  const done = await callbackGithub(challenge);
  assert.equal(done.headers.get('location'), SITE + '/learn/');
  const cookie = cookiePair(done, '__Host-cnr_session');
  const first = await sessionOf(cookie);
  assert.equal(first.providers.github, true);
  assert.deepEqual([first.user.name, first.user.githubLinked, first.user.githubLogin, first.user.googleLinked, first.user.email], ['Mona Octocat', true, 'octocat', false, null]);
  const profile = db.sqlite.prepare('SELECT login, email, email_verified FROM cnr_account_github_profiles WHERE github_id = ?').get('4242');
  assert.deepEqual({ ...profile }, { login: 'octocat', email: 'mona@example.invalid', email_verified: 1 });
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_password_credentials').get().n, 0);
  const again = await callbackGithub(await beginGithub());
  const second = await sessionOf(cookiePair(again, '__Host-cnr_session'));
  assert.equal(second.user.id, first.user.id);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_users').get().n, 1);
});

test('a Google challenge cannot be redeemed at the GitHub callback, and a failed GitHub exchange signs nobody in', async () => {
  const google = await begin();
  const crossed = await handleAccounts(request(GITHUB_CALLBACK + '?state=' + google.url.searchParams.get('state') + '&code=gh-code', { cookie: google.cookie }), env);
  assert.equal(crossed.headers.get('location'), SITE + '/learn/?auth=error');
  assert.equal(upstream.some(call => call.url.startsWith('https://github.com/')), false);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_oauth_challenges').get().n, 1, 'the Google challenge is untouched');
  tokenFailure = true;
  const failed = await callbackGithub(await beginGithub());
  assert.equal(failed.headers.get('location'), SITE + '/learn/?auth=error');
  assert.equal(cookiePair(failed, '__Host-cnr_session'), undefined);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_users').get().n, 0);
});

test('linking GitHub to a Google account makes Google unlinkable; the last sign-in method cannot be unlinked', async () => {
  const current = await login('google-user-1');
  const challenge = await beginGithub(current.cookie, authHeaders(current));
  const linked = await callbackGithub(challenge, current.cookie);
  assert.equal(linked.headers.get('location'), SITE + '/profile/?auth=linked');
  const both = await sessionOf(current.cookie);
  assert.deepEqual([both.user.googleLinked, both.user.githubLinked, both.user.githubLogin], [true, true, 'octocat']);
  assert.equal(both.user.id, current.user.id);
  const unlinked = await handleAccounts(request('/api/auth/google/link', { method: 'DELETE', cookie: current.cookie, headers: authHeaders(current) }), env);
  assert.equal(unlinked.status, 200, 'Google can go because GitHub remains');
  assert.equal((await sessionOf(current.cookie)).user, null, 'unlinking signs the account out everywhere');
  const viaGithub = await sessionOf(cookiePair(await callbackGithub(await beginGithub()), '__Host-cnr_session'));
  assert.equal(viaGithub.user.id, current.user.id);
  assert.deepEqual([viaGithub.user.googleLinked, viaGithub.user.githubLinked], [false, true]);
  const ghCookie = cookiePair(await callbackGithub(await beginGithub()), '__Host-cnr_session');
  const ghLogin = await sessionOf(ghCookie);
  const refused = await handleAccounts(request('/api/auth/github/link', { method: 'DELETE', cookie: ghCookie, headers: authHeaders({ user: ghLogin.user, csrfToken: ghLogin.csrfToken }) }), env);
  assert.equal(refused.status, 409);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_github_identities').get().n, 1);
  const existing = await login('google-user-2');
  const taken = await callbackGithub(await beginGithub(existing.cookie, authHeaders(existing)), existing.cookie);
  assert.equal(taken.headers.get('location'), SITE + '/profile/?auth=error', 'a GitHub identity already attached to another account cannot be moved');
});

test('a readable signed-in hint cookie accompanies the session cookie, is cleared on logout, and a stale hint is cleared by the session check', async () => {
  const alice = await login('alice');
  const hint = alice.response.headers.getSetCookie().find(value => value.startsWith('cnr_signed_in='));
  assert.match(hint, /^cnr_signed_in=1; Path=\/; Max-Age=2592000; Secure; SameSite=Lax$/);
  assert.doesNotMatch(hint, /HttpOnly/); // readable by the page: its presence is the only information it carries
  const logout = await handleAccounts(request('/api/auth/logout', { method: 'POST', cookie: alice.cookie, headers: authHeaders(alice) }), env);
  assert.match(logout.headers.getSetCookie().find(value => value.startsWith('cnr_signed_in=')), /^cnr_signed_in=; Path=\/; Max-Age=0/);
  const stale = await handleAccounts(request('/api/auth/session', { cookie: alice.cookie + '; cnr_signed_in=1' }), env);
  assert.equal((await stale.json()).user, null);
  assert.match(stale.headers.getSetCookie().find(value => value.startsWith('cnr_signed_in=')), /Max-Age=0/);
  assert.match(stale.headers.getSetCookie().find(value => value.startsWith('__Host-cnr_session=')), /Max-Age=0/);
  const guest = await handleAccounts(request('/api/auth/session'), env);
  assert.equal(guest.headers.getSetCookie().length, 0); // a plain guest check sets nothing
});
