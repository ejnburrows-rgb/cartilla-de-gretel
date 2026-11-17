import { expect, test } from "@playwright/test";

test.use({ video: "on" });

for (const device of [
  { name: "phone", width: 390, height: 844, touch: true },
  { name: "desktop", width: 1366, height: 768, touch: false },
]) {
  test.describe(`${device.name}: hd uncropped cursor & eraser`, () => {
    test.use({
      viewport: { width: device.width, height: device.height },
      hasTouch: device.touch,
      isMobile: device.touch,
    });

    test("uncropped HD pencil cursor draws wrong answer, full HD eraser + 12 crumbs rub it out", async ({
      page,
    }, info) => {
      await page.goto("/cartilla/leccion/3?cursor=contract", {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 30000 });

      const cursor = page.locator('[data-testid="contract-pencil-cursor"]');
      if (!device.touch) {
        const stage = page.locator(".native-lesson-viewer__content");
        const sb = (await stage.boundingBox())!;
        await page.mouse.move(sb.x + sb.width * 0.25, sb.y + sb.height * 0.25);
        await expect(cursor).toHaveAttribute("data-visible", "true", { timeout: 10000 });
        await expect(cursor).toHaveAttribute("data-pencil-pose", "hd-tip");
        const img = cursor.locator("img");
        const dims = await img.evaluate((el: HTMLImageElement) => ({
          naturalWidth: el.naturalWidth,
          naturalHeight: el.naturalHeight,
          src: el.getAttribute("src"),
        }));
        expect(dims.src).toBe("/cartilla/images/ui/owner-pencil-tip.svg");
        expect(dims.naturalWidth).toBe(388);
        expect(dims.naturalHeight).toBe(322);
      }

      const wrong = page.locator('.fp-ix-cell[data-gretel-correct="false"]').first();
      await wrong.scrollIntoViewIfNeeded();
      if (device.touch) await wrong.tap();
      else await wrong.click();

      await expect(cursor).toHaveAttribute("data-visible", "true", { timeout: 10000 });
      await page.waitForTimeout(450);
      const imgBox = await cursor.locator("img").boundingBox();
      expect(imgBox).not.toBeNull();
      expect(imgBox!.width).toBeGreaterThanOrEqual(150);
      expect(imgBox!.x).toBeGreaterThanOrEqual(0);
      expect(imgBox!.y).toBeGreaterThanOrEqual(0);
      if (!device.touch) {
        expect(imgBox!.x + imgBox!.width).toBeLessThanOrEqual(device.width);
        expect(imgBox!.y + imgBox!.height).toBeLessThanOrEqual(device.height);
      }
      await page.screenshot({ path: info.outputPath("whole-pencil.png") });

      // Full HD uncropped eraser appears (no eraser-mask fade) with 12 pink crumbs
      const eraser = page.locator(".workbook-pencil--eraser .workbook-pencil__eraser-hd");
      await expect(eraser).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[id$="-eraser-mask"]')).toHaveCount(0);
      await expect(page.locator(".workbook-pencil__crumbs > g")).toHaveCount(12);
      await page.screenshot({ path: info.outputPath("hd-eraser.png") });

      await expect(wrong).toHaveAttribute("aria-pressed", "false", { timeout: 12000 });
    });
  });
}
