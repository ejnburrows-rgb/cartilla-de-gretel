import {chromium} from 'playwright';
import fs from 'node:fs';
const out=process.argv[2],url=process.argv[3]||'http://localhost:5173';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
const metricPath=`${out}/metrics-${JSON.parse(process.env.SIZES || "[[1440,900],[390,844]]").map(([w,h])=>`${w}x${h}`).join("-")}.json`;
const ledger=[];
for(const [w,h] of JSON.parse(process.env.SIZES || "[[1440,900],[390,844]]")) {
 const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'});
 const page=await ctx.newPage();
 for(const [n,pages] of [[19,[67,68,69,70]],[20,[71,72,73,74]],[21,[75,76,77,78]],[22,[79,80,81,82]],[23,[83,84,85]],[24,[88,89,90]]]) {
  for(const [i,p] of pages.entries()) {
   await ctx.addInitScript(({n,p,i})=>{
    localStorage.setItem('cartilla.lesson-progress.v1',JSON.stringify(Array.from({length:24},(_,j)=>j+1)));
    localStorage.setItem(`cartilla.learner-resume.v1:${n}`,JSON.stringify({lesson:n,page:i,printedPage:p}));
   },{n,p,i});
   await page.goto(`${url}/cartilla/leccion/${n}`,{waitUntil:'domcontentloaded',timeout:120000});
   await page.waitForFunction(p=>document.querySelector('.native-lesson-viewer')?.getAttribute('data-native-page')===String(p),p,{timeout:60000});
   await page.locator('.native-lesson-viewer__leaf .faithful-page').waitFor({state:'visible'});
   await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1300);
   const metrics=await page.evaluate(()=>{const r=document.querySelector('.native-lesson-viewer__leaf .faithful-page')?.getBoundingClientRect();return {viewport:[innerWidth,innerHeight],document:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],paper:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null,overflow:!!document.querySelector('[data-lc-fit-overflow]')};});
   const name=`${w}x${h}-L${n}-p${p}.png`;await page.screenshot({path:`${out}/${name}`});ledger.push({name,n,p,...metrics});fs.writeFileSync(metricPath,JSON.stringify(ledger,null,2));console.log(name);
  }
 }
 await ctx.close();
}
await browser.close();
