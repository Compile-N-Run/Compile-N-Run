/* Optional, explicit account snapshots on /learn/. Never uploads or merges on load. */
(function () {
  'use strict';
  var root = document.querySelector('[data-accounts]');
  if (!root || !document.querySelector('[data-learning-dashboard]')) return;
  var MAX_CLOUD_BYTES = 1800000, MAX_RESPONSE_BYTES = 2100000;
  var session = null, revision = null, savedAt = null, acknowledgedRevision = null;
  var hasRemote = false, busy = false, preview = null, needsMerge = false, localChanged = false;
  var status = root.querySelector('[data-account-status]');
  var signedIn = root.querySelector('[data-account-signed-in]');
  var signedOut = root.querySelector('[data-account-signed-out]');
  var identity = root.querySelector('[data-account-name]');
  var saved = root.querySelector('[data-account-saved-at]');
  var saveButton = root.querySelector('[data-account-save]');
  var previewButton = root.querySelector('[data-account-preview]');
  var mergeButton = root.querySelector('[data-account-merge]');
  var cancelButton = root.querySelector('[data-account-cancel]');
  var logoutButton = root.querySelector('[data-account-logout]');
  var deleteButton = root.querySelector('[data-account-delete]');
  var retryButton = root.querySelector('[data-account-retry]');
  var previewBox = root.querySelector('[data-account-merge-preview]');
  var counts = root.querySelector('[data-account-merge-counts]');
  var saveHint = root.querySelector('[data-account-save-hint]');
  var api = function () { if (!window.CNRLearning) throw new Error('Your browser learning tools are not ready. Reload the page before using account backups.'); return window.CNRLearning; };
  var bytes = function (value) { return new Blob([value]).size; };
  function problem(message, code, httpStatus) { var error = new Error(message); error.code = code; error.httpStatus = httpStatus; return error; }
  function object(value) { return value && typeof value === 'object' && !Array.isArray(value); }
  function say(message) { status.textContent = message; }
  function clearPreview() { preview = null; previewBox.hidden = true; counts.replaceChildren(); }
  function clearRemote() { revision = null; savedAt = null; hasRemote = false; acknowledgedRevision = null; needsMerge = false; localChanged = false; clearPreview(); }
  function displayTime(value) { return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
  function render() {
    root.hidden = !!(session && session.configured === false);
    var authenticated = !!(session && session.user);
    signedIn.hidden = !authenticated; signedOut.hidden = !(session && session.configured && !authenticated);
    var googleLink = root.querySelector('[data-account-google]'), emailLink = root.querySelector('[data-account-email]');
    if (googleLink) googleLink.hidden = !!(session && session.providers && !session.providers.google);
    if (emailLink) emailLink.hidden = !!(session && session.providers && !session.providers.email);
    identity.textContent = authenticated ? session.user.name : '';
    saveButton.disabled = busy || !authenticated || revision === null || needsMerge;
    previewButton.disabled = busy || !authenticated;
    mergeButton.disabled = busy || !authenticated || !preview;
    cancelButton.disabled = busy;
    logoutButton.disabled = busy || !authenticated;
    deleteButton.disabled = busy || !authenticated;
    retryButton.disabled = busy;
    root.setAttribute('aria-busy', String(busy));
    if (authenticated) {
      saved.textContent = revision === null ? 'Account snapshot information is unavailable.' : hasRemote ? 'Last saved to account: ' + displayTime(savedAt) : 'No learning snapshot has been saved to this account yet.';
      saveHint.textContent = needsMerge ? 'Preview and merge the saved account snapshot before saving, so learning from both places is kept.' : localChanged ? 'Your browser learning has changed. Choose Save to account when you want to upload a new snapshot.' : 'Saving is manual. Changes in this browser are not uploaded automatically.';
    }
  }
  async function responseJSON(response) {
    if (response.status === 204) return {};
    var length = Number(response.headers.get('content-length'));
    if (length > MAX_RESPONSE_BYTES) throw problem('The account response is too large to read safely. Your local learning is unchanged.', 'invalid_response');
    var raw;
    if (response.body && response.body.getReader) {
      var reader = response.body.getReader(), decoder = new TextDecoder(), chunks = [], total = 0;
      try {
        while (true) {
          var result = await reader.read(); if (result.done) break;
          total += result.value.byteLength;
          if (total > MAX_RESPONSE_BYTES) { await reader.cancel(); throw problem('The account response is too large to read safely. Your local learning is unchanged.', 'invalid_response'); }
          chunks.push(decoder.decode(result.value, { stream: true }));
        }
        chunks.push(decoder.decode()); raw = chunks.join('');
      } finally { reader.releaseLock(); }
    } else { raw = await response.text(); if (bytes(raw) > MAX_RESPONSE_BYTES) throw problem('The account response is too large.', 'invalid_response'); }
    try { return JSON.parse(raw); } catch (error) { throw problem('The account service returned an unreadable response. Your local learning is unchanged.', 'invalid_response'); }
  }
  async function request(url, options) {
    var controller = new AbortController(), timer = setTimeout(function () { controller.abort(); }, 15000);
    var opts = options || {};
    opts.credentials = 'same-origin'; opts.cache = 'no-store'; opts.redirect = 'error'; opts.signal = controller.signal;
    opts.headers = Object.assign({ Accept: 'application/json' }, opts.headers || {});
    try {
      var response = await fetch(url, opts), data = await responseJSON(response);
      if (!response.ok) {
        var code = object(data) && typeof data.error === 'string' ? data.error : '';
        if (response.status === 401) throw problem('Your sign-in has expired. Sign in again; your browser learning is still here.', 'authentication_required', 401);
        if (response.status === 409 && code === 'account_changed') throw problem('The signed-in account changed in another tab. Refresh your account connection and review the identity before trying again.', 'account_changed', 409);
        if (response.status === 409) throw problem('A newer account snapshot exists. Preview and merge it before saving again.', 'revision_conflict', 409);
        if (response.status === 413) throw problem('This snapshot is too large for account storage. Download a local backup to keep all your notes and drafts.', 'too_large', 413);
        if (response.status === 403) throw problem('Your sign-in needs to be refreshed before this action. Your browser learning is unchanged.', 'refresh_session', 403);
        throw problem('The account service is unavailable right now. Your local learning and downloadable backups still work.', 'unavailable', response.status);
      }
      return data;
    } catch (error) {
      if (error.code) throw error;
      throw problem('Could not reach your account. Check your connection and try again. Your browser learning is unchanged.', 'offline');
    } finally { clearTimeout(timer); }
  }
  function validateSession(value) {
    if (!object(value) || typeof value.configured !== 'boolean' || (value.user !== null && !object(value.user))) throw problem('The account service returned an unsupported session. Your local learning still works.', 'invalid_response');
    var providers = object(value.providers) ? { google: value.providers.google === true, email: value.providers.email === true } : { google: value.configured, email: false };
    if (value.user !== null) {
      if (!value.configured || typeof value.user.id !== 'string' || !value.user.id || value.user.id.length > 200 || typeof value.user.name !== 'string' || value.user.name.length > 100 || typeof value.csrfToken !== 'string' || !value.csrfToken || value.csrfToken.length > 500) throw problem('Your account connection could not be verified. Refresh it before using account backups.', 'invalid_response');
      return { configured: true, providers: providers, user: { id: value.user.id, name: value.user.name || 'Your account' }, csrfToken: value.csrfToken };
    }
    return { configured: value.configured, providers: providers, user: null };
  }
  function acceptSession(value) {
    var next = validateSession(value), previousID = session && session.user && session.user.id;
    if (previousID !== (next.user && next.user.id)) clearRemote();
    session = next;
  }
  function boundHeaders(write) {
    var headers = { 'X-CNR-User': session.user.id };
    if (write) { headers['X-CSRF-Token'] = session.csrfToken; headers['Content-Type'] = 'application/json'; }
    return headers;
  }
  async function sameAccount() {
    if (!session || !session.user) throw problem('Sign in before using account backups.', 'authentication_required');
    var expected = session.user.id, next = validateSession(await request('/api/auth/session'));
    if (!next.user || next.user.id !== expected) { acceptSession(next); render(); throw problem('The signed-in account changed. Review the account shown here, then choose your action again. Nothing was uploaded or merged.', 'identity_changed'); }
    session = next;
  }
  function validateSnapshot(value) {
    if (!object(value) || !Number.isSafeInteger(value.revision) || value.revision < 0 || !Object.prototype.hasOwnProperty.call(value, 'data')) throw problem('The saved account snapshot has an unsupported format. Nothing was merged.', 'invalid_snapshot');
    if (value.data !== null) {
      if (typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt))) throw problem('The saved account snapshot has an invalid date. Nothing was merged.', 'invalid_snapshot');
      var raw = JSON.stringify(value.data);
      if (bytes(raw) > MAX_CLOUD_BYTES) throw problem('The saved account snapshot exceeds the supported size. Your browser learning is unchanged.', 'invalid_snapshot');
      try { api().validateBackup(raw); } catch (error) { throw problem('The saved account snapshot could not be validated: ' + error.message, 'invalid_snapshot'); }
    } else if (value.updatedAt !== null) throw problem('The account snapshot metadata is inconsistent. Nothing was merged.', 'invalid_snapshot');
    return value;
  }
  async function readSnapshot() {
    var result = validateSnapshot(await request('/api/learning', { headers: boundHeaders(false) }));
    revision = result.revision; hasRemote = result.data !== null; savedAt = result.updatedAt;
    needsMerge = hasRemote && acknowledgedRevision !== revision;
    return result;
  }
  function handle(error) {
    if (error.code === 'authentication_required') { session = { configured: true, providers: session && session.providers, user: null }; clearRemote(); }
    else if (error.code === 'account_changed' || error.code === 'refresh_session') { session = null; clearRemote(); }
    else if (error.code === 'revision_conflict') { needsMerge = true; acknowledgedRevision = null; clearPreview(); }
    else if (error.code === 'invalid_snapshot') { revision = null; needsMerge = true; clearPreview(); }
    say(error.message || 'That action could not be completed. Your browser learning is unchanged.');
  }
  async function run(action) {
    if (busy) return;
    busy = true; render();
    try { await action(); } catch (error) { handle(error); }
    finally { busy = false; render(); }
  }
  async function connect() {
    clearPreview();
    acceptSession(await request('/api/auth/session'));
    if (!session.configured) { say(''); return; }
    if (!session.user) { say(new URLSearchParams(location.search).get('auth') === 'error' ? 'Sign-in did not finish. Try Continue with Google again when you are ready. Your browser learning is unchanged.' : 'You can keep learning without an account, or sign in to save a manual backup across devices.'); return; }
    await readSnapshot();
    say(hasRemote ? 'A saved account snapshot is available. Preview it before merging it into this browser.' : 'You are signed in. Choose Save to account to upload your first learning snapshot.');
  }
  saveButton.addEventListener('click', function () {
    run(async function () {
      if (revision === null || needsMerge) throw problem('Preview and merge the current account snapshot before saving.', 'revision_conflict');
      clearPreview(); await sameAccount();
      var raw = api().exportBackup();
      try { api().validateBackup(raw); } catch (error) { throw problem('Your browser backup could not be validated: ' + error.message, 'invalid_local'); }
      if (bytes(raw) > MAX_CLOUD_BYTES) throw problem('This backup is larger than the account limit (about 1.8 MB). Download it locally to keep all your notes and drafts; nothing was uploaded.', 'too_large');
      say('Saving this browser’s learning to your account…');
      var sent = JSON.parse(raw), signature = JSON.stringify([sent.progress, sent.learning, sent.playground]);
      var result;
      try { result = await request('/api/learning', { method: 'PUT', headers: boundHeaders(true), body: JSON.stringify({ revision: revision, data: sent }) }); }
      catch (error) {
        // A failed response can follow a successful write. Re-read before any retry.
        if (error.code !== 'too_large' && error.code !== 'authentication_required' && error.code !== 'account_changed') { acknowledgedRevision = null; needsMerge = true; }
        throw error;
      }
      if (!object(result) || !Number.isSafeInteger(result.revision) || result.revision <= revision || typeof result.updatedAt !== 'string' || !Number.isFinite(Date.parse(result.updatedAt))) { revision = null; needsMerge = true; throw problem('Could not confirm the account save. Preview saved learning before trying again; your browser data is unchanged.', 'invalid_response'); }
      revision = result.revision; acknowledgedRevision = revision; savedAt = result.updatedAt; hasRemote = true; needsMerge = false;
      try { var current = JSON.parse(api().exportBackup()); localChanged = JSON.stringify([current.progress, current.learning, current.playground]) !== signature; } catch (ignored) { localChanged = true; }
      say(localChanged ? 'The snapshot was saved, and this browser has additional changes. Save again when you want those changes included.' : 'Learning saved to your account. Future changes in this browser still need another explicit save.');
    });
  });
  previewButton.addEventListener('click', function () {
    run(async function () {
      clearPreview(); await sameAccount(); var result = await readSnapshot();
      if (result.data === null) { needsMerge = false; say('There is no account snapshot to restore yet. Your browser learning has not changed.'); return; }
      var summary = api().prepareImport(JSON.stringify(result.data));
      preview = { revision: result.revision, userID: session.user.id, token: summary.previewToken };
      var p = document.createElement('p'); p.textContent = summary.read + ' read marks · ' + summary.bookmarks + ' bookmarks · ' + summary.notes + ' notes · ' + summary.practice + ' exercise records · ' + summary.drafts + ' drafts'; counts.appendChild(p);
      p = document.createElement('p'); p.textContent = summary.noteConflicts + ' differing notes will be kept together; ' + summary.draftCopies + ' code drafts will be kept as separate copies.'; counts.appendChild(p);
      previewBox.hidden = false;
      say('Preview ready. Nothing has changed in this browser. Choose Merge into this browser to keep learning from both places.');
    });
  });
  mergeButton.addEventListener('click', function () {
    run(async function () {
      if (!preview) throw problem('Preview saved learning before merging it.', 'preview_required');
      var selected = preview; await sameAccount();
      if (session.user.id !== selected.userID) throw problem('The account changed. Preview its saved learning again.', 'identity_changed');
      var latest = await readSnapshot();
      if (latest.revision !== selected.revision || latest.data === null) throw problem('The account snapshot changed after your preview. Preview and merge the newer version before saving.', 'revision_conflict');
      try { api().applyImport(selected.token); } catch (error) { clearPreview(); throw error; }
      acknowledgedRevision = selected.revision; needsMerge = false; clearPreview(); localChanged = true;
      say('Saved learning was merged into this browser. Nothing was uploaded. Choose Save to account when you want to store the merged snapshot.');
    });
  });
  cancelButton.addEventListener('click', function () { clearPreview(); say('Account restore cancelled. Your browser learning is unchanged.'); render(); });
  logoutButton.addEventListener('click', function () {
    run(async function () { await sameAccount(); await request('/api/auth/logout', { method: 'POST', headers: boundHeaders(true), body: '{}' }); session = { configured: true, providers: session && session.providers, user: null }; clearRemote(); say('Signed out. Learning saved in this browser is still here.'); });
  });
  deleteButton.addEventListener('click', function () {
    if (busy || !session || !session.user) return;
    if (!window.confirm('Delete the account for ' + session.user.name + '? This permanently removes its saved account snapshot and signs it out on all devices. Learning stored in this browser will remain.')) return;
    run(async function () { await sameAccount(); await request('/api/auth/account', { method: 'DELETE', headers: boundHeaders(true), body: '{}' }); session = { configured: true, providers: session && session.providers, user: null }; clearRemote(); say('Your account and its saved snapshot were deleted. Learning in this browser was not erased.'); });
  });
  retryButton.addEventListener('click', function () { run(connect); });
  window.addEventListener('cnr:learning-updated', function () { if (session && session.user) { localChanged = true; render(); } });
  root.hidden = false;
  say('Checking account availability…');
  run(connect);
})();
