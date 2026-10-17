/* CNR_PLAYWRIGHT_MODULE=/isolated/path/to/playwright node --test tests/learning-sync.spec.js */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'); const path = require('node:path'); const http = require('node:http');
const { chromium } = require(process.env.CNR_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..'), PAGE = '/docs/language/css/a/', OTHER = '/docs/language/css/b/';
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const accountMenu = read('hugo/layouts/partials/account-menu.html');
const dashboard = read('hugo/layouts/learning/single.html').replace(/{{[^}]*}}/g, '');
const tools = read('hugo/layouts/partials/learning-tools.html');
const exercises = JSON.parse(read('hugo/data/exercises.json'));
const exerciseData = JSON.stringify(exercises).replace(/</g, '\\u003c');
const stamp = () => Date.now() - 5000;
function blank() { return { format:'cnr-learning-backup',version:1,exportedAt:new Date().toISOString(),progress:{v:1,done:{},tuts:{}},learning:{v:1,lessons:{}},playground:{version:1,drafts:{}} }; }
function note(text) { return { title:'A lesson',course:'language/css',visitedAt:stamp(),updatedAt:stamp(),practice:{},note:{text,updatedAt:stamp()} }; }
function draft(html) { return {html,css:'',js:'',title:'Draft',path:PAGE,course:'language/css',exerciseId:'',updatedAt:new Date(stamp()).toISOString()}; }
function user(id) { return {id,name:id,email:id+'@example.test',emailVerified:true,hasPassword:true,googleLinked:false}; }
function cloud(data=blank()) { return {revision:1,data,updatedAt:new Date().toISOString(),writes:0,gets:0}; }
let server,browser,origin;
before(async()=>{
 server=http.createServer((req,res)=>{
  const file=req.url.split('?')[0].slice(1);
  if(['learning.js','learning-sync.js','auth-ui.js','playground.js'].includes(file)){res.setHeader('content-type','text/javascript; charset=utf-8');return res.end(read('hugo/assets/js/'+file));}
  if(file==='learning-catalog.json'){res.setHeader('content-type','application/json');return res.end(JSON.stringify({v:1,courses:[]}));}
  const lesson=req.url.startsWith('/docs/');
  res.setHeader('content-type','text/html; charset=utf-8');
  res.end(`<!doctype html><html><head><meta charset="utf-8"><style>[hidden]{display:none!important}body{font:16px system-ui}dialog:not([open]){display:none}textarea{width:500px;height:100px}</style></head><body>${accountMenu}${lesson?`<main>${tools}</main>`:dashboard}<div data-playground-root></div><script id="cnr-exercises-data" type="application/json">${exerciseData}</script><script>window.CNR_SYNC_ENABLED=true;window.CNR_PAGE=${JSON.stringify(lesson?{path:PAGE,title:'A lesson',course:'language/css',courseLabel:'CSS',courseUrl:'/docs/category/css/'}:{})}</script><script src="/learning.js" defer></script><script src="/learning-sync.js" defer></script><script src="/auth-ui.js" defer></script><script src="/playground.js" defer></script></body></html>`);
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true});
});
after(async()=>{await browser.close();await new Promise(r=>server.close(r));});
async function device(t,shared,options={}){
 const context=await browser.newContext();t.after(()=>context.close());
 const model={id:options.id===undefined?'alice':options.id,offline:false,status:0,sessionDelay:options.sessionDelay||0,requests:[],putHook:null};
 const initial=options.local||blank();
 if(model.id)await context.addInitScript(()=>{document.cookie='cnr_signed_in=1; Path=/';}); // the Worker sets this hint beside the session cookie; without it pages assume a guest
 await context.addInitScript(({initial,owner})=>{if(!localStorage.getItem('__seed__')){localStorage.setItem('__seed__','1');for(const [k,v]of Object.entries({cnr_progress:initial.progress,cnr_learning_v1:initial.learning,cnr_playground_v1:initial.playground}))localStorage.setItem(k,JSON.stringify(v));if(owner)localStorage.setItem('cnr_learning_owner_v1',JSON.stringify({v:1,owner}));}}, {initial,owner:options.owner});
 await context.route('**/api/**',async route=>{
  const req=route.request(),p=new URL(req.url()).pathname,method=req.method(),body=req.postData()?req.postDataJSON():null;model.requests.push({p,method,body,headers:req.headers()});
  const reply=(value,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(value)}).catch(()=>{});
  if(p==='/api/auth/session'){if(model.sessionDelay)await new Promise(r=>setTimeout(r,model.sessionDelay));return reply({configured:true,providers:{google:true,email:true},user:model.id?user(model.id):null,...(model.id?{csrfToken:'csrf-'+model.id}:{})});}
  if(p==='/api/auth/login'){model.id=body.email.split('@')[0];return reply({ok:true});}
  if(p==='/api/auth/logout'){model.id=null;return reply({ok:true});}
  if(p!=='/api/learning')return reply({error:'unknown'},404);
  if(model.offline)return route.abort('internetdisconnected');
  if(!model.id)return reply({error:'authentication_required'},401);
  if(req.headers()['x-cnr-user']!==model.id)return reply({error:'account_changed'},409);
  const entry=shared[model.id]||(shared[model.id]={revision:0,data:null,updatedAt:null,writes:0,gets:0});
  const capabilities=()=>options.protocol2?{syncProtocol:2,incremental:entry.incremental!==false}:{};
  if(method==='GET'){entry.gets++;if(model.getHook)await model.getHook();if(model.status===429)return reply({error:'rate_limited'},429);if(options.protocol2&&req.headers()['x-cnr-revision']===String(entry.revision))return reply({revision:entry.revision,updatedAt:entry.updatedAt,unchanged:true,...capabilities()});return reply({...entry,...capabilities()});}
  if(model.putHook)await model.putHook(entry,body);
  if(model.status)return reply({error:model.status===413?'snapshot_too_large':'rate_limited'},model.status);
  if(req.headers()['x-csrf-token']!=='csrf-'+model.id)return reply({error:'csrf_failed'},403);
  if(body.revision!==entry.revision)return reply({error:'revision_conflict',revision:entry.revision},409);
  if(method==='PATCH'){
   assert(options.protocol2&&entry.incremental!==false,'PATCH must be negotiated');
   const next=structuredClone(entry.data||blank()),maps={read:next.progress.done,course:next.progress.tuts,lesson:next.learning.lessons,draft:next.playground.drafts};
   for(const row of body.changes){if(row.value===null)delete maps[row.kind][row.key];else maps[row.kind][row.key]=row.value;}
   next.exportedAt=body.exportedAt;entry.data=next;
  }else entry.data=body.data;
  entry.incremental=true;entry.revision++;entry.writes++;entry.updatedAt=new Date().toISOString();return reply({revision:entry.revision,updatedAt:entry.updatedAt,...capabilities()});
 });
 const page=await context.newPage();await page.goto(origin+(options.route||'/learn/'));await page.waitForFunction(()=>window.CNRAuth&&window.CNRLearningSync);if(options.beforeReady)await options.beforeReady(page,model);await page.evaluate(()=>window.CNRAuth.ready());
 await page.waitForFunction(()=>window.CNRLearning.canWrite());await flush(page);return {page,context,model};
}
async function flush(page){await page.evaluate(async()=>{await window.CNRLearningSync.flush();});}
async function changeAccount(page,model,id){model.id=id;await page.evaluate(()=>window.CNRAuth.refresh({force:true}));await page.waitForFunction(()=>window.CNRLearning.canWrite());await flush(page);}
async function state(page){return page.evaluate(()=>window.CNRLearning.getSnapshot());}

