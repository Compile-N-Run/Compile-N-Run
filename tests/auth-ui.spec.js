/* CNR_PLAYWRIGHT_MODULE=/isolated/path/to/playwright node --test tests/auth-ui.spec.js */
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.CNR_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
const partial=fs.readFileSync(path.join(root,'hugo/layouts/partials/account-menu.html'),'utf8');
const user=(id='user-a',name='Alex Learner')=>({id,name,email:'alex@example.invalid',emailVerified:true,hasPassword:true,googleLinked:true});
const state=()=>({configured:true,providers:{google:true,github:true,email:true},user:null,csrfToken:'csrf-a',calls:[],offline:false,loginError:false});
let browser,server,origin;
before(async()=>{
 server=http.createServer((req,res)=>{
  if(['/auth-ui.js','/auth-ui.css','/learning.js','/learning-sync.js'].includes(req.url)){const ext=req.url.endsWith('.js')?'js':'css';res.setHeader('Content-Type',ext==='js'?'text/javascript':'text/css');res.end(fs.readFileSync(path.join(root,'hugo/assets',ext,req.url.slice(1))));return;}
  res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Auth UI test</title><style>*{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui}:root{--ifm-font-family-base:system-ui;--ifm-color-primary:#176647;--ifm-background-color:white;--ifm-background-surface-color:white;--ifm-font-color-base:#20313e;--ifm-navbar-background-color:white;--ifm-color-emphasis-100:#f4f6f8;--ifm-color-emphasis-200:#dce2e8;--ifm-color-emphasis-300:#adb9c5;--ifm-color-emphasis-700:#52606d}header{display:flex;align-items:center;justify-content:space-between;padding:12px;gap:12px}main{padding:2rem}</style><link rel="stylesheet" href="/auth-ui.css"></head><body><header><a href="/">Compile N Run</a>${partial}</header><main><h1>Keep learning</h1><button id="outside">Outside control</button></main>${req.url.startsWith('/integrated')?'<script>window.CNR_SYNC_ENABLED=true;window.CNR_PAGE={};</script><script src="/learning.js" defer></script><script src="/learning-sync.js" defer></script>':''}<script src="/auth-ui.js" defer></script></body></html>`);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true});
});
after(async()=>{await browser.close();await new Promise(resolve=>server.close(resolve));});
async function setup(t,account=state(),init,pagePath='/'){
 const context=await browser.newContext();t.after(()=>context.close());
 await context.addInitScript(()=>{window.authChanges=[];window.authChanging=[];window.addEventListener('cnr:auth-changed',event=>authChanges.push({session:event.detail.session,reason:event.detail.reason,previousUserId:event.detail.previousUserId}));window.addEventListener('cnr:auth-changing',event=>authChanging.push(event.detail.action));});
 if(init)await context.addInitScript(init);
 await context.route('**/api/**',async route=>{
  const request=route.request(),url=new URL(request.url()),body=request.postData()?JSON.parse(request.postData()):null;
  account.calls.push({path:url.pathname,method:request.method(),headers:request.headers(),body});
  if(account.offline||(account.logoutOffline&&url.pathname.endsWith('/logout'))||(account.learningOffline&&url.pathname==='/api/learning'))return route.abort('internetdisconnected');
  const reply=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)});
  if(url.pathname==='/api/learning'){
   if(account.switchDuringFinalSync){account.switchDuringFinalSync=false;account.user=user('user-b','Bea Learner');account.csrfToken='csrf-b';return reply({error:'account_changed'},409);}
   if(!account.user)return reply({error:'authentication_required'},401);
   if(request.headers()['x-cnr-user']!==account.user.id)return reply({error:'account_changed'},409);
   account.cloud=account.cloud||{};const remote=account.cloud[account.user.id]||{revision:0,data:null};
   if(request.method()==='GET')return reply({...remote,updatedAt:null});
   if(account.holdLearningPut)await account.holdLearningPut();
   if(body.revision!==remote.revision)return reply({error:'revision_conflict'},409);
   account.cloud[account.user.id]={revision:remote.revision+1,data:body.data};return reply({revision:remote.revision+1,updatedAt:new Date().toISOString()});
  }
  if(url.pathname==='/api/auth/session'){
   const result={configured:account.configured,providers:account.providers,user:account.user,...(account.user?{csrfToken:account.csrfToken}:{})};
   if(account.holdSession){const hold=account.holdSession;account.holdSession=null;await hold();}
   return reply(result);
  }
  if(url.pathname==='/api/auth/login'){
   if(account.loginError)return reply({error:'invalid_credentials'},401);
   account.user=user();account.csrfToken='csrf-new';return reply({ok:true});
  }
  if(url.pathname==='/api/auth/logout'){
   if(request.headers()['x-cnr-user']!==account.user?.id)return reply({error:'account_changed'},409);
   if(request.headers()['x-csrf-token']!==account.csrfToken)return reply({error:'csrf_failed'},403);
   account.user=null;return reply({ok:true});
  }
  if(['/api/auth/register','/api/auth/forgot-password','/api/auth/resend-verification'].includes(url.pathname))return reply({ok:true},202);
  return reply({error:'not_found'},404);
 });
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto(origin+pagePath);await page.evaluate(()=>CNRAuth.ready());return{page,account,context,errors};
}
async function open(page){await page.locator('[data-auth-open]').click();await page.locator('[data-auth-dialog]').waitFor({state:'visible'});}
async function login(page){const form=page.locator('[data-auth-form="login"]');await form.locator('[name="email"]').fill('alex@example.invalid');await form.locator('[name="password"]').fill('a secure sample passphrase');await form.getByRole('button',{name:'Sign in',exact:true}).click();}

