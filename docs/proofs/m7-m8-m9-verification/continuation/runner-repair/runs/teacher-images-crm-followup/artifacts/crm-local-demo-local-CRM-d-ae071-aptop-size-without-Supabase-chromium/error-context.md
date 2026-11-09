# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: crm-local-demo.spec.ts >> local CRM demo completes student activity, notes, assignment and report at laptop size without Supabase
- Location: tests\e2e\crm-local-demo.spec.ts:13:2

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: 'Volver al CRM', exact: true })
    - locator resolved to <a class="rounded-xl bg-white px-4 py-3 font-bold border border-amber-200" href="/cartilla/teacher/crm/seed-class-4bf890e8-5807-431a-8f2a-be98151bf36f/seed-student-b8a1a6ea-36cb-444e-b89d-fd7d5ecb131c">Volver al CRM</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <select aria-label="Cambiar de lección" class="rounded-xl border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-900 shadow-2xs">…</select> from <header class="lc-lesson-header flex flex-wrap items-center justify-between gap-3">…</header> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <select aria-label="Cambiar de lección" class="rounded-xl border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-900 shadow-2xs">…</select> from <header class="lc-lesson-header flex flex-wrap items-center justify-between gap-3">…</header> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    121 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <select aria-label="Cambiar de lección" class="rounded-xl border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-900 shadow-2xs">…</select> from <header class="lc-lesson-header flex flex-wrap items-center justify-between gap-3">…</header> subtree intercepts pointer events
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=f5e2]:
  - link "Saltar al contenido principal" [ref=f5e3] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=f5e5]:
    - complementary "Alumno de demostración" [ref=f5e6]:
      - generic [ref=f5e7]:
        - strong [ref=f5e8]: Alumno de demostración · Demo Ana · Demo laptop
        - paragraph [ref=f5e9]: El trabajo se guarda en este navegador y actualiza la clase de ejemplo.
      - link "Volver al CRM" [ref=f5e10] [cursor=pointer]:
        - /url: /cartilla/teacher/crm/seed-class-4bf890e8-5807-431a-8f2a-be98151bf36f/seed-student-b8a1a6ea-36cb-444e-b89d-fd7d5ecb131c
    - banner:
      - link "Mis lecciones" [ref=f5e11] [cursor=pointer]:
        - /url: /cartilla/lecciones
      - generic [ref=f5e14] [cursor=pointer]:
        - generic [ref=f5e15]: "Ir a lección:"
        - combobox "Cambiar de lección" [ref=f5e16]:
          - 'option "Lección 1 — Las vocales: A E I O U"'
          - option "Lección 2 — La vocal O" [selected]
          - option "Lección 3 — La vocal A"
          - option "Lección 4 — La vocal E"
          - option "Lección 5 — La vocal I"
          - option "Lección 6 — La vocal U"
          - option "Lección 7 — La consonante Mm"
          - option "Lección 8 — La consonante Pp"
          - option "Lección 9 — La consonante Ss"
          - option "Lección 10 — La consonante Tt"
          - option "Lección 11 — La consonante Dd"
          - option "Lección 12 — La consonante Ll"
          - option "Lección 13 — La consonante Nn"
          - option "Lección 14 — La consonante Ññ"
          - option "Lección 15 — La consonante Bb"
          - option "Lección 16 — La consonante Vv"
          - option "Lección 17 — La consonante Rr"
          - option "Lección 18 — La consonante Rr"
          - option "Lección 19 — La consonante Gg"
          - option "Lección 20 — La consonante Ff"
          - option "Lección 21 — La consonante Jj"
          - option "Lección 22 — La consonante Cc"
          - option "Lección 23 — La consonante Yy"
          - option "Lección 24 — La consonante Zz"
    - button "Abrir Panel de Control de Demostración" [ref=f5e18] [cursor=pointer]: Demo · L2
    - main [ref=f5e22]:
      - generic [ref=f5e23]: Lección 2 · páginas 4-6
      - region "Página de aprendizaje" [ref=f5e28]:
        - generic [ref=f5e29]:
          - generic [ref=f5e30]: Lección 2 · La vocal O
          - generic [ref=f5e31]: Página 4 · 1 de 3
        - generic [ref=f5e33]:
          - generic [ref=f5e35]:
            - generic [ref=f5e36]:
              - paragraph [ref=f5e39]:
                - generic [ref=f5e40]: "Instrucciones:"
                - text: Marca con una x los dibujos que comienzan con O o.
              - generic [ref=f5e43]:
                - generic [ref=f5e44]:
                  - button "ola" [disabled] [pressed] [ref=f5e45] [cursor=pointer]:
                    - img "ola" [ref=f5e47]
                  - button "iglú" [disabled] [ref=f5e48] [cursor=pointer]:
                    - img "iglú" [ref=f5e50]
                  - button "oso" [disabled] [pressed] [ref=f5e51] [cursor=pointer]:
                    - img "oso" [ref=f5e53]
                  - button "maíz" [disabled] [ref=f5e54] [cursor=pointer]:
                    - img "maíz" [ref=f5e56]
                - generic [ref=f5e57]:
                  - button "uña" [disabled] [ref=f5e58] [cursor=pointer]:
                    - img "uña" [ref=f5e60]
                  - button "oveja" [disabled] [pressed] [ref=f5e61] [cursor=pointer]:
                    - img "oveja" [ref=f5e63]
                  - button "alas" [disabled] [ref=f5e64] [cursor=pointer]:
                    - img "alas" [ref=f5e66]
                  - button "oreja" [disabled] [pressed] [ref=f5e67] [cursor=pointer]:
                    - img "oreja" [ref=f5e69]
                - generic [ref=f5e70]:
                  - button "olla" [disabled] [pressed] [ref=f5e71] [cursor=pointer]:
                    - img "olla" [ref=f5e73]
                  - button "uvas" [disabled] [ref=f5e74] [cursor=pointer]:
                    - img "uvas" [ref=f5e76]
                  - button "ocho" [disabled] [pressed] [ref=f5e77] [cursor=pointer]:
                    - img "ocho" [ref=f5e79]
                  - button "uno" [disabled] [ref=f5e80] [cursor=pointer]:
                    - img "uno" [ref=f5e82]
                - generic [ref=f5e83]:
                  - button "araña" [disabled] [ref=f5e84] [cursor=pointer]:
                    - img "araña" [ref=f5e86]
                  - button "oso" [disabled] [pressed] [ref=f5e87] [cursor=pointer]:
                    - img "oso" [ref=f5e89]
                  - button "uniforme" [disabled] [ref=f5e90] [cursor=pointer]:
                    - img "uniforme" [ref=f5e92]
                  - button "ojos" [disabled] [pressed] [ref=f5e93] [cursor=pointer]:
                    - img "ojos" [ref=f5e95]
            - generic "Página 4" [ref=f5e96]: "4"
            - generic [ref=f5e98]: Lección 2
          - button "Avanzar de página (doblar esquina)" [ref=f5e99] [cursor=pointer]
        - navigation "Navegación de páginas" [ref=f5e101]:
          - button "Anterior" [disabled] [ref=f5e102]
          - generic [ref=f5e106]: 1 / 3
          - button "Siguiente" [ref=f5e107] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import { readFile } from 'node:fs/promises';
  3   | 
  4   | async function noOverflow(page: Page) {
  5   |   expect(await page.evaluate(() => document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  6   |   expect(await page.evaluate(()=>[...document.querySelectorAll<HTMLElement>('button,input,textarea,select,h1,h2,a')].filter(el=>{
  7   |    const r=el.getBoundingClientRect();if(!r.width||!r.height||getComputedStyle(el).visibility==='hidden')return false;
  8   |    let parent=el.parentElement;while(parent){if(parent!==document.body && parent!==document.documentElement && parent.scrollWidth>parent.clientWidth+1 && ['auto','scroll'].includes(getComputedStyle(parent).overflowX))return false;parent=parent.parentElement;}
  9   |    return r.left < -1 || r.right > innerWidth + 1;
  10  |   }).map(el=>el.getAttribute('aria-label')||el.textContent))).toEqual([]);
  11  | }
  12  | for (const [name,width,height] of [['laptop',1366,768],['tablet',768,1024],['phone',390,844],['projector',1920,1080]] as const) {
  13  |  test(`local CRM demo completes student activity, notes, assignment and report at ${name} size without Supabase`,async({page})=>{
  14  |   test.setTimeout(120000);
  15  |   await page.setViewportSize({width,height});
  16  |   const backendRequests:string[]=[];
  17  |   await page.route('**/rest/v1/**',route=>{backendRequests.push(route.request().url());return route.abort();});
  18  |   await page.route('**/auth/v1/**',route=>{backendRequests.push(route.request().url());return route.abort();});
  19  |   await page.goto('/cartilla/teacher/crm');
  20  |   await expect(page.getByRole('heading',{name:'Hoy en tu clase'})).toBeVisible();
  21  |   await page.getByRole('button',{name:'Nueva clase',exact:true}).click();
  22  |   await page.getByRole('textbox',{name:'Nombre de la nueva clase'}).fill(`Demo ${name}`);
  23  |   await page.getByRole('button',{name:'Crear clase',exact:true}).click();
  24  |   await expect(page.getByRole('heading',{name:`Demo ${name}`,exact:true})).toBeVisible();
  25  |   for(const child of ['Demo Ana','Demo Beto']) {
  26  |    await page.getByRole('textbox',{name:'Añadir estudiante'}).fill(child);
  27  |    await page.getByRole('button',{name:'Añadir estudiante'}).click();
  28  |    await expect(page.getByText(child,{exact:true}).first()).toBeVisible();
  29  |   }
  30  |   await page.getByRole('combobox',{name:'Lección para asignar'}).selectOption('2');
  31  |   await page.getByRole('textbox',{name:'Título de la tarea'}).fill('Práctica de la vocal O');
  32  |   await page.getByRole('button',{name:'Asignar lección',exact:true}).click();
  33  |   await expect(page.getByText('Práctica de la vocal O',{exact:true})).toBeVisible();
  34  |   await noOverflow(page);
  35  |   await page.screenshot({path:`docs/proofs/crm-demo/dashboard-${name}.png`,fullPage:true});
  36  |   await page.reload();
  37  |   // Selection intentionally follows the newest class after a reload.
  38  |   await expect(page.getByText('Práctica de la vocal O',{exact:true})).toBeVisible();
  39  |   await page.getByRole('textbox',{name:'Buscar alumno',exact:true}).fill('Beto');
  40  |   await expect(page.getByRole('region',{name:'Resultados de búsqueda'}).getByRole('link',{name:'Demo Beto',exact:true})).toBeVisible();
  41  |   await expect(page.getByRole('region',{name:'Resultados de búsqueda'}).getByRole('link',{name:'Demo Ana',exact:true})).toHaveCount(0);
  42  |   await page.getByRole('textbox',{name:'Buscar alumno',exact:true}).fill('');
  43  |   const ids=await page.evaluate(()=>{
  44  |    const data=JSON.parse(localStorage.getItem('cartilla.seed.state.v1')!);
  45  |    return {classId:data.classes[0].id,ana:data.students.find((s:any)=>s.display_name==='Demo Ana').id,beto:data.students.find((s:any)=>s.display_name==='Demo Beto').id};
  46  |   });
  47  |   await page.goto(`/cartilla/teacher/crm/${ids.classId}/${ids.ana}`);
  48  |   await expect(page.getByRole('heading',{name:'Demo Ana',exact:true,level:1})).toBeVisible();
  49  |   const note=page.getByRole('textbox',{name:/Notas|Escribe|Añade|observaciones/i});
  50  |   // Existing note editor uses its placeholder as its accessible name.
  51  |   const notes=await note.count()?note:page.locator('textarea').last();
  52  |   await notes.fill('Practicar la vocal O con acompañamiento.');
  53  |   await page.getByRole('button',{name:'Guardar Notas',exact:true}).click();
  54  |   await page.reload();
  55  |   await expect(page.locator('textarea').last()).toHaveValue('Practicar la vocal O con acompañamiento.');
  56  |   await noOverflow(page);
  57  |   // An unrelated real identity/work fixture must survive the sample session.
  58  |   await page.evaluate(()=>{
  59  |    localStorage.setItem('cartilla.student-session.v1',JSON.stringify({studentId:'real-id',classId:'real-class'}));
  60  |    localStorage.setItem('cartilla-writing-page-90:student:real-class:real-id','Real work remains');
  61  |    localStorage.setItem('cartilla-writing-page-90','Anonymous work remains');
  62  |   });
  63  |   await page.getByRole('button',{name:'Probar como alumno',exact:true}).click();
  64  |   await expect(page).toHaveURL(/leccion\/2/);
  65  |   await expect(page.getByRole('complementary',{name:'Alumno de demostración'})).toContainText('Demo Ana');
  66  |   await noOverflow(page);
  67  |   const viewer=page.locator('.native-lesson-viewer');
  68  |   await expect(viewer).toHaveAttribute('data-native-page','4');
  69  |   for(const caption of ['ola','oso','oveja','oreja','olla','ocho','ojos']) {
  70  |    const cells=viewer.getByRole('button',{name:caption,exact:true});
  71  |    for(let i=0;i<await cells.count();i++) await cells.nth(i).click();
  72  |   }
  73  |   // Each tap is graded at once (no separate Comprobar step).
  74  |   await expect(viewer).toHaveAttribute('data-page-complete','true',{timeout:15000});
  75  |   await page.reload();
  76  |   await expect(viewer).toHaveAttribute('data-page-complete','true');
  77  |   await page.screenshot({path:`docs/proofs/crm-demo/student-${name}.png`,fullPage:true});
> 78  |   await page.getByRole('link',{name:'Volver al CRM',exact:true}).click();
      |                                                                  ^ Error: locator.click: Test timeout of 120000ms exceeded.
  79  |   await expect(page.getByRole('heading',{name:'Demo Ana',exact:true,level:1})).toBeVisible();
  80  |   const evidence=await page.evaluate(({ana,beto})=>{
  81  |    const data=JSON.parse(localStorage.getItem('cartilla.seed.state.v1')!);
  82  |    return {identity:localStorage.getItem('cartilla.student-session.v1'),ana:data.events.filter((e:any)=>e.student_id===ana),beto:data.events.filter((e:any)=>e.student_id===beto),real:localStorage.getItem('cartilla-writing-page-90:student:real-class:real-id'),anonymous:localStorage.getItem('cartilla-writing-page-90')};
  83  |   },ids);
  84  |   expect(evidence.ana.some((e:any)=>e.event_kind==='exercise'&&e.score===8&&e.total===8&&e.meta?.demo===true)).toBe(true);
  85  |   expect(evidence.beto).toEqual([]);
  86  |   expect(evidence.identity).toContain('real-class');
  87  |   expect(evidence.real).toBe('Real work remains');expect(evidence.anonymous).toBe('Anonymous work remains');
  88  |   await page.screenshot({path:`docs/proofs/crm-demo/teacher-${name}.png`,fullPage:true});
  89  |   await page.goto(`/cartilla/teacher/crm/${ids.classId}/${ids.beto}`);
  90  |   await page.getByRole('button',{name:'Probar como alumno',exact:true}).click();
  91  |   await expect(viewer).toHaveAttribute('data-page-complete','false');
  92  |   await expect(viewer.locator('.fp-ix-cell.graded-correct')).toHaveCount(0);
  93  |   await page.getByRole('link',{name:'Volver al CRM',exact:true}).click();
  94  |   await page.goto('/cartilla/teacher/reportes');
  95  |   await page.locator('select').first().selectOption(ids.classId);
  96  |   await page.locator('select').nth(1).selectOption(ids.ana);
  97  |   await expect(page.locator('table')).toContainText('8/8');
  98  |   const download=page.waitForEvent('download');
  99  |   await page.getByRole('button',{name:'Exportar CSV',exact:true}).click();
  100 |   const csv=await download; const csvPath=await csv.path();
  101 |   expect(csv.suggestedFilename()).toBe('reporte_demo_ana.csv');
  102 |   expect(await readFile(csvPath!,'utf8')).toMatch(/exercise,2,8,8/);
  103 |   await noOverflow(page);
  104 |   await page.screenshot({path:`docs/proofs/crm-demo/report-${name}.png`,fullPage:true});
  105 |   if(name==='laptop') {
  106 |    await page.emulateMedia({media:'print'});
  107 |    const pdf=await page.pdf({path:'docs/proofs/crm-demo/report.pdf',preferCSSPageSize:true,printBackground:true});
  108 |    expect(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)?.length).toBe(1);
  109 |    await page.emulateMedia({media:'screen'});
  110 |   }
  111 |   expect(backendRequests).toEqual([]);
  112 |  });
  113 | }
  114 | 
  115 | // Exercise the existing authored handwriting/drawing page under two synthetic identities.
  116 | test('demo handwriting and drawings resume separately; reset preserves ordinary work',async({page})=>{
  117 |  test.setTimeout(120000);
  118 |  await page.goto('/cartilla/teacher/crm');
  119 |  const roster=await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('cartilla.seed.state.v1')!);return d.students.filter((s:any)=>s.class_id===d.classes[0].id).slice(0,2).map((s:any)=>({classId:s.class_id,id:s.id}));});
  120 |  async function openDrawing(student:typeof roster[number]) {
  121 |   await page.goto(`/cartilla/teacher/crm/${student.classId}/${student.id}`);
  122 |   await page.getByRole('button',{name:'Probar como alumno',exact:true}).click();
  123 |   // Set the existing scoped bookmark to the authored drawing page, not fabricated work.
  124 |   await page.evaluate(s=>localStorage.setItem(`cartilla.learner-resume.v1:2:demo:${s.classId}:${s.id}`,JSON.stringify({lesson:2,page:2})),student);
  125 |   await page.goto('/cartilla/leccion/2');
  126 |   await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page','6');
  127 |  }
  128 |  async function stroke(selector:string,offset:number) {
  129 |   const canvas=page.locator(selector).first();await canvas.scrollIntoViewIfNeeded();
  130 |   const box=(await canvas.boundingBox())!;
  131 |   await page.mouse.move(box.x+box.width*.2,box.y+box.height*offset);await page.mouse.down();
  132 |   await page.mouse.move(box.x+box.width*.7,box.y+box.height*.7,{steps:20});await page.mouse.up();
  133 |   return canvas.evaluate((el:HTMLCanvasElement)=>el.toDataURL());
  134 |  }
  135 |  await openDrawing(roster[0]);
  136 |  await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
  137 |  const writing=await stroke('.fp-writing-line--freehand canvas',.25);
  138 |  const drawing=page.locator('.am-dibuja[data-verb="Dibuja"]');
  139 |  if(await drawing.getByRole('button',{name:'Dibujar',exact:true}).count()) await drawing.getByRole('button',{name:'Dibujar',exact:true}).click();
  140 |  const image=await stroke('.am-dibuja[data-verb="Dibuja"] canvas',.3);
  141 |  await page.getByRole('link',{name:'Volver al CRM',exact:true}).click();
  142 |  await openDrawing(roster[1]);
  143 |  const other=await stroke('.fp-writing-line--freehand canvas',.6);expect(other).not.toBe(writing);
  144 |  await page.getByRole('link',{name:'Volver al CRM',exact:true}).click();
  145 |  await page.goto(`/cartilla/teacher/crm/${roster[0].classId}/${roster[0].id}`);
  146 |  await page.getByRole('button',{name:'Probar como alumno',exact:true}).click();
  147 |  await page.goto('/cartilla/leccion/2');
  148 |  await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page','6');
  149 |  await expect.poll(()=>page.locator('.fp-writing-line--freehand canvas').first().evaluate((el:HTMLCanvasElement)=>el.toDataURL())).toBe(writing);
  150 |  await page.reload();
  151 |  await expect.poll(()=>drawing.locator('canvas').evaluate((el:HTMLCanvasElement)=>el.toDataURL())).toBe(image);
  152 |  await drawing.locator('canvas').scrollIntoViewIfNeeded();
  153 |  await page.screenshot({path:'docs/proofs/crm-demo/demo-handwriting-resumed.png',fullPage:true});
  154 |  await page.goto('/cartilla/teacher/crm');
  155 |  await page.evaluate(()=>{localStorage.setItem('ordinary-work','keep');localStorage.setItem('ordinary-work:student:real:child','keep real');});
  156 |  page.once('dialog',dialog=>dialog.accept());
  157 |  await page.getByRole('button',{name:'Restablecer demostración',exact:true}).click();
  158 |  await expect(page.getByRole('heading',{name:'Hoy en tu clase'})).toBeVisible();
  159 |  expect(await page.evaluate(()=>({normal:localStorage.getItem('ordinary-work'),real:localStorage.getItem('ordinary-work:student:real:child'),demo:Object.keys(localStorage).filter(k=>k.includes(':demo:'))}))).toEqual({normal:'keep',real:'keep real',demo:[]});
  160 | });
  161 | 
```