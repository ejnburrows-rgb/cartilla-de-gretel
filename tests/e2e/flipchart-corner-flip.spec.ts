import { test, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const PROOF_DIR = process.env.PROOF_DIR || path.join(process.cwd(), "test-results/page-turn-proof");

test.beforeAll(() => {
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }
});

test.use({ video: "on" });

test.describe("Flip Chart Corner Flip & Teacher Hand Mode E2E Proof", () => {
  test("Projector 1920x1080 forward and back in both hand modes without console errors", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/cartilla/presentar/7", { waitUntil: "domcontentloaded" });

    const panel = page.getByTestId("flipchart-hd-panel");
    await expect(panel).toBeVisible({ timeout: 15000 });

    // Verify default left-hand mode
    await expect(panel).toHaveAttribute("data-hand-mode", "left");
    const counter = page.getByTestId("flipchart-counter");
    await expect(counter).toContainText("Hoja 1 de");

    // 1. Initial resting state screenshot
    await page.screenshot({ path: path.join(PROOF_DIR, "projector-01-left-hand-sheet1.png") });

    // 2. Click bottom-left corner in Left-hand mode -> Next sheet
    const leftCorner = page.getByTestId("flipchart-corner-left");
    await leftCorner.click();

    // 3. Mid-flip screenshot (~800ms into 2000ms flip): verify no duplicate text or ghost page numbers
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(PROOF_DIR, "projector-02-mid-flip-no-duplicate-text.png"),
    });

    // 4. Settled on sheet 2
    await page.waitForTimeout(1400);
    await expect(counter).toContainText("Hoja 2 de");
    await page.screenshot({ path: path.join(PROOF_DIR, "projector-03-left-hand-sheet2.png") });

    // 5. Click bottom-right corner in Left-hand mode -> Previous sheet
    const rightCorner = page.getByTestId("flipchart-corner-right");
    await rightCorner.click();

    // Mid-flip reverse
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(PROOF_DIR, "projector-04-mid-flip-reverse.png") });

    await page.waitForTimeout(1400);
    await expect(counter).toContainText("Hoja 1 de");

    // 6. Toggle hand mode to Right-hand mode
    const toggleBtn = page.getByTestId("hand-mode-toggle");
    await toggleBtn.click();
    await expect(panel).toHaveAttribute("data-hand-mode", "right");

    // In Right-hand mode: bottom-right corner = Next sheet
    await rightCorner.click();
    await page.waitForTimeout(2200);
    await expect(counter).toContainText("Hoja 2 de");
    await page.screenshot({ path: path.join(PROOF_DIR, "projector-05-right-hand-next.png") });

    // In Right-hand mode: bottom-left corner = Previous sheet
    await leftCorner.click();
    await page.waitForTimeout(2200);
    await expect(counter).toContainText("Hoja 1 de");
    await page.screenshot({ path: path.join(PROOF_DIR, "projector-06-right-hand-prev.png") });

    expect(consoleErrors).toHaveLength(0);
  });

  test("Tablet touch-emulation corner drag that completes and springs back", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/cartilla/presentar/7", { waitUntil: "domcontentloaded" });

    const panel = page.getByTestId("flipchart-hd-panel");
    await expect(panel).toBeVisible({ timeout: 15000 });
    const counter = page.getByTestId("flipchart-counter");

    // 1. Drag < 50% (spring back test)
    const leftCorner = page.getByTestId("flipchart-corner-left");
    const box1 = await leftCorner.boundingBox();
    expect(box1).toBeTruthy();

    if (box1) {
      const startX = box1.x + box1.width / 2;
      const startY = box1.y + box1.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      // Drag upward slightly (only 60px)
      await page.mouse.move(startX, startY - 60, { steps: 5 });
      await page.waitForTimeout(150);
      await page.screenshot({
        path: path.join(PROOF_DIR, "tablet-01-drag-spring-back-active.png"),
      });
      await page.mouse.up();

      // Wait for spring back
      await page.waitForTimeout(500);
      // Still on Hoja 1 because it sprang back!
      await expect(counter).toContainText("Hoja 1 de");
      await page.screenshot({ path: path.join(PROOF_DIR, "tablet-02-drag-sprang-back.png") });
    }

    // 2. Drag >= 50% (completed turn test)
    const box2 = await leftCorner.boundingBox();
    if (box2) {
      const startX = box2.x + box2.width / 2;
      const startY = box2.y + box2.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      // Drag upward past halfway (380px)
      await page.mouse.move(startX, startY - 380, { steps: 10 });
      await page.waitForTimeout(150);
      await page.screenshot({ path: path.join(PROOF_DIR, "tablet-03-drag-complete-active.png") });
      await page.mouse.up();

      // Wait for turn completion
      await page.waitForTimeout(600);
      await expect(counter).toContainText("Hoja 2 de");
      await page.screenshot({ path: path.join(PROOF_DIR, "tablet-04-drag-completed-next.png") });
    }

    expect(consoleErrors).toHaveLength(0);
  });
});

