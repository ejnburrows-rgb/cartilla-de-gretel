import { test, expect, type Page, type Locator } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { completePage } from './support/complete-page';
const plates = JSON.parse(fs.readFileSync('src/data/teacher-flipchart.json', 'utf8')).pages;
const layouts = JSON.parse(fs.readFileSync('src/data/page-layouts.json', 'utf8')).pages;
const finalAssets = JSON.parse(fs.readFileSync('src/data/flipchart-native-assets.json', 'utf8'));
const output = path.resolve('test-results/final-candidate');
const problems: unknown[] = [];


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
      if (i < pages.length - 1) await page.getByRole('button', { name: 'Lámina siguiente', exact: true }).click();
    }
  }
  fs.writeFileSync(path.join(output, `${viewport.name}-geometry.json`), JSON.stringify(problems, null, 2));
  expect(errors).toEqual([]);
  expect(problems).toEqual([]);
});

async function walkLessons(page: Page, from: number, to: number) {
  fs.mkdirSync(output, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const checked: number[] = [];
  for (let lesson = from; lesson <= to; lesson++) {
    await page.goto(`/cartilla/leccion/${lesson}`, { waitUntil: 'domcontentloaded' });
    const start = page.getByRole('button', { name: 'Comenzar', exact: true });
    if (await start.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false)) {
      await start.click();
      await expect(start).toBeHidden();
    }
    const reader = page.locator('.native-lesson-viewer');
    await expect(reader).toBeVisible();
    // Canonical runtime entries include optional Piano activities and omit the
    // explicitly source-blocked 86–87 leaves; neither is a printed worksheet.
    const entries = await page.evaluate(async (lessonId) => {
      const mod = await import('/src/utils/buildPageArray.tsx');
      return mod.buildPageArray(lessonId).map(entry => entry.pageNumber ?? null);
    }, lesson);
    for (let i = 0; i < entries.length; i++) {
      const number = entries[i];
      if (number === null) {
        await expect(reader).not.toHaveAttribute('data-native-page');
        await expect(reader).toHaveAttribute('data-page-complete', 'true');
        const next = reader.locator('.native-lesson-viewer__navigation button').last();
        await expect(next).toBeEnabled();
        if (i < entries.length - 1) await next.click();
        continue;
      }
      // Preserve strict book ordering, with only the documented missing-source gap.
      if (checked.length) {
        const previous = checked[checked.length - 1];
        expect(number).toBe(previous === 85 ? 88 : previous + 1);
      }
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
      await reader.screenshot({ path: path.join(output, `workbook-${String(number).padStart(3, '0')}.png`), animations: 'disabled', timeout: 30000 });
      await completePage(page, number);
      // A completed page auto-turns after a short idle beat (approved student
      // behavior). Pause it by holding a pointer on the neutral topline while
      // verifying completion, then release and let the auto-turn itself prove
      // forward motion. If the turn already happened, completion is implied.
      if ((await reader.getAttribute('data-native-page')) === String(number)) {
        const topline = reader.locator('.native-lesson-viewer__topline');
        const tb = await topline.boundingBox();
        await page.mouse.move(tb!.x + tb!.width / 2, tb!.y + tb!.height / 2);
        await page.mouse.down();
        try {
          await expect(reader).toHaveAttribute('data-page-complete', 'true');
          await expect(next).toBeEnabled();
          if ([3, 23, 47, 86, 90].includes(number)) await reader.screenshot({ path: path.join(output, `workbook-completed-${String(number).padStart(3, '0')}.png`), animations: 'disabled', timeout: 30000 });
        } finally {
          await page.mouse.up();
        }
      }
      console.log("Workbook completed page", number);
      checked.push(number);
      if (i < entries.length - 1) {
        // Pages whose completion was already true at load never auto-turn
        // (the turn only fires on the false→true transition), so the walk
        // turns those with the real Next control itself.
        if (!hasActivity) await next.click();
        if (entries[i + 1] !== null) {
          await expect(reader).toHaveAttribute('data-native-page', String(entries[i + 1]), { timeout: 20000 });
        } else {
          await expect(reader).not.toHaveAttribute('data-native-page', { timeout: 20000 });
        }
      } else {
        // Last page of the lesson: finish through the real control.
        await expect(next).toBeEnabled({ timeout: 20000 });
        await next.click();
      }
    }
  }
  return checked;
}

// The 88 available printed pages are split in four quarters so each run fits a
// fresh browser session (long single sessions degrade sharply). The two
// missing-source leaves 86–87 are explicitly not certified; optional Piano
// entries are also checked. Quarter 2 also proves that Lesson 13 opens on the
// page right after Lesson 12's last page, so together they cover every page.
const QUARTERS: Array<{ from: number; to: number; pages: number[] }> = [
  { from: 1, to: 6, pages: Array.from({ length: 18 }, (_, i) => i + 1) },
  { from: 7, to: 12, pages: Array.from({ length: 24 }, (_, i) => i + 19) },
  { from: 13, to: 18, pages: Array.from({ length: 24 }, (_, i) => i + 43) },
  { from: 19, to: 24, pages: Array.from({ length: 24 }, (_, i) => i + 67).filter((n) => n !== 86 && n !== 87) },
];

for (const [qi, quarter] of QUARTERS.entries()) {
  test(`workbook lessons ${quarter.from}-${quarter.to}, page activities and Next gate`, async ({ page }) => {
    test.setTimeout(3_600_000);
    const checked = await walkLessons(page, quarter.from, quarter.to);
    expect(checked).toEqual(quarter.pages);
    if (qi === 1) {
      await page.goto('/cartilla/leccion/13', { waitUntil: 'domcontentloaded' });
      const start = page.getByRole('button', { name: 'Comenzar', exact: true });
      if (await start.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false)) await start.click();
      await expect(page.locator('.native-lesson-viewer')).toHaveAttribute('data-native-page', String(checked[checked.length - 1] + 1));
    }
    if (qi === 3) {
      fs.writeFileSync(path.join(output, 'workbook-activities.json'), JSON.stringify({ pagesExercisedFrom: 1, pagesExercisedTo: 90, sourceVerificationPending: [86, 87] }, null, 2));
      await page.goto('/cartilla/lecciones', { waitUntil: 'domcontentloaded' });
      const master = page.locator('img[src="/cartilla/images/gretel/gretel-approved-master.png"]');
      await expect(master).toBeVisible();
      await expect.poll(() => master.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
      await master.locator('..').screenshot({ path: path.join(output, 'gretel-approved-master.png') });
    }
  });
}

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
