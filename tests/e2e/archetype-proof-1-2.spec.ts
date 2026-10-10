import { test, expect } from "@playwright/test";
import { archetypeMappingForPage, WorkbookArchetype } from "../../src/data/workbook-archetypes";

// Representative pages for Archetype 1 (Picture grid / circle-X)
const FAMILY_1_PAGES = [1, 4, 7, 10, 13, 16];
// Representative page for Archetype 2 (Vowel/letter + row choices)
const FAMILY_2_PAGES = [2];

const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  laptop: { width: 1280, height: 800 },
};

// Map printed page to lesson number and inner page index
function getLessonLocation(printedPage: number) {
  if (printedPage === 1) return { lesson: 1, pageIndex: 0 };
  if (printedPage === 2) return { lesson: 1, pageIndex: 1 };
  if (printedPage === 4) return { lesson: 2, pageIndex: 0 };
  if (printedPage === 7) return { lesson: 3, pageIndex: 0 };
  if (printedPage === 10) return { lesson: 4, pageIndex: 0 };
  if (printedPage === 13) return { lesson: 5, pageIndex: 0 };
  if (printedPage === 16) return { lesson: 6, pageIndex: 0 };
  throw new Error(`Unexpected test page: ${printedPage}`);
}

test.describe("Workbook Archetypes 1 and 2 Proof", () => {
  for (const [device, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`Viewport: ${device} (${viewport.width}x${viewport.height})`, () => {
      // Family 1: Picture grid / circle-X
      for (const printedPage of FAMILY_1_PAGES) {
        test(`Family 1 (Picture Grid) - Printed Page ${printedPage}`, async ({ page }) => {
          await page.setViewportSize(viewport);
          const mapping = archetypeMappingForPage(printedPage);
          expect(mapping.archetypes).toContain(WorkbookArchetype.PICTURE_GRID_CIRCLE_X);

          const { lesson, pageIndex } = getLessonLocation(printedPage);

          // Seed resume state to jump directly to pageIndex
          await page.addInitScript(
            ({ l, p }) => {
              const payload = JSON.stringify({ lesson: l, page: p });
              localStorage.setItem(`cartilla.learner-resume.v1:${l}`, payload);
              localStorage.setItem("cartilla.learner-resume.v1", payload);
            },
            { l: lesson, p: pageIndex },
          );

          await page.goto(`/cartilla/leccion/${lesson}`);

          // Ensure native lesson viewer loaded
          const viewer = page.locator(".native-lesson-viewer");
          await expect(viewer).toBeVisible({ timeout: 10000 });

          // Verify clean digital canvas: scenic wallpaper must NOT be displayed on dense workbook pages
          const bgWallpaper = page.locator(".final-page-background");
          if ((await bgWallpaper.count()) > 0) {
            await expect(bgWallpaper).not.toBeVisible();
          }

          // Verify instruction hierarchy
          const instruction = page.locator(".fp-region--instruction");
          await expect(instruction).toBeVisible();

          // Verify picture grid structure (supports static and interactive grid selectors)
          const cells = page.locator(".fp-picture-grid__cell, .fp-ix-cell");
          const cellCount = await cells.count();
          expect(cellCount).toBeGreaterThan(0);

          // Verify images inside grid cells: no broken images
          const images = cells.locator("img");
          const imgCount = await images.count();
          expect(imgCount, `printed page ${printedPage} must render its source images`).toBeGreaterThan(0);
          for (let i = 0; i < imgCount; i++) {
            const img = images.nth(i);
            await expect(img).toBeVisible();
            const loaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
            expect(loaded, `Image ${i} on printed page ${printedPage} should be loaded`).toBe(true);
          }

          // Verify touch target sizes and cell containment
          for (let i = 0; i < Math.min(cellCount, 4); i++) {
            const box = await cells.nth(i).boundingBox();
            expect(box).not.toBeNull();
            if (box) {
              expect(box.width).toBeGreaterThanOrEqual(32);
              expect(box.height).toBeGreaterThanOrEqual(32);
            }
          }

          // Verify no horizontal overflow/clipping
          const overflow = await page.evaluate(() => {
            const body = document.body;
            return body.scrollWidth - body.clientWidth;
          });
          expect(overflow).toBeLessThanOrEqual(2);

          // Capture screenshot for visual proof
          await page.screenshot({
            path: `docs/proofs/archetypes-1-2/family-1-page-${printedPage}-${device}.png`,
            fullPage: true,
          });
        });
      }

      // Family 2: Vowel/letter + row choices
      for (const printedPage of FAMILY_2_PAGES) {
        test(`Family 2 (Vowel/Letter + Row Choices) - Printed Page ${printedPage}`, async ({ page }) => {
          await page.setViewportSize(viewport);
          const mapping = archetypeMappingForPage(printedPage);
          expect(mapping.archetypes).toContain(WorkbookArchetype.VOWEL_LETTER_ROW_CHOICES);

          const { lesson, pageIndex } = getLessonLocation(printedPage);

          await page.addInitScript(
            ({ l, p }) => {
              const payload = JSON.stringify({ lesson: l, page: p });
              localStorage.setItem(`cartilla.learner-resume.v1:${l}`, payload);
              localStorage.setItem("cartilla.learner-resume.v1", payload);
            },
            { l: lesson, p: pageIndex },
          );

          await page.goto(`/cartilla/leccion/${lesson}`);

          const viewer = page.locator(".native-lesson-viewer");
          await expect(viewer).toBeVisible({ timeout: 10000 });

          // Verify clean digital canvas: scenic wallpaper must NOT be displayed on dense workbook pages
          const bgWallpaper = page.locator(".final-page-background");
          if ((await bgWallpaper.count()) > 0) {
            await expect(bgWallpaper).not.toBeVisible();
          }

          // Verify instruction hierarchy
          const instruction = page.locator(".fp-region--instruction");
          await expect(instruction).toBeVisible();

          // Verify vowel pick rows and letter anchors (supports static and interactive selectors)
          const rows = page.locator(".fp-vowel-pick__row, .fp-ix-pick__row");
          const rowCount = await rows.count();
          expect(rowCount).toBeGreaterThan(0);

          const letterAnchors = page.locator(".fp-vowel-pick__letter, .fp-ix-pick__letter");
          expect(await letterAnchors.count()).toBe(rowCount);

          // Verify cell choices
          const cells = page.locator(".fp-vowel-pick__cell, .fp-ix-cell");
          const cellCount = await cells.count();
          expect(cellCount).toBeGreaterThan(0);

          // Verify images inside row choices: no broken images
          const images = cells.locator("img");
          const imgCount = await images.count();
          expect(imgCount, `printed page ${printedPage} must render its source images`).toBeGreaterThan(0);
          for (let i = 0; i < imgCount; i++) {
            const img = images.nth(i);
            await expect(img).toBeVisible();
            const loaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
            expect(loaded, `Image ${i} on printed page ${printedPage} should be loaded`).toBe(true);
          }

          // Verify touch target sizes
          for (let i = 0; i < Math.min(cellCount, 4); i++) {
            const box = await cells.nth(i).boundingBox();
            expect(box).not.toBeNull();
            if (box) {
              expect(box.width).toBeGreaterThanOrEqual(32);
              expect(box.height).toBeGreaterThanOrEqual(32);
            }
          }

          // Verify no horizontal overflow/clipping
          const overflow = await page.evaluate(() => {
            const body = document.body;
            return body.scrollWidth - body.clientWidth;
          });
          expect(overflow).toBeLessThanOrEqual(2);

          // Capture screenshot for visual proof
          await page.screenshot({
            path: `docs/proofs/archetypes-1-2/family-2-page-${printedPage}-${device}.png`,
            fullPage: true,
          });
        });
      }
    });
  }
});
