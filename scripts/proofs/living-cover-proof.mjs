import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const out='docs/proofs/living-cover-2026-11-02';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
for(const viewport of [{width:1366,height:768},{width:390,height:844}]){
 const label=viewport.width===390?'phone':'desktop';
 const context=await browser.newContext({viewport,deviceScaleFactor:1,recordVideo:{dir:out,size:viewport}, reducedMotion:'no-preference'});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let audio=0;page.on('request',r=>{if(r.url().includes('page-turn-soft.mp3'))audio++;});
 await page.route('**/rest/v1/**',r=>r.fulfill({status:200,body:'[]',contentType:'application/json'}));
 for(const route of ['/','/cartilla']){
  await page.goto('http://127.0.0.1:5175'+route);
  await page.getByTestId('welcome-splash').waitFor();
  await page.waitForTimeout(1200);
  const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight,canvas:document.querySelector('canvas')?.dataset.ready,cover:(()=>{const r=document.querySelector('.lc-welcome__book-canvas').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}})(),imgs:document.querySelectorAll('[data-testid=welcome-splash] img').length}));
  if(state.scrollWidth>state.width||state.scrollHeight>state.height||state.cover.y<0||state.cover.bottom>state.height)throw Error('clipped layout '+JSON.stringify(state));
  if(!state.canvas)throw Error('living art failed '+JSON.stringify(state));
  await page.screenshot({path:out+'/'+label+(route==='/'?'':'-cartilla')+'.png'});
  results.push({label,route,state});
 }
 await page.waitForTimeout(5200);
 const fps=await page.evaluate(()=>new Promise(resolve=>{const start=performance.now();let frames=0;function step(now){frames++;if(now-start>1000)resolve(Math.round(frames*1000/(now-start)));else requestAnimationFrame(step)}requestAnimationFrame(step)}));
 await page.getByRole('link',{name:'Abrir libro La Cartilla de Gretel'}).click();
 await page.waitForURL('**/cartilla/lecciones');
 await page.waitForTimeout(500);
 if(audio!==1)throw Error('expected one paper sound, got '+audio);
 await page.goto('http://127.0.0.1:5175/');
 await page.getByTestId('wc-entrar').click();
 await page.waitForURL('**/cartilla/lecciones');
 await page.waitForTimeout(500);
 if(audio!==2)throw Error('ribbon paper sound failed');
 results.push({label,fps,audio,navigation:'cover and ribbon passed',errors});
 const video=page.video();await context.close();await video.saveAs(out+'/'+label+'.webm');
}
const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const p=await ctx.newPage();await p.goto('http://127.0.0.1:5175/');await p.getByTestId('welcome-splash').waitFor();await p.waitForTimeout(800);
const animations=await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);
if(animations)throw Error('reduced motion still animates');
await p.screenshot({path:out+'/phone-reduced.png'});results.push({reducedMotion:true,runningAnimations:animations});
await p.route('**/cartilla/images/cover.png',r=>r.abort());await p.reload();await p.waitForSelector('[data-cover-failed]');await p.getByTestId('wc-entrar').click();await p.waitForURL('**/cartilla/lecciones');results.push({missingCoverFallback:'navigation passed'});
await browser.close();await fs.writeFile(out+'/browser-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));

