import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(()=>[...document.querySelectorAll<HTMLElement>('button,input,textarea,select,h1,h2,a')].filter(el=>{
   const r=el.getBoundingClientRect();if(!r.width||!r.height||getComputedStyle(el).visibility==='hidden')return false;
   let parent=el.parentElement;while(parent){if(parent!==document.body && parent!==document.documentElement && parent.scrollWidth>parent.clientWidth+1 && ['auto','scroll'].includes(getComputedStyle(parent).overflowX))return false;parent=parent.parentElement;}
   return r.left < -1 || r.right > innerWidth + 1;
  }).map(el=>el.getAttribute('aria-label')||el.textContent))).toEqual([]);
}
for (const [name,width,height] of [['laptop',1366,768],['tablet',768,1024],['phone',390,844],['projector',1920,1080]] as const) {
 test(`local CRM demo completes student activity, notes, assignment and report at ${name} size without Supabase`,async({page})=>{
  test.setTimeout(120000);
  await page.setViewportSize({width,height});
  const backendRequests:string[]=[];
  await page.route('**/rest/v1/**',route=>{backendRequests.push(route.request().url());return route.abort();});
  await page.route('**/auth/v1/**',route=>{backendRequests.push(route.request().url());return route.abort();});
  await page.goto('/cartilla/teacher/crm');
  await expect(page.getByRole('heading',{name:'Hoy en tu clase'})).toBeVisible();
  await page.getByRole('button',{name:'Nueva clase',exact:true}).click();
  await page.getByRole('textbox',{name:'Nombre de la nueva clase'}).fill(`Demo ${name}`);
  await page.getByRole('button',{name:'Crear clase',exact:true}).click();
  await expect(page.getByRole('heading',{name:`Demo ${name}`,exact:true})).toBeVisible();
  for(const child of ['Demo Ana','Demo Beto']) {
   await page.getByRole('textbox',{name:'Añadir estudiante'}).fill(child);
   await page.getByRole('button',{name:'Añadir estudiante'}).click();
   await expect(page.getByText(child,{exact:true}).first()).toBeVisible();
  }
  await page.getByRole('combobox',{name:'Lección para asignar'}).selectOption('2');
  await page.getByRole('textbox',{name:'Título de la tarea'}).fill('Práctica de la vocal O');
  await page.getByRole('button',{name:'Asignar lección',exact:true}).click();
  await expect(page.getByText('Práctica de la vocal O',{exact:true})).toBeVisible();
  await noOverflow(page);
  await page.screenshot({path:`docs/proofs/crm-demo/dashboard-${name}.png`,fullPage:true});
  await page.reload();
  // Selection intentionally follows the newest class after a reload.
  await expect(page.getByText('Práctica de la vocal O',{exact:true})).toBeVisible();
  await page.getByRole('textbox',{name:'Buscar alumno',exact:true}).fill('Beto');
  await expect(page.getByRole('region',{name:'Resultados de búsqueda'}).getByRole('link',{name:'Demo Beto',exact:true})).toBeVisible();
  await expect(page.getByRole('region',{name:'Resultados de búsqueda'}).getByRole('link',{name:'Demo Ana',exact:true})).toHaveCount(0);
  await page.getByRole('textbox',{name:'Buscar alumno',exact:true}).fill('');
  const ids=await page.evaluate(()=>{
   const data=JSON.parse(localStorage.getItem('cartilla.seed.state.v1')!);
   return {classId:data.classes[0].id,ana:data.students.find((s:any)=>s.display_name==='Demo Ana').id,beto:data.students.find((s:any)=>s.display_name==='Demo Beto').id};
  });
  await page.goto(`/cartilla/teacher/crm/${ids.classId}/${ids.ana}`);
  await expect(page.getByRole('heading',{name:'Demo Ana',exact:true,level:1})).toBeVisible();
  const note=page.getByRole('textbox',{name:/Notas|Escribe|Añade|observaciones/i});
  // Existing note editor uses its placeholder as its accessible name.
  const notes=await note.count()?note:page.locator('textarea').last();
  await notes.fill('Practicar la vocal O con acompañamiento.');
  await page.getByRole('button',{name:'Guardar Notas',exact:true}).click();
  await page.reload();
  await expect(page.locator('textarea').last()).toHaveValue('Practicar la vocal O con acompañamiento.');
  await noOverflow(page);
  // An unrelated real identity/work fixture must survive the sample session.
  await page.evaluate(()=>{
   localStorage.setItem('cartilla.student-session.v1',JSON.stringify({studentId:'real-id',classId:'real-class'}));
   localStorage.setItem('cartilla-writing-page-90:student:real-class:real-id','Real work remains');
   localStorage.setItem('cartilla-writing-page-90','Anonymous work remains');
  });
  await page.getByRole('button',{name:'Probar como alumno',exact:true}).click();
  await expect(page).toHaveURL(/leccion\/2/);
  await expect(page.getByRole('complementary',{name:'Alumno de demostración'})).toContainText('Demo Ana');
  await noOverflow(page);
  const viewer=page.locator('.native-lesson-viewer');
  await expect(viewer).toHaveAttribute('data-native-page','4');
  for(const caption of ['ola','oso','oveja','oreja','olla','ocho','ojos']) {
   const cells=viewer.getByRole('button',{name:caption,exact:true});
   for(let i=0;i<await cells.count();i++) await cells.nth(i).click();
  }
  await viewer.getByRole('button',{name:'Comprobar',exact:true}).click();
  await expect(viewer).toHaveAttribute('data-page-complete','true');
  await page.reload();
  await expect(viewer).toHaveAttribute('data-page-complete','true');
  await page.screenshot({path:`docs/proofs/crm-demo/student-${name}.png`,fullPage:true});
  await page.getByRole('link',{name:'Volver al CRM',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Demo Ana',exact:true,level:1})).toBeVisible();
  const evidence=await page.evaluate(({ana,beto})=>{
   const data=JSON.parse(localStorage.getItem('cartilla.seed.state.v1')!);
   return {identity:localStorage.getItem('cartilla.student-session.v1'),ana:data.events.filter((e:any)=>e.student_id===ana),beto:data.events.filter((e:any)=>e.student_id===beto),real:localStorage.getItem('cartilla-writing-page-90:student:real-class:real-id'),anonymous:localStorage.getItem('cartilla-writing-page-90')};
  },ids);
  expect(evidence.ana.some((e:any)=>e.event_kind==='exercise'&&e.score===8&&e.total===8&&e.meta?.demo===true)).toBe(true);
  expect(evidence.beto).toEqual([]);
  expect(evidence.identity).toContain('real-class');
  expect(evidence.real).toBe('Real work remains');expect(evidence.anonymous).toBe('Anonymous work remains');
  await page.screenshot({path:`docs/proofs/crm-demo/teacher-${name}.png`,fullPage:true});
  await page.goto(`/cartilla/teacher/crm/${ids.classId}/${ids.beto}`);
  await page.getByRole('button',{name:'Probar como alumno',exact:true}).click();
  await expect(viewer).toHaveAttribute('data-page-complete','false');
  await expect(viewer.locator('.fp-ix-cell.graded-correct')).toHaveCount(0);
  await page.getByRole('link',{name:'Volver al CRM',exact:true}).click();
  await page.goto('/cartilla/teacher/reportes');
  await page.locator('select').first().selectOption(ids.classId);
  await page.locator('select').nth(1).selectOption(ids.ana);
  await expect(page.locator('table')).toContainText('8/8');
  const download=page.waitForEvent('download');
  await page.getByRole('button',{name:'Exportar CSV',exact:true}).click();
  const csv=await download; const csvPath=await csv.path();
  expect(csv.suggestedFilename()).toBe('reporte_demo_ana.csv');
  expect(await readFile(csvPath!,'utf8')).toMatch(/exercise,2,8,8/);
  await noOverflow(page);
  await page.screenshot({path:`docs/proofs/crm-demo/report-${name}.png`,fullPage:true});
  if(name==='laptop') {
   await page.emulateMedia({media:'print'});
   const pdf=await page.pdf({path:'docs/proofs/crm-demo/report.pdf',preferCSSPageSize:true,printBackground:true});
   expect(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)?.length).toBe(1);
   await page.emulateMedia({media:'screen'});
  }
  expect(backendRequests).toEqual([]);
 });
}

// Exercise the existing authored handwriting/drawing page under two synthetic identities.
test('demo handwriting and drawings resume separately; reset preserves ordinary work',async({page})=>{
 test.setTimeout(120000);
 await page.goto('/cartilla/teacher/crm');
 const roster=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('cartilla.seed.state.v1')!);return d.students.filter((s:any)=>s.class_id===d.classes[0].id).slice(0,2).map((s:any)=>({classId:s.class_id,id:s.id}));});
 async function openDrawing(student:typeof roster[number]) {
  await page.goto(`/cartilla/teacher/crm/${student.classId}/${student.id}`);
  await page.getByRole('button',{name:'Probar como alumno',exact:true}).click();
  // Set the existing scoped bookmark to the authored drawing page, not fabricated work.
  await page.evaluate(s=>localStorage.setItem(`cartilla.learner-resume.v1:2:demo:${s.classId}:${s.id}`,JSON.stringify({lesson:2,page:2})),student);
  await page.goto('/cartilla/leccion/2');
  await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page','6');
 }
 async function stroke(selector:string,offset:number) {
  const canvas=page.locator(selector).first();await canvas.scrollIntoViewIfNeeded();
  const box=(await canvas.boundingBox())!;
  await page.mouse.move(box.x+box.width*.2,box.y+box.height*offset);await page.mouse.down();
  await page.mouse.move(box.x+box.width*.7,box.y+box.height*.7,{steps:20});await page.mouse.up();
  return canvas.evaluate((el:HTMLCanvasElement)=>el.toDataURL());
 }
 await openDrawing(roster[0]);
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
 const writing=await stroke('.fp-writing-line--freehand canvas',.25);
 const drawing=page.locator('.am-dibuja[data-verb="Dibuja"]');
 if(await drawing.getByRole('button',{name:'Dibujar',exact:true}).count()) await drawing.getByRole('button',{name:'Dibujar',exact:true}).click();
 const image=await stroke('.am-dibuja[data-verb="Dibuja"] canvas',.3);
 await page.getByRole('link',{name:'Volver al CRM',exact:true}).click();
 await openDrawing(roster[1]);
 const other=await stroke('.fp-writing-line--freehand canvas',.6);expect(other).not.toBe(writing);
 await page.getByRole('link',{name:'Volver al CRM',exact:true}).click();
 await page.goto(`/cartilla/teacher/crm/${roster[0].classId}/${roster[0].id}`);
 await page.getByRole('button',{name:'Probar como alumno',exact:true}).click();
 await page.goto('/cartilla/leccion/2');
 await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page','6');
 await expect.poll(()=>page.locator('.fp-writing-line--freehand canvas').first().evaluate((el:HTMLCanvasElement)=>el.toDataURL())).toBe(writing);
 await page.reload();
 await expect.poll(()=>drawing.locator('canvas').evaluate((el:HTMLCanvasElement)=>el.toDataURL())).toBe(image);
 await drawing.locator('canvas').scrollIntoViewIfNeeded();
 await page.screenshot({path:'docs/proofs/crm-demo/demo-handwriting-resumed.png',fullPage:true});
 await page.goto('/cartilla/teacher/crm');
 await page.evaluate(()=>{localStorage.setItem('ordinary-work','keep');localStorage.setItem('ordinary-work:student:real:child','keep real');});
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Restablecer demostración',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Hoy en tu clase'})).toBeVisible();
 expect(await page.evaluate(()=>({normal:localStorage.getItem('ordinary-work'),real:localStorage.getItem('ordinary-work:student:real:child'),demo:Object.keys(localStorage).filter(k=>k.includes(':demo:'))}))).toEqual({normal:'keep',real:'keep real',demo:[]});
});
