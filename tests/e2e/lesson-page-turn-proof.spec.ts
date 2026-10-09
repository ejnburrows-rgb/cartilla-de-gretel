import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const PROOF_DIR = process.env.PROOF_DIR || path.join(process.cwd(), "test-results/lesson-page-turn-proof");

test.beforeAll(() => {
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }
});

test.describe("Lesson Page Real-Paper Turn - Proof & Verification", () => {
  test("Desktop 1280x900: corner tap, buttons, keyboard turns & console safety", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      recordVideo: { dir: PROOF_DIR, size: { width: 1280, height: 900 } },
    });
    const page = await context.newPage();

    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Mark lesson 1 completed in localStorage so pages are un-gated for navigation proof
    await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1]));
      localStorage.setItem("cartilla:completed-lessons", JSON.stringify([1]));
      window.dispatchEvent(new Event("cartilla:lesson-progress"));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

    // 1. Initial page screenshot
    await page.screenshot({ path: path.join(PROOF_DIR, "desktop-01-initial.png") });

    // 2. Corner tap forward
    const cornerNext = page.getByTestId("corner-next");
    await cornerNext.click();

    // Capture mid-turn curl frame (~500ms into 2.0s curl)
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(PROOF_DIR, "desktop-02-corner-next-midturn.png") });

    // Wait for turn to settle cleanly
    await page.waitForTimeout(2200);
    await page.screenshot({ path: path.join(PROOF_DIR, "desktop-03-corner-next-settled.png") });

    // 3. Corner tap back
    const cornerPrev = page.getByTestId("corner-prev");
    await expect(cornerPrev).toBeVisible({ timeout: 5000 });
    await cornerPrev.click();

    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(PROOF_DIR, "desktop-04-corner-prev-midturn.png") });

    await page.waitForTimeout(2200);

    // 4. Button turn forward
    const buttonNext = page.getByTestId("button-next");
    await buttonNext.click();
    await page.waitForTimeout(2500);

    // 5. Button turn back
    const buttonPrev = page.getByTestId("button-prev");
    await buttonPrev.click();
    await page.waitForTimeout(2500);

    // 6. Keyboard turn forward (ArrowRight)
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(2500);

    // 7. Keyboard turn back (ArrowLeft)
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(2500);

    await context.close();

    // Verify no console errors occurred
    expect(consoleErrors).toEqual([]);
  });

  test("Tablet touch emulation: corner drag springback and completion", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
      hasTouch: true,
      isMobile: true,
      recordVideo: { dir: PROOF_DIR, size: { width: 768, height: 1024 } },
    });
    const page = await context.newPage();

    // Mark lesson 1 completed in localStorage so navigation is un-gated
    await page.goto("/cartilla/leccion/1", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1]));
      localStorage.setItem("cartilla:completed-lessons", JSON.stringify([1]));
      window.dispatchEvent(new Event("cartilla:lesson-progress"));
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

    const cornerNext = page.getByTestId("corner-next");
    const box = await cornerNext.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      // 1. Drag < 50% (Spring back): drag 100px left
      await page.touchscreen.tap(startX, startY);
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX - 100, startY, { steps: 10 });
      await page.screenshot({ path: path.join(PROOF_DIR, "tablet-01-drag-springback-mid.png") });
      await page.mouse.up();

      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(PROOF_DIR, "tablet-02-drag-springback-settled.png") });

      // 2. Drag > 50% (Complete turn): drag 450px left
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX - 450, startY, { steps: 15 });
      await page.screenshot({ path: path.join(PROOF_DIR, "tablet-03-drag-complete-mid.png") });
      await page.mouse.up();

      await page.waitForTimeout(2500);
      await page.screenshot({ path: path.join(PROOF_DIR, "tablet-04-drag-complete-settled.png") });
    }

    await context.close();
  });
});
