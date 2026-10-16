/* Compact navigation. Existing main.js owns drawer opening, closing, sidebar
 * cloning, and category toggles; this layer adds disclosure and focus behavior. */
(function () {
  'use strict';
  const navbar = document.querySelector('[data-navbar]');
  if (!navbar) return;
  const browse = navbar.querySelector('[data-tutorial-browse]');
  const browseToggle = navbar.querySelector('[data-browse-toggle]');
  const panel = navbar.querySelector('[data-browse-panel]');
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
    if (browse?.open) navbar.style.setProperty('--cnr-nav-bottom', Math.max(0,navbar.getBoundingClientRect().bottom + 8) + 'px');
  }
  function closeBrowse(restoreFocus) {
    if (!browse) return;
    browse.open = false;
    browseToggle?.setAttribute('aria-expanded','false');
    if (restoreFocus && visible(browseToggle)) browseToggle.focus();
  }
  if (browse) {
    browse.addEventListener('toggle', () => {
      browseToggle.setAttribute('aria-expanded',String(browse.open));
      positionPanel();
    });
    navbar.querySelector('[data-browse-close]')?.addEventListener('click',()=>closeBrowse(true));
    browseToggle.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault(); browse.open = true; browseToggle.setAttribute('aria-expanded','true'); positionPanel();
        panel.querySelector('.cnr-nav-browse__group a')?.focus();
      }
    });
    document.addEventListener('click', event => {
      if (browse.open && !browse.contains(event.target)) closeBrowse(false);
      else if (browse.open && event.target.closest('[data-browse-panel] a[href]')) closeBrowse(false);
    });
    document.addEventListener('focusin', event => { if (browse.open && !browse.contains(event.target)) closeBrowse(false); });
  }

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
      if(browse?.open){event.preventDefault();closeBrowse(true);}
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
