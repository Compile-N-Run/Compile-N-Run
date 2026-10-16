import { hashPassword, passwordAllowed, verifyPassword } from './passwords.js';
import { sendAccountEmail } from './email.js';

export const EMAIL_ROUTES = {
  '/api/auth/register': 'POST', '/api/auth/login': 'POST', '/api/auth/verify-email': 'POST',
  '/api/auth/resend-verification': 'POST', '/api/auth/forgot-password': 'POST', '/api/auth/reset-password': 'POST',
  '/api/auth/email': 'POST,DELETE', '/api/auth/password': 'POST', '/api/auth/profile': 'PATCH',
};
export const PUBLIC_EMAIL_ROUTES = new Set(['/api/auth/register', '/api/auth/login', '/api/auth/verify-email',
  '/api/auth/resend-verification', '/api/auth/forgot-password', '/api/auth/reset-password']);
const stamp = () => Math.floor(Date.now() / 1000);
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const GENERIC = { ok: true, message: 'If this address is eligible, an email with the next steps will be sent.' };

export function emailConfigured(env) {
  return env.EMAIL_PASSWORD_ENABLED === 'true' && !!env.DB && !!env.AUTH_LIMIT &&
    typeof env.PASSWORD_PEPPER === 'string' && env.PASSWORD_PEPPER.length >= 32 &&
    typeof env.BREVO_API_KEY === 'string' && !!env.BREVO_API_KEY &&
    typeof env.BREVO_SENDER_EMAIL === 'string' && !!env.BREVO_SENDER_EMAIL;
}
function emailAddress(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  // Deliberate, documented identity normalization; no Gmail dot/plus rewriting.
  if (email.length > 254 || !/^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,63}$/.test(email)) return null;
  const [local, domain] = email.split('@');
  return local.length <= 64 && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..') && !domain.includes('..') ? email : null;
}
function nameValue(value) {
  return typeof value === 'string' && value.trim().length >= 1 && value.trim().length <= 100 && !/[\u0000-\u001f\u007f]/.test(value) ? value.trim() : null;
}
async function credentialRate(request, env, kit, email = '') {
  const start = Math.floor(stamp() / 900) * 900;
  const route = new URL(request.url).pathname;
  const family = route === '/api/auth/login' ? 'login' : ['/api/auth/register', '/api/auth/email'].includes(route) ? 'enroll' : 'recovery';
  const buckets = [['ip:' + await kit.hash(request.headers.get('CF-Connecting-IP') || 'unknown'), 30]];
  if (email) buckets.push(['email:' + family + ':' + await kit.hash(email), 10]);
  for (const [key, limit] of buckets) {
    const allowed = await env.DB.prepare(`INSERT INTO cnr_account_credential_limits (bucket_key, window_start, attempts) VALUES (?1, ?2, 1)
      ON CONFLICT (bucket_key) DO UPDATE SET window_start = excluded.window_start,
      attempts = CASE WHEN window_start < excluded.window_start THEN 1 ELSE attempts + 1 END
      WHERE window_start < excluded.window_start OR attempts < ?3 RETURNING attempts`).bind(key, start, limit).first();
    if (!allowed) return false;
  }
  await env.DB.prepare('DELETE FROM cnr_account_credential_limits WHERE window_start < ?1').bind(start - 172800).run();
  return true;
}

