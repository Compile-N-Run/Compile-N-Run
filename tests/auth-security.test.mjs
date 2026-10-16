// Independent email-credential security regressions. All mail is mocked; no live
// account, provider, database, or credential is touched. Router CSRF/session tests
// remain in accounts-worker.test.mjs; these target transactional email boundaries.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { handleEmailAccount } from '../worker/ask-ai/src/email-accounts.js';
import { handleAccounts } from '../worker/ask-ai/src/accounts.js';
import { hashPassword } from '../worker/ask-ai/src/passwords.js';

const SITE = 'https://www.compilenrun.com';
const PASSWORD = 'a distinct testing passphrase';
const NEW_PASSWORD = 'another distinct testing passphrase';
const hash = async value => createHash('sha256').update(value).digest('base64url');
const randomToken = () => randomBytes(32).toString('base64url');
const seconds = () => Math.floor(Date.now() / 1000);
class D1 {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:');
    for (const file of ['accounts-schema.sql', 'accounts-email-schema.sql', 'accounts-google-profile-schema.sql']) {
      this.sqlite.exec(readFileSync(new URL('../worker/ask-ai/' + file, import.meta.url), 'utf8'));
    }
    this.beforeBatch = null;
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
      first: async () => native.get(...values) || null,
      run: async () => executeWithD1Changes(values),
      all: async () => ({ success: true, results: native.all(...values) }),
      execute: () => executeWithD1Changes(values),
    });
    return statement([]);
  }
  async batch(statements) {
    if (this.beforeBatch && this.beforeBatch(this.sqlite, statements) !== false) this.beforeBatch = null;
    this.sqlite.exec('BEGIN');
    try { const result = statements.map(statement => statement.execute()); this.sqlite.exec('COMMIT'); return result; }
    catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
  }
}
let env, db, mails, originalFetch;
const kit = {
  hash, randomToken,
  readJSON: request => request.json(),
  reply(status, data, cookies = []) {
    const headers = new Headers({ 'content-type': 'application/json' });
    for (const value of cookies) headers.append('set-cookie', value);
    return new Response(JSON.stringify(data), { status, headers });
  },
  issueSession: async () => '__Host-cnr_session=unit-test; Secure; HttpOnly; Path=/',
  expiredSessionCookie: () => '__Host-cnr_session=; Max-Age=0; Secure; HttpOnly; Path=/',
};
beforeEach(() => {
  db = new D1(); mails = []; originalFetch = globalThis.fetch;
  env = { DB: db, AUTH_LIMIT: { limit: async () => ({ success: true }) }, EMAIL_PASSWORD_ENABLED: 'true',
    PASSWORD_PEPPER: 'test-only-pepper-with-at-least-thirty-two-characters', BREVO_API_KEY: 'mock-only', BREVO_SENDER_EMAIL: 'test@example.invalid', ACCOUNT_EMAIL_DAILY_LIMIT: '100' };
  globalThis.fetch = async (url, options) => {
    assert.equal(String(url), 'https://api.brevo.com/v3/smtp/email');
    mails.push(JSON.parse(options.body));
    return new Response('{"messageId":"mock"}', { status: 201, headers: { 'content-type': 'application/json' } });
  };
});
afterEach(() => { globalThis.fetch = originalFetch; db.sqlite.close(); });
function request(route, body, login = null, ip = '192.0.2.10') {
  return handleEmailAccount(new Request(SITE + '/api/auth/' + route, { method: 'POST',
    headers: { Origin: SITE, 'content-type': 'application/json', 'CF-Connecting-IP': ip }, body: JSON.stringify(body) }), env, undefined, login, kit);
}
async function account({ verified = true, google = false, email = 'learner@example.invalid' } = {}) {
  const id = randomUUID(), time = seconds(), encoded = await hashPassword(PASSWORD, env.PASSWORD_PEPPER);
  db.sqlite.prepare('INSERT INTO cnr_account_users VALUES (?, ?, ?, ?, ?)').run(id, 'local:' + id, 'Learner', time, time);
  db.sqlite.prepare('INSERT INTO cnr_account_password_credentials (user_id,email,password_hash,email_verified_at,created_at,updated_at) VALUES (?,?,?,?,?,?)')
    .run(id, email, encoded, verified ? time : null, time, time);
  if (google) db.sqlite.prepare('INSERT INTO cnr_account_google_identities VALUES (?,?,?)').run('google-' + id, id, time);
  return { id, email, passwordHash: encoded };
}
async function resetToken(user) {
  const token = randomToken();
  db.sqlite.prepare('INSERT INTO cnr_account_email_tokens VALUES (?,?,?,?,?,?,?)').run(await hash(token), user.id, user.email, 'reset', 1, seconds(), seconds() + 1800);
  return token;
}
function credential(user) { return db.sqlite.prepare('SELECT * FROM cnr_account_password_credentials WHERE user_id=?').get(user.id); }

