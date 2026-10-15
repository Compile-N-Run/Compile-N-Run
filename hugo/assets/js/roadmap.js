/* /roadmap/: tabs per track, arrows between nodes, the reader's progress on each node (from the
   cnr_progress record main.js keeps), and a panel with a node's sections. */
(function () {
  var root = document.documentElement;
  var get = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var set = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var progress = { done: {}, tuts: {} };
  try { progress = JSON.parse(get('cnr_progress') || 'null') || progress; } catch (e) {}
  var doneKeys = Object.keys(progress.done || {});
  var count = function (prefix) { return doneKeys.filter(function (k) { return k.indexOf(prefix) === 0; }).length; };

  /* ---------- Progress on each node ---------- */
  var nodeProgress = function (node) {
    var total = Number(node.getAttribute('data-total')) || 0;
    var done = Math.min(count(node.getAttribute('data-prefix')), total);
    return { done: done, total: total };
  };
  document.querySelectorAll('.cnr-rm__node[data-prefix]').forEach(function (node) {
    var p = nodeProgress(node);
    if (!p.done) return;
    node.classList.add(p.done >= p.total ? 'cnr-rm__node--done' : 'cnr-rm__node--started');
    node.querySelector('.cnr-rm__bar i').style.width = Math.round(100 * p.done / p.total) + '%';
    node.querySelector('.cnr-rm__meta').textContent = p.done >= p.total ? '✓ Completed' : p.done + ' / ' + p.total + ' pages';
  });

  /* ---------- Arrows: from each node to the ones that build on it ---------- */
  var draw = function (track) {
    var graph = track.querySelector('[data-rm-graph]');
    var svg = graph.querySelector('.cnr-rm__edges');
    if (track.hidden || !graph.offsetWidth) return;
    var box = graph.getBoundingClientRect();
    svg.setAttribute('width', graph.scrollWidth);
    svg.setAttribute('height', graph.scrollHeight);
    var paths = [];
    graph.querySelectorAll('.cnr-rm__node').forEach(function (node) {
      if (!node.offsetParent) return; // hidden "not covered" node
      var to = node.getBoundingClientRect();
      (node.getAttribute('data-from') || '').split(',').forEach(function (id) {
        var from = id && graph.querySelector('[data-id="' + id + '"]');
        if (!from || !from.offsetParent) return;
        var a = from.getBoundingClientRect();
        var x1 = a.left + a.width / 2 - box.left, y1 = a.bottom - box.top;
        var x2 = to.left + to.width / 2 - box.left, y2 = to.top - box.top;
        if (y2 <= y1) return; // same row after wrapping on a narrow screen
        var dy = (y2 - y1) / 2;
        var cls = 'cnr-rm__edge' + (node.classList.contains('cnr-rm__node--missing') || from.classList.contains('cnr-rm__node--missing') ? ' cnr-rm__edge--missing' : '') +
          (from.classList.contains('cnr-rm__node--done') ? ' cnr-rm__edge--done' : '');
        paths.push('<path class="' + cls + '" d="M' + x1 + ' ' + y1 + ' C' + x1 + ' ' + (y1 + dy) + ' ' + x2 + ' ' + (y2 - dy) + ' ' + x2 + ' ' + (y2 - 4) + '" marker-end="url(#cnr-rm-arrow)"/>');
      });
    });
    svg.innerHTML = '<defs><marker id="cnr-rm-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
      '<path d="M0 0 L10 5 L0 10 z" class="cnr-rm__arrow"/></marker></defs>' + paths.join('');
  };

  /* ---------- Tabs (one track at a time; the URL hash picks it) ---------- */
  var tracks = Array.prototype.slice.call(document.querySelectorAll('[data-rm-track]'));
  var tabs = document.querySelectorAll('[data-rm-tab]');
  var show = function (id) {
    if (!tracks.some(function (t) { return t.id === id; })) id = tracks[0].id;
    tracks.forEach(function (t) { t.hidden = t.id !== id; });
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-rm-tab') === id;
      t.classList.toggle('cnr-rm__tab--active', on);
      t.setAttribute('aria-selected', String(on));
    });
    draw(document.getElementById(id));
  };
  tabs.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      history.replaceState(null, '', '#' + t.getAttribute('data-rm-tab'));
      show(t.getAttribute('data-rm-tab'));
    });
  });
  window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });
  show(location.hash.slice(1));

  var redraw = function () { tracks.forEach(draw); };
  if (window.ResizeObserver) new ResizeObserver(redraw).observe(document.querySelector('.cnr-rm'));
  else window.addEventListener('resize', redraw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);

  /* ---------- "Show topics not covered yet" ---------- */
  var gaps = document.querySelector('[data-rm-gaps]');
  var paintGaps = function () { root.classList.toggle('cnr-rm-hide-gaps', !gaps.checked); redraw(); };
  if (get('cnr_rm_gaps') === '0') gaps.checked = false;
  gaps.addEventListener('change', function () { set('cnr_rm_gaps', gaps.checked ? '1' : '0'); paintGaps(); });
  paintGaps();

  /* ---------- Details panel ---------- */
  var wrap = document.querySelector('[data-rm-panel]');
  var body = wrap.querySelector('[data-rm-panel-body]');
  var opener = null;
  var close = function () { wrap.hidden = true; root.style.overflow = ''; if (opener) opener.focus(); };
  wrap.querySelectorAll('[data-rm-close]').forEach(function (b) { b.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !wrap.hidden) close(); });
  var bar = function (done, total) {
    var pct = total ? Math.round(100 * done / total) : 0;
    return '<span class="cnr-rm__pbar"><i style="width:' + pct + '%"></i></span>';
  };
  var open = function (node) {
    var title = node.querySelector('.cnr-rm__title').textContent;
    var note = node.getAttribute('data-note');
    var html = '<h2 id="cnr-rm-panel-title">' + esc(title) + '</h2>';
    if (node.getAttribute('data-kind') === 'missing') {
      html += (note ? '<p>' + esc(note) + '</p>' : '') +
        '<p class="cnr-rm__soon">Compile N Run doesn\'t have a tutorial on this yet.</p>' +
        '<a class="button button--primary" target="_blank" rel="noopener" href="https://forum.compilenrun.com/new-topic?category=tutorial-feedback&title=' +
        encodeURIComponent('Tutorial request: ' + title) + '">Request this tutorial</a>';
    } else {
      var p = nodeProgress(node);
      var href = node.getAttribute('href');
      var tut = node.getAttribute('data-tut');
      var last = tut && progress.tuts && progress.tuts[tut] && progress.tuts[tut].last;
      html += (note ? '<p>' + esc(note) + '</p>' : '') +
        '<p class="cnr-rm__pmeta">' + (p.done ? p.done + ' of ' + p.total + ' pages done' : p.total + (p.total === 1 ? ' page' : ' pages')) + '</p>' + bar(p.done, p.total) +
        '<div class="cnr-rm__actions">' +
        (last && /^\/docs\//.test(last.path) && p.done < p.total ? '<a class="button button--primary" href="' + esc(last.path) + '">Continue: ' + esc(last.title) + '</a>' : '') +
        '<a class="button ' + (last && p.done < p.total ? 'button--secondary' : 'button--primary') + '" href="' + esc(href) + '">' + (p.done >= p.total ? 'Review' : p.done ? 'Open' : 'Start') + '</a></div>';
      var tpl = node.querySelector('template[data-rm-sections]');
      if (tpl) {
        html += '<h3>What\'s inside</h3><ol class="cnr-rm__sections">' + tpl.innerHTML + '</ol>';
      }
    }
    body.innerHTML = html;
    body.querySelectorAll('.cnr-rm__sections li').forEach(function (li) {
      var total = Number(li.getAttribute('data-total')) || 0, done = Math.min(count(li.getAttribute('data-prefix')), total);
      li.insertAdjacentHTML('beforeend', '<span class="cnr-rm__smeta">' + (done >= total && total ? '✓' : done ? done + '/' + total : total) + '</span>');
      if (done >= total && total) li.classList.add('is-done');
    });
    opener = node;
    wrap.hidden = false;
    root.style.overflow = 'hidden';
    wrap.querySelector('.cnr-rm__close').focus();
  };
  document.querySelectorAll('.cnr-rm__node').forEach(function (node) {
    if (node.getAttribute('data-kind') === 'track') return;
    node.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // open in a new tab as usual
      e.preventDefault();
      open(node);
    });
  });
})();