test('real auth integration isolates guest and two account partitions; logout restores guest',async t=>{
 const g=blank();g.learning.lessons[PAGE]=note('Guest note');const a=blank();a.learning.lessons[PAGE]=note('Alice note');const b=blank();b.learning.lessons[PAGE]=note('Bob note');const shared={alice:cloud(a),bob:cloud(b)};
 const {page,model}=await device(t,shared,{local:g});assert.equal((await state(page)).learning.lessons[PAGE].note.text,'Alice note');assert.equal(shared.alice.writes,0);
 await changeAccount(page,model,'bob');assert.equal((await state(page)).learning.lessons[PAGE].note.text,'Bob note');assert.equal(shared.bob.writes,0);
 await page.evaluate(()=>window.CNRAuth.signOut());assert.equal((await state(page)).learning.lessons[PAGE].note.text,'Guest note');assert.equal(await page.evaluate(()=>window.CNRLearningSync.getOwner()),'guest');
});

test('two devices honor unread, unbookmark, note clearing, and draft deletion while keeping independent edits',async t=>{
 const start=blank();start.progress.done[PAGE]=stamp();start.learning.lessons[PAGE]={...note('Original'),bookmark:{value:true,updatedAt:stamp()}};start.playground.drafts.workspace=draft('<p>Original</p>');const shared={alice:cloud(start)};
 const one=await device(t,shared),two=await device(t,shared);
 await one.page.evaluate(async p=>{await CNRLearning.setRead(p,false);await CNRLearning.setBookmark(p,false);await CNRLearning.saveNote(p,'');const before=JSON.parse(localStorage.getItem('cnr_playground_v1')),after=JSON.parse(JSON.stringify(before));delete after.drafts.workspace;await CNRLearningSync.commitPlayground(before,after);},PAGE);await flush(one.page);
 await two.page.evaluate(p=>CNRLearning.saveNote(p,'Independent edit'),OTHER);await flush(two.page);
 const result=shared.alice.data;assert.equal(result.progress.done[PAGE],undefined);assert.equal(result.learning.lessons[PAGE].bookmark.value,false);assert.equal(result.learning.lessons[PAGE].note.text,'');assert.equal(result.playground.drafts.workspace,undefined);assert.equal(result.learning.lessons[OTHER].note.text,'Independent edit');
});

