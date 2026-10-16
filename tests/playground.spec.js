/* Run: NODE_PATH=/path/to/playwright/node_modules node --test tests/playground.spec.js
 * Uses an isolated local harness; never changes live workflows or publishes code. */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const exercises = JSON.parse(fs.readFileSync(path.join(root,'hugo/data/exercises.json'),'utf8'));
let browser, server, base;
function html(lesson) {
  const json = JSON.stringify(exercises).replace(/</g,'\\u003c');
  return `<!doctype html><html lang="en" class="${lesson ? 'plugin-docs' : 'cnr-playground-page'}"><head><meta charset="utf-8"><title>Playground test</title><link rel="stylesheet" href="/site.css"><link rel="stylesheet" href="/playground.css"></head><body>${lesson ? `<div class="docRoot_UBD9"><aside class="theme-doc-sidebar-container">Sidebar</aside><main class="docMainContainer_TBSr"><div class="container"><div class="row"><div class="col docItemCol_VOVn"><article class="theme-doc-markdown"><h1>Test lesson</h1><h2>First section</h2><div class="theme-code-block language-html"><pre><code>&lt;h1 id="first"&gt;First&lt;/h1&gt;</code></pre></div><div class="theme-code-block language-css"><pre><code>h1 { color: red; }</code></pre></div><h2>Second section</h2><div class="theme-code-block language-html"><pre><code>&lt;h1 id="second"&gt;Second&lt;/h1&gt;</code></pre></div></article></div><div class="col col--3"><div class="theme-doc-toc-desktop">Contents</div></div></div></div></main></div><div data-practice-page='{"path":"/docs/language/html/test/","title":"Test lesson","course":"language/html"}'></div>` : '<main class="cnr-pg-page"><h1>Playground</h1><div data-playground-root></div></main>'}<script type="application/json" id="cnr-exercises-data">${json}</script><script src="/playground.js"></script></body></html>`;
}
before(async()=>{
  server=http.createServer((req,res)=>{
    if(req.url==='/site.css'){res.setHeader('Content-Type','text/css');res.end(fs.readFileSync(path.join(root,'hugo/static/css/docusaurus.css')));}
    else if(req.url==='/playground.js'){res.setHeader('Content-Type','text/javascript');res.end(fs.readFileSync(path.join(root,'hugo/assets/js/playground.js')));}
    else if(req.url==='/playground.css'){res.setHeader('Content-Type','text/css');res.end(fs.readFileSync(path.join(root,'hugo/assets/css/playground.css')));}
    else {res.setHeader('Content-Type','text/html');res.end(html(req.url.startsWith('/lesson')));}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true});
});
after(async()=>{await browser?.close();await new Promise(resolve=>server.close(resolve));});
async function pageAt(url='/') {const page=await browser.newPage();await page.goto(base+url);await page.evaluate(()=>{window.practiceEvents=[];window.addEventListener('cnr:practice',e=>practiceEvents.push(e.detail));});return page;}
async function setFile(page,lang,value){await page.getByRole('tab',{name:{html:'index.html',css:'styles.css',js:'script.js'}[lang],exact:true}).click();await page.getByRole('textbox',{name:{html:'HTML source',css:'CSS source',js:'JavaScript source'}[lang],exact:true}).fill(value);}
async function run(page){await page.getByRole('button',{name:'Run',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.cnr-pg__status').textContent.startsWith('Run finished'));}

test('initial HTML/CSS preview, file tabs, manual JS, drafts, and bounded execution', async()=>{
  const p=await pageAt();try{
    assert.equal(await p.locator('iframe').count(),1);
    assert.equal(await p.evaluate(()=>practiceEvents.length),0);
    await setFile(p,'js','console.log("a literal </script> stays JavaScript");\nwhile (true) {}');
    await run(p);
    const output=await p.locator('.cnr-pg__console pre').textContent();assert.match(output, /literal <\/script>/);assert.match(output,/Execution budget exceeded/);
    assert.equal(await p.evaluate(()=>practiceEvents.length),1);
    const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('cnr_playground_v1')));assert.match(saved.drafts.workspace.js,/while/);
    await p.reload();assert.equal(await p.locator('iframe').count(),1);await p.getByRole('tab',{name:'script.js',exact:true}).click();assert.match(await p.getByRole('textbox',{name:'JavaScript source',exact:true}).inputValue(),/while/);
    await setFile(p,'js','const f = value => ({ value });\nconsole.log(f(3).value);\nfunction recurse() { return recurse(); }\nrecurse();');await run(p);assert.match(await p.locator('.cnr-pg__console pre').textContent(),/3/);
  }finally{await p.close();}
});

test('all six starters fail checks and solutions pass with explicit practice events',async()=>{
  const p=await pageAt();try{
    p.on('dialog',dialog=>dialog.accept());
    for(const exercise of exercises){
      await p.getByLabel('Practice exercise',{exact:true}).selectOption(exercise.id);
      await p.getByRole('button',{name:'Check my work',exact:true}).click();
      await p.waitForFunction(()=>document.querySelector('.cnr-pg__status').textContent.startsWith('Some practice'));
      await p.getByRole('button',{name:'Load solution',exact:true}).click();
      await p.getByRole('button',{name:'Check my work',exact:true}).click();
      await p.waitForFunction(()=>document.querySelector('.cnr-pg__status').textContent.startsWith('Practice checks passed'));
      const event=await p.evaluate(()=>practiceEvents.at(-1));assert.equal(event.exerciseId,exercise.id);assert.equal(event.passed,true);assert.equal(event.path,exercise.path);
    }
    assert.equal(await p.evaluate(()=>practiceEvents.length),12);
  }finally{await p.close();}
});

test('inline HTML scripts work; hostile markup does not access parent storage or escape script injection',async()=>{
  const p=await pageAt();try{
    await p.evaluate(()=>localStorage.setItem('parent-secret','private'));
    await setFile(p,'html','<base href="https://example.invalid/"><meta http-equiv="refresh" content="0;url=https://example.invalid/leak"><h1>Safe view</h1><script>console.log("inline works");</script><a href="https://example.invalid/leak">Navigate</a><form action="https://example.invalid/leak"><button>Submit</button></form>');
    await setFile(p,'js','try { console.log(parent.localStorage.getItem("parent-secret")); } catch (error) { console.log("parent blocked"); }\nconsole.log("</script><img src=x onerror=alert(1)>");\nfetch("https://example.invalid/leak").catch(() => console.log("network blocked"));');
    const external=[];p.on('request',r=>{if(r.url().startsWith('https://example.invalid'))external.push(r.url());});
    await run(p);
    await p.waitForFunction(()=>document.querySelector('.cnr-pg__console pre').textContent.includes('network blocked'));
    let output=await p.locator('.cnr-pg__console pre').textContent();assert.match(output,/inline works/);assert.match(output,/parent blocked/);
    await p.frameLocator('iframe').getByRole('link',{name:'Navigate'}).click();await p.frameLocator('iframe').getByRole('button',{name:'Submit'}).click();assert.deepEqual(external,[]);
    assert.equal(await p.evaluate(()=>localStorage.getItem('parent-secret')),'private');
    assert.equal(await p.locator('iframe').getAttribute('sandbox'),'allow-scripts');
  }finally{await p.close();}
});

test('stale and foreign postMessages are ignored and console is bounded',async()=>{
  const p=await pageAt();try{
    await setFile(p,'js','for (let n=0;n<300;n++) console.log("message", n);');await run(p);
    assert.ok((await p.locator('.cnr-pg__console pre').textContent()).length<25000);
    await p.evaluate(()=>{window.oldFrame=document.querySelector('iframe').contentWindow;window.oldNonce=JSON.parse(document.querySelector('iframe').srcdoc.match(/\)\((\{"html"[\s\S]*?)\);<\/script>/)[1]).nonce;});
    await setFile(p,'js','console.log("current run");');await run(p);
    await p.evaluate(()=>window.dispatchEvent(new MessageEvent('message',{source:oldFrame,data:{channel:'cnr-playground',nonce:oldNonce,type:'console',value:{level:'error',text:'STALE INJECTION'}}})));
    assert.doesNotMatch(await p.locator('.cnr-pg__console pre').textContent(),/STALE/);
  }finally{await p.close();}
});

test('lesson examples stay within heading scope and never silently replace drafts',async()=>{
  const p=await pageAt('/lesson');try{
    assert.equal(await p.locator('iframe').count(),0);await p.getByRole('button',{name:'Try in playground',exact:true}).first().click();
    assert.match(await p.getByRole('textbox',{name:'HTML source',exact:true}).inputValue(),/First/);
    await setFile(p,'html','<h1>My saved version</h1>');
    await p.getByRole('button',{name:'Try in playground',exact:true}).last().click();
    assert.match(await p.getByRole('textbox',{name:'HTML source',exact:true}).inputValue(),/My saved/);
    await p.getByRole('button',{name:'Replace draft with this example'}).click();assert.match(await p.getByRole('textbox',{name:'HTML source',exact:true}).inputValue(),/Second/);
    await p.getByRole('tab',{name:'styles.css',exact:true}).click();assert.equal(await p.getByRole('textbox',{name:'CSS source',exact:true}).inputValue(),'');
    await p.getByRole('button',{name:'Close practice',exact:true}).click();assert.equal(await p.locator('iframe').count(),0);
  }finally{await p.close();}
});

test('ZIP contains runnable files; drafts survive imported-data notification',async()=>{
  const p=await pageAt();try{
    await setFile(p,'html','<h1>Résumé project</h1>');
    const downloadPromise=p.waitForEvent('download');await p.getByRole('button',{name:'Download ZIP'}).click();const download=await downloadPromise;const bytes=fs.readFileSync(await download.path());
    assert.equal(bytes.readUInt32LE(0),0x04034b50);let offset=0;const files={};while(bytes.readUInt32LE(offset)===0x04034b50){const size=bytes.readUInt32LE(offset+18),nameLength=bytes.readUInt16LE(offset+26),extra=bytes.readUInt16LE(offset+28),name=bytes.subarray(offset+30,offset+30+nameLength).toString();const begin=offset+30+nameLength+extra;files[name]=bytes.subarray(begin,begin+size).toString();offset=begin+size;}
    assert.deepEqual(Object.keys(files),['index.html','styles.css','script.js','README.txt']);assert.match(files['index.html'],/Résumé/);assert.match(files['index.html'],/src="script.js"/);
    await p.evaluate(()=>window.dispatchEvent(new CustomEvent('cnr:learning-imported')));
    assert.match(await p.getByRole('textbox',{name:'HTML source',exact:true}).inputValue(),/Résumé/);assert.equal(await p.getByRole('button',{name:'Reload saved draft'}).count(),1);
  }finally{await p.close();}
});

test('corrupt, future-version, oversized and over-count stores are preserved until explicit reset',async()=>{
  const p=await pageAt();try{
    const values=['{broken',JSON.stringify({version:2,drafts:{workspace:{html:'future',css:'',js:''}}}),'x'.repeat(2*1024*1024+1),JSON.stringify({version:1,drafts:Object.fromEntries(Array.from({length:101},(_,n)=>['workspace:'+n,{html:'keep',css:'',js:''}]))})];
    for(const value of values){
      await p.evaluate(value=>localStorage.setItem('cnr_playground_v1',value),value);await p.reload();
      await setFile(p,'html','<h1>Do not overwrite stored data</h1>');
      assert.equal(await p.evaluate(()=>localStorage.getItem('cnr_playground_v1')),value);
      assert.match(await p.locator('.cnr-pg__notice').textContent(),/protect existing data|paused/);
      assert.equal(await p.getByRole('button',{name:'Download saved data',exact:true}).count(),1);
    }
    p.on('dialog',d=>d.accept());await p.getByRole('button',{name:'Reset saved projects',exact:true}).click();
    assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('cnr_playground_v1')).drafts.workspace.html),'<h1>Do not overwrite stored data</h1>');
  }finally{await p.close();}
});

