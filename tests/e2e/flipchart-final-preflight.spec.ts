import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const OUT_DIR = process.env.PROOF_DIR || path.join(process.cwd(), "docs/proofs/flipchart-final-preflight/");

test.beforeAll(() => {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
});

test.describe("Flipchart pre-final regression", () => {
  test("verify faithful page/order presentation, top-bound physical page turn, forward/back/keyboard/reduced motion, projector/laptop/tablet/phone fit", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    // Device configs
    const devices = [
      { name: "projector", width: 1920, height: 1080 },
      { name: "laptop", width: 1280, height: 900 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "phone", width: 375, height: 667 },
    ];

    for (const device of devices) {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto("/cartilla/presentar/7");

      const panel = page.getByTestId("flipchart-hd-panel");
      await expect(panel).toBeVisible({ timeout: 15000 });

      // Lesson 7 sheets are flipchart pages 9-11 per src/data/teacher-flipchart.json
      const nativeBoard = page.getByTestId("flipchart-stage").getByTestId("flipchart-native-board");
      await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "9");

      // Top-bound physical page turn check
      await expect(panel).toHaveAttribute("data-page-turn-axis", "vertical");

      const viewportWidth = device.width;
      const boardBox = await panel.boundingBox();
      expect(boardBox?.width).toBeLessThanOrEqual(viewportWidth);
      expect(boardBox?.x).toBeGreaterThanOrEqual(0);

      const documentElement = page.locator("html");
      const htmlWidth = await documentElement.evaluate((el) => el.scrollWidth);
      expect(htmlWidth).toBeLessThanOrEqual(viewportWidth);

      // Ensure the stage remains visible
      const stage = page.getByTestId("teacher-presenter-stage");
      await expect(stage).toBeVisible();

      // Ensure no default scenic background layer is mounted on the flipchart.
      const scenicWallpaperCount = await page.locator(".fc-final-background, img[alt='Fondo de página']").count();
      expect(scenicWallpaperCount).toBe(0);

      await page.screenshot({ path: path.join(OUT_DIR, `flipchart-${device.name}-initial.png`) });

      // Keyboard forward
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(320); // Mid-turn
      await page.screenshot({ path: path.join(OUT_DIR, `flipchart-${device.name}-mid-turn-keyboard.png`) });

      // Wait for flip layer animation to finish and unmount
      await page.locator("[data-testid='vertical-flip-layer']").waitFor({ state: "detached", timeout: 5000 });

      // Assert it went to the next page
      await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "10");

      // UI Backward
      const prevBtn = panel.getByRole("button", { name: "Lámina anterior", exact: true });
      await expect(prevBtn).toBeEnabled();
      await prevBtn.click();
      await page.locator("[data-testid='vertical-flip-layer']").waitFor({ state: "detached", timeout: 5000 });

      // Assert it went back to the previous page
      await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "9");
    }

    // Check errors
    expect(errors).toEqual([]);
  });

  test("Reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cartilla/presentar/7");

    const panel = page.getByTestId("flipchart-hd-panel");
    await expect(panel).toBeVisible({ timeout: 15000 });

    // Get current page
    const nativeBoard = page.getByTestId("flipchart-stage").getByTestId("flipchart-native-board");
    await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "9");

    const nextBtn = panel.getByRole("button", { name: "Lámina siguiente", exact: true });
    await nextBtn.click();

    // Reduced motion means turn should complete immediately or without transition
    // There shouldn't be a flip layer.
    await page.waitForTimeout(50);

    const flipWrapper = page.locator(".flipchart-flip-wrapper");
    await expect(flipWrapper).toHaveCount(0); // Assert absence of flip layer

    // Assert the navigation result (page went from 9 to 10)
    await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "10");

    await page.screenshot({ path: path.join(OUT_DIR, `flipchart-reduced-motion-turn.png`) });
  });
});