test('CAS conflict retries three-way merge rather than overwriting a newer remote note',async t=>{
 const shared={alice:cloud()};const {page,model}=await device(t,shared);await page.evaluate(p=>CNRLearning.saveNote(p,'Local note'),PAGE);
 model.putHook=async entry=>{model.putHook=null;entry.data.learning.lessons[OTHER]=note('Other device');entry.revision++;};await flush(page);assert.equal(shared.alice.writes,0);await flush(page);
 assert.equal(shared.alice.data.learning.lessons[PAGE].note.text,'Local note');assert.equal(shared.alice.data.learning.lessons[OTHER].note.text,'Other device');
});

test('meaningful concurrent note and draft edits keep losing versions',async t=>{
 const {page}=await device(t,{alice:cloud()});
 const b=blank();b.learning.lessons[PAGE]=note('Base');b.playground.drafts.workspace=draft('<p>Base</p>');const l=structuredClone(b),r=structuredClone(b);
 l.learning.lessons[PAGE].note={text:'Local',updatedAt:Date.now()-100};r.learning.lessons[PAGE].note={text:'Remote',updatedAt:Date.now()};l.playground.drafts.workspace=draft('<p>Local</p>');r.playground.drafts.workspace=draft('<p>Remote</p>');
 const merged=await page.evaluate(({b,l,r})=>CNRLearningSync.threeWay(b,l,r),{b,l,r});assert.equal(merged.learning.lessons[PAGE].note.text,'Remote');assert(merged.learning.lessons[PAGE].noteConflicts.some(n=>n.text==='Local'));assert.equal(Object.keys(merged.playground.drafts).length,2);
});

test('offline edits survive reload and are never uploaded into a different account',async t=>{
 const shared={alice:cloud(),bob:cloud()};const {page,model}=await device(t,shared);model.offline=true;await page.evaluate(p=>CNRLearning.saveNote(p,'Offline Alice'),PAGE);await flush(page);await page.reload();await page.evaluate(()=>CNRAuth.ready());await page.waitForFunction(()=>CNRLearning.canWrite());
 assert.equal((await state(page)).learning.lessons[PAGE].note.text,'Offline Alice');model.offline=false;await changeAccount(page,model,'bob');assert.equal(shared.bob.writes,0);assert.equal((await state(page)).learning.lessons[PAGE],undefined);
 await changeAccount(page,model,'alice');assert.equal((await state(page)).learning.lessons[PAGE].note.text,'Offline Alice');
});

test('plain playground typing syncs without Run and a clean reload does not upload exportedAt churn',async t=>{
 const shared={alice:cloud()};const {page,model}=await device(t,shared);await page.getByRole('textbox',{name:'HTML source'}).fill('<h1>Typed without running</h1>');await flush(page);assert.equal(shared.alice.data.playground.drafts.workspace.html,'<h1>Typed without running</h1>');
 const writes=shared.alice.writes;await page.reload();await page.evaluate(()=>CNRAuth.ready());await page.waitForFunction(()=>CNRLearning.canWrite());await flush(page);await flush(page);assert.equal(shared.alice.writes,writes);assert(model.requests.some(r=>r.method==='PUT'));
});

