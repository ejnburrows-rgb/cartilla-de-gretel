import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, readFileSync, realpathSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const evidenceRoot = dirname(fileURLToPath(import.meta.url));
const repo = resolve(evidenceRoot, '../../../..');
if (realpathSync(process.cwd()) !== realpathSync(repo)) throw new Error('Run from the checkout containing this helper');
const comparablePath = value => process.platform === 'win32' ? value.toLowerCase() : value;
if (comparablePath(realpathSync(evidenceRoot)) !== comparablePath(evidenceRoot)) throw new Error('Redirected evidence directories are not allowed');
const git = process.env.GIT_EXECUTABLE;
if (!git || !isAbsolute(git) || !/^git(?:\.exe)?$/i.test(basename(git)) || !statSync(git).isFile()) throw new Error('GIT_EXECUTABLE must explicitly select an absolute Git executable');
// A fresh directory preserves the accepted historical runtime evidence.
const out = resolve(evidenceRoot, 'runtime-new');
if (existsSync(out)) throw new Error('runtime-new already exists; preserve accepted evidence');
mkdirSync(out);
const require = createRequire(resolve(repo, 'package.json'));
const { chromium } = require('playwright');
const report = { head:execFileSync(realpathSync(git),['rev-parse','HEAD'],{encoding:'utf8',cwd:repo}).trim(), url:'http://127.0.0.1:4187', device:'Chromium touch emulation; no physical device', physicalPhone:'NOT TESTED', physicalProjector:'NOT TESTED', checks:[], consoleErrors:[], warnings:[] };
const browser = await chromium.launch({headless:true});
const check = (condition, message, detail={}) => { report.checks.push({result:condition?'PASS':'FAIL',message,...detail}); console.log(condition?'PASS':'FAIL',message); if (!condition) throw new Error(message); };
const context = await browser.newContext({ viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference',recordVideo:{dir:out,size:{width:390,height:844}} });
const page = await context.newPage();
page.setDefaultTimeout(12_000);
page.setDefaultNavigationTimeout(30_000);
page.on('pageerror',e=>report.consoleErrors.push(String(e)));
page.on('console',e=>{if(e.type()==='error')report.consoleErrors.push(e.text());if(e.type()==='warning')report.warnings.push(e.text());});
await page.addInitScript(()=>{ window.__touch=[]; window.addEventListener('pointerdown', e=>window.__touch.push({pointerType:e.pointerType,isTrusted:e.isTrusted}),true); });
const counter=()=>page.getByTestId('flipchart-counter');
async function go(lesson){await page.goto(`${report.url}/cartilla/presentar/${lesson}`);await page.getByTestId('flipchart-replica-sheet').first().waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(450);}
async function waitSheet(n){await page.waitForFunction(n=>document.querySelector('[data-testid="flipchart-counter"]')?.textContent.includes(`Hoja ${n} de`),n);await page.waitForTimeout(750);}
async function clear(locator){return locator.evaluate(el=>{const b=el.getBoundingClientRect();const top=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);return{clear:!!top&&(top===el||el.contains(top)),box:{x:b.x,y:b.y,w:b.width,h:b.height},top:top?.outerHTML.slice(0,180)};});}
async function dragCorner(testid,dy){const box=await page.getByTestId(testid).boundingBox();check(!!box,'corner visible',{testid});const x=box.x+box.width/2,y=box.y+box.height/2;const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});for(let step=1;step<=8;step++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+dy*step/8,id:1}]});await page.waitForTimeout(35);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
try {
 if (process.env.RUNTIME_ONLY !== 'remaining') {
  await go(12);
  const next=page.getByRole('button',{name:'Lámina siguiente',exact:true});
  const prev=page.getByRole('button',{name:'Lámina anterior',exact:true});
  check((await clear(next)).clear,'Next touch target clear',await clear(next));
  await next.tap();await waitSheet(2);check((await counter().innerText()).includes('Hoja 2 de'),'trusted touch forward');
  check((await clear(prev)).clear,'Previous touch target clear',await clear(prev));
  await prev.tap();await waitSheet(1);check((await counter().innerText()).includes('Hoja 1 de'),'trusted touch backward');
  // The shipped default hand mode is left: left advances, right returns.
  report.handMode='left (shipped default; fresh browser context)';
  await dragCorner('flipchart-corner-left',-300);await waitSheet(2);check(true,'touch corner drag forward');
  await dragCorner('flipchart-corner-right',300);await waitSheet(1);check(true,'touch corner drag backward');
  const events=await page.evaluate(()=>window.__touch);check(events.length>=4&&events.every(e=>e.pointerType==='touch'&&e.isTrusted),'browser delivered trusted touch events',{events});
  await page.screenshot({path:resolve(out,'touch-navigation-390.png')});
 } else {
   const prior=JSON.parse(readFileSync(resolve(out,'navigation-results.json'),'utf8'));
   if(prior.head!==report.head||prior.checks.length!==9||prior.checks.some(c=>c.result!=='PASS'))throw new Error('navigation evidence identity mismatch');
   report.checks.push(...prior.checks.map(c=>({...c,reused:true,evidence:'navigation-results.json'})));
   report.navigationVideo=prior.video;
 }
  for(const [lesson,pdf] of [[12,26],[13,29],[14,32],[16,38],[24,62]]){
    // The thumbnail strip is hidden on phones; use the actual visible controls.
    await go(lesson);await page.getByRole('button',{name:'Lámina siguiente',exact:true}).tap();await waitSheet(2);await page.getByRole('button',{name:'Lámina siguiente',exact:true}).tap();await waitSheet(3);
    const art=page.locator('[data-testid="flipchart-stage"] [data-replica-page="'+pdf+'"] .living-illustration').filter({has:page.locator('img[src*="p'+String(pdf).padStart(3,'0')+'-scene"]')}).first();
    await art.waitFor();const a=await art.evaluate(el=>({ambient:el.getAttribute('data-ambient-motion'),natural:el.getAttribute('data-natural-motion'),parts:el.querySelectorAll('.living-illustration__part').length,videos:el.querySelectorAll('video').length,animations:el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length}));
    check(a.ambient==='none'&&a.natural==='false'&&a.videos===0&&a.animations===0,'restored scene remains static',{pdf,lesson,...a});
    await page.screenshot({path:resolve(out,`static-p${pdf}-390.png`)});
  }
  for(const viewport of [{width:390,height:844},{width:1366,height:768},{width:1920,height:1080}]){
    await page.setViewportSize(viewport);await go(4);
    const fit=await page.getByTestId('flipchart-replica-sheet').first().evaluate(el=>{const b=el.getBoundingClientRect();return{x:b.x,y:b.y,w:b.width,h:b.height,right:b.right,bottom:b.bottom,vw:innerWidth,vh:innerHeight};});
    check(fit.x>=-1&&fit.y>=-1&&fit.right<=fit.vw+1&&fit.bottom<=fit.vh+1,'presentation sheet fits viewport',{viewport,fit});
    await page.screenshot({path:resolve(out,`presentation-${viewport.width}.png`)});
  }
  await page.setViewportSize({width:390,height:844});await go(4);
  const lesson4=await page.locator('[data-testid="flipchart-stage"] [data-replica-page="6"] .living-illustration').evaluateAll(els=>els.map(el=>({src:el.querySelector('img')?.getAttribute('src'),ambient:el.getAttribute('data-ambient-motion'),natural:el.getAttribute('data-natural-motion'),animations:el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length})));
  check(lesson4.length===7&&lesson4.every(a=>a.ambient==='none'&&a.natural==='false'&&a.animations===0),'seven Lesson4 replacement images held static',{lesson4});
  check(report.consoleErrors.length===0,'zero console errors',{errors:report.consoleErrors});
}catch(e){report.failure=String(e);await page.screenshot({path:resolve(out,'failure.png')}).catch(()=>{});process.exitCode=1;}
finally{const video=page.video();await context.close();if(video){const path=await video.path();report.video=path.split(/[\\/]/).pop();}await browser.close();writeFileSync(resolve(out,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({head:report.head,checks:report.checks.map(x=>({result:x.result,message:x.message})),failure:report.failure}));}
