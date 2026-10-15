/* Run buttons for Python, JavaScript and SQL examples. Everything runs in the reader's browser:
   Python on Pyodide and JavaScript in Web Workers (so Stop can end an endless loop), SQL on SQLite (sql.js),
   or on PostgreSQL (PGlite) in the PostgreSQL tutorial. Loaded only on pages with such code blocks. */
(function () {
  var PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.29.5/full/';
  var SQLJS = 'https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/';
  var PGLITE = 'https://cdn.jsdelivr.net/npm/@electric-sql/pglite@0.5.8/dist/index.js';
  var JS_TIMEOUT = 10000;
  var MAX_OUTPUT = 100000;
  var MAX_ROWS = 200;
  var path = location.pathname;

  /* ---------- Which blocks get a Run button ---------- */
  var LANGS = { python: 'python', py: 'python', python3: 'python', javascript: 'js', js: 'js', sql: 'sql' };
  var SQL_PAGES = /^\/docs\/(language\/sql|database\/(postgresql|mysql)|fundamental\/(database|interview))\//;
  var postgres = /^\/docs\/database\/postgresql\//.test(path);
  var mysql = /^\/docs\/database\/mysql\//.test(path);
  // Things the in-browser runtimes cannot do: servers, frameworks, GPUs, sockets, threads, other processes.
  var PY_NO = /^\s*(?:from|import)\s+(?:flask|django|fastapi|starlette|uvicorn|gunicorn|celery|airflow|torch|torchvision|tensorflow|keras|transformers|langchain\w*|openai|anthropic|boto3|botocore|socket|socketserver|multiprocessing|threading|concurrent|subprocess|tkinter|turtle|pygame|selenium|playwright|scrapy|requests|httpx|aiohttp|urllib3|psycopg2?|pymysql|mysql|pymongo|redis|kafka|confluent_kafka|pika|grpc|paramiko|docker|kubernetes|streamlit|gradio|dash|discord|telegram|smtplib|ftplib|http\.server|wsgiref|asyncpg|motor|sqlalchemy|alembic|pyspark|ray|dask)\b/m;
  var JS_NO = /\brequire\s*\(|^\s*(?:import|export)\s|\b(?:document|window|process|module|localStorage|sessionStorage|navigator)\.|\b(?:alert|prompt|confirm|fetch)\s*\(|\$\(|<\/?[A-Za-z][\w.-]*[\s/>]|\baddEventListener\b|\bXMLHttpRequest\b/m;
  var SQL_NO = /^\s*(?:mysql>|postgres=?[#>]|\w+=[#>]|psql\b|\\|\+-|\||DELIMITER\b|SOURCE\b)|\bCREATE\s+(?:OR\s+REPLACE\s+)?(?:DATABASE|SCHEMA|USER|ROLE)\b|\b(?:GRANT|REVOKE|FLUSH|SHOW|COPY)\s|^\s*USE\s+\w+|\bLOAD\s+DATA\b|\bpg_dump\b/im;

  // Blocks the runtime can execute at all; earlier ones may be run first to set up later ones.
  function candidate(kind, code) {
    if (/^\s*(?:>>>|\$ |PS>|C:\\)/m.test(code)) return false; // shell or REPL transcripts
    if (kind === 'python') return !PY_NO.test(code);
    if (kind === 'js') return !JS_NO.test(code);
    if (kind === 'sql') {
      if (!SQL_PAGES.test(path) || SQL_NO.test(code)) return false;
      // Syntax templates such as "SELECT column1, ... FROM table_name WHERE condition;"
      if (/\.\.\.|…|\b(?:column_?\d|column_name|table_name|condition)\b|<\w+>|\[\s*(?:WHERE|AND|OR|ORDER|LIMIT|AS|NOT|ASC|DESC|,)/i.test(code)) return false;
      if (!postgres && /\$\$|\bLANGUAGE\s+plpgsql\b|\bCREATE\s+(?:OR\s+REPLACE\s+)?(?:PROCEDURE|FUNCTION)\b/i.test(code)) return false;
      return /\b(?:SELECT|INSERT|UPDATE|DELETE|CREATE|WITH|ALTER|DROP)\b/i.test(code);
    }
    return false;
  }
  // Blocks worth a Run button: they show something.
  function runnable(kind, code) {
    if (!candidate(kind, code)) return false;
    // Output calls inside comments do not count.
    code = kind === 'js' ? code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
      : kind === 'python' ? code.replace(/^\s*#.*$/gm, '') : code;
    if (kind === 'js') return /\bconsole\.(?:log|info|table|error|warn)\s*\(/.test(code);
    if (kind === 'python') {
      if (/\bprint\s*\(|\bplt\.(?:show|plot|savefig)\s*\(/.test(code)) return true;
      // A bare expression on the last line (df.head(), result), shown like in a notebook.
      var lines = code.replace(/\s+$/, '').split('\n').filter(function (l) { return l.trim() && !/^\s*#/.test(l); });
      var last = lines[lines.length - 1] || '';
      return /^[A-Za-z_][\w.]*(?:\(.*\)|\[.*\])*\s*$/.test(last) && !/^(?:pass|break|continue|return|raise|del|global|nonlocal|else|try|finally)\b/.test(last);
    }
    return true;
  }

  /* ---------- Small DOM helpers ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function loadScript(src) {
    return new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = ok;
      s.onerror = function () { fail(new Error('Could not download ' + src.replace(/^https:\/\/[^/]+/, '') + '. Check your connection or ad blocker.')); };
      document.head.appendChild(s);
    });
  }
  function blobWorker(src) { return new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' }))); }

  /* ---------- Python (one Pyodide worker per page, so examples share variables like a notebook) ---------- */
  var PY_WORKER_SRC = '(' + function (base) {
    importScripts(base + 'pyodide.js');
    var dec = new TextDecoder(), input = [];
    var write = function (type) { return function (buf) { postMessage({ type: type, text: dec.decode(buf, { stream: true }) }); return buf.length; }; };
    var ready = loadPyodide({ indexURL: base }).then(function (py) {
      py.setStdout({ write: write('out') });
      py.setStderr({ write: write('err') });
      py.setStdin({ stdin: function () { return input.length ? input.shift() : undefined; } });
      // Plots are drawn off-screen and sent back as PNGs after each run.
      py.runPython('import os, warnings\nos.environ["MPLBACKEND"] = "AGG"\nwarnings.filterwarnings("ignore", message=".*non-interactive.*")');
      return py;
    });
    var FIGURES = 'import sys\nimgs = []\nplt = sys.modules.get("matplotlib.pyplot")\nif plt:\n    import io, base64\n' +
      '    for n in plt.get_fignums():\n        buf = io.BytesIO()\n        plt.figure(n).savefig(buf, format="png", bbox_inches="tight", dpi=96)\n' +
      '        imgs.append(base64.b64encode(buf.getvalue()).decode())\n    plt.close("all")\nimgs';
    // Like a notebook cell: the value of a trailing expression is printed (but not the objects plotting calls return).
    var RUN = 'from pyodide.code import eval_code_async as _cnr_eval\n_cnr_r = await _cnr_eval(_cnr_src, globals(), filename="<example>")\n' +
      'if _cnr_r is not None and not type(_cnr_r[0] if isinstance(_cnr_r, list) and _cnr_r else _cnr_r).__module__.startswith("matplotlib"):\n' +
      '    print(repr(_cnr_r))\ndel _cnr_r';
    onmessage = function (e) {
      var py;
      ready.then(function (p) {
        py = p;
        postMessage({ type: 'ready' });
        input = e.data.stdin ? e.data.stdin.split('\n') : [];
        return py.loadPackagesFromImports(e.data.code, { messageCallback: function (m) { if (/^Loading/.test(m)) postMessage({ type: 'status', text: m }); }, errorCallback: function () {} });
      }).then(function () {
        postMessage({ type: 'status', text: '' });
        py.globals.set('_cnr_src', e.data.code);
        return py.runPythonAsync(RUN);
      }).then(function () {
        var figs = py.runPython(FIGURES, { globals: py.toPy({}) });
        var imgs = figs.toJs();
        figs.destroy();
        postMessage({ type: 'done', images: imgs });
      }).catch(function (err) {
        postMessage({ type: 'error', text: String((err && err.message) || err) });
      });
    };
  } + ')(' + JSON.stringify(PYODIDE) + ')';

  var pyWorker = null, pyLoaded = false;
  function pythonRun(code, ui) {
    if (!pyWorker) { pyWorker = blobWorker(PY_WORKER_SRC); pyLoaded = false; }
    var w = pyWorker;
    if (!pyLoaded) ui.status('Loading Python… the first run downloads about 10 MB.');
    return new Promise(function (ok) {
      w.onmessage = function (e) {
        var d = e.data;
        if (d.type === 'ready') { pyLoaded = true; ui.status(''); }
        else if (d.type === 'status') ui.status(d.text);
        else if (d.type === 'out' || d.type === 'err') ui.write(d.text, d.type === 'err');
        else if (d.type === 'done') { (d.images || []).forEach(ui.image); ok(); }
        else if (d.type === 'error') {
          ui.write(pyLoaded ? pythonError(d.text) : 'Could not start Python: ' + d.text, true);
          if (!pyLoaded) pythonStop();
          ok({ missing: /\nNameError: /.test(d.text) });
        }
      };
      w.onerror = function (e) { e.preventDefault(); ui.write(pyLoaded ? String(e.message) : 'Could not start Python (' + (e.message || 'download failed') + '). Check your connection or ad blocker.', true); pythonStop(); ok(); };
      ui.onStop = function () { pythonStop(); ui.write('\nStopped. Python was restarted, so earlier examples need to be run again.', true); ok(); };
      w.postMessage({ code: code, stdin: ui.stdin() });
    });
  }
  function pythonStop() { if (pyWorker) { pyWorker.terminate(); pyWorker = null; } }
  // Drop Pyodide's own frames from tracebacks and add a hint for the usual surprises.
  function pythonError(text) {
    var lines = text.replace(/\s+$/, '').split('\n');
    var i = 0;
    while (i < lines.length && lines[i].indexOf('File "<example>"') < 0) i++;
    var tb = i < lines.length ? ['Traceback (most recent call last):'].concat(lines.slice(i)) : lines;
    var last = tb[tb.length - 1];
    if (/^NameError/.test(last)) tb.push('', 'Hint: examples on this page share one Python session. Something this example uses may be defined in an earlier one.');
    else if (/^EOFError/.test(last)) tb.push('', 'Hint: this program reads input. Type it in the "Program input" box, one line per input() call.');
    else if (/^ModuleNotFoundError/.test(last)) tb.push('', 'Hint: this module is not available in the in-browser Python. Run the example on your computer instead.');
    return tb.join('\n');
  }

  /* ---------- JavaScript (a fresh worker per run; it ends when no timers are left) ---------- */
  var JS_WORKER_SRC = '(' + function () {
    var quiet = false;
    var send = function (type, text) { if (!quiet) postMessage({ type: type, text: text }); };
    var fmt = function (v, depth, seen) {
      if (typeof v === 'string') return depth ? "'" + v + "'" : v;
      if (typeof v === 'function') return v.toString().indexOf('class') === 0 ? '[class ' + (v.name || '(anonymous)') + ']' : '[Function: ' + (v.name || '(anonymous)') + ']';
      if (typeof v === 'bigint') return v + 'n';
      if (typeof v === 'symbol') return v.toString();
      if (v === null || typeof v !== 'object') return Object.is(v, -0) ? '-0' : String(v);
      if (v instanceof Error) return (v.name || 'Error') + ': ' + v.message;
      if (v instanceof Date) return isNaN(v) ? 'Invalid Date' : v.toISOString();
      if (v instanceof RegExp) return String(v);
      if (v instanceof Promise) return 'Promise { … }';
      if (seen.indexOf(v) >= 0) return '[Circular]';
      seen = seen.concat([v]);
      var inner = function (x) { return fmt(x, depth + 1, seen); };
      var wrap = function (open, parts, close) {
        if (!parts.length) return open + close;
        var one = open + ' ' + parts.join(', ') + ' ' + close;
        return one.length <= 72 ? one : open + '\n' + parts.map(function (p) { return '  ' + p.replace(/\n/g, '\n  '); }).join(',\n') + '\n' + close;
      };
      if (depth > 2) return Array.isArray(v) ? '[Array]' : '[Object]';
      if (Array.isArray(v)) return wrap('[', v.map(inner), ']');
      if (v instanceof Map) { var mp = []; v.forEach(function (val, k) { mp.push(inner(k) + ' => ' + inner(val)); }); return 'Map(' + v.size + ') ' + wrap('{', mp, '}'); }
      if (v instanceof Set) { var sp = []; v.forEach(function (val) { sp.push(inner(val)); }); return 'Set(' + v.size + ') ' + wrap('{', sp, '}'); }
      var name = v.constructor && v.constructor.name && v.constructor.name !== 'Object' ? v.constructor.name + ' ' : '';
      return name + wrap('{', Object.keys(v).map(function (k) { return (/^[A-Za-z_$][\w$]*$/.test(k) ? k : "'" + k + "'") + ': ' + inner(v[k]); }), '}');
    };
    var line = function (args) {
      args = Array.prototype.slice.call(args);
      var first = args[0];
      // printf-style %s %d %i %f %o %O %j, as in Node and browsers.
      if (typeof first === 'string' && /%[sdifoOjc%]/.test(first)) {
        args.shift();
        first = first.replace(/%([sdifoOjc%])/g, function (m, f) {
          if (f === '%') return '%';
          if (!args.length) return m;
          var a = args.shift();
          if (f === 's') return typeof a === 'string' ? a : fmt(a, 1, []);
          if (f === 'd' || f === 'i') return String(f === 'i' ? parseInt(a, 10) : Number(a));
          if (f === 'f') return String(parseFloat(a));
          if (f === 'c') return '';
          return fmt(a, 1, []);
        });
        args.unshift(first);
      }
      return args.map(function (a) { return typeof a === 'string' ? a : fmt(a, 0, []); }).join(' ') + '\n';
    };
    var table = function (data) {
      if (data === null || typeof data !== 'object') return line([data]);
      var rows = Object.keys(data), cols = [];
      rows.forEach(function (r) { var o = data[r]; if (o && typeof o === 'object') Object.keys(o).forEach(function (c) { if (cols.indexOf(c) < 0) cols.push(c); }); else if (cols.indexOf('Values') < 0) cols.push('Values'); });
      var head = ['(index)'].concat(cols);
      var body = rows.map(function (r) {
        var o = data[r];
        return [r].concat(cols.map(function (c) { return c === 'Values' && (o === null || typeof o !== 'object') ? fmt(o, 1, []) : o && typeof o === 'object' && c in o ? fmt(o[c], 1, []) : ''; }));
      });
      var width = head.map(function (h, i) { return Math.max(h.length, Math.max.apply(null, body.map(function (b) { return b[i].length; }).concat(0))); });
      var fmtRow = function (cells) { return '│' + cells.map(function (c, i) { return ' ' + c + new Array(width[i] - c.length + 1).join(' ') + ' '; }).join('│') + '│'; };
      var rule = function (l, m, r) { return l + width.map(function (w) { return new Array(w + 3).join('─'); }).join(m) + r; };
      return [rule('┌', '┬', '┐'), fmtRow(head), rule('├', '┼', '┤')].concat(body.map(fmtRow), [rule('└', '┴', '┘')]).join('\n') + '\n';
    };
    var counts = {};
    console.log = console.info = console.debug = function () { send('out', line(arguments)); };
    console.error = console.warn = console.trace = function () { send('err', line(arguments)); };
    console.table = function (d) { send('out', table(d)); };
    console.count = function (l) { l = l === undefined ? 'default' : l; counts[l] = (counts[l] || 0) + 1; send('out', l + ': ' + counts[l] + '\n'); };
    console.group = console.groupCollapsed = function () { if (arguments.length) send('out', line(arguments)); };
    console.groupEnd = console.time = console.timeEnd = function () {};
    var report = function (err) { send('err', (err && err.name ? err.name + ': ' + err.message : 'Uncaught ' + fmt(err, 1, [])) + '\n'); };
    // Track timers so the run can end as soon as nothing is left to do.
    var pending = 0, finished = false, timers = {};
    var rawSet = setTimeout, rawClear = clearTimeout, rawEvery = setInterval, rawStop = clearInterval;
    var check = function () { rawSet(function () { if (!finished && pending === 0) { finished = true; send('done'); } }, 0); };
    self.setTimeout = function (fn, ms) {
      var args = Array.prototype.slice.call(arguments, 2), id;
      pending++;
      id = rawSet(function () { delete timers[id]; pending--; try { fn.apply(null, args); } catch (e) { report(e); } check(); }, ms);
      timers[id] = 1;
      return id;
    };
    self.clearTimeout = function (id) { if (timers[id]) { delete timers[id]; pending--; check(); } rawClear(id); };
    self.setInterval = function (fn, ms) {
      var args = Array.prototype.slice.call(arguments, 2);
      pending++;
      var id = rawEvery(function () { try { fn.apply(null, args); } catch (e) { report(e); } }, ms);
      timers['i' + id] = 1;
      return id;
    };
    self.clearInterval = function (id) { if (timers['i' + id]) { delete timers['i' + id]; pending--; check(); } rawStop(id); };
    self.addEventListener('unhandledrejection', function (e) { e.preventDefault(); report(e.reason); });
    onmessage = function (e) {
      // Earlier examples this one builds on run first, quietly, as classic scripts so their top-level
      // declarations become globals the example can see.
      var missing = [];
      quiet = true;
      (e.data.prelude || []).forEach(function (src) {
        try { importScripts(URL.createObjectURL(new Blob([src], { type: 'text/javascript' }))); } catch (err) {
          var m = err && err.name === 'ReferenceError' && /^(\w+) is not defined/.exec(err.message);
          if (m) missing.push(m[1]);
        }
      });
      quiet = false;
      if (missing.length) postMessage({ type: 'missing', names: missing });
      var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor, fn;
      try { fn = new AsyncFunction(e.data.code); } catch (err) { report(err); check(); return; }
      fn().catch(report).then(check);
    };
  } + ')()';

  // Resolves with the names of undefined variables it ran into, so earlier examples that define them can be run first.
  function jsRun(code, ui, prelude) {
    var w = blobWorker(JS_WORKER_SRC), timer, names = [];
    return new Promise(function (ok) {
      var end = function (note) { clearTimeout(timer); w.terminate(); if (note) ui.write(note, true); ok({ names: names }); };
      w.onmessage = function (e) {
        var d = e.data, m;
        if (d.type === 'out' || d.type === 'err') {
          ui.write(d.text, d.type === 'err');
          if (d.type === 'err' && (m = /^ReferenceError: (\w+) is not defined/.exec(d.text)) && names.indexOf(m[1]) < 0) names.push(m[1]);
        }
        else if (d.type === 'missing') d.names.forEach(function (n) { if (names.indexOf(n) < 0) names.push(n); });
        else if (d.type === 'done') end();
      };
      w.onerror = function (e) { e.preventDefault(); end(String(e.message)); };
      ui.onStop = function () { end('\nStopped.'); };
      timer = setTimeout(function () { end('\nStopped after ' + JS_TIMEOUT / 1000 + ' seconds.'); }, JS_TIMEOUT);
      w.postMessage({ code: code, prelude: prelude || [] });
    });
  }
  function declares(src, name) { return new RegExp('(?:\\b(?:const|let|var|class)|\\bfunction\\*?)\\s+' + name + '\\b').test(src); }

  /* ---------- SQL (one database per page, shared by its examples) ---------- */
  var sqlDb = null;
  function sqlOpen(ui) {
    if (!sqlDb) {
      ui.status(postgres ? 'Starting PostgreSQL in your browser…' : 'Loading SQLite…');
      sqlDb = postgres
        ? import(PGLITE).then(function (m) { var db = new m.PGlite(); return db.waitReady.then(function () { return db; }); })
        : loadScript(SQLJS + 'sql-wasm.js').then(function () { return window.initSqlJs({ locateFile: function (f) { return SQLJS + f; } }); })
          .then(function (SQL) { return new SQL.Database(); });
      sqlDb.catch(function () { sqlDb = null; });
    }
    return sqlDb;
  }
  // The SQL and MySQL tutorials mostly use MySQL syntax; translate the table definitions SQLite would reject.
  function toSqlite(sql) {
    return sql
      .replace(/\b(?:TINY|SMALL|MEDIUM|BIG)?INT(?:EGER)?(?:\s*\(\d+\))?(?:\s+UNSIGNED)?((?:\s+NOT\s+NULL)?)\s+AUTO_INCREMENT\b/gi, 'INTEGER$1')
      .replace(/\bAUTO_INCREMENT\s*=\s*\d+/gi, '')
      .replace(/\bAUTO_INCREMENT\b/gi, '')
      .replace(/\b(?:BIG)?SERIAL\b/gi, 'INTEGER')
      .replace(/\bUNSIGNED\b/gi, '')
      .replace(/\bENUM\s*\([^)]*\)/gi, 'TEXT')
      .replace(/\bON\s+UPDATE\s+CURRENT_TIMESTAMP(?:\(\))?/gi, '')
      .replace(/\)\s*(?:(?:ENGINE|(?:DEFAULT\s+)?CHARSET|(?:DEFAULT\s+)?CHARACTER\s+SET|COLLATE)\s*=?\s*\w+\s*)+;/gi, ');')
      .replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP')
      .replace(/\bLAST_INSERT_ID\(\)/gi, 'last_insert_rowid()')
      .replace(/\bCURDATE\(\)/gi, "DATE('now')")
      .replace(/\bCURRENT_DATE\(\)/gi, 'CURRENT_DATE');
  }
  function sqlRun(code, ui) {
    var stopped = false;
    ui.onStop = function () { stopped = true; };
    return sqlOpen(ui).then(function (db) {
      ui.status('');
      if (stopped) return;
      if (postgres) {
        return db.exec(code, { rowMode: 'array' }).then(function (results) {
          var shown = 0, changed = 0;
          results.forEach(function (r) {
            if (r.fields && r.fields.length) { ui.table(r.fields.map(function (f) { return f.name; }), r.rows); shown++; }
            else changed += r.affectedRows || 0;
          });
          if (!shown) ui.write('Done.' + (changed ? ' ' + changed + ' row' + (changed === 1 ? '' : 's') + ' affected.' : '') + '\n');
        }, function (err) { ui.write(sqlError(err), true); return { missing: missingTable(err), exists: /already exists/i.test(err.message) }; });
      }
      var shown = 0, changed = 0;
      try {
        for (var it = db.iterateStatements(toSqlite(code)), r = it.next(); !r.done; r = it.next()) {
          var st = r.value, cols = st.getColumnNames(), rows = [];
          while (st.step()) rows.push(st.get());
          st.free();
          if (cols.length) { ui.table(cols, rows); shown++; } else changed += db.getRowsModified();
        }
        if (!shown) ui.write('Done.' + (changed ? ' ' + changed + ' row' + (changed === 1 ? '' : 's') + ' affected.' : '') + '\n');
      } catch (err) {
        ui.write(sqlError(err), true);
        return { missing: missingTable(err), exists: /already exists/i.test(err.message) };
      }
    }, function (err) { ui.write(String(err.message || err), true); });
  }
  function missingTable(err) { return /no such table|relation .* does not exist/i.test(String((err && err.message) || err)); }
  function sqlError(err) {
    var msg = 'Error: ' + String((err && err.message) || err);
    if (missingTable(err)) msg += '\n\nHint: all SQL examples on this page share one database in your browser. The table may be created by an earlier example.';
    else if (!postgres && /syntax error|no such function/i.test(msg)) msg += '\n\nNote: this runs on SQLite, so some ' + (mysql ? 'MySQL' : 'database') + '-specific syntax is not supported.';
    return msg;
  }
  function sqlReset() {
    if (!sqlDb) return;
    var old = sqlDb;
    sqlDb = null;
    old.then(function (db) { db.close(); }, function () {});
  }

  /* ---------- UI ---------- */
  var ENGINES = {
    python: 'Python 3.13 · runs in your browser',
    js: 'JavaScript · runs in your browser',
    sql: postgres ? 'PostgreSQL · runs in your browser' : mysql ? 'SQLite (close to MySQL) · runs in your browser' : 'SQLite · runs in your browser'
  };
  var RUNNERS = { python: pythonRun, js: jsRun, sql: sqlRun };
  var RESTART = { python: ['Restart Python', pythonStop], sql: ['Reset database', sqlReset] };
  var icons = {
    run: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',
    stop: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M6 6h12v12H6z"/></svg>'
  };
  var busy = null; // one run at a time per page; Python and SQL share state across blocks

  var noop = function () {};
  function codeText(code) { return code.innerText.replace(/\u00a0/g, ' ').replace(/\n$/, ''); }

  // earlier: the code elements of the runnable-in-principle blocks above this one (Python and SQL share state).
  function setup(block, kind, earlier) {
    var code = block.querySelector('pre > code');
    var original = code.innerHTML;
    var bar = el('div', 'cnr-run');
    bar.setAttribute('data-pagefind-ignore', '');
    var tools = el('div', 'cnr-run__bar');
    var go = el('button', 'cnr-run__go');
    go.type = 'button';
    var edit = el('button', 'cnr-run__btn', 'Edit');
    edit.type = 'button';
    edit.title = 'Edit this example, then run it';
    var reset = el('button', 'cnr-run__btn', 'Undo edits');
    reset.type = 'button';
    reset.hidden = true;
    var engine = el('span', 'cnr-run__engine', ENGINES[kind]);
    tools.append(go, edit, reset, engine);
    bar.appendChild(tools);
    var stdinBox = null;
    if (kind === 'python' && /\binput\s*\(/.test(code.textContent)) {
      stdinBox = el('textarea', 'cnr-run__stdin');
      stdinBox.rows = 2;
      stdinBox.placeholder = 'Program input: one line per input() call';
      stdinBox.setAttribute('aria-label', 'Program input');
      bar.appendChild(stdinBox);
    }
    var out = el('div', 'cnr-run__out');
    out.hidden = true;
    out.setAttribute('aria-live', 'polite');
    var head = el('div', 'cnr-run__head');
    head.appendChild(el('span', null, 'Output'));
    if (RESTART[kind]) {
      var restart = el('button', 'cnr-run__link', RESTART[kind][0]);
      restart.type = 'button';
      restart.onclick = function () { if (!busy) { RESTART[kind][1](); clearOut(); } };
      head.appendChild(restart);
    }
    var close = el('button', 'cnr-run__link', 'Clear');
    close.type = 'button';
    close.onclick = function () { if (busy !== ui) clearOut(); };
    head.appendChild(close);
    var status = el('div', 'cnr-run__status');
    status.hidden = true;
    var pre = el('pre', 'cnr-run__text');
    var extra = el('div', 'cnr-run__extra');
    out.append(head, status, pre, extra);
    bar.appendChild(out);
    block.classList.add('cnr-runnable');
    block.after(bar);

    var size = 0, lastText = null;
    function clearOut() { out.hidden = true; pre.textContent = ''; extra.textContent = ''; size = 0; lastText = null; }
    var ui = {
      onStop: null,
      stdin: function () { return stdinBox ? stdinBox.value : ''; },
      status: function (t) { status.textContent = t; status.hidden = !t; },
      write: function (text, isErr) {
        if (!text || size > MAX_OUTPUT) return;
        size += text.length;
        if (size > MAX_OUTPUT) text = text.slice(0, Math.max(0, text.length - (size - MAX_OUTPUT))) + '\n… output cut off here.\n';
        // Consecutive writes of the same kind share one node.
        if (!lastText || lastText.err !== !!isErr || lastText.node.parentNode !== pre) {
          var node = isErr ? el('span', 'cnr-run__err') : document.createTextNode('');
          pre.appendChild(node);
          lastText = { node: node, err: !!isErr };
        }
        lastText.node.textContent += text;
        pre.hidden = false;
      },
      table: function (cols, rows) {
        var wrap = el('div', 'cnr-run__table');
        var t = el('table');
        var tr = el('tr');
        cols.forEach(function (c) { tr.appendChild(el('th', null, c)); });
        t.appendChild(el('thead')).appendChild(tr);
        var tb = t.appendChild(el('tbody'));
        rows.slice(0, MAX_ROWS).forEach(function (r) {
          var row = el('tr');
          r.forEach(function (v) {
            var td = el('td', v === null ? 'cnr-run__null' : null, v === null ? 'NULL' : v instanceof Date ? v.toISOString() : v instanceof Uint8Array ? '<' + v.length + ' bytes>' : typeof v === 'object' ? JSON.stringify(v) : String(v));
            row.appendChild(td);
          });
          tb.appendChild(row);
        });
        wrap.appendChild(t);
        extra.appendChild(wrap);
        extra.appendChild(el('div', 'cnr-run__rows', rows.length > MAX_ROWS ? 'Showing ' + MAX_ROWS + ' of ' + rows.length + ' rows' : rows.length + ' row' + (rows.length === 1 ? '' : 's')));
      },
      image: function (b64) {
        var img = el('img');
        img.alt = 'Plot produced by the example';
        img.src = 'data:image/png;base64,' + b64;
        extra.appendChild(img);
      },
      action: function (label, fn) {
        var b = el('button', 'button button--sm button--outline button--primary cnr-run__action', label);
        b.type = 'button';
        b.onclick = fn;
        extra.appendChild(b);
      }
    };

    function paintGo() {
      var running = busy === ui;
      go.innerHTML = (running ? icons.stop + '<span>Stop</span>' : icons.run + '<span>Run</span>');
      go.classList.toggle('cnr-run__go--stop', running);
      go.setAttribute('aria-label', running ? 'Stop the example' : 'Run this example');
    }
    // withEarlier: first run the examples above this one quietly (their output is not shown).
    function run(withEarlier) {
      if (busy === ui) { if (ui.onStop) ui.onStop(); return; }
      if (busy) return;
      busy = ui;
      document.dispatchEvent(new Event('cnr-run-busy'));
      clearOut();
      out.hidden = false;
      pre.hidden = true;
      ui.onStop = null;
      var stopped = false;
      var steps = Promise.resolve();
      if (kind === 'js') {
        // JavaScript: rerun with the examples above that define what was missing, until nothing more is found.
        var prelude = [];
        var attempt = function (n) {
          extra.textContent = '';
          pre.textContent = '';
          size = 0;
          lastText = null;
          return jsRun(codeText(code), ui, prelude.map(codeText)).then(function (res) {
            var adds = withEarlier === true && n < 6 ? res.names.map(definer).filter(function (c, i, a) { return c && prelude.indexOf(c) < 0 && a.indexOf(c) === i; }) : [];
            if (!adds.length || stopped) return res;
            prelude = adds.concat(prelude);
            return attempt(n + 1);
          });
        };
        ui.onStop = null;
        return finish(attempt(0));
      }
      if (withEarlier === true) earlier.forEach(function (c, i) {
        steps = steps.then(function () {
          if (stopped) return;
          var quiet = { onStop: null, stdin: function () { return ''; }, status: noop, write: noop, table: noop, image: noop };
          ui.status('Running earlier example ' + (i + 1) + ' of ' + earlier.length + '…');
          var p = RUNNERS[kind](codeText(c), quiet);
          ui.onStop = function () { stopped = true; if (quiet.onStop) quiet.onStop(); };
          return p;
        });
      });
      finish(steps.then(function () {
        if (stopped) { ui.write('Stopped.\n', true); return; }
        ui.status('');
        ui.onStop = null;
        return RUNNERS[kind](codeText(code), ui);
      }));
      function finish(p) {
        p.catch(function (e) { ui.write(String((e && e.message) || e), true); }).then(function (res) {
          ui.status('');
          if (!pre.textContent && !extra.firstChild) ui.write(kind === 'python' || kind === 'js' ? '(no output)\n' : 'Done.\n');
          var again = function () { run(true); };
          if (withEarlier !== true && res) {
            var n = earlier.length;
            var found = kind === 'js' ? res.names.filter(definer) : [];
            if (found.length) ui.action('Run the example above that defines ' + found[0] + ' first', again);
            else if (res.missing && n && kind !== 'js') ui.action('Run the ' + (n === 1 ? 'example' : n + ' examples') + ' above first, then this one', again);
          }
          if (res && res.exists) ui.action('Reset the database and run this again', function () { sqlReset(); run(withEarlier); });
          busy = null;
          document.dispatchEvent(new Event('cnr-run-busy'));
        });
      }
    }
    // The nearest example above that declares a name (JavaScript).
    function definer(name) {
      for (var i = earlier.length - 1; i >= 0; i--) if (declares(codeText(earlier[i]), name)) return earlier[i];
      return null;
    }
    document.addEventListener('cnr-run-busy', function () { paintGo(); go.disabled = !!busy && busy !== ui; });
    paintGo();
    go.onclick = function () { run(false); };

    // Editing: the highlighted code itself becomes editable; "Undo edits" brings back the original.
    edit.onclick = function () {
      var on = code.getAttribute('contenteditable') === null;
      if (on) {
        code.setAttribute('contenteditable', 'plaintext-only');
        if (code.contentEditable !== 'plaintext-only') code.setAttribute('contenteditable', 'true');
        code.setAttribute('spellcheck', 'false');
        code.focus();
      } else code.removeAttribute('contenteditable');
      block.classList.toggle('cnr-editing', on);
      edit.textContent = on ? 'Done editing' : 'Edit';
    };
    code.addEventListener('input', function () { reset.hidden = false; });
    code.addEventListener('keydown', function (e) {
      if (code.getAttribute('contenteditable') === null) return;
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(false); }
      else if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); document.execCommand('insertText', false, kind === 'js' ? '  ' : '    '); }
      else if (e.key === 'Escape') edit.click();
    });
    // Pasting into the editable code keeps plain text only.
    code.addEventListener('paste', function (e) {
      if (code.getAttribute('contenteditable') === null || !e.clipboardData) return;
      e.preventDefault();
      document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
    });
    reset.onclick = function () {
      code.innerHTML = original;
      reset.hidden = true;
      if (code.getAttribute('contenteditable') !== null) edit.click();
    };
  }

  var cells = { python: [], sql: [], js: [] };
  document.querySelectorAll('.theme-code-block').forEach(function (block) {
    var m = block.className.match(/\blanguage-([\w+#-]+)/);
    var kind = m && LANGS[m[1].toLowerCase()];
    var code = block.querySelector('pre > code');
    if (!kind || !code || !candidate(kind, code.textContent)) return;
    if (runnable(kind, code.textContent)) setup(block, kind, cells[kind] ? cells[kind].slice() : []);
    if (cells[kind]) cells[kind].push(code);
  });
})();