test('dirty note and playground code are archived to their old owner before switching',async t=>{
 const shared={alice:cloud(),bob:cloud()};const {page,model}=await device(t,shared,{route:PAGE});await page.getByText('Your lesson notes',{exact:true}).click();await page.locator('[data-learning-note]').fill('Unsaved Alice editor');
 await page.getByRole('textbox',{name:'HTML source'}).fill('<p>Alice project</p>');await page.getByLabel('Auto-run JavaScript').check();await changeAccount(page,model,'bob');assert.equal(await page.locator('[data-learning-note]').inputValue(),'');assert.equal(await page.getByLabel('Auto-run JavaScript').isChecked(),false);assert(!((await state(page)).playground.drafts.workspace?.html||'').includes('Alice'));
 await changeAccount(page,model,'alice');assert.equal((await state(page)).learning.lessons[PAGE].note.text,'Unsaved Alice editor');assert.equal((await state(page)).playground.drafts.workspace.html,'<p>Alice project</p>');
});

test('malformed cloud data never becomes an empty overwrite; quota switch failure hides old private data',async t=>{
 const a=blank();a.learning.lessons[PAGE]=note('Private Alice');const b=blank();b.learning.lessons[PAGE]=note('Private Bob');const shared={alice:cloud(a),bob:cloud(b)};const {page,model}=await device(t,shared);
 shared.alice.data={format:'unknown',version:99};await flush(page);assert.equal(shared.alice.writes,0);assert.equal((await state(page)).learning.lessons[PAGE].note.text,'Private Alice');
 await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='cnr_learning_v1')throw new DOMException('full','QuotaExceededError');return originalSet.call(this,k,v);};});model.id='bob';await page.evaluate(()=>CNRAuth.refresh({force:true}).catch(()=>{}));
 assert.equal(await page.evaluate(()=>CNRLearning.canWrite()),false);assert.equal(await page.locator('[data-learning-notes]').isVisible(),false);assert.equal(shared.bob.writes,0);
 await page.evaluate(()=>{Storage.prototype.setItem=window.originalSet;});await page.evaluate(()=>CNRAuth.refresh({force:true}));await page.waitForFunction(()=>CNRLearning.canWrite());await flush(page);assert.equal((await state(page)).learning.lessons[PAGE].note.text,'Private Bob');
});

test('failed remote install does not advance the ancestor and turn remote additions into deletions',async t=>{
 const shared={alice:cloud()};const {page}=await device(t,shared);await page.clock.install();await page.evaluate(p=>CNRLearning.saveNote(p,'Local'),PAGE);
 shared.alice.data.learning.lessons[OTHER]=note('Remote addition');shared.alice.revision++;
 await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;let fail=true;Storage.prototype.setItem=function(k,v){if(k==='cnr_learning_v1'&&fail){fail=false;throw new DOMException('full','QuotaExceededError');}return originalSet.call(this,k,v);};});await flush(page);assert.equal(shared.alice.writes,0);
 await page.evaluate(()=>{Storage.prototype.setItem=window.originalSet;});await page.evaluate(()=>CNRAuth.refresh({force:true}));await page.waitForFunction(()=>CNRLearning.canWrite());await flush(page);
 await page.clock.fastForward(11000);await flush(page);assert(shared.alice.writes>=1,'The retry must actually upload');
 assert.equal(shared.alice.data.learning.lessons[OTHER].note.text,'Remote addition');assert.equal((await state(page)).learning.lessons[PAGE].note.text,'Local');assert.equal(shared.alice.data.learning.lessons[PAGE].note.text,'Local');
});

test('guest mutations make no learning API writes',async t=>{
 const local=blank();local.learning.lessons[PAGE]=note('Guest only');const shared={};const {page,model}=await device(t,shared,{id:null,local});await page.evaluate(p=>CNRLearning.setRead(p,true),PAGE);await flush(page);assert.equal(model.requests.filter(r=>r.p==='/api/learning').length,0);
});

