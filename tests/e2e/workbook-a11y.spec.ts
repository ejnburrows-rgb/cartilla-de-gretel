import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { seedCompletedPages } from "./support/completion";

const PROOF_DIR = path.resolve("docs/proofs/viewport-a11y");

test.beforeAll(async () => {
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }
  // Warm up dev server so initial on-demand bundling doesn't block the first test
  try {
    const res = await fetch("http://127.0.0.1:5173/cartilla/leccion/7");
    await res.text();
  } catch {
    /* server may still be initializing */
  }
});

test.beforeEach(({}) => {
  test.setTimeout(120000);
});

async function dismissCinematic(page: Page) {
  const start = page.getByRole("button", { name: "Comenzar" });
  if (await start.isVisible().catch(() => false)) {
    await start.click();
  }
}

async function unlockLesson(page: Page, lessonNum: number, pages: number[]) {
  await page.addInitScript(([n, pList]) => {
    localStorage.setItem(
      "cartilla.lesson-progress.v1",
      JSON.stringify(Array.from({ length: n }, (_, i) => i + 1)),
    );
    localStorage.setItem(
      "cartilla:completed-lessons",
      JSON.stringify(Array.from({ length: n }, (_, i) => i + 1)),
    );
  }, [lessonNum, pages] as const);
  await seedCompletedPages(page, pages);
}

async function checkZeroHorizontalScroll(page: Page, label: string) {
  const scrollInfo = await page.evaluate(() => {
    const docEl = document.documentElement;
    const body = document.body;
    const winWidth = window.innerWidth;
    return {
      docScrollWidth: docEl.scrollWidth,
      bodyScrollWidth: body.scrollWidth,
      winWidth,
      scrollX: window.scrollX,
      docOverflow: docEl.scrollWidth - winWidth,
      bodyOverflow: body.scrollWidth - winWidth,
    };
  });

  expect(
    scrollInfo.docOverflow,
    `Zero horizontal scroll on document (${label}): scrollWidth ${scrollInfo.docScrollWidth} vs innerWidth ${scrollInfo.winWidth}`,
  ).toBeLessThanOrEqual(1);

  expect(
    scrollInfo.bodyOverflow,
    `Zero horizontal scroll on body (${label}): body scrollWidth ${scrollInfo.bodyScrollWidth} vs innerWidth ${scrollInfo.winWidth}`,
  ).toBeLessThanOrEqual(1);

  expect(scrollInfo.scrollX, `Horizontal scroll position (${label}) must be 0`).toBe(0);
}

