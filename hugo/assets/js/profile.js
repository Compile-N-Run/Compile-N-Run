/* Account forms use cookies plus server-bound CSRF. Passwords and mail tokens
 * stay in this page's memory and are never added to browser learning storage. */
(function () {
  'use strict';
  var root = document.querySelector('[data-profile]'); if (!root) return;
  var session = null, busy = false, verifyToken = '', resetToken = '', badLink = false, pendingEmail = '';
  var status = root.querySelector('[data-profile-status]');
  var forms = Array.from(root.querySelectorAll('[data-profile-form]'));
  var externalAuthPending = false, navigating = false, connected = false;
  async function beforeAuthAction(action) {
    if (!window.CNRAuth) return;
    externalAuthPending = true; var waits = [];
    window.dispatchEvent(new CustomEvent('cnr:auth-changing', { detail: { action: action, session: window.CNRAuth.getSession(), waitUntil: function (task) { waits.push(Promise.resolve(task)); } } }));
    await Promise.all(waits);
  }
  var TOKEN = /^[A-Za-z0-9_-]{43}$/;
  // Remove mail secrets as the profile initializes. Fragments never enter requests;
  // older query links are accepted but also immediately removed from the address bar.
  function captureMailLink() {
    try {
    var hash = new URLSearchParams(location.hash.slice(1)), query = new URLSearchParams(location.search);
    var hasMail = hash.has('verify') || hash.has('reset') || query.has('verify') || query.has('reset');
    if (hasMail) {
      verifyToken = ''; resetToken = ''; badLink = false; clearPasswords();
      var verifies = hash.getAll('verify').concat(query.getAll('verify')), resets = hash.getAll('reset').concat(query.getAll('reset'));
      if (verifies.length === 1 && resets.length === 0 && TOKEN.test(verifies[0])) verifyToken = verifies[0];
      else if (resets.length === 1 && verifies.length === 0 && TOKEN.test(resets[0])) resetToken = resets[0];
      else badLink = true;
      history.replaceState(null, '', location.pathname);
    }
  } catch (ignored) { badLink = true; }
  }
  captureMailLink();
  function object(value) { return value && typeof value === 'object' && !Array.isArray(value); }
  function error(message, code) { var e = new Error(message); e.code = code; return e; }
  function say(message, form) { (form ? form.querySelector('[data-profile-message]') : status).textContent = message; }
  function clearPasswords(form) { (form || root).querySelectorAll('input[type="password"]').forEach(function (field) { field.value = ''; }); }
  function formNamed(name) { return forms.find(function (form) { return form.getAttribute('data-profile-form') === name; }); }
  function validateSession(value) {
    if (!object(value) || typeof value.configured !== 'boolean' || (value.user !== null && !object(value.user))) throw error('Your account connection could not be verified. Refresh it and try again.', 'invalid_response');
    var providers = object(value.providers) ? { google: value.providers.google === true, github: value.providers.github === true, email: value.providers.email === true } : { google: value.configured, github: false, email: false };
    if (value.user === null) return { configured: value.configured, providers: providers, user: null };
    var u = value.user;
    if (typeof u.id !== 'string' || !u.id || u.id.length > 200 || typeof u.name !== 'string' || u.name.length > 100 ||
        !(u.email === null || typeof u.email === 'string' && u.email.length <= 254) ||
        typeof u.emailVerified !== 'boolean' || typeof u.hasPassword !== 'boolean' || typeof u.googleLinked !== 'boolean' ||
        !(u.googleEmail === undefined || u.googleEmail === null || typeof u.googleEmail === 'string' && u.googleEmail.length <= 254) ||
        !(u.githubLinked === undefined || typeof u.githubLinked === 'boolean') || !(u.githubLogin === undefined || u.githubLogin === null || typeof u.githubLogin === 'string' && u.githubLogin.length <= 39) ||
        typeof value.csrfToken !== 'string' || !value.csrfToken || value.csrfToken.length > 500) throw error('Account details could not be read safely. Refresh your connection before making changes.', 'invalid_response');
    return { configured: value.configured, providers: providers, user: { id: u.id, name: u.name, email: u.email, emailVerified: u.emailVerified, hasPassword: u.hasPassword, googleLinked: u.googleLinked, googleEmail: u.googleLinked && u.googleEmail || null, githubLinked: u.githubLinked === true, githubLogin: u.githubLinked === true && u.githubLogin || null }, csrfToken: value.csrfToken };
  }
  function accept(value, fill) {
    var next = validateSession(value), previousID = session && session.user && session.user.id;
    if (previousID !== (next.user && next.user.id)) { clearPasswords(); pendingEmail = ''; }
    session = next; render(fill || previousID !== (next.user && next.user.id));
  }
  function render(fill) {
    var user = session && session.user, ready = !!(session && session.configured), email = !!(session && session.providers.email), google = !!(session && session.providers.google), github = !!(session && session.providers.github);
    // Unlinking a provider needs another way back in: a verified password, or the other provider.
    var otherThanGoogle = !!user && ((user.hasPassword && user.emailVerified && email) || (user.githubLinked && github));
    var otherThanGithub = !!user && ((user.hasPassword && user.emailVerified && email) || (user.googleLinked && google));
    root.setAttribute('aria-busy', String(busy));
    root.querySelector('[data-profile-guest]').hidden = !ready || !!user;
    root.querySelector('[data-profile-member]').hidden = !user;
    root.querySelector('[data-profile-verify]').hidden = !verifyToken;
    root.querySelector('[data-profile-reset]').hidden = !resetToken;
    root.querySelector('[data-profile-refresh]').disabled = busy;
    root.querySelector('[data-profile-refresh-row]').hidden = !connected || ready;
    forms.forEach(function (form) {
      var kind = form.getAttribute('data-profile-form'), memberForm = ['name', 'password', 'enroll'].indexOf(kind) >= 0;
      var allowed = kind === 'name' ? !!user : email && (memberForm ? !!user : ready);
      form.querySelectorAll('input, button').forEach(function (control) { control.disabled = busy || !allowed; });
    });
    var link = root.querySelector('[data-profile-link-google]'), unlink = root.querySelector('[data-profile-unlink-google]');
    link.hidden = !user || !google || !!user.googleLinked; link.disabled = busy || !user || !google;
    unlink.hidden = !user || !user.googleLinked; unlink.disabled = busy || !user || !otherThanGoogle;
    var linkGithub = root.querySelector('[data-profile-link-github]'), unlinkGithub = root.querySelector('[data-profile-unlink-github]');
    linkGithub.hidden = !user || !github || !!user.githubLinked; linkGithub.disabled = busy || !user || !github;
    unlinkGithub.hidden = !user || !user.githubLinked; unlinkGithub.disabled = busy || !user || !otherThanGithub;
    root.querySelector('[data-profile-github-status]').hidden = !github && !(user && user.githubLinked);
    root.querySelector('[data-profile-logout]').disabled = busy || !user;
    root.querySelector('[data-profile-delete]').disabled = busy || !user;
    var cancelEmail = root.querySelector('[data-profile-cancel-email]');
    cancelEmail.hidden = !user || !user.email || user.emailVerified || user.hasPassword || !(user.googleLinked || user.githubLinked); cancelEmail.disabled = busy || !user;
    root.querySelector('[data-profile-enrollment]').hidden = !user || !email || user.hasPassword;
    root.querySelector('[data-profile-member-resend]').hidden = !user || !email || (user.hasPassword && user.emailVerified);
    root.querySelector('[data-profile-password-form]').hidden = !user || !email || !user.hasPassword;
    if (user) {
      root.querySelector('[data-profile-name]').textContent = user.name;
      root.querySelector('[data-profile-email]').textContent = user.email ? 'Email: ' + user.email : user.googleEmail ? 'Google email: ' + user.googleEmail : user.githubLogin ? 'GitHub account: ' + user.githubLogin : 'No email sign-in has been added.';
      var verified = root.querySelector('[data-profile-verified]');
      verified.hidden = !user.email; verified.textContent = user.emailVerified ? 'Email verified.' : 'Email has not been verified for email sign-in.';
      root.querySelector('[data-profile-google-status]').textContent = !user.googleLinked ? 'No Google account is linked.' : user.googleEmail ? 'Google account linked: ' + user.googleEmail : 'A Google account is linked to this account. Its email appears here after your next Google sign-in.';
      root.querySelector('[data-profile-unlink-help]').textContent = user.googleLinked && !otherThanGoogle ? 'Keep Google linked until you have another way to sign in: a verified email and password, or a linked GitHub account.' : 'Linking Google adds a sign-in method to this same account; it does not combine different accounts or upload browser learning.';
      root.querySelector('[data-profile-github-status]').textContent = !user.githubLinked ? 'No GitHub account is linked.' : 'GitHub account linked' + (user.githubLogin ? ': ' + user.githubLogin : '') + '.';
      root.querySelector('[data-profile-github-help]').textContent = user.githubLinked && !otherThanGithub ? 'Keep GitHub linked until you have another way to sign in: a verified email and password, or a linked Google account.' : 'Linking GitHub adds a sign-in method to this same account; it does not combine different accounts.';
      if (fill) { formNamed('name').elements.name.value = user.name; formNamed('enroll').elements.email.value = user.email || pendingEmail; formNamed('resend-member').elements.email.value = user.email || pendingEmail; }
    }
  }
  async function readResponse(response) {
    if (response.status === 204) return {};
    if (Number(response.headers.get('content-length')) > 64000) throw error('The account response could not be read safely.', 'invalid_response');
    var raw;
    if (response.body && response.body.getReader) {
      var reader = response.body.getReader(), decoder = new TextDecoder(), chunks = [], total = 0;
      try {
        while (true) {
          var part = await reader.read(); if (part.done) break;
          total += part.value.byteLength;
          if (total > 64000) { await reader.cancel(); throw error('The account response could not be read safely.', 'invalid_response'); }
          chunks.push(decoder.decode(part.value, { stream: true }));
        }
        chunks.push(decoder.decode()); raw = chunks.join('');
      } finally { reader.releaseLock(); }
    } else { raw = await response.text(); if (new Blob([raw]).size > 64000) throw error('The account response could not be read safely.', 'invalid_response'); }
    try { return JSON.parse(raw); } catch (ignored) { throw error('The account service returned an unreadable response. Please try again later.', 'invalid_response'); }
  }
  async function request(url, method, body, authenticated) {
    if (method !== 'GET' && ['/api/auth/login', '/api/auth/logout', '/api/auth/account', '/api/auth/password', '/api/auth/verify-email', '/api/auth/reset-password', '/api/auth/google/link', '/api/auth/github/link'].indexOf(url) >= 0) await beforeAuthAction(url);
    var controller = new AbortController(), timer = setTimeout(function () { controller.abort(); }, 15000);
    var headers = { Accept: 'application/json' };
    if (method !== 'GET') headers['Content-Type'] = 'application/json';
    if (authenticated) { headers['X-CNR-User'] = session.user.id; headers['X-CSRF-Token'] = session.csrfToken; }
    try {
      var response = await fetch(url, { method: method, headers: headers, credentials: 'same-origin', redirect: 'error', cache: 'no-store', signal: controller.signal, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      var data = await readResponse(response);
      if (!response.ok) {
        var code = object(data) && typeof data.error === 'string' ? data.error : '';
        if (code === 'account_changed') throw error('The signed-in account changed in another tab. Refresh the connection before changing this account.', 'account_changed');
        if (code === 'authentication_required') throw error('Please sign in again before changing account settings.', 'authentication_required');
        if (code === 'invalid_email') throw error('Enter a valid email address and try again.', 'invalid_email');
        if (code === 'invalid_name') throw error('Choose a display name of 1–100 visible characters.', 'invalid_name');
        if (code === 'password_policy') throw error('Use a password with 15–128 characters. Spaces are kept.', 'password_length');
        if (response.status === 429) throw error('Please wait a little before trying again. Your existing account and local learning are unchanged.', 'rate_limited');
        if (url === '/api/auth/login' && response.status === 401) throw error('The email or password was not accepted. If you just registered, verify your email before signing in.', 'invalid_credentials');
        if (url === '/api/auth/verify-email' && response.status < 500) throw error('The verification link or password was not accepted. Use the password you chose for this email, or request another verification link.', 'invalid_token');
        if (url === '/api/auth/reset-password' && response.status < 500) throw error('This reset link could not be used. Request a new reset link and try again.', 'invalid_token');
        if (url === '/api/auth/password' && response.status < 500) throw error('The password could not be changed. Check your current password and the new password requirements.', 'password_failed');
        if ((url === '/api/auth/google/link' || url === '/api/auth/github/link') && method === 'DELETE' && response.status < 500) throw error('This sign-in method could not be unlinked. Keep another way to sign in (a verified email and password, or another linked account) before removing it.', 'unlink_failed');
        if (response.status === 403) throw error('Refresh your account connection before trying this action again.', 'refresh_session');
        throw error('That account action is unavailable right now. Please try again later; your browser learning is unchanged.', 'unavailable');
      }
      return data;
    } catch (e) { if (e.code) throw e; throw error('Could not reach the account service. Check your connection and try again. Your browser learning is unchanged.', 'offline'); }
    finally { clearTimeout(timer); }
  }
  async function refresh(fill) { accept(window.CNRAuth ? await window.CNRAuth.refresh({ force: true }) : await request('/api/auth/session', 'GET'), fill); externalAuthPending = false; }
  async function sameAccount() {
    if (!session || !session.user) throw error('Please sign in before changing account settings.', 'authentication_required');
    var expected = session.user.id, next = validateSession(window.CNRAuth ? await window.CNRAuth.refresh({ force: true }) : await request('/api/auth/session', 'GET'));
    if (!next.user || next.user.id !== expected) { accept(next, true); throw error('The signed-in account changed. Review the account shown here and choose your action again. No settings were changed.', 'identity_changed'); }
    session = next;
  }
  function handle(e, form) {
    if (e.code === 'authentication_required') { accept({ configured: true, providers: session ? session.providers : { google: true, email: true }, user: null }, true); say(e.message); }
    else if (e.code === 'account_changed' || e.code === 'refresh_session') { session = null; clearPasswords(); render(); say(e.message); }
    else say(e.message || 'That action could not be completed. Please try again.', form);
  }
  async function run(action, form) {
    if (busy) return; busy = true; render(); say('Working…', form);
    try { await action(); } catch (e) { handle(e, form); }
    finally { if (externalAuthPending && !navigating && window.CNRAuth) { try { await refresh(true); } catch (_) {} externalAuthPending = false; } busy = false; render(); }
  }
  function password(value, field) {
    var length = Array.from(value).length;
    if (length < 15 || length > 128 || new Blob([value]).size > 1024 || value.indexOf('\0') >= 0) { var e = error('Use a password with 15–128 characters. Spaces are kept.', 'password_length'); e.field = field; throw e; }
  }
  function capture(form) {
    var data = new FormData(form), kind = form.getAttribute('data-profile-form'), payload = {};
    ['name', 'email', 'password', 'currentPassword', 'newPassword', 'confirm'].forEach(function (key) { if (data.has(key)) payload[key] = String(data.get(key)); });
    if (payload.name !== undefined) { payload.name = payload.name.trim(); if (!payload.name || payload.name.length > 100) throw error('Enter a display name of up to 100 characters.', 'name_length'); }
    if (payload.email !== undefined) payload.email = payload.email.trim();
    if (['reset', 'enroll'].indexOf(kind) >= 0) password(payload.password, 'password');
    if (kind === 'password') password(payload.newPassword, 'newPassword');
    if (payload.confirm !== undefined && payload.confirm !== (payload.newPassword === undefined ? payload.password : payload.newPassword)) { var e = error('The two passwords do not match.', 'password_mismatch'); e.field = 'confirm'; throw e; }
    return payload;
  }
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault(); if (busy || !form.reportValidity()) return;
      var fields; try { fields = capture(form); } catch (e) { say(e.message, form); if (e.field && form.elements[e.field]) form.elements[e.field].focus(); return; }
      var kind = form.getAttribute('data-profile-form'), selectedToken = kind === 'verify' ? verifyToken : resetToken;
      run(async function () {
        if (kind === 'resend-member') {
          await request('/api/auth/resend-verification', 'POST', { email: fields.email });
          say('If this address needs verification, a verification email will arrive shortly.', form);
        } else if (kind === 'verify') {
          if (!selectedToken) throw error('Open a fresh verification link from your email.', 'invalid_token');
          await request('/api/auth/verify-email', 'POST', { token: selectedToken, password: fields.password }); if (verifyToken === selectedToken) verifyToken = ''; clearPasswords(form); await refresh(true); say('Email verified. You can now use that email and password to sign in.');
        } else if (kind === 'reset') {
          if (!selectedToken) throw error('Open a fresh reset link from your email.', 'invalid_token');
          await request('/api/auth/reset-password', 'POST', { token: selectedToken, password: fields.password }); if (resetToken === selectedToken) resetToken = ''; clearPasswords(); await refresh(true); say('Password reset. Sign in again using the new password; previous sign-ins for that account have ended.');
        } else if (kind === 'name') {
          await sameAccount(); await request('/api/auth/profile', 'PATCH', { name: fields.name }, true); await refresh(true); say('Display name saved.', form);
        } else if (kind === 'password') {
          await sameAccount(); await request('/api/auth/password', 'POST', { currentPassword: fields.currentPassword, newPassword: fields.newPassword }, true); clearPasswords(form); await refresh(true); say('Password changed. Use the new password when signing in again.');
        } else if (kind === 'enroll') {
          await sameAccount(); await request('/api/auth/email', 'POST', { email: fields.email, password: fields.password }, true); pendingEmail = fields.email; formNamed('resend-member').elements.email.value = fields.email; clearPasswords(form); await refresh(true); say('If this email can be added, a verification message will arrive shortly. Enter the password you just chose when opening its link. Google remains available.', form);
        }
      }, form);
    });
  });
  [{ key: 'google', label: 'Google', origin: 'https://accounts.google.com', path: '/o/oauth2/v2/auth' },
   { key: 'github', label: 'GitHub', origin: 'https://github.com', path: '/login/oauth/authorize' }].forEach(function (provider) {
    root.querySelector('[data-profile-link-' + provider.key + ']').addEventListener('click', function () {
      run(async function () {
        await sameAccount(); var result = await request('/api/auth/' + provider.key + '/link', 'POST', {}, true), destination;
        try { destination = new URL(result.url); } catch (ignored) { throw error('The ' + provider.label + ' sign-in link could not be verified. Please try again.', 'invalid_response'); }
        if (destination.origin !== provider.origin || destination.pathname !== provider.path || destination.username || destination.password) throw error('The ' + provider.label + ' sign-in link could not be verified. No navigation was made.', 'invalid_response');
        say('Continue with ' + provider.label + ' to add it to this same account.'); navigating = true; location.assign(destination.href);
      });
    });
    root.querySelector('[data-profile-unlink-' + provider.key + ']').addEventListener('click', function () {
      if (busy || !session || !session.user || !confirm('Unlink ' + provider.label + ' and sign this account out on all devices? You will sign in again with your remaining sign-in method.')) return;
      run(async function () { await sameAccount(); await request('/api/auth/' + provider.key + '/link', 'DELETE', {}, true); await refresh(true); say(provider.label + ' was unlinked. Sign in again with your remaining sign-in method.'); });
    });
  });
  root.querySelector('[data-profile-cancel-email]').addEventListener('click', function () {
    run(async function () { await sameAccount(); await request('/api/auth/email', 'DELETE', {}, true); pendingEmail = ''; await refresh(true); say('The pending email request was cancelled. Your linked account remains linked, and browser learning is unchanged.'); });
  });
  root.querySelector('[data-profile-logout]').addEventListener('click', function () {
    run(async function () { await sameAccount(); await request('/api/auth/logout', 'POST', {}, true); clearPasswords(); await refresh(true); say('Signed out. Learning saved in this browser is still here.'); });
  });
  root.querySelector('[data-profile-delete]').addEventListener('click', function () {
    if (busy || !session || !session.user || !confirm('Delete the account for ' + session.user.name + '? Its account snapshot and all sign-ins will be removed permanently. Learning in this browser will remain.')) return;
    run(async function () { await sameAccount(); await request('/api/auth/account', 'DELETE', {}, true); clearPasswords(); await refresh(true); say('Your account was deleted. Browser learning was not erased.'); });
  });
  async function connect() {
    try { await refresh(true); } finally { connected = true; }
    if (badLink) say('This email link is invalid. Request a new verification or reset email.');
    else if (!session.configured) say('Account sign-in is unavailable right now. You can continue learning and keep local backups from the dashboard.');
    else if (verifyToken) say('Your verification link is ready. Enter the password you chose and select Verify email.');
    else if (resetToken) say('Your reset link is ready. Choose a new password to continue.');
    else if (new URLSearchParams(location.search).get('auth') === 'linked') say('The account linking flow finished. Review the sign-in methods below to confirm the linked status.');
    else if (new URLSearchParams(location.search).get('auth') === 'error') say('Sign-in or linking did not finish. Your existing account settings were not changed.');
    else say('');
  }
  root.querySelector('[data-profile-refresh]').addEventListener('click', function () { run(connect); });
  window.addEventListener('hashchange', function () {
    captureMailLink(); render();
    if (badLink) say('This email link is invalid. Request a new verification or reset email.');
    else if (verifyToken) say('Your verification link is ready. Enter the password you chose and select Verify email.');
    else if (resetToken) say('Your reset link is ready. Choose a new password to continue.');
  });
  // The navbar popup owns sign-in; reflect its result here without reloading.
  window.addEventListener('cnr:auth-changed', function (event) {
    if (busy || !event.detail || !event.detail.session) return;
    try { accept(event.detail.session, true); say(session.user ? '' : 'Signed out. Learning saved in this browser is still here.'); } catch (ignored) {}
  });
  render(); run(connect);
})();