test('commented scripts remain inert and closing style tags remain data',async()=>{
  const p=await pageAt();try{
    await setFile(p,'html','<!-- <script>console.log("COMMENT RAN");</script> --><h1>Visible</h1>');
    await setFile(p,'css','h1 { color: green; } /* </style><script>alert(1)</script> */');
    await setFile(p,'js','console.log("safe");');
    await run(p);const text=await p.locator('.cnr-pg__console pre').textContent();assert.doesNotMatch(text,/COMMENT RAN/);assert.match(text,/safe/);
    assert.equal(await p.frameLocator('iframe').getByRole('heading',{name:'Visible'}).count(),1);
  }finally{await p.close();}
});


test('direct frame navigation is stopped without granting access to parent data',async()=>{
  const p=await pageAt();try{
    await setFile(p,'js','location.href="https://example.invalid/navigation";');
    await p.getByRole('button',{name:'Run',exact:true}).click();
    await p.waitForFunction(()=>!document.querySelector('iframe'),null,{timeout:7000});
    assert.match(await p.locator('.cnr-pg__console pre').textContent(),/stopped|respond|navigation/);
    assert.equal(new URL(p.url()).origin,base);
  }finally{await p.close();}
});

test('responsive keyboard controls and accessibility basics',async()=>{
  const p=await pageAt();try{
    await p.setViewportSize({width:1440,height:1000});
    const tab=p.getByRole('tab',{name:'index.html',exact:true});await tab.focus();await p.keyboard.press('ArrowRight');assert.equal(await p.getByRole('tab',{name:'styles.css',exact:true}).getAttribute('aria-selected'),'true');
    await run(p);await p.screenshot({path:'/tmp/cnr-playground-desktop.png',fullPage:true});
    await p.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
    const audit=await p.evaluate(async()=>{const result=await axe.run('.cnr-pg',{rules:{'color-contrast':{enabled:false}}});return result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description}));});
    assert.deepEqual(audit,[]);
    await p.setViewportSize({width:375,height:900});
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await p.screenshot({path:'/tmp/cnr-playground-mobile.png',fullPage:true});
  }finally{await p.close();}
});