test('independent: background-tab dirty note stays with Alice when another tab signs into Bob',async t=>{
 const shared={alice:cloud(),bob:cloud()}; const one=await device(t,shared,{route:PAGE});
 const two=await one.context.newPage(); await two.goto(origin+PAGE); await two.evaluate(()=>CNRAuth.ready()); await two.waitForFunction(()=>CNRLearning.canWrite()); await flush(two);
 await two.getByText('Your lesson notes',{exact:true}).click(); await two.locator('[data-learning-note]').fill('Unsaved Alice from background tab');
 await changeAccount(one.page,one.model,'bob'); await two.waitForFunction(()=>CNRLearningSync.getOwner()==='user:bob'&&CNRLearning.canWrite());
 assert(!JSON.stringify(shared.bob.data).includes('Unsaved Alice'));
 await changeAccount(one.page,one.model,'alice'); await two.waitForFunction(()=>CNRLearningSync.getOwner()==='user:alice'&&CNRLearning.canWrite());
 const restored=await state(one.page); assert.equal(restored.learning.lessons[PAGE].note.text,'Unsaved Alice from background tab');
 const before=one.model.requests.filter(r=>r.p==='/api/learning').length; await one.page.waitForTimeout(7500); const after=one.model.requests.filter(r=>r.p==='/api/learning').length;
 assert(after-before<=4,'Unexpected repeated same-account network work: '+(after-before));
});

test('independent: two same-account tabs preserve writes from an interleaved stale read',async t=>{
 const shared={alice:cloud()};const one=await device(t,shared);const two=await one.context.newPage();await two.goto(origin+'/learn/');await two.evaluate(()=>CNRAuth.ready());await two.waitForFunction(()=>CNRLearning.canWrite());await flush(two);
 const old=await two.evaluate(()=>{window.pauseStorage=e=>e.stopImmediatePropagation();addEventListener('storage',pauseStorage,true);return localStorage.getItem('cnr_learning_v1')});
 await one.page.evaluate(p=>CNRLearning.saveNote(p,'First tab note'),PAGE);await one.page.waitForTimeout(200);
 await two.evaluate(({p,old})=>{const get=Storage.prototype.getItem;Storage.prototype.getItem=function(k){return k==='cnr_learning_v1'?old:get.call(this,k)};try{CNRLearning.saveNote(p,'Second tab note')}finally{Storage.prototype.getItem=get}}, {p:OTHER,old});
 await two.evaluate(()=>removeEventListener('storage',pauseStorage,true));await one.page.waitForTimeout(7500);await one.page.waitForFunction(()=>CNRLearning.canWrite());await two.waitForFunction(()=>CNRLearning.canWrite());await flush(one.page);await flush(two);
 assert.equal(shared.alice.data.learning.lessons[PAGE]?.note.text,'First tab note');
 assert.equal(shared.alice.data.learning.lessons[OTHER]?.note.text,'Second tab note');
});

test('independent: interleaved playground editors retain both code versions',async t=>{
 const shared={alice:cloud()};const one=await device(t,shared);const two=await one.context.newPage();await two.goto(origin+'/learn/');await two.evaluate(()=>CNRAuth.ready());await two.waitForFunction(()=>CNRLearning.canWrite());await flush(two);
 const old=await two.evaluate(()=>{window.pauseStorage=e=>e.stopImmediatePropagation();addEventListener('storage',pauseStorage,true);return localStorage.getItem('cnr_playground_v1')});
 await one.page.getByRole('textbox',{name:'HTML source'}).fill('<h1>First tab project</h1>');
 await two.evaluate(old=>{const get=Storage.prototype.getItem;let first=true;Storage.prototype.getItem=function(k){if(k==='cnr_playground_v1'&&first){first=false;return old}return get.call(this,k)};try{const e=document.querySelector('textarea[aria-label="HTML source"]');e.value='<h1>Second tab project</h1>';e.dispatchEvent(new Event('input',{bubbles:true}))}finally{Storage.prototype.getItem=get;removeEventListener('storage',pauseStorage,true)}},old);
 await one.page.waitForTimeout(7500);await one.page.waitForFunction(()=>CNRLearning.canWrite());await two.waitForFunction(()=>CNRLearning.canWrite());await flush(one.page);await flush(two);
 const versions=Object.values(shared.alice.data.playground.drafts).map(d=>d.html);assert(versions.includes('<h1>First tab project</h1>'),JSON.stringify(versions));assert(versions.includes('<h1>Second tab project</h1>'),JSON.stringify(versions));
});


