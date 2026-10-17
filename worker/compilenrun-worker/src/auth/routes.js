import { EMAIL_ROUTES, PUBLIC_EMAIL_ROUTES, handleEmailAccount } from '../email-accounts.js';
import { limitedJSON } from '../lib/body.js';
import { handleLearning } from '../learning/routes.js';
import { ACCOUNT_SITE, PROVIDERS, response, cookie, oauthError, hash, randomToken, issueSession, session, configured, providerFlags, providerFor, providerConfigured, googleConfigured, emailConfigured, beginOAuth, finishOAuth, sameToken, now, SESSION_COOKIE, OAUTH_COOKIE } from './core.js';
const ROUTES = new Set(['/api/auth/session', '/api/auth/logout', '/api/auth/account', '/api/learning', ...Object.keys(EMAIL_ROUTES),
  ...Object.values(PROVIDERS).flatMap(p => [p.start, p.link, p.callback])]);

export async function handleAccounts(request, env, ctx) {
  const url = new URL(request.url);
  if (!ROUTES.has(url.pathname)) return url.pathname.startsWith('/api/auth/') ? response(404, { error: 'not_found' }) : null;
  if (url.origin !== ACCOUNT_SITE) return response(403, { error: 'origin_not_allowed' });
  const origin = request.headers.get('origin');
  if (origin && origin !== ACCOUNT_SITE) return response(403, { error: 'origin_not_allowed' });
  const methods = { ...EMAIL_ROUTES, '/api/auth/session': 'GET', '/api/auth/logout': 'POST', '/api/auth/account': 'DELETE', '/api/learning': 'GET,PUT,PATCH' };
  for (const p of Object.values(PROVIDERS)) Object.assign(methods, { [p.start]: 'GET', [p.link]: 'POST,DELETE', [p.callback]: 'GET' });
  if (!methods[url.pathname].split(',').includes(request.method)) return response(405, { error: 'method_not_allowed' });
  const starting = providerFor(url.pathname, 'start'), finishing = providerFor(url.pathname, 'callback'), linkingProvider = providerFor(url.pathname, 'link');
  if (!configured(env)) {
    if (url.pathname === '/api/auth/session') return response(200, { configured: false, providers: { google: false, github: false, email: false }, googleConfigured: false, emailConfigured: false, user: null });
    if (starting || finishing) return oauthError();
    return response(503, { error: 'accounts_not_configured' });
  }
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rate = await env.AUTH_LIMIT.limit({ key: await hash(ip) });
    if (!rate.success) return finishing ? oauthError() : response(429, { error: 'rate_limited' });
    if (starting) return providerConfigured(starting, env) ? await beginOAuth(starting, request, env) : oauthError();
    if (finishing) return providerConfigured(finishing, env) ? await finishOAuth(finishing, request, env) : oauthError();
    const kit = { reply: response, readJSON: limitedJSON, hash, randomToken, issueSession, expiredSessionCookie: () => cookie(SESSION_COOKIE, '', 0) };
    if (PUBLIC_EMAIL_ROUTES.has(url.pathname)) {
      if (origin !== ACCOUNT_SITE) return response(403, { error: 'csrf_failed' });
      return await handleEmailAccount(request, env, ctx, null, kit);
    }
    const login = await session(request, env.DB);
    if (url.pathname === '/api/auth/session') return response(200, { configured: true,
      providers: providerFlags(env), googleConfigured: googleConfigured(env), emailConfigured: emailConfigured(env),
      user: login?.user || null, ...(login ? { csrfToken: login.csrfToken } : {}) },
    !login && /(?:^|;\s*)(?:__Host-cnr_session|cnr_signed_in)=/.test(request.headers.get('cookie') || '') ? [cookie(SESSION_COOKIE, '', 0)] : []);
    if (!login) return response(401, { error: 'authentication_required' });
    if (request.headers.get('X-CNR-User') !== login.user.id) return response(409, { error: 'account_changed' });
    if (request.method !== 'GET' && (origin !== ACCOUNT_SITE || !sameToken(request.headers.get('X-CSRF-Token'), login.csrfToken))) {
      return response(403, { error: 'csrf_failed' });
    }
    if (EMAIL_ROUTES[url.pathname]) return await handleEmailAccount(request, env, ctx, login, kit);
    if (linkingProvider) {
      const p = linkingProvider;
      if (request.method === 'POST') return providerConfigured(p, env) ? await beginOAuth(p, request, env, login) : response(503, { error: p.key + '_not_configured' });
      // Unlinking needs another sign-in method the reader can still use: a verified password (with email
      // configured) or another configured provider that is linked to this account.
      const alternatives = [];
      if (emailConfigured(env)) alternatives.push('EXISTS (SELECT 1 FROM cnr_account_password_credentials WHERE user_id = ?1 AND email_verified_at IS NOT NULL)');
      for (const other of Object.values(PROVIDERS)) if (other !== p && providerConfigured(other, env)) alternatives.push(`EXISTS (SELECT 1 FROM ${other.identities} WHERE user_id = ?1)`);
      if (!alternatives.length) return response(409, { error: 'last_login_method' });
      const guard = `(${alternatives.join(' OR ')})
        AND EXISTS (SELECT 1 FROM cnr_account_sessions WHERE user_id = ?1 AND token_hash = ?2 AND expires_at > ?3)`;
      const removed = await env.DB.batch([
        // Explicit (not just cascaded) so the identity DELETE below reports exactly one change.
        env.DB.prepare(`DELETE FROM ${p.profiles} WHERE ${p.column} IN
          (SELECT ${p.column} FROM ${p.identities} WHERE user_id = ?1) AND ${guard}`).bind(login.user.id, login.tokenHash, now()),
        env.DB.prepare(`DELETE FROM cnr_account_oauth_challenges WHERE state_hash IN
          (SELECT state_hash FROM cnr_account_oauth_links WHERE user_id = ?1) AND ${guard}`).bind(login.user.id, login.tokenHash, now()),
        env.DB.prepare(`DELETE FROM ${p.identities} WHERE user_id = ?1 AND ${guard}`).bind(login.user.id, login.tokenHash, now()),
        env.DB.prepare('DELETE FROM cnr_account_sessions WHERE user_id = ?1 AND changes() = 1').bind(login.user.id),
      ]);
      return removed[2].meta.changes === 1 ? response(200, { ok: true }, [cookie(SESSION_COOKIE, '', 0), cookie(OAUTH_COOKIE, '', 0)]) : response(409, { error: 'last_login_method' });
    }
    if (url.pathname === '/api/auth/logout') {
      await env.DB.prepare('DELETE FROM cnr_account_sessions WHERE token_hash = ?1').bind(login.tokenHash).run();
      return response(200, { ok: true }, [cookie(SESSION_COOKIE, '', 0)]);
    }
    if (url.pathname === '/api/auth/account') {
      const guard = '(SELECT 1 FROM cnr_account_sessions WHERE token_hash = ?2 AND user_id = ?1 AND expires_at > ?3)';
      const removed = await env.DB.batch([
        env.DB.prepare(`DELETE FROM cnr_account_oauth_challenges WHERE state_hash IN
          (SELECT state_hash FROM cnr_account_oauth_links WHERE user_id = ?1) AND EXISTS ${guard}`).bind(login.user.id, login.tokenHash, now()),
        env.DB.prepare(`DELETE FROM cnr_account_users WHERE id = ?1 AND EXISTS ${guard}`).bind(login.user.id, login.tokenHash, now()),
      ]);
      // D1 includes cascaded rows in meta.changes; deleting one account can change several rows.
      return removed[1].meta.changes > 0 ? response(200, { ok: true }, [cookie(SESSION_COOKIE, '', 0), cookie(OAUTH_COOKIE, '', 0)]) : response(401, { error: 'authentication_required' });
    }
    return await handleLearning(request, env, login, { reply: response, session });
  } catch (error) {
    // Never log OAuth codes, access tokens, cookie values, or private snapshots.
    return providerFor(url.pathname, 'callback') || providerFor(url.pathname, 'start') ? oauthError() : response(503, { error: error?.message === 'password_service_busy' ? 'password_service_busy' : 'accounts_unavailable' });
  }
}