test('UTF-8 store limits and imported metadata roundtrip without silent truncation',async()=>{
  const p=await pageAt();try{
    const draft={html:'漢'.repeat(100000),css:'字'.repeat(100000),js:'語'.repeat(100000),title:'T'.repeat(280),course:'language/'+ 'c'.repeat(141),exerciseId:'e'.repeat(150),path:'',updatedAt:new Date().toISOString()};
    const data=JSON.stringify({version:1,drafts:{'workspace:import-1':draft}});
    await p.evaluate(data=>localStorage.setItem('cnr_playground_v1',data),data);await p.reload();
    await p.getByLabel('Saved project',{exact:true}).selectOption('workspace:import-1');
    await setFile(p,'html','<h1>Edited imported project</h1>');
    const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('cnr_playground_v1')).drafts['workspace:import-1']);
    assert.equal(saved.title,draft.title);assert.equal(saved.course,draft.course);assert.equal(saved.exerciseId,draft.exerciseId);assert.equal(saved.css,draft.css);assert.equal(saved.js,draft.js);
    await p.addScriptTag({path:path.join(root,'hugo/assets/js/learning.js')});
    const shared=await p.evaluate(()=>CNRLearning.getSnapshot().playground.drafts['workspace:import-1']);
    assert.equal(shared.title,draft.title);assert.equal(shared.css,draft.css);assert.equal(shared.course,draft.course);
    const large=JSON.stringify({version:1,drafts:Object.fromEntries([1,2,3].map(n=>['workspace:'+n,draft]))});
    assert.ok(large.length<2*1024*1024);assert.ok(Buffer.byteLength(large)>2*1024*1024);
    await p.evaluate(value=>localStorage.setItem('cnr_playground_v1',value),large);await p.reload();await setFile(p,'html','<p>Keep original</p>');
    assert.equal(await p.evaluate(()=>localStorage.getItem('cnr_playground_v1')),large);
  }finally{await p.close();}
});


