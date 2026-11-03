# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: final-candidate.spec.ts >> all teacher plates, final artwork and geometry — tablet
- Location: tests\e2e\final-candidate.spec.ts:155:4

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('flipchart-stage').locator('[data-native-flipchart="true"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('flipchart-stage').locator('[data-native-flipchart="true"]') with timeout 5000ms
  - waiting for getByTestId('flipchart-stage').locator('[data-native-flipchart="true"]')

```

# Test source

```ts
  68  |         // being drawn are ignored, so give each one time and retry.
  69  |         for (let attempt = 0; attempt < 5 && await choice.getAttribute('aria-pressed') !== 'true'; attempt++) {
  70  |           await choice.focus();
  71  |           await page.keyboard.press('Enter');
  72  |           await page.waitForTimeout(700);
  73  |         }
  74  |         await expect(choice).toHaveAttribute('aria-pressed', 'true');
  75  |       }
  76  |     }
  77  |     // Pencil-line matching: tap the vowel card, then the picture it belongs to.
  78  |     const pencil = area.locator('.am-direct-pencil');
  79  |     if (await pencil.count()) {
  80  |       const links: Array<{ left: string | null; target: string }> = region.vowelPairs
  81  |         ? region.vowelPairs.filter((pair: any) => pair.correct !== false).map((pair: any) => ({ left: `Vocal ${pair.letter}`, target: pair.caption }))
  82  |         : (region.cells ?? []).filter((cell: any) => cell.correct === true).map((cell: any) => ({ left: null, target: cell.caption }));
  83  |       for (const link of links) {
  84  |         const left = link.left
  85  |           ? pencil.locator(`.am-direct-pencil__left-card[aria-label="${link.left}"]`).first()
  86  |           : pencil.locator('.am-direct-pencil__center').first();
  87  |         const target = pencil.locator(`.am-direct-pencil__target[aria-label="${link.target}"]`).first();
  88  |         // The printed example line (e.g. Oo→ola) is already drawn.
  89  |         if (((await target.getAttribute('class')) ?? '').includes('is-connected')) continue;
  90  |         if (await left.isEnabled()) await left.click();
  91  |         await target.click();
  92  |         await page.waitForTimeout(150);
  93  |       }
  94  |       await expect(pencil).toHaveAttribute('data-complete', 'true', { timeout: 10000 });
  95  |     }
  96  |     const lasso = area.locator('.am-lasso');
  97  |     if (await lasso.count()) {
  98  |       const targets = lasso.locator('button.am-lasso__target[data-gretel-correct="true"]');
  99  |       const count = await targets.count();
  100 |       for (let i = 0; i < count; i++) {
  101 |         if ((await targets.nth(i).getAttribute("class"))?.includes("is-caught")) continue;
  102 |         await expect(targets.nth(i)).toBeEnabled({ timeout: 15000 });
  103 |         await targets.nth(i).click();
  104 |         await page.waitForTimeout(500);
  105 |       }
  106 |     }
  107 |     // Circle the picture that starts with each row's vowel (graded on tap).
  108 |     const picks = area.locator('.fp-ix-pick__row');
  109 |     for (let i = 0; i < await picks.count(); i++) {
  110 |       const row = picks.nth(i);
  111 |       const answer = region.vowelRows?.[i]?.cells?.find((cell: any) => cell.correct === true)?.caption;
  112 |       if (!answer) continue;
  113 |       const cell = row.getByRole('button', { name: answer, exact: true }).first();
  114 |       if (!((await cell.getAttribute('class')) ?? '').includes('graded-correct')) await cell.click();
  115 |       await expect(cell).toHaveClass(/graded-correct/, { timeout: 10000 });
  116 |     }
  117 |     const grid = area.locator('.fp-ix-grid');
  118 |     if (await grid.count()) {
  119 |       // Every right picture is graded on tap; there is no Comprobar step.
  120 |       const choices = grid.locator('.fp-ix-cell[data-gretel-correct="true"]');
  121 |       for (let i = 0; i < await choices.count(); i++) {
  122 |         const cell = choices.nth(i);
  123 |         if (!((await cell.getAttribute('class')) ?? '').includes('graded-correct')) await cell.click();
  124 |         await expect(cell).toHaveClass(/graded-correct/, { timeout: 15000 });
  125 |       }
  126 |     }
  127 |     const fill = area.locator('.fp-ix-fill');
  128 |     if (await fill.count()) {
  129 |       // Pick each blank's right syllable from the printed answer key; graded on tap.
  130 |       const items = fill.locator('.fp-ix-fill__item');
  131 |       for (let i = 0; i < await items.count(); i++) {
  132 |         const answer = region.fillItems?.[i]?.choices?.find((choice: any) => choice.correct === true)?.text;
  133 |         if (!answer) continue;
  134 |         const choice = items.nth(i).getByRole('button', { name: answer, exact: true }).first();
  135 |         if (!((await choice.getAttribute('class')) ?? '').includes('graded-correct')) await choice.click();
  136 |         await expect(choice).toHaveClass(/graded-correct/, { timeout: 10000 });
  137 |       }
  138 |     }
  139 |     const writing = area.locator('textarea');
  140 |     if (await writing.count()) {
  141 |       await writing.fill('Escribí una oración con las palabras de esta página.');
  142 |       // Writing is finished only when the learner confirms with Listo.
  143 |       const done = area.getByRole('button', { name: 'Listo', exact: true });
  144 |       if (await done.count()) await done.click();
  145 |     }
  146 |   }
  147 |   const reading = reader.getByRole('button', { name: 'Ya leí esta página' });
  148 |   if (await reading.count()) await reading.click();
  149 | }
  150 | 
  151 | for (const viewport of [
  152 |   { name: 'projector', width: 1280, height: 720 },
  153 |   { name: 'laptop', width: 1440, height: 900 },
  154 |   { name: 'tablet', width: 820, height: 1180 },
  155 | ]) test(`all teacher plates, final artwork and geometry — ${viewport.name}`, async ({ page }) => {
  156 |   test.setTimeout(600_000);
  157 |   fs.mkdirSync(output, { recursive: true });
  158 |   problems.length = 0;
  159 |   await page.setViewportSize(viewport);
  160 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  161 |   const errors: string[] = [];
  162 |   page.on('pageerror', error => errors.push(error.message));
  163 |   for (let lesson = 1; lesson <= 24; lesson++) {
  164 |     await page.goto(`/cartilla/presentar/${lesson}`, { waitUntil: 'domcontentloaded' });
  165 |     const pages = plates.filter((p: any) => p.lesson === lesson);
  166 |     for (let i = 0; i < pages.length; i++) {
  167 |       const stage = page.getByTestId('flipchart-stage');
> 168 |       await expect(stage.locator('[data-native-flipchart="true"]')).toBeVisible();
      |                                                                     ^ Error: expect(locator).toBeVisible() failed
  169 |       await expect(stage.locator('.fc-native-board__pagenum')).toHaveText(String(pages[i].flipchartPage));
  170 |       await expect.poll(() => stage.locator('img').evaluateAll(images => images.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
  171 |       for (const asset of finalAssets[String(pages[i].flipchartPage)] ?? []) {
  172 |         await expect(stage.locator(`img[src="${asset.src}"]`)).toHaveCount(1);
  173 |       }
  174 |       const overflow = await stage.evaluate(root => {
  175 |         const bounds = root.getBoundingClientRect();
  176 |         return [...root.querySelectorAll<HTMLElement>('figcaption, .fc-vowel-header__title, .fc-vowel-header__verse, .fc-story-panel__verse, .fc-syllable-row__item, .fc-word-columns__list li, .fc-crescent__syllable, .fc-reading-panel__verse, .fc-story-fullwidth__para, .fc-reading-bar__line, .fc-native-board__word')]
  177 |           .filter(el => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && (b.top < bounds.top - 2 || b.bottom > bounds.bottom + 2 || b.left < bounds.left - 2 || b.right > bounds.right + 2); })
  178 |           .map(el => el.textContent);
  179 |       });
  180 |       if (overflow.length) problems.push({ viewport: viewport.name, page: pages[i].flipchartPage, overflow });
  181 |       await stage.screenshot({ path: path.join(output, `${viewport.name}-flipchart-${String(pages[i].flipchartPage).padStart(3, '0')}.png`) });
  182 |       if (i < pages.length - 1) await page.getByRole('button', { name: 'Lámina siguiente', exact: true }).click();
  183 |     }
  184 |   }
  185 |   fs.writeFileSync(path.join(output, `${viewport.name}-geometry.json`), JSON.stringify(problems, null, 2));
  186 |   expect(errors).toEqual([]);
  187 |   expect(problems).toEqual([]);
  188 | });
  189 | 
  190 | async function walkLessons(page: Page, from: number, to: number) {
  191 |   fs.mkdirSync(output, { recursive: true });
  192 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  193 |   const checked: number[] = [];
  194 |   for (let lesson = from; lesson <= to; lesson++) {
  195 |     await page.goto(`/cartilla/leccion/${lesson}`, { waitUntil: 'domcontentloaded' });
  196 |     const start = page.getByRole('button', { name: 'Comenzar', exact: true });
  197 |     if (await start.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false)) {
  198 |       await start.click();
  199 |       await expect(start).toBeHidden();
  200 |     }
  201 |     const reader = page.locator('.native-lesson-viewer');
  202 |     await expect(reader).toBeVisible();
  203 |     const first = Number(await reader.getAttribute('data-native-page'));
  204 |     // Lessons follow each other in the book with no missing page.
  205 |     if (checked.length) expect(first).toBe(checked[checked.length - 1] + 1);
  206 |     const count = Number((await reader.locator('.native-lesson-viewer__page').innerText()).match(/de (\d+)/)?.[1]);
  207 |     for (let i = 0; i < count; i++) {
  208 |       const number = first + i;
  209 |       await expect(reader).toHaveAttribute('data-native-page', String(number));
  210 |       const next = reader.locator('.native-lesson-viewer__navigation button').last();
  211 |       const activityTypes = ['writing-line', 'picture-grid', 'vowel-line-match', 'vowel-pick-one', 'vowel-match-all', 'syllable-match', 'fill-in-blank', 'writing-response', 'draw-box', 'paint-box'];
  212 |       const hasActivity = layouts[String(number)].regions.some((region: any) => activityTypes.includes(region.regionType));
  213 |       await expect(reader).toHaveAttribute('data-page-complete', hasActivity ? 'false' : 'true');
  214 |       if (hasActivity) await expect(next).toHaveAttribute('data-locked', 'true');
  215 |       expect(await reader.locator("img[src*='/art/source/workbook/'], canvas[data-pdf-page]").count()).toBe(0);
  216 |       for (const img of await reader.locator('img').all()) {
  217 |         await img.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  218 |         await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
  219 |       }
  220 |       await reader.screenshot({ path: path.join(output, `workbook-${String(number).padStart(3, '0')}.png`) });
  221 |       await complete(page, number);
  222 |       console.log("Workbook completed attempt", number, await reader.getAttribute("data-page-complete"));
  223 |       await expect(reader).toHaveAttribute('data-page-complete', 'true');
  224 |       await expect(next).toBeEnabled();
  225 |       if ([3, 23, 47, 86, 90].includes(number)) await reader.screenshot({ path: path.join(output, `workbook-completed-${String(number).padStart(3, '0')}.png`) });
  226 |       checked.push(number);
  227 |       if (i < count - 1) {
  228 |         await next.click();
  229 |         await expect(reader).toHaveAttribute('data-native-page', String(number + 1), { timeout: 8000 });
  230 |       }
  231 |     }
  232 |   }
  233 |   return checked;
  234 | }
  235 | 
  236 | // The 90-page walk is split in two halves so each fits a browser-test time limit
  237 | // and both can run side by side. The first half also proves that Lesson 13
  238 | // opens on the page right after its last page, so together they cover every page.
  239 | test('workbook lessons 1-12, page activities and Next gate', async ({ page }) => {
  240 |   test.setTimeout(1_800_000);
  241 |   const checked = await walkLessons(page, 1, 12);
  242 |   expect(checked[0]).toBe(1);
  243 |   await page.goto('/cartilla/leccion/13', { waitUntil: 'domcontentloaded' });
  244 |   const start = page.getByRole('button', { name: 'Comenzar', exact: true });
  245 |   if (await start.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false)) await start.click();
  246 |   await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page', String(checked[checked.length - 1] + 1));
  247 | });
  248 | 
  249 | test('workbook lessons 13-24, page activities and Next gate', async ({ page }) => {
  250 |   test.setTimeout(1_800_000);
  251 |   const checked = await walkLessons(page, 13, 24);
  252 |   expect(checked[checked.length - 1]).toBe(90);
  253 |   fs.writeFileSync(path.join(output, 'workbook-activities.json'), JSON.stringify({ pagesExercisedFrom: checked[0], pagesExercisedTo: 90, sourceVerificationPending: [86, 87] }, null, 2));
  254 |   await page.goto('/cartilla/lecciones', { waitUntil: 'domcontentloaded' });
  255 |   const master = page.locator('img[src="/cartilla/images/gretel/gretel-approved-master.png"]');
  256 |   await expect(master).toBeVisible();
  257 |   await expect.poll(() => master.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
  258 |   await master.locator('..').screenshot({ path: path.join(output, 'gretel-approved-master.png') });
  259 | });
  260 | 
  261 | test('single welcome entry and approved still at every presentation size', async ({ page }) => {
  262 |   for (const viewport of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }, { width: 820, height: 1180 }]) {
  263 |     await page.setViewportSize(viewport);
  264 |     await page.emulateMedia({ reducedMotion: 'reduce' });
  265 |     await page.goto('/cartilla/', { waitUntil: 'domcontentloaded' });
  266 |     const start = page.getByRole('link', { name: 'Comenzar', exact: true });
  267 |     await expect(start).toBeVisible();
  268 |     const startBounds = await start.boundingBox();
```