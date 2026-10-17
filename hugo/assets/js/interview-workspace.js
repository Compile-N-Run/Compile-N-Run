/* Problem-page workspace, LeetCode style: the problem and its explanation in a tabbed pane on the left, a
 * CodeMirror editor on the right with the reference solution loaded, and a panel below it showing the test
 * cases and the output. Python and JavaScript run in the browser through assets/js/runner.js (Pyodide and a
 * Worker) against the problem's own tests; Java, C++ and Go can be edited here and pasted into LeetCode.
 * CodeMirror is loaded from esm.sh on demand; if that fails, a plain textarea takes its place. */
(function () {
  'use strict';
  const root = document.querySelector('[data-iv-workspace]');
  const article = document.querySelector('[data-iv-body]');
  const heading = article && article.querySelector('h2#solutions');
  if (!root || !heading) return;
  let data;
  try { data = JSON.parse(root.querySelector('[data-iv-workspace-data]').textContent); } catch (_) { return; }
  const LANGS = [['python', 'Python'], ['javascript', 'JavaScript'], ['java', 'Java'], ['cpp', 'C++'], ['go', 'Go']];
  const ENGINE = { python: 'python', javascript: 'js' };
  const INDENT = { python: '    ', javascript: '  ', java: '    ', cpp: '    ', go: '\t' };
  const ESM = 'https://esm.sh/';
  const CM_MODULES = { core: 'codemirror@6.0.1', view: '@codemirror/view@6', state: '@codemirror/state@6', commands: '@codemirror/commands@6', dark: '@codemirror/theme-one-dark@6',
    python: '@codemirror/lang-python@6', javascript: '@codemirror/lang-javascript@6', java: '@codemirror/lang-java@6', cpp: '@codemirror/lang-cpp@6', go: '@codemirror/lang-go@6' };
  const slug = root.dataset.slug, title = root.dataset.title, path = `/interview/problems/${slug}/`;
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* private mode */ } },
    remove(key) { try { localStorage.removeItem(key); } catch (_) { /* ignore */ } },
  };
  const draftKey = lang => `cnr-iv-ws:${slug}:${lang}`;
  const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; };
  const button = (className, text, onClick) => { const b = el('button', className, text); b.type = 'button'; b.addEventListener('click', onClick); return b; };
  // textContent, not innerText: innerText adds a line break per highlighted line and doubles every newline.
  const codeOf = block => block.querySelector('pre > code').textContent.replace(/ /g, ' ').replace(/\n+$/, '');

  // --- Take the solution blocks out of the article (the heading goes with them) ---
  const solutions = {};
  for (let node = heading.nextElementSibling; node && node.tagName !== 'H2';) {
    const next = node.nextElementSibling;
    const lang = Array.from(node.classList).find(c => c.startsWith('language-'));
    if (node.classList.contains('theme-code-block') && lang) solutions[lang.slice(9)] = codeOf(node);
    node.remove();
    node = next;
  }
  if (LANGS.some(([lang]) => !solutions[lang])) return;
  heading.remove();

  // --- Left pane: Problem (statement + examples), Solution (the explanation), Companies ---
  const split = root.closest('[data-iv-split]');
  const paneTabs = split.querySelector('[data-iv-pane-tabs]');
  const paneBody = split.querySelector('[data-iv-pane-body]');
  const problemSection = el('div', 'cnr-iv-pane__section');
  const solutionSection = el('div', 'cnr-iv-pane__section');
  solutionSection.hidden = true;
  let target = problemSection;
  Array.from(article.children).forEach(node => {
    if (node.tagName === 'H2' && !/^(problem|examples)$/i.test(node.id)) target = solutionSection;
    target.appendChild(node);
  });
  article.append(problemSection, solutionSection);
  const companies = paneBody.querySelector('[data-iv-pane="companies"]');
  if (companies) companies.hidden = true;
  const panes = [['problem', 'Problem', () => { problemSection.hidden = false; solutionSection.hidden = true; }],
    ['solution', 'Solution', () => { problemSection.hidden = true; solutionSection.hidden = false; }]];
  if (companies) panes.push(['companies', 'Companies', () => { problemSection.hidden = true; solutionSection.hidden = true; }]);
  const head = paneBody.querySelector('[data-iv-pane="problem"]');
  const paneButtons = panes.map(([key, label, show], i) => {
    const b = el('button', 'cnr-iv-pane__tab', label);
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.dataset.ivPaneTab = key;
    b.addEventListener('click', () => selectPane(key));
    b.addEventListener('keydown', event => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = panes[(i + step + panes.length) % panes.length][0];
      selectPane(next);
      paneButtons[panes.findIndex(p => p[0] === next)].focus();
    });
    paneTabs.appendChild(b);
    return b;
  });
  paneTabs.setAttribute('role', 'tablist');
  paneTabs.setAttribute('aria-label', 'Problem sections');
  paneTabs.hidden = false;
  function selectPane(key) {
    panes.forEach(([k, , show], i) => {
      const on = k === key;
      paneButtons[i].setAttribute('aria-selected', String(on));
      paneButtons[i].tabIndex = on ? 0 : -1;
      if (on) show();
    });
    article.hidden = key === 'companies';
    head.hidden = key === 'companies';
    if (companies) companies.hidden = key !== 'companies';
    paneBody.scrollTop = 0;
  }

  // --- Right pane: language tabs, actions, editor, bottom panel (test cases / output) ---
  const bar = el('div', 'cnr-iv-ws__bar');
  const tablist = el('div', 'cnr-iv-ws__langs');
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Language');
  const actions = el('div', 'cnr-iv-ws__actions');
  const testButton = button('cnr-iv-ws__btn cnr-iv-ws__btn--primary', '▶ Run', () => run());
  const resetMenu = el('details', 'cnr-iv-ws__menu');
  const resetSummary = el('summary', 'cnr-iv-ws__btn', 'Reset ▾');
  const resetList = el('div', 'cnr-iv-ws__menu-list');
  resetList.append(
    button('cnr-iv-ws__menu-item', 'Starter code (write it yourself)', () => replaceCode(stub(), 'starter code')),
    button('cnr-iv-ws__menu-item', 'Reference solution', () => replaceCode(solutions[lang], 'reference solution')));
  resetMenu.append(resetSummary, resetList);
  actions.append(testButton, resetMenu);
  bar.append(tablist, actions);
  const note = el('div', 'cnr-iv-ws__note');
  const editorWrap = el('div', 'cnr-iv-ws__editor');
  const panel = el('div', 'cnr-iv-ws__panel');
  const panelTabs = el('div', 'cnr-iv-ws__panel-tabs');
  panelTabs.setAttribute('role', 'tablist');
  panelTabs.setAttribute('aria-label', 'Editor panel');
  const casesTab = el('button', 'cnr-iv-ws__panel-tab', 'Test cases');
  const outputTab = el('button', 'cnr-iv-ws__panel-tab', 'Results');
  [casesTab, outputTab].forEach(t => { t.type = 'button'; t.setAttribute('role', 'tab'); panelTabs.appendChild(t); });
  const stopButton = button('cnr-iv-ws__link', 'Stop', () => { if (ui.onStop) ui.onStop(); });
  stopButton.hidden = true;
  const clearButton = button('cnr-iv-ws__link', 'Clear', () => clearOut());
  const collapseButton = button('cnr-iv-ws__link', 'Hide', () => setPanel(panelOpen ? null : 'cases'));
  panelTabs.append(el('span', 'cnr-iv-ws__panel-spacer'), stopButton, clearButton, collapseButton);
  const casesView = el('div', 'cnr-iv-ws__cases');
  const casesNote = el('p', 'cnr-iv-ws__cases-note');
  const casesCode = el('div', 'cnr-iv-ws__cases-code');
  casesView.append(casesNote, casesCode);
  const out = el('div', 'cnr-iv-ws__out');
  out.setAttribute('aria-live', 'polite');
  const status = el('div', 'cnr-iv-ws__status');
  status.hidden = true;
  const pre = el('pre', 'cnr-iv-ws__text');
  const extra = el('div', 'cnr-iv-ws__extra');
  out.append(status, pre, extra);
  panel.append(panelTabs, casesView, out);
  root.append(bar, note, editorWrap, panel);
  root.hidden = false;
  split.classList.add('cnr-iv-split--on');
  let panelOpen = 'cases';
  function setPanel(which) {
    panelOpen = which;
    casesView.hidden = which !== 'cases';
    out.hidden = which !== 'output';
    panel.classList.toggle('cnr-iv-ws__panel--collapsed', !which);
    casesTab.setAttribute('aria-selected', String(which === 'cases'));
    outputTab.setAttribute('aria-selected', String(which === 'output'));
    collapseButton.textContent = which ? 'Hide' : 'Show';
  }
  casesTab.addEventListener('click', () => setPanel('cases'));
  outputTab.addEventListener('click', () => setPanel('output'));

  // Fill the viewport below the breadcrumbs on wide screens, like an IDE; stack on narrow ones.
  function size() {
    if (window.innerWidth < 1000) { split.style.height = ''; return; }
    const top = split.getBoundingClientRect().top + window.scrollY;
    const navbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ifm-navbar-height')) || 60;
    split.style.height = `${Math.max(560, window.innerHeight - navbar - 24)}px`;
    void top;
  }
  size();
  window.addEventListener('resize', size, { passive: true });

  // --- Editor: CodeMirror when it loads, a textarea otherwise ---
  const textarea = el('textarea', 'cnr-iv-editor');
  textarea.spellcheck = false;
  textarea.setAttribute('aria-label', 'Your solution');
  textarea.setAttribute('autocapitalize', 'off');
  textarea.setAttribute('autocomplete', 'off');
  textarea.wrap = 'off';
  editorWrap.appendChild(textarea);
  let cm = null, cmCases = null, cmLangs = null, cmTheme = null, cmLang = null;
  const editor = {
    get value() { return cm ? cm.state.doc.toString() : textarea.value; },
    set value(text) {
      if (cm) cm.dispatch({ changes: { from: 0, to: cm.state.doc.length, insert: text } });
      else textarea.value = text;
    },
    focus() { (cm ? cm : textarea).focus(); },
  };
  textarea.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); if (!testButton.disabled) run(); return; }
    const start = textarea.selectionStart, end = textarea.selectionEnd, value = textarea.value;
    if (event.key === 'Tab' && !event.shiftKey && start === end) {
      event.preventDefault();
      textarea.setRangeText(INDENT[lang], start, end, 'end');
      textarea.dispatchEvent(new Event('input'));
    } else if (event.key === 'Enter' && start === end) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const line = value.slice(lineStart, start);
      const indent = (/^[ \t]*/.exec(line) || [''])[0];
      const more = /[:{([]\s*$/.test(line) ? INDENT[lang] : '';
      event.preventDefault();
      textarea.setRangeText('\n' + indent + more, start, end, 'end');
      textarea.dispatchEvent(new Event('input'));
    }
  });
  textarea.addEventListener('input', () => scheduleSave());
  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
  async function loadCodeMirror() {
    const names = Object.keys(CM_MODULES);
    const mods = await Promise.all(names.map(name => import(ESM + CM_MODULES[name])));
    const m = Object.fromEntries(names.map((name, i) => [name, mods[i]]));
    const { EditorView, basicSetup } = m.core;
    const { keymap } = m.view;
    const { Compartment, EditorState } = m.state;
    const { indentWithTab } = m.commands;
    cmLangs = { python: m.python.python(), javascript: m.javascript.javascript(), java: m.java.java(), cpp: m.cpp.cpp(), go: m.go.go() };
    cmLang = new Compartment();
    cmTheme = new Compartment();
    const themeOf = () => isDark() ? m.dark.oneDark : EditorView.theme({});
    const runKeys = keymap.of([{ key: 'Mod-Enter', run: () => { if (!testButton.disabled) run(); return true; } }, indentWithTab]);
    const current = editor.value;
    cm = new EditorView({
      doc: current,
      extensions: [basicSetup, runKeys, cmLang.of(cmLangs[lang]), cmTheme.of(themeOf()),
        EditorView.updateListener.of(update => { if (update.docChanged) scheduleSave(); }),
        EditorView.contentAttributes.of({ 'aria-label': 'Your solution' })],
      parent: editorWrap,
    });
    textarea.remove();
    cmCases = new EditorView({
      doc: casesText(),
      extensions: [basicSetup, EditorState.readOnly.of(true), EditorView.editable.of(false), cmLang.of(cmLangs[lang]), cmTheme.of(themeOf()),
        EditorView.contentAttributes.of({ 'aria-label': 'Test cases' })],
      parent: casesCode,
    });
    casesCode.querySelector('pre')?.remove();
    new MutationObserver(() => [cm, cmCases].forEach(view => view.dispatch({ effects: cmTheme.reconfigure(themeOf()) })))
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    root.classList.add('cnr-iv-ws--cm');
  }

  // --- Languages ---
  let lang = store.get('cnr-iv-lang');
  if (!LANGS.some(([l]) => l === lang)) lang = 'python';
  const tabs = LANGS.map(([l, label], i) => {
    const tab = el('button', 'cnr-iv-tab cnr-iv-ws__lang', label);
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.id = `iv-ws-tab-${l}`;
    tab.addEventListener('click', () => select(l));
    tab.addEventListener('keydown', event => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = LANGS[(i + step + LANGS.length) % LANGS.length][0];
      select(next);
      document.getElementById(`iv-ws-tab-${next}`).focus();
    });
    tablist.appendChild(tab);
    return tab;
  });
  const stub = () => data.stubs[lang] || '';
  const casesText = () => (data.tests[lang] || '').trim() + '\n';
  function select(next) {
    if (next !== lang) saveDraft();
    lang = next;
    store.set('cnr-iv-lang', lang);
    tabs.forEach((tab, i) => { const on = LANGS[i][0] === lang; tab.setAttribute('aria-selected', String(on)); tab.tabIndex = on ? 0 : -1; });
    editor.value = store.get(draftKey(lang)) ?? solutions[lang];
    const runnable = !!ENGINE[lang];
    testButton.disabled = !runnable || !window.CNRRunner;
    note.textContent = !window.CNRRunner ? 'The in-browser runner did not load.' : runnable ? 'Run executes the test cases in your browser (Ctrl+Enter). Edit the reference solution, or reset to the starter code to write your own.'
      : 'Java, C++ and Go do not run in the browser yet: edit here, then paste into LeetCode. The tests below are what CI runs.';
    casesNote.textContent = runnable ? `The checks Run executes against your ${LANGS.find(([l]) => l === lang)[1]} code; each check(actual, expected, label) call becomes one result.`
      : `The ${LANGS.find(([l]) => l === lang)[1]} test program for this problem, for reference.`;
    if (cm) {
      cm.dispatch({ effects: cmLang.reconfigure(cmLangs[lang]) });
      cmCases.dispatch({ changes: { from: 0, to: cmCases.state.doc.length, insert: casesText() }, effects: cmLang.reconfigure(cmLangs[lang]) });
    } else {
      casesCode.replaceChildren(el('pre', 'cnr-iv-ws__cases-pre', casesText()));
    }
    clearOut();
    setPanel(panelOpen || 'cases');
  }
  function replaceCode(text, what) {
    resetMenu.open = false;
    if (editor.value !== text && editor.value !== solutions[lang] && editor.value !== stub() && !confirm(`Replace your code with the ${what}?`)) return;
    editor.value = text;
    saveDraft();
    editor.focus();
  }
  const saveDraft = () => { if (editor.value === solutions[lang]) store.remove(draftKey(lang)); else store.set(draftKey(lang), editor.value); };
  let saveTimer;
  const scheduleSave = () => { clearTimeout(saveTimer); saveTimer = setTimeout(saveDraft, 300); };
  document.addEventListener('click', event => { if (resetMenu.open && !resetMenu.contains(event.target)) resetMenu.open = false; });

  // --- Output (the interface runner.js expects) ---
  const MAX_OUTPUT = 100000;
  let size_ = 0, lastText = null, sawError = false, stdoutText = '', errText = '';
  function clearOut() { pre.textContent = ''; extra.textContent = ''; status.hidden = true; size_ = 0; lastText = null; sawError = false; stdoutText = ''; errText = ''; }
  const ui = {
    onStop: null,
    stdin: () => '',
    status(text) { status.textContent = text; status.hidden = !text; },
    write(text, isErr) {
      if (!text || size_ > MAX_OUTPUT) return;
      if (isErr) { sawError = true; errText += text; } else stdoutText += text;
      size_ += text.length;
      if (size_ > MAX_OUTPUT) text = text.slice(0, Math.max(0, text.length - (size_ - MAX_OUTPUT))) + '\n[output cut off]';
      if (!lastText || lastText.err !== !!isErr) {
        const node = isErr ? el('span', 'cnr-iv-ws__err') : document.createTextNode('');
        pre.appendChild(node);
        lastText = { node, err: !!isErr };
      }
      lastText.node.textContent += text;
    },
    newline() { if (pre.textContent && !/\n$/.test(pre.textContent)) ui.write('\n'); },
    image() {}, table() {}, frame() {}, action() {},
  };

  // --- Running ---
  let runtime = null, busy = false;
  const loadRuntime = () => runtime || (runtime = fetch('/interview-runtime.json').then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).catch(err => { runtime = null; throw err; }));
  const learning = () => window.CNRLearning;
  // The tests call check(actual, expected, label); in the browser check records each call instead of stopping,
  // and the report comes back on stdout after a marker so every case can be shown with its expected and actual value.
  const MARKER = '__CNR_RESULTS__';
  function assemble(prelude) {
    const own = data.prelude[lang] || '';
    if (lang === 'python') {
      const shim = ['import json as _cnr_json', '_cnr_results = []',
        'def _cnr_short(s):', '    return s if len(s) <= 400 else s[:400] + "…"',
        'def check(actual, expected, label=""):',
        '    _cnr_results.append({"label": str(label), "expected": _cnr_short(repr(expected)), "actual": _cnr_short(repr(actual)), "ok": bool(actual == expected)})',
        'try:', `    exec(compile(${JSON.stringify(data.tests.python)}, "<tests>", "exec"), globals())`,
        'finally:', `    print("\\n" + "${MARKER}" + _cnr_json.dumps(_cnr_results), flush=True)`, ''].join('\n');
      return [prelude.python, own, editor.value, '', '# --- tests ---', shim].join('\n');
    }
    const shim = ['var process = { exitCode: 0, exit: function () { var e = new Error("process.exit() was called"); e.name = "Tests stopped"; throw e; } };',
      'var __cnr_results = [];',
      'function __cnr_short(s) { s = s === undefined ? "undefined" : s; return s.length <= 400 ? s : s.slice(0, 400) + "…"; }',
      'function check(actual, expected, label) { const a = JSON.stringify(actual), e = JSON.stringify(expected); __cnr_results.push({ label: String(label == null ? "" : label), expected: __cnr_short(e), actual: __cnr_short(a), ok: a === e }); }',
      'try {', data.tests.javascript, '} finally {', `  console.log("\\n${MARKER}" + JSON.stringify(__cnr_results));`, '}', ''].join('\n');
    return [prelude.javascript, own, editor.value, '', '// --- tests ---', shim].join('\n');
  }
  async function run() {
    if (busy || !window.CNRRunner || !ENGINE[lang]) return;
    busy = true;
    saveDraft();
    clearOut();
    setPanel('output');
    testButton.disabled = true;
    stopButton.hidden = false;
    try {
      ui.status('Loading…');
      const prelude = await loadRuntime();
      ui.status('');
      await window.CNRRunner[ENGINE[lang]](assemble(prelude), ui);
      report();
    } catch (err) {
      ui.write(`Could not run: ${err && err.message ? err.message : err}\n`, true);
    } finally {
      ui.status('');
      busy = false;
      stopButton.hidden = true;
      ui.onStop = null;
      testButton.disabled = false;
    }
  }
  function report() {
    const at = stdoutText.lastIndexOf(MARKER);
    let results = null, stdout = stdoutText;
    if (at >= 0) {
      stdout = stdoutText.slice(0, at).replace(/\n$/, '');
      try { results = JSON.parse(stdoutText.slice(at + MARKER.length).split('\n')[0]); } catch (_) { results = null; }
    }
    pre.textContent = '';
    extra.textContent = '';
    const view = el('div', 'cnr-iv-ws__results');
    const passed = results ? results.filter(r => r.ok).length : 0;
    const allPassed = !!results && results.length > 0 && passed === results.length && !sawError;
    const verdict = el('div', `cnr-iv-ws__verdict ${allPassed ? 'cnr-iv-ws__verdict--pass' : 'cnr-iv-ws__verdict--fail'}`);
    verdict.setAttribute('role', 'status');
    verdict.append(!results ? (sawError ? 'The code stopped with an error before any check ran.' : 'No test results came back.')
      : allPassed ? `All tests passed (${passed} of ${results.length} checks).`
      : sawError ? `${passed} of ${results.length} checks passed before the code stopped with an error.`
      : `Some tests failed: ${passed} of ${results.length} checks passed.`);
    let solved = false, canWrite = false;
    try { solved = !!learning().solvedAt(path); canWrite = learning().canWrite(); } catch (_) { /* no learning store */ }
    if (allPassed && canWrite && !solved) {
      verdict.appendChild(button('cnr-iv-ws__btn cnr-iv-ws__btn--primary', 'Mark as solved', () => {
        try { learning().setSolved(path, true, title); } catch (_) { return; }
        verdict.replaceChildren(`All tests passed (${passed} of ${results.length} checks). Marked as solved.`);
      }));
    } else if (allPassed && solved) verdict.append(' Already marked as solved.');
    view.appendChild(verdict);
    if (results && results.length) {
      const list = el('ol', 'cnr-iv-ws__cases-list');
      results.forEach((r, i) => {
        const item = el('li', `cnr-iv-ws__case ${r.ok ? 'cnr-iv-ws__case--pass' : 'cnr-iv-ws__case--fail'}`);
        const head = el('div', 'cnr-iv-ws__case-head');
        head.append(el('span', 'cnr-iv-ws__case-mark', r.ok ? '✓' : '✗'), el('span', 'cnr-iv-ws__case-label', r.label || `Check ${i + 1}`));
        item.appendChild(head);
        if (!r.ok) {
          const grid = el('dl', 'cnr-iv-ws__case-io');
          grid.append(el('dt', null, 'Expected'), el('dd', null, r.expected), el('dt', null, 'Actual'), el('dd', null, r.actual));
          item.appendChild(grid);
        }
        list.appendChild(item);
      });
      view.appendChild(list);
    }
    if (stdout.trim()) {
      view.appendChild(el('h4', 'cnr-iv-ws__io-title', 'Stdout'));
      view.appendChild(el('pre', 'cnr-iv-ws__io', stdout));
    }
    if (errText.trim()) {
      view.appendChild(el('h4', 'cnr-iv-ws__io-title', 'Errors'));
      const errPre = el('pre', 'cnr-iv-ws__io');
      errPre.appendChild(el('span', 'cnr-iv-ws__err', errText.replace(/\s+$/, '')));
      view.appendChild(errPre);
    }
    extra.appendChild(view);
  }

  selectPane('problem');
  select(lang);
  loadCodeMirror().catch(() => { /* the textarea stays */ });
})();
