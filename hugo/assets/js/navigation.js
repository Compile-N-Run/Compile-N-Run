/* Compact navigation. Existing main.js owns drawer opening, closing, sidebar
 * cloning, and category toggles; this layer adds disclosure and focus behavior. */
(function () {
  'use strict';
  const navbar = document.querySelector('[data-navbar]');
  if (!navbar) return;
  const menus = Array.from(navbar.querySelectorAll('[data-tutorial-browse]'));
  const drawer = navbar.querySelector('.navbar-sidebar');
  const mobileToggle = navbar.querySelector('[data-navbar-toggle]');
  const closeButton = drawer?.querySelector('[data-navbar-close]');
  const items = navbar.querySelector('[data-navbar-items]');
  const primary = navbar.querySelector('[data-nav-primary]');
  const secondary = navbar.querySelector('[data-nav-secondary]');
  const mobile = matchMedia('(max-width: 996px)');
  let wasOpen = false, suppressReturnFocus = false;
  const visible = node => Boolean(node && !node.closest('[inert]') && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
  const focusable = container => Array.from(container.querySelectorAll('a[href],button:not([disabled]),summary,input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(visible);

  function positionPanel() {
    navbar.style.setProperty('--cnr-nav-bottom', Math.max(0, navbar.getBoundingClientRect().bottom + 8) + 'px');
    menus.filter(menu => menu.open).forEach(menu => {
      const panel = menu.querySelector('[data-browse-panel]');
      const left = Math.max(16, Math.min(menu.getBoundingClientRect().left, innerWidth - panel.getBoundingClientRect().width - 16));
      panel.style.setProperty('--cnr-panel-left', left + 'px');
    });
  }
  function closeMenu(menu, restoreFocus) {
    menu.open = false;
    const toggle = menu.querySelector('[data-browse-toggle]');
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus && visible(toggle)) toggle.focus();
  }
  function closeBrowse() { menus.forEach(menu => closeMenu(menu, false)); }
  menus.forEach(menu => {
    const toggle = menu.querySelector('[data-browse-toggle]');
    menu.addEventListener('toggle', () => {
      toggle.setAttribute('aria-expanded', String(menu.open));
      if (menu.open) menus.filter(other => other !== menu && other.open).forEach(other => closeMenu(other, false));
      positionPanel();
    });
    toggle.addEventListener('click', () => {
      menus.filter(other => other !== menu && other.open).forEach(other => closeMenu(other, false));
      positionPanel();
    });
    menu.querySelector('[data-browse-close]').addEventListener('click', () => closeMenu(menu, true));
    toggle.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault(); closeBrowse(); menu.open = true; toggle.setAttribute('aria-expanded', 'true'); positionPanel();
        menu.querySelector('.cnr-nav-browse__group a')?.focus();
      }
    });
  });
  document.addEventListener('click', event => {
    menus.filter(menu => menu.open && (!menu.contains(event.target) || event.target.closest('[data-browse-panel] a[href]'))).forEach(menu => closeMenu(menu, false));
  });
  document.addEventListener('focusin', event => {
    menus.filter(menu => menu.open && !menu.contains(event.target)).forEach(menu => closeMenu(menu, false));
  });

  function syncDrawer() {
    if (!drawer) return;
    const open = mobile.matches && navbar.classList.contains('navbar-sidebar--show');
    drawer.inert = !open;
    drawer.setAttribute('aria-hidden',String(!open));
    mobileToggle?.setAttribute('aria-expanded',String(open));
    const showingCourse = Boolean(items?.classList.contains('navbar-sidebar__items--show-secondary'));
    if (primary) { primary.inert = !open || showingCourse; primary.setAttribute('aria-hidden',String(!open || showingCourse)); }
    if (secondary) { secondary.inert = !open || !showingCourse; secondary.setAttribute('aria-hidden',String(!open || !showingCourse)); }
    if (open && !wasOpen) {
      closeBrowse(false);
      requestAnimationFrame(()=>{if(navbar.classList.contains('navbar-sidebar--show'))closeButton?.focus();});
    } else if (!open && wasOpen && !suppressReturnFocus && mobile.matches && visible(mobileToggle)) mobileToggle.focus();
    if (!open) suppressReturnFocus = false;
    wasOpen = open;
  }
  new MutationObserver(syncDrawer).observe(navbar,{attributes:true,attributeFilter:['class']});
  if (items) new MutationObserver(syncDrawer).observe(items,{attributes:true,attributeFilter:['class']});
  navbar.querySelector('[data-navbar-back]')?.addEventListener('click',()=>{
    // main.js has just removed the secondary-pane class.
    syncDrawer(); primary?.querySelector('a[href]')?.focus();
  });
  navbar.querySelector('[data-navbar-course]')?.addEventListener('click',()=>{
    items?.classList.add('navbar-sidebar__items--show-secondary'); syncDrawer();
    secondary?.querySelector('[data-navbar-back]')?.focus();
  });
  document.addEventListener('focusin',event=>{
    if(wasOpen && event.target.closest('dialog[open]')){
      suppressReturnFocus=true;closeButton?.click();syncDrawer();
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape') {
      const openMenu = menus.find(menu => menu.open);
      if(openMenu){event.preventDefault();closeMenu(openMenu, true);}
      else if(wasOpen){event.preventDefault();closeButton?.click();}
    }
    if(event.key==='Tab' && wasOpen) {
      const controls=focusable(drawer);if(!controls.length){event.preventDefault();return;}
      const first=controls[0],last=controls[controls.length-1],active=document.activeElement;
      if(event.shiftKey && (active===first || !drawer.contains(active))){event.preventDefault();last.focus();}
      else if(!event.shiftKey && (active===last || !drawer.contains(active))){event.preventDefault();first.focus();}
    }
  });
  function viewportChanged() {
    closeBrowse(false);
    if(!mobile.matches && navbar.classList.contains('navbar-sidebar--show'))closeButton?.click();
    syncDrawer(); positionPanel();
  }
  mobile.addEventListener('change',viewportChanged);
  window.addEventListener('resize',positionPanel,{passive:true});
  window.addEventListener('scroll',positionPanel,{passive:true});
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(positionPanel).observe(navbar);
  syncDrawer();
})();
