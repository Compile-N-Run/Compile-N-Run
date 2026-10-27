import { EMAIL_ROUTES, PUBLIC_EMAIL_ROUTES, handleEmailAccount } from '../email-accounts.js';
import { limitedJSON } from '../lib/body.js';
import { SSO_ROUTES, ssoConfigured, handleSSO } from './sso.js';
import { handleLearning } from '../learning/routes.js';
import { WECHAT_ROUTES, WECHAT_START, WECHAT_EVENTS, WECHAT_STATUS, WECHAT_POOL, WECHAT_PROFILE_PATHS, handleWechatEvents, handleWechatPool, handleWechatProfile, wechatPoolConfigured, wechatProfileConfigured, startWechatLogin, wechatLoginStatus } from './wechat.js';
import { siteOrigin, PROVIDERS, OAUTH_PROVIDERS, wechatConfigured, wechatEventsReady, GOOGLE_CREDENTIAL_ROUTE, response, cookie, oauthError, hash, randomToken, issueSession, session, configured, providerFlags, providerFor, providerConfigured, googleConfigured, emailConfigured, beginOAuth, finishOAuth, googleCredentialLogin, sameToken, now, SESSION_COOKIE, OAUTH_COOKIE } from './core.js';
const ROUTES = new Set(['/api/auth/session', '/api/auth/logout', '/api/auth/account', '/api/learning', GOOGLE_CREDENTIAL_ROUTE, ...Object.keys(EMAIL_ROUTES), ...Object.keys(SSO_ROUTES),
  ...Object.keys(WECHAT_ROUTES), ...OAUTH_PROVIDERS.flatMap(p => [p.start, p.link, p.callback]), PROVIDERS.wechat.link]);