test('failed saving does not silently discard edits when switching projects',async()=>{
  const p=await pageAt();try{
    await p.evaluate(()=>localStorage.setItem('cnr_playground_v1','{broken'));await p.reload();
    await setFile(p,'html','<h1>Unsaved work</h1>');
    p.once('dialog',d=>d.dismiss());
    await p.getByLabel('Practice exercise',{exact:true}).selectOption('semantic-card');
    assert.equal(await p.getByRole('textbox',{name:'HTML source',exact:true}).inputValue(),'<h1>Unsaved work</h1>');
    assert.equal(await p.getByLabel('Practice exercise',{exact:true}).inputValue(),'');
    assert.equal(await p.evaluate(()=>localStorage.getItem('cnr_playground_v1')),'{broken');
  }finally{await p.close();}
});


test('JavaScript live rendering is opt-in, emits no practice events, and Stop cancels queued work',async()=>{
  const p=await pageAt();try{
    assert.equal(await p.getByRole('checkbox',{name:'Auto-run JavaScript',exact:true}).isChecked(),false);
    await setFile(p,'html','<p id="result">Starting value</p>');
    await setFile(p,'js','document.querySelector("#result").textContent="JS should wait";');
    await p.waitForFunction(()=>document.querySelector('.cnr-pg__status').textContent.startsWith('HTML/CSS preview updated'));
    assert.equal(await p.frameLocator('iframe').locator('#result').textContent(),'Starting value');
    await p.getByRole('checkbox',{name:'Auto-run JavaScript',exact:true}).check();
    await setFile(p,'js','document.querySelector("#result").textContent="Live JavaScript";');
    await p.waitForFunction(()=>document.querySelector('.cnr-pg__status').textContent.startsWith('Live preview updated'));
    assert.equal(await p.frameLocator('iframe').locator('#result').textContent(),'Live JavaScript');
    assert.equal(await p.evaluate(()=>practiceEvents.length),0);
    await p.getByRole('checkbox',{name:'Auto-run JavaScript',exact:true}).uncheck();
    await setFile(p,'js','document.querySelector("#result").textContent="Should remain off";');
    await p.waitForFunction(()=>document.querySelector('.cnr-pg__status').textContent.startsWith('HTML/CSS preview updated'));
    assert.equal(await p.frameLocator('iframe').locator('#result').textContent(),'Starting value');
    await p.getByRole('checkbox',{name:'Auto-run JavaScript',exact:true}).check();
    await setFile(p,'js','document.querySelector("#result").textContent="Canceled";');
    await p.getByRole('button',{name:'Stop',exact:true}).click();
    await p.waitForTimeout(900); // Longer than the 650ms debounce being tested.
    assert.equal(await p.locator('iframe').count(),0);
    assert.equal(await p.evaluate(()=>practiceEvents.length),0);
    await p.reload();
    assert.equal(await p.getByRole('checkbox',{name:'Auto-run JavaScript',exact:true}).isChecked(),false);
    assert.equal(await p.locator('iframe').count(),1);
    assert.equal(await p.frameLocator('iframe').locator('#result').textContent(),'Starting value');
  }finally{await p.close();}
});