test('unauthenticated recovery requests do not consume the legitimate password-login allowance', async () => {
  const user = await account();
  for (let attempt = 0; attempt < 10; attempt++) {
    assert.equal((await request('forgot-password', { email: user.email })).status, 202);
  }
  const result = await request('login', { email: user.email, password: PASSWORD }, null, '192.0.2.11');
  assert.equal(result.status, 200, 'Recovery traffic must not spend the per-email login budget');
});

test('password-change notification respects the shared transactional-mail daily budget', async () => {
  env.ACCOUNT_EMAIL_DAILY_LIMIT = '1';
  const user = await account();
  assert.equal((await request('forgot-password', { email: user.email })).status, 202);
  assert.equal(mails.length, 1);
  const sessionHash = 'unit-session';
  db.sqlite.prepare('INSERT INTO cnr_account_sessions VALUES (?,?,?,?)').run(sessionHash, user.id, seconds(), seconds() + 600);
  const result = await request('password', { currentPassword: PASSWORD, newPassword: NEW_PASSWORD }, { user: { id: user.id, name: 'Learner' }, tokenHash: sessionHash });
  assert.equal(result.status, 200);
  assert.equal(mails.length, 1, 'Changed-password notices must not bypass the daily mail cap');
  assert.equal(credential(user).version, 2);
});

test('unverified email on a Google-owned account cannot request or redeem a password reset', async () => {
  const user = await account({ verified: false, google: true });
  assert.equal((await request('forgot-password', { email: user.email })).status, 202);
  assert.equal(mails.length, 0, 'Mailbox ownership alone cannot activate credentials on a Google-owned account');
  const token = await resetToken(user); // A stale token issued before the Google link existed.
  const result = await request('reset-password', { token, password: NEW_PASSWORD });
  assert.equal(result.status, 400);
  assert.equal(credential(user).email_verified_at, null);
  assert.equal(credential(user).password_hash, user.passwordHash);
  assert.equal(credential(user).version, 1);
});

test('reset eligibility is checked atomically if Google linking races token redemption', async () => {
  const user = await account({ verified: false });
  const token = await resetToken(user);
  let raced = false;
  db.beforeBatch = (sqlite, statements) => {
    if (!statements.some(statement => /DELETE FROM cnr_account_email_tokens WHERE token_hash/.test(statement.sql))) return false;
    sqlite.prepare('INSERT INTO cnr_account_google_identities VALUES (?,?,?)').run('racing-google', user.id, seconds());
    raced = true;
  };
  const result = await request('reset-password', { token, password: NEW_PASSWORD });
  assert.equal(result.status, 400);
  assert.equal(raced, true, 'The identity must be added after lookup, immediately before token consumption');
  assert.equal(credential(user).email_verified_at, null);
  assert.equal(credential(user).password_hash, user.passwordHash);
  assert.equal(credential(user).version, 1);
});

test('an unverified email-only account can recover once; concurrent reset replay has one winner', async () => {
  const user = await account({ verified: false });
  const token = await resetToken(user);
  const results = await Promise.all([
    request('reset-password', { token, password: NEW_PASSWORD }, null, '192.0.2.12'),
    request('reset-password', { token, password: 'a different recovery passphrase' }, null, '192.0.2.13'),
  ]);
  assert.deepEqual(results.map(result => result.status).sort(), [200, 400]);
  assert.equal(credential(user).version, 2);
  assert.ok(credential(user).email_verified_at);
  assert.equal(db.sqlite.prepare('SELECT count(*) AS count FROM cnr_account_email_tokens WHERE user_id=?').get(user.id).count, 0);
});


function authRequest(route, method = 'GET', cookie = '', headers = {}) {
  return new Request(SITE + route, { method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...headers } });
}
function cookiePair(response, name) { return response.headers.getSetCookie().find(value => value.startsWith(name + '='))?.split(';')[0]; }
function googleProvider(sub, pauseToken, profile = { name: 'Google name' }) {
  const mailFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (String(url) === 'https://oauth2.googleapis.com/token') {
      if (pauseToken) await pauseToken();
      return Response.json({ access_token: 'mock-access-token', token_type: 'Bearer' });
    }
    if (String(url) === 'https://openidconnect.googleapis.com/v1/userinfo') return Response.json({ sub, ...profile });
    return mailFetch(url, options);
  };
  env.GOOGLE_CLIENT_ID = 'mock-client-id'; env.GOOGLE_CLIENT_SECRET = 'mock-client-secret';
}