test('one shared discovery, native dialog focus, provider switches, and safe form methods',async t=>{
 const{page,account,errors}=await setup(t);assert.equal(account.calls.length,1);
 await Promise.all([page.evaluate(()=>CNRAuth.ready()),page.evaluate(()=>CNRAuth.refresh({force:false}))]);assert.equal(account.calls.length,1);
 await open(page);assert.equal(account.calls.length,1);assert.equal(await page.locator('[data-auth-google]').getAttribute('href'),'/api/auth/google');assert.equal(await page.locator('[data-auth-github]').getAttribute('href'),'/api/auth/github');assert.equal(await page.locator('[data-auth-github]').isVisible(),true);
 for(const form of await page.locator('[data-auth-form]').all())assert.equal(await form.getAttribute('method'),'post');
 await page.locator('[data-auth-form="login"] [name="password"]').fill('not persisted');await page.keyboard.press('Escape');
 assert.equal(await page.locator('[data-auth-dialog]').isVisible(),false);await page.waitForFunction(()=>document.querySelector('[data-auth-open]')===document.activeElement);assert.equal(await page.locator('[name="password"]').first().inputValue(),'');
 assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),[]);assert.deepEqual(errors,[]);
});

test('successful login waits for learning ownership before closing and publishes a defensive session',async t=>{
 const{page,account}=await setup(t,state(),()=>{window.addEventListener('cnr:auth-changed',event=>{if(event.detail.reason==='login')event.detail.waitUntil(new Promise(resolve=>{window.finishOwnerChange=resolve;}));});});
 await open(page);await login(page);await page.waitForFunction(()=>typeof finishOwnerChange==='function');
 assert.equal(await page.locator('[data-auth-dialog]').isVisible(),true);
 assert.equal(await page.locator('[data-auth-form="login"] [name="password"]').inputValue(),'');
 await page.evaluate(()=>finishOwnerChange());await page.locator('[data-auth-dialog]').waitFor({state:'hidden'});
 assert.match(await page.locator('[data-auth-avatar]').getAttribute('aria-label'),/Alex Learner/);assert.equal(await page.locator('[data-auth-initials]').textContent(),'AL');
 await page.waitForFunction(()=>document.querySelector('[data-auth-avatar]')===document.activeElement);
 assert.deepEqual(await page.evaluate(()=>authChanging),['login']);
 assert.equal((await page.evaluate(()=>authChanges.at(-1))).session.user.id,'user-a');
 await page.evaluate(()=>{const value=CNRAuth.getSession();value.user.name='mutated';});assert.equal(await page.evaluate(()=>CNRAuth.getSession().user.name),'Alex Learner');
 assert.equal(account.calls.filter(call=>call.path==='/api/auth/login').length,1);
});

