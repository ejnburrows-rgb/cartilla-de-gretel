import { test, expect, type Page } from "@playwright/test";
import { seedCompletedPages } from "./support/completion";

async function dismissIntro(page: Page) {
  const start = page.getByRole("button", { name: "Comenzar" });
  if (await start.isVisible().catch(() => false)) await start.click();
}

for (const viewport of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`native reader frame and page turn ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    // Page 23 is finished so "Siguiente" is open; the gate is covered elsewhere.
    await seedCompletedPages(page, [23]);
    await page.goto("/cartilla/leccion/8", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);

    const reader = page.locator(".native-lesson-viewer");
    const content = reader.locator(".native-lesson-viewer__content");
    const navigation = reader.locator(".native-lesson-viewer__navigation");
    const counter = reader.locator(".native-lesson-viewer__page");

    await expect(reader).toBeVisible();
    await expect(content).toBeVisible();
    await expect(navigation).toBeVisible();
    await expect(page.getByTestId("physical-book-reader")).toHaveCount(0);

    // Lesson pages carry no Gretel side column or picture (owner direction
    // 2026-10-07 / #739), so the frame is the page plus navigation only.
    await expect(page.getByTestId("gretel-presence")).toHaveCount(0);

    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 2);

    const contentBox = await content.boundingBox();
    const navBox = await navigation.boundingBox();
    expect(contentBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    // The page arrows sit below or beside the page (laptop fit) or float over it
    // on phones; once scrolled to the end they must not hide any page control.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const hidden = await page.evaluate(() => {
      const controls = [
        ...document.querySelectorAll<HTMLElement>(
          ".native-lesson-viewer__content button, .native-lesson-viewer__content canvas, .native-lesson-viewer__content textarea",
        ),
      ];
      return [
        ...document.querySelectorAll<HTMLElement>(".native-lesson-viewer__navigation button"),
      ].flatMap((button) => {
        const b = button.getBoundingClientRect();
        if (!b.width) return [];
        return controls
          .filter((el) => {
            const q = el.getBoundingClientRect();
            return (
              q.width > 0 &&
              q.x < b.right - 2 &&
              q.right > b.x + 2 &&
              q.y < b.bottom - 2 &&
              q.bottom > b.y + 2
            );
          })
          .map((el) => el.getAttribute("aria-label") || el.textContent?.trim() || el.tagName);
      });
    });
    expect(hidden, "page controls hidden under the page arrows").toEqual([]);

    const companion = reader.locator(".native-lesson-viewer__companion");
    if (await companion.count()) {
      const companionBox = await companion.boundingBox();
      if (companionBox) {
        expect(companionBox.y).toBeGreaterThanOrEqual(contentBox!.y + contentBox!.height - 2);
      }
    }

    await page.screenshot({
      path: `test-results/native-reader-frame-${viewport.name}.png`,
      fullPage: true,
    });

    const before = await counter.textContent();
    await reader.getByRole("button", { name: "Siguiente" }).click();
    await expect(counter).not.toHaveText(before!, { timeout: 6000 });

    await reader.getByTestId("button-prev").click();
    await expect(counter).toHaveText(before!, { timeout: 6000 });
  });
}
