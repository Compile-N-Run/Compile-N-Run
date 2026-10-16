/* Problem-page workspace: an editor beside the write-up where readers solve the problem themselves.
 * Python and JavaScript run in the browser through assets/js/runner.js (Pyodide and a Worker) against the
 * problem's own tests; Java, C++ and Go can be written here and pasted into LeetCode. The five solution blocks
 * move out of the article into the editor's "Solution" view, so the idea and the code sit side by side. */
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
  const slug = root.dataset.slug, title = root.dataset.title, path = `/interview/problems/${slug}/`;
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* private mode */ } },
    remove(key) { try { localStorage.removeItem(key); } catch (_) { /* ignore */ } },
  };
  const draftKey = lang => `cnr-iv-ws:${slug}:${lang}`;

  // Take the solution blocks out of the article (the heading goes with them).
  const solutions = {};
  for (let node = heading.nextElementSibling; node && node.tagName !== 'H2';) {
    const next = node.nextElementSibling;
    const lang = Array.from(node.classList).find(c => c.startsWith('language-'));
    if (node.classList.contains('theme-code-block') && lang) solutions[lang.slice(9)] = node;
    node = next;
  }
  if (LANGS.some(([lang]) => !solutions[lang])) return;
  heading.remove();
  LANGS.forEach(([lang]) => solutions[lang].remove());

  const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; };
  const button = (className, text, onClick) => { const b = el('button', className, text); b.type = 'button'; b.addEventListener('click', onClick); return b; };

  // --- Markup ---
  const tablist = el('div', 'cnr-iv-tabs cnr-iv-tabs--code cnr-iv-ws__tabs');
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Language');
  const toolbar = el('div', 'cnr-iv-ws__bar');
  const runButton = button('cnr-iv-ws__run', '▶ Run', () => run(false));
  const testButton = button('cnr-iv-ws__run cnr-iv-ws__run--tests', '✓ Run tests', () => run(true));
  const solutionButton = button('cnr-iv-ws__btn', 'Solution', () => showSolution(!showingSolution));
  solutionButton.setAttribute('aria-pressed', 'false');
  const resetButton = button('cnr-iv-ws__btn', 'Reset', () => {
    if (editor.value !== stub() && !confirm('Replace your code with the starter code?')) return;
    editor.value = stub();
    store.remove(draftKey(lang));
    editor.focus();
  });
  const note = el('span', 'cnr-iv-ws__note');
  toolbar.append(runButton, testButton, solutionButton, resetButton, note);
  const editorWrap = el('div', 'cnr-iv-ws__editor');
  const editor = el('textarea', 'cnr-iv-editor');
  editor.spellcheck = false;
  editor.setAttribute('aria-label', 'Your solution');
  editor.setAttribute('autocapitalize', 'off');
  editor.setAttribute('autocomplete', 'off');
  editor.wrap = 'off';
  editorWrap.appendChild(editor);
  const solutionView = el('div', 'cnr-iv-ws__solution');
  solutionView.hidden = true;
  const solutionBar = el('div', 'cnr-iv-ws__solution-bar');
  solutionBar.append(el('span', null, 'Reference solution'),
    button('cnr-iv-ws__btn', 'Load into editor', () => {
      if (editor.value.trim() && editor.value !== stub() && !confirm('Replace your code with the reference solution?')) return;
      editor.value = codeOf(solutions[lang]);
      saveDraft();
      showSolution(false);
      editor.focus();
    }),
    button('cnr-iv-ws__btn', 'Back to editor', () => showSolution(false)));
  const solutionBody = el('div', 'cnr-iv-ws__solution-body');
  solutionView.append(solutionBar, solutionBody);
  const out = el('div', 'cnr-iv-ws__out');
  out.hidden = true;
  const outHead = el('div', 'cnr-iv-ws__out-head');
  const outTitle = el('span', null, 'Output');
  const stopButton = button('cnr-iv-ws__link', 'Stop', () => { if (ui.onStop) ui.onStop(); });
  stopButton.hidden = true;
  const clearButton = button('cnr-iv-ws__link', 'Clear', () => clearOut());
  outHead.append(outTitle, stopButton, clearButton);
  const status = el('div', 'cnr-iv-ws__status');
  status.hidden = true;
  const pre = el('pre', 'cnr-iv-ws__text');
  const extra = el('div', 'cnr-iv-ws__extra');
  out.setAttribute('aria-live', 'polite');
  out.append(outHead, status, pre, extra);
  root.append(tablist, toolbar, editorWrap, solutionView, out);
  root.hidden = false;
  root.closest('[data-iv-split]').classList.add('cnr-iv-split--on');

  // --- Languages ---
  let lang = store.get('cnr-iv-lang');
  if (!LANGS.some(([l]) => l === lang)) lang = 'python';
  let showingSolution = false;
  const tabs = LANGS.map(([l, label], i) => {
    const tab = el('button', 'cnr-iv-tab', label);
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
  const codeOf = block => block.querySelector('pre > code').innerText.replace(/ /g, ' ').replace(/\n$/, '');
  function select(next) {
    if (next !== lang) saveDraft();
    lang = next;
    store.set('cnr-iv-lang', lang);
    tabs.forEach((tab, i) => { const on = LANGS[i][0] === lang; tab.setAttribute('aria-selected', String(on)); tab.tabIndex = on ? 0 : -1; });
    editor.value = store.get(draftKey(lang)) ?? stub();
    const runnable = !!ENGINE[lang];
    runButton.disabled = testButton.disabled = !runnable || !window.CNRRunner;
    note.textContent = !window.CNRRunner ? 'The in-browser runner did not load.' : runnable ? 'Runs in your browser' : 'Write here, then paste into LeetCode: Java, C++ and Go do not run in the browser yet.';
    solutionBody.replaceChildren(solutions[lang]);
    clearOut();
  }
  function showSolution(on) {
    showingSolution = on;
    solutionButton.setAttribute('aria-pressed', String(on));
    solutionButton.textContent = on ? 'Hide solution' : 'Solution';
    editorWrap.hidden = on;
    solutionView.hidden = !on;
  }
  const saveDraft = () => { if (editor.value === stub()) store.remove(draftKey(lang)); else store.set(draftKey(lang), editor.value); };
  let saveTimer;
  editor.addEventListener('input', () => { clearTimeout(saveTimer); saveTimer = setTimeout(saveDraft, 300); });

  // Tab indents, Enter keeps the indentation (and adds one level after ':' or '{'), Ctrl/Cmd+Enter runs the tests.
  editor.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); if (!testButton.disabled) run(true); return; }
    const start = editor.selectionStart, end = editor.selectionEnd, value = editor.value;
    if (event.key === 'Tab' && !event.shiftKey && start === end) {
      event.preventDefault();
      editor.setRangeText(INDENT[lang], start, end, 'end');
      editor.dispatchEvent(new Event('input'));
    } else if (event.key === 'Enter' && start === end) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const line = value.slice(lineStart, start);
      const indent = (/^[ \t]*/.exec(line) || [''])[0];
      const more = /[:{([]\s*$/.test(line) ? INDENT[lang] : '';
      event.preventDefault();
      editor.setRangeText('\n' + indent + more, start, end, 'end');
      editor.dispatchEvent(new Event('input'));
    }
  });

  // --- Output panel (the same interface runner.js gives its own blocks) ---
  const MAX_OUTPUT = 100000;
  let size = 0, lastText = null, sawError = false;
  function clearOut() { out.hidden = true; pre.textContent = ''; extra.textContent = ''; status.hidden = true; size = 0; lastText = null; sawError = false; }
  const ui = {
    onStop: null,
    stdin: () => '',
    status(text) { status.textContent = text; status.hidden = !text; },
    write(text, isErr) {
      if (!text || size > MAX_OUTPUT) return;
      if (isErr) sawError = true;
      size += text.length;
      if (size > MAX_OUTPUT) text = text.slice(0, Math.max(0, text.length - (size - MAX_OUTPUT))) + '\n[output cut off]';
      if (!lastText || lastText.err !== !!isErr) {
        const node = isErr ? el('span', 'cnr-iv-ws__err') : document.createTextNode('');
        pre.appendChild(node);
        lastText = { node, err: !!isErr };
      }
      lastText.node.textContent += text;
    },
    newline() { if (pre.textContent && !/\n$/.test(pre.textContent)) ui.write('\n'); },
    image() {},
    table() {},
    frame() {},
    action() {},
  };

  // --- Running ---
  let runtime = null, busy = false;
  const loadRuntime = () => runtime || (runtime = fetch('/interview-runtime.json').then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).catch(err => { runtime = null; throw err; }));
  const learning = () => window.CNRLearning;
  function assemble(prelude, tests) {
    const own = data.prelude[lang] || '';
    if (lang === 'python') {
      return [prelude.python, own, editor.value].join('\n') + (tests ? `\n\n# --- tests ---\n${data.tests.python}\nprint("All tests passed.")\n` : '\n');
    }
    const shim = 'var process = { exitCode: 0, exit: function () { var e = new Error("stopped at the first failing check"); e.name = "Tests failed"; throw e; } };\n';
    return [prelude.javascript, own, editor.value].join('\n') + (tests ? `\n\n// --- tests ---\n${shim}${data.tests.javascript}\nconsole.log("All tests passed.");\n` : '\n');
  }
  async function run(tests) {
    if (busy || !window.CNRRunner || !ENGINE[lang]) return;
    busy = true;
    saveDraft();
    clearOut();
    out.hidden = false;
    outTitle.textContent = tests ? 'Test results' : 'Output';
    [runButton, testButton].forEach(b => { b.disabled = true; });
    stopButton.hidden = false;
    let prelude;
    try {
      ui.status('Loading…');
      prelude = await loadRuntime();
      ui.status('');
      await window.CNRRunner[ENGINE[lang]](assemble(prelude, tests), ui);
      if (!pre.textContent) ui.write('(no output)\n');
      if (tests) finishTests(!sawError);
    } catch (err) {
      ui.write(`Could not run: ${err && err.message ? err.message : err}\n`, true);
    } finally {
      ui.status('');
      busy = false;
      stopButton.hidden = true;
      ui.onStop = null;
      [runButton, testButton].forEach(b => { b.disabled = false; });
    }
  }
  function finishTests(passed) {
    const banner = el('div', `cnr-iv-ws__verdict ${passed ? 'cnr-iv-ws__verdict--pass' : 'cnr-iv-ws__verdict--fail'}`);
    banner.setAttribute('role', 'status');
    banner.append(passed ? 'All tests passed. ' : 'Some tests failed. Read the first failure above, fix the code and run the tests again.');
    let solved = false, canWrite = false;
    try { solved = !!learning().solvedAt(path); canWrite = learning().canWrite(); } catch (_) { /* no learning store */ }
    if (passed && canWrite && !solved) {
      banner.appendChild(button('cnr-iv-ws__btn cnr-iv-ws__btn--primary', 'Mark as solved', () => {
        try { learning().setSolved(path, true, title); } catch (_) { return; }
        banner.replaceChildren('All tests passed. Marked as solved.');
      }));
    } else if (passed && solved) banner.append('Already marked as solved.');
    extra.prepend(banner);
  }

  select(lang);
  showSolution(false);
})();
