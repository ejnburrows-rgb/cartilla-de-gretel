import { test, expect } from "@playwright/test";

// Owner decision 2026-10-05: the whole Workbook page fits a laptop screen
// without scrolling — no window scroll, no scroll inside the page, every
// picture fully on screen.
const SCREENS: Array<[w: number, h: number]> = [
  [1366, 768],
  [1280, 800],
  [1440, 900],
  [1180, 820],
  [820, 1180],
];

for (const [width, height] of SCREENS) {
  test(`Workbook page 1 fits ${width}x${height} without scrolling`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/cartilla/leccion/1");
    const cells = page.locator(".native-lesson-viewer[data-native-page='1'] .fp-ix-cell");
    await expect(cells).toHaveCount(20);
    const fit = await page.evaluate(() => {
      const body = document.querySelector<HTMLElement>(".faithful-page__body")!;
      const cellBoxes = [...document.querySelectorAll(".fp-ix-cell")].map((cell) =>
        cell.getBoundingClientRect(),
      );
      return {
        windowOverflow: document.documentElement.scrollHeight - window.innerHeight,
        pageOverflow: body.scrollHeight - body.clientHeight,
        lowestCell: Math.max(...cellBoxes.map((box) => box.bottom)),
        bodyBottom: body.getBoundingClientRect().bottom,
        viewport: window.innerHeight,
      };
    });
    expect(fit.windowOverflow, "window scroll").toBeLessThanOrEqual(0);
    expect(fit.pageOverflow, "scroll inside the page").toBeLessThanOrEqual(0);
    expect(fit.lowestCell).toBeLessThanOrEqual(fit.bodyBottom + 0.5);
    expect(fit.lowestCell).toBeLessThanOrEqual(fit.viewport);
  });
}