export async function handleAccounts(request, env, ctx) {
  const url = new URL(request.url);
  const site = siteOrigin(env);
  if (!ROUTES.has(url.pathname)) return url.pathname.startsWith('/api/auth/') ? response(404, { error: 'not_found' }) : null;
  if (url.origin !== site) return response(403, { error: 'origin_not_allowed' });
  // WeChat's servers post messages here: no Origin or rate limit (shared WeChat IPs); the signature authenticates.
  if (url.pathname === WECHAT_EVENTS) {
    if (!['GET', 'POST'].includes(request.method)) return response(405, { error: 'method_not_allowed' });
    if (!wechatEventsReady(env)) return response(404, { error: 'not_found' });
    try { return await handleWechatEvents(request, env); } catch (_) { return new Response('success', { headers: { 'content-type': 'text/plain' } }); }
  }
  // The QR ticket generator (tools/wechat_qr_pool.py) is a server, not a page: no Origin check or per-IP limit; the
  // WECHAT_POOL_SECRET bearer token authenticates it. 404 while the secret is not configured.
  if (url.pathname === WECHAT_POOL) {
    if (!wechatPoolConfigured(env)) return response(404, { error: 'not_found' });
    if (!['GET', 'POST'].includes(request.method)) return response(405, { error: 'method_not_allowed' });
    try { return await handleWechatPool(request, env); } catch (_) { return response(503, { error: 'accounts_unavailable' }); }
  }
  const origin = request.headers.get('origin');
  if (origin && origin !== site) return response(403, { error: 'origin_not_allowed' });
  const methods = { ...EMAIL_ROUTES, ...WECHAT_ROUTES, ...SSO_ROUTES, '/api/auth/session': 'GET', '/api/auth/logout': 'POST', '/api/auth/account': 'DELETE', '/api/learning': 'GET,PUT,PATCH', [GOOGLE_CREDENTIAL_ROUTE]: 'POST' };
  for (const p of OAUTH_PROVIDERS) Object.assign(methods, { [p.start]: 'GET', [p.link]: 'POST,DELETE', [p.callback]: 'GET' });
  methods[PROVIDERS.wechat.link] = 'DELETE';  // linking WeChat goes through /api/auth/wechat/start while signed in
  if (!methods[url.pathname].split(',').includes(request.method)) return response(405, { error: 'method_not_allowed' });
  const starting = providerFor(url.pathname, 'start'), finishing = providerFor(url.pathname, 'callback'), linkingProvider = providerFor(url.pathname, 'link');
  if (!configured(env)) {
    if (url.pathname === '/api/auth/session') return response(200, { configured: false, providers: { google: false, github: false, wechat: false, email: false }, googleConfigured: false, emailConfigured: false, user: null });
    if (starting || finishing) return oauthError(env);
    return response(503, { error: 'accounts_not_configured' });
  }
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rate = await env.AUTH_LIMIT.limit({ key: await hash(ip) });
    if (!rate.success) return finishing ? oauthError(env) : response(429, { error: 'rate_limited' });
    // Sister-site sign-on: the authorize step runs in the reader's browser; token and userinfo are server-to-server
    // calls from Moodle (no Origin header, authenticated by the client secret / access token).
    if (SSO_ROUTES[url.pathname]) return ssoConfigured(env) ? await handleSSO(request, env) : response(404, { error: 'not_found' });
    if (starting) return providerConfigured(starting, env) ? await beginOAuth(starting, request, env) : oauthError(env);
    if (finishing) return providerConfigured(finishing, env) ? await finishOAuth(finishing, request, env) : oauthError(env);
    const kit = { reply: response, readJSON: limitedJSON, hash, randomToken, issueSession, expiredSessionCookie: () => cookie(SESSION_COOKIE, '', 0) };
    if (PUBLIC_EMAIL_ROUTES.has(url.pathname)) {
      if (origin !== site) return response(403, { error: 'csrf_failed' });
      return await handleEmailAccount(request, env, ctx, null, kit);
    }
    if (url.pathname === WECHAT_START || url.pathname === WECHAT_STATUS) {
      if (url.pathname === WECHAT_START && origin !== site) return response(403, { error: 'csrf_failed' });
      if (!wechatConfigured(env)) return response(503, { error: 'wechat_not_configured' });
      return url.pathname === WECHAT_START ? await startWechatLogin(request, env) : await wechatLoginStatus(request, env);
    }
    // HTML pages opened inside WeChat from the account's reply (no Origin header on navigations).
    if (WECHAT_PROFILE_PATHS.has(url.pathname)) {
      if (!wechatConfigured(env) || !wechatProfileConfigured(env)) return response(404, { error: 'not_found' });
      return await handleWechatProfile(request, env);
    }
    if (url.pathname === GOOGLE_CREDENTIAL_ROUTE) {
      if (origin !== site) return response(403, { error: 'csrf_failed' });
      return googleConfigured(env) ? await googleCredentialLogin(request, env) : response(503, { error: 'google_not_configured' });
    }
    const login = await session(request, env.DB);
    if (url.pathname === '/api/auth/session') return response(200, { configured: true,
      providers: providerFlags(env), googleConfigured: googleConfigured(env), emailConfigured: emailConfigured(env),
      user: login?.user || null, ...(login ? { csrfToken: login.csrfToken } : {}) },
    !login && /(?:^|;\s*)(?:__Host-cnr_session|cnr_signed_in)=/.test(request.headers.get('cookie') || '') ? [cookie(SESSION_COOKIE, '', 0)] : []);
    if (!login) return response(401, { error: 'authentication_required' });
    if (request.headers.get('X-CNR-User') !== login.user.id) return response(409, { error: 'account_changed' });
    if (request.method !== 'GET' && (origin !== site || !sameToken(request.headers.get('X-CSRF-Token'), login.csrfToken))) {
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
    return providerFor(url.pathname, 'callback') || providerFor(url.pathname, 'start') ? oauthError(env) : response(503, { error: error?.message === 'password_service_busy' ? 'password_service_busy' : 'accounts_unavailable' });
  }
}