test.describe("Track C: Viewport Ergonomics & Zero Horizontal Page Scroll", () => {
  const viewports = [
    { name: "375px-iphone-se", width: 375, height: 667 },
    { name: "390px-iphone-13", width: 390, height: 844 },
    { name: "768px-ipad", width: 768, height: 1024 },
    { name: "1280px-desktop", width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    test(`Zero horizontal scroll across lessons at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Lesson 7 (Archetype 5: tracing + drawing)
      await unlockLesson(page, 7, [19, 20]);
      await page.goto("/cartilla/leccion/7", { waitUntil: "domcontentloaded" });
      await dismissCinematic(page);
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });
      await checkZeroHorizontalScroll(page, `L7 p19 @ ${vp.name}`);
      await page.screenshot({ path: path.join(PROOF_DIR, `${vp.name}-lesson7.png`) });

      // 2. Lesson 8 (Syllable exercises & fill-in-the-blank)
      await unlockLesson(page, 8, [23, 24, 25, 26]);
      await page.goto("/cartilla/leccion/8", { waitUntil: "domcontentloaded" });
      await dismissCinematic(page);
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });
      await checkZeroHorizontalScroll(page, `L8 p23 @ ${vp.name}`);
      await page.screenshot({ path: path.join(PROOF_DIR, `${vp.name}-lesson8.png`) });

      // 3. Lesson 11 (Writing page 35 with cutoff fixes)
      await unlockLesson(page, 11, [35, 36]);
      await page.goto("/cartilla/leccion/11", { waitUntil: "domcontentloaded" });
      await dismissCinematic(page);
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });
      await checkZeroHorizontalScroll(page, `L11 p35 @ ${vp.name}`);
      await page.screenshot({ path: path.join(PROOF_DIR, `${vp.name}-lesson11.png`) });
    });
  }
});

test.describe("Track C: Minimum Touch Target Discipline (>= 44px)", () => {
  test("Drawing toolbar (.am-dibuja__toolbar) strictly maintains >= 44px touch targets", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockLesson(page, 7, [19, 20]);
    await page.goto("/cartilla/leccion/7", { waitUntil: "domcontentloaded" });
    await dismissCinematic(page);
    await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

    const toolbar = page.locator(".am-dibuja__toolbar").first();
    await expect(toolbar).toBeVisible();

    // Check swatches
    const swatches = toolbar.locator(".am-dibuja__swatch");
    const swatchCount = await swatches.count();
    expect(swatchCount).toBeGreaterThan(0);
    for (let i = 0; i < swatchCount; i++) {
      const box = await swatches.nth(i).boundingBox();
      expect(box, `Swatch #${i} bounding box`).not.toBeNull();
      if (box) {
        expect(box.width, `Swatch #${i} width`).toBeGreaterThanOrEqual(44);
        expect(box.height, `Swatch #${i} height`).toBeGreaterThanOrEqual(44);
      }
    }

    // Check eraser tool
    const eraser = toolbar.locator(".am-dibuja__tool--eraser");
    await expect(eraser).toBeVisible();
    const eraserBox = await eraser.boundingBox();
    expect(eraserBox, "Eraser tool bounding box").not.toBeNull();
    if (eraserBox) {
      expect(eraserBox.width, "Eraser width >= 44px").toBeGreaterThanOrEqual(44);
      expect(eraserBox.height, "Eraser height >= 44px").toBeGreaterThanOrEqual(44);
    }

    // Check other tools (undo, clear)
    const tools = toolbar.locator(".am-dibuja__tool");
    const toolCount = await tools.count();
    for (let i = 0; i < toolCount; i++) {
      const box = await tools.nth(i).boundingBox();
      expect(box, `Tool #${i} bounding box`).not.toBeNull();
      if (box) {
        expect(box.width, `Tool #${i} width >= 44px`).toBeGreaterThanOrEqual(44);
        expect(box.height, `Tool #${i} height >= 44px`).toBeGreaterThanOrEqual(44);
      }
    }

    // Check done button (Listo)
    const doneBtn = toolbar.locator(".am-dibuja__done");
    await expect(doneBtn).toBeVisible();
    const doneBox = await doneBtn.boundingBox();
    expect(doneBox, "Done button bounding box").not.toBeNull();
    if (doneBox) {
      expect(doneBox.width, "Done button width >= 44px").toBeGreaterThanOrEqual(44);
      expect(doneBox.height, "Done button height >= 44px").toBeGreaterThanOrEqual(44);
    }
  });

  test("Drawing toolbar in cutoff-fixes scope (Page 35) strictly maintains >= 44px touch targets", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await unlockLesson(page, 11, [35, 36]);
    await page.goto("/cartilla/leccion/11", { waitUntil: "domcontentloaded" });
    await dismissCinematic(page);
    await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

    const toolbar = page.locator(".am-dibuja__toolbar").first();
    await expect(toolbar).toBeVisible();

    const swatches = toolbar.locator(".am-dibuja__swatch");
    const swatchCount = await swatches.count();
    expect(swatchCount).toBeGreaterThan(0);
    for (let i = 0; i < swatchCount; i++) {
      const box = await swatches.nth(i).boundingBox();
      expect(box, `P35 Swatch #${i} bounding box`).not.toBeNull();
      if (box) {
        expect(box.width, `P35 Swatch #${i} width >= 44px`).toBeGreaterThanOrEqual(44);
        expect(box.height, `P35 Swatch #${i} height >= 44px`).toBeGreaterThanOrEqual(44);
      }
    }

    const eraser = toolbar.locator(".am-dibuja__tool--eraser");
    const eraserBox = await eraser.boundingBox();
    expect(eraserBox, "P35 Eraser bounding box").not.toBeNull();
    if (eraserBox) {
      expect(eraserBox.width, "P35 Eraser width >= 44px").toBeGreaterThanOrEqual(44);
      expect(eraserBox.height, "P35 Eraser height >= 44px").toBeGreaterThanOrEqual(44);
    }

    const doneBtn = toolbar.locator(".am-dibuja__done");
    const doneBox = await doneBtn.boundingBox();
    expect(doneBox, "P35 Done bounding box").not.toBeNull();
    if (doneBox) {
      expect(doneBox.width, "P35 Done width >= 44px").toBeGreaterThanOrEqual(44);
      expect(doneBox.height, "P35 Done height >= 44px").toBeGreaterThanOrEqual(44);
    }
  });

  test("Tracing mode toggle (.fp-trace__mode-toggle) strictly maintains >= 44px touch targets", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await unlockLesson(page, 7, [19, 20]);
    await page.goto("/cartilla/leccion/7", { waitUntil: "domcontentloaded" });
    await dismissCinematic(page);
    await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

    const modeToggle = page.locator(".fp-trace__mode-toggle").first();
    await expect(modeToggle).toBeVisible();

    const box = await modeToggle.boundingBox();
    expect(box, "Tracing mode toggle bounding box").not.toBeNull();
    if (box) {
      expect(box.width, "Tracing mode toggle width >= 44px").toBeGreaterThanOrEqual(44);
      expect(box.height, "Tracing mode toggle height >= 44px").toBeGreaterThanOrEqual(44);
    }
  });

  test("Navigation controls (.native-lesson-viewer__navigation button) strictly maintain >= 44px touch targets", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await unlockLesson(page, 8, [23, 24, 25, 26]);
    await page.goto("/cartilla/leccion/8", { waitUntil: "domcontentloaded" });
    await dismissCinematic(page);
    await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

    const navButtons = page.locator(".native-lesson-viewer__navigation button");
    const count = await navButtons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const btn = navButtons.nth(i);
      const box = await btn.boundingBox();
      expect(box, `Navigation button #${i} bounding box`).not.toBeNull();
      if (box) {
        expect(box.width, `Nav button #${i} width >= 44px`).toBeGreaterThanOrEqual(44);
        expect(box.height, `Nav button #${i} height >= 44px`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test.describe("Track C: Accessibility (a11y) & Reduced Motion", () => {
  test("Clean static rendering and immediate state transitions under prefers-reduced-motion: reduce", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 800 });
    await unlockLesson(page, 8, [23, 24, 25, 26]);
    await page.goto("/cartilla/leccion/8", { waitUntil: "domcontentloaded" });
    await dismissCinematic(page);

    const viewer = page.locator(".native-lesson-viewer");
    await expect(viewer).toBeVisible({ timeout: 15000 });

    // Verify 3D curl layer and corner peel are completely hidden
    const curls = page.locator(".native-page-curl");
    const peels = page.locator(".native-corner-peel");
    await expect(curls).toHaveCount(0);
    const visiblePeels = await peels.evaluateAll((els) =>
      els.filter((el) => window.getComputedStyle(el).display !== "none").length
    );
    expect(visiblePeels, "Corner peels hidden under reduced motion").toBe(0);

    // Verify immediate state transition: clicking Siguiente changes page instantly (< 200ms)
    await expect(viewer).toHaveAttribute("data-native-page", "23");
    const nextBtn = page.getByTestId("button-next");
    await nextBtn.click();

    // With reduced motion, transition must happen immediately without curling/animating
    await expect(viewer).toHaveAttribute("data-native-page", "24", { timeout: 1000 });
    await expect(viewer).not.toHaveClass(/is-turning/);

    await page.screenshot({ path: path.join(PROOF_DIR, "reduced-motion-static-p24.png") });
  });

  test("Full keyboard accessibility: Enter/Space for activating buttons and Arrow keys for navigating exercise lists", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await unlockLesson(page, 7, [19, 20]);
    await page.goto("/cartilla/leccion/7", { waitUntil: "domcontentloaded" });
    await dismissCinematic(page);

    const viewer = page.locator(".native-lesson-viewer");
    await expect(viewer).toBeVisible({ timeout: 15000 });

    // 1. Enter/Space to activate tracing mode toggle button
    const modeToggle = page.locator(".fp-trace__mode-toggle").first();
    await expect(modeToggle).toBeVisible();
    await modeToggle.focus();
    await expect(modeToggle).toBeFocused();

    const initialText = await modeToggle.textContent();
    // Press Space to toggle mode
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);
    const toggledText = await modeToggle.textContent();
    expect(toggledText).not.toBe(initialText);

    // Press Enter to toggle mode back
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    const restoredText = await modeToggle.textContent();
    expect(restoredText).toBe(initialText);

    // 2. Arrow keys navigating exercise listbox (Dibuja swatches)
    const swatches = page.locator(".am-dibuja__swatch");
    await expect(swatches.first()).toBeVisible();
    await swatches.first().focus();
    await expect(swatches.first()).toBeFocused();

    // Press ArrowRight to navigate to next swatch
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);
    await expect(swatches.nth(1)).toBeFocused();

    // Press ArrowRight to navigate to third swatch
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(100);
    await expect(swatches.nth(2)).toBeFocused();

    // Press ArrowLeft to navigate back to second swatch
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(100);
    await expect(swatches.nth(1)).toBeFocused();

    // 3. Enter/Space activating navigation buttons
    const nextBtn = page.getByTestId("button-next");
    await nextBtn.focus();
    await expect(nextBtn).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(viewer).toHaveAttribute("data-native-page", "20", { timeout: 8000 });

    const prevBtn = page.getByTestId("button-prev");
    await expect(prevBtn).toBeEnabled({ timeout: 6000 });
    await prevBtn.focus();
    await expect(prevBtn).toBeFocused();
    await page.keyboard.press("Space");
    await expect(viewer).toHaveAttribute("data-native-page", "19", { timeout: 8000 });
  });

  test("Exercise word buttons in Lesson 8 activate via keyboard Enter/Space", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await unlockLesson(page, 8, [23, 24, 25, 26]);
    await page.goto("/cartilla/leccion/8", { waitUntil: "domcontentloaded" });
    await dismissCinematic(page);

    const viewer = page.locator(".native-lesson-viewer");
    await expect(viewer).toBeVisible({ timeout: 15000 });

    // Turn to page 24 with syllable exercise
    const nextBtn = page.getByRole("button", { name: "Siguiente" });
    await nextBtn.click();
    await expect(viewer).toHaveAttribute("data-native-page", "24", { timeout: 6000 });

    const syllableWord = page.locator(".native-syllable__word").first();
    await expect(syllableWord).toBeVisible();

    // Focus and activate with Enter
    await syllableWord.focus();
    await expect(syllableWord).toBeFocused();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);

    // The word button triggers pencil marking
    await expect(syllableWord).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("Track C: Recorded Video Proof across Viewports", () => {
  const targetViewports = [
    { name: "viewport-375px", width: 375, height: 667 },
    { name: "viewport-768px", width: 768, height: 1024 },
    { name: "viewport-1280px", width: 1280, height: 800 },
  ];

  for (const vp of targetViewports) {
    test(`Record comprehensive viewport proof for ${vp.name} (${vp.width}x${vp.height})`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        recordVideo: { dir: PROOF_DIR, size: { width: vp.width, height: vp.height } },
      });
      const page = await context.newPage();

      await unlockLesson(page, 7, [19, 20]);
      await unlockLesson(page, 8, [23, 24, 25, 26]);

      // 1. Visit Lesson 7 Archetype 5
      await page.goto("/cartilla/leccion/7", { waitUntil: "domcontentloaded" });
      await dismissCinematic(page);
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });
      await checkZeroHorizontalScroll(page, `${vp.name} L7`);

      // Inspect drawing tools
      const toolbar = page.locator(".am-dibuja__toolbar").first();
      await expect(toolbar).toBeVisible();
      await page.waitForTimeout(600);

      // Toggle tracing mode
      const modeToggle = page.locator(".fp-trace__mode-toggle").first();
      if (await modeToggle.isVisible()) {
        await modeToggle.click();
        await page.waitForTimeout(400);
        await modeToggle.click();
        await page.waitForTimeout(400);
      }

      // Navigate page forward via Siguiente
      const nextBtn = page.getByTestId("button-next");
      await nextBtn.click();
      await page.waitForTimeout(2500);
      await checkZeroHorizontalScroll(page, `${vp.name} L7 p20`);

      // Navigate back via Anterior
      const prevBtn = page.getByTestId("button-prev");
      await prevBtn.click();
      await page.waitForTimeout(2500);

      // 2. Visit Lesson 8
      await page.goto("/cartilla/leccion/8", { waitUntil: "domcontentloaded" });
      await dismissCinematic(page);
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });
      await checkZeroHorizontalScroll(page, `${vp.name} L8 p23`);

      // Turn to page 24
      const nextBtnL8 = page.getByTestId("button-next");
      await nextBtnL8.click();
      await page.waitForTimeout(2500);
      await checkZeroHorizontalScroll(page, `${vp.name} L8 p24`);

      // Interact with syllable button
      const wordBtn = page.locator(".native-syllable__word").first();
      if (await wordBtn.isVisible()) {
        await wordBtn.click();
        await page.waitForTimeout(500);
      }

      const video = page.video();
      await context.close();

      if (video) {
        const videoPath = await video.path();
        const dest = path.join(PROOF_DIR, `${vp.name}.webm`);
        if (fs.existsSync(videoPath)) {
          fs.copyFileSync(videoPath, dest);
        }
      }
    });
  }
});