test.describe("Flip Chart corner safety: cancellation, reduced motion, keyboard", () => {
  async function openPresenter(page: Page) {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/cartilla/presentar/7", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("flipchart-hd-panel")).toBeVisible({ timeout: 15000 });
    return page.getByTestId("flipchart-counter");
  }

  async function dragCorner(page: Page, testId: string, dy: number, end: "up" | "cancel") {
    const corner = page.getByTestId(testId);
    const box = (await corner.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    if (dy) await page.mouse.move(x, y + dy, { steps: 10 });
    if (end === "cancel") {
      await corner.dispatchEvent("pointercancel", {
        pointerId: 1,
        pointerType: "mouse",
        bubbles: true,
      });
    }
    await page.mouse.up();
  }

  test("an interrupted drag or tap never commits a turn", async ({ page }) => {
    const counter = await openPresenter(page);
    for (const dy of [0, -60, -380]) {
      await dragCorner(page, "flipchart-corner-left", dy, "cancel");
      await page.waitForTimeout(2300);
      await expect(counter).toContainText("Hoja 1 de");
      await expect(page.getByTestId("vertical-flip-layer")).toHaveCount(0);
    }
    // The corner still works normally after cancellations.
    await dragCorner(page, "flipchart-corner-left", -380, "up");
    await expect(counter).toContainText("Hoja 2 de", { timeout: 3000 });
  });

  test("reduced motion drag uses no 3D layer and turns instantly", async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const counter = await openPresenter(page);
    const corner = page.getByTestId("flipchart-corner-left");
    const box = (await corner.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 380, { steps: 10 });
    await expect(page.getByTestId("vertical-flip-layer")).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("reduced-motion-mid-drag.png") });
    await page.mouse.up();
    await expect(counter).toContainText("Hoja 2 de", { timeout: 500 });
    await dragCorner(page, "flipchart-corner-left", -60, "up");
    await expect(counter).toContainText("Hoja 2 de");
    await expect(page.getByTestId("vertical-flip-layer")).toHaveCount(0);
  });

  test("Enter and Space on a focused corner follow the teacher hand mode", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const counter = await openPresenter(page);
    const left = page.getByTestId("flipchart-corner-left");
    const right = page.getByTestId("flipchart-corner-right");
    await left.focus();
    await page.keyboard.press("Enter");
    await expect(counter).toContainText("Hoja 2 de");
    await right.focus();
    await page.keyboard.press(" ");
    await expect(counter).toContainText("Hoja 1 de");
    await page.getByTestId("hand-mode-toggle").click();
    await right.focus();
    await page.keyboard.press(" ");
    await expect(counter).toContainText("Hoja 2 de");
    await left.focus();
    await page.keyboard.press("Enter");
    await expect(counter).toContainText("Hoja 1 de");
  });
});
