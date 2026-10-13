(function () {
  // Theme toggle
  var root = document.documentElement;
  var themeBtn = document.querySelector('[data-toggle-theme]');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var t = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = t;
      try { localStorage.setItem('theme', t); } catch (e) {}
    });
  }

  // Mobile sidebar
  var sidebar = document.querySelector('[data-sidebar]');
  var menuBtn = document.querySelector('[data-toggle-sidebar]');
  if (menuBtn) {
    if (!sidebar) menuBtn.style.visibility = 'hidden';
    menuBtn.addEventListener('click', function () { if (sidebar) sidebar.classList.toggle('open'); });
  }

  // The sidebar HTML is shared by every page of a tutorial: mark the current page and open its parents.
  if (sidebar) {
    var here = location.pathname;
    var links = sidebar.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('href') === here) {
        links[i].classList.add('active');
        var el = links[i].parentElement;
        while (el && el !== sidebar) {
          if (el.tagName === 'DETAILS') el.open = true;
          el = el.parentElement;
        }
        links[i].scrollIntoView({ block: 'center' });
        break;
      }
    }
  }

  // Only one top-nav dropdown open at a time; close on outside click.
  var drops = document.querySelectorAll('.dropdown');
  drops.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) drops.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown')) drops.forEach(function (d) { d.open = false; });
  });

  // Copy buttons on code blocks
  document.querySelectorAll('article pre:not(.mermaid)').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      var code = pre.querySelector('code') || pre;
      navigator.clipboard.writeText(code.innerText).then(function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
      });
    });
    pre.appendChild(btn);
  });
})();
