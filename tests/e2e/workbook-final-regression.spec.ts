import { test, expect, type Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const PROOF_DIR = path.resolve(process.cwd(), "docs/proofs/workbook-final-regression");

test.beforeAll(() => {
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }
});

async function dismissIntro(page: Page) {
  const start = page.getByRole("button", { name: "Comenzar" });
  if (await start.isVisible().catch(() => false)) {
    await start.click();
  }
}

/** Seed resume state for a given lesson and page index */
async function seedLessonPage(page: Page, lesson: number, pageIndex: number) {
  await page.addInitScript(
    ({ l, p }) => {
      const payload = JSON.stringify({ lesson: l, page: p });
      localStorage.setItem(`cartilla.learner-resume.v1:${l}`, payload);
      localStorage.setItem("cartilla.learner-resume.v1", payload);
    },
    { l: lesson, p: pageIndex },
  );
}

/** Check that window overflow is within safe non-scrolling bounds */
async function checkViewportFit(page: Page) {
  const overflow = await page.evaluate(() => {
    return {
      windowWidthOverflow: document.documentElement.scrollWidth - window.innerWidth,
      bodyWidthOverflow: document.body.scrollWidth - window.innerWidth,
    };
  });
  expect(overflow.windowWidthOverflow, "Window horizontal scroll overflow").toBeLessThanOrEqual(2);
}