test('dedicated workspace fills its container and lesson panel reflows without losing code',async()=>{
  const p=await pageAt();try{
    await p.setViewportSize({width:1440,height:1000});
    assert.ok((await p.locator('.cnr-pg-page').boundingBox()).width>1300);
    await p.frameLocator('iframe').getByRole('heading',{name:'Hello, web!'}).waitFor();
    assert.equal(await p.evaluate(()=>practiceEvents.length),0);
    await p.goto(base+'/lesson');
    assert.equal(await p.locator('iframe').count(),0);
    const trigger=p.getByRole('button',{name:'Try in playground',exact:true}).first();
    await trigger.click();
    assert.equal(await p.locator('html').evaluate(n=>n.classList.contains('cnr-practicing')),true);
    assert.equal(await p.locator('.theme-doc-sidebar-container').isVisible(),false);
    assert.equal(await p.locator('.theme-doc-toc-desktop').isVisible(),false);
    const reader=await p.locator('.theme-doc-markdown').boundingBox(),panel=await p.locator('.cnr-pg-lesson-panel').boundingBox();
    assert.ok(reader.width>=450,JSON.stringify(reader));assert.ok(reader.x+reader.width<=panel.x,JSON.stringify({reader,panel}));
    await setFile(p,'html','<h1>Preserved during resize</h1>');
    await p.setViewportSize({width:375,height:900});
    await p.waitForFunction(()=>document.querySelector('.cnr-pg-lesson-panel').previousElementSibling?.classList.contains('theme-code-block'));
    assert.equal(await p.getByRole('textbox',{name:'HTML source',exact:true}).inputValue(),'<h1>Preserved during resize</h1>');
    assert.equal(await p.locator('iframe').count(),0);
    await p.getByRole('button',{name:'Close practice',exact:true}).click();
    assert.equal(await trigger.evaluate(n=>document.activeElement===n),true);
    assert.equal(await p.locator('html').evaluate(n=>n.classList.contains('cnr-practicing')),false);
    await p.setViewportSize({width:1440,height:1000});
    assert.equal(await p.locator('.theme-doc-sidebar-container').isVisible(),true);
    assert.equal(await p.locator('.theme-doc-toc-desktop').isVisible(),true);
  }finally{await p.close();}
});


