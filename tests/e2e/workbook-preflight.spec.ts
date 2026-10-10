import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const PROOF_DIR = path.join(process.cwd(), "docs/proofs/workbook-preflight");

function setupErrorTracking(page: import("@playwright/test").Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`[PageError] ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!text.includes("404")) {
        errors.push(`[ConsoleError] ${text}`);
      }
    }
  });
  return errors;
}

test.beforeAll(() => {
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }
});

test.describe("Workbook Preflight - Local Browser/Device Readiness", () => {
  test("1. Learner-scoped save/reload and resume state", async ({ page }) => {
    const errors = setupErrorTracking(page);
    await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
    const viewer = page.locator(".native-lesson-viewer");
    await expect(viewer).toBeVisible({ timeout: 15000 });

    // Mark lesson 1 completed to unlock navigation freely for state test
    await page.evaluate(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1]));
      localStorage.setItem("cartilla:completed-lessons", JSON.stringify([1]));
      window.dispatchEvent(new Event("cartilla:lesson-progress"));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(viewer).toBeVisible();

    // Turn to page 2 (index 1)
    const buttonNext = page.getByTestId("button-next");
    await buttonNext.click();
    await page.waitForTimeout(2500); // wait for turn

    // Verify current page indicator
    await expect(page.locator(".native-lesson-viewer__page")).toContainText("2 de");

    // Reload page
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(viewer).toBeVisible();

    // Verify page state resumed on page 2 (index 1)
    await expect(page.locator(".native-lesson-viewer__page")).toContainText("2 de");

    expect(errors).toEqual([]);
  });

  test("2. Completion gating, Siguiente button, and hint feedback", async ({ page }) => {
    const errors = setupErrorTracking(page);

    // Reset progress to ensure page 1 is gated
    await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.clear();
      window.dispatchEvent(new Event("cartilla:lesson-progress"));
    });
    await page.reload({ waitUntil: "domcontentloaded" });

    const viewer = page.locator(".native-lesson-viewer");
    await expect(viewer).toBeVisible({ timeout: 15000 });
    await expect(viewer).toHaveAttribute("data-page-complete", "false");

    // Attempt forward turn on incomplete page (use force:true since aria-disabled is present on locked button)
    const buttonNext = page.getByTestId("button-next");
    await buttonNext.click({ force: true });

    // Verify turn blocked and hint displayed
    await expect(viewer).toHaveAttribute("data-native-page", "1");
    const hint = page.locator(".native-lesson-viewer__hint");
    await expect(hint).toBeVisible();
    await expect(hint).toContainText("¡Casi!");

    // Mark page activities complete directly to unlock gate
    await page.evaluate(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1]));
      localStorage.setItem("cartilla:completed-lessons", JSON.stringify([1]));
      window.dispatchEvent(new Event("cartilla:lesson-progress"));
    });

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(viewer).toHaveAttribute("data-page-complete", "true");

    // Click Siguiente, should now advance page
    await buttonNext.click();
    await page.waitForTimeout(2500);
    await expect(page.locator(".native-lesson-viewer__page")).toContainText("2 de");

    expect(errors).toEqual([]);
  });

  test("3. Back/Forward navigation & browser history", async ({ page }) => {
    const errors = setupErrorTracking(page);

    // Un-gate lesson 1
    await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1]));
      localStorage.setItem("cartilla:completed-lessons", JSON.stringify([1]));
      window.dispatchEvent(new Event("cartilla:lesson-progress"));
    });
    await page.reload({ waitUntil: "domcontentloaded" });

    // Turn forward
    const buttonNext = page.getByTestId("button-next");
    await buttonNext.click();
    await page.waitForTimeout(2500);

    // Verify on page 2
    await expect(page.locator(".native-lesson-viewer__page")).toContainText("2 de");

    // Click Anterior (back) button
    const buttonPrev = page.getByTestId("button-prev");
    await expect(buttonPrev).toBeEnabled();
    await buttonPrev.click();
    await page.waitForTimeout(2500);

    // Verify returned to page 1
    await expect(page.locator(".native-lesson-viewer__page")).toContainText("1 de");

    // Test in-app route navigation & browser back button
    await page.goto("/cartilla/lecciones");
    await expect(page.locator("text=Mis lecciones")).toBeVisible();

    await page.goto("/cartilla/cuaderno");
    await expect(page.locator("[data-testid='physical-book-reader']")).toBeVisible();

    await page.goBack();
    await page.waitForURL("**/cartilla/lecciones");
    await expect(page.locator("text=Mis lecciones")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("4. Rapid-input page-turn locking and no page skipping", async ({ page }) => {
    const errors = setupErrorTracking(page);

    await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1]));
      localStorage.setItem("cartilla:completed-lessons", JSON.stringify([1]));
      window.dispatchEvent(new Event("cartilla:lesson-progress"));
    });
    await page.reload({ waitUntil: "domcontentloaded" });

    const buttonNext = page.getByTestId("button-next");

    // Rapidly click 3 times in quick succession
    await buttonNext.click({ clickCount: 1 });
    await buttonNext.click({ clickCount: 1, force: true });
    await buttonNext.click({ clickCount: 1, force: true });

    // Wait for single page turn to settle
    await page.waitForTimeout(2500);

    // Must be on page 2 (index 1), NOT page 3 or 4
    await expect(page.locator(".native-lesson-viewer__page")).toContainText("2 de");

    expect(errors).toEqual([]);
  });

  test("5. Keyboard navigation (Arrow keys) and input focus isolation", async ({ page }) => {
    const errors = setupErrorTracking(page);

    await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1]));
      localStorage.setItem("cartilla:completed-lessons", JSON.stringify([1]));
      window.dispatchEvent(new Event("cartilla:lesson-progress"));
    });
    await page.reload({ waitUntil: "domcontentloaded" });

    const viewer = page.locator(".native-lesson-viewer");
    await expect(viewer).toBeVisible();

    // Ensure window focus
    await page.locator("body").click();

    // ArrowRight turns forward when page is complete/unlocked
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(2500);
    await expect(page.locator(".native-lesson-viewer__page")).toContainText("2 de");

    // ArrowLeft turns back
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(2500);
    await expect(page.locator(".native-lesson-viewer__page")).toContainText("1 de");

    // Focus on input element if present, press ArrowRight
    const input = page.locator("input, textarea").first();
    if (await input.isVisible()) {
      await input.focus();
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(500);
      // Must remain on page 1 because focus was in input
      await expect(page.locator(".native-lesson-viewer__page")).toContainText("1 de");
    }

    expect(errors).toEqual([]);
  });

  test("6. Reduced motion preference", async ({ page }) => {
    const errors = setupErrorTracking(page);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1]));
      localStorage.setItem("cartilla:completed-lessons", JSON.stringify([1]));
      window.dispatchEvent(new Event("cartilla:lesson-progress"));
    });
    await page.reload({ waitUntil: "domcontentloaded" });

    const viewer = page.locator(".native-lesson-viewer");
    const buttonNext = page.getByTestId("button-next");
    await buttonNext.click();

    // Instant turn without turn-phase animation
    await expect(viewer).not.toHaveClass(/is-turning/);
    await expect(page.locator(".native-lesson-viewer__page")).toContainText("2 de");

    expect(errors).toEqual([]);
  });

  test("7. One Gretel presence only", async ({ page }) => {
    const errors = setupErrorTracking(page);

    // Test lesson viewer
    await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
    const lessonGretels = page.locator("[data-testid='gretel-presence'], .gretel-avatar, .gretel-mascot");
    const lessonGretelCount = await lessonGretels.count();
    expect(lessonGretelCount).toBeLessThanOrEqual(1);

    // Test cuaderno viewer
    await page.goto("/cartilla/cuaderno", { waitUntil: "domcontentloaded" });
    const cuadernoGretels = page.locator("[data-testid='gretel-presence'], .gretel-avatar, .gretel-mascot");
    const cuadernoGretelCount = await cuadernoGretels.count();
    expect(cuadernoGretelCount).toBeLessThanOrEqual(1);

    expect(errors).toEqual([]);
  });

  test("8. No nested page scroll where prohibited", async ({ page }) => {
    const errors = setupErrorTracking(page);

    await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
    const viewer = page.locator(".native-lesson-viewer");
    await expect(viewer).toBeVisible();

    // Check that native-lesson-viewer does not force an internal vertical scrollbar
    const hasNestedScroll = await viewer.evaluate((el) => {
      return el.scrollHeight > el.clientHeight && window.getComputedStyle(el).overflowY === "scroll";
    });
    expect(hasNestedScroll).toBe(false);

    expect(errors).toEqual([]);
  });

  test("9. Representative archetypes across device viewports & screenshots", async ({ page }) => {
    const errors = setupErrorTracking(page);

    const devices = [
      { name: "phone", viewport: { width: 375, height: 667 } },
      { name: "tablet", viewport: { width: 768, height: 1024 } },
      { name: "laptop", viewport: { width: 1280, height: 800 } },
      { name: "projector", viewport: { width: 1920, height: 1080 } },
    ];

    for (const dev of devices) {
      await page.setViewportSize(dev.viewport);
      await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

      // Take screenshot for proof
      await page.screenshot({
        path: path.join(PROOF_DIR, `${dev.name}-archetype.png`),
        fullPage: false,
      });

      // Verify main stage is visible and does not overflow x
      const isOverflowingX = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(isOverflowingX).toBe(false);
    }

    expect(errors).toEqual([]);
  });

  test("10. Workbook routes smoke & runtime exception check", async ({ page }) => {
    const errors = setupErrorTracking(page);

    const routes = [
      "/cartilla",
      "/cartilla/lecciones",
      "/cartilla/cuaderno",
      "/cartilla/leccion/1",
      "/cartilla/mi-progreso",
    ];

    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);
    }

    expect(errors).toEqual([]);
  });
});
