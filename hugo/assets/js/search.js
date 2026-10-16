/* Course-aware Pagefind search. The index is loaded only when search is used. */
(function () {
  'use strict';
  var modules = new Map();
  var instances = new WeakMap();
  function engine(bundle) {
    var url = new URL('pagefind.js', new URL(bundle, location.origin));
    if (!modules.has(url.href)) {
      var promise = import(url.href).catch(function (error) { modules.delete(url.href); throw error; });
      modules.set(url.href, promise);
    }
    return modules.get(url.href);
  }
  function text(tag, value, className) {
    var node = document.createElement(tag);
    node.textContent = value || '';
    if (className) node.className = className;
    return node;
  }
  function decoded(value) {
    var named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };
    return String(value || '').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, function (full, entity) {
      if (entity[0] !== '#') return named[entity.toLowerCase()] || full;
      var n = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : full;
    });
  }
  // Only Pagefind's highlight markers become elements; all indexed content is text.
  function excerpt(value) {
    var out = document.createElement('p');
    var marked = false;
    String(value || '').split(/(<mark>|<\/mark>)/gi).forEach(function (part) {
      if (/^<mark>$/i.test(part)) marked = true;
      else if (/^<\/mark>$/i.test(part)) marked = false;
      else if (part) out.appendChild(marked ? text('mark', decoded(part)) : document.createTextNode(decoded(part)));
    });
    return out;
  }
  function resultCard(data) {
    var url;
    try { url = new URL(data.url, location.origin); } catch (_) { return null; }
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return null;
    var li = document.createElement('li');
    var heading = document.createElement('h3');
    var link = text('a', decoded(data.meta && data.meta.title) || url.pathname);
    link.href = url.pathname + url.search + url.hash;
    heading.appendChild(link);
    li.appendChild(heading);
    var meta = data.meta || {};
    var context = [meta.course, meta.chapter, meta.type].filter(Boolean).map(decoded);
    if (context.length) li.appendChild(text('p', context.join(' › '), 'cnr-find__context'));
    if (data.excerpt) li.appendChild(excerpt(data.excerpt));
    return li;
  }
  function setup(root) {
    if (instances.has(root)) return instances.get(root);
    var query = root.querySelector('[data-find-query]');
    var topic = root.querySelector('[data-find-topic]');
    var course = root.querySelector('[data-find-course]');
    var type = root.querySelector('[data-find-type]');
    var status = root.querySelector('[data-find-status]');
    var results = root.querySelector('[data-find-results]');
    var more = root.querySelector('[data-find-more]');
    var link = root.querySelector('[data-find-link]');
    var fullPage = root.hasAttribute('data-find-page');
    var seq = 0, timer, matches = [], shown = 0;
    function stateURL() {
      var url = new URL('/search/', location.origin);
      [['q', query.value.trim()], ['topic', topic.value], ['course', course.value], ['type', type.value]].forEach(function (pair) {
        if (pair[1]) url.searchParams.set(pair[0], pair[1]);
      });
      link.href = url.pathname + url.search;
      if (fullPage) history.replaceState(null, '', url.pathname + url.search);
    }
    function filterCourses() {
      Array.from(course.options).forEach(function (option) {
        option.hidden = !!(option.value && topic.value && option.dataset.topic !== topic.value);
      });
      if (course.selectedOptions[0] && course.selectedOptions[0].hidden) course.value = '';
    }
    async function appendBatch(ticket) {
      more.disabled = true;
      var batch = await Promise.all(matches.slice(shown, shown + 12).map(function (r) { return r.data(); }));
      if (ticket !== seq) return;
      var fragment = document.createDocumentFragment();
      batch.forEach(function (data) { var card = resultCard(data); if (card) fragment.appendChild(card); });
      results.appendChild(fragment);
      shown += batch.length;
      more.hidden = shown >= matches.length;
      more.disabled = false;
      status.textContent = matches.length + (matches.length === 1 ? ' result' : ' results') + ' · showing ' + shown + '.';
    }
    async function run(ticket) {
      results.replaceChildren();
      matches = []; shown = 0; more.hidden = true;
      stateURL();
      var q = query.value.trim().slice(0, 200);
      var filters = {};
      if (topic.value) filters.topic = topic.value;
      if (course.value) filters.course = course.value;
      if (type.value) filters.type = type.value;
      if (!q && !Object.keys(filters).length) {
        status.textContent = 'Search all courses, or choose a course to browse its content.';
        root.removeAttribute('aria-busy');
        return;
      }
      root.setAttribute('aria-busy', 'true');
      status.textContent = 'Searching…';
      try {
        var pagefind = await engine(root.dataset.bundle || '/pagefind/');
        if (ticket !== seq) return;
        var found = await pagefind.search(q || null, { filters: filters });
        if (ticket !== seq) return;
        matches = found.results;
        if (!matches.length) {
          status.textContent = 'No results. Try fewer words or clear a filter.';
          return;
        }
        await appendBatch(ticket);
      } catch (_) {
        if (ticket === seq) status.textContent = 'Search could not load. Check your connection and choose Search to retry, or browse the learning roadmaps.';
      } finally {
        if (ticket === seq) root.removeAttribute('aria-busy');
      }
    }
    function search(immediate) {
      clearTimeout(timer);
      var ticket = ++seq;
      if (immediate) run(ticket); else timer = setTimeout(function () { run(ticket); }, 180);
    }
    query.addEventListener('input', function () { search(false); });
    root.querySelector('[data-find-form]').addEventListener('submit', function (event) { event.preventDefault(); search(true); });
    [topic, course, type].forEach(function (control) {
      control.addEventListener('change', function () {
        if (control === topic) filterCourses();
        search(true);
      });
    });
    root.querySelector('[data-find-clear]').addEventListener('click', function () {
      topic.value = ''; course.value = ''; type.value = ''; filterCourses(); search(true); query.focus();
    });
    more.addEventListener('click', async function () {
      var ticket = seq;
      try { await appendBatch(ticket); }
      catch (_) { if (ticket === seq) { status.textContent = 'More results could not load. Try again.'; more.disabled = false; } }
    });
    function apply(params) {
      query.value = (params.get('q') || '').slice(0, 200);
      topic.value = params.get('topic') || '';
      filterCourses();
      course.value = params.get('course') || '';
      if (course.selectedOptions[0] && course.selectedOptions[0].hidden) { topic.value = ''; filterCourses(); }
      type.value = params.get('type') || '';
      search(true);
    }
    var api = {
      open: function (courseID) {
        if (courseID !== undefined) { topic.value = ''; filterCourses(); course.value = courseID; }
        search(true); query.focus();
      },
      apply: apply,
    };
    instances.set(root, api);
    if (fullPage) {
      apply(new URLSearchParams(location.search));
      window.addEventListener('popstate', function () { apply(new URLSearchParams(location.search)); });
    }
    return api;
  }
  document.querySelectorAll('[data-find-page]').forEach(setup);
  var modal = document.querySelector('[data-search-modal]');
  if (!modal) return;
  var opener = null;
  function openSearch(button) {
    opener = button || document.activeElement;
    if (!modal.open) modal.showModal();
    var courseID = button && button.hasAttribute('data-search-course') ? button.getAttribute('data-search-course') : '';
    setup(modal.querySelector('[data-find-root]')).open(courseID);
  }
  function closeSearch() { if (modal.open) modal.close(); }
  document.addEventListener('click', function (event) {
    var open = event.target.closest('[data-search-open]');
    if (open) { event.preventDefault(); openSearch(open); }
    if (event.target.closest('[data-search-close]')) closeSearch();
    if (event.target === modal) {
      var rect = modal.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeSearch();
    }
  });
  modal.addEventListener('close', function () { if (opener && opener.isConnected) opener.focus(); });
  document.addEventListener('keydown', function (event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); if (modal.open) closeSearch(); else openSearch(null);
    }
  });
  if (!/Mac|iPhone|iPad/.test(navigator.platform)) {
    var key = document.querySelector('.DocSearch-Button-Key');
    if (key) key.textContent = 'Ctrl';
  }
})();
