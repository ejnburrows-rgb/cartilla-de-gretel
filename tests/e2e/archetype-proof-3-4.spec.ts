import { test, expect, type Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const PROOF_DIR = path.resolve(process.cwd(), "docs/proofs/archetypes-3-4");

test.beforeAll(() => {
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }
});

/** Helper to set the resume page in localStorage before navigating to a lesson. */
async function navigateToLessonPage(page: Page, lessonNumber: number, pageIndex: number) {
  await page.addInitScript(
    ({ lesson, pageIndex }) => {
      const val = JSON.stringify({ lesson, page: pageIndex });
      window.localStorage.setItem(`cartilla.learner-resume.v1:${lesson}`, val);
      window.localStorage.setItem("cartilla.learner-resume.v1", val);
    },
    { lesson: lessonNumber, pageIndex },
  );
  await page.goto(`/cartilla/leccion/${lessonNumber}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".native-lesson-viewer[data-native-page]", { timeout: 15000 });
}

/** Verify that all img elements within a root container loaded successfully without broken image sources. */
async function verifyImagesLoaded(page: Page, containerSelector: string) {
  const images = page.locator(`${containerSelector} img`);
  const count = await images.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    await expect(img).toBeVisible();
    const loaded = await img.evaluate((el: HTMLImageElement) => {
      return el.complete && el.naturalWidth > 0;
    });
    expect(loaded, `Image ${i} in ${containerSelector} should be fully loaded`).toBe(true);
  }
}

/** Check that window overflow is non-positive (no horizontal scrollbar / page clipping). */
async function checkViewportFit(page: Page) {
  const overflow = await page.evaluate(() => {
    return {
      windowWidthOverflow: document.documentElement.scrollWidth - window.innerWidth,
      bodyWidthOverflow: document.body.scrollWidth - window.innerWidth,
    };
  });
  expect(overflow.windowWidthOverflow, "Window horizontal scroll overflow").toBeLessThanOrEqual(0);
}

test.describe("Workbook Archetypes 3 & 4 Proof Suite", () => {
  test.describe("Archetype 3: Multi-pair matching / connect (Printed Page 3)", () => {
    test("Source order, labels, images, and Pencil Line presentation on Page 3", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await navigateToLessonPage(page, 1, 2); // Printed Page 3 is index 2 in Lesson 1

      // 1. Verify archetype container and title
      const pageContainer = page.locator(".faithful-page--archetype-3");
      await expect(pageContainer).toBeVisible();

      const instruction = page.locator(".fp-region--instruction");
      await expect(instruction).toContainText("Traza una línea de la vocal al dibujo que le corresponde");

      // 2. Pencil Line direct connector is active, never lasso/rope
      const directPencil = page.locator(".am-direct-pencil");
      await expect(directPencil).toBeVisible();
      const ropeLayer = page.locator(".am-lasso__rope-layer");
      await expect(ropeLayer).toHaveCount(0);

      // 3. Verify left column vowel labels in source order
      const leftCards = page.locator(".am-direct-pencil__left-card");
      await expect(leftCards).toHaveCount(5);
      const expectedVowels = ["o", "a", "i", "e", "u"];
      for (let i = 0; i < 5; i++) {
        await expect(leftCards.nth(i)).toContainText(expectedVowels[i]);
      }

      // 4. Verify right column target images and captions
      const rightTargets = page.locator(".am-direct-pencil__column--right .am-direct-pencil__target");
      await expect(rightTargets).toHaveCount(5);
      await verifyImagesLoaded(page, ".am-direct-pencil__column--right");

      // 5. Screenshot laptop view
      await page.screenshot({ path: path.join(PROOF_DIR, "page3-archetype3-laptop.png") });
    });

    test("Completion compatibility for Archetype 3 (Page 3)", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await navigateToLessonPage(page, 1, 2);

      const directPencil = page.locator(".am-direct-pencil");
      await expect(directPencil).toBeVisible();

      // Pair mappings for Page 3:
      // Left index 0 (vowel 'o') -> Right target 'ocho'
      // Left index 1 (vowel 'a') -> Right target 'araña'
      // Left index 2 (vowel 'i') -> Right target 'iglesia'
      // Left index 3 (vowel 'e') -> Right target 'escoba'
      // Left index 4 (vowel 'u') -> Right target 'uno'
      const pairs = [
        { leftText: "o", rightLabel: "ocho" },
        { leftText: "a", rightLabel: "araña" },
        { leftText: "i", rightLabel: "iglesia" },
        { leftText: "e", rightLabel: "escoba" },
        { leftText: "u", rightLabel: "uno" },
      ];

      for (const pair of pairs) {
        const leftBtn = page.locator(".am-direct-pencil__left-card", { hasText: pair.leftText });
        const rightBtn = page.locator(`.am-direct-pencil__column--right .am-direct-pencil__target[aria-label="${pair.rightLabel}"]`);

        await leftBtn.click();
        await rightBtn.click();
        await page.waitForTimeout(100);
      }

      // Verify completion state on direct pencil container and native page viewer
      await expect(directPencil).toHaveAttribute("data-complete", "true");
      const nativeViewer = page.locator(".native-lesson-viewer");
      await expect(nativeViewer).toHaveAttribute("data-page-complete", "true");

      // Screenshot completed state
      await page.screenshot({ path: path.join(PROOF_DIR, "page3-archetype3-completed.png") });
    });

    test("Device viewports fit and visual integrity for Archetype 3 (Page 3)", async ({ page }) => {
      // Laptop fit
      await page.setViewportSize({ width: 1366, height: 768 });
      await navigateToLessonPage(page, 1, 2);
      await checkViewportFit(page);

      // Tablet fit
      await page.setViewportSize({ width: 768, height: 1024 });
      await navigateToLessonPage(page, 1, 2);
      await checkViewportFit(page);
      await page.screenshot({ path: path.join(PROOF_DIR, "page3-archetype3-tablet.png") });

      // Phone fit
      await page.setViewportSize({ width: 375, height: 667 });
      await navigateToLessonPage(page, 1, 2);
      await checkViewportFit(page);
      await page.screenshot({ path: path.join(PROOF_DIR, "page3-archetype3-phone.png") });
    });
  });

  test.describe("Archetype 4: Single central target + surrounding pictures", () => {
    const ARCHETYPE_4_PAGES = [
      { pageNum: 5, lesson: 2, pageIndex: 1, letter: "Oo", exampleCaption: "ola", correctCaptions: ["oveja", "ojos", "oreja", "olla", "oso"] },
      { pageNum: 8, lesson: 3, pageIndex: 1, letter: "Aa", exampleCaption: "abeja", correctCaptions: ["alas", "aguja", "avión", "aro"] },
      { pageNum: 11, lesson: 4, pageIndex: 1, letter: "Ee", exampleCaption: "escalera", correctCaptions: ["elefante", "erizo", "estrella"] },
      { pageNum: 14, lesson: 5, pageIndex: 1, letter: "Ii", exampleCaption: "iguana", correctCaptions: ["imán", "iglú", "igual", "indio"] },
      { pageNum: 17, lesson: 6, pageIndex: 1, letter: "Uu", exampleCaption: "uña", correctCaptions: ["uniforme", "uno", "uvas", "unicornio"] },
    ];

    for (const item of ARCHETYPE_4_PAGES) {
      test(`Printed Page ${item.pageNum} (Central target ${item.letter}) rendered fidelity and fit`, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await navigateToLessonPage(page, item.lesson, item.pageIndex);

        // 1. Verify archetype container
        const pageClass = item.pageNum === 17 ? ".faithful-page--archetype4-p17" : ".faithful-page--archetype-4";
        const pageContainer = page.locator(pageClass);
        await expect(pageContainer).toBeVisible();

        // 2. Central target button presentation
        const centerBtn = page.locator(".am-direct-pencil__center");
        await expect(centerBtn).toBeVisible();
        await expect(page.locator(".am-direct-pencil__center-text")).toHaveText(item.letter);

        // 3. Surrounding 3x3 grid matrix
        const grid = page.locator(".am-direct-pencil__grid");
        await expect(grid).toBeVisible();

        // 4. Direct Pencil Line container and absence of rope/lasso
        const directPencil = page.locator(".am-direct-pencil");
        await expect(directPencil).toBeVisible();
        const ropeLayer = page.locator(".am-lasso__rope-layer");
        await expect(ropeLayer).toHaveCount(0);

        // 5. Verify images load inside grid cards
        await verifyImagesLoaded(page, ".am-direct-pencil__grid");

        // 6. Verify pre-connected example cell
        const exampleCell = page.locator('.am-direct-pencil__target[data-example="true"]');
        await expect(exampleCell).toBeVisible();

        // Capture screenshot
        await page.screenshot({ path: path.join(PROOF_DIR, `page${item.pageNum}-archetype4-laptop.png`) });
      });
    }

    test("Completion flow for Archetype 4 (Page 5 - Vocal Oo)", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await navigateToLessonPage(page, 2, 1);

      const directPencil = page.locator(".am-direct-pencil");
      await expect(directPencil).toBeVisible();

      // Connect central target 'Oo' to each correct surrounding picture:
      // Correct for 'Oo': oveja, ojos, oreja, olla, oso (ola is example)
      const correctTargets = ["oveja", "ojos", "oreja", "olla", "oso"];
      const centerBtn = page.locator(".am-direct-pencil__center");

      for (const caption of correctTargets) {
        const targetBtn = page.locator(`.am-direct-pencil__target[aria-label="${caption}"]`);

        await centerBtn.click();
        await targetBtn.click();
        await page.waitForTimeout(100);
      }

      // Verify completion
      await expect(directPencil).toHaveAttribute("data-complete", "true");
      const nativeViewer = page.locator(".native-lesson-viewer");
      await expect(nativeViewer).toHaveAttribute("data-page-complete", "true");

      // Screenshot completed state
      await page.screenshot({ path: path.join(PROOF_DIR, "page5-archetype4-completed.png") });
    });

    test("Device viewports fit for Archetype 4 (Page 5)", async ({ page }) => {
      // Laptop fit
      await page.setViewportSize({ width: 1366, height: 768 });
      await navigateToLessonPage(page, 2, 1);
      await checkViewportFit(page);

      // Tablet fit
      await page.setViewportSize({ width: 768, height: 1024 });
      await navigateToLessonPage(page, 2, 1);
      await checkViewportFit(page);
      await page.screenshot({ path: path.join(PROOF_DIR, "page5-archetype4-tablet.png") });

      // Phone fit
      await page.setViewportSize({ width: 375, height: 667 });
      await navigateToLessonPage(page, 2, 1);
      await checkViewportFit(page);
      await page.screenshot({ path: path.join(PROOF_DIR, "page5-archetype4-phone.png") });
    });
  });
});
