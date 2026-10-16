/* Guest learning state. cnr_progress.v1 remains the reading-only roadmap contract.
 * No HTML, JavaScript, URLs, or settings from a backup are executed. */
(function () {
  'use strict';
  var KEYS = { progress: 'cnr_progress', learning: 'cnr_learning_v1', playground: 'cnr_playground_v1' };
  var JOURNAL = 'cnr_learning_import_journal_v1';
  var MAX_STORE = 2 * 1024 * 1024, MAX_BACKUP = 6 * 1024 * 1024, MAX_NOTE = 20000;
  var state, catalog = null, pending = null, volatile = false, blocked = false, notice = '';
  var volatileKeys = Object.create(null);
  var importSequence = 0;
  var catalogPromise = null, noteDirty = false, noteBaseline = '', initialised = false;
  var own = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };
  var map = function () { return Object.create(null); };
  var fail = function (message) { throw new Error(message); };
  var record = function (value) { return value && typeof value === 'object' && !Array.isArray(value); };
  var bytes = function (text) { return new Blob([text]).size; };
  var clone = function (value) { return parse(JSON.stringify(value)); };
  function parse(text) {
    return JSON.parse(text, function (key, value) {
      if (key === '__proto__' || key === 'prototype' || key === 'constructor') fail('This file contains an unsafe object key.');
      return value;
    });
  }
  function object(value, label) { if (!record(value)) fail(label + ' must be an object.'); return value; }
  function text(value, max, label, fallback) {
    if (value === undefined && fallback !== undefined) return fallback;
    if (typeof value !== 'string' || value.length > max || /\u0000/.test(value)) fail(label + ' is invalid or too long.');
    return value;
  }
  function time(value, label, optional) {
    if (value === undefined && optional) return 0;
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > Date.now() + 86400000) fail(label + ' has an invalid timestamp.');
    return value;
  }
  function docURL(value, allowCategory) {
    if (typeof value !== 'string' || value.length > 600 || !/^\/docs\/[A-Za-z0-9_+./-]+\/?$/.test(value) || value.indexOf('//') >= 0) return null;
    if (value.split('/').some(function (part) { return part === '.' || part === '..'; }) || (!allowCategory && value.indexOf('/docs/category/') === 0)) return null;
    var normal = value.replace(/\/+$/, '') + '/';
    return normal.length <= 600 ? normal : null;
  }
  function path(value) { return docURL(value, false); }
  function courseID(value) {
    return typeof value === 'string' && value.length <= 160 && /^[a-z0-9][a-z0-9_-]*(\/[a-z0-9][a-z0-9_-]*)+$/.test(value) ? value : null;
  }
  function keys(value, maximum, label) {
    object(value, label); var names = Object.keys(value);
    if (names.length > maximum) fail(label + ' contains too many entries.');
    names.forEach(function (k) { if (k === '__proto__' || k === 'constructor' || k === 'prototype') fail('Unsafe object key.'); });
    return names;
  }
  function empty() { return { progress: { v: 1, done: map(), tuts: map() }, learning: { v: 1, lessons: map() }, playground: { version: 1, drafts: map() } }; }
  function checkProgress(value) {
    object(value, 'Reading progress'); if (value.v !== 1) fail('Unsupported reading-progress version.');
    var out = empty().progress;
    keys(value.done, 20000, 'Read marks').forEach(function (key) {
      var p = path(key); if (!p) fail('A read mark has an invalid lesson path.');
      var t = value.done[key] === true ? 1 : time(value.done[key], 'Read mark');
      if (t) out.done[p] = Math.max(out.done[p] || 0, t);
    });
    keys(value.tuts, 1000, 'Courses').forEach(function (key) {
      if (!courseID(key)) fail('Invalid course identifier.');
      var item = object(value.tuts[key], 'Course'), clean = {};
      clean.label = text(item.label, 240, 'Course title', key);
      clean.url = item.url === undefined ? '/docs/' + key + '/' : docURL(item.url, true);
      if (!clean.url) fail('Invalid course URL.');
      ['total', 'done'].forEach(function (name) {
        var n = item[name] === undefined ? 0 : item[name];
        if (!Number.isSafeInteger(n) || n < 0 || n > 20000) fail('Invalid reading count.');
        clean[name] = n;
      });
      clean.t = time(item.t, 'Last visit', true);
      if (item.last !== undefined) {
        object(item.last, 'Last lesson'); var p = path(item.last.path);
        if (!p) fail('Invalid last-lesson URL.');
        clean.last = { path: p, title: text(item.last.title, 300, 'Lesson title', p) };
      }
      out.tuts[key] = clean;
    });
    return out;
  }
  function checkLearning(value) {
    object(value, 'Learning data'); if (value.v !== 1) fail('Unsupported learning-data version.');
    var out = empty().learning;
    keys(value.lessons, 5000, 'Lessons').forEach(function (key) {
      var p = path(key); if (!p) fail('Invalid lesson path.');
      var item = object(value.lessons[key], 'Lesson'), c = item.course || '';
      if (c && !courseID(c)) fail('Invalid lesson course.');
      var clean = { title: text(item.title, 300, 'Lesson title', p), course: c,
        visitedAt: time(item.visitedAt, 'Visit', true), updatedAt: time(item.updatedAt, 'Lesson update', true), practice: map() };
      if (item.bookmark !== undefined) {
        object(item.bookmark, 'Bookmark'); if (typeof item.bookmark.value !== 'boolean') fail('Invalid bookmark value.');
        clean.bookmark = { value: item.bookmark.value, updatedAt: time(item.bookmark.updatedAt, 'Bookmark') };
      }
      if (item.note !== undefined) {
        object(item.note, 'Note'); clean.note = { text: text(item.note.text, MAX_NOTE, 'Note'), updatedAt: time(item.note.updatedAt, 'Note') };
      }
      keys(item.practice || {}, 100, 'Exercise records').forEach(function (id) {
        if (!/^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,159}$/.test(id)) fail('Invalid exercise identifier.');
        var evidence = object(item.practice[id], 'Exercise record');
        if (['practiced', 'passed', 'not-passed'].indexOf(evidence.lastResult) < 0) fail('Invalid exercise result.');
        var attempted = time(evidence.attemptedAt, 'Practice'), passed = time(evidence.passedAt, 'Passed check', true);
        if (passed > attempted || (evidence.lastResult === 'passed' && !passed)) fail('Inconsistent exercise evidence.');
        clean.practice[id] = { attemptedAt: attempted, passedAt: passed, lastResult: evidence.lastResult };
      });
      out.lessons[p] = clean;
    });
    return out;
  }
  function checkPlayground(value) {
    object(value, 'Playground data'); if (value.version !== 1) fail('Unsupported playground-data version.');
    var out = empty().playground;
    keys(value.drafts, 100, 'Playground drafts').forEach(function (key) {
      if (!/^[A-Za-z0-9][A-Za-z0-9:/._-]{0,599}$/.test(key)) fail('Invalid draft identifier.');
      var d = object(value.drafts[key], 'Draft'), p = d.path === '' ? '' : path(d.path), c = d.course || '';
      if (p === null || (c && !courseID(c))) fail('Invalid draft lesson or course.');
      var stamp = Date.parse(d.updatedAt);
      if (typeof d.updatedAt !== 'string' || !Number.isFinite(stamp) || stamp < 0 || stamp > Date.now() + 86400000) fail('Invalid draft timestamp.');
      out.drafts[key] = { html: text(d.html, 100000, 'Draft HTML'), css: text(d.css, 100000, 'Draft CSS'), js: text(d.js, 100000, 'Draft JavaScript'),
        title: text(d.title, 300, 'Draft title', 'Untitled draft'), path: p, course: c,
        exerciseId: text(d.exerciseId, 160, 'Exercise ID', ''), updatedAt: new Date(stamp).toISOString() };
    });
    return out;
  }
  var validators = { progress: checkProgress, learning: checkLearning, playground: checkPlayground };
  function checkSize(value, label) { if (bytes(JSON.stringify(value)) > MAX_STORE) fail(label + ' exceeds the 2 MB storage limit.'); return value; }
  function recoverJournal() {
    var raw = localStorage.getItem(JOURNAL); if (!raw) return;
    var j = parse(raw); object(j, 'Import recovery'); if (j.v !== 1) fail('A pending backup merge needs recovery.');
    var originals = object(j.originals, 'Import recovery');
    Object.keys(KEYS).forEach(function (name) {
      var saved = originals[name]; if (saved !== null && typeof saved !== 'string') fail('Invalid recovery data.');
      if (saved !== null) checkSize(validators[name](parse(saved)), 'Recovery data');
    });
    // Free only the three known data keys before restoring their validated originals.
    Object.keys(KEYS).forEach(function (name) { localStorage.removeItem(KEYS[name]); });
    Object.keys(KEYS).forEach(function (name) { if (originals[name] !== null) localStorage.setItem(KEYS[name], originals[name]); });
    localStorage.removeItem(JOURNAL);
    notice = 'An interrupted backup merge was rolled back. Your earlier data has been restored.';
  }
  function readAll() {
    var out = empty();
    Object.keys(KEYS).forEach(function (name) {
      var raw = localStorage.getItem(KEYS[name]);
      if (raw !== null) { if (bytes(raw) > MAX_STORE) fail('Saved ' + name + ' data exceeds the supported size.'); out[name] = validators[name](parse(raw)); }
    });
    return out;
  }
  function serialise(value) { return JSON.stringify(value); }
  function storageError(error, corrupt) {
    volatile = true;
    if (corrupt) blocked = true;
    notice = corrupt ? 'Saved learning data could not be read safely. It has not been replaced. Keep this tab open and recover your existing backup before making changes.' :
      'Browser storage is unavailable or full. These changes are only in this tab. Download a backup before leaving; changes are not saved across visits.';
    renderNotices();
  }
  function fresh() {
    if (volatile && !blocked) {
      try { var pendingState = empty(); Object.keys(volatileKeys).forEach(function (name) { pendingState[name] = state[name]; }); return merge(readAll(), pendingState, 'Recovered note from this tab').state; }
      catch (error) { notice = 'Unsaved changes could not be combined with the latest browser data: ' + error.message + ' Export this tab before reloading. Nothing was overwritten.'; renderNotices(); return null; }
    }
    if (blocked) return clone(state);
    try { return readAll(); } catch (e) { storageError(e, !(e && e.name === 'SecurityError')); return clone(state); }
  }
  function persist(next, names) {
    names = Array.from(new Set(names.concat(Object.keys(volatileKeys))));
    try {
      names.forEach(function (name) { next[name] = checkSize(validators[name](next[name]), name); });
    } catch (error) {
      notice = 'This change could not be saved: ' + error.message + ' Existing saved data is unchanged. Keep any unsaved note in the editor until you can save it.';
      changed(); return false;
    }
    if (blocked) { state = next; storageError(null, true); return false; }
    var old = {}, written = [];
    try {
      if (localStorage.getItem(JOURNAL)) fail('A backup merge is in progress. Please reload after it finishes.');
      names.forEach(function (name) { old[name] = localStorage.getItem(KEYS[name]); });
      names.forEach(function (name) { localStorage.setItem(KEYS[name], serialise(next[name])); written.push(name); });
      state = next; volatile = false; volatileKeys = map(); notice = ''; changed(); return true;
    } catch (e) {
      try {
        written.forEach(function (name) { localStorage.removeItem(KEYS[name]); });
        written.forEach(function (name) { if (old[name] !== null) localStorage.setItem(KEYS[name], old[name]); });
      } catch (ignored) { blocked = true; }
      names.forEach(function (name) { volatileKeys[name] = true; });
      state = next; storageError(e, blocked); changed(); return false;
    }
  }
  function metadata(p) {
    var current = window.CNR_PAGE || {};
    if (path(current.path) === p) return { title: typeof current.title === 'string' ? current.title.slice(0, 300) : p, course: courseID(current.course) || '' };
    if (catalog && catalog.byPath[p]) return catalog.byPath[p];
    var stored = state.learning.lessons[p]; return stored ? { title: stored.title, course: stored.course } : { title: p, course: '' };
  }
  function ensureLesson(target, p, meta) {
    if (!target.learning.lessons[p]) target.learning.lessons[p] = { title: meta.title, course: meta.course, visitedAt: 0, updatedAt: 0, practice: map() };
    return target.learning.lessons[p];
  }
  function updateCounts(target) {
    Object.keys(target.progress.tuts).forEach(function (id) {
      var t = target.progress.tuts[id], course = catalog && catalog.byID[id];
      if (course) { t.total = course.lessons.length; t.done = course.lessons.filter(function (lesson) { return target.progress.done[lesson.path]; }).length; }
      else t.done = Math.min(t.total, Object.keys(target.progress.done).filter(function (p) { return p.indexOf('/docs/' + id + '/') === 0; }).length);
    });
  }
  function setRead(p, on) {
    p = path(p); if (!p) return false;
    var next = fresh(); if (!next) return false; if (on) next.progress.done[p] = Date.now(); else delete next.progress.done[p];
    updateCounts(next); return persist(next, ['progress']);
  }
  function bookmark(p, on) {
    p = path(p); if (!p) return false;
    var next = fresh(); if (!next) return false; var item = ensureLesson(next, p, metadata(p));
    item.bookmark = { value: !!on, updatedAt: Date.now() }; item.updatedAt = Date.now();
    return persist(next, ['learning']);
  }
  function saveNote(p, value) {
    p = path(p); if (!p) return false; text(value, MAX_NOTE, 'Note');
    var next = fresh(); if (!next) return false; var item = ensureLesson(next, p, metadata(p));
    item.note = { text: value, updatedAt: Date.now() }; item.updatedAt = Date.now();
    return persist(next, ['learning']);
  }
  function practice(detail) {
    if (!record(detail)) return;
    var p = path(detail.path); if (!p) return;
    var id = detail.exerciseId || 'playground';
    if (typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,159}$/.test(id) || ['constructor', 'prototype', '__proto__'].indexOf(id) >= 0) return;
    var meta = metadata(p); if (meta.title === p && typeof detail.title === 'string') meta.title = detail.title.slice(0, 300);
    if (!meta.course) meta.course = courseID(detail.course) || '';
    var next = fresh(); if (!next) return false; var item = ensureLesson(next, p, meta), old = item.practice[id], now = Date.now();
    item.practice[id] = { attemptedAt: now, passedAt: detail.passed === true ? now : (old && old.passedAt || 0),
      lastResult: detail.passed === true ? 'passed' : (detail.passed === false ? 'not-passed' : 'practiced') };
    item.updatedAt = now; persist(next, ['learning']);
  }
  function merge(base, incoming, noteLabel) {
    var out = clone(base), summary = { read: Object.keys(incoming.progress.done).length, bookmarks: 0, notes: 0, noteConflicts: 0, drafts: Object.keys(incoming.playground.drafts).length, draftCopies: 0, practice: 0 };
    Object.keys(incoming.progress.done).forEach(function (p) { out.progress.done[p] = Math.max(out.progress.done[p] || 0, incoming.progress.done[p]); });
    Object.keys(incoming.progress.tuts).forEach(function (id) {
      var a = out.progress.tuts[id], b = incoming.progress.tuts[id]; if (!a || b.t > a.t) out.progress.tuts[id] = clone(b);
    });
    Object.keys(incoming.learning.lessons).forEach(function (p) {
      var b = incoming.learning.lessons[p], a = ensureLesson(out, p, b);
      if (b.updatedAt > a.updatedAt) { a.title = b.title; a.course = b.course; }
      a.visitedAt = Math.max(a.visitedAt, b.visitedAt); a.updatedAt = Math.max(a.updatedAt, b.updatedAt);
      if (b.bookmark) { if (b.bookmark.value) summary.bookmarks++; if (!a.bookmark || b.bookmark.updatedAt > a.bookmark.updatedAt) a.bookmark = clone(b.bookmark); }
      if (b.note && b.note.text) {
        summary.notes++;
        if (!a.note || !a.note.text) a.note = clone(b.note);
        else if (a.note.text !== b.note.text && a.note.text.indexOf(b.note.text) < 0) {
          summary.noteConflicts++;
          a.note = { text: a.note.text + '\n\n--- ' + (noteLabel || 'Imported note') + ' (' + new Date(b.note.updatedAt).toISOString().slice(0, 10) + ') ---\n' + b.note.text, updatedAt: Date.now() };
          text(a.note.text, MAX_NOTE, 'Merged note');
        }
      }
      Object.keys(b.practice).forEach(function (id) {
        summary.practice++; var previous = a.practice[id], added = b.practice[id];
        if (!previous) a.practice[id] = clone(added);
        else a.practice[id] = { attemptedAt: Math.max(previous.attemptedAt, added.attemptedAt), passedAt: Math.max(previous.passedAt, added.passedAt), lastResult: added.attemptedAt > previous.attemptedAt ? added.lastResult : previous.lastResult };
      });
    });
    Object.keys(incoming.playground.drafts).forEach(function (key) {
      var b = incoming.playground.drafts[key], a = out.playground.drafts[key];
      if (!a) out.playground.drafts[key] = clone(b);
      else if (a.html !== b.html || a.css !== b.css || a.js !== b.js) {
        // Preserve both source versions. Re-importing identical source adds no further copy.
        var duplicate = Object.keys(out.playground.drafts).some(function (k) { var d = out.playground.drafts[k]; return d.html === b.html && d.css === b.css && d.js === b.js && d.path === b.path; });
        if (!duplicate) {
          var count = 1, copyKey = 'workspace:import-' + Date.parse(b.updatedAt) + '-' + count;
          while (own(out.playground.drafts, copyKey)) copyKey = 'workspace:import-' + Date.parse(b.updatedAt) + '-' + (++count);
          out.playground.drafts[copyKey] = clone(b); summary.draftCopies++;
        }
      }
    });
    updateCounts(out);
    Object.keys(KEYS).forEach(function (name) { out[name] = checkSize(validators[name](out[name]), name); });
    return { state: out, summary: summary };
  }
  // Account snapshots must not silently drop fields from an unsupported schema.
  function checkBackupFields(backup) {
    function only(value, names, label) {
      object(value, label); Object.keys(value).forEach(function (key) { if (names.indexOf(key) < 0) fail(label + ' contains an unsupported field.'); });
    }
    only(backup, ['format', 'version', 'exportedAt', 'progress', 'learning', 'playground'], 'Backup');
    only(backup.progress, ['v', 'done', 'tuts'], 'Reading progress');
    keys(backup.progress.tuts, 1000, 'Courses').forEach(function (id) {
      var item = backup.progress.tuts[id]; only(item, ['label', 'url', 'total', 'done', 'last', 't'], 'Course');
      if (item.last !== undefined) only(item.last, ['path', 'title'], 'Last lesson');
    });
    only(backup.learning, ['v', 'lessons'], 'Learning data');
    keys(backup.learning.lessons, 5000, 'Lessons').forEach(function (p) {
      var item = backup.learning.lessons[p]; only(item, ['title', 'course', 'visitedAt', 'updatedAt', 'bookmark', 'note', 'practice'], 'Lesson');
      if (item.bookmark !== undefined) only(item.bookmark, ['value', 'updatedAt'], 'Bookmark');
      if (item.note !== undefined) only(item.note, ['text', 'updatedAt'], 'Note');
      keys(item.practice || {}, 100, 'Exercise records').forEach(function (id) { only(item.practice[id], ['attemptedAt', 'passedAt', 'lastResult'], 'Exercise record'); });
    });
    only(backup.playground, ['version', 'drafts'], 'Playground data');
    keys(backup.playground.drafts, 100, 'Playground drafts').forEach(function (key) { only(backup.playground.drafts[key], ['html', 'css', 'js', 'title', 'path', 'course', 'exerciseId', 'updatedAt'], 'Draft'); });
  }
  function validateBackup(raw, strict) {
    if (typeof raw !== 'string' || bytes(raw) > MAX_BACKUP) fail('Choose a JSON backup no larger than 6 MB.');
    var backup = parse(raw); object(backup, 'Backup');
    if (strict) checkBackupFields(backup);
    if (backup.format !== 'cnr-learning-backup' || backup.version !== 1) fail('This is not a supported Compile N Run learning backup.');
    if (!Number.isFinite(Date.parse(backup.exportedAt))) fail('The backup date is invalid.');
    var clean = empty(); Object.keys(KEYS).forEach(function (name) { clean[name] = checkSize(validators[name](backup[name]), name); });
    return clean;
  }
  function prepareImport(raw) {
    pending = null;
    if (volatile || blocked) fail('Your browser has unsaved or unreadable data. Export it before importing, then retry in a tab with working storage.');
    var incoming = validateBackup(raw), current = readAll(), merged = merge(current, incoming);
    pending = { incoming: incoming, base: serialise(current), summary: merged.summary, token: String(++importSequence) };
    var summary = clone(merged.summary); summary.previewToken = pending.token; return summary;
  }
  function applyImport(expectedToken) {
    if (!pending) fail('Preview a backup before merging it.');
    if (expectedToken !== undefined && expectedToken !== pending.token) fail('A different backup has been previewed. Preview this backup again before merging it.');
    if (volatile || blocked) fail('Browser storage is not ready for a backup merge.');
    var before = readAll();
    if (serialise(before) !== pending.base) { pending = null; fail('Your saved data changed since the preview. Choose the backup again to preview the updated merge.'); }
    var merged = merge(before, pending.incoming).state, originals = {}, journalWritten = false;
    Object.keys(KEYS).forEach(function (name) { originals[name] = localStorage.getItem(KEYS[name]); });
    try {
      if (localStorage.getItem(JOURNAL)) fail('Another backup merge is in progress.');
      localStorage.setItem(JOURNAL, serialise({ v: 1, originals: originals })); journalWritten = true;
      Object.keys(KEYS).forEach(function (name) { localStorage.setItem(KEYS[name], serialise(merged[name])); });
      localStorage.removeItem(JOURNAL);
    } catch (error) {
      // The journal is written before any user data changes. Restore on any partial failure.
      try { if (journalWritten) recoverJournal(); } catch (recoveryError) { blocked = true; notice = 'The backup merge was interrupted. Your original data is retained in a recovery record. Free browser space and reload to restore it.'; }
      state = before; pending = null; renderNotices();
      fail('The backup was not merged. Existing data was preserved' + (blocked ? ' in the recovery record.' : '. Browser storage may be full or unavailable.'));
    }
    state = merged; pending = null; notice = ''; changed();
    window.dispatchEvent(new CustomEvent('cnr:learning-imported'));
    return true;
  }
  function exportBackup() {
    if (blocked) fail('Existing data needs recovery before a complete backup can be exported.');
    if (!volatile) state = readAll();
    else { var combined = fresh(); if (combined) state = combined; }
    var result = serialise({ format: 'cnr-learning-backup', version: 1, exportedAt: new Date().toISOString(), progress: state.progress, learning: state.learning, playground: state.playground });
    if (bytes(result) > MAX_BACKUP) fail('This backup exceeds the 6 MB export limit.');
    return result;
  }
  /* Rendering uses DOM nodes and textContent exclusively, including imported notes. */
  function el(tag, value, className) {
    var node = document.createElement(tag); if (value !== undefined && value !== null) node.textContent = value; if (className) node.className = className; return node;
  }
  function link(label, href, className) {
    var safe = docURL(href, true) || (['/learn/', '/roadmap/', '/playground/'].indexOf(href) >= 0 ? href : null);
    if (!safe) return el('span', label, className);
    var a = el('a', label, className); a.href = safe; return a;
  }
  function button(label, handler, className) {
    var b = el('button', label, className || 'cnr-learning__button'); b.type = 'button'; b.addEventListener('click', handler); return b;
  }
  function date(value) { return value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''; }
  function lessonStatus(p) {
    var item = state.learning.lessons[p], records = item ? Object.values(item.practice) : [];
    return { read: !!state.progress.done[p], practiced: records.some(function (r) { return !!r.attemptedAt; }), passed: records.some(function (r) { return !!r.passedAt; }) };
  }
  function badges(p) {
    var status = lessonStatus(p), box = el('div', null, 'cnr-learning__badges');
    [['Read', status.read], ['Practiced', status.practiced], ['Check passed', status.passed]].forEach(function (pair) {
      box.appendChild(el('span', (pair[1] ? '✓ ' : '○ ') + pair[0], 'cnr-learning__badge' + (pair[1] ? ' is-recorded' : '')));
    });
    return box;
  }
  var sidebar = document.querySelector('[data-doc-sidebar][data-tut]');
  var currentPage = (function () {
    var raw = window.CNR_PAGE || {}, p = path(raw.path || location.pathname);
    if (!p) return null;
    return { path: p, title: typeof raw.title === 'string' ? raw.title.slice(0, 300) : document.title.replace(/\s*\|\s*Compile N Run\s*$/, '').slice(0, 300),
      course: courseID(raw.course) || (sidebar && courseID(sidebar.getAttribute('data-tut'))) || '',
      courseLabel: typeof raw.courseLabel === 'string' ? raw.courseLabel.slice(0, 240) : (sidebar && sidebar.getAttribute('data-tut-label')) || '',
      courseUrl: docURL(raw.courseUrl, true) || (sidebar && docURL(sidebar.getAttribute('data-tut-url'), true)) || '' };
  })();
  function sidebarLessons(scope) {
    var seen = map(), out = [];
    if (scope) scope.querySelectorAll('a.menu__link[href]').forEach(function (a) {
      var p = path(a.getAttribute('href')); if (p && !seen[p]) { seen[p] = true; out.push({ path: p, title: a.textContent.replace(/✓/g, '').trim().slice(0, 300) }); }
    });
    return out;
  }
  function courseLessons(id) {
    if (catalog && catalog.byID[id]) return catalog.byID[id].lessons;
    return sidebar && sidebar.getAttribute('data-tut') === id ? sidebarLessons(sidebar.querySelector('.theme-doc-sidebar-menu')) : [];
  }
  function visit() {
    if (!currentPage || !document.querySelector('[data-learning-tools], [data-mark-done]')) return;
    var next = fresh(); if (!next) return; var item = ensureLesson(next, currentPage.path, currentPage), now = Date.now();
    item.title = currentPage.title; item.course = currentPage.course; item.visitedAt = now;
    if (currentPage.course) {
      var lessons = courseLessons(currentPage.course), t = next.progress.tuts[currentPage.course] || {};
      t.label = currentPage.courseLabel || t.label || currentPage.course;
      t.url = currentPage.courseUrl || t.url || '/docs/' + currentPage.course + '/';
      t.total = lessons.length || t.total || 0; t.done = lessons.length ? lessons.filter(function (l) { return next.progress.done[l.path]; }).length : t.done || 0;
      t.last = { path: currentPage.path, title: currentPage.title }; t.t = now;
      next.progress.tuts[currentPage.course] = t;
    }
    persist(next, ['progress', 'learning']);
  }
  function markLink(a, read) {
    if (!a) return; var existing = a.querySelector(':scope > .cnr-check');
    if (read && !existing) { existing = el('span', '✓', 'cnr-check'); existing.setAttribute('aria-label', 'Read'); existing.title = 'Read'; a.appendChild(existing); }
    if (!read && existing) existing.remove();
  }
  function renderSidebar() {
    document.querySelectorAll('.theme-doc-sidebar-menu').forEach(function (menu) {
      menu.querySelectorAll('.theme-doc-sidebar-item-link > a.menu__link[href]').forEach(function (a) { markLink(a, !!state.progress.done[path(a.getAttribute('href'))]); });
      menu.querySelectorAll('.theme-doc-sidebar-item-category').forEach(function (li) {
        var a = li.querySelector(':scope > .menu__list-item-collapsible > .menu__link'), sub = li.querySelector(':scope > .menu__list'), lessons = sidebarLessons(sub);
        var p = a && path(a.getAttribute('href')); if (p && !lessons.some(function (l) { return l.path === p; })) lessons.push({ path: p });
        markLink(a, lessons.length > 0 && lessons.every(function (l) { return state.progress.done[l.path]; }));
      });
    });
    if (sidebar) {
      var lessons = sidebarLessons(sidebar.querySelector('.theme-doc-sidebar-menu'));
      var n = lessons.filter(function (l) { return state.progress.done[l.path]; }).length;
      var box = sidebar.querySelector('[data-learning-sidebar]');
      if (!box) { box = el('div', null, 'cnr-progress'); box.setAttribute('data-learning-sidebar', ''); sidebar.insertBefore(box, sidebar.firstChild); }
      box.replaceChildren(el('p', n + ' of ' + lessons.length + ' pages read'));
      var bar = el('progress'); bar.max = lessons.length || 1; bar.value = n; bar.setAttribute('aria-label', 'Pages read'); box.appendChild(bar); box.appendChild(link('Your learning dashboard', '/learn/'));
      var categories = map();
      sidebar.querySelectorAll('.theme-doc-sidebar-item-category').forEach(function (li) {
        var a = li.querySelector(':scope > .menu__list-item-collapsible > .menu__link'); if (!a) return;
        var url = docURL(a.getAttribute('href'), true), list = sidebarLessons(li.querySelector(':scope > .menu__list')), p = path(a.getAttribute('href'));
        if (p && !list.some(function (l) { return l.path === p; })) list.push({ path: p }); if (url) categories[url] = list;
      });
      document.querySelectorAll('.generatedIndexPage_vN6x a.theme-doc-card-container[href]').forEach(function (a) {
        var url = docURL(a.getAttribute('href'), true), list = categories[url], count = list ? list.filter(function (l) { return state.progress.done[l.path]; }).length : 0;
        a.classList.toggle('cnr-card-read', list ? list.length > 0 && count === list.length : !!state.progress.done[path(url)]);
        var description = a.querySelector('.cardDescription_L2fP'); if (list && description) description.textContent = list.length + ' pages · ' + count + ' read';
      });
    }
  }
  function renderNotices() {
    document.querySelectorAll('[data-learning-notice]').forEach(function (node) { node.textContent = notice; node.hidden = !notice; });
  }
  function renderTools() {
    if (!currentPage) return;
    var p = currentPage.path, item = state.learning.lessons[p], status = lessonStatus(p);
    document.querySelectorAll('[data-mark-done]').forEach(function (b) { b.textContent = status.read ? '✓ Read' : 'Mark as read'; b.setAttribute('aria-pressed', String(status.read)); b.title = status.read ? 'Mark this page as unread' : 'Record that you have read this page'; });
    document.querySelectorAll('[data-learning-tools]').forEach(function (root) {
      root.hidden = false;
      var b = root.querySelector('[data-learning-bookmark]'); if (b) { var on = !!(item && item.bookmark && item.bookmark.value); b.textContent = on ? '✓ Bookmarked' : 'Bookmark'; b.setAttribute('aria-pressed', String(on)); }
      var practiced = root.querySelector('[data-learning-practiced]'); if (practiced) practiced.textContent = status.practiced ? 'Record another practice session' : 'Record practice';
      var states = root.querySelector('[data-learning-states]'); if (states) states.replaceChildren(badges(p));
      var field = root.querySelector('[data-learning-note]'), saved = item && item.note ? item.note.text : '';
      if (field && !noteDirty) { field.value = saved; noteBaseline = saved; }
      var conflict = root.querySelector('[data-learning-note-conflict]'); if (conflict) { conflict.hidden = !(noteDirty && saved !== noteBaseline); conflict.textContent = 'The saved note changed in another tab or backup merge. Your unsaved text is still here. Save it to replace the saved note, or reload the saved version.'; }
      var evidence = root.querySelector('[data-learning-evidence]');
      if (evidence) {
        evidence.replaceChildren();
        if (item) Object.keys(item.practice).sort(function (a, b) { return item.practice[b].attemptedAt - item.practice[a].attemptedAt; }).forEach(function (id) {
          var r = item.practice[id], label = id === 'manual' ? 'Self-reported practice' : id;
          var result = r.lastResult === 'passed' ? 'check passed' : r.lastResult === 'not-passed' ? 'check not passed' : 'practiced; no check result';
          evidence.appendChild(el('li', label + ': ' + result + ' · ' + date(r.attemptedAt) + (r.passedAt && r.lastResult !== 'passed' ? ' · previously passed on ' + date(r.passedAt) : '')));
        });
        if (!evidence.children.length) evidence.appendChild(el('li', 'No practice recorded for this lesson yet.'));
      }
      var nextNode = root.querySelector('[data-learning-next]'), lessons = courseLessons(currentPage.course), index = lessons.findIndex(function (l) { return l.path === p; });
      var next = lessons.slice(index + 1).find(function (l) { return !state.progress.done[l.path]; });
      if (!next) next = lessons.find(function (l) { return l.path !== p && !state.progress.done[l.path]; });
      if (nextNode) { nextNode.replaceChildren(); if (next) nextNode.appendChild(link('Next unread lesson: ' + next.title, next.path)); }
    });
  }
  function recentCourses() {
    return Object.keys(state.progress.tuts).map(function (id) { return { id: id, saved: state.progress.tuts[id], course: catalog && catalog.byID[id] }; })
      .filter(function (entry) { return entry.saved.last && path(entry.saved.last.path); })
      .sort(function (a, b) { return b.saved.t - a.saved.t; });
  }
  function courseCard(entry) {
    var t = entry.saved, c = entry.course, lessons = c ? c.lessons : [], count = lessons.length ? lessons.filter(function (l) { return state.progress.done[l.path]; }).length : t.done;
    var total = lessons.length || t.total, card = el('article', null, 'cnr-learning__card');
    card.appendChild(el('h3', c ? c.label : t.label));
    card.appendChild(link('Continue: ' + t.last.title, t.last.path, 'cnr-learning__primary-link'));
    card.appendChild(el('p', count + ' of ' + total + ' pages read', 'cnr-learning__muted'));
    var bar = el('progress'); bar.max = total || 1; bar.value = count; bar.setAttribute('aria-label', (c ? c.label : t.label) + ' pages read'); card.appendChild(bar);
    var next = lessons.find(function (l) { return !state.progress.done[l.path]; });
    if (next) card.appendChild(link('Suggested next: ' + next.title, next.path));
    else if (lessons.length) card.appendChild(el('p', 'All pages marked read. Revisit an exercise to practice.'));
    card.appendChild(el('p', 'Last visited ' + date(t.t), 'cnr-learning__muted'));
    return card;
  }
  function renderHome() {
    var root = document.querySelector('[data-continue]'); if (!root) return;
    var recent = recentCourses().slice(0, 4); root.replaceChildren(); if (!recent.length) { root.hidden = true; return; }
    root.hidden = false; var container = el('div', null, 'container cnr-learning-home');
    var head = el('div', null, 'cnr-learning__section-head'); head.appendChild(el('h2', 'Continue learning')); head.appendChild(link('Open your dashboard', '/learn/')); container.appendChild(head);
    var grid = el('div', null, 'cnr-learning__grid'); recent.forEach(function (entry) { grid.appendChild(courseCard(entry)); }); container.appendChild(grid);
    container.appendChild(el('p', 'Reading progress is saved in this browser. Practice and check results are tracked separately.', 'cnr-learning__muted'));
    var n = el('p', notice, 'cnr-learning__notice'); n.setAttribute('data-learning-notice', ''); n.hidden = !notice; container.appendChild(n); root.appendChild(container);
  }
  function lessonCard(p, item) {
    var card = el('article', null, 'cnr-learning__card'); var heading = el('h3'); heading.appendChild(link(item.title || p, p)); card.appendChild(heading); card.appendChild(badges(p)); return card;
  }
  function renderDashboard() {
    var root = document.querySelector('[data-learning-dashboard]'); if (!root) return;
    var records = Object.keys(state.learning.lessons), stats = root.querySelector('[data-learning-summary]');
    if (stats) {
      stats.replaceChildren();
      [['Pages read', Object.keys(state.progress.done).length], ['Lessons practiced', records.filter(function (p) { return lessonStatus(p).practiced; }).length], ['Lessons with a passed check', records.filter(function (p) { return lessonStatus(p).passed; }).length]].forEach(function (pair) {
        var card = el('div', null, 'cnr-learning__stat'); card.appendChild(el('strong', String(pair[1]))); card.appendChild(el('span', pair[0])); stats.appendChild(card);
      });
    }
    var recent = root.querySelector('[data-learning-courses]');
    if (recent) { recent.replaceChildren(); recentCourses().slice(0, 12).forEach(function (entry) { recent.appendChild(courseCard(entry)); }); if (!recent.children.length) { var p = el('p', 'Your recent courses will appear after you visit a lesson. '); p.appendChild(link('Explore the learning roadmap', '/roadmap/')); recent.appendChild(p); } }
    var saved = root.querySelector('[data-learning-bookmarks]');
    if (saved) {
      saved.replaceChildren(); records.filter(function (p) { var b = state.learning.lessons[p].bookmark; return b && b.value; }).sort(function (a, b) { return state.learning.lessons[b].bookmark.updatedAt - state.learning.lessons[a].bookmark.updatedAt; }).forEach(function (p) {
        var item = state.learning.lessons[p], card = lessonCard(p, item); card.appendChild(button('Remove bookmark', function () { bookmark(p, false); })); saved.appendChild(card);
      });
      if (!saved.children.length) saved.appendChild(el('p', 'Bookmark a lesson to keep it here.'));
    }
    var notes = root.querySelector('[data-learning-notes]');
    if (notes) {
      notes.replaceChildren(); records.filter(function (p) { return state.learning.lessons[p].note && state.learning.lessons[p].note.text; }).sort(function (a, b) { return state.learning.lessons[b].note.updatedAt - state.learning.lessons[a].note.updatedAt; }).forEach(function (p) {
        var item = state.learning.lessons[p], d = el('details', null, 'cnr-learning__note-card'); d.appendChild(el('summary', item.title)); d.appendChild(el('p', item.note.text, 'cnr-learning__note-text')); d.appendChild(link('Open lesson to edit this note', p)); notes.appendChild(d);
      });
      if (!notes.children.length) notes.appendChild(el('p', 'Save a note on any lesson. Notes stay private to this browser unless you export them.'));
    }
    var evidence = root.querySelector('[data-learning-practice]');
    if (evidence) {
      evidence.replaceChildren(); records.filter(function (p) { return lessonStatus(p).practiced; }).sort(function (a, b) { return state.learning.lessons[b].updatedAt - state.learning.lessons[a].updatedAt; }).slice(0, 20).forEach(function (p) {
        var item = state.learning.lessons[p], card = lessonCard(p, item), list = el('ul');
        Object.keys(item.practice).forEach(function (id) { var r = item.practice[id]; list.appendChild(el('li', (id === 'manual' ? 'Self-reported practice' : id) + ': ' + (r.lastResult === 'passed' ? 'check passed' : r.lastResult === 'not-passed' ? 'latest check not passed' : 'practice recorded') + ' · ' + date(r.attemptedAt) + (r.passedAt && r.lastResult !== 'passed' ? ' · an earlier check passed' : ''))); });
        card.appendChild(list); evidence.appendChild(card);
      });
      if (!evidence.children.length) evidence.appendChild(el('p', 'Practice records appear when you record practice or use a lesson playground. Running code does not automatically pass a check.'));
    }
    var drafts = root.querySelector('[data-learning-drafts]');
    if (drafts) { var count = Object.keys(state.playground.drafts).length; drafts.replaceChildren(el('p', count + ' playground draft' + (count === 1 ? '' : 's') + ' saved in this browser.')); drafts.appendChild(link('Open playground', '/playground/')); }
    renderNotices();
  }
  function changed() {
    if (!initialised) return;
    renderTools(); renderSidebar(); renderHome(); renderDashboard(); renderNotices();
    window.dispatchEvent(new CustomEvent('cnr:learning-updated', { detail: { persistent: !volatile && !blocked } }));
  }
  function loadCatalog() {
    if (catalogPromise) return catalogPromise;
    var status = document.querySelector('[data-learning-catalog-status]'); if (status) status.textContent = 'Loading course order…';
    catalogPromise = fetch('/learning-catalog.json', { credentials: 'same-origin' }).then(function (response) { if (!response.ok) fail('Course list is unavailable.'); return response.json(); }).then(function (value) {
      if (!record(value) || value.v !== 1 || !Array.isArray(value.courses) || value.courses.length > 1000) fail('The course list format is unsupported.');
      var clean = { byID: map(), byPath: map() };
      value.courses.forEach(function (c) {
        if (!record(c) || !courseID(c.id) || !docURL(c.url, true) || !Array.isArray(c.lessons) || c.lessons.length > 20000) fail('The course list contains an invalid entry.');
        var entry = { id: c.id, label: text(c.label, 240, 'Course title'), url: docURL(c.url, true), lessons: [] }, seen = map();
        c.lessons.forEach(function (l) { var p = l && path(l.path); if (!p) fail('Invalid catalog lesson.'); if (!seen[p]) { seen[p] = true; var lesson = { path: p, title: text(l.title, 300, 'Lesson title'), course: c.id }; entry.lessons.push(lesson); clean.byPath[p] = lesson; } }); clean.byID[c.id] = entry;
      });
      catalog = clean; if (status) status.textContent = ''; renderDashboard(); renderTools(); return clean;
    }).catch(function () { if (status) status.textContent = 'Course order is unavailable right now. Your saved lessons and notes still work; reload to retry suggestions.'; return null; });
    return catalogPromise;
  }
  function bindTools() {
    if (!currentPage) return;
    document.querySelectorAll('[data-mark-done]').forEach(function (b) { b.addEventListener('click', function () { setRead(currentPage.path, !state.progress.done[currentPage.path]); }); });
    document.querySelectorAll('[data-learning-tools]').forEach(function (root) {
      var b = root.querySelector('[data-learning-bookmark]'); if (b) b.addEventListener('click', function () { var item = state.learning.lessons[currentPage.path]; bookmark(currentPage.path, !(item && item.bookmark && item.bookmark.value)); });
      var practiceButton = root.querySelector('[data-learning-practiced]'); if (practiceButton) practiceButton.addEventListener('click', function () { practice({ path: currentPage.path, exerciseId: 'manual' }); });
      var field = root.querySelector('[data-learning-note]'), status = root.querySelector('[data-learning-note-status]');
      if (field) field.addEventListener('input', function () { noteDirty = field.value !== noteBaseline; if (status) status.textContent = noteDirty ? 'Unsaved note. Choose Save note to keep it.' : ''; });
      var save = root.querySelector('[data-learning-save-note]'); if (save) save.addEventListener('click', function () {
        try { var ok = saveNote(currentPage.path, field.value); if (ok) { noteDirty = false; noteBaseline = field.value; } else { noteDirty = true; var held = state.learning.lessons[currentPage.path]; if (held && held.note && held.note.text === field.value) noteBaseline = field.value; } renderTools(); if (status) status.textContent = ok ? 'Note saved in this browser.' : 'Your note could not be saved. Your text is still here; see the storage message above before leaving.'; }
        catch (error) { if (status) status.textContent = error.message; }
      });
      var reload = root.querySelector('[data-learning-reload-note]'); if (reload) reload.addEventListener('click', function () { noteDirty = false; renderTools(); if (status) status.textContent = 'Loaded the saved note.'; });
    });
  }
  function bindBackup() {
    document.querySelectorAll('[data-learning-export]').forEach(function (exporting) {
      exporting.addEventListener('click', function () {
        var scope = exporting.closest('[data-learning-tools], [data-learning-dashboard]'), status = scope.querySelector('[data-learning-backup-status]');
        try {
          var data = exportBackup(), blob = new Blob([data], { type: 'application/json' }), url = URL.createObjectURL(blob), a = el('a');
          a.href = url; a.download = 'cnr-learning-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
          var field = scope.querySelector('[data-learning-note]'), item = currentPage && state.learning.lessons[currentPage.path];
          var omittedEdit = field && field.value !== (item && item.note ? item.note.text : '');
          status.textContent = 'Backup download started. Keep the file somewhere you can find it; it contains your notes and code.' + (omittedEdit ? ' The current note has unsaved edits that are not in this backup; save or copy that text separately.' : '');
        } catch (error) { status.textContent = error.message; }
      });
    });
    var root = document.querySelector('[data-learning-dashboard]'); if (!root) return;
    var status = root.querySelector('[data-learning-backup-status]'), input = root.querySelector('[data-learning-import-file]'), preview = root.querySelector('[data-learning-import-preview]');
    var mergeButton = root.querySelector('[data-learning-import-apply]'), cancel = root.querySelector('[data-learning-import-cancel]'), fileTicket = 0, previewToken = null;
    function clearPreview() { fileTicket++; pending = null; preview.hidden = true; mergeButton.disabled = true; input.value = ''; }
    input.addEventListener('change', function () {
      var ticket = ++fileTicket; pending = null; preview.hidden = true; mergeButton.disabled = true; var file = input.files && input.files[0]; if (!file) return;
      if (file.size > MAX_BACKUP) { status.textContent = 'Choose a JSON backup no larger than 6 MB.'; return; }
      status.textContent = 'Checking backup…';
      file.text().then(function (raw) {
        if (ticket !== fileTicket) return;
        var summary = prepareImport(raw); previewToken = summary.previewToken; var counts = root.querySelector('[data-learning-import-counts]'); counts.replaceChildren();
        counts.appendChild(el('p', summary.read + ' read marks · ' + summary.bookmarks + ' bookmarks · ' + summary.notes + ' notes · ' + summary.practice + ' exercise records · ' + summary.drafts + ' drafts'));
        counts.appendChild(el('p', 'Merge keeps existing read marks. The newest bookmark choice wins. Different notes are kept together; conflicting code drafts are added as separate copies.'));
        counts.appendChild(el('p', summary.noteConflicts + ' different notes will be appended; ' + summary.draftCopies + ' draft copies will be added.'));
        preview.hidden = false; mergeButton.disabled = false; status.textContent = 'Backup validated. Review the preview, then choose Merge backup. Nothing has changed yet.';
      }).catch(function (error) { if (ticket === fileTicket) status.textContent = 'Backup not imported: ' + error.message; });
    });
    mergeButton.addEventListener('click', function () { try { applyImport(previewToken); clearPreview(); status.textContent = 'Backup merged. Your existing read marks, notes, and drafts were preserved.'; } catch (error) { clearPreview(); status.textContent = error.message; } });
    cancel.addEventListener('click', function () { clearPreview(); status.textContent = 'Import cancelled. No saved data changed.'; });
  }
  function init() {
    state = empty();
    try { recoverJournal(); state = readAll(); }
    catch (error) { storageError(error, !(error && error.name === 'SecurityError')); }
    bindTools(); bindBackup(); visit(); initialised = true; changed();
    if (document.querySelector('[data-learning-dashboard]')) loadCatalog();
  }
  window.addEventListener('cnr:practice', function (event) { try { practice(event.detail); } catch (error) { notice = 'Practice could not be saved: ' + error.message; renderNotices(); } });
  window.addEventListener('storage', function (event) {
    if (event.key !== null && Object.values(KEYS).indexOf(event.key) < 0 && event.key !== JOURNAL) return;
    if (volatile || blocked) { notice = 'Another tab changed saved learning data. Your unsaved changes are still in this tab; export them before reloading.'; renderNotices(); return; }
    try {
      if (localStorage.getItem(JOURNAL)) return; // Wait for the import's commit/rollback event.
      state = readAll();
      if (pending) { pending = null; var b = document.querySelector('[data-learning-import-apply]'); if (b) b.disabled = true; var status = document.querySelector('[data-learning-backup-status]'); if (status) status.textContent = 'Saved data changed in another tab. Choose the file again to preview an updated merge.'; }
      changed();
    } catch (error) { storageError(error, true); }
  });
  window.addEventListener('beforeunload', function (event) { if (noteDirty || volatile) { event.preventDefault(); event.returnValue = ''; } });
  window.CNRLearning = Object.freeze({
    getSnapshot: function () { return clone(state); }, setRead: setRead, setBookmark: bookmark, saveNote: saveNote, recordPractice: practice,
    exportBackup: exportBackup, validateBackup: function (raw) { return clone(validateBackup(raw, true)); }, prepareImport: prepareImport, applyImport: applyImport, loadCatalog: loadCatalog,
    limits: Object.freeze({ backupBytes: MAX_BACKUP, storeBytes: MAX_STORE, noteCharacters: MAX_NOTE })
  });
  init();
})();