async function claimMailBudget(env) {
  const day = Math.floor(stamp() / 86400) * 86400;
  const limit = Math.max(1, Math.min(10000, Number(env.ACCOUNT_EMAIL_DAILY_LIMIT) || 100));
  return !!await env.DB.prepare(`INSERT INTO cnr_account_credential_limits (bucket_key, window_start, attempts) VALUES ('mail-day', ?1, 1)
    ON CONFLICT (bucket_key) DO UPDATE SET window_start = excluded.window_start,
    attempts = CASE WHEN window_start < excluded.window_start THEN 1 ELSE attempts + 1 END
    WHERE window_start < excluded.window_start OR attempts < ?2 RETURNING attempts`).bind(day, limit).first();
}
async function dispatchEmail(env, ctx, email, purpose, token, budgetReserved = false) {
  if (!budgetReserved && !await claimMailBudget(env)) return;
  const promise = sendAccountEmail(env, email, purpose, token).catch(error => {
    // A provider acceptance failure is operational information, never log the
    // recipient, password, reset/verification token, body, or provider response.
    console.warn('Account transactional email was not accepted.', Number.isInteger(error.status) ? error.status : 'network', error.providerCode || (error.name === 'TimeoutError' ? 'transport_timeout' : error.name === 'AbortError' ? 'transport_aborted' : /redirect/i.test(error.message) ? 'redirect_rejected' : /header/i.test(error.message) ? 'invalid_header' : /network|connection/i.test(error.message) ? 'connection_failed' : /^[A-Za-z]{1,30}$/.test(error.name) ? error.name : 'unknown'));
  });
  if (ctx?.waitUntil) { ctx.waitUntil(promise); return Promise.resolve(); }
  return promise;
}

async function issueEmailToken(env, ctx, kit, credential, purpose) {
  const time = stamp();
  const recipient = await kit.hash(credential.email);
  const permitted = await env.DB.prepare(`INSERT INTO cnr_account_email_throttle (recipient_hash, purpose, next_at) VALUES (?1, ?2, ?3)
    ON CONFLICT (recipient_hash, purpose) DO UPDATE SET next_at = excluded.next_at
    WHERE next_at <= ?4 RETURNING next_at`).bind(recipient, purpose, time + 60, time).first();
  if (!permitted) return;
  if (!await claimMailBudget(env)) return;
  const token = kit.randomToken();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM cnr_account_email_tokens WHERE expires_at <= ?1').bind(time),
    env.DB.prepare('DELETE FROM cnr_account_email_tokens WHERE user_id = ?1 AND purpose = ?2').bind(credential.user_id, purpose),
    env.DB.prepare(`INSERT INTO cnr_account_email_tokens (token_hash, user_id, email, purpose, credential_version, created_at, expires_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`).bind(await kit.hash(token), credential.user_id, credential.email, purpose, credential.version, time, time + (purpose === 'verify' ? 86400 : 1800)),
  ]);
  await dispatchEmail(env, ctx, credential.email, purpose, token, true);
}

async function changeCredential(env, kit, credential, newHash, tokenHash, purpose) {
  const time = stamp(), action = kit.randomToken();
  // D1 batch is transactional. A failed/expired/stale token cannot authorize the
  // update; changes() couples that update to the preceding single-use consume.
  const statements = tokenHash ? [
    env.DB.prepare(`DELETE FROM cnr_account_email_tokens WHERE token_hash = ?1 AND user_id = ?2 AND purpose = ?3 AND expires_at > ?4
      AND credential_version = ?5 AND email = ?6 AND EXISTS (SELECT 1 FROM cnr_account_password_credentials
      WHERE user_id = ?2 AND version = ?5 AND email = ?6 AND (?3 != 'reset' OR email_verified_at IS NOT NULL OR NOT EXISTS
        (SELECT 1 FROM cnr_account_google_identities WHERE user_id = ?2) AND NOT EXISTS
        (SELECT 1 FROM cnr_account_github_identities WHERE user_id = ?2)))`).bind(tokenHash, credential.user_id, purpose, time, credential.version, credential.email),
    env.DB.prepare(`UPDATE cnr_account_password_credentials SET password_hash = ?1, email_verified_at = ?2, version = version + 1,
      last_action = ?3, updated_at = ?2 WHERE user_id = ?4 AND version = ?5 AND changes() = 1`)
      .bind(newHash, time, action, credential.user_id, credential.version),
  ] : [
    env.DB.prepare(`UPDATE cnr_account_password_credentials SET password_hash = ?1, version = version + 1, last_action = ?2, updated_at = ?3
      WHERE user_id = ?4 AND version = ?5 AND email_verified_at IS NOT NULL AND EXISTS
      (SELECT 1 FROM cnr_account_sessions WHERE token_hash = ?6 AND user_id = ?4 AND expires_at > ?3)`)
      .bind(newHash, action, time, credential.user_id, credential.version, credential.sessionHash),
  ];
  statements.push(
    env.DB.prepare(`DELETE FROM cnr_account_sessions WHERE user_id = ?1 AND EXISTS
      (SELECT 1 FROM cnr_account_password_credentials WHERE user_id = ?1 AND last_action = ?2)`).bind(credential.user_id, action),
    env.DB.prepare(`DELETE FROM cnr_account_email_tokens WHERE user_id = ?1 AND EXISTS
      (SELECT 1 FROM cnr_account_password_credentials WHERE user_id = ?1 AND last_action = ?2)`).bind(credential.user_id, action),
  );
  const result = await env.DB.batch(statements);
  return result[tokenHash ? 1 : 0].meta.changes === 1;
}

