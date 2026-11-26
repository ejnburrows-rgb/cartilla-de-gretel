# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: crm-local-demo.spec.ts >> local CRM demo completes student activity, notes, assignment and report at phone size without Supabase
- Location: tests\e2e\crm-local-demo.spec.ts:51:2

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Hoy en tu clase' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: 'Hoy en tu clase' }) with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Hoy en tu clase' })

```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import { readFile } from 'node:fs/promises';
  3   | import { appendFileSync, writeFileSync } from 'node:fs';
  4   | 
  5   | const readinessDiagnostic = process.env.PLAYWRIGHT_CRM_DIAGNOSTICS === '1';
  6   | test.beforeEach(async ({ page }, testInfo) => {
  7   |  if(!readinessDiagnostic) return;
  8   |  const destination=testInfo.outputPath('crm-readiness-events.ndjson');
  9   |  const log=(kind:string,detail:unknown)=>appendFileSync(destination,JSON.stringify({utc:new Date().toISOString(),kind,detail})+'\n');
  10  |  const pathname=(url:string)=>{try{return new URL(url).pathname;}catch{return 'unparseable';}};
  11  |  page.on('domcontentloaded',()=>log('domcontentloaded',pathname(page.url())));
  12  |  page.on('load',()=>log('load',pathname(page.url())));
  13  |  page.on('requestfailed',request=>log('requestfailed',{path:pathname(request.url()),failure:request.failure()?.errorText}));
  14  |  page.on('response',response=>{if(response.status()>=400)log('http-error',{path:pathname(response.url()),status:response.status()});});
  15  |  page.on('pageerror',error=>log('pageerror',{name:error.name,message:error.message.slice(0,400)}));
  16  |  await page.exposeFunction('__crmReportReadiness',(state:unknown)=>log('heading-ready',state));
  17  |  await page.addInitScript(()=>{
  18  |   const state=(window as any).__crmReadiness={documentStarted:performance.now(),domReady:null,headingReady:null};
  19  |   document.addEventListener('DOMContentLoaded',()=>{
  20  |    state.domReady=performance.now();
  21  |    const observe=()=>{
  22  |     if(document.querySelector('h1')?.textContent?.trim()!=='Hoy en tu clase')return;
  23  |     state.headingReady=performance.now();observer.disconnect();
  24  |     void (window as any).__crmReportReadiness({...state}).catch(()=>{});
  25  |    };
  26  |    const observer=new MutationObserver(observe);
  27  |    observer.observe(document.documentElement,{subtree:true,childList:true});observe();
  28  |   });
  29  |  });
  30  | });
  31  | test.afterEach(async ({ page },testInfo)=>{
  32  |  if(!readinessDiagnostic)return;
  33  |  const diagnostic=await page.evaluate(()=>({
  34  |   readiness:(window as any).__crmReadiness,
  35  |   navigation:performance.getEntriesByType('navigation').map(entry=>{const value=entry as PerformanceNavigationTiming;return {responseEnd:value.responseEnd,domContentLoadedEventEnd:value.domContentLoadedEventEnd,loadEventEnd:value.loadEventEnd,duration:value.duration};}),
  36  |   resources:performance.getEntriesByType('resource').map(entry=>{const value=entry as PerformanceResourceTiming;return {path:new URL(value.name).pathname,start:value.startTime,responseEnd:value.responseEnd,duration:value.duration,bytes:value.transferSize};}),
  37  |  })).catch(error=>({unavailable:String(error)}));
  38  |  writeFileSync(testInfo.outputPath('crm-readiness.json'),JSON.stringify(diagnostic,null,2));
  39  |  if(testInfo.status!==testInfo.expectedStatus)await page.screenshot({path:testInfo.outputPath('failure.png'),fullPage:true}).catch(()=>{});
  40  | });
  41  | 
  42  | async function noOverflow(page: Page) {
  43  |   expect(await page.evaluate(() => document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  44  |   expect(await page.evaluate(()=>[...document.querySelectorAll<HTMLElement>('button,input,textarea,select,h1,h2,a')].filter(el=>{
  45  |    const r=el.getBoundingClientRect();if(!r.width||!r.height||getComputedStyle(el).visibility==='hidden')return false;
  46  |    let parent=el.parentElement;while(parent){if(parent!==document.body && parent!==document.documentElement && parent.scrollWidth>parent.clientWidth+1 && ['auto','scroll'].includes(getComputedStyle(parent).overflowX))return false;parent=parent.parentElement;}
  47  |    return r.left < -1 || r.right > innerWidth + 1;
  48  |   }).map(el=>el.getAttribute('aria-label')||el.textContent))).toEqual([]);
  49  | }
  50  | for (const [name,width,height] of [['laptop',1366,768],['tablet',768,1024],['phone',390,844],['projector',1920,1080]] as const) {
  51  |  test(`local CRM demo completes student activity, notes, assignment and report at ${name} size without Supabase`,async({page})=>{
  52  |   test.setTimeout(120000);
  53  |   await page.setViewportSize({width,height});
  54  |   const backendRequests:string[]=[];
  55  |   await page.route('**/rest/v1/**',route=>{backendRequests.push(route.request().url());return route.abort();});
  56  |   await page.route('**/auth/v1/**',route=>{backendRequests.push(route.request().url());return route.abort();});
  57  |   await page.goto('/cartilla/teacher/crm');
> 58  |   await expect(page.getByRole('heading',{name:'Hoy en tu clase'})).toBeVisible();
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
  59  |   await page.getByRole('button',{name:'Nueva clase',exact:true}).click();
  60  |   await page.getByRole('textbox',{name:'Nombre de la nueva clase'}).fill(`Demo ${name}`);
  61  |   await page.getByRole('button',{name:'Crear clase',exact:true}).click();
  62  |   await expect(page.getByRole('heading',{name:`Demo ${name}`,exact:true})).toBeVisible();
  63  |   for(const child of ['Demo Ana','Demo Beto']) {
  64  |    await page.getByRole('textbox',{name:'Añadir estudiante'}).fill(child);
  65  |    await page.getByRole('button',{name:'Añadir estudiante'}).click();
  66  |    await expect(page.getByText(child,{exact:true}).first()).toBeVisible();
  67  |   }
  68  |   await page.getByRole('combobox',{name:'Lección para asignar'}).selectOption('2');
  69  |   await page.getByRole('textbox',{name:'Título de la tarea'}).fill('Práctica de la vocal O');
  70  |   await page.getByRole('button',{name:'Asignar lección',exact:true}).click();
  71  |   await expect(page.getByText('Práctica de la vocal O',{exact:true})).toBeVisible();
  72  |   await noOverflow(page);
  73  |   await page.screenshot({path:`docs/proofs/crm-demo/dashboard-${name}.png`,fullPage:true});
  74  |   await page.reload();
  75  |   // Selection intentionally follows the newest class after a reload.
  76  |   await expect(page.getByText('Práctica de la vocal O',{exact:true})).toBeVisible();
  77  |   await page.getByRole('textbox',{name:'Buscar alumno',exact:true}).fill('Beto');
  78  |   await expect(page.getByRole('region',{name:'Resultados de búsqueda'}).getByRole('link',{name:'Demo Beto',exact:true})).toBeVisible();
  79  |   await expect(page.getByRole('region',{name:'Resultados de búsqueda'}).getByRole('link',{name:'Demo Ana',exact:true})).toHaveCount(0);
  80  |   await page.getByRole('textbox',{name:'Buscar alumno',exact:true}).fill('');
  81  |   const ids=await page.evaluate(()=>{
  82  |    const data=JSON.parse(localStorage.getItem('cartilla.seed.state.v1')!);
  83  |    return {classId:data.classes[0].id,ana:data.students.find((s:any)=>s.display_name==='Demo Ana').id,beto:data.students.find((s:any)=>s.display_name==='Demo Beto').id};
  84  |   });
  85  |   await page.goto(`/cartilla/teacher/crm/${ids.classId}/${ids.ana}`);
  86  |   await expect(page.getByRole('heading',{name:'Demo Ana',exact:true,level:1})).toBeVisible();
  87  |   const note=page.getByRole('textbox',{name:/Notas|Escribe|Añade|observaciones/i});
  88  |   // Existing note editor uses its placeholder as its accessible name.
  89  |   const notes=await note.count()?note:page.locator('textarea').last();
  90  |   await notes.fill('Practicar la vocal O con acompañamiento.');
  91  |   await page.getByRole('button',{name:'Guardar Notas',exact:true}).click();
  92  |   await page.reload();
  93  |   await expect(page.locator('textarea').last()).toHaveValue('Practicar la vocal O con acompañamiento.');
  94  |   await noOverflow(page);
  95  |   // An unrelated real identity/work fixture must survive the sample session.
  96  |   await page.evaluate(()=>{
  97  |    localStorage.setItem('cartilla.student-session.v1',JSON.stringify({studentId:'real-id',classId:'real-class'}));
  98  |    localStorage.setItem('cartilla-writing-page-90:student:real-class:real-id','Real work remains');
  99  |    localStorage.setItem('cartilla-writing-page-90','Anonymous work remains');
  100 |   });
  101 |   await page.getByRole('button',{name:'Probar como alumno',exact:true}).click();
  102 |   await expect(page).toHaveURL(/leccion\/2/);
  103 |   await expect(page.getByRole('complementary',{name:'Alumno de demostración'})).toContainText('Demo Ana');
  104 |   await noOverflow(page);
  105 |   const viewer=page.locator('.native-lesson-viewer');
  106 |   await expect(viewer).toHaveAttribute('data-native-page','4');
  107 |   for(const caption of ['ola','oso','oveja','oreja','olla','ocho','ojos']) {
  108 |    const cells=viewer.getByRole('button',{name:caption,exact:true});
  109 |    for(let i=0;i<await cells.count();i++) await cells.nth(i).click();
  110 |   }
  111 |   // Each tap is graded at once (no separate Comprobar step).
  112 |   await expect(viewer).toHaveAttribute('data-page-complete','true',{timeout:15000});
  113 |   await page.reload();
  114 |   await expect(viewer).toHaveAttribute('data-page-complete','true');
  115 |   await page.screenshot({path:`docs/proofs/crm-demo/student-${name}.png`,fullPage:true});
  116 |   await page.getByRole('link',{name:'Volver al CRM',exact:true}).click();
  117 |   await expect(page.getByRole('heading',{name:'Demo Ana',exact:true,level:1})).toBeVisible();
  118 |   const evidence=await page.evaluate(({ana,beto})=>{
  119 |    const data=JSON.parse(localStorage.getItem('cartilla.seed.state.v1')!);
  120 |    return {identity:localStorage.getItem('cartilla.student-session.v1'),ana:data.events.filter((e:any)=>e.student_id===ana),beto:data.events.filter((e:any)=>e.student_id===beto),real:localStorage.getItem('cartilla-writing-page-90:student:real-class:real-id'),anonymous:localStorage.getItem('cartilla-writing-page-90')};
  121 |   },ids);
  122 |   expect(evidence.ana.some((e:any)=>e.event_kind==='exercise'&&e.score===8&&e.total===8&&e.meta?.demo===true)).toBe(true);
  123 |   expect(evidence.beto).toEqual([]);
  124 |   expect(evidence.identity).toContain('real-class');
  125 |   expect(evidence.real).toBe('Real work remains');expect(evidence.anonymous).toBe('Anonymous work remains');
  126 |   await page.screenshot({path:`docs/proofs/crm-demo/teacher-${name}.png`,fullPage:true});
  127 |   await page.goto(`/cartilla/teacher/crm/${ids.classId}/${ids.beto}`);
  128 |   await page.getByRole('button',{name:'Probar como alumno',exact:true}).click();
  129 |   await expect(viewer).toHaveAttribute('data-page-complete','false');
  130 |   await expect(viewer.locator('.fp-ix-cell.graded-correct')).toHaveCount(0);
  131 |   await page.getByRole('link',{name:'Volver al CRM',exact:true}).click();
  132 |   await page.goto('/cartilla/teacher/reportes');
  133 |   await page.locator('select').first().selectOption(ids.classId);
  134 |   await page.locator('select').nth(1).selectOption(ids.ana);
  135 |   await expect(page.locator('table')).toContainText('8/8');
  136 |   const download=page.waitForEvent('download');
  137 |   await page.getByRole('button',{name:'Exportar CSV',exact:true}).click();
  138 |   const csv=await download; const csvPath=await csv.path();
  139 |   expect(csv.suggestedFilename()).toBe('reporte_demo_ana.csv');
  140 |   expect(await readFile(csvPath!,'utf8')).toMatch(/exercise,2,8,8/);
  141 |   await noOverflow(page);
  142 |   await page.screenshot({path:`docs/proofs/crm-demo/report-${name}.png`,fullPage:true});
  143 |   if(name==='laptop') {
  144 |    await page.emulateMedia({media:'print'});
  145 |    const pdf=await page.pdf({path:'docs/proofs/crm-demo/report.pdf',preferCSSPageSize:true,printBackground:true});
  146 |    expect(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)?.length).toBe(1);
  147 |    await page.emulateMedia({media:'screen'});
  148 |   }
  149 |   expect(backendRequests).toEqual([]);
  150 |  });
  151 | }
  152 | 
  153 | // Exercise the existing authored handwriting/drawing page under two synthetic identities.
  154 | test('demo handwriting and drawings resume separately; reset preserves ordinary work',async({page})=>{
  155 |  test.setTimeout(120000);
  156 |  await page.goto('/cartilla/teacher/crm');
  157 |  const roster=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('cartilla.seed.state.v1')!);return d.students.filter((s:any)=>s.class_id===d.classes[0].id).slice(0,2).map((s:any)=>({classId:s.class_id,id:s.id}));});
  158 |  async function openDrawing(student:typeof roster[number]) {
```