/* Interview section: company search, problem tables (time window, filters, sorting) and solution language tabs.
 * Everything is rendered server-side first; this script only filters and reorders existing markup. */
(function () {
  'use strict';
  const norm = value => value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim();
  const debounce = (fn, ms) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; };
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* private mode */ } },
  };

  // Company directory.
  const companySearch = document.querySelector('[data-iv-company-search]');
  if (companySearch) {
    const items = Array.from(document.querySelectorAll('[data-iv-companies] li'));
    const count = document.querySelector('[data-iv-company-count]');
    const empty = document.querySelector('[data-iv-companies-empty]');
    const filter = () => {
      const q = norm(companySearch.value);
      let shown = 0;
      items.forEach(li => { const hit = !q || norm(li.dataset.name).includes(q); li.hidden = !hit; if (hit) shown++; });
      count.textContent = q ? `${shown} of ${items.length} companies` : '';
      empty.hidden = shown > 0;
    };
    companySearch.addEventListener('input', debounce(filter, 80));
    companySearch.addEventListener('keydown', event => {
      if (event.key !== 'Enter') return;
      const first = items.find(li => !li.hidden);
      if (first) location.href = first.querySelector('a').href;
    });
    filter();
  }

  // Learning integration: "solved" marks live in the learning store (assets/js/learning.js), for guests and
  // signed-in readers alike. Everything below degrades to plain links when the store is unavailable.
  const learning = () => window.CNRLearning;
  const problemPath = slug => `/interview/problems/${slug}/`;
  const canView = () => { try { return !!learning() && learning().canView(); } catch (_) { return false; } };
  const canWrite = () => { try { return !!learning() && learning().canWrite(); } catch (_) { return false; } };
  const isSolved = slug => { try { return !!learning().solvedAt(problemPath(slug)); } catch (_) { return false; } };
  const onLearningChange = fn => { ['cnr:learning-updated', 'cnr:learning-imported'].forEach(name => window.addEventListener(name, fn)); };

  // Problem tables. Rows come from the embedded JSON; the server-rendered first rows are replaced on load.
  // Row: [slug, number, title, difficulty, topics, frequencies (or null), written, companies, premium].
  const PAGE = 100;
  const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; };
  function link(href, text, className, external) {
    const a = el('a', className, text);
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
  }
  function solveButton(slug, label, onChange) {
    const button = el('button', 'cnr-iv-solve-toggle', '✓');
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      if (!canWrite()) return;
      const next = !isSolved(slug);
      const ok = learning().setSolved(problemPath(slug), next, label);
      if (ok !== false) onChange(next);
    });
    return button;
  }
  function syncSolveButton(button, slug, label, solved) {
    button.setAttribute('aria-pressed', String(solved));
    button.disabled = !canWrite();
    button.setAttribute('aria-label', (solved ? 'Solved: ' : 'Mark as solved: ') + label);
    button.title = solved ? 'Solved. Click to unmark.' : 'Mark as solved';
  }
  document.querySelectorAll('[data-iv-list]').forEach(list => {
    const mode = list.dataset.ivMode, ranking = mode === 'ranking', catalog = mode === 'catalog';
    const table = list.querySelector('table');
    const body = list.querySelector('[data-iv-rows]');
    let data;
    try { data = JSON.parse(list.querySelector('[data-iv-data]').textContent); } catch (_) { return; }
    const rows = data.map(([slug, number, title, difficulty, topics, freq, written, companies, paid], index) => ({
      slug, number, title, label: `${number}. ${title}`, search: norm(title), difficulty, topics: topics || [], freq: freq || {},
      written: written === 1, companies, paid: paid === 1, index, tr: null, solved: false,
    }));
    const tabs = Array.from(list.querySelectorAll('[data-iv-window]'));
    const search = list.querySelector('[data-iv-search]');
    const difficulty = list.querySelector('[data-iv-difficulty]');
    const topic = list.querySelector('[data-iv-topic]');
    const status = list.querySelector('[data-iv-status]');
    const count = list.querySelector('[data-iv-count]');
    const empty = list.querySelector('[data-iv-empty]');
    const more = list.querySelector('[data-iv-more]');
    const topicCounts = new Map();
    rows.forEach(r => r.topics.forEach(t => topicCounts.set(t, (topicCounts.get(t) || 0) + 1)));
    Array.from(topicCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).forEach(([name, n]) => topic.add(new Option(`${name} (${n})`, name)));
    const params = new URLSearchParams(location.search);
    let windowKey = tabs.some(t => t.dataset.ivWindow === params.get('window')) ? params.get('window') : (tabs[0] ? tabs[0].dataset.ivWindow : 'all');
    if (['Easy', 'Medium', 'Hard'].includes(params.get('difficulty'))) difficulty.value = params.get('difficulty');
    if (['explained', 'unexplained', 'solved', 'unsolved'].includes(params.get('status'))) status.value = params.get('status');
    let limit = PAGE, visible = [];
    const freqOf = r => catalog ? 0 : r.freq[windowKey];
    const inWindow = r => catalog || r.freq[windowKey] !== undefined;

    function buildRow(r) {
      const tr = el('tr');
      const solution = problemPath(r.slug), leetcode = `https://leetcode.com/problems/${r.slug}/`;
      const title = el('td', 'cnr-iv-title');
      title.appendChild(r.written ? link(solution, r.label) : link(leetcode, r.label, '', true));
      if (r.paid) title.append(' ', el('span', 'cnr-iv-tag', 'Premium'));
      title.append(' ', el('span', `cnr-iv-diff cnr-iv-diff--${r.difficulty.toLowerCase()} cnr-iv-diff-inline`, r.difficulty));
      const diff = el('td', 'cnr-iv-diff-col');
      diff.appendChild(el('span', `cnr-iv-diff cnr-iv-diff--${r.difficulty.toLowerCase()}`, r.difficulty));
      r.num = el('td', 'cnr-iv-num');
      tr.append(r.num, title, diff, el('td', 'cnr-iv-topics-col', r.topics.slice(0, 3).join(', ')));
      if (!catalog && !ranking) { /* company: no companies column */ } else tr.appendChild(el('td', 'cnr-iv-companies-col', String(r.companies)));
      if (catalog) {
        const cell = el('td');
        cell.appendChild(r.written ? el('span', 'cnr-iv-status cnr-iv-status--yes', 'Explained') : el('span', 'cnr-iv-status', 'Not yet'));
        tr.appendChild(cell);
      } else {
        const freq = el('td', 'cnr-iv-freq');
        const bar = el('span', 'cnr-iv-bar');
        r.bar = bar.appendChild(el('span'));
        r.value = el('span');
        freq.append(bar, r.value);
        tr.appendChild(freq);
      }
      const solvedCell = el('td', 'cnr-iv-solved-col');
      r.button = solveButton(r.slug, r.label, next => { r.solved = next; syncSolveButton(r.button, r.slug, r.label, next); tr.classList.toggle('cnr-iv-row--solved', next); updateCount(); });
      solvedCell.appendChild(r.button);
      tr.appendChild(solvedCell);
      const links = el('td', 'cnr-iv-links');
      if (r.written) links.appendChild(link(solution, 'Solution', 'cnr-iv-solution'));
      const lc = link(leetcode, 'LeetCode ↗', 'cnr-iv-lc', true);
      lc.setAttribute('aria-label', `${r.label} on LeetCode (opens in a new tab)`);
      links.appendChild(lc);
      tr.appendChild(links);
      return tr;
    }
    function refreshSolved() {
      const available = canView();
      table.classList.toggle('cnr-iv-table--nosolve', !available);
      rows.forEach(r => { r.solved = available && isSolved(r.slug); });
    }
    function updateCount() {
      const solved = visible.filter(r => r.solved).length;
      count.textContent = `${visible.length} ${visible.length === 1 ? 'problem' : 'problems'}` + (canView() && solved ? ` · ${solved} solved` : '');
    }
    function filter() {
      refreshSolved();
      const q = norm(search.value), d = difficulty.value, t = topic.value, st = status.value, digits = /^#?\d+$/.test(q) ? q.replace('#', '') : '';
      visible = rows.filter(r => inWindow(r) && (!d || r.difficulty === d) && (!t || r.topics.includes(t)) &&
        (!st || (st === 'explained' ? r.written : st === 'unexplained' ? !r.written : st === 'solved' ? r.solved : !r.solved)) &&
        (!q || (digits ? String(r.number).startsWith(digits) : r.search.includes(q) || r.topics.some(x => norm(x).includes(q)))));
      if (digits) visible.sort((a, b) => (String(a.number) === digits ? -1 : String(b.number) === digits ? 1 : 0) || a.number - b.number);
      else if (catalog) visible.sort((a, b) => a.number - b.number);
      else visible.sort((a, b) => freqOf(b) - freqOf(a) || a.index - b.index);
      limit = PAGE;
      render();
    }
    function render() {
      const max = catalog ? 1 : visible.reduce((m, r) => Math.max(m, freqOf(r)), 0) || 1;
      const fragment = document.createDocumentFragment();
      visible.slice(0, limit).forEach((r, i) => {
        if (!r.tr) r.tr = buildRow(r);
        r.num.textContent = catalog ? String(r.number) : String(i + 1);
        if (!catalog) {
          const f = freqOf(r);
          r.bar.style.width = `${Math.max(2, (ranking ? f / max : f / 100) * 100)}%`;
          r.value.textContent = ranking ? f.toFixed(1) : String(Math.round(f));
        }
        syncSolveButton(r.button, r.slug, r.label, r.solved);
        r.tr.classList.toggle('cnr-iv-row--solved', r.solved);
        fragment.appendChild(r.tr);
      });
      body.replaceChildren(fragment);
      tabs.forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.ivWindow === windowKey)));
      updateCount();
      empty.hidden = visible.length > 0;
      const left = visible.length - limit;
      more.hidden = left <= 0;
      more.textContent = `Show ${Math.min(PAGE, left)} more (${left} left)`;
    }
    function remember() {
      const next = new URLSearchParams(location.search);
      !tabs[0] || windowKey === tabs[0].dataset.ivWindow ? next.delete('window') : next.set('window', windowKey);
      difficulty.value ? next.set('difficulty', difficulty.value) : next.delete('difficulty');
      status.value ? next.set('status', status.value) : next.delete('status');
      const query = next.toString();
      history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => { windowKey = tab.dataset.ivWindow; filter(); remember(); });
      tab.addEventListener('keydown', event => {
        const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        const next = tabs[(i + step + tabs.length) % tabs.length];
        next.focus(); next.click();
      });
    });
    search.addEventListener('input', debounce(filter, 120));
    [difficulty, topic, status].forEach(control => control.addEventListener('change', () => { filter(); remember(); }));
    more.addEventListener('click', () => {
      const firstNew = visible[limit];
      limit += PAGE;
      render();
      firstNew?.tr?.querySelector('a')?.focus();
    });
    onLearningChange(filter);
    filter();
  });

  // Catalog header: your solved total.
  const solvedSummary = document.querySelector('[data-iv-solved-summary]');
  if (solvedSummary) {
    const initial = solvedSummary.textContent;
    const update = () => {
      if (!canView()) { solvedSummary.textContent = initial; return; }
      let solved = [];
      try { solved = learning().solvedProblems(); } catch (_) { solved = []; }
      solvedSummary.replaceChildren();
      if (!solved.length) { solvedSummary.textContent = 'Mark problems as solved with the ✓ buttons to track your own progress here. Guest progress stays in this browser; signed-in progress syncs across devices.'; return; }
      solvedSummary.append(`You have solved ${solved.length} ${solved.length === 1 ? 'problem' : 'problems'}. `, link('/learn/', 'See them in My learning'));
    };
    onLearningChange(update);
    update();
  }

  // Problem page: "Mark as solved".
  const widget = document.querySelector('[data-iv-solve-widget]');
  if (widget) {
    const slug = widget.dataset.slug, label = widget.dataset.title;
    const toggle = widget.querySelector('[data-iv-solve-toggle]');
    const statusText = widget.querySelector('[data-iv-solve-status]');
    const render = () => {
      widget.hidden = !canView();
      if (widget.hidden) return;
      let at = 0;
      try { at = learning().solvedAt(problemPath(slug)); } catch (_) { at = 0; }
      toggle.setAttribute('aria-pressed', String(!!at));
      toggle.textContent = at ? '✓ Solved' : 'Mark as solved';
      toggle.disabled = !canWrite();
      statusText.textContent = at ? `Solved on ${new Date(at).toLocaleDateString()}. Click again to unmark.` : 'Tracked in My learning; guests keep it in this browser.';
    };
    toggle.addEventListener('click', () => {
      if (!canWrite()) return;
      let at = 0;
      try { at = learning().solvedAt(problemPath(slug)); } catch (_) { at = 0; }
      learning().setSolved(problemPath(slug), !at, label);
      render();
    });
    onLearningChange(render);
    render();
  }

  // Solution tabs: the code blocks after "## Solutions" become one tabbed panel.
  const LABELS = { python: 'Python', java: 'Java', cpp: 'C++', javascript: 'JavaScript', go: 'Go' };
  const articleBody = document.querySelector('[data-iv-body]');
  const heading = articleBody && articleBody.querySelector('h2#solutions');
  if (heading) {
    const blocks = [];
    for (let node = heading.nextElementSibling; node && node.tagName !== 'H2'; node = node.nextElementSibling) {
      const lang = Array.from(node.classList).find(c => c.startsWith('language-'));
      if (node.classList.contains('theme-code-block') && lang) blocks.push({ node, lang: lang.slice(9) });
    }
    if (blocks.length > 1) {
      const wrap = document.createElement('div');
      wrap.className = 'cnr-iv-solutions';
      const tablist = document.createElement('div');
      tablist.className = 'cnr-iv-tabs cnr-iv-tabs--code';
      tablist.setAttribute('role', 'tablist');
      tablist.setAttribute('aria-label', 'Solution language');
      heading.after(wrap);
      wrap.appendChild(tablist);
      const buttons = blocks.map(({ node, lang }, i) => {
        const id = `iv-solution-${lang}`;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cnr-iv-tab';
        button.setAttribute('role', 'tab');
        button.id = id + '-tab';
        button.setAttribute('aria-controls', id);
        button.textContent = LABELS[lang] || lang;
        tablist.appendChild(button);
        node.id = id;
        node.setAttribute('role', 'tabpanel');
        node.setAttribute('aria-labelledby', button.id);
        wrap.appendChild(node);
        button.addEventListener('click', () => select(lang, true));
        button.addEventListener('keydown', event => {
          const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
          if (!step) return;
          event.preventDefault();
          const next = blocks[(i + step + blocks.length) % blocks.length];
          select(next.lang, true);
          document.getElementById(`iv-solution-${next.lang}-tab`).focus();
        });
        return button;
      });
      function select(lang, save) {
        if (!blocks.some(b => b.lang === lang)) lang = blocks[0].lang;
        blocks.forEach(({ node, lang: l }, i) => {
          const on = l === lang;
          node.hidden = !on;
          buttons[i].setAttribute('aria-selected', String(on));
          buttons[i].tabIndex = on ? 0 : -1;
        });
        if (save) store.set('cnr-iv-lang', lang);
      }
      select(store.get('cnr-iv-lang') || 'python', false);
    }
  }

  const showAll = document.querySelector('[data-iv-show-all]');
  if (showAll) showAll.addEventListener('click', () => {
    document.querySelectorAll('[data-iv-extra]').forEach(li => { li.hidden = false; });
    showAll.remove();
  });
})();
