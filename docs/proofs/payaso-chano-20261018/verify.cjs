const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const root=path.resolve(process.env.CHANO_REPO_ROOT||'.'),out=path.join(root,'docs/proofs/payaso-chano-20261018');fs.mkdirSync(out,{recursive:true});
const file=path.join(root,'public/games/payaso-chano.html');
const results={sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),startedAt:new Date().toISOString(),browser:'',coverage:[],realIPhoneSafari:'NOT VERIFIED',failures:[]};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHANO_BROWSER_EXECUTABLE||chromium.executablePath(),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});results.browser=browser.version();
 for(const [width,height] of [[390,844],[667,375],[844,390],[1366,768],[1920,1080],[768,1024]]){
  const mobile=width<1000,ctx=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});const p=await ctx.newPage(),errors=[],network=[];let assertions=0;
  p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url())});
  await p.addInitScript(()=>{
   const C=window.AudioContext;window.__audioProbe={contexts:[],analysers:[]};
   window.AudioContext=class extends C{constructor(...a){super(...a);const analyser=this.createAnalyser();analyser.fftSize=2048;window.__audioProbe.contexts.push(this);window.__audioProbe.analysers.push(analyser);const dest=this.destination,connect=AudioNode.prototype.connect;const original=connect; // Tee output only for measurement; destination/playback remains connected.
    const old=AudioNode.prototype.connect;if(!old.__probe){const wrapped=function(to,...args){const r=old.call(this,to,...args);if(to instanceof AudioDestinationNode){const idx=window.__audioProbe.contexts.indexOf(this.context);if(idx>=0&&this!==window.__audioProbe.analysers[idx])old.call(this,window.__audioProbe.analysers[idx])}return r};wrapped.__probe=true;AudioNode.prototype.connect=wrapped;}
   }};
  });
  const cdp=mobile?await ctx.newCDPSession(p):null;
  const state=()=>p.evaluate(()=>window.__chanoTest.getState());
  const box=async sel=>{const b=await p.locator(sel).boundingBox();assert(b,sel+' visible');return{x:b.x+b.width/2,y:b.y+b.height/2}};
  const touch=async(pt,type)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x:pt.x,y:pt.y,id:1,radiusX:2,radiusY:2,force:1}]});
  const activate=async sel=>{if(mobile){const b=await box(sel);await touch(b,'touchStart');await delay(45);await touch(b,'touchEnd');await delay(25)}else await p.locator(sel).click();};
  const drag=async(sy,i)=>{const a=await box('.ball-btn[data-sy="'+sy+'"]'),b=await box('.slot[data-slot="'+i+'"]');if(mobile){await touch(a,'touchStart');for(let j=1;j<=12;j++){await touch({x:a.x+(b.x-a.x)*j/12,y:a.y+(b.y-a.y)*j/12},'touchMove');await delay(16)}await touch(b,'touchEnd')}else{await p.mouse.move(a.x,a.y);await p.mouse.down();await p.mouse.move(b.x,b.y,{steps:12});await p.mouse.up()}await delay(25)};
  const keyboard=async sel=>{for(let i=0;i<30;i++){if(await p.locator(sel).evaluate(e=>e===document.activeElement))break;await p.keyboard.press('Tab')}assert(await p.locator(sel).evaluate(e=>e===document.activeElement),'Tab reaches '+sel);await p.keyboard.press('Enter')};
  const checkLayout=async()=>{
   const bad=await p.evaluate(()=>{const bad=[];const nodes=[...document.querySelectorAll('.mast,.scene,.instructions,.main-game,.chalk,.tray,.act,.slot,.ball-btn,.notice,.instructions li,.word-title,#status')];for(const e of nodes){const r=e.getBoundingClientRect();if(r.x<-.5||r.y<-.5||r.right>innerWidth+.5||r.bottom>innerHeight+.5)bad.push(e.className+' outside viewport');if(e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2)bad.push(e.className+' internal overflow')};const instructions=document.querySelector('.instructions').getBoundingClientRect();for(const e of document.querySelectorAll('.tray,.act,.chalk')){const r=e.getBoundingClientRect();if(Math.min(r.right,instructions.right)-Math.max(r.x,instructions.x)>1&&Math.min(r.bottom,instructions.bottom)-Math.max(r.y,instructions.y)>1)bad.push('instructions overlap '+e.className)}if(document.documentElement.scrollWidth>innerWidth)bad.push('horizontal page scroll');return bad});assert.deepEqual(bad,[],'layout '+width+'x'+height);assertions++;
  };
  try{
   await p.goto('file://'+file);await p.evaluate(()=>document.fonts.ready);await checkLayout();
   await p.screenshot({path:path.join(out,'after-'+width+'x'+height+'.png')});
   const transforms=await p.locator('.clown,.orb').evaluateAll(es=>es.map(e=>getComputedStyle(e).transform));await delay(190);const transformed=await p.locator('.clown,.orb').evaluateAll(es=>es.map(e=>getComputedStyle(e).transform));assert.notDeepEqual(transforms,transformed,'Chano/juggling move');assertions++;
   assert.equal(await p.locator('.orb .syllable').count(),3);assert.equal(await p.locator('#listen').isDisabled(),true);assertions+=2;
   await activate('#check');assert.match(await p.locator('#status').innerText(),/Completa/);assert.equal((await state()).solved,false);assertions+=2;
   if(mobile){const a=await box('.ball-btn:first-child');await touch(a,'touchStart');await touch({x:a.x+20,y:a.y-20},'touchMove');await touch(a,'touchCancel');assert((await state()).slots.every(s=>s===null));assert.equal(await p.locator('#ghost').evaluate(e=>getComputedStyle(e).display),'none');assertions+=2;}
   const rounds=await p.evaluate(()=>window.__chanoTest.rounds);assert.equal(rounds.length,13);assertions++;
   for(let r=0;r<13;r++){
    const w=rounds[r];assert.equal((await state()).word,w.word);assertions++;
    // Full incorrect answer, explicit umbrella check, retry wobble, spring reset.
    const wrong=await p.locator('.ball-btn').evaluateAll((es,expected)=>es.map(e=>e.dataset.sy).find(s=>s!==expected),w.syllables[0]);
    for(let i=0;i<w.syllables.length;i++)await activate('.ball-btn[data-sy="'+wrong+'"]');
    await activate('#check');assert.equal((await state()).solved,false);assert.equal(await p.locator('#status').getAttribute('class'),'incorrect');assert.equal(await p.locator('#board').evaluate(e=>e.classList.contains('error')),true);assert.equal(await p.locator('#next').isDisabled(),true);assertions+=4;
    if(r===0)await p.screenshot({path:path.join(out,'incorrect-'+width+'x'+height+'.png')});
    await activate('#reset');assert((await state()).slots.every(s=>s===null));assertions++;
    // Correct using real native touch/mouse drag, tap, and desktop Tab/Enter paths.
    for(let i=0;i<w.syllables.length;i++){const sy=w.syllables[i];if(r%3===0)await drag(sy,i);else if(!mobile&&r%3===2)await keyboard('.ball-btn[data-sy="'+sy+'"]');else await activate('.ball-btn[data-sy="'+sy+'"]');assert.equal((await state()).slots[i],sy);assertions++;}
    await activate('#check');assert.equal((await state()).solved,true);assert.equal(await p.locator('#status').getAttribute('class'),'correct');assert.equal(await p.locator('#board').evaluate(e=>e.classList.contains('success')),true);assert.equal(await p.locator('#scene').evaluate(e=>e.classList.contains('laugh')||!!e.querySelector('.laugh-text')),true,'success laugh visible');assertions+=4;
    await checkLayout();if(r===0)await p.screenshot({path:path.join(out,'correct-'+width+'x'+height+'.png')});
    if(r<12){await activate('#next');assert.equal((await state()).round,r+1);assertions++;}
   }
   assert.equal((await state()).completed.length,13);assert.match(await p.locator('#status').innerText(),/13 palabras/);assertions+=2;
   await activate('#mute');await delay(120);assert.equal((await state()).musicEnabled,true);assert.equal((await state()).audioState,'running');
   const rms=await p.evaluate(()=>{const a=window.__audioProbe.analysers[0],d=new Float32Array(a.fftSize);a.getFloatTimeDomainData(d);return Math.sqrt(d.reduce((s,x)=>s+x*x,0)/d.length)});assert(rms>0.00001,'music produces output samples');assert(rms<0.1,'low music gain');assertions+=4;
   await activate('#mute');await delay(80);assert.equal((await state()).musicEnabled,false);assert.equal((await state()).musicNodes,0);assertions+=2;
   await p.emulateMedia({reducedMotion:'reduce'});assert(await p.locator('.clown,.orb').evaluateAll(es=>es.every(e=>getComputedStyle(e).animationName==='none')));assertions++;
   assert.deepEqual(errors,[]);assert.deepEqual(network,[]);assertions+=2;
   results.coverage.push({viewport:width+'x'+height,input:mobile?'native CDP touch drag/tap/cancel':'native mouse drag/click and Tab/Enter keyboard',assertions,all13:true,errors,externalNetworkRequests:network,musicRms:rms,reducedMotion:true});
   console.log('PASS',width,height,assertions);
  }catch(e){results.failures.push({viewport:width+'x'+height,error:e.stack});await p.screenshot({path:path.join(out,'FAIL-'+width+'x'+height+'.png')});console.log('FAIL',width,height,e.stack);}
  await ctx.close();
 }
 // Render genuine baseline, exact merged-main source, for visual before/after evidence.
 if(process.env.CHANO_BASELINE_FILE)for(const [w,h] of [[390,844],[667,375],[1366,768]]){const p=await browser.newPage({viewport:{width:w,height:h}});await p.goto('file://'+path.resolve(process.env.CHANO_BASELINE_FILE));await p.screenshot({path:path.join(out,'before-'+w+'x'+h+'.png')});await p.close()}
 results.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));await browser.close();if(results.failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