test('delayed Bob discovery never displays or changes the prior Alice workspace',async t=>{
 const old=blank();old.learning.lessons[PAGE]=note('Private Alice before discovery');const bob=blank();bob.learning.lessons[PAGE]=note('Bob cloud note');
 const {page}=await device(t,{bob:cloud(bob)},{id:'bob',owner:'user:alice',local:old,route:PAGE,sessionDelay:250,beforeReady:async page=>{
   assert.equal(await page.evaluate(()=>CNRLearning.canWrite()),false);
   assert.equal(await page.locator('[data-learning-tools]').isVisible(),false);
   assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('cnr_progress')).tuts),{});
 }});
 assert.equal((await state(page)).learning.lessons[PAGE].note.text,'Bob cloud note');
 const archived=await page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('cnr-learning-sync-v1',1);r.onsuccess=()=>{const q=r.result.transaction('state').objectStore('state').get('user:alice');q.onsuccess=()=>resolve(q.result.local);q.onerror=reject;};}));
 assert.deepEqual(archived.progress.tuts,{});assert.equal(archived.learning.lessons[PAGE].note.text,'Private Alice before discovery');
});

test('dirty note synchronization does not repeatedly upload its unchanged edit timestamp',async t=>{
 const shared={alice:cloud()};const {page}=await device(t,shared,{route:PAGE});await page.getByText('Your lesson notes',{exact:true}).click();await page.locator('[data-learning-note]').fill('One pending note');await flush(page);const count=shared.alice.writes;await flush(page);await flush(page);assert.equal(shared.alice.writes,count);assert.equal(shared.alice.data.learning.lessons[PAGE].note.text,'One pending note');
});

test('stale network responses cannot populate the next account after a switch',async t=>{
 const a=blank();a.learning.lessons[PAGE]=note('Alice cloud');const b=blank();b.learning.lessons[PAGE]=note('Bob cloud');const shared={alice:cloud(a),bob:cloud(b)};const {page,model}=await device(t,shared);
 let started,release;const hasStarted=new Promise(r=>started=r),held=new Promise(r=>release=r);model.getHook=async()=>{model.getHook=null;started();await held;};
 const pending=page.evaluate(()=>CNRLearningSync.flush());await hasStarted;model.id='bob';await page.evaluate(()=>CNRAuth.refresh({force:true}));await page.waitForFunction(()=>CNRLearning.canWrite());release();await pending;await flush(page);
 assert.equal((await state(page)).learning.lessons[PAGE].note.text,'Bob cloud');assert.equal(shared.bob.writes,0);
});

test('rate limiting retains edits and typing or focus cannot bypass the retry window',async t=>{
 const shared={alice:cloud()};const {page,model}=await device(t,shared);await page.clock.install();model.status=429;await page.evaluate(p=>CNRLearning.setRead(p,true),PAGE);await flush(page);const requests=model.requests.filter(r=>r.p==='/api/learning').length;
 await page.evaluate(p=>CNRLearning.saveNote(p,'Queued during backoff'),OTHER);await page.evaluate(()=>dispatchEvent(new Event('focus')));await page.clock.fastForward(10000);await flush(page);assert.equal(model.requests.filter(r=>r.p==='/api/learning').length,requests);assert((await state(page)).progress.done[PAGE]);
 model.status=0;await page.clock.fastForward(31000);await flush(page);assert(shared.alice.data.progress.done[PAGE]);assert.equal(shared.alice.data.learning.lessons[OTHER].note.text,'Queued during backoff');
});

test('a normal no-op sync leaves a running playground preview intact',async t=>{
 const shared={alice:cloud()};const {page}=await device(t,shared);await page.getByRole('textbox',{name:'HTML source'}).fill('<p>Preview stays open</p>');await flush(page);await page.getByRole('button',{name:'Run',exact:true}).click();
 const frame=page.locator('iframe').first();await frame.waitFor();await frame.evaluate(node=>node.dataset.probe='same-frame');await flush(page);await flush(page);assert.equal(await page.locator('iframe').first().getAttribute('data-probe'),'same-frame');
});

test('independent: committed edit survives one-time compatibility projection failure',async t=>{
 const shared={alice:cloud()};const {page}=await device(t,shared);
 await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;let fail=true;Storage.prototype.setItem=function(k,v){if(k==='cnr_progress'&&fail){fail=false;throw new DOMException('full','QuotaExceededError')}return originalSet.call(this,k,v)}});
 await page.evaluate(p=>CNRLearning.setRead(p,true),PAGE);
 await page.evaluate(()=>Storage.prototype.setItem=window.originalSet);await flush(page);
 assert(shared.alice.data.progress.done[PAGE],JSON.stringify(shared.alice.data.progress));
});

