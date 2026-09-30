import { test, expect, type Page, type Locator } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const plates = JSON.parse(fs.readFileSync('src/data/teacher-flipchart.json', 'utf8')).pages;
const layouts = JSON.parse(fs.readFileSync('src/data/page-layouts.json', 'utf8')).pages;
const finalAssets = JSON.parse(fs.readFileSync('src/data/flipchart-native-assets.json', 'utf8'));
const output = path.resolve('test-results/final-candidate');
const problems: unknown[] = [];

async function stroke(page: Page, canvas: Locator) {
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box!.x + box!.width * .25, box!.y + box!.height * .3);
  await page.mouse.down();
  for (let i = 1; i <= 30; i++) {
    await page.mouse.move(box!.x + box!.width * (.25 + .4 * i / 30), box!.y + box!.height * (.3 + .3 * i / 30));
    await page.waitForTimeout(12);
  }
  await page.mouse.up();
}
async function complete(page: Page, number: number) {
  const reader = page.locator('.native-lesson-viewer');
  for (const region of layouts[String(number)].regions) {
    const area = reader.locator(`[data-gretel-activity="page-${number}-${region.id}"]`);
    const traces = area.locator('.fp-trace');
    if (await traces.count()) {
      for (let i = 0; i < 100; i++) {
        const active = traces.locator('.fp-trace__dot--active');
        if (!await active.count()) break;
        await active.click();
      }
    }
    const draw = area.locator('.am-dibuja, .am-paint');
    if (await draw.count()) {
      await stroke(page, draw.locator('canvas').last());
      await draw.getByRole('button', { name: 'Listo', exact: true }).click();
    }
    const circles = area.locator('.native-syllable');
    if (await circles.count()) {
      const words = region.matchRows.flat();
      for (let i = 0; i < words.length; i++) if (words[i].correct !== false) {
        const choice = circles.locator('button').nth(i);
        if (await choice.getAttribute('aria-pressed') !== 'true') await choice.click();
      }
    }
    const lasso = area.locator('.am-lasso');
    if (await lasso.count()) {
      const targets = lasso.locator('button.am-lasso__target[data-gretel-correct="true"]');
      const count = await targets.count();
      for (let i = 0; i < count; i++) {
        if ((await targets.nth(i).getAttribute("class"))?.includes("is-caught")) continue;
        await expect(targets.nth(i)).toBeEnabled({ timeout: 15000 });
        await targets.nth(i).click();
        await page.waitForTimeout(500);
      }
    }
    const picks = area.locator('.fp-ix-pick__row');
    for (let i = 0; i < await picks.count(); i++) {
      const row = picks.nth(i);
      await row.locator('.fp-ix-pick__letter').click();
      await row.locator('.fp-ix-cell--droppable[data-gretel-correct="true"]').first().click();
    }
    const grid = area.locator('.fp-ix-grid');
    if (await grid.count()) {
      const choices = grid.locator('.fp-ix-cell[data-gretel-correct="true"]');
      for (let i = 0; i < await choices.count(); i++) await choices.nth(i).click();
      await grid.getByRole('button', { name: 'Comprobar', exact: true }).click();
    }
    const fill = area.locator('.fp-ix-fill');
    if (await fill.count()) {
      const choices = fill.locator('button[data-gretel-correct="true"]');
      for (let i = 0; i < await choices.count(); i++) await choices.nth(i).click();
      await fill.getByRole('button', { name: 'Comprobar', exact: true }).click();
    }
    const writing = area.locator('textarea');
    if (await writing.count()) await writing.fill('Escribí una oración con las palabras de esta página.');
  }
  const reading = reader.getByRole('button', { name: 'Ya leí esta página' });
  if (await reading.count()) await reading.click();
}

