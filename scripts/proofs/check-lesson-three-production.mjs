import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const activityIndex=Number(process.argv[2]??0);
assert.ok(Number.isInteger(activityIndex)&&activityIndex>=0&&activityIndex<=2);
const baseURL=process.env.TEST_BASE_URL||'http://127.0.0.1:5173';
const root=process.env.PROOF_DIR||('docs/proofs/lesson-3-prototype-2026-10-27/production-continuation'+(activityIndex?`/activity-${activityIndex}`:''));
await mkdir(root,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_PATH||(process.platform==='win32'?chromium.executablePath():'/usr/bin/chromium'),args:['--no-sandbox','--disable-accelerated-2d-canvas']});
const results=[];
try {
for(const width of [375,768,1280]) {
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:true,recordVideo:{dir:root,size:{width,height:900}}});
 context.setDefaultTimeout(30_000);
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/rest/v1/**',r=>r.abort());await page.route('**/auth/v1/**',r=>r.abort());
 await page.goto(`${baseURL}/cartilla/teacher/crm`);
 await page.getByRole('heading',{name:'Hoy en tu clase'}).waitFor();
 const learners=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('cartilla.seed.state.v1'));return d.students.filter(s=>s.class_id===d.classes[0].id).slice(0,2).map(s=>({classId:s.class_id,studentId:s.id}));});
 assert.equal(learners.length,2);
 await page.evaluate(ls=>{for(const s of ls)localStorage.setItem(`cartilla.learner-resume.v1:3:demo:${s.classId}:${s.studentId}`,JSON.stringify({lesson:3,page:2,printedPage:9}));},learners);
 // Synthetic session fixture only; learner work is produced by pointer input.
 const select=async s=>page.evaluate(s=>{sessionStorage.setItem('cartilla.demo-student-session.v1',JSON.stringify(s));window.dispatchEvent(new Event('cartilla:student-session'));},s);
 await select(learners[0]);await page.goto(`${baseURL}/cartilla/leccion/3`);
 const viewer=page.locator('[data-native-page="9"]');await viewer.waitFor();
 const activity=viewer.locator('.am-dibuja').nth(activityIndex);const canvas=activity.locator('canvas');
 const ink=()=>canvas.evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;return n;});
 const waitInk=async present=>{for(let i=0;i<50;i++){if((await ink()>0)===present)return;await page.waitForTimeout(100);}assert.fail(`expected ink ${present}`);};
 const draw=async(end=true)=>{await canvas.scrollIntoViewIfNeeded();await page.waitForTimeout(250);const b=await canvas.boundingBox();await page.mouse.move(b.x+b.width*.2,b.y+b.height*.5);await page.mouse.down();await page.mouse.move(b.x+b.width*.7,b.y+b.height*.5,{steps:20});if(end)await page.mouse.up();};
 const finish=()=>activity.getByRole('button',{name:'Listo',exact:true});
 const shot=async name=>page.screenshot({path:`${root}/${width}-${name}.png`,fullPage:true});
 assert.equal(await finish().isEnabled(),false);
 await draw();assert.ok(await ink()>0);assert.equal(await finish().isEnabled(),true);
 await activity.getByRole('button',{name:'Deshacer',exact:true}).click();assert.equal(await ink(),0);assert.equal(await finish().isEnabled(),false);await shot('undo-empty-disabled');
 await draw();await finish().click();await activity.getByRole('button',{name:'Seguir dibujando'}).waitFor();
 const activityId=await activity.locator('xpath=ancestor::*[@data-gretel-activity]').getAttribute('data-gretel-activity');
 const completed=()=>page.evaluate(({learner,id})=>{const s=`:demo:${learner.classId}:${learner.studentId}`;return JSON.parse(localStorage.getItem(`cartilla.page-completion.v1${s}`)||'{}')['9']?.includes(id)??false;},{learner:learners[0],id:activityId});
 assert.equal(await completed(),true);
 await page.reload();await waitInk(true);await activity.getByRole('button',{name:'Seguir dibujando'}).waitFor();await shot('completed-reloaded');
 await select(learners[1]);await waitInk(false);assert.equal(await finish().isEnabled(),false);await shot('learner-b-empty');
 await select(learners[0]);await waitInk(true);await activity.getByRole('button',{name:'Seguir dibujando'}).click();
 await activity.getByRole('button',{name:'Borrador de goma'}).click();await draw();await waitInk(false);assert.equal(await finish().isEnabled(),false);assert.equal(await completed(),false);await shot('erased-completion-revoked');
 await draw();assert.equal(await finish().isEnabled(),false);
 await activity.getByRole('button',{name:'Borrador de goma'}).click();await draw(false);await page.reload();await page.mouse.up();await waitInk(true);assert.equal(await finish().isEnabled(),true);await shot('interrupted-reload');
 await page.goto(`${baseURL}/cartilla/lecciones`);await page.goto(`${baseURL}/cartilla/leccion/3`);await waitInk(true);
 await select(learners[1]);await waitInk(false);await select(learners[0]);await waitInk(true);
 assert.deepEqual(errors,[]);await shot('returned-learner-a');
 const video=page.video();await context.close();await video.saveAs(`${root}/${width}-production.webm`);await video.delete();
 results.push({width,height:900,route:'/cartilla/leccion/3',printedPage:9,activityId,checks:['blank disabled','draw enables','undo-only-stroke disables','completed persists across reload','learner B starts empty','learner A restores','erase-all revokes completion','eraser-only movement cannot finish','interrupted reload restores','route return restores','A-B-A preserves separation'],pageErrors:errors,input:'mouse pointer in touch-capable Chromium context; not a touch-only or physical-device claim'});
 await writeFile(`${root}/results.json`,JSON.stringify(results,null,2));
 console.log(JSON.stringify(results.at(-1)));
}
}finally{await browser.close();}
