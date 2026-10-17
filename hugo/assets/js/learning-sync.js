/* Automatic account learning. Working stores stay backwards-compatible; durable
 * IndexedDB partitions isolate guest and account data. No credential is stored. */
(function () {
  'use strict';
  if (!window.CNR_SYNC_ENABLED || !window.CNRLearning) return;
  var api = window.CNRLearning, OWNER = 'cnr_learning_owner_v1', TRANSITION = 'cnr_learning_transition_v1';
  var CLOUD_LIMIT = 1800000, LOCK = 'cnr-learning-state', dbPromise;
  var owner = null, auth = null, phase = true, ready = false, hasActivated = false, generation = 0, applying = false, draining = false, lastSyncError = null;
  var timer = null, controller = null, lastAttempt = 0, backoff = 0, nextAllowedAttempt = 0, localQueue = Promise.resolve(), running = null;
  var authObserved = false, efficientSync = false, refreshRequired = false;
  var REFRESH_INTERVAL = 300000;
  var status = { state: 'loading', message: 'Loading your learning…' }, lastView = null;
  function empty() { return { format: 'cnr-learning-backup', version: 1, exportedAt: new Date().toISOString(), progress: { v: 1, done: {}, tuts: {} }, learning: { v: 1, lessons: {} }, playground: { version: 1, drafts: {} } }; }
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function stable(value) { if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']'; if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(function (k) { return JSON.stringify(k) + ':' + stable(value[k]); }).join(',') + '}'; return JSON.stringify(value); }
  function signature(data) { return stable([data.progress, data.learning, data.playground]); }
  function equal(a, b) { return stable(a) === stable(b); }
  function union() { var out = new Set(); Array.from(arguments).forEach(function (o) { Object.keys(o || {}).forEach(function (k) { out.add(k); }); }); return Array.from(out); }
  function normal(value) { var clean = api.validateBackup(JSON.stringify(value)); return { format: 'cnr-learning-backup', version: 1, exportedAt: value.exportedAt || new Date().toISOString(), progress: clean.progress, learning: clean.learning, playground: clean.playground }; }
  function marker() { var raw = localStorage.getItem(OWNER); if (!raw) return null; var value = JSON.parse(raw); if (!value || value.v !== 1 || typeof value.owner !== 'string' || !/^(guest|user:[A-Za-z0-9_-]{1,200})$/.test(value.owner)) throw new Error('The saved learning owner is unreadable.'); return value.owner; }
  function sessionOwner(value) { if (!value) return null; if (!value.user) return 'guest'; if (!/^[A-Za-z0-9_-]{1,200}$/.test(value.user.id || '')) throw new Error('The account identity is invalid.'); return 'user:' + value.user.id; }
  function mayWrite() {
    try { return ready && !phase && !draining && owner === marker() && !localStorage.getItem(TRANSITION) && (!auth || sessionOwner(auth) === owner); } catch (_) { return false; }
  }
  function mayView() { try { return ready && !phase && owner === marker() && (!auth || sessionOwner(auth) === owner); } catch (_) { return false; } }
  function currentSnapshot() { var saved = normal(disk()); return threeWay(lastView || saved, api.captureSnapshot(true), saved); }
  function renderGuard() { var previous = applying; applying = true; api.setWriteGuard(mayWrite, mayView); applying = previous; }
  renderGuard();
  function tell(state, message) {
    status = { state: state, message: message };
    document.querySelectorAll('[data-learning-sync-status]').forEach(function (node) { node.textContent = message; });
    document.querySelectorAll('[data-learning-sync-actions]').forEach(function (node) { node.hidden = state !== 'error' && state !== 'offline'; });
    window.dispatchEvent(new CustomEvent('cnr:sync-status', { detail: copy(status) }));
  }
  function database() {
    if (!dbPromise) dbPromise = new Promise(function (resolve, reject) {
      var request = indexedDB.open('cnr-learning-sync-v1', 1);
      request.onupgradeneeded = function () { request.result.createObjectStore('state'); };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(new Error('Account learning could not be saved on this device.')); };
      request.onblocked = function () { reject(new Error('Close older site tabs and retry opening account learning.')); };
    });
    return dbPromise;
  }
  async function dbGet(key) { var db = await database(); return new Promise(function (resolve, reject) { var tx = db.transaction('state', 'readonly'), request = tx.objectStore('state').get(key); request.onsuccess = function () { resolve(request.result); }; request.onerror = function () { reject(request.error); }; }); }
  async function dbPut(key, value) { var db = await database(); return new Promise(function (resolve, reject) { var tx = db.transaction('state', 'readwrite'); tx.objectStore('state').put(value, key); tx.oncomplete = resolve; tx.onerror = tx.onabort = function () { reject(tx.error || new Error('Device storage is full or unavailable.')); }; }); }
  async function dbRemove(key) { var db = await database(); return new Promise(function (resolve, reject) { var tx = db.transaction('state', 'readwrite'); tx.objectStore('state').delete(key); tx.oncomplete = resolve; tx.onerror = tx.onabort = function () { reject(tx.error || new Error('Device storage is unavailable.')); }; }); }
  function locked(fn) { if (!navigator.locks) return Promise.reject(new Error('This browser cannot safely coordinate account learning. Your local data has not been replaced.')); return navigator.locks.request(LOCK, fn); }
  async function partition(id) {
    var value = await dbGet(id); if (!value) return { v: 1, owner: id, revision: 0, base: empty(), local: empty(), pending: false, detachedBase: null };
    if (value.v !== 1 || value.owner !== id || !Number.isSafeInteger(value.revision) || value.revision < 0) throw new Error('The account’s saved device copy needs recovery.');
    value.base = normal(value.base); value.local = normal(value.local); if (value.detachedBase) value.detachedBase = normal(value.detachedBase); return value;
  }
  function select(b, l, r, timestamp) {
    if (equal(l, b)) return r; if (equal(r, b) || equal(l, r)) return l;
    if (l === undefined || r === undefined) return undefined; // Concurrent deletion is conservative.
    return timestamp ? ((l[timestamp] || 0) >= (r[timestamp] || 0) ? l : r) : (stable(l) >= stable(r) ? l : r);
  }
  function hash(value) { var h = 2166136261; for (var i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); }
  function threeWay(base, local, remote) {
    base = normal(base); local = normal(local); remote = normal(remote); var out = empty();
    union(base.progress.done, local.progress.done, remote.progress.done).forEach(function (p) {
      var b = base.progress.done[p], l = local.progress.done[p], r = remote.progress.done[p], result;
      if (l === b) result = r; else if (r === b || l === r) result = l; else if (l === undefined || r === undefined) result = undefined; else result = Math.max(l, r);
      if (result !== undefined) out.progress.done[p] = result;
    });
    union(base.progress.tuts, local.progress.tuts, remote.progress.tuts).forEach(function (id) { var result = select(base.progress.tuts[id], local.progress.tuts[id], remote.progress.tuts[id], 't'); if (result) out.progress.tuts[id] = copy(result); });
    union(base.learning.lessons, local.learning.lessons, remote.learning.lessons).forEach(function (p) {
      var b = base.learning.lessons[p] || {}, l = local.learning.lessons[p] || {}, r = remote.learning.lessons[p] || {};
      var meta = (l.updatedAt || 0) >= (r.updatedAt || 0) ? l : r;
      var item = { title: meta.title || l.title || r.title || p, course: meta.course || l.course || r.course || '', visitedAt: Math.max(l.visitedAt || 0, r.visitedAt || 0), updatedAt: Math.max(l.updatedAt || 0, r.updatedAt || 0), practice: {} };
      var bookmark = select(b.bookmark, l.bookmark, r.bookmark, 'updatedAt'); if (bookmark) item.bookmark = copy(bookmark);
      var chosen = select(b.note, l.note, r.note, 'updatedAt'), versions = [];
      [l.noteConflicts || [], r.noteConflicts || []].forEach(function (list) { list.forEach(function (v) { if (v.text && !versions.some(function (x) { return x.text === v.text; })) versions.push(copy(v)); }); });
      if (!equal(l.note, b.note) && !equal(r.note, b.note) && !equal(l.note, r.note)) {
        [l.note, r.note].forEach(function (n) { if (n && n.text && (!chosen || n.text !== chosen.text) && !versions.some(function (v) { return v.text === n.text; })) versions.push(copy(n)); });
      }
      if (chosen) item.note = copy(chosen); if (versions.length) item.noteConflicts = versions;
      union(b.practice, l.practice, r.practice).forEach(function (id) {
        var a = l.practice && l.practice[id], c = r.practice && r.practice[id], previous = b.practice && b.practice[id];
        var result = select(previous, a, c, 'attemptedAt');
        if (result) { result = copy(result); if (a && c) result.passedAt = Math.max(a.passedAt || 0, c.passedAt || 0); item.practice[id] = result; }
      });
      out.learning.lessons[p] = item;
    });
    var copies = [];
    union(base.playground.drafts, local.playground.drafts, remote.playground.drafts).forEach(function (key) {
      var b = base.playground.drafts[key], l = local.playground.drafts[key], r = remote.playground.drafts[key];
      var result;
      if (equal(l, b)) result = r; else if (equal(r, b) || equal(l, r)) result = l;
      else {
        result = l === undefined || r === undefined ? undefined : Date.parse(l.updatedAt) >= Date.parse(r.updatedAt) ? l : r;
        [l, r].forEach(function (candidate) { if (candidate && !equal(candidate, result) && (!result || ['html', 'css', 'js'].some(function (k) { return candidate[k] !== result[k]; }))) copies.push(candidate); });
      }
      if (result) out.playground.drafts[key] = copy(result);
    });
    copies.forEach(function (d) {
      if (Object.values(out.playground.drafts).some(function (v) { return v.path === d.path && v.html === d.html && v.css === d.css && v.js === d.js; })) return;
      var stem = 'workspace:conflict-' + hash(stable(d)), key = stem, index = 1;
      while (out.playground.drafts[key]) key = stem + '-' + index++;
      out.playground.drafts[key] = copy(d);
    });
    Object.keys(out.progress.tuts).forEach(function (id) { var t = out.progress.tuts[id]; t.done = Math.min(t.total, Object.keys(out.progress.done).filter(function (p) { return p.indexOf('/docs/' + id + '/') === 0; }).length); });
    return normal(out);
  }
  function changes(before, after) {
    var previous = { read: before.progress.done, course: before.progress.tuts, lesson: before.learning.lessons, draft: before.playground.drafts };
    var next = { read: after.progress.done, course: after.progress.tuts, lesson: after.learning.lessons, draft: after.playground.drafts }, result = [];
    Object.keys(next).forEach(function (kind) {
      union(previous[kind], next[kind]).forEach(function (key) {
        if (!equal(previous[kind][key], next[kind][key])) result.push({ kind: kind, key: key, value: next[kind][key] === undefined ? null : next[kind][key] });
      });
    });
    return result;
  }
  function disk() { return api.readDiskSnapshot(); }
  async function flushOwner(id, includeEditor) {
    var cached = await partition(id), activeDisk = marker() === id ? disk() : cached.local;
    var current = activeDisk;
    if (cached.detachedBase) current = threeWay(cached.detachedBase, current, cached.local);
    if (id === owner && includeEditor) current = threeWay(lastView || activeDisk, api.captureSnapshot(true), current);
    cached.local = current; cached.pending = signature(current) !== signature(cached.base);
    cached.detachedBase = signature(current) === signature(activeDisk) ? null : activeDisk;
    await dbPut(id, cached); return cached;
  }
  async function install(id, data, oldID, oldData, ownerChange) {
    // A recoverable account transition is durable before touching any working key.
    localStorage.setItem(TRANSITION, '1');
    try { await dbPut('recovery', { v: 1, owner: oldID, data: oldData }); } catch (e) { localStorage.removeItem(TRANSITION); throw e; }
    try {
      applying = true; api.replaceSnapshot(data, { ownerChange: ownerChange });
      localStorage.setItem(OWNER, JSON.stringify({ v: 1, owner: id }));
      await dbRemove('recovery'); localStorage.removeItem(TRANSITION);
    } catch (e) {
      try { api.replaceSnapshot(oldData, { ownerChange: false }); localStorage.setItem(OWNER, JSON.stringify({ v: 1, owner: oldID })); await dbRemove('recovery'); localStorage.removeItem(TRANSITION); } catch (_) {}
      throw e;
    } finally { applying = false; }
    lastView = copy(data);
  }
  async function recoverWorking() {
    var recover = await dbGet('recovery');
    if (recover) {
      if (recover.v !== 1 || !/^(guest|user:[A-Za-z0-9_-]{1,200})$/.test(recover.owner)) throw new Error('Saved learning needs recovery before an account can open.');
      applying = true;
      try { api.replaceSnapshot(normal(recover.data), { ownerChange: true }); localStorage.setItem(OWNER, JSON.stringify({ v: 1, owner: recover.owner })); }
      finally { applying = false; }
      await dbRemove('recovery'); localStorage.removeItem(TRANSITION);
    } else if (localStorage.getItem(TRANSITION)) localStorage.removeItem(TRANSITION);
  }
  async function boot() {
    await database();
    await locked(async function () {
      await recoverWorking();
      owner = marker();
      if (!owner) {
        var guest = normal(api.captureSnapshot(false)); await dbPut('guest', { v: 1, owner: 'guest', revision: 0, base: empty(), local: guest, pending: false, detachedBase: null });
        localStorage.setItem(OWNER, JSON.stringify({ v: 1, owner: 'guest' })); owner = 'guest';
      }
      lastView = normal(api.captureSnapshot(false));
    });
  }
  var bootPromise = boot();
  function cancel() { generation++; if (controller) controller.abort(); clearTimeout(timer); timer = null; }
  async function transition(value) {
    if (ready && !phase && marker() === owner && (!value || sessionOwner(value) === owner)) {
      auth = value; cancel(); if (value && value.user && lastSyncError && lastSyncError.status !== 429) { nextAllowedAttempt = 0; backoff = 0; } renderGuard();
      if (value && value.user) schedule(true); else tell(value ? 'guest' : 'offline', value ? 'Guest progress stays in this browser; signed-in progress syncs across devices.' : 'Offline. Your existing workspace and changes are kept on this device.');
      return;
    }
    var previousOwner = owner;
    phase = true; ready = false; renderGuard(); cancel();
    auth = value;
    await bootPromise; await localQueue.catch(function () {});
    try {
      await locked(async function () {
        await recoverWorking();
        var existing = marker(), target = sessionOwner(value) || existing;
        localStorage.setItem(TRANSITION, '1');
        if (owner && owner !== existing) await flushOwner(owner, true);
        if (!existing) throw new Error('Learning ownership could not be established.');
        var outgoing = await flushOwner(existing, existing === owner), incoming = target === existing ? outgoing : await partition(target);
        await dbPut(target, incoming);
        await install(target, incoming.local, existing, outgoing.local, target !== owner);
        if (owner !== target) { lastAttempt = 0; nextAllowedAttempt = 0; backoff = 0; efficientSync = false; refreshRequired = false; }
        owner = target; incoming.detachedBase = null; await dbPut(target, incoming);
      });
      phase = false; ready = true; renderGuard();
      if (!hasActivated || previousOwner !== owner) window.dispatchEvent(new CustomEvent('cnr:learning-owner-changed', { detail: { owner: owner } }));
      else window.dispatchEvent(new CustomEvent('cnr:learning-imported'));
      hasActivated = true;
      api.recordVisit();
      if (!value) tell('offline', 'Offline. Learning stays in its existing browser workspace until your account connection returns.');
      else if (!value.user) tell('guest', 'Guest progress stays in this browser; signed-in progress syncs across devices.');
      else { tell('syncing', 'Syncing your progress…'); schedule(true); }
    } catch (e) {
      phase = true; ready = false; renderGuard(); tell('error', 'Learning could not switch safely. Your previous data is preserved. Download a backup or free device storage, then retry.'); throw e;
    }
  }
  function captureChange(event) {
    if (event && event.type === 'cnr:learning-updated' && !event.detail.before) return;
    if (applying || !mayWrite()) return;
    var id = owner, ownSnapshot, ancestor;
    try { ownSnapshot = normal(event && event.detail && event.detail.snapshot ? event.detail.snapshot : api.captureSnapshot(false)); ancestor = event && event.detail && event.detail.before ? normal({ ...empty(), ...event.detail.before }) : copy(lastView || ownSnapshot); lastView = copy(ownSnapshot); }
    catch (_) { tell('error', 'Your learning needs recovery before it can be queued safely. Download a copy before leaving.'); return; }
    // Capture this tab's delta synchronously. Reading only disk in the later task
    // loses an already-applied edit when another tab wins a localStorage RMW race.
    localQueue = localQueue.catch(function () {}).then(function () { return locked(async function () {
      var cached = await partition(id), workingHere = marker() === id;
      var latest = workingHere ? normal(disk()) : cached.local;
      var pendingVersion = threeWay(ancestor, ownSnapshot, cached.local);
      var merged = threeWay(ownSnapshot, latest, pendingVersion);
      if (workingHere && signature(merged) !== signature(latest)) {
        localStorage.setItem(TRANSITION, '1'); renderGuard();
        try { latest = normal(disk()); merged = threeWay(ownSnapshot, latest, pendingVersion); await install(id, merged, id, latest, false); }
        finally { if (!await dbGet('recovery')) localStorage.removeItem(TRANSITION); renderGuard(); }
      }
      cached.local = merged; cached.detachedBase = null; cached.pending = signature(merged) !== signature(cached.base); await dbPut(id, cached);
      if (owner === id && marker() === id) lastView = normal(api.captureSnapshot(false));
    }); }).catch(function () { tell('error', 'Learning is kept on this device, but the sync queue could not be updated. Keep this tab open and download a backup.'); });
    if (auth && auth.user) { tell('syncing', 'Saving your progress…'); schedule(false); }
  }
  function commitMutation(before, after) {
    if (!mayWrite()) return Promise.resolve(false);
    var id = owner, ancestor = normal({ ...empty(), ...before }), ownSnapshot = normal({ ...empty(), ...after });
    var operation = localQueue.catch(function () {}).then(function () { return locked(async function () {
      var cached = await partition(id), merged = threeWay(ancestor, ownSnapshot, cached.local);
      var workingHere = marker() === id;
      var oldDisk = workingHere ? normal(disk()) : null;
      cached.local = merged; cached.pending = signature(merged) !== signature(cached.base); cached.detachedBase = oldDisk;
      // The intended edit is durable before the compatibility projection changes.
      await dbPut(id, cached);
      if (workingHere) {
        try { await install(id, merged, id, oldDisk, false); }
        finally { if (!await dbGet('recovery')) localStorage.removeItem(TRANSITION); renderGuard(); }
        cached.detachedBase = null; await dbPut(id, cached);
        if (owner === id) lastView = normal(api.captureSnapshot(false));
      }
      if (auth && auth.user && sessionOwner(auth) === id) { tell('syncing', 'Saving your progress…'); schedule(false); }
      return true;
    }); }).catch(function () { tell('error', 'Your edit is kept for this workspace, but device storage could not finish updating. Keep this page open and download a recovery copy.'); return false; });
    localQueue = operation.then(function () {}); return operation;
  }
  function commitPlayground(beforeDrafts, afterDrafts) {
    var before = api.captureSnapshot(false), after = copy(before); before.playground = beforeDrafts; after.playground = afterDrafts;
    return commitMutation(before, after);
  }
  function active(token, id) { return token === generation && owner === id && auth && auth.user && sessionOwner(auth) === id && marker() === id && !phase; }
  async function request(method, body, token, id, login, revision) {
    if (!active(token, id)) throw new Error('scope_changed');
    controller = new AbortController(); var timeout = setTimeout(function () { controller.abort(); }, 15000);
    var headers = { Accept: 'application/json', 'X-CNR-User': login.user.id };
    if (method === 'GET' && Number.isSafeInteger(revision)) headers['X-CNR-Revision'] = String(revision);
    if (method === 'PUT' || method === 'PATCH') { headers['X-CSRF-Token'] = login.csrfToken; headers['Content-Type'] = 'application/json'; }
    try {
      var response = await fetch('/api/learning', { method: method, headers: headers, credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: controller.signal, ...(body ? { body: JSON.stringify(body) } : {}) });
      var reader = response.body.getReader(), chunks = [], size = 0, decoder = new TextDecoder();
      try { while (true) { var part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 1900000) { await reader.cancel(); throw new Error('invalid_cloud'); } chunks.push(decoder.decode(part.value, { stream: true })); } chunks.push(decoder.decode()); } finally { reader.releaseLock(); }
      var data; try { data = JSON.parse(chunks.join('')); } catch (_) { throw new Error('invalid_cloud'); }
      if (!active(token, id)) throw new Error('scope_changed');
      if (!response.ok) { var error = new Error(data.error || 'sync_failed'); error.status = response.status; throw error; }
      return data;
    } finally { clearTimeout(timeout); controller = null; }
  }
  async function synchronize(forceRead) {
    if (running) return running;
    if (!mayView() || !auth || !auth.user) return; if (Date.now() < nextAllowedAttempt) { schedule(false); return; }
    var token = generation, id = owner, login = copy(auth); lastSyncError = null; lastAttempt = Date.now();
    running = (async function () {
      await localQueue;
      await locked(async function () {
        if (!active(token, id)) return;
        var cached = await partition(id);
        // A known revision lets pending edits go straight to one CAS request.
        // On conflict the next attempt fetches and uses the existing three-way merge.
        var hasChanges = cached.pending || signature(currentSnapshot()) !== signature(cached.base);
        var optimistic = cached.incremental === true && hasChanges && !refreshRequired;
        if (!hasChanges && cached.protocol2 === true && !forceRead && !refreshRequired &&
            Date.now() - (cached.lastReadAt || 0) < REFRESH_INTERVAL) {
          tell('saved', 'Progress saved to your account.');
          schedule(true, REFRESH_INTERVAL - (Date.now() - cached.lastReadAt)); return;
        }
        var remote = optimistic ? { revision: cached.revision, data: cached.base, syncProtocol: 2, incremental: true } :
          await request('GET', null, token, id, login, cached.cloudKnown || cached.revision > 0 ? cached.revision : undefined);
        if (!Number.isSafeInteger(remote.revision) || remote.revision < 0) throw new Error('invalid_cloud');
        if (remote.unchanged === true) {
          if (remote.revision !== cached.revision) throw new Error('invalid_cloud');
          remote.data = cached.base;
        }
        if (!Object.prototype.hasOwnProperty.call(remote, 'data')) throw new Error('invalid_cloud');
        var remoteData; try { remoteData = remote.data === null ? empty() : normal(remote.data); } catch (_) { throw new Error('invalid_cloud'); }
        efficientSync = remote.syncProtocol === 2;
        cached.protocol2 = efficientSync;
        cached.incremental = efficientSync && remote.incremental === true;
        if (!optimistic) { cached.cloudKnown = true; cached.lastReadAt = Date.now(); refreshRequired = false; }
        var current = currentSnapshot(); if (cached.detachedBase) current = threeWay(cached.detachedBase, current, cached.local); var merged = threeWay(cached.base, current, remoteData);
        var needsInstall = signature(normal(disk())) !== signature(merged);
        if (needsInstall) { localStorage.setItem(TRANSITION, '1'); renderGuard(); current = currentSnapshot(); if (cached.detachedBase) current = threeWay(cached.detachedBase, current, cached.local); merged = threeWay(cached.base, current, remoteData); }
        try {
          if (!active(token, id)) return;
          var before = normal(disk());
          cached.local = merged; cached.base = remoteData; cached.revision = remote.revision; cached.pending = signature(merged) !== signature(remoteData); cached.detachedBase = null;
          if (needsInstall) { await install(id, merged, id, before, false); window.dispatchEvent(new CustomEvent('cnr:learning-imported')); }
          await dbPut(id, cached);
        } finally {
          if (needsInstall) { if (!await dbGet('recovery')) localStorage.removeItem(TRANSITION); renderGuard(); }
        }
        var afterInstall = normal(disk());
        if (signature(afterInstall) !== signature(merged)) { merged = afterInstall; cached.local = afterInstall; cached.pending = signature(afterInstall) !== signature(cached.base); await dbPut(id, cached); }
        if (!cached.pending) { backoff = 0; nextAllowedAttempt = 0; tell('saved', 'Progress is up to date.'); return; }
        var raw = JSON.stringify(merged);
        if (new Blob([raw]).size > CLOUD_LIMIT) { var tooLarge = new Error('snapshot_too_large'); tooLarge.status = 413; throw tooLarge; }
        var sent = copy(merged), incremental = remote.syncProtocol === 2 && remote.incremental === true;
        var body = incremental ? { revision: remote.revision, exportedAt: sent.exportedAt, changes: changes(remoteData, sent) } : { revision: remote.revision, data: sent };
        var result = await request(incremental ? 'PATCH' : 'PUT', body, token, id, login);
        if (!Number.isSafeInteger(result.revision) || result.revision < remote.revision) throw new Error('invalid_cloud');
        if (!active(token, id)) return;
        // Only acknowledge the payload actually sent; edits during PUT remain pending.
        var latest = normal(disk()); cached = await partition(id); cached.base = sent; cached.revision = result.revision; cached.local = latest; cached.pending = signature(latest) !== signature(sent); cached.detachedBase = null;
        cached.incremental = result.syncProtocol === 2 && result.incremental === true; cached.lastReadAt = Date.now();
        await dbPut(id, cached); backoff = 0; nextAllowedAttempt = 0;
        tell(cached.pending ? 'syncing' : 'saved', cached.pending ? 'Saving your latest changes…' : 'Progress saved to your account.');
        if (cached.pending) schedule(false);
      });
    })().catch(function (e) {
      lastSyncError = e;
      if (token !== generation || e.message === 'scope_changed' || e.name === 'AbortError') return;
      if (e.status === 409 && e.message !== 'account_changed') { refreshRequired = true; tell('syncing', 'Combining changes from another device…'); schedule(false); }
      else if (e.status === 401 || e.message === 'account_changed' || e.status === 403) { tell('offline', 'Reconnect your account to continue syncing. Your changes are kept on this device.'); setTimeout(function () { if (window.CNRAuth) window.CNRAuth.refresh().catch(function () {}); }, 0); }
      else if (e.status === 413) tell('error', 'This learning collection is too large to sync. Your changes are kept here; download a backup and reduce large playground drafts.');
      else if (e.status === 429) { backoff = Math.min(backoff ? backoff * 2 : 30000, 300000); nextAllowedAttempt = Date.now() + backoff; tell('offline', 'Sync will retry shortly. Your changes are kept on this device.'); schedule(false, backoff); }
      else if (e.message === 'invalid_cloud' || /unsupported|invalid|unsafe|too many|too long/i.test(e.message)) tell('error', 'Saved account learning could not be read safely. Nothing was overwritten; your browser copy is preserved.');
      else { backoff = Math.min(backoff ? backoff * 2 : 10000, 300000); nextAllowedAttempt = Date.now() + backoff; tell('offline', 'Offline or storage unavailable. Your changes are kept here and sync will retry.'); schedule(false, backoff); }
    }).finally(function () { running = null; if (token !== generation && mayWrite() && auth && auth.user) schedule(true); });
    return running;
  }
  function schedule(immediate, delay) {
    clearTimeout(timer);
    var wait = Math.max(delay || 0, immediate ? 0 : efficientSync ? 10000 : 1200, (efficientSync ? 30000 : 6000) - (Date.now() - lastAttempt), nextAllowedAttempt - Date.now());
    timer = setTimeout(function () { timer = null; synchronize(); }, wait);
  }
  window.addEventListener('cnr:learning-updated', captureChange);
  window.addEventListener('cnr:playground-saved', function (event) {
    if (applying || !mayWrite()) return;
    var own = api.captureSnapshot(false), before = copy(own);
    if (event.detail && event.detail.before && event.detail.after) { before.playground = event.detail.before; own.playground = event.detail.after; }
    else { before = copy(lastView || own); own.playground = disk().playground; }
    applying = true; api.refreshState(); applying = false;
    captureChange({ type: 'cnr:learning-updated', detail: { before: before, snapshot: own } });
  });
  window.addEventListener('cnr:auth-changing', function (event) {
    var previous = { phase: phase, ready: ready }, login = event.detail && event.detail.session;
    draining = true; cancel(); renderGuard();
    var flushing = (async function () {
      await bootPromise; await localQueue; if (running) await running;
      await locked(async function () { if (owner) await flushOwner(owner, true); });
      if (login && login.user) {
        if (sessionOwner(login) !== owner) { var mismatch = new Error('The account changed before progress could be saved.'); mismatch.code = 'account_changed'; throw mismatch; }
        auth = login;
        tell('syncing', 'Saving your latest progress before leaving this account…');
        await synchronize(); await localQueue;
        var saved = await partition(owner);
        if (saved.pending || signature(currentSnapshot()) !== signature(saved.base)) {
          var failed = new Error('Latest progress could not be synced. You are still signed in, and your changes remain on this device. Reconnect or reduce large drafts, then retry.');
          failed.code = lastSyncError && (lastSyncError.status === 401 || lastSyncError.status === 403 || lastSyncError.message === 'account_changed') ? 'account_changed' : 'learning_transition_failed';
          throw failed;
        }
      }
      phase = true; ready = false; draining = false; renderGuard();
    })().catch(function (e) {
      draining = false; phase = e.code === 'account_changed' ? true : previous.phase; ready = e.code === 'account_changed' ? false : previous.ready; renderGuard();
      tell('offline', e.message || 'Learning could not be saved safely. Your account has not been left.'); throw e;
    });
    if (event.detail && event.detail.waitUntil) event.detail.waitUntil(flushing); else flushing.catch(function () {});
  });
  window.addEventListener('cnr:auth-changed', function (event) {
    authObserved = true;
    var task = transition(event.detail.session);
    if (event.detail.waitUntil) event.detail.waitUntil(task); else task.catch(function () {});
  });
  window.addEventListener('storage', function (event) {
    if (event.key === OWNER && marker() !== owner) {
      phase = true; ready = false; cancel(); renderGuard();
      if (window.CNRAuth) window.CNRAuth.refresh({ force: true }).then(function (s) { if (!ready) return transition(s); }).catch(function () {});
    } else if (event.key === TRANSITION) {
      renderGuard();
      if (!localStorage.getItem(TRANSITION) && mayWrite()) { applying = true; api.refreshState(); applying = false; window.dispatchEvent(new CustomEvent('cnr:learning-imported')); }
    } else if (['cnr_progress', 'cnr_learning_v1', 'cnr_playground_v1'].indexOf(event.key) >= 0 && mayWrite()) { applying = true; api.refreshState(); applying = false; }
  });
  window.addEventListener('online', function () { if (auth && auth.user) schedule(true); });
  window.addEventListener('focus', function () { if (auth && auth.user) schedule(true); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && auth && auth.user) schedule(true); });
  setInterval(function () { if (document.visibilityState === 'visible' && auth && auth.user && mayWrite()) schedule(true); }, REFRESH_INTERVAL);
  document.querySelectorAll('[data-learning-sync-retry]').forEach(function (b) { b.addEventListener('click', function () { if (window.CNRAuth) window.CNRAuth.refresh({ force: true }).then(function (s) { return transition(s); }).catch(function () { tell('offline', 'Account connection unavailable. Your existing browser workspace is preserved.'); }); }); });
  document.querySelectorAll('[data-learning-sync-export]').forEach(function (b) { b.addEventListener('click', function () { try { var data = api.captureSnapshot(true), url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' })), a = document.createElement('a'); a.href = url; a.download = 'learning-recovery.json'; a.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); } catch (_) { tell('error', 'This data needs recovery before it can be exported. Existing device copies have not been replaced.'); } }); });
  window.CNRLearningSync = Object.freeze({ getStatus: function () { return copy(status); }, commitMutation: commitMutation, commitPlayground: commitPlayground, flush: async function () { await localQueue; if (running) await running; return synchronize(true); }, threeWay: threeWay, getOwner: function () { return owner; } });
  bootPromise.then(function () { if (!authObserved && window.CNRAuth) return window.CNRAuth.ready().then(function (value) { if (!authObserved) return transition(value); }); }).catch(function () {});
  bootPromise.catch(function () { tell('error', 'Device storage is unavailable. Account learning is paused to protect existing data.'); });
})();
