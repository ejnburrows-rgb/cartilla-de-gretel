# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: classroom-readiness.spec.ts >> student and teacher interface at projector size
- Location: tests\e2e\classroom-readiness.spec.ts:75:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.native-lesson-viewer')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.native-lesson-viewer') with timeout 5000ms
  - waiting for locator('.native-lesson-viewer')
  - Page crashed

```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | const PROOF = 'docs/proofs/classroom-readiness';
  4   | async function bookmark(page: Page, lesson: number, index: number) {
  5   |   await page.goto('/cartilla/lecciones');
  6   |   await page.evaluate(({ lesson, index }) => localStorage.setItem(`cartilla.learner-resume.v1:${lesson}`, JSON.stringify({lesson, page:index})), {lesson,index});
  7   |   await page.goto(`/cartilla/leccion/${lesson}`);
> 8   |   await expect(page.locator('.native-lesson-viewer')).toBeVisible();
      |                                                       ^ Error: expect(locator).toBeVisible() failed
  9   | }
  10  | async function draw(page: Page, selector: string) {
  11  |   const canvas = page.locator(selector).first();
  12  |   await page.waitForFunction(() => [...document.images].every(image => image.complete));
  13  |   await page.evaluate(() => document.fonts.ready);
  14  |   await canvas.scrollIntoViewIfNeeded();
  15  |   const box = (await canvas.boundingBox())!;
  16  |   await page.mouse.move(box.x + box.width * .2, box.y + box.height * .3);
  17  |   await page.mouse.down();
  18  |   await page.mouse.move(box.x + box.width * .7, box.y + box.height * .65, {steps:20});
  19  |   await page.mouse.up();
  20  |   return canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL());
  21  | }
  22  | async function noHorizontalLoss(page: Page) {
  23  |   expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  24  |   const clipped = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('button, input, textarea, select')].filter(el => {
  25  |     const rect = el.getBoundingClientRect();
  26  |     if (!rect.width || !rect.height || getComputedStyle(el).visibility === 'hidden') return false;
  27  |     // Native horizontally scrollable navigation is intentionally reachable by scrolling.
  28  |     let parent = el.parentElement;
  29  |     while (parent) { if (['auto', 'scroll'].includes(getComputedStyle(parent).overflowX)) return false; parent = parent.parentElement; }
  30  |     return rect.left < -1 || rect.right > innerWidth + 1;
  31  |   }).map(el => el.getAttribute('aria-label') || el.textContent));
  32  |   expect(clipped).toEqual([]);
  33  | }
  34  | 
  35  | test('partial handwriting, freehand work and typed sentences survive leaving, reloading and resizing', async ({page}) => {
  36  |   await bookmark(page,2,2);
  37  |   const trace = page.locator('.fp-trace').first();
  38  |   await trace.getByRole('button',{name:/Punto 1.*toca aquí/i}).click();
  39  |   const partial = await trace.locator('svg').innerHTML();
  40  |   await draw(page,'.fp-writing-line--freehand canvas');
  41  |   const freehand = await page.locator('.fp-writing-line--freehand canvas').first().evaluate((el:HTMLCanvasElement)=>el.toDataURL());
  42  |   await page.getByRole('link',{name:'Mis lecciones',exact:true}).click();
  43  |   await page.getByRole('link',{name:'Continuar lección 2',exact:true}).click();
  44  |   await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page','6');
  45  |   await expect(trace.locator('svg')).toHaveJSProperty('innerHTML',partial);
  46  |   await expect.poll(()=>page.locator('.fp-writing-line--freehand canvas').first().evaluate((el:HTMLCanvasElement)=>el.toDataURL())).toBe(freehand);
  47  |   // Real drawing task switches to its authored freehand mode.
  48  |   const drawing = page.locator('.am-dibuja[data-verb="Dibuja"]');
  49  |   const mode = drawing.getByRole('button',{name:'Dibujar',exact:true});
  50  |   if(await mode.count()) await mode.click();
  51  |   const drawingUrl = await draw(page,'.am-dibuja[data-verb="Dibuja"] canvas');
  52  |   await page.reload();
  53  |   await expect.poll(()=>drawing.locator('canvas').evaluate((el:HTMLCanvasElement)=>el.toDataURL())).toBe(drawingUrl);
  54  |   await drawing.getByRole('button',{name:'Listo',exact:true}).click();
  55  |   await expect(drawing).toHaveClass(/is-done/);
  56  |   await page.setViewportSize({width:768,height:1024});
  57  |   expect(await drawing.locator('canvas').evaluate((el:HTMLCanvasElement)=>el.getContext('2d')!.getImageData(0,0,el.width,el.height).data.some((value,index)=> index%4===3 && value>0))).toBe(true);
  58  |   await page.screenshot({path:`${PROOF}/student-writing-tablet.png`,fullPage:true});
  59  |   await bookmark(page,24,3);
  60  |   for (const [index, answer] of ['za','ze','zu','zo','zu','Zi'].entries()) {
  61  |     await page.locator('.fp-ix-fill__item').nth(index).getByRole('button',{name:answer,exact:true}).click();
  62  |   }
  63  |   await page.getByRole('textbox',{name:'Escribe tus oraciones'}).fill('Yo escribo mis propias oraciones.');
  64  |   // Writing completes only when the learner confirms it with "Listo".
  65  |   await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-page-complete','false');
  66  |   await page.locator('.native-lesson-viewer').getByRole('button',{name:'Listo',exact:true}).last().click();
  67  |   await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-page-complete','true');
  68  |   await page.reload();
  69  |   await expect(page.getByRole('textbox')).toHaveValue('Yo escribo mis propias oraciones.');
  70  |   await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-page-complete','true');
  71  |   await page.screenshot({path:`${PROOF}/student-writing-resumed.png`,fullPage:true});
  72  | });
  73  | 
  74  | for(const [name,width,height] of [['laptop',1366,768],['tablet',768,1024],['phone',390,844],['projector',1920,1080]] as const) {
  75  |   test(`student and teacher interface at ${name} size`, async ({page,browser}) => {
  76  |     test.setTimeout(120000);
  77  |     await page.setViewportSize({width,height});
  78  |     await bookmark(page,2,0);
  79  |     await noHorizontalLoss(page);
  80  |     await page.screenshot({path:`${PROOF}/student-${name}.png`,fullPage:true});
  81  |     expect(await page.getByRole('button',{name:/Escuchar instrucciones/}).count()).toBe(0);
  82  |     const teacherContext = await browser.newContext({viewport:{width,height}});
  83  |     const teacher = await teacherContext.newPage();
  84  |     await teacher.goto('/cartilla/teacher/guia/7');
  85  |     await expect(teacher.locator('.guide-html-content')).toBeVisible();
  86  |     await noHorizontalLoss(teacher);
  87  |     await teacher.getByRole('button',{name:'Procedimiento',exact:true}).click();
  88  |     await expect(teacher.locator('#procedimiento')).toBeVisible();
  89  |     await expect(teacher.locator('#objetivos')).toBeHidden();
  90  |     await teacher.screenshot({path:`${PROOF}/guide-${name}.png`,fullPage:true});
  91  |     await teacher.emulateMedia({media:'print'});
  92  |     await expect(teacher.locator('#objetivos')).toBeVisible();
  93  |     await expect(teacher.locator('#procedimiento')).toBeVisible();
  94  |     if (name === 'laptop') await teacher.pdf({path:`${PROOF}/guide-lesson-7.pdf`,preferCSSPageSize:true,printBackground:true});
  95  |     await teacher.emulateMedia({media:'screen'});
  96  |     await expect(teacher.locator('#objetivos')).toBeHidden();
  97  |     await teacher.goto('/cartilla/teacher/progreso');
  98  |     await expect(teacher.locator('table tbody tr')).toHaveCount(3);
  99  |     await noHorizontalLoss(teacher);
  100 |     await teacher.screenshot({path:`${PROOF}/progress-${name}.png`,fullPage:true});
  101 |     await teacher.goto('/cartilla/teacher/reportes');
  102 |     await expect(teacher.getByRole('button',{name:'Exportar CSV'})).toBeEnabled();
  103 |     await noHorizontalLoss(teacher);
  104 |     const download = teacher.waitForEvent('download');
  105 |     await teacher.getByRole('button',{name:'Exportar CSV'}).click();
  106 |     expect((await download).suggestedFilename()).toMatch(/reporte_clase.*csv/);
  107 |     await teacher.locator('select').nth(1).selectOption({index:1});
  108 |     await expect(teacher.getByRole('button',{name:'Imprimir',exact:true})).toBeEnabled();
```