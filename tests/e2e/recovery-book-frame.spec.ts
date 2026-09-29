import { test, expect, type Page } from '@playwright/test';

async function dismissIntro(page: Page) {
  const start = page.getByRole('button', { name: 'Comenzar' });
  if (await start.isVisible().catch(() => false)) await start.click();
}

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`native reader frame and page turn ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/cartilla/leccion/8', { waitUntil: 'domcontentloaded' });
    await dismissIntro(page);

    const reader = page.locator('.native-lesson-viewer');
    const content = reader.locator('.native-lesson-viewer__content');
    const navigation = reader.locator('.native-lesson-viewer__navigation');
    const counter = reader.locator('.native-lesson-viewer__page');

    await expect(reader).toBeVisible();
    await expect(content).toBeVisible();
    await expect(navigation).toBeVisible();
    await expect(page.getByTestId('physical-book-reader')).toHaveCount(0);

    const gretel = page.getByTestId('gretel-presence');
    await expect(gretel).toHaveAttribute('data-page-ready', 'true');

    const geometry = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 2);

    const contentBox = await content.boundingBox();
    const navBox = await navigation.boundingBox();
    expect(contentBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect(navBox!.y).toBeGreaterThanOrEqual(contentBox!.y + contentBox!.height - 2);

    const companion = reader.locator('.native-lesson-viewer__companion');
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
    await reader.getByRole('button', { name: 'Siguiente' }).click();
    await expect(counter).not.toHaveText(before!, { timeout: 4000 });
    await expect(gretel).toHaveAttribute('data-page-ready', 'true', { timeout: 4000 });

    await reader.getByRole('button', { name: /Anterior/i }).click();
    await expect(counter).toHaveText(before!, { timeout: 4000 });
  });
}
