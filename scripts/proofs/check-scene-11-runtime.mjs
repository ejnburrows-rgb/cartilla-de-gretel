import {chromium} from 'playwright';
import fs from 'node:fs/promises';import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const phase=process.argv[2]??'after';const dir=process.env.PROOF_DIR??process.cwd()+'/docs/proofs/source-crop-repairs-2026-10-27/scene-11';await fs.mkdir(dir,{recursive:true});
const baseURL=process.env.TEST_BASE_URL??'http://127.0.0.1:5173';
const expected=JSON.parse(await fs.readFile('docs/proofs/source-crop-repairs-2026-10-27/scene-11/source.json','utf8'));
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_PATH??chromium.executablePath(),args:['--no-sandbox']});const results=[];
try{for(const [name,viewport] of Object.entries({phone:{width:390,height:844},laptop:{width:1366,height:900},projector:{width:1920,height:1080}})){
 const c=await browser.newContext({viewport,reducedMotion:'reduce',recordVideo:{dir}});c.setDefaultTimeout(30000);const p=await c.newPage();await p.route('**/auth/v1/**',r=>r.abort());await p.route('**/rest/v1/**',r=>r.abort());await p.goto(`${baseURL}/cartilla/presentar/7`);
 const stage=p.getByTestId('flipchart-stage');await stage.waitFor({state:'visible'});
 for(let k=0;k<2;k++){await p.getByRole('button',{name:'Lámina siguiente',exact:true}).click();await p.waitForTimeout(400);}
 const img=stage.locator('img[src$="p011-scene.png"]').first();await img.waitFor({state:'visible'});
 await img.evaluate(i=>i.decode());
 const state=await img.evaluate(i=>({currentSrc:i.currentSrc,width:i.naturalWidth,height:i.naturalHeight,rect:i.getBoundingClientRect().toJSON()}));
 const data=await(await c.request.get(state.currentSrc)).body();
 await p.screenshot({path:dir+'/'+phase+'-'+name+'.png',fullPage:true});
 const sha256=crypto.createHash('sha256').update(data).digest('hex');if(phase==='after')assert.equal(sha256,expected.sha256);
 results.push({name,viewport,phase,state,sha256});const video=p.video();await c.close();await video.saveAs(dir+'/'+phase+'-'+name+'.webm');
}await fs.writeFile(dir+'/'+phase+'.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));}finally{await browser.close();}
