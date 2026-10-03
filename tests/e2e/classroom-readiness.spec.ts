import { test, expect, type Page } from '@playwright/test';

const PROOF = 'docs/proofs/classroom-readiness';
async function bookmark(page: Page, lesson: number, index: number) {
  await page.goto('/cartilla/lecciones');
  await page.evaluate(({ lesson, index }) => localStorage.setItem(`cartilla.learner-resume.v1:${lesson}`, JSON.stringify({lesson, page:index})), {lesson,index});
  await page.goto(`/cartilla/leccion/${lesson}`);
  await expect(page.locator('.native-lesson-viewer')).toBeVisible();
}
async function draw(page: Page, selector: string) {
  const canvas = page.locator(selector).first();
  await page.waitForFunction(() => [...document.images].every(image => image.complete));
  await page.evaluate(() => document.fonts.ready);
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width * .2, box.y + box.height * .3);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .7, box.y + box.height * .65, {steps:20});
  await page.mouse.up();
  return canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL());
}
async function noHorizontalLoss(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  const clipped = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('button, input, textarea, select')].filter(el => {
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height || getComputedStyle(el).visibility === 'hidden') return false;
    // Native horizontally scrollable navigation is intentionally reachable by scrolling.
    let parent = el.parentElement;
    while (parent) { if (['auto', 'scroll'].includes(getComputedStyle(parent).overflowX)) return false; parent = parent.parentElement; }
    return rect.left < -1 || rect.right > innerWidth + 1;
  }).map(el => el.getAttribute('aria-label') || el.textContent));
  expect(clipped).toEqual([]);
}

test('partial handwriting, freehand work and typed sentences survive leaving, reloading and resizing', async ({page}) => {
  await bookmark(page,2,2);
  const trace = page.locator('.fp-trace').first();
  await trace.getByRole('button',{name:/Punto 1.*toca aquí/i}).click();
  const partial = await trace.locator('svg').innerHTML();
  await draw(page,'.fp-writing-line--freehand canvas');
  const freehand = await page.locator('.fp-writing-line--freehand canvas').first().evaluate((el:HTMLCanvasElement)=>el.toDataURL());
  await page.getByRole('link',{name:'Mis lecciones',exact:true}).click();
  await page.getByRole('link',{name:'Continuar lección 2',exact:true}).click();
  await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page','6');
  await expect(trace.locator('svg')).toHaveJSProperty('innerHTML',partial);
  await expect.poll(()=>page.locator('.fp-writing-line--freehand canvas').first().evaluate((el:HTMLCanvasElement)=>el.toDataURL())).toBe(freehand);
  // Real drawing task switches to its authored freehand mode.
  const drawing = page.locator('.am-dibuja[data-verb="Dibuja"]');
  const mode = drawing.getByRole('button',{name:'Dibujar',exact:true});
  if(await mode.count()) await mode.click();
  const drawingUrl = await draw(page,'.am-dibuja[data-verb="Dibuja"] canvas');
  await page.reload();
  await expect.poll(()=>drawing.locator('canvas').evaluate((el:HTMLCanvasElement)=>el.toDataURL())).toBe(drawingUrl);
  await drawing.getByRole('button',{name:'Listo',exact:true}).click();
  await expect(drawing).toHaveClass(/is-done/);
  await page.setViewportSize({width:768,height:1024});
  expect(await drawing.locator('canvas').evaluate((el:HTMLCanvasElement)=>el.getContext('2d')!.getImageData(0,0,el.width,el.height).data.some((value,index)=> index%4===3 && value>0))).toBe(true);
  await page.screenshot({path:`${PROOF}/student-writing-tablet.png`,fullPage:true});
  await bookmark(page,24,3);
  for (const [index, answer] of ['za','ze','zu','zo','zu','Zi'].entries()) {
    await page.locator('.fp-ix-fill__item').nth(index).getByRole('button',{name:answer,exact:true}).click();
  }
  await page.getByRole('textbox',{name:'Escribe tus oraciones'}).fill('Yo escribo mis propias oraciones.');
  await page.reload();
  await expect(page.getByRole('textbox')).toHaveValue('Yo escribo mis propias oraciones.');
  await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-page-complete','true');
  await page.screenshot({path:`${PROOF}/student-writing-resumed.png`,fullPage:true});
});

