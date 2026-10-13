/* Client behaviour that Docusaurus' React theme provides, for the static Hugo build. */
(function () {
  var root = document.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Color mode (same 'theme' key as Docusaurus) ---------- */
  function setTheme(choice) {
    var t = choice === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : choice;
    root.setAttribute('data-theme', t);
    root.setAttribute('data-theme-choice', choice);
    if (choice === 'system') { try { localStorage.removeItem('theme'); } catch (e) {} } else store.set('theme', choice);
    var frame = document.querySelector('iframe.giscus-frame');
    if (frame) frame.contentWindow.postMessage({ giscus: { setConfig: { theme: giscusTheme() } } }, 'https://giscus.app');
  }
  document.querySelectorAll('[data-toggle-theme]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = { system: 'light', light: 'dark', dark: 'system' };
      setTheme(next[root.getAttribute('data-theme-choice')] || 'light');
    });
  });

  /* ---------- Announcement bar ---------- */
  var bar = document.querySelector('[data-announcement]');
  if (bar && root.getAttribute('data-announcement-bar-initially-dismissed') === 'true') bar.remove();
  var barClose = document.querySelector('[data-announcement-close]');
  if (barClose) barClose.addEventListener('click', function () {
    store.set('docusaurus.announcement.dismiss', 'true');
    store.set('docusaurus.announcement.id', {{ site.Data.site.announcementBar.id | jsonify | safeJS }});
    root.setAttribute('data-announcement-bar-initially-dismissed', 'true');
    bar.remove();
  });

  /* ---------- Mobile navbar sidebar ---------- */
  var navbar = document.querySelector('[data-navbar]');
  function mobileMenu(open) {
    navbar.classList.toggle('navbar-sidebar--show', open);
    root.style.overflow = open ? 'hidden' : '';
  }
  document.querySelectorAll('[data-navbar-toggle]').forEach(function (b) { b.addEventListener('click', function () { mobileMenu(true); }); });
  document.querySelectorAll('[data-navbar-close]').forEach(function (b) { b.addEventListener('click', function () { mobileMenu(false); }); });
  var back = document.querySelector('[data-navbar-back]');
  if (back) back.addEventListener('click', function () {
    document.querySelector('[data-navbar-items]').classList.remove('navbar-sidebar__items--show-secondary');
  });

  /* ---------- Collapsible sidebar categories ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-collapse]');
    if (!t) return;
    e.preventDefault();
    var li = t.closest('.menu__list-item');
    var collapsed = li.classList.toggle('menu__list-item--collapsed');
    t.setAttribute('aria-expanded', String(!collapsed));
  });

  /* ---------- Active sidebar link: the sidebar HTML is shared by every page of a tutorial ---------- */
  var here = location.pathname;
  document.querySelectorAll('.theme-doc-sidebar-menu').forEach(function (menu) {
    var active = null;
    menu.querySelectorAll('a.menu__link[href]').forEach(function (a) {
      if (a.getAttribute('href') === here) active = a;
    });
    if (!active) return;
    active.classList.add('menu__link--active');
    active.setAttribute('aria-current', 'page');
    var li = active.closest('.menu__list-item');
    while (li) {
      li.classList.remove('menu__list-item--collapsed');
      var own = li.querySelector(':scope > .menu__list-item-collapsible > .menu__link');
      if (own) own.classList.add('menu__link--active');
      var caret = li.querySelector(':scope > .menu__list-item-collapsible > [data-collapse]');
      if (caret) caret.setAttribute('aria-expanded', 'true');
      li = li.parentElement.closest('.menu__list-item');
    }
    if (menu.closest('[data-doc-sidebar]')) {
      var nav = menu.closest('[data-doc-sidebar]');
      var r = active.getBoundingClientRect(), nr = nav.getBoundingClientRect();
      if (r.top < nr.top || r.bottom > nr.bottom) nav.scrollTop += r.top - nr.top - nr.height / 3;
    }
  });

  /* ---------- Table of contents: highlight the heading in view ---------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('[data-toc] .table-of-contents__link'));
  if (tocLinks.length) {
    var heads = tocLinks.map(function (a) { return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); });
    var onScroll = function () {
      var offset = (navbar ? navbar.offsetHeight : 60) + 10, current = 0;
      heads.forEach(function (h, i) { if (h && h.getBoundingClientRect().top - offset <= 1) current = i; });
      tocLinks.forEach(function (a, i) { a.classList.toggle('table-of-contents__link--active', i === current); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var tocMobile = document.querySelector('[data-toc-mobile]');
  if (tocMobile) tocMobile.querySelector('[data-toc-mobile-toggle]').addEventListener('click', function () {
    var c = tocMobile.querySelector('.collapsibleContent_i85q');
    c.hidden = !c.hidden;
    tocMobile.classList.toggle('tocCollapsibleExpanded_sAul', !c.hidden);
    this.classList.toggle('tocCollapsibleButtonExpanded_MG3E', !c.hidden);
  });

  /* ---------- Back to top ---------- */
  var top = document.querySelector('[data-back-to-top]');
  if (top) {
    window.addEventListener('scroll', function () { top.classList.toggle('backToTopButtonShow_xfvO', window.scrollY > 300); }, { passive: true });
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- Tabs (markup produced by convert.py) ---------- */
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var list = box.querySelector('.tabs');
    var panels = box.querySelectorAll(':scope > .margin-top--md > [role="tabpanel"]');
    panels.forEach(function (p, i) {
      var li = document.createElement('li');
      li.setAttribute('role', 'tab');
      li.className = 'tabs__item tabItem_LNqP' + (i === 0 ? ' tabs__item--active' : '');
      li.textContent = p.getAttribute('data-label');
      li.tabIndex = i === 0 ? 0 : -1;
      li.addEventListener('click', function () {
        list.querySelectorAll('.tabs__item').forEach(function (x, j) { x.classList.toggle('tabs__item--active', j === i); });
        panels.forEach(function (x, j) { x.hidden = j !== i; });
      });
      list.appendChild(li);
      p.hidden = i !== 0;
    });
  });

  /* ---------- Copy buttons on code blocks ---------- */
  var copyIcons = '<span class="copyButtonIcons_IEyt" aria-hidden="true"><svg viewBox="0 0 24 24" class="copyButtonIcon_TrPX"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg><svg viewBox="0 0 24 24" class="copyButtonSuccessIcon_cVMy"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path></svg></span>';
  document.querySelectorAll('.codeBlockContent_QJqH').forEach(function (box) {
    var group = document.createElement('div');
    group.className = 'buttonGroup_M5ko';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'clean-btn';
    btn.title = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.innerHTML = copyIcons;
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(box.querySelector('code').innerText.replace(/\n$/, '')).then(function () {
        btn.classList.add('copyButtonCopied_Vdqa');
        setTimeout(function () { btn.classList.remove('copyButtonCopied_Vdqa'); }, 1000);
      });
    });
    group.appendChild(btn);
    box.appendChild(group);
  });

  /* ---------- Search (Pagefind) ---------- */
  if (!/Mac|iPhone|iPad/.test(navigator.platform)) {
    var k = document.querySelector('.DocSearch-Button-Key');
    if (k) k.textContent = 'Ctrl';
  }
  var modal = document.querySelector('[data-search-modal]');
  var ui = null;
  function openSearch() {
    modal.hidden = false;
    root.style.overflow = 'hidden';
    var bundle = modal.getAttribute('data-bundle');
    var start = function () {
      if (!ui) ui = new PagefindUI({ element: '#cnr-search-ui', bundlePath: bundle, showSubResults: true, showImages: false, autofocus: true });
      var input = modal.querySelector('input');
      if (input) input.focus();
    };
    if (window.PagefindUI) return start();
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = bundle + 'pagefind-ui.css';
    document.head.appendChild(css);
    var s = document.createElement('script');
    s.src = bundle + 'pagefind-ui.js';
    s.onload = start;
    document.head.appendChild(s);
  }
  function closeSearch() { modal.hidden = true; root.style.overflow = ''; }
  document.querySelectorAll('[data-search-open]').forEach(function (b) { b.addEventListener('click', openSearch); });
  document.querySelectorAll('[data-search-close]').forEach(function (b) { b.addEventListener('click', closeSearch); });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); modal.hidden ? openSearch() : closeSearch(); }
    else if (e.key === 'Escape' && !modal.hidden) closeSearch();
  });

  /* ---------- Giscus comments (same settings as src/components/Comments) ---------- */
  function giscusTheme() { return root.getAttribute('data-theme') === 'dark' ? 'dark_tritanopia' : 'light_tritanopia'; }
  var giscus = document.querySelector('[data-giscus]');
  if (giscus) {
    var g = document.createElement('script');
    var attrs = {
      src: 'https://giscus.app/client.js', 'data-repo': 'Compile-N-Run/Compile-N-Run', 'data-repo-id': 'R_kgDOOAqVEQ',
      'data-category': 'General', 'data-category-id': 'DIC_kwDOOAqVEc4CnZ-y', 'data-mapping': 'pathname', 'data-strict': '0',
      'data-reactions-enabled': '1', 'data-emit-metadata': '0', 'data-input-position': 'top', 'data-theme': giscusTheme(),
      'data-lang': 'en', 'data-loading': 'lazy', crossorigin: 'anonymous', async: ''
    };
    Object.keys(attrs).forEach(function (k) { g.setAttribute(k, attrs[k]); });
    giscus.appendChild(g);
  }

  /* ---------- Referral dock (port of src/components/ReferralDock) ---------- */
  var offers = window.CNR_OFFERS || [];
  if (offers.length) {
    var KEY = 'cnr_referral_dock', SNOOZE = 864e5, idx = Math.floor(Math.random() * offers.length), timer = null, paused = false;
    var el = document.createElement('div');
    document.body.appendChild(el);
    var saved = null;
    try { saved = JSON.parse(store.get(KEY) || 'null'); } catch (e) {}
    var render = function (mode) {
      root.classList.toggle('referral-dock-open', mode === 'open');
      clearInterval(timer);
      if (mode === 'collapsed') {
        el.innerHTML = '<button type="button" class="pill_hFMe" aria-label="Show referral offers" title="Referral offers"><span aria-hidden="true">🎁</span><span class="pillText_uo8T">Offers</span></button>';
        el.firstChild.onclick = function () { store.set(KEY, JSON.stringify({ until: 0 })); render('open'); };
        return;
      }
      var o = offers[idx];
      var dots = offers.map(function (x, i) { return '<button type="button" tabindex="-1" class="dot_Ypn4' + (i === idx ? ' dotActive_SNwi' : '') + '" data-i="' + i + '"></button>'; }).join('');
      el.innerHTML = '<aside class="dock_qaIB" role="complementary" aria-label="Referral offers"><div class="inner_bnmr">' +
        '<span class="tag_izvc">Referral</span>' +
        '<button type="button" class="nav_maNj" data-step="-1" aria-label="Previous offer">‹</button>' +
        '<a class="offer_xj_l" href="' + o.url + '" target="_blank" rel="noopener noreferrer nofollow sponsored" style="--offer-accent:' + o.accent + '">' +
        '<span class="emoji_U9VN" aria-hidden="true">' + o.emoji + '</span><span class="text__Luv"><span class="headline_tQUR"><span class="brand_tV4_">' + o.brand + '</span>' + o.headline + '</span>' +
        '<span class="body_hdkO">' + o.body + '</span></span><span class="cta_ZaM6">' + o.cta + '<span aria-hidden="true"> →</span></span></a>' +
        '<button type="button" class="nav_maNj" data-step="1" aria-label="Next offer">›</button>' +
        '<div class="dots_zipg" aria-hidden="true">' + dots + '</div>' +
        '<button type="button" class="close_WZah" aria-label="Hide referral offers for today" title="Hide for today">×</button></div></aside>';
      var dock = el.firstChild;
      dock.onmouseenter = function () { paused = true; };
      dock.onmouseleave = function () { paused = false; };
      dock.querySelectorAll('[data-step]').forEach(function (b) { b.onclick = function () { go(idx + Number(b.getAttribute('data-step'))); }; });
      dock.querySelectorAll('[data-i]').forEach(function (b) { b.onclick = function () { go(Number(b.getAttribute('data-i'))); }; });
      dock.querySelector('.close_WZah').onclick = function () { store.set(KEY, JSON.stringify({ until: Date.now() + SNOOZE })); render('collapsed'); };
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timer = setInterval(function () { if (!paused && document.visibilityState === 'visible') go(idx + 1); }, 9000);
      }
    };
    var go = function (n) { idx = ((n % offers.length) + offers.length) % offers.length; render('open'); };
    setTimeout(function () { render(saved && saved.until > Date.now() ? 'collapsed' : 'open'); }, 2500);
  }
})();
