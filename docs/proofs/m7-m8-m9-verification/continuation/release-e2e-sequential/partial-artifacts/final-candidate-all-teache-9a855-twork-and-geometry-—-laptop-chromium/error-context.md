# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: final-candidate.spec.ts >> all teacher plates, final artwork and geometry — laptop
- Location: tests\e2e\final-candidate.spec.ts:135:4

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
  48  |         // being drawn are ignored, so give each one time and retry.
  49  |         for (let attempt = 0; attempt < 5 && await choice.getAttribute('aria-pressed') !== 'true'; attempt++) {
  50  |           await choice.focus();
  51  |           await page.keyboard.press('Enter');
  52  |           await page.waitForTimeout(700);
  53  |         }
  54  |         await expect(choice).toHaveAttribute('aria-pressed', 'true');
  55  |       }
  56  |     }
  57  |     // Pencil-line matching: tap the vowel card, then the picture it belongs to.
  58  |     const pencil = area.locator('.am-direct-pencil');
  59  |     if (await pencil.count()) {
  60  |       const links: Array<{ left: string | null; target: string }> = region.vowelPairs
  61  |         ? region.vowelPairs.filter((pair: any) => pair.correct !== false).map((pair: any) => ({ left: `Vocal ${pair.letter}`, target: pair.caption }))
  62  |         : (region.cells ?? []).filter((cell: any) => cell.correct === true).map((cell: any) => ({ left: null, target: cell.caption }));
  63  |       for (const link of links) {
  64  |         const left = link.left
  65  |           ? pencil.locator(`.am-direct-pencil__left-card[aria-label="${link.left}"]`).first()
  66  |           : pencil.locator('.am-direct-pencil__center').first();
  67  |         const target = pencil.locator(`.am-direct-pencil__target[aria-label="${link.target}"]`).first();
  68  |         // The printed example line (e.g. Oo→ola) is already drawn.
  69  |         if (((await target.getAttribute('class')) ?? '').includes('is-connected')) continue;
  70  |         if (await left.isEnabled()) await left.click();
  71  |         await target.click();
  72  |         await page.waitForTimeout(150);
  73  |       }
  74  |       await expect(pencil).toHaveAttribute('data-complete', 'true', { timeout: 10000 });
  75  |     }
  76  |     const lasso = area.locator('.am-lasso');
  77  |     if (await lasso.count()) {
  78  |       const targets = lasso.locator('button.am-lasso__target[data-gretel-correct="true"]');
  79  |       const count = await targets.count();
  80  |       for (let i = 0; i < count; i++) {
  81  |         if ((await targets.nth(i).getAttribute("class"))?.includes("is-caught")) continue;
  82  |         await expect(targets.nth(i)).toBeEnabled({ timeout: 15000 });
  83  |         await targets.nth(i).click();
  84  |         await page.waitForTimeout(500);
  85  |       }
  86  |     }
  87  |     // Circle the picture that starts with each row's vowel (graded on tap).
  88  |     const picks = area.locator('.fp-ix-pick__row');
  89  |     for (let i = 0; i < await picks.count(); i++) {
  90  |       const row = picks.nth(i);
  91  |       const answer = region.vowelRows?.[i]?.cells?.find((cell: any) => cell.correct === true)?.caption;
  92  |       if (!answer) continue;
  93  |       const cell = row.getByRole('button', { name: answer, exact: true }).first();
  94  |       if (!((await cell.getAttribute('class')) ?? '').includes('graded-correct')) await cell.click();
  95  |       await expect(cell).toHaveClass(/graded-correct/, { timeout: 10000 });
  96  |     }
  97  |     const grid = area.locator('.fp-ix-grid');
  98  |     if (await grid.count()) {
  99  |       // Every right picture is graded on tap; there is no Comprobar step.
  100 |       const choices = grid.locator('.fp-ix-cell[data-gretel-correct="true"]');
  101 |       for (let i = 0; i < await choices.count(); i++) {
  102 |         const cell = choices.nth(i);
  103 |         if (!((await cell.getAttribute('class')) ?? '').includes('graded-correct')) await cell.click();
  104 |         await expect(cell).toHaveClass(/graded-correct/, { timeout: 15000 });
  105 |       }
  106 |     }
  107 |     const fill = area.locator('.fp-ix-fill');
  108 |     if (await fill.count()) {
  109 |       // Pick each blank's right syllable from the printed answer key; graded on tap.
  110 |       const items = fill.locator('.fp-ix-fill__item');
  111 |       for (let i = 0; i < await items.count(); i++) {
  112 |         const answer = region.fillItems?.[i]?.choices?.find((choice: any) => choice.correct === true)?.text;
  113 |         if (!answer) continue;
  114 |         const choice = items.nth(i).getByRole('button', { name: answer, exact: true }).first();
  115 |         if (!((await choice.getAttribute('class')) ?? '').includes('graded-correct')) await choice.click();
  116 |         await expect(choice).toHaveClass(/graded-correct/, { timeout: 10000 });
  117 |       }
  118 |     }
  119 |     const writing = area.locator('textarea');
  120 |     if (await writing.count()) {
  121 |       await writing.fill('Escribí una oración con las palabras de esta página.');
  122 |       // Writing is finished only when the learner confirms with Listo.
  123 |       const done = area.getByRole('button', { name: 'Listo', exact: true });
  124 |       if (await done.count()) await done.click();
  125 |     }
  126 |   }
  127 |   const reading = reader.getByRole('button', { name: 'Ya leí esta página' });
  128 |   if (await reading.count()) await reading.click();
  129 | }
  130 | 
  131 | for (const viewport of [
  132 |   { name: 'projector', width: 1280, height: 720 },
  133 |   { name: 'laptop', width: 1440, height: 900 },
  134 |   { name: 'tablet', width: 820, height: 1180 },
  135 | ]) test(`all teacher plates, final artwork and geometry — ${viewport.name}`, async ({ page }) => {
  136 |   test.setTimeout(600_000);
  137 |   fs.mkdirSync(output, { recursive: true });
  138 |   problems.length = 0;
  139 |   await page.setViewportSize(viewport);
  140 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  141 |   const errors: string[] = [];
  142 |   page.on('pageerror', error => errors.push(error.message));
  143 |   for (let lesson = 1; lesson <= 24; lesson++) {
  144 |     await page.goto(`/cartilla/presentar/${lesson}`, { waitUntil: 'domcontentloaded' });
  145 |     const pages = plates.filter((p: any) => p.lesson === lesson);
  146 |     for (let i = 0; i < pages.length; i++) {
  147 |       const stage = page.getByTestId('flipchart-stage');
> 148 |       await expect(stage.locator('[data-native-flipchart="true"]')).toBeVisible();
      |                                                                     ^ Error: expect(locator).toBeVisible() failed
  149 |       await expect(stage.locator('.fc-native-board__pagenum')).toHaveText(String(pages[i].flipchartPage));
  150 |       await expect.poll(() => stage.locator('img').evaluateAll(images => images.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
  151 |       for (const asset of finalAssets[String(pages[i].flipchartPage)] ?? []) {
  152 |         await expect(stage.locator(`img[src="${asset.src}"]`)).toHaveCount(1);
  153 |       }
  154 |       const overflow = await stage.evaluate(root => {
  155 |         const bounds = root.getBoundingClientRect();
  156 |         return [...root.querySelectorAll<HTMLElement>('figcaption, .fc-vowel-header__title, .fc-vowel-header__verse, .fc-story-panel__verse, .fc-syllable-row__item, .fc-word-columns__list li, .fc-crescent__syllable, .fc-reading-panel__verse, .fc-story-fullwidth__para, .fc-reading-bar__line, .fc-native-board__word')]
  157 |           .filter(el => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && (b.top < bounds.top - 2 || b.bottom > bounds.bottom + 2 || b.left < bounds.left - 2 || b.right > bounds.right + 2); })
  158 |           .map(el => el.textContent);
  159 |       });
  160 |       if (overflow.length) problems.push({ viewport: viewport.name, page: pages[i].flipchartPage, overflow });
  161 |       await stage.screenshot({ path: path.join(output, `${viewport.name}-flipchart-${String(pages[i].flipchartPage).padStart(3, '0')}.png`) });
  162 |       if (i < pages.length - 1) await page.getByRole('button', { name: 'Lámina siguiente', exact: true }).click();
  163 |     }
  164 |   }
  165 |   fs.writeFileSync(path.join(output, `${viewport.name}-geometry.json`), JSON.stringify(problems, null, 2));
  166 |   expect(errors).toEqual([]);
  167 |   expect(problems).toEqual([]);
  168 | });
  169 | 
  170 | async function walkLessons(page: Page, from: number, to: number) {
  171 |   fs.mkdirSync(output, { recursive: true });
  172 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  173 |   const checked: number[] = [];
  174 |   for (let lesson = from; lesson <= to; lesson++) {
  175 |     await page.goto(`/cartilla/leccion/${lesson}`, { waitUntil: 'domcontentloaded' });
  176 |     const start = page.getByRole('button', { name: 'Comenzar', exact: true });
  177 |     if (await start.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false)) {
  178 |       await start.click();
  179 |       await expect(start).toBeHidden();
  180 |     }
  181 |     const reader = page.locator('.native-lesson-viewer');
  182 |     await expect(reader).toBeVisible();
  183 |     const first = Number(await reader.getAttribute('data-native-page'));
  184 |     // Lessons follow each other in the book with no missing page.
  185 |     if (checked.length) expect(first).toBe(checked[checked.length - 1] + 1);
  186 |     const count = Number((await reader.locator('.native-lesson-viewer__page').innerText()).match(/de (\d+)/)?.[1]);
  187 |     for (let i = 0; i < count; i++) {
  188 |       const number = first + i;
  189 |       await expect(reader).toHaveAttribute('data-native-page', String(number));
  190 |       const next = reader.locator('.native-lesson-viewer__navigation button').last();
  191 |       const activityTypes = ['writing-line', 'picture-grid', 'vowel-line-match', 'vowel-pick-one', 'vowel-match-all', 'syllable-match', 'fill-in-blank', 'writing-response', 'draw-box', 'paint-box'];
  192 |       const hasActivity = layouts[String(number)].regions.some((region: any) => activityTypes.includes(region.regionType));
  193 |       await expect(reader).toHaveAttribute('data-page-complete', hasActivity ? 'false' : 'true');
  194 |       if (hasActivity) await expect(next).toHaveAttribute('data-locked', 'true');
  195 |       expect(await reader.locator("img[src*='/art/source/workbook/'], canvas[data-pdf-page]").count()).toBe(0);
  196 |       for (const img of await reader.locator('img').all()) {
  197 |         await img.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  198 |         await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
  199 |       }
  200 |       await reader.screenshot({ path: path.join(output, `workbook-${String(number).padStart(3, '0')}.png`) });
  201 |       await complete(page, number);
  202 |       console.log("Workbook completed attempt", number, await reader.getAttribute("data-page-complete"));
  203 |       await expect(reader).toHaveAttribute('data-page-complete', 'true');
  204 |       await expect(next).toBeEnabled();
  205 |       if ([3, 23, 47, 86, 90].includes(number)) await reader.screenshot({ path: path.join(output, `workbook-completed-${String(number).padStart(3, '0')}.png`) });
  206 |       checked.push(number);
  207 |       if (i < count - 1) {
  208 |         await next.click();
  209 |         await expect(reader).toHaveAttribute('data-native-page', String(number + 1), { timeout: 8000 });
  210 |       }
  211 |     }
  212 |   }
  213 |   return checked;
  214 | }
  215 | 
  216 | // The 90-page walk is split in two halves so each fits a browser-test time limit
  217 | // and both can run side by side. The first half also proves that Lesson 13
  218 | // opens on the page right after its last page, so together they cover every page.
  219 | test('workbook lessons 1-12, page activities and Next gate', async ({ page }) => {
  220 |   test.setTimeout(1_800_000);
  221 |   const checked = await walkLessons(page, 1, 12);
  222 |   expect(checked[0]).toBe(1);
  223 |   await page.goto('/cartilla/leccion/13', { waitUntil: 'domcontentloaded' });
  224 |   const start = page.getByRole('button', { name: 'Comenzar', exact: true });
  225 |   if (await start.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false)) await start.click();
  226 |   await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page', String(checked[checked.length - 1] + 1));
  227 | });
  228 | 
  229 | test('workbook lessons 13-24, page activities and Next gate', async ({ page }) => {
  230 |   test.setTimeout(1_800_000);
  231 |   const checked = await walkLessons(page, 13, 24);
  232 |   expect(checked[checked.length - 1]).toBe(90);
  233 |   fs.writeFileSync(path.join(output, 'workbook-activities.json'), JSON.stringify({ pagesExercisedFrom: checked[0], pagesExercisedTo: 90, sourceVerificationPending: [86, 87] }, null, 2));
  234 |   await page.goto('/cartilla/lecciones', { waitUntil: 'domcontentloaded' });
  235 |   const master = page.locator('img[src="/cartilla/images/gretel/gretel-approved-master.png"]');
  236 |   await expect(master).toBeVisible();
  237 |   await expect.poll(() => master.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
  238 |   await master.locator('..').screenshot({ path: path.join(output, 'gretel-approved-master.png') });
  239 | });
  240 | 
  241 | test('single welcome entry and approved still at every presentation size', async ({ page }) => {
  242 |   for (const viewport of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }, { width: 820, height: 1180 }]) {
  243 |     await page.setViewportSize(viewport);
  244 |     await page.emulateMedia({ reducedMotion: 'reduce' });
  245 |     await page.goto('/cartilla/', { waitUntil: 'domcontentloaded' });
  246 |     const start = page.getByRole('link', { name: 'Comenzar', exact: true });
  247 |     await expect(start).toBeVisible();
  248 |     const startBounds = await start.boundingBox();
```