test('independent: editing during pending note save retains newer text',async t=>{
 const shared={alice:cloud()};const {page}=await device(t,shared,{route:PAGE});await page.getByText('Your lesson notes',{exact:true}).click();const field=page.locator('[data-learning-note]');await field.fill('First submitted note');
 await page.evaluate(()=>new Promise(ready=>{navigator.locks.request('cnr-learning-state',async()=>{ready();await new Promise(r=>window.releaseReviewLock=r)});}));
 await page.locator('[data-learning-save-note]').click();await field.fill('Newer unsaved note');await page.evaluate(()=>releaseReviewLock());await page.waitForTimeout(300);
 assert.equal(await field.inputValue(),'Newer unsaved note');
});

test('independent: two same-account queued mutations remain safe while the owner lock is held',async t=>{
 const shared={alice:cloud()};const one=await device(t,shared);const two=await one.context.newPage();await two.goto(origin+'/learn/');await two.evaluate(()=>CNRAuth.ready());await two.waitForFunction(()=>CNRLearning.canWrite());await flush(two);
 await one.page.evaluate(()=>new Promise(ready=>{navigator.locks.request('cnr-learning-state',async()=>{ready();await new Promise(r=>window.releaseReviewLock=r)});}));
 const old=await two.evaluate(()=>{window.pauseStorage=e=>e.stopImmediatePropagation();addEventListener('storage',pauseStorage,true);return localStorage.getItem('cnr_learning_v1')});
 await one.page.evaluate(p=>{CNRLearning.saveNote(p,'First tab note')},PAGE);
 await two.evaluate(({p,old})=>{const get=Storage.prototype.getItem;Storage.prototype.getItem=function(k){return k==='cnr_learning_v1'?old:get.call(this,k)};try{CNRLearning.saveNote(p,'Second tab note')}finally{Storage.prototype.getItem=get}}, {p:OTHER,old});
 await two.evaluate(()=>removeEventListener('storage',pauseStorage,true));await one.page.evaluate(()=>window.releaseReviewLock());await one.page.waitForTimeout(7500);await one.page.waitForFunction(()=>CNRLearning.canWrite());await two.waitForFunction(()=>CNRLearning.canWrite());await flush(one.page);await flush(two);
 assert.equal(shared.alice.data.learning.lessons[PAGE]?.note.text,'First tab note');
 assert.equal(shared.alice.data.learning.lessons[OTHER]?.note.text,'Second tab note');
});


test('initial owner activation restores a safe HTML preview and keeps exercise and lesson URL intent',async t=>{
 const {page,model}=await device(t,{}, {id:null,sessionDelay:150});
 await page.frameLocator('iframe').getByRole('heading',{name:'Hello, web!'}).waitFor();
 assert.equal(await page.locator('.cnr-pg__console pre').textContent(),'');
 assert.deepEqual((await state(page)).learning.lessons,{});
 const selected=(Array.isArray(exercises)?exercises:exercises.exercises)[0];
 await page.goto(origin+'/playground/?exercise='+encodeURIComponent(selected.id));await page.evaluate(()=>CNRAuth.ready());await page.waitForFunction(()=>CNRLearning.canWrite());
 assert.equal(await page.getByRole('combobox',{name:'Practice exercise',exact:true}).inputValue(),selected.id);
 assert.equal(await page.getByRole('textbox',{name:'HTML source'}).inputValue(),selected.starter.html);
 await page.locator('iframe').waitFor();
 assert.equal(await page.locator('.cnr-pg__console pre').textContent(),'');
 assert.deepEqual((await state(page)).learning.lessons,{});
 const local=blank();local.playground.drafts['lesson:'+PAGE]=draft('<h1>Requested lesson draft</h1>');
 await page.evaluate(data=>CNRLearningSync.commitPlayground(CNRLearning.getSnapshot().playground,data.playground),local);
 await page.goto(origin+'/playground/?lesson='+encodeURIComponent(PAGE));await page.evaluate(()=>CNRAuth.ready());await page.waitForFunction(()=>CNRLearning.canWrite());
 await page.frameLocator('iframe').getByRole('heading',{name:'Requested lesson draft'}).waitFor();
 assert.equal(await page.getByRole('combobox',{name:'Saved project',exact:true}).inputValue(),'lesson:'+PAGE);
 assert.equal(model.requests.filter(r=>r.p==='/api/learning').length,0);
});