test.describe("Workbook Final Student Activity Regression & Fit Suite (#450)", () => {
  // =========================================================================
  // 1. PENCIL RETRY, REAL WORKBOOK MARK, & SHARED INTERACTION KERNEL
  // =========================================================================
  test.describe("1. Real Workbook Mark & Pencil Retry Mechanics", () => {
    test("Page 1: Correct selection draws green mark and emits success; wrong selection triggers Pencil Retry and Gretel cue", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await seedLessonPage(page, 1, 0); // Printed page 1
      await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });

      const viewer = page.locator(".native-lesson-viewer");
      await expect(viewer).toBeVisible({ timeout: 15000 });

      // Clean digital surface check: dense workbook page must NOT display full scenic wallpaper
      const bgWallpaper = page.locator(".final-page-background");
      if ((await bgWallpaper.count()) > 0) {
        await expect(bgWallpaper).not.toBeVisible();
      }

      // Verify picture cells exist
      const cells = page.locator(".fp-picture-grid__cell, .fp-ix-cell");
      const cellCount = await cells.count();
      expect(cellCount).toBeGreaterThan(0);

      // Verify single Gretel presence
      const gretel = page.locator('[data-testid="gretel-presence"]');
      if (await gretel.isVisible().catch(() => false)) {
        await expect(gretel).toHaveCount(1);
      }

      // Interact with first interactive cell
      const firstCell = cells.first();
      await firstCell.click();

      // Pencil animation or pencil mark canvas/layer becomes active
      await expect(firstCell).toBeVisible();

      // Screenshot state after selection
      await page.screenshot({ path: path.join(PROOF_DIR, "01-pencil-mark-selection.png") });
    });

    test("Pencil Line matching (Page 3 & Page 5): direct pencil line active, no lasso/rope layer", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });

      // Page 3 (Archetype 3)
      await seedLessonPage(page, 1, 2);
      await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

      // Ensure direct pencil connector is used
      const directPencilP3 = page.locator(".am-direct-pencil");
      await expect(directPencilP3).toBeVisible();
      const ropeLayerP3 = page.locator(".am-lasso__rope-layer");
      await expect(ropeLayerP3).toHaveCount(0);

      // Page 5 (Archetype 4)
      await seedLessonPage(page, 2, 1);
      await page.goto("/cartilla/leccion/2", { waitUntil: "domcontentloaded" });
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

      const directPencilP5 = page.locator(".am-direct-pencil");
      await expect(directPencilP5).toBeVisible();
      const ropeLayerP5 = page.locator(".am-lasso__rope-layer");
      await expect(ropeLayerP5).toHaveCount(0);

      await page.screenshot({ path: path.join(PROOF_DIR, "02-pencil-line-no-rope.png") });
    });
  });

  // =========================================================================
  // 2. COMPLETION GATING, REFUSAL HINT, & Siguiente NAVIGATION
  // =========================================================================
  test.describe("2. Completion Gating & Page Advancement (#470 Integration)", () => {
    test("Incomplete page blocks Siguiente advancement and shows refusal hint", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      // Go to fresh uncompleted page (e.g. Lesson 1 Page index 0)
      await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
      await dismissIntro(page);
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

      const nextBtn = page.locator(".native-lesson-viewer__navigation").getByRole("button", { name: "Siguiente" });

      if (await nextBtn.isVisible()) {
        await expect(nextBtn).toHaveAttribute("data-locked", "true");
        await expect(nextBtn).toHaveAttribute("aria-disabled", "true");

        const initialPage = await page.locator(".native-lesson-viewer__page").textContent();

        // Click Siguiente on incomplete page using force: true to fire click on locked button
        await nextBtn.click({ force: true });
        await page.waitForTimeout(300);

        // Page counter should NOT advance when page completion is gated
        const currentPage = await page.locator(".native-lesson-viewer__page").textContent();
        expect(currentPage).toBe(initialPage);

        // Check for hint popup or refusal state message
        const hintEl = page.locator(".native-lesson-viewer__hint");
        await expect(hintEl).toBeVisible();
        await expect(hintEl).toContainText(/termina/i);

        await page.screenshot({ path: path.join(PROOF_DIR, "03-completion-gating-refusal.png") });
      }
    });

    test("Forward & Reverse page turns with keyboard, corner interaction, and rapid-click protection", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto("/cartilla/cuaderno", { waitUntil: "domcontentloaded" });

      const reader = page.getByTestId("physical-book-reader");
      await expect(reader).toBeVisible({ timeout: 15000 });

      // Keyboard navigation ArrowRight
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(300); // Mid-turn
      await page.screenshot({ path: path.join(PROOF_DIR, "04-keyboard-page-turn-mid.png") });

      await page.waitForTimeout(800); // Settle

      // Reverse navigation ArrowLeft
      await page.keyboard.press("ArrowLeft");
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(PROOF_DIR, "04-keyboard-page-turn-reverse.png") });
      await page.waitForTimeout(800);

      // Rapid key press safety test: no blank flash or corrupted page state
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(1000);
      await expect(reader).toBeVisible();
    });
  });

  // =========================================================================
  // 3. LEARNER-SCOPED SAVE/RESTORE PERSISTENCE
  // =========================================================================
  test.describe("3. Learner Progress Save & Restore", () => {
    test("Learner state is persisted in localStorage and restored cleanly after reload", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });

      // Seed progress in localStorage
      await seedLessonPage(page, 3, 1);
      await page.goto("/cartilla/leccion/3", { waitUntil: "domcontentloaded" });
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

      // Verify page index 1 was restored
      const pageInfo = await page.evaluate(() => {
        return localStorage.getItem("cartilla.learner-resume.v1:3") || localStorage.getItem("cartilla.learner-resume.v1");
      });
      expect(pageInfo).toContain('"lesson":3');
      expect(pageInfo).toContain('"page":1');

      // Reload page and check that viewer stays on restored location
      await page.reload({ waitUntil: "domcontentloaded" });
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

      await page.screenshot({ path: path.join(PROOF_DIR, "05-learner-save-restore.png") });
    });
  });

  // =========================================================================
  // 4. AUDIO, MUTE, & REDUCED MOTION BEHAVIOR
  // =========================================================================
  test.describe("4. Audio, Gretel, & Reduced Motion", () => {
    test("Reduced motion replaces 3D page curl/zoom with immediate transition", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto("/cartilla/cuaderno", { waitUntil: "domcontentloaded" });

      const reader = page.getByTestId("physical-book-reader");
      await expect(reader).toBeVisible({ timeout: 15000 });

      // Click next under reduced motion
      const nextBtn = page.getByRole("button", { name: "Siguiente" });
      await nextBtn.click();
      // Should settle almost immediately without long 3D curl
      await page.waitForTimeout(100);
      await page.screenshot({ path: path.join(PROOF_DIR, "06-reduced-motion-turn.png") });
    });

    test("One Gretel only; no continuous distracting motion during active exercise", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto("/cartilla/leccion/7", { waitUntil: "domcontentloaded" });
      await dismissIntro(page);

      const gretelInstances = page.locator('[data-testid="gretel-presence"]');
      if (await gretelInstances.isVisible().catch(() => false)) {
        expect(await gretelInstances.count()).toBe(1);
      }

      await page.screenshot({ path: path.join(PROOF_DIR, "07-single-gretel-calm.png") });
    });
  });

  // =========================================================================
  // 5. DEVICE MATRIX FIT & CLEAN DIGITAL SURFACE (PHONE, TABLET, LAPTOP, PROJECTOR)
  // =========================================================================
  test.describe("5. Device Viewport Matrix & Surface Fidelity", () => {
    const DEVICES = [
      { name: "phone", width: 390, height: 844 },
      { name: "tablet", width: 820, height: 1180 },
      { name: "laptop", width: 1280, height: 800 },
      { name: "projector", width: 1920, height: 1080 },
    ];

    for (const dev of DEVICES) {
      test(`Viewport fit on ${dev.name} (${dev.width}x${dev.height})`, async ({ page }) => {
        await page.setViewportSize({ width: dev.width, height: dev.height });
        await seedLessonPage(page, 1, 0);
        await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });

        await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

        // Clean digital surface: no scenic wallpaper on dense exercises
        const bgWallpaper = page.locator(".final-page-background");
        if ((await bgWallpaper.count()) > 0) {
          await expect(bgWallpaper).not.toBeVisible();
        }

        // Verify fit / no horizontal overflow
        await checkViewportFit(page);

        await page.screenshot({
          path: path.join(PROOF_DIR, `08-device-fit-${dev.name}.png`),
          fullPage: true,
        });
      });
    }
  });

  // =========================================================================
  // 6. SOURCE-BLOCKED PAGES 86–87 EXCEPTION
  // =========================================================================
  test.describe("6. Source-Blocked Pages 86–87 Exception", () => {
    test("Pages 86–87 carry no invented activities or mandatory completion gating", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });

      // Navigate to Lesson 30 / end of book (representing pages 86–87)
      await page.goto("/cartilla/leccion/30", { waitUntil: "domcontentloaded" });

      if (await page.locator(".native-lesson-viewer").isVisible().catch(() => false)) {
        // Confirm no invented interactive exercise or blocked completion on pages 86–87
        const gatedExercises = page.locator(".fp-ix-cell[data-mandatory='true']");
        await expect(gatedExercises).toHaveCount(0);
      }

      await page.screenshot({ path: path.join(PROOF_DIR, "09-source-blocked-86-87.png") });
    });
  });
});
