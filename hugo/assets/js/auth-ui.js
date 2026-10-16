/* Shared account discovery and a small native-dialog sign-in UI.
 * Session details and passwords remain in memory. Learning ownership is handled
 * by learning-sync.js through the awaited cnr:auth-changed transition event. */
(function () {
  'use strict';
  if (window.CNRAuth) return;
  const widget = document.querySelector('[data-auth-widget]');
  const dialog = document.querySelector('[data-auth-dialog]');
  const menu = widget?.querySelector('[data-auth-menu]');
  const avatar = widget?.querySelector('[data-auth-avatar]');
  const openButton = widget?.querySelector('[data-auth-open]');
  const menuStatus = widget?.querySelector('[data-auth-menu-status]');
  const message = dialog?.querySelector('[data-auth-message]');
  const forms = dialog ? Array.from(dialog.querySelectorAll('[data-auth-form]')) : [];
  const titles = { login: 'Sign in', register: 'Create an account', forgot: 'Reset your password', resend: 'Verify your email' };
  let current = null, known = false, published = false, transitionFailed = false, actionPending = false, capabilities = { google: false, email: false };
  let inFlight = null, refreshController = null, initial = null, mutation = null;
  let lastAttempt = 0, requestEpoch = 0, stateEpoch = 0, transition = Promise.resolve(), transitioning = false;
  let syncNotice = '', busy = false, mode = 'login', returnFocus = null, focusAvatarOnClose = false;
  const clone = value => value === null ? null : JSON.parse(JSON.stringify(value));
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const plain = (value, max, empty = false) => typeof value === 'string' && (empty || value.length > 0) && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value);
  function fault(code, text) { const error = new Error(text); error.code = code; return error; }
  function validate(value) {
    if (!object(value) || typeof value.configured !== 'boolean' || (value.user !== null && !object(value.user))) throw fault('invalid_response','Sign-in details could not be verified. Please try again.');
    const providers = object(value.providers) ? { google: value.providers.google === true, email: value.providers.email === true } : { google: value.googleConfigured === true, email: value.emailConfigured === true };
    if (value.user === null) return { configured: value.configured, providers: value.configured ? providers : { google: false, email: false }, user: null };
    const user = value.user;
    if (!value.configured || !plain(user.id,200) || !plain(user.name,100,true) ||
        !(user.email === undefined || user.email === null || plain(user.email,254)) ||
        typeof user.emailVerified !== 'boolean' || typeof user.hasPassword !== 'boolean' || typeof user.googleLinked !== 'boolean' || !(user.googleEmail === undefined || user.googleEmail === null || plain(user.googleEmail,254)) || !plain(value.csrfToken,500)) {
      throw fault('invalid_response','Sign-in details could not be verified. Please try again.');
    }
    return { configured: value.configured, providers, user: { id: user.id, name: user.name, email: user.email || null,
      emailVerified: user.emailVerified, hasPassword: user.hasPassword, googleLinked: user.googleLinked, googleEmail: user.googleLinked && user.googleEmail || null }, csrfToken: value.csrfToken };
  }
  function clearPasswords() { dialog?.querySelectorAll('input[type="password"]').forEach(input=>{input.value='';}); }
  function say(text, error = false) { if(message){message.textContent=text;message.dataset.error=String(error);} }
  function initials(name) {
    const parts=name.trim().split(/\s+/).filter(Boolean);
    return parts.length ? (Array.from(parts[0])[0] + (parts.length>1?Array.from(parts[parts.length-1])[0]:'')).toLocaleUpperCase() : '?';
  }
  function closeMenu(focus = false) {
    if(!menu)return;menu.hidden=true;avatar.setAttribute('aria-expanded','false');
    if(focus&&!avatar.hidden)avatar.focus();
  }
  function positionMenu() {
    if(!menu||menu.hidden)return;
    const rect=avatar.getBoundingClientRect(), width=menu.getBoundingClientRect().width;
    menu.style.setProperty('--cnr-auth-menu-top',Math.max(8,rect.bottom+8)+'px');
    menu.style.setProperty('--cnr-auth-menu-left',Math.max(12,Math.min(rect.right-width,innerWidth-width-12))+'px');
  }
  function openMenu(focusFirst = false) {
    if(!current?.user||!menu||busy||transitioning)return;
    menu.hidden=false;avatar.setAttribute('aria-expanded','true');positionMenu();
    if(menuStatus)menuStatus.textContent=transitionFailed?'Your learning needs attention. Retry the connection before editing.':syncNotice;
    if(focusFirst)menu.querySelector('a')?.focus();
  }
  function render() {
    const user=current?.user;
    if(widget){
      widget.setAttribute('aria-busy',String(busy||transitioning));
      openButton.hidden=Boolean(user);openButton.textContent=published&&current===null?'Reconnect':'Sign in';avatar.hidden=!user;avatar.disabled=busy||transitioning;
      if(user){widget.querySelector('[data-auth-initials]').textContent=initials(user.name);widget.querySelector('[data-auth-name]').textContent=user.name||'Learner';avatar.setAttribute('aria-label','Open account menu for '+(user.name||'Learner'));}
      else closeMenu();
      widget.querySelector('[data-auth-signout]').disabled=!user||busy||transitioning;
      widget.querySelector('[data-auth-refresh]').hidden=!transitionFailed;widget.querySelector('[data-auth-refresh]').disabled=busy||transitioning;
    }
    if(!dialog)return;
    dialog.setAttribute('aria-busy',String(busy||transitioning));
    dialog.querySelector('[data-auth-google]').hidden=!capabilities.google||(Boolean(user)&&transitionFailed);
    dialog.querySelector('[data-auth-google]').setAttribute('aria-disabled',String(busy||transitioning||transitionFailed));
    dialog.querySelector('[data-auth-email]').hidden=!capabilities.email||(Boolean(user)&&transitionFailed);
    dialog.querySelector('[data-auth-divider]').hidden=!(capabilities.email&&capabilities.google);
    dialog.querySelector('[data-auth-retry]').hidden=!transitionFailed&&Boolean(current?.configured && (capabilities.email||capabilities.google));
    dialog.querySelector('[data-auth-retry]').disabled=busy||Boolean(inFlight);
    dialog.querySelector('#cnr-auth-title').textContent=transitionFailed&&user?'Learning needs attention':titles[mode];
    forms.forEach(form=>{
      form.hidden=form.dataset.authForm!==mode;
      form.querySelectorAll('input,button').forEach(control=>{control.disabled=busy||transitioning||transitionFailed||!capabilities.email;});
    });
    dialog.querySelectorAll('[data-auth-mode]').forEach(button=>{button.hidden=button.dataset.authMode===mode || (mode!=='login'&&button.dataset.authMode!=='login');button.disabled=busy||transitioning||transitionFailed;});
  }
  async function accept(next, reason) {
    if(published&&!actionPending&&!transitionFailed&&JSON.stringify(current)===JSON.stringify(next)){await transition;return clone(current);}
    const previousUserId=current?.user?.id||null;
    current=next;published=true;actionPending=false;
    if(next){known=true;capabilities={...next.providers};}
    clearPasswords();
    const epoch=++stateEpoch, waits=[];
    transitioning=true;
    window.dispatchEvent(new CustomEvent('cnr:auth-changed',{detail:{session:clone(next),previousUserId,reason,waitUntil(value){waits.push(Promise.resolve(value));}}}));
    if(transitioning)closeMenu();
    render();
    transition=Promise.allSettled(waits);
    const results=await transition;
    if(epoch===stateEpoch){
      transitioning=false;transitionFailed=results.some(result=>result.status==='rejected');render();
      if(transitionFailed){
        const problem=fault('learning_transition_failed','Your learning could not finish switching. Try connecting again before continuing.');
        say(problem.message,true);if(menuStatus)menuStatus.textContent=problem.message;
        if(dialog)dialog.querySelector('[data-auth-retry]').hidden=false;
        throw problem;
      }
      if(dialog?.open&&!busy){
        if(next?.user)closeDialog(true);
        else if(!next?.configured)say(next?'Sign-in is unavailable right now. You can keep learning on this device.':'Could not connect to sign-in. Check your connection and try again.',true);
        else if(message?.textContent==='Checking sign-in options…')say('');
      }
    }
    return clone(current);
  }
  async function beforeAction(action) {
    actionPending=true;const waits=[];
    window.dispatchEvent(new CustomEvent('cnr:auth-changing',{detail:{action,session:clone(current),waitUntil(value){waits.push(Promise.resolve(value));}}}));
    const results=await Promise.allSettled(waits);
    const failure=results.find(result=>result.status==='rejected');
    if(failure){
      if(failure.reason?.code==='account_changed')throw fault('account_changed','The signed-in account changed before progress could be saved. Review the current account before trying again.');
      throw fault('learning_transition_failed',action==='logout'||action==='/api/auth/logout'?'Your latest progress could not be synced. You are still signed in; retry before signing out.':'Your learning could not be kept safely before this account change. Try connecting again, then retry.');
    }
  }
  async function readJSON(response) {
    if(Number(response.headers.get('content-length'))>65536)throw fault('invalid_response','The account response was too large. Please try again.');
    const reader=response.body?.getReader();
    if(!reader)throw fault('invalid_response','The account service returned an empty response.');
    const chunks=[];let size=0;
    try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>65536){await reader.cancel();throw fault('invalid_response','The account response was too large. Please try again.');}chunks.push(part.value);}}
    finally{reader.releaseLock();}
    const bytes=new Uint8Array(size);let offset=0;chunks.forEach(chunk=>{bytes.set(chunk,offset);offset+=chunk.byteLength;});
    try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch(_){throw fault('invalid_response','The account service returned an unreadable response. Please try again.');}
  }
  function responseError(response, value) {
    const code=object(value)&&typeof value.error==='string'?value.error:'';
    const texts={
      invalid_credentials:'Email or password was not accepted. If you just registered, verify your email first.',
      invalid_email:'Enter a valid email address.', invalid_name:'Use a display name of 1–100 characters.',
      password_policy:'Use a password with 15–128 characters. Spaces are kept.',
      account_changed:'The signed-in account changed. Review the current account before trying again.',
      authentication_required:'Your sign-in has ended. Please sign in again.',
      csrf_failed:'Your sign-in changed. Refresh the connection and try again.',
      password_service_busy:'Sign-in is busy right now. Please try again in a moment.',
      rate_limited:'Please wait a little before trying again.',
    };
    return fault(code||'unavailable',texts[code]||(response.status===429?texts.rate_limited:'Sign-in is unavailable right now. Please try again later.'));
  }
  async function request(url,method='GET',body,identity,signal) {
    const controller=new AbortController();
    const abort=()=>controller.abort();if(signal){if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true});}
    const timer=setTimeout(abort,15000),headers={Accept:'application/json'};
    if(method!=='GET')headers['Content-Type']='application/json';
    if(identity?.user){headers['X-CNR-User']=identity.user.id;headers['X-CSRF-Token']=identity.csrfToken;}
    try{
      const response=await fetch(url,{method,headers,credentials:'same-origin',cache:'no-store',redirect:'error',signal:controller.signal,...(body===undefined?{}:{body:JSON.stringify(body)})});
      const value=await readJSON(response);if(!response.ok)throw responseError(response,value);return value;
    }catch(error){if(error.code)throw error;throw fault('offline','Could not connect to sign-in. Check your connection and try again.');}
    finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  }
  function invalidateRefresh() {requestEpoch++;refreshController?.abort();inFlight=null;refreshController=null;}
  function fetchSession({force=true,reason='refresh'}={}) {
    if(inFlight)return inFlight;
    if(actionPending&&!force)return Promise.resolve(clone(current));
    if(!force && Date.now()-lastAttempt<30000)return Promise.resolve(clone(current));
    lastAttempt=Date.now();const epoch=requestEpoch,controller=new AbortController();refreshController=controller;
    const promise=(async()=>{
      try{
        const value=validate(await request('/api/auth/session','GET',undefined,undefined,controller.signal));
        if(epoch!==requestEpoch)throw fault('superseded','A newer account action replaced this connection check.');
        return await accept(value,reason);
      }catch(error){
        if(epoch!==requestEpoch)throw fault('superseded','A newer account action replaced this connection check.');
        if(error.code==='learning_transition_failed')throw error;
        await accept(null,'unavailable');
        if(dialog?.open){say(error.message,true);dialog.querySelector('[data-auth-retry]').hidden=false;}
        throw error;
      }finally{if(inFlight===promise){inFlight=null;refreshController=null;render();}}
    })();
    inFlight=promise;return promise;
  }
  function refresh(options) {return mutation?mutation.then(()=>clone(current)):fetchSession(options);}
  function modeChanged(next) {
    if(!titles[next]||busy)return;
    const old=forms.find(form=>form.dataset.authForm===mode);const email=old?.elements.email?.value||'';
    mode=next;clearPasswords();forms.forEach(form=>{if(form.elements.email)form.elements.email.value=email;});say('');render();
    forms.find(form=>form.dataset.authForm===mode)?.querySelector('input')?.focus();
  }
  function closeDialog(success=false) {if(!dialog?.open)return;focusAvatarOnClose=success;dialog.close();}
  function openDialog(next='login',trigger=openButton) {
    if(!dialog)return;
    if(current?.user){openMenu(true);return;}
    closeMenu();returnFocus=trigger;mode=titles[next]?next:'login';clearPasswords();render();
    say(transitionFailed?'Your learning could not finish switching. Try connecting again before continuing.':current?.configured?'':known?'Sign-in is unavailable right now. You can keep learning on this device.':'Checking sign-in options…',transitionFailed);
    if(!dialog.open)dialog.showModal();
    const field=capabilities.email?forms.find(form=>form.dataset.authForm===mode)?.querySelector('input'):dialog.querySelector('[data-auth-close]');field?.focus();
    // Opening a dialog reuses the initial/ongoing check and only refreshes stale discovery.
    refresh({force:false}).catch(()=>{});
  }
  async function perform(form) {
    if(busy||transitioning||transitionFailed||!capabilities.email||!form.reportValidity())return;
    const kind=form.dataset.authForm,fields=Object.fromEntries(new FormData(form));
    if(kind==='register' && (Array.from(fields.password).length<15 || Array.from(fields.password).length>128 || fields.password.includes('\0'))){say('Use a password with 15–128 characters. Spaces are kept.',true);form.elements.password.focus();return;}
    if(kind==='register' && (!fields.name.trim() || /[\u0000-\u001f\u007f]/.test(fields.name))){say('Use a display name of 1–100 characters.',true);form.elements.name.focus();return;}
    const routes={login:'/api/auth/login',register:'/api/auth/register',forgot:'/api/auth/forgot-password',resend:'/api/auth/resend-verification'};
    const body=kind==='register'?{name:fields.name.trim(),email:fields.email.trim(),password:fields.password}:kind==='login'?{email:fields.email.trim(),password:fields.password}:{email:fields.email.trim()};
    busy=true;clearPasswords();say(kind==='login'?'Signing in…':'Sending your request…');render();
    if(kind==='login')invalidateRefresh();
    const operation=(async()=>{
      try{
        if(kind==='login')await beforeAction('login');
        const result=await request(routes[kind],'POST',body);
        if(!object(result)||result.ok!==true)throw fault('invalid_response','The sign-in response could not be verified. Please try again.');
        if(kind==='login'){
          const next=await fetchSession({force:true,reason:'login'});
          if(!next?.user)throw fault('authentication_required','Sign-in could not be confirmed. Please try again.');
          if(dialog?.open)closeDialog(true);
        }else if(kind==='register')say('If this address can be registered, a verification email will arrive shortly. Verify it before signing in.');
        else say(kind==='forgot'?'If this address has an eligible account, a password reset email will arrive shortly.':'If this address needs verification, a verification email will arrive shortly.');
      }catch(error){
        say(error.message,true);
        if(kind==='login'&&error.code!=='learning_transition_failed'){try{await fetchSession({force:true,reason:'login-failed'});}catch(_){} }
        if(error.code==='learning_transition_failed'){transitionFailed=true;render();dialog.querySelector('[data-auth-retry]').hidden=false;}
        throw error;
      }finally{busy=false;clearPasswords();render();}
    })();
    mutation=operation;
    try{await operation;}catch(_){}finally{if(mutation===operation)mutation=null;}
  }
  async function signOut() {
    if(mutation||busy)throw fault('busy','Please wait for the current account request.');
    const expected=current?.user?.id;
    if(!current)throw fault('offline','Reconnect to confirm the current account before signing out.');
    if(!expected)return clone(current);
    busy=true;render();if(menuStatus)menuStatus.textContent='Signing out…';
    const operation=(async()=>{
      try{
        const verified=await fetchSession({force:true});
        if(!verified?.user || verified.user.id!==expected)throw fault('account_changed','The signed-in account changed. Review the current account before trying again.');
        await beforeAction('logout');
        invalidateRefresh();
        const result=await request('/api/auth/logout','POST',{},verified);
        if(!object(result)||result.ok!==true)throw fault('invalid_response','Sign-out could not be confirmed. Please try again.');
        const next=await fetchSession({force:true,reason:'logout'});
        closeMenu();return next;
      }catch(error){if(menuStatus)menuStatus.textContent=error.message;if(error.code==='offline'){await accept(null,'unavailable');}if(error.code==='learning_transition_failed'){transitionFailed=true;render();}if(['account_changed','authentication_required','csrf_failed'].includes(error.code)){try{await fetchSession({force:true});}catch(_){} }throw error;}
      finally{busy=false;render();}
    })();
    mutation=operation;
    try{return await operation;}finally{if(mutation===operation)mutation=null;}
  }

  window.CNRAuth=Object.freeze({
    ready:()=>initial, getSession:()=>clone(current), refresh, signOut,
    open:(next)=>openDialog(next,document.activeElement),
  });
  if(dialog&&widget){
    document.addEventListener('click',event=>{
      const opener=event.target.closest('[data-auth-open]');if(opener){event.preventDefault();openDialog('login',opener);return;}
      if(!menu.hidden&&!menu.contains(event.target)&&!avatar.contains(event.target))closeMenu();
    });
    avatar.addEventListener('click',()=>menu.hidden?openMenu():closeMenu());
    avatar.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();openMenu(true);}});
    widget.querySelector('[data-auth-signout]').addEventListener('click',()=>{signOut().catch(()=>{});});
    widget.querySelector('[data-auth-refresh]').addEventListener('click',()=>{if(menuStatus)menuStatus.textContent='Reconnecting…';refresh({force:true}).catch(error=>{if(menuStatus)menuStatus.textContent=error.message;});});
    menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeMenu()));
    document.addEventListener('focusin',event=>{if(!menu.hidden&&!menu.contains(event.target)&&event.target!==avatar)closeMenu();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden&&!dialog.open){event.preventDefault();closeMenu(true);}});
    dialog.querySelector('[data-auth-close]').addEventListener('click',()=>closeDialog());
    dialog.addEventListener('close',()=>{
      clearPasswords();
      const target=focusAvatarOnClose&&!avatar.hidden?avatar:returnFocus&&returnFocus.isConnected&&returnFocus.getClientRects().length?returnFocus:!avatar.hidden?avatar:openButton;
      focusAvatarOnClose=false;requestAnimationFrame(()=>target?.focus());
    });
    dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeDialog();}});
    dialog.querySelectorAll('[data-auth-mode]').forEach(button=>button.addEventListener('click',()=>modeChanged(button.dataset.authMode)));
    dialog.querySelector('[data-auth-google]').addEventListener('click',event=>{
      event.preventDefault();if(busy||transitioning||transitionFailed||!capabilities.google)return;
      busy=true;clearPasswords();render();say('Opening Google sign-in…');
      beforeAction('google').then(()=>location.assign('/api/auth/google')).catch(error=>{busy=false;transitionFailed=true;say(error.message,true);render();});
    });
    dialog.querySelector('[data-auth-retry]').addEventListener('click',()=>{say('Checking sign-in options…');refresh({force:true}).then(next=>{say(next?.configured?'':'Sign-in is unavailable right now. You can keep learning on this device.');}).catch(()=>{});});
    forms.forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();perform(form);}));
    window.addEventListener('resize',positionMenu,{passive:true});window.addEventListener('scroll',()=>closeMenu(),{passive:true});
    render();
  }
  window.addEventListener('cnr:auth-changing',()=>{actionPending=true;invalidateRefresh();});
  window.addEventListener('cnr:sync-status',event=>{if(typeof event.detail?.message==='string'){syncNotice=event.detail.message.slice(0,400);if(menuStatus&&!busy&&!transitionFailed)menuStatus.textContent=syncNotice;}});
  function checkCurrentSession(){if(document.visibilityState==='visible'&&!mutation&&!actionPending)refresh({force:false}).catch(()=>{});}
  window.addEventListener('focus',checkCurrentSession);
  window.addEventListener('online',()=>{if(document.visibilityState==='visible'&&!mutation&&!actionPending)refresh({force:current===null}).catch(()=>{});});
  document.addEventListener('visibilitychange',checkCurrentSession);
  window.addEventListener('pageshow',event=>{if(event.persisted){busy=false;actionPending=true;invalidateRefresh();closeMenu();if(dialog?.open)say('Checking sign-in options…');render();refresh({force:true,reason:'return'}).catch(()=>{});}});
  // No interval, localStorage token, or per-keystroke request. One deduplicated
  // initial discovery; focus/visibility checks are throttled for 30 seconds.
  // A recovered network immediately retries an unknown/failed session check.
  initial=Promise.resolve().then(()=>fetchSession({force:true,reason:'initial'})).catch(()=>clone(current));
})();
