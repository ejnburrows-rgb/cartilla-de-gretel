// Focused real-app check: wrong retry, shared lean geometry/timing, full game and reset.
// Uses only anonymous local demo state; never targets a live database.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
const dir = process.env.COW_PROOF_DIR ?? 'test-results/cow-card-sync';
await fs.mkdir(dir, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--mode', 'worker', '--host', '127.0.0.1', '--port', '5183'], {env: {...process.env, VITE_SUPABASE_URL:'http://127.0.0.1:54321', VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_e2e_not_a_real_key'}});
let browser, context;
const results=[];
try {
 for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:5183')).ok)break}catch{}await new Promise(r=>setTimeout(r,200));}
 for(const width of [375,1280]){
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-gpu','--disable-software-rasterizer','--no-zygote','--single-process']});
  context=await browser.newContext({viewport:{width,height:width===375?844:900},recordVideo:{dir,size:{width,height:width===375?844:900}}});
  const page=await context.newPage();await page.goto('http://127.0.0.1:5183/cartilla/juego/cow-game-m');
  const cow=s=>page.getByRole('button',{name:'Vaca '+s,exact:true});const slot=s=>page.getByRole('button',{name:'Casilla '+s,exact:true});
  await cow('mu').waitFor({timeout:30000});await page.waitForTimeout(700);await page.screenshot({path:`${dir}/${width}-start.png`});
  const before=await page.locator('.cg-card').first().boundingBox();await cow('mu').click();await slot('mo').click();await page.getByText('Inténtalo otra vez',{exact:true}).waitFor();await page.screenshot({path:`${dir}/${width}-wrong.png`});
  await page.waitForFunction(()=>document.querySelector('[aria-label="Vaca mu"]')?.style.transitionDuration==='0s');
  const after=await page.locator('.cg-card').first().boundingBox();if(Math.abs(before.y-after.y)>8)throw Error('Wrong answer lost the mouth card');
  for(const [i,s]of ['mu','mo','me','ma','mi'].entries()){
   await cow(s).click();await slot(s).click();
   if(i===0){await page.locator('.cg-card-lean').waitFor();await page.waitForTimeout(300);const geometry=await page.evaluate(()=>{const card=document.querySelector('.cg-card-lean');const bob=document.querySelector('.cg-lean .cg-bob');if(!card||!bob)throw Error('Lean phase missing');const cs=getComputedStyle(card),bs=getComputedStyle(bob);return {cardDy:new DOMMatrixReadOnly(cs.transform).m42+card.offsetHeight*.1,cowDy:new DOMMatrixReadOnly(bs.transform).m42,cardDuration:cs.transitionDuration,cowDuration:bs.transitionDuration}});if(Math.abs(geometry.cardDy-geometry.cowDy)>2)throw Error('Card/cow lean desynchronized '+JSON.stringify(geometry));if(geometry.cardDuration!=='0.6s'||geometry.cowDuration!=='0.6s')throw Error('Lean timing mismatch '+JSON.stringify(geometry));results.push({width,...geometry});console.log('SYNC',width,JSON.stringify(geometry));await page.screenshot({path:`${dir}/${width}-lean.png`});}
   await page.waitForFunction(label=>document.querySelector(`[aria-label="${label}"]`)?.style.transitionDuration==='0s','Vaca '+s);
  }
  await page.getByRole('dialog',{name:'Juego completado'}).waitFor();await page.screenshot({path:`${dir}/${width}-complete.png`});await page.getByRole('button',{name:'Jugar otra vez',exact:true}).click();await page.getByRole('dialog',{name:'Juego completado'}).waitFor({state:'hidden'});await page.screenshot({path:`${dir}/${width}-reset.png`});
  const video=page.video();await context.close();context=null;await video.saveAs(`${dir}/${width}-gameplay.webm`);await browser.close();browser=null;console.log('PASS',width,'wrong retry, five correct pairs, completion, reset');
 }
 await fs.writeFile(dir+'/geometry.json',JSON.stringify(results,null,2));
} catch(e){await fs.writeFile(dir+'/failure.txt',String(e.stack));console.error(e);process.exitCode=1;}finally{await context?.close();await browser?.close();server.kill('SIGTERM');}
