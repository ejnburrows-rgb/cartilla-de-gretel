import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const dir=process.cwd()+'/docs/proofs/native-audio-rejection-2026-10-28';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
try{for(const [device,viewport] of Object.entries({phone:{width:390,height:844},desktop:{width:1366,height:900}})){
const context=await browser.newContext({viewport,recordVideo:{dir,size:viewport}});
await context.addInitScript(()=>{
 window.nativeAudioProof={calls:[],statuses:[],learning:[]};
 const play=HTMLMediaElement.prototype.play;
 HTMLMediaElement.prototype.play=function(...args){
  const row={src:this.src,native:this instanceof HTMLAudioElement};window.nativeAudioProof.calls.push(row);
  const result=play.apply(this,args);result.then(()=>row.resolved=true,e=>{row.rejected=e.name;row.message=e.message;row.errorCode=this.error?.code;row.paused=this.paused;});return result;
 };
 window.addEventListener('cartilla:picture-audio-status',e=>window.nativeAudioProof.statuses.push(e.detail));
 window.addEventListener('gretel:bus',e=>{if(/answer:|activity:complete/.test(e.detail?.type))window.nativeAudioProof.learning.push(e.detail);});
});
await context.route('**/audio/voz/vocabulario/nido.mp3',route=>route.fulfill({status:200,contentType:'audio/mpeg',body:'Deliberately invalid audio fixture; native decoder must reject.'}));
const page=await context.newPage();await page.goto('http://127.0.0.1:5173/cartilla/presentar/13');
const nido=page.getByTestId('flipchart-stage').locator('[data-picture-name="nido"]').first();await nido.waitFor({state:'visible'});
const before=await page.evaluate(()=>JSON.stringify(localStorage));await nido.click();
await page.waitForFunction(()=>window.nativeAudioProof.calls.some(x=>x.src.endsWith('/nido.mp3')&&x.rejected)&&window.nativeAudioProof.statuses.includes('failed'));
const proof=await page.evaluate(()=>window.nativeAudioProof);
if(await page.locator('.picture-audio-status').count())throw Error('Failure message visible');
if(proof.learning.length)throw Error('False learning event');
if(before!==await page.evaluate(()=>JSON.stringify(localStorage)))throw Error('Unexpected persisted progress');
await page.screenshot({path:dir+'/'+device+'.png',fullPage:true});
results.push({device,viewport,route:'/cartilla/presentar/13',proof,failureStatusVisible:false,learnerStorageUnchanged:true});
await context.close();await page.video().saveAs(dir+'/'+device+'.webm');
}
await fs.writeFile(dir+'/checks.json',JSON.stringify({head:'e7b21bfd0bdab35f2def26c4d2d2e7764544a463',scope:'Native HTMLAudioElement.play rejection against invalid media response; not audible output or source phrase verification',results},null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
