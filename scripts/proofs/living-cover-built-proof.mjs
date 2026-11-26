import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1366,height:768}});
await context.addInitScript(()=>{const OriginalAudio=window.Audio;window.__paper=[];window.Audio=function(src){const a=new OriginalAudio(src);a.addEventListener('playing',()=>window.__paper.push({src,volume:a.volume,muted:a.muted,state:a.readyState}));return a;};});
const page=await context.newPage();const results=[];
for(const viewport of [{width:1366,height:768},{width:390,height:844},{width:320,height:568}]){
 await page.setViewportSize(viewport);await page.goto('http://127.0.0.1:4173/cartilla');await page.getByTestId('welcome-splash').waitFor();await page.waitForTimeout(800);
 const dims=await page.evaluate(()=>({w:innerWidth,sw:document.documentElement.scrollWidth,h:innerHeight,sh:document.documentElement.scrollHeight}));
 if(dims.sw>dims.w||dims.sh>dims.h)throw Error('Built overflow '+JSON.stringify(dims));
 await page.screenshot({path:'docs/proofs/living-cover-2026-11-02/built-'+viewport.width+'.png'});results.push({viewport,dims});
}
await page.getByRole('link',{name:'Abrir libro La Cartilla de Gretel'}).focus();await page.keyboard.press('Enter');await page.waitForURL('**/cartilla/lecciones');await page.waitForTimeout(1000);const audio=await page.evaluate(()=>window.__paper);if(audio.length!==1)throw Error('Audio not actually playing '+JSON.stringify(audio));results.push({keyboardNavigation:'passed',audio});
await browser.close();await fs.writeFile('docs/proofs/living-cover-2026-11-02/built-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