test('failed learning transition retains authoritative identity and visible retry instead of pretending sign-in is ready',async t=>{
 const{page}=await setup(t,state(),()=>{window.rejectTransition=true;window.addEventListener('cnr:auth-changed',event=>{if(event.detail.session?.user&&rejectTransition)event.detail.waitUntil(Promise.reject(new Error('storage full')));});});
 await open(page);await login(page);await page.waitForFunction(()=>document.querySelector('[data-auth-message]').textContent.includes('could not finish switching'));
 assert.equal(await page.evaluate(()=>CNRAuth.getSession().user.id),'user-a');assert.equal(await page.locator('[data-auth-dialog]').isVisible(),true);assert.equal(await page.locator('[data-auth-retry]').isVisible(),true);
 assert.equal(await page.evaluate(()=>authChanges.at(-1).session.user.id),'user-a');
 await page.evaluate(()=>rejectTransition=false);await page.locator('[data-auth-retry]').click();await page.locator('[data-auth-dialog]').waitFor({state:'hidden'});
});

test('avatar treats hostile names as text and supports compact menu keyboard and guarded logout',async t=>{
 const account=state();account.user=user('user-a','<img src=x onerror=alert(1)>');const{page}=await setup(t,account);
 await page.locator('[data-auth-avatar]').click();assert.equal(await page.locator('[data-auth-name]').textContent(),account.user.name);assert.equal(await page.locator('[data-auth-menu] img').count(),0);
 assert.equal(await page.locator('[data-auth-menu] a[href="/profile/"]').count(),1);assert.equal(await page.locator('[data-auth-menu] a[href="/learn/"]').count(),1);
 await page.keyboard.press('Escape');assert.equal(await page.locator('[data-auth-menu]').isVisible(),false);assert.equal(await page.locator('[data-auth-avatar]').evaluate(n=>n===document.activeElement),true);
 await page.locator('[data-auth-avatar]').click();await page.locator('[data-auth-signout]').click();await page.locator('[data-auth-open]').waitFor({state:'visible'});
 const logout=account.calls.find(call=>call.path==='/api/auth/logout');assert.equal(logout.headers['x-cnr-user'],'user-a');assert.equal(logout.headers['x-csrf-token'],'csrf-a');
 assert.deepEqual(await page.evaluate(()=>authChanging),['logout']);assert.equal(await page.evaluate(()=>authChanges.at(-1).session.user),null);
});

test('registration and recovery are usable in the popup without credentials entering storage',async t=>{
 const{page,account}=await setup(t);await open(page);await page.locator('[data-auth-mode="register"]').click();
 const form=page.locator('[data-auth-form="register"]');await form.locator('[name="name"]').fill('New Learner');await form.locator('[name="email"]').fill('new@example.invalid');await form.locator('[name="password"]').fill('a long new passphrase');await form.getByRole('button',{name:'Create account',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[data-auth-message]').textContent.includes('verification email'));assert.equal(await form.locator('[name="password"]').inputValue(),'');
 await page.locator('[data-auth-mode="login"]').click();await page.locator('[data-auth-mode="forgot"]').click();await page.locator('[data-auth-form="forgot"]').getByRole('button',{name:'Send reset link'}).click();
 await page.waitForFunction(()=>document.querySelector('[data-auth-message]').textContent.includes('eligible account'));
 await page.locator('[data-auth-mode="login"]').click();await page.locator('[data-auth-mode="resend"]').click();await page.locator('[data-auth-form="resend"]').getByRole('button',{name:'Resend verification email'}).click();
 await page.waitForFunction(()=>document.querySelector('[data-auth-message]').textContent.includes('needs verification'));
 assert.deepEqual(account.calls.filter(call=>call.method==='POST').map(call=>call.path),['/api/auth/register','/api/auth/forgot-password','/api/auth/resend-verification']);assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),[]);
});