test('Google identity must still be linked when normal sign-in atomically creates a session', async () => {
  const user = await account({ google: true });
  googleProvider('google-' + user.id);
  const begin = await handleAccounts(authRequest('/api/auth/google'), env);
  assert.equal(begin.status, 303);
  const state = new URL(begin.headers.get('location')).searchParams.get('state');
  const oauthCookie = cookiePair(begin, '__Host-cnr_oauth');
  const originalPrepare = db.prepare.bind(db);
  db.prepare = sql => {
    const statement = originalPrepare(sql);
    if (!/INSERT INTO cnr_account_sessions/.test(sql)) return statement;
    return { ...statement, bind: (...args) => {
      const bound = statement.bind(...args);
      return { ...bound, first: async () => {
        db.sqlite.prepare('DELETE FROM cnr_account_google_identities WHERE user_id=?').run(user.id);
        return bound.first();
      } };
    } };
  };
  const result = await handleAccounts(authRequest('/auth/google_oauth2/callback?state=' + state + '&code=mock-code', 'GET', oauthCookie), env);
  assert.equal(cookiePair(result, '__Host-cnr_session'), undefined);
  assert.equal(db.sqlite.prepare('SELECT count(*) AS count FROM cnr_account_sessions WHERE user_id=?').get(user.id).count, 0);
});

test('Google sign-in requests the email scope and stores the reported email and name; unlink removes them', async () => {
  googleProvider('google-new-learner', null, { name: 'Ada Lovelace', email: 'Ada@Example.test', email_verified: true });
  const begin = await handleAccounts(authRequest('/api/auth/google'), env);
  assert.equal(new URL(begin.headers.get('location')).searchParams.get('scope'), 'openid email profile');
  const state = new URL(begin.headers.get('location')).searchParams.get('state');
  const result = await handleAccounts(authRequest('/auth/google_oauth2/callback?state=' + state + '&code=mock-code', 'GET', cookiePair(begin, '__Host-cnr_oauth')), env);
  assert.equal(new URL(result.headers.get('location')).pathname, '/learn/');
  const row = db.sqlite.prepare('SELECT p.email, p.email_verified, p.name, g.user_id FROM cnr_account_google_profiles p JOIN cnr_account_google_identities g USING (google_sub) WHERE google_sub=?').get('google-new-learner');
  assert.equal(row.email, 'ada@example.test'); assert.equal(row.email_verified, 1); assert.equal(row.name, 'Ada Lovelace');
  const sessionBody = await (await handleAccounts(authRequest('/api/auth/session', 'GET', cookiePair(result, '__Host-cnr_session')), env)).json();
  assert.equal(sessionBody.user.googleEmail, 'ada@example.test'); assert.equal(sessionBody.user.email, null);
  // The Google email is informational: it never creates or matches a password credential.
  assert.equal(db.sqlite.prepare('SELECT count(*) AS count FROM cnr_account_password_credentials WHERE email=?').get('ada@example.test').count, 0);
  // A later sign-in refreshes the stored values; a malformed email is dropped.
  googleProvider('google-new-learner', null, { name: 'Ada King', email: 'bad address' });
  const again = await handleAccounts(authRequest('/api/auth/google'), env);
  const state2 = new URL(again.headers.get('location')).searchParams.get('state');
  await handleAccounts(authRequest('/auth/google_oauth2/callback?state=' + state2 + '&code=mock-code', 'GET', cookiePair(again, '__Host-cnr_oauth')), env);
  const refreshed = db.sqlite.prepare('SELECT email, email_verified, name FROM cnr_account_google_profiles WHERE google_sub=?').get('google-new-learner');
  assert.equal(refreshed.email, null); assert.equal(refreshed.email_verified, 0); assert.equal(refreshed.name, 'Ada King');
  db.sqlite.prepare('DELETE FROM cnr_account_google_identities WHERE google_sub=?').run('google-new-learner');
  assert.equal(db.sqlite.prepare('SELECT count(*) AS count FROM cnr_account_google_profiles').get().count, 0);
});

test('unlink cancels a link callback that already consumed its state and is awaiting Google', async () => {
  const user = await account({ google: true });
  const token = randomToken(), tokenHash = await hash(token);
  db.sqlite.prepare('INSERT INTO cnr_account_sessions VALUES (?,?,?,?)').run(tokenHash, user.id, seconds(), seconds() + 600);
  const sessionCookie = '__Host-cnr_session=' + token;
  const headers = { Origin: SITE, 'X-CNR-User': user.id, 'X-CSRF-Token': await hash('csrf:' + token) };
  let entered, resume;
  const started = new Promise(resolve => { entered = resolve; });
  const paused = new Promise(resolve => { resume = resolve; });
  googleProvider('google-' + user.id, () => { entered(); return paused; });
  const begin = await handleAccounts(authRequest('/api/auth/google/link', 'POST', sessionCookie, headers), env);
  assert.equal(begin.status, 200);
  const state = new URL((await begin.json()).url).searchParams.get('state');
  const oauthCookie = cookiePair(begin, '__Host-cnr_oauth');
  const callback = handleAccounts(authRequest('/auth/google_oauth2/callback?state=' + state + '&code=mock-code', 'GET', sessionCookie + '; ' + oauthCookie), env);
  await started;
  try {
    const removed = await handleAccounts(authRequest('/api/auth/google/link', 'DELETE', sessionCookie, headers), env);
    assert.equal(removed.status, 200);
  } finally { resume(); }
  const result = await callback;
  assert.equal(cookiePair(result, '__Host-cnr_session'), undefined);
  assert.equal(db.sqlite.prepare('SELECT count(*) AS count FROM cnr_account_google_identities WHERE user_id=?').get(user.id).count, 0);
  assert.equal(db.sqlite.prepare('SELECT count(*) AS count FROM cnr_account_sessions WHERE user_id=?').get(user.id).count, 0);
});