test('record sync sends one PATCH without a preceding GET and uses revision-only refreshes',async t=>{
 const shared={alice:cloud()}, {page,model}=await device(t,shared,{protocol2:true});
 const before=model.requests.length,gets=shared.alice.gets;
 await page.evaluate(p=>CNRLearning.saveNote(p,'Only this lesson changed'),PAGE);await flush(page);
 const sent=model.requests.slice(before).filter(r=>r.p==='/api/learning');
 assert.deepEqual(sent.map(r=>r.method),['PATCH']);assert.equal(shared.alice.gets,gets);
 assert.equal(sent[0].body.data,undefined);assert.equal(sent[0].body.changes.length,1);
 assert.equal(sent[0].body.changes[0].kind,'lesson');assert.equal(sent[0].body.changes[0].key,PAGE);
 const writes=shared.alice.writes;await flush(page);
 const refresh=model.requests.at(-1);assert.equal(refresh.method,'GET');assert.equal(refresh.headers['x-cnr-revision'],String(shared.alice.revision));
 assert.equal(shared.alice.writes,writes);assert.equal((await state(page)).learning.lessons[PAGE].note.text,'Only this lesson changed');
});

test('a legacy snapshot converts with PUT once and subsequent edits use PATCH',async t=>{
 const entry=cloud();entry.incremental=false;const shared={alice:entry};
 const {page,model}=await device(t,shared,{protocol2:true});
 await page.evaluate(p=>CNRLearning.saveNote(p,'First edit'),PAGE);await flush(page);
 await page.evaluate(p=>CNRLearning.saveNote(p,'Second edit'),PAGE);await flush(page);
 assert.deepEqual(model.requests.filter(r=>r.method==='PUT'||r.method==='PATCH').map(r=>r.method),['PUT','PATCH']);
 assert.equal(shared.alice.data.learning.lessons[PAGE].note.text,'Second edit');
});

test('optimistic PATCH conflicts fetch the newer revision and merge independent device edits',async t=>{
 const shared={alice:cloud()},one=await device(t,shared,{protocol2:true}),two=await device(t,shared,{protocol2:true});
 await one.page.evaluate(p=>CNRLearning.saveNote(p,'First device'),PAGE);await flush(one.page);
 await two.page.evaluate(p=>CNRLearning.saveNote(p,'Second device'),OTHER);const before=two.model.requests.length;
 await flush(two.page);await flush(two.page);
 assert.deepEqual(two.model.requests.slice(before).filter(r=>r.p==='/api/learning').map(r=>r.method),['PATCH','GET','PATCH']);
 assert.equal(shared.alice.data.learning.lessons[PAGE].note.text,'First device');assert.equal(shared.alice.data.learning.lessons[OTHER].note.text,'Second device');
});

test('record sync coalesces edits and repeated focus events do not reread fresh data',async t=>{
 const shared={alice:cloud()}, {page,model}=await device(t,shared,{protocol2:true});await page.clock.install();
 const before=model.requests.length;
 await page.evaluate(async p=>{for(let i=0;i<20;i++){await CNRLearning.saveNote(p,'Edit '+i);dispatchEvent(new Event('focus'));}},PAGE);
 await page.clock.fastForward(20000);
 assert.equal(model.requests.slice(before).filter(r=>r.p==='/api/learning').length,0);
 await page.clock.fastForward(15000);await page.waitForFunction(()=>CNRLearningSync.getStatus().state==='saved');
 assert.equal(shared.alice.writes,1);assert.equal(shared.alice.data.learning.lessons[PAGE].note.text,'Edit 19');
 const saved=model.requests.length;
 await page.evaluate(()=>{for(let i=0;i<20;i++)dispatchEvent(new Event('focus'));});await page.clock.fastForward(100000);
 assert.equal(model.requests.slice(saved).filter(r=>r.p==='/api/learning').length,0);
 await page.clock.fastForward(200000);await page.waitForTimeout(100);
 assert.equal(model.requests.slice(saved).filter(r=>r.p==='/api/learning').length,1);
});

test('an open unsaved note is included in record sync despite a fresh clean cache',async t=>{
 const shared={alice:cloud()}, {page}=await device(t,shared,{protocol2:true,route:PAGE});
 await page.getByText('Your lesson notes',{exact:true}).click();await page.locator('[data-learning-note]').fill('Dirty editor text');await flush(page);
 assert.equal(shared.alice.data.learning.lessons[PAGE].note.text,'Dirty editor text');
});
