/* Behaviour analytics for www.compilenrun.com and moodle.compilenrun.com (the Moodle plugin local_cnranalytics ships
 * a copy of this file; keep them identical). Two sinks share one event stream:
 *   - Google Analytics 4 through gtag.js, with the account id as GA's user_id (never a name or email), and
 *   - the first-party /api/events endpoint on the Worker, which stores every event with the account id so SQL can
 *     join it to names and emails (worker/compilenrun-worker/tools/events_report.py).
 * Nothing is sent when the reader opted out (profile page, or a Global Privacy Control signal) or, for readers in
 * Europe, before they accept the consent bar. window.CNR_ANALYTICS configures the page: {site, endpoint, gaId,
 * token (Moodle only), page (extra page_view props)}. */
(function () {
  'use strict';
  var cfg = window.CNR_ANALYTICS || {};
  var SITE = cfg.site === 'moodle' ? 'moodle' : 'www';
  var ENDPOINT = cfg.endpoint || '/api/events';
  var GA_ID = cfg.gaId || '';
  var OPTOUT_KEY = 'cnr.analytics.optout', CONSENT_KEY = 'cnr.consent', VISITOR_KEY = 'cnr.visitor', SESSION_KEY = 'cnr.session';
  var EU_TZ = /^(Europe\/|Atlantic\/(Reykjavik|Canary|Madeira|Faroe|Azores)|Arctic\/)/;

  function get(store, key) { try { return store.getItem(key); } catch (_) { return null; } }
  function set(store, key, value) { try { if (value === null) store.removeItem(key); else store.setItem(key, value); } catch (_) { /* private mode */ } }
  function local(key, value) { return value === undefined ? get(localStorage, key) : set(localStorage, key, value); }
  function randomId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '');
    var out = '', chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
  function visitorId() { var id = local(VISITOR_KEY); if (!/^[A-Za-z0-9_-]{8,64}$/.test(id || '')) { id = randomId(); local(VISITOR_KEY, id); } return id; }
  function sessionId() { var id = get(sessionStorage, SESSION_KEY); if (!/^[A-Za-z0-9_-]{8,64}$/.test(id || '')) { id = randomId(); set(sessionStorage, SESSION_KEY, id); } return id; }

  function gpc() { return navigator.globalPrivacyControl === true; }
  function optedOut() { return gpc() || local(OPTOUT_KEY) === '1'; }
  function inEurope() { try { return EU_TZ.test(Intl.DateTimeFormat().resolvedOptions().timeZone || ''); } catch (_) { return false; } }
  function consent() { return local(CONSENT_KEY); }
  function allowed() { return !optedOut() && !(inEurope() && consent() !== 'granted'); }
  function hasGtag() { return typeof window.gtag === 'function' && !!GA_ID; }

  /* ---- consent bar (Europe) and opt-out switch (profile page) ---- */
  function grantGtag(granted) {
    if (!hasGtag()) return;
    var v = granted ? 'granted' : 'denied';
    window.gtag('consent', 'update', { analytics_storage: v, ad_storage: v, ad_user_data: v, ad_personalization: v });
  }
  function consentBar() {
    if (document.querySelector('[data-cnr-consent]')) return;
    var bar = document.createElement('div');
    bar.className = 'cnr-consent'; bar.setAttribute('data-cnr-consent', ''); bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Cookie and analytics choice');
    bar.innerHTML = '<p class="cnr-consent__text">We use cookies and analytics to see which tutorials and exercises help, and to show ads. ' +
      'If you are signed in, your activity is linked to your account so you can see your own progress. ' +
      '<a href="https://www.compilenrun.com/privacy-policy/">Privacy policy</a></p>' +
      '<div class="cnr-consent__actions"><button type="button" class="cnr-consent__btn cnr-consent__btn--primary" data-cnr-consent-accept>Accept</button>' +
      '<button type="button" class="cnr-consent__btn" data-cnr-consent-decline>Decline</button></div>';
    bar.addEventListener('click', function (event) {
      var accept = event.target.closest('[data-cnr-consent-accept]'), decline = event.target.closest('[data-cnr-consent-decline]');
      if (!accept && !decline) return;
      local(CONSENT_KEY, accept ? 'granted' : 'denied'); bar.remove(); grantGtag(!!accept);
      if (accept) start();
    });
    document.body.appendChild(bar);
  }
  function optOutSwitch() {
    var box = document.querySelector('[data-analytics-optout]'); if (!box) return;
    box.checked = optedOut(); box.disabled = gpc();
    var note = document.querySelector('[data-analytics-optout-note]');
    if (note && gpc()) note.textContent = 'Your browser sends a Global Privacy Control signal, so analytics stay off here.';
    box.addEventListener('change', function () { local(OPTOUT_KEY, box.checked ? '1' : null); grantGtag(!box.checked && !(inEurope() && consent() !== 'granted')); if (!box.checked) start(); });
  }

  /* ---- first-party queue ---- */
  var queue = [], timer = null, pageProps = cfg.page && typeof cfg.page === 'object' ? cfg.page : {};
  function flush() {
    clearTimeout(timer); timer = null;
    if (!queue.length) return;
    var batch = queue.splice(0, 25);
    var body = JSON.stringify({ site: SITE, visitor: visitorId(), session: sessionId(), referrer: document.referrer || '', token: cfg.token || undefined, events: batch });
    // text/plain keeps the request "simple": no preflight, works from Moodle's origin and during page unload.
    try { if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return; } catch (_) { /* fall through */ }
    try { fetch(ENDPOINT, { method: 'POST', body: body, headers: { 'content-type': 'text/plain' }, credentials: SITE === 'www' ? 'same-origin' : 'omit', keepalive: true }).catch(function () {}); } catch (_) { /* offline */ }
    if (queue.length) timer = setTimeout(flush, 50);
  }
  // Anonymous page views and engagement on the site stay in GA4 only: the first-party table exists to follow
  // signed-in learners (and Moodle), and storing every guest's page_view cost ~70k D1 row writes a day (the free
  // tier allows 100k). Interaction events (login, run_code, moodle_promo_click, ...) are kept for everyone.
  function stored(name) { return SITE !== 'www' || userApplied !== null || (name !== 'page_view' && name !== 'page_engaged'); }
  function track(name, props, options) {
    if (!allowed() || !/^[a-z][a-z0-9_]{0,39}$/.test(name)) return;
    options = options || {};
    if (options.ga !== false && hasGtag()) window.gtag('event', name, props || {});
    if (!stored(name)) return;
    queue.push({ name: name, path: location.pathname, ts: Date.now(), props: props || {} });
    if (options.now || queue.length >= 10) flush(); else if (!timer) timer = setTimeout(flush, 5000);
  }
  window.cnrTrack = function (name, props) { track(String(name), props && typeof props === 'object' ? props : {}); };

  /* ---- user identity ---- */
  var userApplied = null;
  function applyUser(user) {
    var id = user && typeof user.id === 'string' ? user.id : null;
    if (id === userApplied) return;
    userApplied = id;
    if (!hasGtag()) return;
    window.gtag('set', { user_id: id || undefined });
    var method = !user ? undefined : user.googleLinked ? 'google' : user.githubLinked ? 'github' : user.wechatLinked ? 'wechat' : user.hasPassword ? 'email' : 'other';
    window.gtag('set', 'user_properties', { signed_in: id ? 'yes' : 'no', sign_in_method: method, site: SITE });
  }
  // Waits briefly for the site session so the GA page_view already carries user_id; then sends page_view to both sinks.
  function withUser(done) {
    if (SITE === 'moodle') { done(cfg.userId ? { id: cfg.userId } : null); return; }
    var settled = false, finish = function (session) { if (settled) return; settled = true; done(session && session.user ? session.user : null); };
    if (window.CNRAuth && typeof window.CNRAuth.ready === 'function') { Promise.resolve(window.CNRAuth.ready()).then(finish, function () { finish(null); }); setTimeout(function () { finish(null); }, 1500); }
    else finish(null);
  }

  /* ---- page_view and engagement ---- */
  var started = false, activeMs = 0, activeSince = document.visibilityState === 'visible' ? Date.now() : 0, maxScroll = 0, lastEngagedAt = 0;
  function scrollDepth() {
    var h = document.documentElement, total = Math.max(h.scrollHeight, document.body ? document.body.scrollHeight : 0) - window.innerHeight;
    if (total <= 0) return 100;
    return Math.min(100, Math.round((window.scrollY + window.innerHeight) / (total + window.innerHeight) * 100));
  }
  function engaged(final) {
    if (activeSince) { activeMs += Date.now() - activeSince; activeSince = final ? 0 : Date.now(); }
    var seconds = Math.round(activeMs / 1000);
    if (seconds < 1 || seconds === lastEngagedAt) return;
    lastEngagedAt = seconds;
    track('page_engaged', { seconds: seconds, scroll: maxScroll }, { ga: false, now: true });
  }
  function start() {
    if (started || !allowed()) return;
    started = true;
    withUser(function (user) {
      applyUser(user);
      var props = { title: (document.title || '').slice(0, 200), referrer_host: (function () { try { return document.referrer ? new URL(document.referrer).host : ''; } catch (_) { return ''; } })() };
      Object.keys(pageProps).forEach(function (k) { props[k] = pageProps[k]; });
      if (hasGtag()) window.gtag('event', 'page_view', { page_title: document.title, page_location: location.href });
      track('page_view', props, { ga: false, now: true });
    });
    window.addEventListener('scroll', function () { maxScroll = Math.max(maxScroll, scrollDepth()); }, { passive: true });
    maxScroll = scrollDepth();
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') { engaged(true); flush(); } else activeSince = Date.now();
    });
    window.addEventListener('pagehide', function () { engaged(true); flush(); });
    if (SITE === 'www') siteHooks(); else moodleHooks();
  }

  /* ---- what readers do on www.compilenrun.com ---- */
  function siteHooks() {
    window.addEventListener('cnr:auth-changed', function (event) {
      var d = event.detail || {}, user = d.session && d.session.user;
      applyUser(user || null);
      if (d.reason === 'logout' || (d.previousUserId && !user)) track('logout', {});
      else if (user && !d.previousUserId && d.reason !== 'initial') track('login', { method: user.googleLinked ? 'google' : user.githubLinked ? 'github' : user.wechatLinked ? 'wechat' : 'email' });
    });
    document.addEventListener('click', function (event) {
      var t = event.target, c = function (s) { return t.closest ? t.closest(s) : null; }, el;
      if ((el = c('[data-mark-done]'))) track('lesson_read', { on: el.getAttribute('aria-pressed') !== 'true' });
      else if ((el = c('[data-learning-bookmark]'))) track('lesson_bookmark', { on: el.getAttribute('aria-pressed') !== 'true' });
      else if (c('[data-learning-practiced]')) track('practice_recorded', {});
      else if ((el = c('.cnr-run__go'))) { var block = el.closest('.theme-code-block'), m = block && block.className.match(/\blanguage-([\w+#-]+)/); track('run_code', { lang: m ? m[1] : '', stop: el.classList.contains('cnr-run__go--stop') }); }
      else if (c('.cnr-copy-btn, [aria-label="Copy code to clipboard"]')) track('code_copy', {});
      else if (c('.cnr-ask-btn')) track('ask_ai_open', {});
      else if (c('[data-search-open]')) track('search_open', {});
      else if ((el = c('.cnr-iv-ws__btn'))) track('interview_action', { action: (el.textContent || '').trim().slice(0, 40) });
      else if ((el = c('.cnr-moodle [data-moodle-close]'))) track('moodle_promo_dismiss', { variant: el.closest('.cnr-moodle').getAttribute('data-moodle-banner') || '' });
      else if ((el = c('.cnr-moodle a'))) { var box = el.closest('.cnr-moodle'); track('moodle_promo_click', { variant: box.getAttribute('data-moodle-banner') || pageProps.language || '', placement: box.classList.contains('cnr-moodle--banner') ? 'banner' : 'article' }, { now: true }); }
      else if ((el = c('a[href]'))) { var host; try { host = new URL(el.href, location.href).host; } catch (_) { host = ''; } if (host && host !== location.host) track('outbound', { host: host, path: el.pathname || '' }, { now: true }); }
    }, true);
    document.addEventListener('submit', function (event) {
      var form = event.target;
      if (form.closest && form.closest('.cnr-ask')) track('ask_ai_question', {});
      else if (form.closest && form.closest('[data-search-form], .cnr-search')) track('search', {});
    }, true);
    optOutSwitch();
  }

  /* ---- what learners do on moodle.compilenrun.com ---- */
  function moodleHooks() {
    document.addEventListener('submit', function (event) {
      var form = event.target, btn = document.activeElement, name = btn && btn.name ? btn.name : '';
      if (/\/mod\/quiz\//.test(location.pathname)) track('quiz_submit', { button: name.slice(0, 40), page: form.querySelector('input[name="thispage"]') ? form.querySelector('input[name="thispage"]').value : '' }, { now: true });
      else if (/\/enrol\//.test(location.pathname) || form.querySelector('input[name="enrolid"]')) track('enrol_submit', {}, { now: true });
    }, true);
    document.addEventListener('click', function (event) {
      var t = event.target, c = function (s) { return t.closest ? t.closest(s) : null; }, el;
      if ((el = c('.login-identityprovider-btn, a[href*="oauth2/login.php"]'))) track('login_click', { provider: (el.textContent || '').trim().slice(0, 40) }, { now: true });
      else if ((el = c('input[type="submit"][name$="submit"], button.coderunner-check, input[value="Check"]')) && /\/mod\/quiz\//.test(location.pathname)) track('answer_check', { button: (el.value || el.textContent || '').trim().slice(0, 40) });
      else if ((el = c('a[href]'))) { var host; try { host = new URL(el.href, location.href).host; } catch (_) { host = ''; } if (host && host !== location.host) track('outbound', { host: host, path: el.pathname || '' }, { now: true }); }
    }, true);
  }

  /* ---- boot ---- */
  function boot() {
    if (optedOut()) { grantGtag(false); optOutSwitch(); return; }
    if (inEurope()) {
      if (consent() === 'granted') { grantGtag(true); start(); }
      else if (consent() !== 'denied') consentBar();
      optOutSwitch();
      return;
    }
    start();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
