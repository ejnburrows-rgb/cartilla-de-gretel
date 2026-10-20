import {chromium} from 'playwright';
import fs from 'node:fs';
const out=process.argv[2],url=process.argv[3]||'http://localhost:5173';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
const metricPath=`${out}/metrics-${JSON.parse(process.env.SIZES || "[[1440,900],[390,844]]").map(([w,h])=>`${w}x${h}`).join("-")}.json`;
const ledger=fs.existsSync(metricPath)?JSON.parse(fs.readFileSync(metricPath)):[];
for(const [w,h] of JSON.parse(process.env.SIZES || "[[1440,900],[390,844]]")) {
 const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'});
 let page;
 for(const [n,pages] of JSON.parse(process.env.PAGES || "[[19,[67,68,69,70]],[20,[71,72,73,74]],[21,[75,76,77,78]],[22,[79,80,81,82]],[23,[83,84,85]],[24,[88,89,90]]]")) {
  for(const [i,p] of pages.entries()) {
   const captureName=`${w}x${h}-L${n}-p${p}.png`;
   if(process.env.SKIP_EXISTING && fs.existsSync(`${out}/${captureName}`))continue;
   for(let attempt=0;attempt<3;attempt++){try {
   page=await ctx.newPage();
   await page.addInitScript(({n,p,i})=>{
    localStorage.setItem('cartilla.lesson-progress.v1',JSON.stringify(Array.from({length:24},(_,j)=>j+1)));
    localStorage.setItem(`cartilla.learner-resume.v1:${n}`,JSON.stringify({lesson:n,page:i,printedPage:p}));
   },{n,p,i});
   await page.goto(`${url}/cartilla/leccion/${n}`,{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(p=>document.querySelector('.native-lesson-viewer')?.getAttribute('data-native-page')===String(p),p,{timeout:60000});
   await page.locator('.native-lesson-viewer__leaf .faithful-page:visible').waitFor({state:'visible'});
   await page.waitForTimeout(500);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(450);
   const metrics=await page.evaluate(()=>{const r=document.querySelector('.native-lesson-viewer__leaf .faithful-page')?.getBoundingClientRect();return {viewport:[innerWidth,innerHeight],document:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],paper:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null,overflow:!!document.querySelector('[data-lc-fit-overflow]')};});
   const name=`${w}x${h}-L${n}-p${p}.png`;await page.screenshot({path:`${out}/${name}`});ledger.push({name,n,p,...metrics});fs.writeFileSync(metricPath,JSON.stringify(ledger,null,2));if(w===844){await page.screenshot({path:`${out}/${w}x${h}-L${n}-p${p}-full.png`,fullPage:true});await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await page.screenshot({path:`${out}/${w}x${h}-L${n}-p${p}-bottom.png`});}console.log(name);await page.close();break;}catch(e){await page?.close().catch(()=>{});if(attempt===2)throw e;console.log('retry',n,p,e.message.split('\n')[0]);}}
  }
 }
 await ctx.close();
}
await browser.close();
