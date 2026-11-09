# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: crm-local-demo.spec.ts >> local CRM demo completes student activity, notes, assignment and report at phone size without Supabase
- Location: tests\e2e\crm-local-demo.spec.ts:13:2

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

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Saltar al contenido principal" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e5]:
    - status [ref=e6]: Acceso abierto · Clase de ejemplo. Los cambios se guardan solo en este navegador.
    - banner [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e10]: G
          - generic [ref=e11]:
            - generic [ref=e12]: La Cartilla de Gretel
            - generic [ref=e13]: Panel del Docente
        - button "Abrir menú" [ref=e14]
    - main [ref=e16]:
      - main [ref=e18]:
        - generic [ref=e19]:
          - textbox "Buscar alumno" [ref=e25]:
            - /placeholder: Buscar alumno...
          - generic [ref=e26]:
            - link "Ver progreso de la clase" [ref=e27] [cursor=pointer]:
              - /url: /cartilla/teacher/progreso
            - generic [ref=e31]: M
        - generic [ref=e33]:
          - generic [ref=e35]:
            - generic [ref=e36]:
              - paragraph [ref=e37]: La Cartilla de Gretel · Docente
              - heading "Hoy en tu clase" [level=1] [ref=e38]
              - paragraph [ref=e39]: Atención, práctica y progreso basados únicamente en lo registrado en la Cartilla.
            - generic [ref=e40]:
              - button "Nueva clase" [ref=e41]
              - button "Restablecer demostración" [ref=e42]
              - combobox "Clase activa" [ref=e43]:
                - option "Clase de Prueba (Demo Local)" [selected]
              - link "Presentar" [ref=e44] [cursor=pointer]:
                - /url: /cartilla/presentar/1
          - generic [ref=e49]:
            - generic [ref=e50]:
              - heading "Clase de Prueba (Demo Local)" [level=2] [ref=e51]
              - paragraph [ref=e52]: 3 estudiantes · Código DEMO12
            - generic [ref=e53]:
              - textbox "Añadir estudiante" [ref=e54]
              - button "Añadir estudiante" [disabled] [ref=e55]: Añadir
          - generic [ref=e57]: Leyendo el progreso registrado…
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
> 20  |   await expect(page.getByRole('heading',{name:'Hoy en tu clase'})).toBeVisible();
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
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
  78  |   await page.getByRole('link',{name:'Volver al CRM',exact:true}).click();
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
```