test('email migration preserves legacy identities and learning data without resurrecting an unlinked provider', () => {
  const legacy = new DatabaseSync(':memory:');
  try {
    legacy.exec(readFileSync(new URL('../worker/ask-ai/accounts-schema.sql', import.meta.url), 'utf8'));
    legacy.prepare('INSERT INTO cnr_account_users VALUES (?,?,?,?,?)').run('legacy-user', 'legacy-google-sub', 'Chosen display name', 100, 200);
    legacy.prepare('INSERT INTO cnr_account_sessions VALUES (?,?,?,?)').run('legacy-session', 'legacy-user', 200, 9999999999);
    legacy.prepare('INSERT INTO cnr_account_learning VALUES (?,?,?,?)').run('legacy-user', 9, '{"private":"retained"}', 200);
    const migration = readFileSync(new URL('../worker/ask-ai/accounts-email-schema.sql', import.meta.url), 'utf8');
    legacy.exec(migration);
    assert.equal(legacy.prepare('SELECT user_id FROM cnr_account_google_identities WHERE google_sub=?').get('legacy-google-sub').user_id, 'legacy-user');
    assert.equal(legacy.prepare('SELECT display_name FROM cnr_account_users WHERE id=?').get('legacy-user').display_name, 'Chosen display name');
    assert.equal(legacy.prepare('SELECT token_hash FROM cnr_account_sessions WHERE user_id=?').get('legacy-user').token_hash, 'legacy-session');
    assert.deepEqual({ ...legacy.prepare('SELECT revision,data_json FROM cnr_account_learning WHERE user_id=?').get('legacy-user') }, { revision: 9, data_json: '{"private":"retained"}' });
    legacy.prepare('DELETE FROM cnr_account_google_identities WHERE user_id=?').run('legacy-user');
    legacy.exec(migration);
    assert.equal(legacy.prepare('SELECT count(*) AS count FROM cnr_account_google_identities WHERE user_id=?').get('legacy-user').count, 0);
    assert.equal(legacy.prepare('SELECT revision FROM cnr_account_learning WHERE user_id=?').get('legacy-user').revision, 9);
  } finally { legacy.close(); }
});

test('a legacy Google user created after migration is caught up without changing account ownership', async () => {
  // Simulate the still-live v1 Worker writing between SQL migration and v2 deploy.
  db.sqlite.prepare('INSERT INTO cnr_account_users VALUES (?,?,?,?,?)').run('late-legacy-user', 'late-legacy-google', 'Late legacy name', seconds(), seconds());
  db.sqlite.prepare('INSERT INTO cnr_account_learning VALUES (?,?,?,?)').run('late-legacy-user', 4, '{"private":"late data"}', seconds());
  googleProvider('late-legacy-google');
  const begin = await handleAccounts(authRequest('/api/auth/google'), env);
  const state = new URL(begin.headers.get('location')).searchParams.get('state');
  const result = await handleAccounts(authRequest('/auth/google_oauth2/callback?state=' + state + '&code=mock-code', 'GET', cookiePair(begin, '__Host-cnr_oauth')), env);
  assert.equal(result.headers.get('location'), SITE + '/learn/');
  const newCookie = cookiePair(result, '__Host-cnr_session');
  assert.ok(newCookie);
  const tokenHash = await hash(newCookie.slice('__Host-cnr_session='.length));
  assert.equal(db.sqlite.prepare('SELECT user_id FROM cnr_account_sessions WHERE token_hash=?').get(tokenHash).user_id, 'late-legacy-user');
  assert.equal(db.sqlite.prepare('SELECT user_id FROM cnr_account_google_identities WHERE google_sub=?').get('late-legacy-google').user_id, 'late-legacy-user');
  assert.equal(db.sqlite.prepare('SELECT display_name FROM cnr_account_users WHERE id=?').get('late-legacy-user').display_name, 'Late legacy name');
  assert.equal(db.sqlite.prepare('SELECT revision FROM cnr_account_learning WHERE user_id=?').get('late-legacy-user').revision, 4);
});