test('focus checks are throttled; a fresh refresh discovers account switch and coalesces callers',async t=>{
 const account=state();account.user=user();const{page}=await setup(t,account);
 await page.evaluate(()=>{for(let i=0;i<10;i++){dispatchEvent(new Event('focus'));dispatchEvent(new Event('online'));}});assert.equal(account.calls.length,1);
 account.user=user('user-b','Bea Learner');account.csrfToken='csrf-b';
 await page.evaluate(()=>Promise.all([CNRAuth.refresh(),CNRAuth.refresh(),CNRAuth.refresh()]));assert.equal(account.calls.length,2);
 const last=await page.evaluate(()=>authChanges.at(-1));assert.equal(last.previousUserId,'user-a');assert.equal(last.session.user.id,'user-b');assert.equal(await page.locator('[data-auth-initials]').textContent(),'BL');
});

test('unknown network failure is not a successful logout, and changed account is never logged out with stale identity',async t=>{
 const account=state();account.user=user();const{page}=await setup(t,account);
 account.user=user('user-b','Bea Learner');account.csrfToken='csrf-b';
 await page.locator('[data-auth-avatar]').click();await page.locator('[data-auth-signout]').click();await page.waitForFunction(()=>CNRAuth.getSession()?.user?.id==='user-b');
 assert.equal(account.calls.filter(call=>call.path==='/api/auth/logout').length,0);
 account.logoutOffline=true;await page.locator('[data-auth-avatar]').click();await page.locator('[data-auth-signout]').click();await page.waitForFunction(()=>CNRAuth.getSession()===null);
 const last=await page.evaluate(()=>authChanges.at(-1));assert.equal(last.reason,'unavailable');assert.equal(last.session,null);assert.equal(account.user.id,'user-b');
});

test('mobile popup and account menu fit 320px and native dialog keeps keyboard focus',async t=>{
 const{page}=await setup(t);await page.setViewportSize({width:320,height:740});await open(page);
 const box=await page.locator('[data-auth-dialog]').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=320);
 for(let n=0;n<24;n++)await page.keyboard.press('Tab');assert.equal(await page.locator('[data-auth-dialog]').evaluate(n=>n.contains(document.activeElement)),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'/tmp/cnr-auth-mobile.png',fullPage:true});
 await login(page);await page.locator('[data-auth-dialog]').waitFor({state:'hidden'});await page.locator('[data-auth-avatar]').click();const menu=await page.locator('[data-auth-menu]').boundingBox();assert.ok(menu.x>=0&&menu.x+menu.width<=320);
});


test('auth-changing waits before login and a delayed old session response cannot replace the new identity',async t=>{
 const account=state();const{page}=await setup(t,account,()=>{window.addEventListener('cnr:auth-changing',event=>{if(event.detail.action==='login')event.detail.waitUntil(new Promise(resolve=>{window.finishBeforeLogin=resolve;}));});});
 await open(page);
 let releaseOld,oldStarted;const started=new Promise(resolve=>{oldStarted=resolve;});account.holdSession=()=>{oldStarted();return new Promise(resolve=>{releaseOld=resolve;});};
 await page.evaluate(()=>{window.oldCheck=CNRAuth.refresh().catch(error=>({code:error.code}));});await started;
 await login(page);await page.waitForFunction(()=>typeof finishBeforeLogin==='function');
 assert.equal(account.calls.filter(call=>call.path==='/api/auth/login').length,0);
 await page.evaluate(()=>finishBeforeLogin());await page.locator('[data-auth-dialog]').waitFor({state:'hidden'});
 releaseOld();await page.evaluate(()=>oldCheck);
 assert.equal(await page.evaluate(()=>CNRAuth.getSession().user.id),'user-a');
 assert.equal(await page.evaluate(()=>authChanges.at(-1).session.user.id),'user-a');
});