for(const [name,width,height] of [['laptop',1366,768],['tablet',768,1024],['phone',390,844],['projector',1920,1080]] as const) {
  test(`student and teacher interface at ${name} size`, async ({page,browser}) => {
    test.setTimeout(120000);
    await page.setViewportSize({width,height});
    await bookmark(page,2,0);
    await noHorizontalLoss(page);
    await page.screenshot({path:`${PROOF}/student-${name}.png`,fullPage:true});
    expect(await page.getByRole('button',{name:/Escuchar instrucciones/}).count()).toBe(0);
    const teacherContext = await browser.newContext({viewport:{width,height}});
    const teacher = await teacherContext.newPage();
    await teacher.goto('/cartilla/teacher/guia/7');
    await expect(teacher.locator('.guide-html-content')).toBeVisible();
    await noHorizontalLoss(teacher);
    await teacher.getByRole('button',{name:'Procedimiento',exact:true}).click();
    await expect(teacher.locator('#procedimiento')).toBeVisible();
    await expect(teacher.locator('#objetivos')).toBeHidden();
    await teacher.screenshot({path:`${PROOF}/guide-${name}.png`,fullPage:true});
    await teacher.emulateMedia({media:'print'});
    await expect(teacher.locator('#objetivos')).toBeVisible();
    await expect(teacher.locator('#procedimiento')).toBeVisible();
    if (name === 'laptop') await teacher.pdf({path:`${PROOF}/guide-lesson-7.pdf`,preferCSSPageSize:true,printBackground:true});
    await teacher.emulateMedia({media:'screen'});
    await expect(teacher.locator('#objetivos')).toBeHidden();
    await teacher.goto('/cartilla/teacher/progreso');
    await expect(teacher.locator('table tbody tr')).toHaveCount(3);
    await noHorizontalLoss(teacher);
    await teacher.screenshot({path:`${PROOF}/progress-${name}.png`,fullPage:true});
    await teacher.goto('/cartilla/teacher/reportes');
    await expect(teacher.getByRole('button',{name:'Exportar CSV'})).toBeEnabled();
    await noHorizontalLoss(teacher);
    const download = teacher.waitForEvent('download');
    await teacher.getByRole('button',{name:'Exportar CSV'}).click();
    expect((await download).suggestedFilename()).toMatch(/reporte_clase.*csv/);
    await teacher.locator('select').nth(1).selectOption({index:1});
    await expect(teacher.getByRole('button',{name:'Imprimir',exact:true})).toBeEnabled();
    await teacher.screenshot({path:`${PROOF}/report-${name}.png`,fullPage:true});
    if (name === 'laptop') {
      await teacher.emulateMedia({media:'print'});
      await expect(teacher.locator('.teacher-chrome__header')).toBeHidden();
      await teacher.pdf({path:`${PROOF}/student-report.pdf`,preferCSSPageSize:true,printBackground:true});
      await teacher.emulateMedia({media:'screen'});
    }
    await teacher.goto('/cartilla/teacher/flipchart');
    await expect(teacher.getByRole('heading',{name:'Catálogo de Lecciones'})).toBeVisible();
    await noHorizontalLoss(teacher);
    await teacher.goto('/cartilla/presentar/7');
    await expect(teacher.getByTestId('flipchart-hd-panel')).toBeVisible();
    await noHorizontalLoss(teacher);
    await expect(teacher.getByRole('button',{name:'Volver al panel del docente'})).toBeVisible();
    await teacher.getByRole('button',{name:'Lámina siguiente'}).click();
    await expect(teacher.getByTestId('flipchart-counter')).toContainText('Hoja 2');
    await teacher.screenshot({path:`${PROOF}/presenter-${name}.png`,fullPage:true});
    await teacher.getByRole('button',{name:'Volver al panel del docente'}).click();
    await expect(teacher).toHaveURL(/teacher/);
    expect(await page.evaluate(()=>localStorage.getItem('cartilla.seed.auth.v1'))).toBeNull();
    await teacherContext.close();
  });
}

test('print every page of a lesson; PDF and download use complete visible content',async({page})=>{
  await page.goto('/cartilla/imprimir/2');
  await expect(page.locator('.workbook-print-sheet')).toHaveCount(3);
  await expect(page.getByRole('button',{name:'Imprimir 3 páginas'})).toBeEnabled({timeout:30000});
  await page.emulateMedia({media:'print'});
  await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
  const pdf = await page.pdf({path:`${PROOF}/workbook-lesson-2.pdf`,preferCSSPageSize:true,printBackground:true});
  expect(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)?.length).toBe(3);
  await page.emulateMedia({media:'screen'});
  await page.locator('select').selectOption('24');
  await expect(page).toHaveURL(/imprimir\/24/);
  await expect(page.locator('.workbook-print-sheet')).toHaveCount(4);
  await expect(page.getByRole('button',{name:'Imprimir 4 páginas'})).toBeEnabled({timeout:30000});
});