for (const viewport of [
  { name: 'projector', width: 1280, height: 720 },
  { name: 'laptop', width: 1440, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
]) test(`all teacher plates, final artwork and geometry — ${viewport.name}`, async ({ page }) => {
  test.setTimeout(600_000);
  fs.mkdirSync(output, { recursive: true });
  problems.length = 0;
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (let lesson = 1; lesson <= 24; lesson++) {
    await page.goto(`/cartilla/presentar/${lesson}`, { waitUntil: 'domcontentloaded' });
    const pages = plates.filter((p: any) => p.lesson === lesson);
    for (let i = 0; i < pages.length; i++) {
      const stage = page.getByTestId('flipchart-stage');
      await expect(stage.locator('[data-native-flipchart="true"]')).toBeVisible();
      await expect(stage.locator('.fc-native-board__pagenum')).toHaveText(String(pages[i].flipchartPage));
      await expect.poll(() => stage.locator('img').evaluateAll(images => images.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
      for (const asset of finalAssets[String(pages[i].flipchartPage)] ?? []) {
        await expect(stage.locator(`img[src="${asset.src}"]`)).toHaveCount(1);
      }
      const overflow = await stage.evaluate(root => {
        const bounds = root.getBoundingClientRect();
        return [...root.querySelectorAll<HTMLElement>('figcaption, .fc-vowel-header__title, .fc-vowel-header__verse, .fc-story-panel__verse, .fc-syllable-row__item, .fc-word-columns__list li, .fc-crescent__syllable, .fc-reading-panel__verse, .fc-story-fullwidth__para, .fc-reading-bar__line, .fc-native-board__word')]
          .filter(el => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && (b.top < bounds.top - 2 || b.bottom > bounds.bottom + 2 || b.left < bounds.left - 2 || b.right > bounds.right + 2); })
          .map(el => el.textContent);
      });
      if (overflow.length) problems.push({ viewport: viewport.name, page: pages[i].flipchartPage, overflow });
      await stage.screenshot({ path: path.join(output, `${viewport.name}-flipchart-${String(pages[i].flipchartPage).padStart(3, '0')}.png`) });
      if (i < pages.length - 1) await page.getByRole('button', { name: 'Lámina siguiente' }).click();
    }
  }
  fs.writeFileSync(path.join(output, `${viewport.name}-geometry.json`), JSON.stringify(problems, null, 2));
  expect(errors).toEqual([]);
  expect(problems).toEqual([]);
});

test('all 24 workbook lessons, page activities and Next gate', async ({ page }) => {
  test.setTimeout(1_200_000);
  fs.mkdirSync(output, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const checked: number[] = [];
  for (let lesson = 1; lesson <= 24; lesson++) {
    await page.goto(`/cartilla/leccion/${lesson}`, { waitUntil: 'domcontentloaded' });
    const start = page.getByRole('button', { name: 'Comenzar', exact: true });
    if (await start.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false)) {
      await start.click();
      await expect(start).toBeHidden();
    }
    const reader = page.locator('.native-lesson-viewer');
    await expect(reader).toBeVisible();
    const first = Number(await reader.getAttribute('data-native-page'));
    const count = Number((await reader.locator('.native-lesson-viewer__page').innerText()).match(/de (\d+)/)?.[1]);
    for (let i = 0; i < count; i++) {
      const number = first + i;
      await expect(reader).toHaveAttribute('data-native-page', String(number));
      const next = reader.locator('.native-lesson-viewer__navigation button').last();
      const activityTypes = ['writing-line', 'picture-grid', 'vowel-line-match', 'vowel-pick-one', 'vowel-match-all', 'syllable-match', 'fill-in-blank', 'writing-response', 'draw-box', 'paint-box'];
      const hasActivity = layouts[String(number)].regions.some((region: any) => activityTypes.includes(region.regionType));
      await expect(reader).toHaveAttribute('data-page-complete', hasActivity ? 'false' : 'true');
      if (hasActivity) await expect(next).toHaveAttribute('data-locked', 'true');
      expect(await reader.locator("img[src*='/art/source/workbook/'], canvas[data-pdf-page]").count()).toBe(0);
      for (const img of await reader.locator('img').all()) {
        await img.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
        await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
      }
      await reader.screenshot({ path: path.join(output, `workbook-${String(number).padStart(3, '0')}.png`) });
      await complete(page, number);
      console.log("Workbook completed attempt", number, await reader.getAttribute("data-page-complete"));
      await expect(reader).toHaveAttribute('data-page-complete', 'true');
      await expect(next).toBeEnabled();
      if ([3, 23, 47, 86, 90].includes(number)) await reader.screenshot({ path: path.join(output, `workbook-completed-${String(number).padStart(3, '0')}.png`) });
      checked.push(number);
      if (i < count - 1) await next.click();
    }
  }
  fs.writeFileSync(path.join(output, 'workbook-activities.json'), JSON.stringify({ pagesExercised: checked, sourceVerificationPending: [86, 87] }, null, 2));
  expect(checked).toHaveLength(90);
  await page.goto('/cartilla/lecciones', { waitUntil: 'domcontentloaded' });
  const master = page.locator('img[src="/cartilla/images/gretel/gretel-approved-master.png"]');
  await expect(master).toBeVisible();
  await expect.poll(() => master.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
  await master.locator('..').screenshot({ path: path.join(output, 'gretel-approved-master.png') });
});

test('single welcome entry and approved still at every presentation size', async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }, { width: 820, height: 1180 }]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/cartilla/', { waitUntil: 'domcontentloaded' });
    const start = page.getByRole('link', { name: 'Comenzar', exact: true });
    await expect(start).toBeVisible();
    const startBounds = await start.boundingBox();
    expect(startBounds!.y + startBounds!.height).toBeLessThanOrEqual(viewport.height);
    const still = page.locator('img[src="/cartilla/images/gretel/gretel-approved-master.png"]');
    await expect.poll(() => still.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
    expect(await page.locator('video').count()).toBe(0);
    await page.screenshot({ path: path.join(output, `welcome-${viewport.width}.png`), fullPage: true });
    await start.click();
    await expect(page).toHaveURL(/cartilla\/lecciones/);
  }
});