test('failed password login clears fields and resumes only after authoritative guest discovery',async t=>{
 const account=state();account.loginError=true;const{page}=await setup(t,account);await open(page);await login(page);
 await page.waitForFunction(()=>document.querySelector('[data-auth-message]').textContent.includes('not accepted'));
 assert.equal(await page.locator('[data-auth-dialog]').isVisible(),true);
 assert.equal(await page.locator('[data-auth-form="login"] [name="password"]').inputValue(),'');
 await page.waitForFunction(()=>authChanges.at(-1)?.reason==='login-failed');
 assert.equal(await page.evaluate(()=>authChanges.at(-1).session.user),null);
});


function learningSnapshot(text){const stamp=Date.now()-1000;return{format:'cnr-learning-backup',version:1,exportedAt:new Date().toISOString(),progress:{v:1,done:{},tuts:{}},learning:{v:1,lessons:{'/docs/language/css/':{title:'CSS',course:'language/css',visitedAt:stamp,updatedAt:stamp,practice:{},note:{text,updatedAt:stamp}}}},playground:{version:1,drafts:{}}};}
test('actual auth and learning-sync modules keep account A protected when a quota failure interrupts switching to B',async t=>{
 const account=state();account.user=user('user-a','Alex Learner');account.cloud={'user-a':{revision:1,data:learningSnapshot('Private account A note')},'user-b':{revision:1,data:learningSnapshot('Private account B note')}};
 const{page,errors}=await setup(t,account,null,'/integrated');
 await page.waitForFunction(()=>CNRLearningSync.getOwner()==='user:user-a'&&CNRLearning.getSnapshot().learning.lessons['/docs/language/css/']?.note?.text==='Private account A note');
 await page.evaluate(()=>{window.failOwnerWrite=true;const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(failOwnerWrite&&key==='cnr_learning_v1')throw new DOMException('Quota exceeded','QuotaExceededError');return original.call(this,key,value);};});
 account.user=user('user-b','Bea Learner');account.csrfToken='csrf-b';
 const code=await page.evaluate(()=>CNRAuth.refresh().then(()=>null,error=>error.code));assert.equal(code,'learning_transition_failed');
 assert.equal(await page.evaluate(()=>CNRAuth.getSession().user.id),'user-b');assert.equal(await page.evaluate(()=>CNRLearning.canWrite()),false);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('cnr_learning_v1')).lessons['/docs/language/css/'].note.text),'Private account A note');
 assert.equal(account.calls.filter(call=>call.path==='/api/learning'&&call.method==='PUT'&&call.headers['x-cnr-user']==='user-b').length,0);
 await page.locator('[data-auth-avatar]').click();await page.locator('[data-auth-refresh]').waitFor({state:'visible'});
 await page.evaluate(()=>failOwnerWrite=false);await page.locator('[data-auth-refresh]').click();
 await page.waitForFunction(()=>CNRLearningSync.getOwner()==='user:user-b'&&CNRLearning.canWrite()&&CNRLearning.getSnapshot().learning.lessons['/docs/language/css/']?.note?.text==='Private account B note');
 assert.deepEqual(errors,[]);
});


