import { test, expect } from "@playwright/test";

for (const { lesson, printedPage, width = 390, height = 844 } of [
  { lesson: 17, printedPage: 59 },
  { lesson: 20, printedPage: 71 },
  { lesson: 20, printedPage: 71, width: 375, height: 844 },
  { lesson: 17, printedPage: 59, width: 844, height: 390 },
]) {
  test(`phone drawing tools stay visible and touch-sized on lesson ${lesson}, page ${printedPage} at ${width}x${height}`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width, height },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    try {
      await page.goto(`/cartilla/leccion/${lesson}`, { waitUntil: "domcontentloaded" });
      await page.evaluate((l) => {
        localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([l]));
        localStorage.setItem("cartilla:completed-lessons", JSON.stringify([l]));
        window.dispatchEvent(new Event("cartilla:lesson-progress"));
      }, lesson);
      await page.reload({ waitUntil: "domcontentloaded" });
      const viewer = page.locator(".native-lesson-viewer");
      await expect(viewer).toBeVisible({ timeout: 15000 });
      await expect(viewer).toHaveAttribute("data-native-page", String(printedPage));

      const toolbars = page.locator(".faithful-page__body .am-dibuja__toolbar");
      await expect(toolbars.first()).toBeVisible();
      const count = await toolbars.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i += 1) {
        const toolbar = toolbars.nth(i);
        const controls = toolbar.locator("button");
        await expect(toolbar).toHaveCSS("flex-wrap", "wrap");
        for (let j = 0; j < await controls.count(); j += 1) {
          const button = controls.nth(j);
          await button.scrollIntoViewIfNeeded();
          const box = await button.boundingBox();
          const pageBox = await page.locator(".faithful-page").boundingBox();
          expect(box, "Every drawing button has a visible bounding box").not.toBeNull();
          expect(pageBox).not.toBeNull();
          expect(box!.width, "Touch width should not be a miniature 26px control").toBeGreaterThanOrEqual(40);
          expect(box!.height, "Touch height should not be a miniature 26px control").toBeGreaterThanOrEqual(40);
          expect(box!.x).toBeGreaterThanOrEqual(pageBox!.x - 1);
          expect(box!.x + box!.width).toBeLessThanOrEqual(pageBox!.x + pageBox!.width + 1);
        }
      }
    } finally {
      await context.close();
    }
  });
}