test('responsive animation and intervals receive fresh budgets after yielding',async()=>{
  const p=await pageAt();try{
    await setFile(p,'html','<p id="frame">0</p><p id="tick">0</p>');
    await setFile(p,'js',`
      const started = performance.now();
      let frames = 0, ticks = 0;
      function animate() {
        document.querySelector('#frame').textContent = String(++frames);
        if (performance.now() - started >= 1800) { console.log('animation completed'); return; }
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
      const interval = setInterval(() => {
        document.querySelector('#tick').textContent = String(++ticks);
        if (performance.now() - started >= 1800) { clearInterval(interval); console.log('interval completed'); }
      }, 16);
    `);
    await run(p);
    await p.waitForFunction(()=>{const text=document.querySelector('.cnr-pg__console pre').textContent;return text.includes('animation completed')&&text.includes('interval completed');},null,{timeout:6000});
    assert.doesNotMatch(await p.locator('.cnr-pg__console pre').textContent(),/Execution budget exceeded/);
    assert.ok(Number(await p.frameLocator('iframe').locator('#frame').textContent())>5);
    assert.ok(Number(await p.frameLocator('iframe').locator('#tick').textContent())>5);
    await setFile(p,'js',`function starve() { queueMicrotask(starve); }
starve();`);
    await run(p);
    assert.match(await p.locator('.cnr-pg__console pre').textContent(),/Execution budget exceeded/);
  }finally{await p.close();}
});


test('timer limits count pending work, release fired handles, and honor shared clear handles',async()=>{
  const p=await pageAt();try{
    await setFile(p,'js',`
      for (let index=0;index<350;index++) { const timer=setTimeout(()=>{},10000); clearInterval(timer); }
      for (let index=0;index<80;index++) { const timer=setInterval(()=>{},10000); clearTimeout(String(timer)); }
      console.log('cleared timers completed');
      let completed=0;
      function next() {
        completed++;
        if(completed===225) console.log('sequential timers completed');
        else setTimeout(next,0);
      }
      setTimeout(next,0);
    `);
    await run(p);
    await p.waitForFunction(()=>document.querySelector('.cnr-pg__console pre').textContent.includes('sequential timers completed'),null,{timeout:6000});
    const output=await p.locator('.cnr-pg__console pre').textContent();
    assert.match(output,/cleared timers completed/);assert.doesNotMatch(output,/limit reached|budget exceeded/);
    await setFile(p,'js','for(let index=0;index<201;index++) setTimeout(()=>{},10000);');
    await run(p);assert.match(await p.locator('.cnr-pg__console pre').textContent(),/Timer limit reached \(200 pending timeouts\)/);
  }finally{await p.close();}
});