test('Google navigation waits for the same outgoing-learning gate',async t=>{
 const{page,account}=await setup(t,state(),()=>{window.addEventListener('cnr:auth-changing',event=>{if(event.detail.action==='google')event.detail.waitUntil(new Promise(resolve=>{window.finishGoogleGate=resolve;}));});});
 await open(page);await page.locator('[data-auth-google]').click();await page.waitForFunction(()=>typeof finishGoogleGate==='function');
 assert.equal(account.calls.some(call=>call.path==='/api/auth/google'),false);assert.equal(new URL(page.url()).pathname,'/');
 await page.evaluate(()=>finishGoogleGate());await page.waitForURL('**/api/auth/google');
 assert.equal(account.calls.some(call=>call.path==='/api/auth/google'),true);
});

test('unconfigured providers offer a retry without exposing nonfunctional forms',async t=>{
 const account=state();account.configured=false;const{page}=await setup(t,account);await open(page);
 assert.equal(await page.locator('[data-auth-google]').isVisible(),false);assert.equal(await page.locator('[data-auth-email]').isVisible(),false);assert.equal(await page.locator('[data-auth-retry]').isVisible(),true);
 account.configured=true;await page.locator('[data-auth-retry]').click();await page.locator('[data-auth-email]').waitFor({state:'visible'});
 assert.equal(await page.evaluate(()=>CNRAuth.getSession().configured),true);
});


test('network recovery immediately retries an unknown session without waiting for another focus',async t=>{
 const account=state();account.user=user();const{page}=await setup(t,account);
 account.offline=true;await page.evaluate(()=>CNRAuth.refresh().catch(()=>{}));
 assert.equal(await page.evaluate(()=>CNRAuth.getSession()),null);
 account.offline=false;await page.evaluate(()=>dispatchEvent(new Event('online')));
 await page.waitForFunction(()=>CNRAuth.getSession()?.user?.id==='user-a');
 assert.equal(await page.locator('[data-auth-avatar]').isVisible(),true);
 assert.equal(account.calls.filter(call=>call.path==='/api/auth/session').length,3);
});


test('returning from a cached OAuth navigation refreshes identity and releases the old action gate',async t=>{
 const account=state();account.user=user();const{page}=await setup(t,account);
 await page.evaluate(()=>dispatchEvent(new CustomEvent('cnr:auth-changing',{detail:{action:'google',session:CNRAuth.getSession()}})));
 account.user=user('user-b','Bea Learner');account.csrfToken='csrf-b';
 await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
 await page.waitForFunction(()=>CNRAuth.getSession()?.user?.id==='user-b');
 assert.equal(await page.evaluate(()=>authChanges.at(-1).reason),'return');
 assert.equal(await page.locator('[data-auth-avatar]').isEnabled(),true);
});

test('real popup login and logout await scope changes without uploading or losing guest notes',async t=>{
 const account=state();account.cloud={'user-a':{revision:1,data:learningSnapshot('Account-only note')}};
 const{page,errors}=await setup(t,account,null,'/integrated');
 await page.waitForFunction(()=>CNRLearningSync.getOwner()==='guest'&&CNRLearning.canWrite());
 await page.evaluate(()=>CNRLearning.saveNote('/docs/language/css/','Guest-only note'));
 await open(page);await login(page);await page.locator('[data-auth-dialog]').waitFor({state:'hidden'});
 await page.waitForFunction(()=>CNRLearningSync.getOwner()==='user:user-a'&&CNRLearning.getSnapshot().learning.lessons['/docs/language/css/']?.note?.text==='Account-only note');
 assert.equal(account.calls.filter(call=>call.path==='/api/learning'&&call.method==='PUT').some(call=>JSON.stringify(call.body).includes('Guest-only note')),false);
 await page.locator('[data-auth-avatar]').click();await page.locator('[data-auth-signout]').click();
 await page.waitForFunction(()=>CNRAuth.getSession()?.user===null&&CNRLearningSync.getOwner()==='guest'&&CNRLearning.canWrite());
 assert.equal(await page.evaluate(()=>CNRLearning.getSnapshot().learning.lessons['/docs/language/css/'].note.text),'Guest-only note');
 assert.deepEqual(await page.evaluate(()=>authChanging),['login','logout']);assert.deepEqual(errors,[]);
});


