/* Learning analytics dashboard. Talks to the site Worker's /api/analytics/* with a bearer token obtained through
 * /api/analytics/connect (the site's session is host-only, so the hand-off runs as a top-level navigation on www).
 * All data is inserted with textContent; charts use Chart.js with the palette tokens from style.css. */
(function () {
  'use strict';
  const API = 'https://www.compilenrun.com/api/analytics/';
  const TOKEN_KEY = 'cnr.analytics.token', EXP_KEY = 'cnr.analytics.expires', THEME_KEY = 'cnr.analytics.theme';
  const $ = (s, root) => (root || document).querySelector(s), $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined && text !== null) n.textContent = String(text); if (cls) n.className = cls; return n; };
  const fmt = n => n === null || n === undefined || Number.isNaN(Number(n)) ? '–' : Number(n).toLocaleString();
  const when = ts => { if (!ts) return ''; const d = new Date(Number(ts)); return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); };
  const ago = ts => { const s = Math.max(0, Math.round((Date.now() - Number(ts)) / 1000)); return s < 60 ? s + 's ago' : s < 3600 ? Math.round(s / 60) + 'm ago' : Math.round(s / 3600) + 'h ago'; };
  const token = () => { try { const t = sessionStorage.getItem(TOKEN_KEY), e = Number(sessionStorage.getItem(EXP_KEY)); return t && e * 1000 > Date.now() ? t : null; } catch (_) { return null; } };
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* ---- theme ---- */
  const root = document.documentElement;
  try { const t = localStorage.getItem(THEME_KEY); if (t) root.setAttribute('data-theme', t); } catch (_) {}
  $('[data-theme-toggle]').addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme', dark ? 'light' : 'dark'); try { localStorage.setItem(THEME_KEY, dark ? 'light' : 'dark'); } catch (_) {}
    Object.values(charts).forEach(c => c.destroy()); for (const k in charts) delete charts[k]; render(state.tab, true);
  });

  /* ---- sign-in hand-off ---- */
  if (location.hash.length > 1) {
    const h = new URLSearchParams(location.hash.slice(1));
    if (h.get('token')) { try { sessionStorage.setItem(TOKEN_KEY, h.get('token')); sessionStorage.setItem(EXP_KEY, h.get('expires') || String(Math.floor(Date.now() / 1000) + 43200)); } catch (_) {} }
    if (h.get('error')) state0Error = h.get('error');
    history.replaceState(null, '', location.pathname + location.search);
  }
  var state0Error;
  function gate(reason) {
    $('[data-app]').hidden = true; $('[data-gate]').hidden = false; $('[data-signout]').hidden = true; $('[data-user]').hidden = true;
    const text = $('[data-gate-text]');
    if (reason === 'not_admin') text.textContent = 'You are signed in, but this account is not on the administrator list (ANALYTICS_ADMINS in the Worker configuration).';
    else if (reason === 'expired') text.textContent = 'Your dashboard session has ended. Sign in again to continue.';
  }
  $('[data-connect]').addEventListener('click', () => { location.href = API + 'connect?return=' + encodeURIComponent(location.origin + location.pathname); });
  $('[data-signout]').addEventListener('click', async () => { try { await api('logout'); } catch (_) {} try { sessionStorage.removeItem(TOKEN_KEY); } catch (_) {} gate(); });

  async function api(name, params, body) {
    const t = token(); if (!t) { gate(); throw new Error('sign_in_required'); }
    const url = new URL(API + name); Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v); });
    const res = await fetch(url, { method: body ? 'POST' : 'GET', headers: { authorization: 'Bearer ' + t, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 401) { gate('expired'); throw new Error('sign_in_required'); }
    if (res.status === 403) { gate('not_admin'); throw new Error('not_admin'); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || ('HTTP ' + res.status));
    return data;
  }

  /* ---- filters ---- */
  const state = { days: 30, from: null, to: null, site: '', tab: 'overview' };
  function params() { const p = { site: state.site }; if (state.from && state.to) { p.from = state.from; p.to = state.to; } else p.days = state.days; return p; }
  $$('[data-days]').forEach(b => b.addEventListener('click', () => { state.days = Number(b.dataset.days); state.from = state.to = null; $('[data-from]').value = ''; $('[data-to]').value = ''; $$('[data-days]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); render(state.tab, true); }));
  function customRange() {
    const f = $('[data-from]').value, t = $('[data-to]').value; if (!f || !t) return;
    state.from = new Date(f + 'T00:00:00Z').getTime(); state.to = new Date(t + 'T00:00:00Z').getTime() + 86400000;
    $$('[data-days]').forEach(x => x.setAttribute('aria-pressed', 'false')); render(state.tab, true);
  }
  $('[data-from]').addEventListener('change', customRange); $('[data-to]').addEventListener('change', customRange);
  $('[data-site]').addEventListener('change', e => { state.site = e.target.value; render(state.tab, true); });
  $('[data-refresh]').addEventListener('click', () => render(state.tab, true));
  $$('[role="tab"]').forEach(b => b.addEventListener('click', () => { state.tab = b.dataset.tab; $$('[role="tab"]').forEach(x => x.setAttribute('aria-selected', String(x === b))); $$('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== state.tab; }); location.hash = ''; render(state.tab); }));

  /* ---- tables ---- */
  function table(host, rows, cols, opts) {
    opts = opts || {}; host.replaceChildren();
    if (!rows || !rows.length) { host.appendChild(el('p', opts.empty || 'Nothing in this range yet.', 'empty')); return; }
    const t = el('table'), thead = el('thead'), tr = el('tr'), tbody = el('tbody');
    let sortKey = opts.sort || null, sortDir = opts.dir || 'desc';
    cols.forEach(c => { const th = el('th', c.label, c.num ? 'num' : ''); th.addEventListener('click', () => { if (sortKey === c.key) sortDir = sortDir === 'desc' ? 'asc' : 'desc'; else { sortKey = c.key; sortDir = c.num ? 'desc' : 'asc'; } draw(); }); th.dataset.key = c.key; tr.appendChild(th); });
    thead.appendChild(tr); t.append(thead, tbody); host.appendChild(t);
    function draw() {
      const sorted = rows.slice(); if (sortKey) sorted.sort((a, b) => { const x = a[sortKey], y = b[sortKey]; const r = typeof x === 'number' || typeof y === 'number' ? (Number(x) || 0) - (Number(y) || 0) : String(x || '').localeCompare(String(y || '')); return sortDir === 'desc' ? -r : r; });
      $$('th', thead).forEach(th => th.setAttribute('aria-sort', th.dataset.key === sortKey ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'));
      tbody.replaceChildren(); sorted.forEach(row => {
        const r = el('tr'); if (opts.rowId) { const id = opts.rowId(row); if (id) r.dataset.id = id; }
        cols.forEach(c => { const td = el('td', null, (c.num ? 'num ' : '') + (c.cls || '')); const v = c.render ? c.render(row[c.key], row) : row[c.key]; if (v instanceof Node) td.appendChild(v); else td.textContent = c.num ? fmt(v) : (v === null || v === undefined ? '' : String(v)); if (c.title) td.title = String(row[c.key] ?? ''); r.appendChild(td); });
        tbody.appendChild(r);
      });
    }
    draw();
    if (opts.onRow) tbody.addEventListener('click', e => { const tr = e.target.closest('tr[data-id]'); if (tr) opts.onRow(tr.dataset.id); });
  }
  const siteChip = s => el('span', s === 'moodle' ? 'Moodle' : 'Website', 'chip chip--' + s);
  const personCell = (name, email) => { const d = el('div'); d.appendChild(el('div', name || (email ? '' : '(guest)'))); if (email) d.appendChild(el('div', email, 'muted')); return d; };

  /* ---- charts (Chart.js with the dataviz mark specs) ---- */
  const charts = {};
  const crosshair = { id: 'crosshair', afterDraw(chart) { const a = chart.tooltip?.getActiveElements?.() || []; if (!a.length || chart.config.type !== 'line') return; const x = a[0].element.x, { top, bottom } = chart.chartArea, ctx = chart.ctx; ctx.save(); ctx.strokeStyle = css('--axis'); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke(); ctx.restore(); } };
  function chartDefaults() {
    const C = window.Chart; if (!C) return false;
    C.defaults.color = css('--muted'); C.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", sans-serif'; C.defaults.font.size = 12;
    C.defaults.borderColor = css('--grid'); C.defaults.animation.duration = 200;
    C.defaults.plugins.legend.labels.boxWidth = 14; C.defaults.plugins.legend.labels.boxHeight = 3; C.defaults.plugins.legend.labels.color = css('--text-2');
    C.defaults.plugins.tooltip.backgroundColor = css('--surface'); C.defaults.plugins.tooltip.titleColor = css('--text'); C.defaults.plugins.tooltip.bodyColor = css('--text');
    C.defaults.plugins.tooltip.borderColor = css('--border'); C.defaults.plugins.tooltip.borderWidth = 1; C.defaults.plugins.tooltip.padding = 8; C.defaults.plugins.tooltip.displayColors = true;
    C.defaults.plugins.tooltip.boxWidth = 10; C.defaults.plugins.tooltip.boxHeight = 2; C.defaults.plugins.tooltip.usePointStyle = false;
    return true;
  }
  function draw(key, type, labels, datasets, extra) {
    if (!chartDefaults()) return; const canvas = $(`[data-chart="${key}"]`); if (!canvas) return;
    if (charts[key]) charts[key].destroy();
    const multi = datasets.length > 1;
    datasets.forEach((d, i) => {
      const color = d.color || css('--s' + (i + 1));
      if (type === 'line') Object.assign(d, { borderColor: color, backgroundColor: color, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 12, tension: 0, fill: false });
      else Object.assign(d, { backgroundColor: color, borderColor: css('--surface'), borderWidth: d.stack ? { top: 2, right: 0, bottom: 0, left: 0 } : 0, borderRadius: 4, borderSkipped: 'start', maxBarThickness: 26 });
    });
    const axes = extra && extra.horizontal;
    charts[key] = new window.Chart(canvas, { type, data: { labels, datasets }, plugins: [crosshair], options: {
      indexAxis: axes ? 'y' : 'x', responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: multi, position: 'top', align: 'start' }, tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.parsed[axes ? 'x' : 'y'])}  ${ctx.dataset.label || ''}` } } },
      scales: { x: { stacked: !!(extra && extra.stacked), grid: { display: !!axes, color: css('--grid') }, border: { color: css('--axis') }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: axes ? 6 : 10, precision: 0 } },
                y: { stacked: !!(extra && extra.stacked), beginAtZero: true, grid: { display: !axes, color: css('--grid') }, border: { display: false }, ticks: { precision: 0, autoSkip: !axes, callback(v) { return axes ? (String(this.getLabelForValue(v)).length > 38 ? String(this.getLabelForValue(v)).slice(0, 36) + '…' : this.getLabelForValue(v)) : fmt(v); } } } },
    } });
  }
  const shortDay = d => { const [y, m, dd] = d.split('-'); return `${Number(m)}/${Number(dd)}`; };

  /* ---- panels ---- */
  const status = $('[data-status]');
  const loading = new Set();
  async function render(tab, force) {
    if (!token()) { gate(state0Error); return; }
    $('[data-gate]').hidden = true; $('[data-app]').hidden = false; $('[data-signout]').hidden = false;
    const panel = $(`[data-panel="${tab}"]`); panel.setAttribute('aria-busy', 'true'); status.textContent = 'Loading…';
    try {
      if (!$('[data-user]').textContent) { const me = await api('me'); $('[data-user]').textContent = me.user.name + (me.user.email ? ' · ' + me.user.email : ''); $('[data-user]').hidden = false; }
      await ({ overview, learners, pages, moodle, funnel, live, sql })[tab](force);
      status.textContent = 'Updated ' + new Date().toLocaleTimeString();
    } catch (e) { status.textContent = e.message === 'sign_in_required' || e.message === 'not_admin' ? '' : 'Error: ' + e.message; }
    finally { panel.setAttribute('aria-busy', 'false'); }
  }

  function tile(host, label, value, delta, unit) {
    const t = el('div', null, 'tile'); t.appendChild(el('div', label, 'tile__label')); t.appendChild(el('div', value, 'tile__value'));
    if (delta !== undefined) { const d = el('div', null, 'tile__delta'); if (delta === null) d.textContent = 'no previous period'; else { const pct = Math.round(delta * 100); d.textContent = (pct > 0 ? '▲ +' : pct < 0 ? '▼ ' : '▬ ') + pct + '% vs previous period'; d.className += pct > 0 ? ' tile__delta--up' : pct < 0 ? ' tile__delta--down' : ''; } t.appendChild(d); } else if (unit) t.appendChild(el('div', unit, 'tile__delta'));
    host.appendChild(t);
  }
  const delta = (cur, prev) => (!prev ? null : (Number(cur || 0) - Number(prev)) / Number(prev));

  async function overview() {
    const p = params();
    const [sum, days, ev, countries, hours, retention] = await Promise.all([api('summary', p), api('daily', p), api('events', p), api('countries', p), api('hours', p), api('retention', p)]);
    const host = $('[data-tiles]'); host.replaceChildren(); const c = sum.current, v = sum.previous;
    tile(host, 'Visitors (browsers)', fmt(c.visitors), delta(c.visitors, v.visitors)); tile(host, 'Signed-in learners', fmt(c.learners), delta(c.learners, v.learners));
    tile(host, 'Page views', fmt(c.page_views), delta(c.page_views, v.page_views)); tile(host, 'Minutes engaged', fmt(c.minutes), delta(c.minutes, v.minutes));
    tile(host, 'Practice actions', fmt(c.practice), delta(c.practice, v.practice)); tile(host, 'New accounts', fmt(c.new_accounts), undefined, 'created in range'); tile(host, 'Moodle page views', fmt(c.moodle_views), delta(c.moodle_views, v.moodle_views));
    const labels = days.map(d => shortDay(d.day));
    draw('daily-people', 'line', labels, [{ label: 'Visitors', data: days.map(d => d.visitors) }, { label: 'Signed-in learners', data: days.map(d => d.learners) }]);
    draw('daily-views', 'bar', labels, [{ label: 'Website', data: days.map(d => d.www_views), stack: 'v' }, { label: 'Moodle', data: days.map(d => d.moodle_views), stack: 'v' }], { stacked: true });
    const byName = {}; ev.forEach(r => { byName[r.name] = (byName[r.name] || 0) + r.n; }); const top = Object.entries(byName).sort((a, b) => b[1] - a[1]).slice(0, 15);
    draw('events', 'bar', top.map(x => x[0]), [{ label: 'Events', data: top.map(x => x[1]) }], { horizontal: true });
    heat(hours);
    table($('[data-table="countries"]'), countries, [{ key: 'country', label: 'Country' }, { key: 'visitors', label: 'Visitors', num: true }, { key: 'learners', label: 'Learners', num: true }, { key: 'views', label: 'Page views', num: true }], { sort: 'visitors' });
    table($('[data-table="retention"]'), retention, [{ key: 'cohort_week', label: 'Week of first visit' }, { key: 'learners', label: 'New learners', num: true }, { key: 'back_in_week_1', label: 'Back in days 2–7', num: true }, { key: 'back_in_week_2', label: 'Back in week 2', num: true }, { key: 'back_in_weeks_3_4', label: 'Back in weeks 3–4', num: true }], { sort: 'cohort_week', dir: 'asc', empty: 'No signed-in learners started in this range yet.' });
  }
  function heat(rows) {
    const host = $('[data-heat]'); host.replaceChildren(); const max = Math.max(1, ...rows.map(r => r.views)); const grid = {}; rows.forEach(r => { grid[r.weekday + ':' + r.hour] = r; });
    const ramp = ['--seq-100', '--seq-250', '--seq-400', '--seq-550', '--seq-700'].map(css);
    host.appendChild(el('div')); for (let h = 0; h < 24; h++) host.appendChild(el('div', h % 3 === 0 ? String(h) : '', 'heat__hour'));
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((name, w) => { host.appendChild(el('div', name, 'heat__label')); for (let h = 0; h < 24; h++) { const r = grid[w + ':' + h]; const cell = el('div', null, 'heat__cell'); if (r && r.views) { const step = Math.min(4, Math.floor((r.views / max) * 4.999)); cell.style.background = ramp[step]; } cell.title = `${name} ${h}:00 UTC · ${fmt(r ? r.views : 0)} page views · ${fmt(r ? r.visitors : 0)} visitors`; host.appendChild(cell); } });
  }

  let learnerRows = [];
  async function learners() {
    learnerRows = await api('learners', params()); drawLearners();
  }
  function drawLearners() {
    const q = ($('[data-learner-search]').value || '').toLowerCase(); const rows = q ? learnerRows.filter(r => (r.name || '').toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q)) : learnerRows;
    table($('[data-table="learners"]'), rows, [
      { key: 'name', label: 'Learner', render: (v, r) => personCell(v, r.email) }, { key: 'last_seen', label: 'Last seen', render: when }, { key: 'active_days', label: 'Active days', num: true }, { key: 'views', label: 'Page views', num: true },
      { key: 'minutes', label: 'Minutes', num: true }, { key: 'lessons_read', label: 'Lessons read', num: true }, { key: 'practice', label: 'Practice', num: true }, { key: 'moodle_events', label: 'Moodle events', num: true }, { key: 'country', label: 'Country' }, { key: 'first_seen', label: 'First seen', render: when },
    ], { sort: 'last_seen', rowId: r => r.id, onRow: openLearner, empty: 'No signed-in learner activity in this range.' });
  }
  $('[data-learner-search]').addEventListener('input', drawLearners);
  $('[data-learner-close]').addEventListener('click', () => { $('[data-learner]').hidden = true; });
  async function openLearner(id) {
    const box = $('[data-learner]'); box.hidden = false; box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('[data-learner-title]').textContent = 'Loading…';
    const d = await api('learner', { ...params(), id }); const pr = d.profile || {};
    $('[data-learner-title]').textContent = (pr.name || 'Learner') + (pr.email ? ' · ' + pr.email : '');
    const methods = ['google', 'github', 'wechat', 'email_login'].filter(k => pr[k]).map(k => k.replace('_login', '')).join(', ') || 'none';
    $('[data-learner-meta]').textContent = `Account ${pr.id || id} · created ${pr.created_at ? new Date(pr.created_at * 1000).toLocaleDateString() : '?'} · sign-in: ${methods} · ${fmt(d.timeline.length)} events in range`;
    draw('learner-days', 'bar', d.days.map(x => shortDay(x.day)), [{ label: 'Page views', data: d.days.map(x => x.views) }, { label: 'Minutes', data: d.days.map(x => x.minutes) }]);
    table($('[data-table="learner-top"]'), d.top, [{ key: 'site', label: 'Site', render: siteChip }, { key: 'path', label: 'Page', cls: 'path', title: true }, { key: 'views', label: 'Views', num: true }, { key: 'minutes', label: 'Minutes', num: true }], { sort: 'views' });
    table($('[data-table="learner-timeline"]'), d.timeline, [{ key: 'ts', label: 'When', render: when }, { key: 'site', label: 'Site', render: siteChip }, { key: 'name', label: 'Event' }, { key: 'path', label: 'Page', cls: 'path', title: true }, { key: 'props', label: 'Details', cls: 'props', title: true, render: v => v === '{}' ? '' : v }, { key: 'country', label: 'Country' }], { sort: 'ts' });
  }

  async function pages() {
    const rows = await api('pages', params());
    const top = rows.slice(0, 15);
    draw('pages', 'bar', top.map(r => (r.site === 'moodle' ? 'moodle ' : '') + r.path), [{ label: 'Page views', data: top.map(r => r.views) }], { horizontal: true });
    table($('[data-table="pages"]'), rows, [{ key: 'site', label: 'Site', render: siteChip }, { key: 'path', label: 'Page', cls: 'path', title: true }, { key: 'views', label: 'Views', num: true }, { key: 'visitors', label: 'Visitors', num: true }, { key: 'learners', label: 'Learners', num: true }, { key: 'avg_seconds', label: 'Avg seconds', num: true }, { key: 'avg_scroll', label: 'Avg scroll %', num: true }, { key: 'practice', label: 'Practice', num: true }], { sort: 'views' });
  }
  async function moodle() {
    const d = await api('moodle', params());
    table($('[data-table="moodle-modules"]'), d.modules, [{ key: 'course', label: 'Course' }, { key: 'module', label: 'Area' }, { key: 'views', label: 'Views', num: true }, { key: 'visitors', label: 'Visitors', num: true }, { key: 'quiz_actions', label: 'Quiz actions', num: true }, { key: 'minutes', label: 'Minutes', num: true }], { sort: 'views', empty: 'No Moodle activity in this range yet.' });
    table($('[data-table="moodle-learners"]'), d.learners, [{ key: 'who', label: 'Learner', render: (v, r) => personCell(v, r.email) }, { key: 'moodle_id', label: 'Moodle id' }, { key: 'views', label: 'Views', num: true }, { key: 'quiz_actions', label: 'Quiz actions', num: true }, { key: 'minutes', label: 'Minutes', num: true }, { key: 'last_seen', label: 'Last seen', render: when }], { sort: 'last_seen', rowId: r => r.id, onRow: id => { state.tab = 'learners'; $$('[role="tab"]').forEach(x => x.setAttribute('aria-selected', String(x.dataset.tab === 'learners'))); $$('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== 'learners'; }); render('learners').then(() => openLearner(id)); }, empty: 'No Moodle activity in this range yet.' });
    table($('[data-table="moodle-pages"]'), d.pages, [{ key: 'course', label: 'Course' }, { key: 'module', label: 'Module' }, { key: 'path', label: 'Page', cls: 'path', title: true }, { key: 'views', label: 'Views', num: true }, { key: 'visitors', label: 'Visitors', num: true }, { key: 'quiz_actions', label: 'Quiz actions', num: true }, { key: 'avg_seconds', label: 'Avg seconds', num: true }], { sort: 'views', empty: 'No Moodle activity in this range yet.' });
  }
  async function funnel() {
    const d = await api('funnel', params()); const t = d.totals;
    const stages = [['Website visitors', t.site_visitors], ['Clicked a course promo', t.clicked_promo], ['Visited Moodle', t.visited_moodle], ['Clicked a sign-in button', t.clicked_login], ['Enrolled', t.enrolled], ['Worked on a quiz', t.did_quiz]];
    const ramp = ['--seq-700', '--seq-550', '--seq-400', '--seq-400', '--seq-250', '--seq-250'].map(css);
    draw('funnel', 'bar', stages.map(s => s[0]), [{ label: 'Browsers', data: stages.map(s => s[1]), backgroundColor: ramp, color: ramp[0] }], { horizontal: true });
    if (charts.funnel) { charts.funnel.data.datasets[0].backgroundColor = ramp; charts.funnel.update(); }
    table($('[data-table="funnel"]'), d.rows, [{ key: 'name', label: 'Learner', render: (v, r) => personCell(v, r.email) }, { key: 'promo_clicks', label: 'Promo clicks', num: true }, { key: 'moodle_views', label: 'Moodle views', num: true }, { key: 'enrolments', label: 'Enrolments', num: true }, { key: 'quiz_actions', label: 'Quiz actions', num: true }, { key: 'last_seen', label: 'Last seen', render: when }], { sort: 'quiz_actions', empty: 'Nobody has moved from the site to Moodle in this range yet.' });
  }
  let liveTimer = null;
  async function live() {
    const d = await api('live'); const host = $('[data-live-tiles]'); host.replaceChildren();
    tile(host, 'Active browsers (5 min)', fmt(d.active.visitors)); tile(host, 'Signed-in now (5 min)', fmt(d.active.learners)); tile(host, 'Events in the last hour', fmt(d.recent.length) + (d.recent.length >= 150 ? '+' : ''));
    $('[data-live-updated]').textContent = 'refreshes every 20 s · ' + new Date().toLocaleTimeString();
    table($('[data-table="live"]'), d.recent, [{ key: 'ts', label: 'When', render: ago }, { key: 'site', label: 'Site', render: siteChip }, { key: 'name', label: 'Event' }, { key: 'path', label: 'Page', cls: 'path', title: true }, { key: 'who', label: 'Who', render: (v, r) => v || r.email ? personCell(v, r.email) : el('span', 'guest · ' + (r.visitor_id || '').slice(0, 6), 'muted') }, { key: 'country', label: 'Country' }], { sort: 'ts', empty: 'No events in the last hour.' });
    clearTimeout(liveTimer); liveTimer = setTimeout(() => { if (state.tab === 'live' && document.visibilityState === 'visible') render('live'); else if (state.tab === 'live') liveTimer = setTimeout(() => render('live'), 20000); }, 20000);
  }

  /* ---- SQL console ---- */
  const EXAMPLES = [
    ['Learners with the most practice this month', "SELECT p.name, p.email, SUM(e.name IN ('run_code','answer_check','quiz_submit')) AS practice, SUM(e.name='page_view') AS views\nFROM cnr_events e JOIN people p ON p.id = e.user_id\nWHERE e.ts > (strftime('%s','now') - 30*86400) * 1000\nGROUP BY e.user_id ORDER BY practice DESC"],
    ['One learner\'s day by day (replace the email)', "SELECT date(e.ts/1000,'unixepoch') AS day, e.site, COUNT(*) AS events, GROUP_CONCAT(DISTINCT e.name) AS kinds\nFROM cnr_events e JOIN people p ON p.id = e.user_id\nWHERE p.email = 'someone@example.com' GROUP BY day, e.site ORDER BY day DESC"],
    ['Which Python pages lead to the Moodle promo click', "SELECT path, COUNT(*) AS clicks, COUNT(DISTINCT visitor_id) AS people, json_extract(props,'$.placement') AS placement\nFROM cnr_events WHERE name='moodle_promo_click' GROUP BY path, placement ORDER BY clicks DESC"],
    ['Languages people run code in', "SELECT json_extract(props,'$.lang') AS lang, COUNT(*) AS runs, COUNT(DISTINCT visitor_id) AS people\nFROM cnr_events WHERE name='run_code' GROUP BY lang ORDER BY runs DESC"],
    ['Pages where readers stay longest', "SELECT path, COUNT(*) AS visits, ROUND(AVG(json_extract(props,'$.seconds'))) AS avg_seconds, ROUND(AVG(json_extract(props,'$.scroll'))) AS avg_scroll\nFROM cnr_events WHERE name='page_engaged' GROUP BY path HAVING visits >= 3 ORDER BY avg_seconds DESC"],
    ['Signed-in share of visitors per day', "SELECT date(ts/1000,'unixepoch') AS day, COUNT(DISTINCT visitor_id) AS visitors, COUNT(DISTINCT user_id) AS learners,\n ROUND(100.0 * COUNT(DISTINCT user_id) / COUNT(DISTINCT visitor_id), 1) AS signed_in_pct\nFROM cnr_events GROUP BY day ORDER BY day DESC"],
  ];
  const examplesHost = $('[data-sql-examples]'); EXAMPLES.forEach(([label, sql]) => { const b = el('button', label); b.type = 'button'; b.addEventListener('click', () => { $('[data-sql]').value = sql; runSQL(); }); examplesHost.appendChild(b); });
  let lastRows = [];
  async function runSQL() {
    const sql = $('[data-sql]').value, st = $('[data-sql-status]'); st.textContent = 'Running…'; $('[data-sql-csv]').hidden = true;
    try { const d = await api('query', {}, { sql }); lastRows = d.rows; const cols = d.rows.length ? Object.keys(d.rows[0]).map(k => ({ key: k, label: k, num: typeof d.rows[0][k] === 'number' })) : []; table($('[data-table="sql"]'), d.rows, cols, { empty: 'The query returned no rows.' }); st.textContent = `${fmt(d.rows.length)} rows${d.truncated ? ' (capped at 1000)' : ''} · ${d.ms} ms · ${fmt(d.rows_read)} rows read`; $('[data-sql-csv]').hidden = !d.rows.length; }
    catch (e) { st.textContent = 'Error: ' + e.message; $('[data-table="sql"]').replaceChildren(); }
  }
  async function sql() { /* nothing to load until the user runs a query */ }
  $('[data-sql-run]').addEventListener('click', runSQL);
  $('[data-sql]').addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runSQL(); } });
  $('[data-sql-csv]').addEventListener('click', () => {
    if (!lastRows.length) return; const cols = Object.keys(lastRows[0]); const esc = v => { const s = v === null || v === undefined ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const csv = [cols.join(',')].concat(lastRows.map(r => cols.map(c => esc(r[c])).join(','))).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'query.csv'; a.click(); URL.revokeObjectURL(a.href);
  });

  render('overview');
})();
