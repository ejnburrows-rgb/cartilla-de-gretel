import { test, expect } from "@playwright/test";
import * as path from "path";

// Output dir changed per review feedback: do not mutate tracked proofs.
const OUT_DIR = "test-results/flipchart-final-preflight/";

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

      // Check initial page state (lesson 7 starts on page 8 usually based on the test)
      const nativeBoard = page.getByTestId("flipchart-native-board");
      await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "8");

      // Top-bound physical page turn check
      await expect(panel).toHaveAttribute("data-page-turn-axis", "vertical");

      // Verify no default scenic wallpaper / scroll behavior visually
      await page.screenshot({ path: path.join(OUT_DIR, `flipchart-${device.name}-initial.png`) });

      // Keyboard forward
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(320); // Mid-turn
      await page.screenshot({ path: path.join(OUT_DIR, `flipchart-${device.name}-mid-turn-keyboard.png`) });
      await page.waitForTimeout(800); // Wait for turn to finish

      // Assert it went to the next page
      await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "9");

      // UI Backward
      const prevBtn = panel.getByRole("button", { name: /Lámina anterior/i });
      await expect(prevBtn).toBeEnabled();
      await prevBtn.click();
      await page.waitForTimeout(1000); // Wait for turn

      // Assert it went back to the previous page
      await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "8");
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
    const nativeBoard = page.getByTestId("flipchart-native-board");
    await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "8");

    const nextBtn = panel.getByRole("button", { name: /Lámina siguiente/i });
    await nextBtn.click();

    // Reduced motion means turn should complete immediately or without transition
    // There shouldn't be a flip layer.
    await page.waitForTimeout(50);

    const flipWrapper = page.locator(".flipchart-flip-wrapper");
    await expect(flipWrapper).toHaveCount(0); // Assert absence of flip layer

    // Assert the navigation result (page went from 8 to 9)
    await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "9");

    await page.screenshot({ path: path.join(OUT_DIR, `flipchart-reduced-motion-turn.png`) });
  });
});