test('an account read mark is saved to the server before immediate sign-out',async t=>{
 const account=state();account.user=user();account.cloud={'user-a':{revision:1,data:learningSnapshot('Account note')}};
 const{page}=await setup(t,account,null,'/integrated');
 await page.waitForFunction(()=>CNRLearningSync.getOwner()==='user:user-a'&&CNRLearning.canWrite()&&CNRLearningSync.getStatus().state==='saved');
 await page.evaluate(()=>{CNRLearning.setRead('/docs/language/css/',true);return CNRAuth.signOut();});
 assert.equal(account.user,null);
 assert.ok(account.cloud['user-a'].data.progress.done['/docs/language/css/'],'The just-recorded read mark must exist on the server before logout completes');
 const put=account.calls.findIndex(call=>call.path==='/api/learning'&&call.method==='PUT');
 const logout=account.calls.findIndex(call=>call.path==='/api/auth/logout');assert.ok(put>=0&&logout>put);
});


test('sign-out does not revoke its cookie while the final progress PUT is awaiting acknowledgement',async t=>{
 const account=state();account.user=user();account.cloud={'user-a':{revision:1,data:learningSnapshot('Account note')}};
 const{page}=await setup(t,account,null,'/integrated');
 await page.waitForFunction(()=>CNRLearning.canWrite()&&CNRLearningSync.getStatus().state==='saved');
 let started,release;const began=new Promise(resolve=>{started=resolve;});const held=new Promise(resolve=>{release=resolve;});
 account.holdLearningPut=()=>{started();return held;};
 const ending=page.evaluate(()=>{CNRLearning.setRead('/docs/language/css/',true);return CNRAuth.signOut();});
 let timeout;try{await Promise.race([began,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('No final PUT was started')),5000);})]);
  assert.equal(account.calls.some(call=>call.path==='/api/auth/logout'),false);assert.equal(account.user.id,'user-a');
 }finally{clearTimeout(timeout);release();}
 await ending;assert.ok(account.cloud['user-a'].data.progress.done['/docs/language/css/']);assert.equal(account.user,null);
});

test('an offline final sync keeps sign-in and durable pending progress until an explicit retry',async t=>{
 const account=state();account.user=user();account.cloud={'user-a':{revision:1,data:learningSnapshot('Account note')}};
 const{page}=await setup(t,account,null,'/integrated');
 await page.waitForFunction(()=>CNRLearning.canWrite()&&CNRLearningSync.getStatus().state==='saved');
 account.learningOffline=true;
 const code=await page.evaluate(()=>{CNRLearning.setRead('/docs/language/css/',true);return CNRAuth.signOut().then(()=>null,error=>error.code);});
 assert.equal(code,'learning_transition_failed');assert.equal(account.user.id,'user-a');assert.equal(account.calls.some(call=>call.path==='/api/auth/logout'),false);
 const pending=await page.evaluate(()=>new Promise((resolve,reject)=>{const open=indexedDB.open('cnr-learning-sync-v1');open.onerror=()=>reject(open.error);open.onsuccess=()=>{const db=open.result,read=db.transaction('state','readonly').objectStore('state').get('user:user-a');read.onerror=()=>reject(read.error);read.onsuccess=()=>{resolve(read.result);db.close();};};}));
 assert.ok(pending.local.progress.done['/docs/language/css/']);assert.equal(pending.pending,true);
 await page.locator('[data-auth-avatar]').click();assert.match(await page.locator('[data-auth-menu-status]').textContent(),/learning|progress|retry/i);
 account.learningOffline=false;await page.locator('[data-auth-refresh]').click();
 await page.waitForFunction(()=>CNRLearning.canWrite()&&CNRLearningSync.getStatus().state==='saved');
 assert.ok(account.cloud['user-a'].data.progress.done['/docs/language/css/']);
 await page.evaluate(()=>CNRAuth.signOut());assert.equal(account.user,null);
});


