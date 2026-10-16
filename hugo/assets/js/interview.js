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

  // Problem tables. Rows come from the embedded JSON; the server-rendered first rows are replaced on load.
  const PAGE = 100;
  const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; };
  function link(href, text, className, external) {
    const a = el('a', className, text);
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
  }
  document.querySelectorAll('[data-iv-list]').forEach(list => {
    const ranking = list.dataset.ivMode === 'ranking';
    const body = list.querySelector('[data-iv-rows]');
    let data;
    try { data = JSON.parse(list.querySelector('[data-iv-data]').textContent); } catch (_) { return; }
    const rows = data.map(([slug, title, difficulty, topics, freq, written, companies], index) => ({
      slug, title, search: norm(title), difficulty, topics: topics || [], freq, written: written === 1, companies, index, tr: null,
    }));
    const tabs = Array.from(list.querySelectorAll('[data-iv-window]'));
    const search = list.querySelector('[data-iv-search]');
    const difficulty = list.querySelector('[data-iv-difficulty]');
    const topic = list.querySelector('[data-iv-topic]');
    const writtenOnly = list.querySelector('[data-iv-written]');
    const count = list.querySelector('[data-iv-count]');
    const empty = list.querySelector('[data-iv-empty]');
    const more = list.querySelector('[data-iv-more]');
    const topicCounts = new Map();
    rows.forEach(r => r.topics.forEach(t => topicCounts.set(t, (topicCounts.get(t) || 0) + 1)));
    Array.from(topicCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).forEach(([name, n]) => topic.add(new Option(`${name} (${n})`, name)));
    if (!rows.some(r => r.written)) writtenOnly.closest('label').hidden = true;
    const params = new URLSearchParams(location.search);
    let windowKey = tabs.some(t => t.dataset.ivWindow === params.get('window')) ? params.get('window') : tabs[0].dataset.ivWindow;
    if (['Easy', 'Medium', 'Hard'].includes(params.get('difficulty'))) difficulty.value = params.get('difficulty');
    let limit = PAGE, visible = [];

    function buildRow(r) {
      const tr = el('tr');
      const solution = `/interview/problems/${r.slug}/`, leetcode = `https://leetcode.com/problems/${r.slug}/`;
      const title = el('td', 'cnr-iv-title');
      title.appendChild(r.written ? link(solution, r.title) : link(leetcode, r.title, '', true));
      title.append(' ', el('span', `cnr-iv-diff cnr-iv-diff--${r.difficulty.toLowerCase()} cnr-iv-diff-inline`, r.difficulty));
      const diff = el('td', 'cnr-iv-diff-col');
      diff.appendChild(el('span', `cnr-iv-diff cnr-iv-diff--${r.difficulty.toLowerCase()}`, r.difficulty));
      const freq = el('td', 'cnr-iv-freq');
      const bar = el('span', 'cnr-iv-bar');
      r.bar = bar.appendChild(el('span'));
      r.value = el('span');
      freq.append(bar, r.value);
      const links = el('td', 'cnr-iv-links');
      if (r.written) links.appendChild(link(solution, 'Solution', 'cnr-iv-solution'));
      const lc = link(leetcode, 'LeetCode ↗', 'cnr-iv-lc', true);
      lc.setAttribute('aria-label', `${r.title} on LeetCode (opens in a new tab)`);
      links.appendChild(lc);
      r.num = el('td', 'cnr-iv-num');
      tr.append(r.num, title, diff, el('td', 'cnr-iv-topics-col', r.topics.slice(0, 3).join(', ')));
      if (ranking) tr.appendChild(el('td', 'cnr-iv-companies-col', String(r.companies)));
      tr.append(freq, links);
      return tr;
    }
    function filter() {
      const q = norm(search.value), d = difficulty.value, t = topic.value, w = writtenOnly.checked;
      visible = rows.filter(r => r.freq[windowKey] !== undefined && (!d || r.difficulty === d) && (!t || r.topics.includes(t)) && (!w || r.written) &&
        (!q || r.search.includes(q) || r.topics.some(x => norm(x).includes(q))));
      visible.sort((a, b) => b.freq[windowKey] - a.freq[windowKey] || a.index - b.index);
      limit = PAGE;
      render();
    }
    function render() {
      const max = visible.reduce((m, r) => Math.max(m, r.freq[windowKey]), 0) || 1;
      const fragment = document.createDocumentFragment();
      visible.slice(0, limit).forEach((r, i) => {
        if (!r.tr) r.tr = buildRow(r);
        const f = r.freq[windowKey];
        r.num.textContent = i + 1;
        r.bar.style.width = `${Math.max(2, (ranking ? f / max : f / 100) * 100)}%`;
        r.value.textContent = ranking ? f.toFixed(1) : String(Math.round(f));
        fragment.appendChild(r.tr);
      });
      body.replaceChildren(fragment);
      tabs.forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.ivWindow === windowKey)));
      count.textContent = `${visible.length} ${visible.length === 1 ? 'problem' : 'problems'}`;
      empty.hidden = visible.length > 0;
      const left = visible.length - limit;
      more.hidden = left <= 0;
      more.textContent = `Show ${Math.min(PAGE, left)} more (${left} left)`;
    }
    function remember() {
      const next = new URLSearchParams(location.search);
      windowKey === tabs[0].dataset.ivWindow ? next.delete('window') : next.set('window', windowKey);
      difficulty.value ? next.set('difficulty', difficulty.value) : next.delete('difficulty');
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
    [difficulty, topic, writtenOnly].forEach(control => control.addEventListener('change', () => { filter(); remember(); }));
    more.addEventListener('click', () => {
      const firstNew = visible[limit];
      limit += PAGE;
      render();
      firstNew?.tr?.querySelector('a')?.focus();
    });
    filter();
  });

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
