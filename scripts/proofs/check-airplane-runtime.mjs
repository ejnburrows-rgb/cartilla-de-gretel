import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const root=process.cwd();
const dir=root+'/docs/proofs/airplane-runtime-2026-10-28';
await fs.mkdir(dir,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
try {
for(const [device,viewport] of Object.entries({phone:{width:390,height:844},tablet:{width:768,height:1024},desktop:{width:1366,height:900}})){
 const context=await browser.newContext({viewport,hasTouch:device!=='desktop',recordVideo:{dir,size:viewport}});
 await context.addInitScript(()=>localStorage.setItem('cartilla.lesson-progress.v1','[1,2,3,4,5,6]'));
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [lesson,printed,next] of [[3,8,1],[5,13,0],[6,16,0]]){
  await page.goto('http://127.0.0.1:5173/cartilla/leccion/'+lesson);
  const viewer=page.locator('.native-lesson-viewer');await viewer.waitFor({state:'visible'});
  if(next){await viewer.getByRole('button',{name:'Siguiente',exact:true}).click();}
  await page.waitForFunction(n=>{const v=document.querySelector('.native-lesson-viewer');return v?.getAttribute('data-native-page')===String(n)&&v?.getAttribute('data-turn-phase')==='idle';},printed);
  const image=viewer.locator('img[src$="/leccion-1/avion.webp"]').first();
  await image.waitFor({state:'visible'});await image.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.images].filter(i=>i.src.endsWith('/leccion-1/avion.webp')).every(i=>i.complete&&i.naturalWidth>0));
  const state=await image.evaluate(i=>({src:i.getAttribute('src'),currentSrc:i.currentSrc,width:i.naturalWidth,height:i.naturalHeight,alt:i.alt,printed:i.closest('.native-lesson-viewer')?.getAttribute('data-native-page'),phase:i.closest('.native-lesson-viewer')?.getAttribute('data-turn-phase'),wrapper:i.closest('.living-illustration')?.outerHTML}));
  const path=new URL(state.currentSrc).pathname;
  const served=await (await context.request.get(state.currentSrc)).body();
  const oldPath=path.replace('/avion.webp','/pez.webp');
  const original=await fs.readFile(root+'/public'+oldPath);
  if(hash(served)!==hash(original))throw Error('Served image differs from preserved source: '+path);
  const shot=device+'-p'+printed+'.png';await page.screenshot({path:dir+'/'+shot,fullPage:true});
  const crop=device+'-p'+printed+'-rendered.png';await image.screenshot({path:dir+'/'+crop});
  results.push({device,viewport,lesson,printed,state,servedPath:path,sha256:hash(served),sourcePath:'public'+oldPath,byteIdentical:true,screenshot:shot,renderedComparison:crop});
 }
 if(errors.length)throw Error(JSON.stringify(errors));
 await context.close();
}
await fs.writeFile(dir+'/checks.json',JSON.stringify({head:'2cc39fb7d5d81c4f9be2a7ef3b27b5d6e514e0ad',scope:'Seeded navigation only; no activity-completion or physical-device certification',results},null,2));
console.log(JSON.stringify(results.map(({device,printed,servedPath,sha256})=>({device,printed,servedPath,sha256})),null,2));
}finally{await browser.close();}