test('an account switch detected during the final sync aborts logout without uploading account A into B',async t=>{
 const account=state();account.user=user();account.cloud={'user-a':{revision:1,data:learningSnapshot('Account A note')},'user-b':{revision:1,data:learningSnapshot('Account B note')}};
 const{page}=await setup(t,account,null,'/integrated');
 await page.waitForFunction(()=>CNRLearning.canWrite()&&CNRLearningSync.getStatus().state==='saved');
 account.switchDuringFinalSync=true;
 const code=await page.evaluate(()=>{CNRLearning.setRead('/docs/language/css/',true);return CNRAuth.signOut().then(()=>null,error=>error.code);});
 assert.equal(code,'account_changed');assert.equal(account.calls.some(call=>call.path==='/api/auth/logout'),false);
 assert.equal(account.user.id,'user-b');assert.equal(await page.evaluate(()=>CNRAuth.getSession().user.id),'user-b');
 assert.equal(account.cloud['user-b'].data.progress.done['/docs/language/css/'],undefined);
});

test('guests are invited to sign in after a second page, once, and snoozed after dismissing',async t=>{
 const init=()=>{window.CNR_INVITE_DELAY_MS=200;};
 const{page,errors}=await setup(t,state(),init,'/docs/python/intro/');
 await page.waitForTimeout(600);assert.equal(await page.locator('[data-auth-dialog]').isVisible(),false,'no invite on the first page');
 await page.goto(page.url().replace('/intro/','/next/'));await page.evaluate(()=>CNRAuth.ready());
 await page.locator('[data-auth-dialog]').waitFor({state:'visible'});
 assert.match(await page.locator('[data-auth-message]').innerText(),/free account/);
 await page.keyboard.press('Escape');assert.equal(await page.locator('[data-auth-dialog]').isVisible(),false);
 const snooze=await page.evaluate(()=>JSON.parse(localStorage.getItem('cnr-auth-invite')));assert.equal(snooze.dismissed,1);assert.ok(snooze.until>Date.now()+13*86400000);
 await page.goto(page.url().replace('/next/','/third/'));await page.evaluate(()=>CNRAuth.ready());await page.waitForTimeout(600);
 assert.equal(await page.locator('[data-auth-dialog]').isVisible(),false,'snoozed after a dismissal');
 assert.deepEqual(errors,[]);
});

test('a guest who saves progress is invited right away; signed-in and unconfigured visitors never are',async t=>{
 const{page}=await setup(t,state(),undefined,'/docs/python/intro/');
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('cnr:learning-updated',{detail:{persistent:true}})));
 await page.locator('[data-auth-dialog]').waitFor({state:'visible'});assert.match(await page.locator('[data-auth-message]').innerText(),/Saved on this device/);
 await page.locator('[data-auth-close]').click();
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('cnr:learning-updated',{detail:{persistent:true}})));await page.waitForTimeout(2000);
 assert.equal(await page.locator('[data-auth-dialog]').isVisible(),false,'at most once per visit');
 const signedIn=state();signedIn.user=user();const second=await setup(t,signedIn,()=>{window.CNR_INVITE_DELAY_MS=100;},'/docs/python/intro/');
 await second.page.goto(second.page.url().replace('/intro/','/next/'));await second.page.evaluate(()=>CNRAuth.ready());await second.page.waitForTimeout(500);
 assert.equal(await second.page.locator('[data-auth-dialog]').isVisible(),false,'signed-in readers are not invited');
 const off=state();off.configured=false;off.providers={google:false,github:false,email:false};const third=await setup(t,off,()=>{window.CNR_INVITE_DELAY_MS=100;},'/docs/python/intro/');
 await third.page.goto(third.page.url().replace('/intro/','/next/'));await third.page.evaluate(()=>CNRAuth.ready());await third.page.waitForTimeout(500);
 assert.equal(await third.page.locator('[data-auth-dialog]').isVisible(),false,'nothing to invite to when sign-in is unavailable');
});
