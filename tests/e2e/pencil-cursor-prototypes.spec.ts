import { test, expect, type Page } from "@playwright/test";

test.use({ video: "on" });

async function open(page: Page, lesson: number, mode: string) {
  await page.addInitScript(({ lesson }) => {
    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: undefined });
    Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: undefined });
    const resume = JSON.stringify({ lesson, page: 0 });
    localStorage.setItem(`cartilla.learner-resume.v1:${lesson}`, resume);
    localStorage.setItem("cartilla.learner-resume.v1", resume);
  }, { lesson });
  await page.goto(`/cartilla/leccion/${lesson}?cursor=${mode}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".native-lesson-viewer")).toBeVisible({ timeout: 30000 });
}
for (const device of [{name:"phone", width:390, height:844, touch:true}, {name:"desktop", width:1366, height:768, touch:false}]) {
  for (const mode of ["normal", "tip"]) {
    test.describe(`${device.name} ${mode}`, () => {
      test.use({ viewport: {width:device.width,height:device.height}, hasTouch:device.touch, isMobile:device.touch });
      test("real workbook X and wrong-answer eraser", async ({ page }, info) => {
        await open(page, 2, mode);
        await expect(page.locator('.fp-region--instruction')).toContainText(/Marca con una x/i);
        const cell = page.locator('.fp-ix-cell[data-gretel-correct="true"]').first();
        await cell.scrollIntoViewIfNeeded();
        const box = (await cell.boundingBox())!;
        if (!device.touch) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        if (mode === "tip" && !device.touch) {
          await expect(page.locator('.pencil-tip-cursor')).toHaveCSS('opacity', '1');
          await page.screenshot({ path: info.outputPath('cursor.png') });
        }
        if (device.touch) await cell.tap(); else await cell.click();
        const flight = page.locator('.workbook-pencil-flight');
        await expect(flight).toBeVisible();
        if (mode === 'tip') {
          await expect(flight.locator('.workbook-pencil__photo-tip')).toHaveCount(1);
          await expect(page.locator('.pencil-tip-cursor')).toHaveCSS('opacity', '0');
        } else {
          await expect(flight.locator('.workbook-pencil__shape')).toHaveCount(1);
          await expect(page.locator('.pencil-tip-cursor')).toHaveCount(0);
        }
        await page.waitForTimeout(1100);
        await page.screenshot({ path: info.outputPath('x-drawing.png') });
        await expect(flight).toHaveCount(0, {timeout:8000});
        await open(page, 1, mode);
        const wrong = page.locator('.fp-ix-cell[data-gretel-correct="false"]').first();
        if (device.touch) await wrong.tap(); else await wrong.click();
        await expect(page.locator('.workbook-pencil--eraser')).toBeVisible({timeout:8000});
        if (mode === 'tip') await expect(page.locator('.workbook-pencil__eraser-only')).toHaveCount(1);
        else await expect(page.locator('.workbook-pencil--eraser .workbook-pencil__shape')).toHaveCount(1);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: info.outputPath('wrong-eraser.png') });
        await expect(page.locator('.workbook-pencil-flight')).toHaveCount(0, {timeout:8000});
        await expect(wrong).toHaveAttribute('aria-pressed','false');
        if (mode === 'tip') {
          await page.evaluate(() => document.documentElement.classList.add('a11y-contrast'));
          await expect(page.locator('.pencil-tip-cursor')).toHaveCount(0);
        }
      });
    });
  }
}