export async function handleEmailAccount(request, env, ctx, login, kit) {
  const route = new URL(request.url).pathname;
  if (route !== '/api/auth/profile' && !emailConfigured(env)) return kit.reply(503, { error: 'email_not_configured' });
  if (route === '/api/auth/email' && request.method === 'DELETE') {
    const result = await env.DB.batch([
      env.DB.prepare(`DELETE FROM cnr_account_password_credentials WHERE user_id = ?1 AND email_verified_at IS NULL
        AND (EXISTS (SELECT 1 FROM cnr_account_google_identities WHERE user_id = ?1) OR EXISTS (SELECT 1 FROM cnr_account_github_identities WHERE user_id = ?1))
        AND EXISTS (SELECT 1 FROM cnr_account_sessions WHERE user_id = ?1 AND token_hash = ?2 AND expires_at > ?3)`)
        .bind(login.user.id, login.tokenHash, stamp()),
      env.DB.prepare('DELETE FROM cnr_account_email_tokens WHERE user_id = ?1 AND changes() = 1').bind(login.user.id),
    ]);
    return result[0].meta.changes === 1 ? kit.reply(200, { ok: true }) : kit.reply(409, { error: 'no_pending_email' });
  }
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return kit.reply(415, { error: 'json_required' });
  let input;
  try { input = await kit.readJSON(request, 16384); } catch (_) { return kit.reply(400, { error: 'invalid_request' }); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return kit.reply(400, { error: 'invalid_request' });
  if (route === '/api/auth/profile') {
    const name = nameValue(input.name);
    if (!name) return kit.reply(400, { error: 'invalid_name' });
    const changed = await env.DB.prepare(`UPDATE cnr_account_users SET display_name = ?1, updated_at = ?2 WHERE id = ?3 AND EXISTS
      (SELECT 1 FROM cnr_account_sessions WHERE token_hash = ?4 AND user_id = ?3 AND expires_at > ?2) RETURNING id`)
      .bind(name, stamp(), login.user.id, login.tokenHash).first();
    return changed ? kit.reply(200, { ok: true }) : kit.reply(401, { error: 'authentication_required' });
  }
  const email = emailAddress(input.email);
  const recipientRoutes = ['/api/auth/register', '/api/auth/login', '/api/auth/resend-verification', '/api/auth/forgot-password', '/api/auth/email'];
  if (recipientRoutes.includes(route) && !email) return kit.reply(400, { error: 'invalid_email' });
  if (!await credentialRate(request, env, kit, email || '')) {
    return ['/api/auth/register', '/api/auth/resend-verification', '/api/auth/forgot-password', '/api/auth/email'].includes(route) ? kit.reply(202, GENERIC) : kit.reply(429, { error: 'rate_limited' });
  }
  // Unverified enrollment must not reserve another person's address forever.
  // Verified credentials and Google-owned account/profile data are untouched.
  await env.DB.batch([
    env.DB.prepare('DELETE FROM cnr_account_password_credentials WHERE email_verified_at IS NULL AND updated_at <= ?1').bind(stamp() - 86400),
    env.DB.prepare('DELETE FROM cnr_account_email_tokens WHERE expires_at <= ?1 OR NOT EXISTS (SELECT 1 FROM cnr_account_password_credentials c WHERE c.user_id = cnr_account_email_tokens.user_id)').bind(stamp()),
  ]);

  if (route === '/api/auth/register' || route === '/api/auth/email') {
    const name = route === '/api/auth/register' ? nameValue(input.name) : login.user.name;
    if (!name) return kit.reply(400, { error: 'invalid_name' });
    if (!passwordAllowed(input.password)) return kit.reply(400, { error: 'password_policy' });
    // Hash before the uniqueness decision to avoid a cheap existing-email oracle.
    const encoded = await hashPassword(input.password, env.PASSWORD_PEPPER);
    const existing = await env.DB.prepare('SELECT user_id FROM cnr_account_password_credentials WHERE email = ?1').bind(email).first();
    if (existing && (route === '/api/auth/register' || existing.user_id !== login.user.id)) return kit.reply(202, GENERIC);
    if (login && route === '/api/auth/email') {
      const own = await env.DB.prepare('SELECT * FROM cnr_account_password_credentials WHERE user_id = ?1').bind(login.user.id).first();
      if (own?.email_verified_at) return kit.reply(409, { error: 'email_already_set' });
      if (own) {
        const action = kit.randomToken();
        try {
          const result = await env.DB.batch([
            env.DB.prepare(`UPDATE cnr_account_password_credentials SET email = ?1, password_hash = ?2, version = version + 1,
              last_action = ?3, updated_at = ?4 WHERE user_id = ?5 AND version = ?6 AND email_verified_at IS NULL
              AND EXISTS (SELECT 1 FROM cnr_account_sessions WHERE user_id = ?5 AND token_hash = ?7 AND expires_at > ?4)`)
              .bind(email, encoded, action, stamp(), login.user.id, own.version, login.tokenHash),
            env.DB.prepare(`DELETE FROM cnr_account_email_tokens WHERE user_id = ?1 AND EXISTS
              (SELECT 1 FROM cnr_account_password_credentials WHERE user_id = ?1 AND last_action = ?2)`).bind(login.user.id, action),
          ]);
          if (result[0].meta.changes !== 1) return kit.reply(409, { error: 'account_changed' });
        } catch (error) { if (/UNIQUE constraint/i.test(String(error))) return kit.reply(202, GENERIC); throw error; }
        const current = await env.DB.prepare('SELECT * FROM cnr_account_password_credentials WHERE user_id = ?1').bind(login.user.id).first();
        await issueEmailToken(env, ctx, kit, current, 'verify');
        return kit.reply(202, GENERIC);
      }
    }
    const id = login && route === '/api/auth/email' ? login.user.id : crypto.randomUUID();
    const time = stamp(), statements = [];
    if (route === '/api/auth/register') statements.push(env.DB.prepare(`INSERT INTO cnr_account_users (id, google_sub, display_name, created_at, updated_at)
      VALUES (?1, ?2, ?3, ?4, ?4)`).bind(id, 'local:' + id, name, time));
    statements.push(env.DB.prepare(`INSERT INTO cnr_account_password_credentials (user_id, email, password_hash, created_at, updated_at)
      SELECT ?1, ?2, ?3, ?4, ?4 WHERE ?5 = '' OR EXISTS (SELECT 1 FROM cnr_account_sessions WHERE token_hash = ?5 AND user_id = ?1 AND expires_at > ?4)`)
      .bind(id, email, encoded, time, route === '/api/auth/email' ? login.tokenHash : ''));
    statements.push(env.DB.prepare('INSERT OR IGNORE INTO cnr_account_learning (user_id, revision) VALUES (?1, 0)').bind(id));
    try { await env.DB.batch(statements); } catch (error) {
      // A simultaneous registration for the same address is still opaque.
      if (/UNIQUE constraint/i.test(String(error))) return kit.reply(202, GENERIC);
      throw error;
    }
    const credential = await env.DB.prepare('SELECT * FROM cnr_account_password_credentials WHERE user_id = ?1').bind(id).first();
    if (credential) await issueEmailToken(env, ctx, kit, credential, 'verify');
    return kit.reply(202, GENERIC);
  }

  if (route === '/api/auth/login') {
    if (typeof input.password !== 'string' || input.password.length > 256) return kit.reply(401, { error: 'invalid_credentials' });
    const credential = await env.DB.prepare('SELECT * FROM cnr_account_password_credentials WHERE email = ?1').bind(email).first();
    const valid = await verifyPassword(input.password, credential?.password_hash, env.PASSWORD_PEPPER);
    if (!valid || !credential.email_verified_at) return kit.reply(401, { error: 'invalid_credentials' });
    const sessionCookie = await kit.issueSession(request, env, credential.user_id, credential);
    return sessionCookie ? kit.reply(200, { ok: true }, [sessionCookie]) : kit.reply(401, { error: 'invalid_credentials' });
  }

  if (route === '/api/auth/resend-verification' || route === '/api/auth/forgot-password') {
    const credential = await env.DB.prepare('SELECT * FROM cnr_account_password_credentials WHERE email = ?1').bind(email).first();
    const oauth = credential ? await env.DB.prepare(`SELECT user_id FROM cnr_account_google_identities WHERE user_id = ?1
      UNION SELECT user_id FROM cnr_account_github_identities WHERE user_id = ?1`).bind(credential.user_id).first() : null;
    const eligible = route === '/api/auth/forgot-password' ? credential && (credential.email_verified_at || !oauth) : credential && !credential.email_verified_at;
    if (eligible) {
      await issueEmailToken(env, ctx, kit, credential, route === '/api/auth/forgot-password' ? 'reset' : 'verify');
    }
    return kit.reply(202, GENERIC);
  }

  if (route === '/api/auth/verify-email' || route === '/api/auth/reset-password') {
    if (typeof input.token !== 'string' || !TOKEN.test(input.token) || !passwordAllowed(input.password)) return kit.reply(400, { error: 'invalid_token_or_password' });
    const purpose = route === '/api/auth/verify-email' ? 'verify' : 'reset';
    const tokenHash = await kit.hash(input.token);
    const credential = await env.DB.prepare(`SELECT c.* FROM cnr_account_email_tokens t JOIN cnr_account_password_credentials c ON c.user_id = t.user_id
      WHERE t.token_hash = ?1 AND t.purpose = ?2 AND t.expires_at > ?3 AND t.credential_version = c.version AND t.email = c.email`)
      .bind(tokenHash, purpose, stamp()).first();
    if (!credential) return kit.reply(400, { error: 'invalid_token_or_password' });
    if (purpose === 'verify' && !await verifyPassword(input.password, credential.password_hash, env.PASSWORD_PEPPER)) return kit.reply(400, { error: 'invalid_token_or_password' });
    const encoded = purpose === 'reset' ? await hashPassword(input.password, env.PASSWORD_PEPPER) : credential.password_hash;
    if (!await changeCredential(env, kit, credential, encoded, tokenHash, purpose)) return kit.reply(400, { error: 'invalid_token_or_password' });
    if (purpose === 'reset') await dispatchEmail(env, ctx, credential.email, 'changed');
    return kit.reply(200, { ok: true }, [kit.expiredSessionCookie()]);
  }

  if (route === '/api/auth/password') {
    if (!passwordAllowed(input.newPassword) || typeof input.currentPassword !== 'string' || input.currentPassword.length > 256) return kit.reply(400, { error: 'password_policy' });
    const credential = await env.DB.prepare('SELECT * FROM cnr_account_password_credentials WHERE user_id = ?1').bind(login.user.id).first();
    if (!credential?.email_verified_at || !await verifyPassword(input.currentPassword, credential.password_hash, env.PASSWORD_PEPPER)) return kit.reply(403, { error: 'invalid_current_password' });
    const encoded = await hashPassword(input.newPassword, env.PASSWORD_PEPPER);
    if (!await changeCredential(env, kit, { ...credential, sessionHash: login.tokenHash }, encoded)) return kit.reply(409, { error: 'account_changed' });
    await dispatchEmail(env, ctx, credential.email, 'changed');
    return kit.reply(200, { ok: true }, [kit.expiredSessionCookie()]);
  }
  return kit.reply(404, { error: 'not_found' });
}
