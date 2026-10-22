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
    this.sqlite.exec(readFileSync(new URL('../worker/compilenrun-worker/accounts-learning-records-schema.sql', import.meta.url), 'utf8'));
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
      sql,
      bind: (...args) => statement(args),
      first: async () => {
        if (sql.includes('AS rows_json')) this.learningQuery = { sql, values };
        return native.get(...values) || null;
      },
      run: async () => executeWithD1Changes(values),
      runSync: () => executeWithD1Changes(values),
      all: async () => ({ success: true, results: native.all(...values) }),
    });
    return statement([]);
  }
  async batch(statements) {
    if (this.beforeBatch) { const hook = this.beforeBatch; this.beforeBatch = null; hook(this.sqlite); }
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
let jwks = [], googleKeyPair = null;
const b64url = bytes => Buffer.from(bytes).toString('base64url');
async function googleKey(kid = 'kid-1') {
  if (!googleKeyPair) googleKeyPair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', googleKeyPair.publicKey);
  return { kid, jwk: { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RS256', use: 'sig', kid } };
}
// A Google Identity Services credential: an RS256 ID token signed with the test key.
async function googleCredential(overrides = {}, { kid = 'kid-1', tamper = false } = {}) {
  await googleKey(kid);
  const time = Math.floor(Date.now() / 1000);
  const payload = { iss: 'https://accounts.google.com', aud: 'test.apps.googleusercontent.com', sub: 'google-user-1', exp: time + 300, iat: time,
    nonce: 'n'.repeat(43), email: 'reader@example.invalid', email_verified: true, name: 'One Tap Reader', ...overrides };
  const header = b64url(Buffer.from(JSON.stringify({ alg: 'RS256', kid, typ: 'JWT' })));
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const signature = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', googleKeyPair.privateKey, new TextEncoder().encode(header + '.' + body)));
  if (tamper) signature[0] ^= 1;
  return header + '.' + body + '.' + b64url(signature);
}
const postCredential = (credential, nonce = 'n'.repeat(43), headers = { origin: SITE }) =>
  handleAccounts(request('/api/auth/google/credential', { method: 'POST', body: { credential, nonce }, headers }), env);

beforeEach(() => {
  db = new D1();
  env = { SITE_ORIGIN: 'https://www.compilenrun.com', DB: db, AUTH_LIMIT: { limit: async () => ({ success: true }) }, GOOGLE_CLIENT_ID: 'test.apps.googleusercontent.com', GOOGLE_CLIENT_SECRET: 'test-secret-not-real', GITHUB_CLIENT_ID: 'Iv1.test', GITHUB_CLIENT_SECRET: 'github-secret-not-real' };
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
      assert.equal(fields.get('redirect_uri'), env.SITE_ORIGIN + OAUTH_CALLBACK);
      assert.equal(fields.get('grant_type'), 'authorization_code');
      assert.match(fields.get('code_verifier'), /^[A-Za-z0-9_-]{43}$/);
      return Response.json(tokenFailure ? { error: 'invalid_grant' } : { access_token: 'mock-token-do-not-store', token_type: 'Bearer', id_token: 'unverified-and-ignored' }, { status: tokenFailure ? 400 : 200 });
    }
    if (url === 'https://github.com/login/oauth/access_token') {
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.accept, 'application/json');
      const fields = new URLSearchParams(options.body);
      assert.equal(fields.get('redirect_uri'), env.SITE_ORIGIN + GITHUB_CALLBACK);
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
    if (url === 'https://www.googleapis.com/oauth2/v3/certs') return Response.json({ keys: jwks }, { headers: { 'cache-control': 'public, max-age=3600' } });
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
  assert.deepEqual(await (await read(alice)).json(), { revision: 0, data: null, updatedAt: null, syncProtocol: 2, incremental: false });
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
  const stored = db.sqlite.prepare('SELECT revision FROM cnr_learning_state WHERE user_id=?').get(current.user.id);
  assert.equal(stored.revision, 1);
  const lesson = db.sqlite.prepare("SELECT data_json FROM cnr_learning_records WHERE user_id=? AND kind='lesson'").get(current.user.id);
  assert.match(lesson.data_json, /first writer|second writer/);
});

const learningRead = (current, revision) => handleAccounts(request('/api/learning', { cookie: current.cookie,
  headers: { 'X-CNR-User': current.user.id, ...(revision === undefined ? {} : { 'X-CNR-Revision': String(revision) }) } }), env);
const learningPut = (current, revision, data) => handleAccounts(request('/api/learning', { method: 'PUT', cookie: current.cookie,
  headers: authHeaders(current), body: { revision, data } }), env);
const learningPatch = (current, revision, changes) => handleAccounts(request('/api/learning', { method: 'PATCH', cookie: current.cookie,
  headers: authHeaders(current), body: { revision, changes, exportedAt: '2026-10-17T12:00:00.000Z' } }), env);
const totalChanges = () => db.sqlite.prepare('SELECT total_changes() AS n').get().n;

test('repeatable schema and lazy conversion preserve every legacy record and revision until a successful save', async () => {
  const current = await login(), original = snapshot('Legacy note');
  original.progress.done['/docs/language/css/'] = 123;
  original.progress.tuts['language/css'] = { label: 'CSS', t: 123 };
  original.playground.drafts.workspace = { html: '<p>Legacy draft</p>', css: '', js: '' };
  db.sqlite.prepare('UPDATE cnr_account_learning SET revision=7, data_json=?, updated_at=100 WHERE user_id=?').run(JSON.stringify(original), current.user.id);
  db.sqlite.exec(readFileSync(new URL('../worker/compilenrun-worker/accounts-learning-records-schema.sql', import.meta.url), 'utf8'));
  const before = totalChanges(), legacy = await (await learningRead(current)).json();
  assert.deepEqual(legacy.data, original); assert.equal(legacy.revision, 7); assert.equal(legacy.incremental, false);
  assert.equal(totalChanges(), before, 'Reading a legacy snapshot must not backfill rows');
  assert.equal((await learningPatch(current, 7, [])).status, 409);
  const saved = await learningPut(current, 7, original);
  assert.equal(saved.status, 200); assert.equal((await saved.json()).revision, 8);
  assert.equal(db.sqlite.prepare('SELECT data_json FROM cnr_account_learning WHERE user_id=?').get(current.user.id).data_json, null);
  assert.deepEqual((await (await learningRead(current)).json()).data, original);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_learning_records WHERE user_id=?').get(current.user.id).n, 4);
});

test('one-record edits write two rows regardless of collection size; no-op saves and revision reads write zero', async () => {
  const current = await login(), data = snapshot('Original');
  for (let i = 0; i < 2000; i++) data.progress.done['/docs/lesson-' + i + '/'] = i + 1;
  assert.equal((await learningPut(current, 0, data)).status, 200);
  const before = totalChanges(), row = { ...data.learning.lessons['/docs/language/css/'], note: { text: 'Changed', updatedAt: 1 } };
  const saved = await learningPatch(current, 1, [{ kind: 'lesson', key: '/docs/language/css/', value: row }]);
  assert.equal(saved.status, 200); assert.equal((await saved.json()).revision, 2);
  assert.equal(totalChanges() - before, 2);
  const plan = db.sqlite.prepare('EXPLAIN QUERY PLAN ' + db.learningQuery.sql).all(...db.learningQuery.values);
  assert(plan.some(row => /SEARCH r USING PRIMARY KEY \(user_id=\? AND kind=\? AND record_key=\?\)/.test(row.detail)), JSON.stringify(plan));
  const after = totalChanges();
  const unchanged = await (await learningRead(current, 2)).json();
  assert.equal(unchanged.unchanged, true); assert.equal(Object.hasOwn(unchanged, 'data'), false);
  assert.equal((await learningPatch(current, 2, [{ kind: 'lesson', key: '/docs/language/css/', value: row }])).status, 200);
  const roundtrip = (await (await learningRead(current)).json()).data;
  roundtrip.exportedAt = '2026-10-17T13:00:00.000Z';
  assert.equal((await learningPut(current, 2, roundtrip)).status, 200);
  assert.equal(totalChanges(), after);
});

test('full PUT remains compatible and deletes removed records while updating only changed rows', async () => {
  const current = await login(), initial = snapshot('Original');
  initial.progress.done['/docs/keep/'] = 1; initial.progress.done['/docs/delete/'] = 2;
  await learningPut(current, 0, initial);
  const changed = snapshot('Updated'); changed.progress.done['/docs/keep/'] = 1;
  const before = totalChanges();
  assert.equal((await learningPut(current, 1, changed)).status, 200);
  assert.equal(totalChanges() - before, 3, 'One head, one changed lesson, and one deletion');
  assert.deepEqual((await (await learningRead(current)).json()).data, changed);
});

test('a CAS loser cannot change records when a competing batch reaches the same next revision', async () => {
  const current = await login(); await learningPut(current, 0, snapshot('Winner'));
  db.beforeBatch = sqlite => sqlite.prepare("UPDATE cnr_learning_state SET revision=2, write_token='another-batch' WHERE user_id=?").run(current.user.id);
  const result = await learningPatch(current, 1, [{ kind: 'lesson', key: '/docs/language/css/', value: snapshot('Loser').learning.lessons['/docs/language/css/'] }]);
  assert.equal(result.status, 409); assert.equal((await result.json()).revision, 2);
  assert.equal((await (await learningRead(current)).json()).data.learning.lessons['/docs/language/css/'].note.text, 'Winner');
});

test('failed record writes roll back the revision, accounting and lazy snapshot conversion together', async () => {
  const current = await login(), data = snapshot('Preserved legacy');
  db.sqlite.prepare('UPDATE cnr_account_learning SET data_json=? WHERE user_id=?').run(JSON.stringify(data), current.user.id);
  db.sqlite.exec("CREATE TRIGGER fail_record BEFORE INSERT ON cnr_learning_records BEGIN SELECT RAISE(ABORT, 'test failure'); END;");
  assert.equal((await learningPut(current, 0, data)).status, 503);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_learning_state').get().n, 0);
  assert.deepEqual((await (await learningRead(current)).json()).data, data);
});

test('patches enforce aggregate byte and record limits, reject duplicate or unsafe keys, and preserve deletions', async () => {
  const current = await login(); await learningPut(current, 0, snapshot());
  const large = { html: '界'.repeat(250000) };
  assert.equal((await learningPatch(current, 1, [{ kind: 'draft', key: 'one', value: large }])).status, 200);
  assert.equal((await learningPatch(current, 2, [{ kind: 'draft', key: 'two', value: large }])).status, 200);
  const before = totalChanges();
  assert.equal((await learningPatch(current, 3, [{ kind: 'draft', key: 'three', value: large }])).status, 413);
  for (const changes of [
    [{ kind: 'unknown', key: 'x', value: {} }],
    [{ kind: 'lesson', key: '__proto__', value: {} }],
    [{ kind: 'read', key: '/docs/x/', value: -1 }],
    [{ kind: 'draft', key: 'x', value: {} }, { kind: 'draft', key: 'x', value: null }],
  ]) assert.equal((await learningPatch(current, 3, changes)).status, 400);
  assert.equal(totalChanges(), before);
  assert.equal((await learningPatch(current, 3, [{ kind: 'draft', key: 'one', value: null }])).status, 200);
  const data = (await (await learningRead(current)).json()).data;
  assert.equal(data.playground.drafts.one, undefined); assert.deepEqual(data.playground.drafts.two, large);
  const reads = Array.from({ length: 20000 }, (_, i) => ({ kind: 'read', key: '/docs/' + i + '/', value: 1 }));
  assert.equal((await learningPatch(current, 4, reads)).status, 200);
  assert.equal((await learningPatch(current, 5, [{ kind: 'read', key: '/docs/extra/', value: 1 }])).status, 400);
});

test('PATCH keeps account, origin and CSRF boundaries and cannot recreate revoked or deleted data', async () => {
  const current = await login(); await learningPut(current, 0, snapshot('Private'));
  const bob = await login('bob');
  const changes = [{ kind: 'read', key: '/docs/a/', value: 1 }];
  for (const changed of [{ Origin: 'https://evil.invalid' }, { 'X-CSRF-Token': 'wrong' }, { 'X-CNR-User': bob.user.id }]) {
    const result = await handleAccounts(request('/api/learning', { method: 'PATCH', cookie: current.cookie,
      headers: { ...authHeaders(current), ...changed }, body: { revision: 1, changes, exportedAt: snapshot().exportedAt } }), env);
    assert([403, 409].includes(result.status));
  }
  db.beforeBatch = sqlite => sqlite.prepare('DELETE FROM cnr_account_sessions WHERE user_id=?').run(current.user.id);
  assert.equal((await learningPatch(current, 1, changes)).status, 401);
  db.sqlite.prepare('DELETE FROM cnr_account_users WHERE id=?').run(current.user.id);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_learning_state WHERE user_id=?').get(current.user.id).n, 0);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_learning_records WHERE user_id=?').get(current.user.id).n, 0);
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
  const nullLesson = snapshot(); nullLesson.learning.lessons['/docs/a/'] = null;
  const falseRead = snapshot(); falseRead.progress.done['/docs/a/'] = false;
  for (const data of [{}, { ...snapshot(), version: 2 }, nullLesson, falseRead, JSON.parse(JSON.stringify(snapshot()).replace('"done":{}', '"done":{"__proto__":{}}'))]) {
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
  db.beforeBatch = sqlite => sqlite.prepare('DELETE FROM cnr_account_users WHERE id=?').run(current.user.id);
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

test('a Google Identity Services credential signs in after signature, issuer, audience, expiry and nonce checks', async () => {
  jwks = [(await googleKey()).jwk];
  const ok = await postCredential(await googleCredential());
  assert.equal(ok.status, 200);
  assert.deepEqual(await ok.json(), { ok: true });
  const cookie = cookiePair(ok, '__Host-cnr_session');
  assert.ok(cookie);
  assert.match(ok.headers.getSetCookie().find(value => value.startsWith('cnr_signed_in=')), /cnr_signed_in=1/);
  const current = await (await handleAccounts(request('/api/auth/session', { cookie }), env)).json();
  assert.equal(current.user.name, 'One Tap Reader');
  assert.equal(current.user.googleLinked, true);
  assert.equal(current.user.googleEmail, 'reader@example.invalid');
  // The same Google account through the redirect flow is the same user: identities are keyed by sub.
  const viaOAuth = await login('google-user-1');
  assert.equal(viaOAuth.user.id, current.user.id);
  assert.equal(upstream.filter(call => call.url === 'https://www.googleapis.com/oauth2/v3/certs').length, 1, 'keys are cached between credentials');
});

test('forged, expired, foreign-audience, replayed-nonce and cross-origin credentials are rejected', async () => {
  jwks = [(await googleKey()).jwk];
  const cases = [
    ['tampered signature', await googleCredential({}, { tamper: true })],
    ['expired', await googleCredential({ exp: Math.floor(Date.now() / 1000) - 10 })],
    ['other audience', await googleCredential({ aud: 'someone-else.apps.googleusercontent.com' })],
    ['other issuer', await googleCredential({ iss: 'https://evil.example' })],
    ['nonce mismatch', await googleCredential({ nonce: 'x'.repeat(43) })],
    ['alg none', 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJnb29nbGUtdXNlci0xIn0.'],
  ];
  for (const [label, credential] of cases) {
    const rejected = await postCredential(credential);
    assert.equal(rejected.status, 401, label);
    assert.equal(rejected.headers.getSetCookie().length, 0, label + ' sets no cookie');
  }
  const noOrigin = await postCredential(await googleCredential(), 'n'.repeat(43), {});
  assert.equal(noOrigin.status, 403);
  const badNonce = await postCredential(await googleCredential(), 'short');
  assert.equal(badNonce.status, 400);
  // An unknown key id makes the Worker refresh Google's keys once; a rotated key then verifies.
  const before = upstream.filter(call => call.url === 'https://www.googleapis.com/oauth2/v3/certs').length;
  const rotated = await googleKey('kid-2');
  jwks = [rotated.jwk];
  const afterRotation = await postCredential(await googleCredential({}, { kid: 'kid-2' }));
  assert.equal(afterRotation.status, 200);
  assert.equal(upstream.filter(call => call.url === 'https://www.googleapis.com/oauth2/v3/certs').length, before + 1);
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM cnr_account_users').get().n, 1, 'rejected credentials create no accounts');
});

test('the same router serves a second site (echo.cool) from SITE_ORIGIN', async () => {
  const ECHO = 'https://www.echo.cool';
  env.SITE_ORIGIN = ECHO;
  const at = (path, options = {}) => new Request(ECHO + path, options);
  const session = await handleAccounts(at('/api/auth/session'), env);
  assert.equal(session.status, 200);
  assert.equal((await session.json()).configured, true);
  // The other deployment's host and origin are foreign here.
  assert.equal((await handleAccounts(request('/api/auth/session'), env)).status, 403);
  const crossOrigin = await handleAccounts(at('/api/auth/google/credential', { method: 'POST', headers: { Origin: SITE, 'content-type': 'application/json' },
    body: JSON.stringify({ credential: 'x', nonce: 'n'.repeat(43) }) }), env);
  assert.equal(crossOrigin.status, 403);
  const started = await handleAccounts(at('/api/auth/google'), env);
  assert.equal(started.status, 303);
  const authorization = new URL(started.headers.get('location'));
  assert.equal(authorization.searchParams.get('redirect_uri'), ECHO + OAUTH_CALLBACK);
  const oauthCookie = cookiePair(started, '__Host-cnr_oauth');
  const done = await handleAccounts(at(OAUTH_CALLBACK + '?state=' + authorization.searchParams.get('state') + '&code=test-code', { headers: { Cookie: oauthCookie } }), env);
  assert.equal(done.headers.get('location'), ECHO + '/learn/');
  assert.equal((await handleAccounts(at(OAUTH_CALLBACK + '?state=bad&code=x'), env)).headers.get('location'), ECHO + '/learn/?auth=error');
  // Ask AI / quiz / feedback CORS follows the same origin.
  const askCors = await worker.fetch(at('/api/ask', { method: 'OPTIONS', headers: { Origin: ECHO } }), env, {});
  assert.equal(askCors.status, 204);
  assert.equal(askCors.headers.get('access-control-allow-origin'), ECHO);
  assert.equal((await worker.fetch(at('/api/ask', { method: 'OPTIONS', headers: { Origin: SITE } }), env, {})).status, 403);
});

test('emails and the Ask AI prompt follow SITE_NAME / SITE_LANG', async () => {
  const { sendAccountEmail } = await import('../worker/compilenrun-worker/src/email.js');
  const { systemPrompt } = await import('../worker/compilenrun-worker/src/ai/ask.js');
  const { pageText } = await import('../worker/compilenrun-worker/src/ai/page-content.js');
  const echo = { SITE_ORIGIN: 'https://www.echo.cool', SITE_NAME: '代码酷', SITE_LANG: 'zh-CN', BREVO_API_KEY: 'test-only', BREVO_SENDER_EMAIL: 'no-reply@echo.cool' };
  await sendAccountEmail(echo, 'reader@example.invalid', 'reset', 'A'.repeat(43));
  const sent = mail.at(-1);
  assert.equal(sent.subject, '重置你的代码酷密码');
  assert.equal(sent.sender.name, '代码酷');
  assert.match(sent.textContent, /https:\/\/www\.echo\.cool\/profile\/#reset=A{43}/);
  await sendAccountEmail({ BREVO_API_KEY: 'test-only', BREVO_SENDER_EMAIL: 'no-reply@compilenrun.com' }, 'reader@example.invalid', 'verify', 'B'.repeat(43));
  assert.equal(mail.at(-1).subject, 'Verify your Compile N Run email');
  assert.match(mail.at(-1).textContent, /https:\/\/www\.compilenrun\.com\/profile\/#verify=/);
  assert.match(systemPrompt(echo), /代码酷 \(echo\.cool\)/);
  assert.match(systemPrompt(echo), /Simplified Chinese/);
  assert.match(systemPrompt({}), /Compile N Run \(compilenrun\.com\)/);
  assert.equal(pageText('<title>列表 | 代码酷</title><article data-pagefind-body><p>x</p></article>', '代码酷').title, '列表');
});
