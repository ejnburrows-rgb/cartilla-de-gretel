import { expect, test } from "@playwright/test";

test.use({ video: "on" });

// Exploratory cursor poses only. This does not verify the eraser, page turns,
// other activities, the fixed-angle requirement, or a physical phone.
for (const device of [
  { name: "phone", width: 390, height: 844, touch: true },
  { name: "desktop", width: 1366, height: 768, touch: false },
]) {
  for (const pose of ["up", "down"]) {
    test.describe(`${device.name}: ${pose}`, () => {
      test.use({
        viewport: { width: device.width, height: device.height },
        hasTouch: device.touch,
        isMobile: device.touch,
      });
      test("whole pencil appears while drawing a wrong answer and answer resets", async ({
        page,
      }, info) => {
        await page.goto(`/cartilla/leccion/3?cursor=contract&pencil=${pose}`, {
          waitUntil: "domcontentloaded",
        });
        await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 30000 });
        const wrong = page.locator('.fp-ix-cell[data-gretel-correct="false"]').first();
        await wrong.scrollIntoViewIfNeeded();
        if (device.touch) await wrong.tap();
        else await wrong.click();
        const cursor = page.locator(
          `.contract-pencil-cursor[data-pencil-pose="${pose}"][data-visible="true"]`,
        );
        await expect(cursor).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(500);
        const shape = cursor.locator(".workbook-pencil__shape");
        await expect(shape).toHaveCount(1);
        const box = await shape.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.y).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(device.width);
        expect(box!.y + box!.height).toBeLessThanOrEqual(device.height);
        await page.screenshot({ path: info.outputPath("whole-pencil.png") });
        await expect(wrong).toHaveAttribute("aria-pressed", "false", { timeout: 12000 });
      });
    });
  }
}
