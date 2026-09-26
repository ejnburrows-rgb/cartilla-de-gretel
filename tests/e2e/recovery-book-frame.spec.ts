import { test, expect } from '@playwright/test';

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`reader frame and page turn ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/cartilla/leccion/7', { waitUntil: 'domcontentloaded' });
    const reader = page.getByTestId('physical-book-reader');
    const surround = page.locator('.garden-scene');
    await expect(reader).toBeVisible();
    await expect(reader.getByTestId('gretel-presence')).toHaveAttribute('data-page-ready', 'true');
    expect(await surround.evaluate(el => getComputedStyle(el).borderWidth)).toBe('0px');
    expect(await surround.evaluate(el => getComputedStyle(el).backgroundImage)).toBe('none');
    await expect(surround.locator('.garden-butterfly, .garden-dragonfly')).toHaveCount(0);
    const pageArt = reader.locator('.faithful-page--garden').first();
    expect(await pageArt.evaluate(el => getComputedStyle(el).backgroundImage)).toBe('none');
    expect(await pageArt.evaluate(el => getComputedStyle(el, '::before').content)).toBe('none');
    const bubble = reader.locator('.gretel-presence--book .gretel-speech-bubble');
    await expect(bubble).toBeVisible({ timeout: 2000 });
    if (await bubble.isVisible()) {
      const paper = await reader.getByTestId('physical-book-stage').boundingBox();
      const speech = await bubble.boundingBox();
      expect(speech!.y).toBeGreaterThanOrEqual(paper!.y + paper!.height);
      expect(speech!.x).toBeGreaterThanOrEqual(8);
      expect(speech!.x + speech!.width).toBeLessThanOrEqual(viewport.width - 8);
    }
    const stageBox = await reader.getByTestId('physical-book-stage').boundingBox();
    const navBox = await page.locator('nav').last().boundingBox();
    expect(navBox!.y).toBeGreaterThanOrEqual(stageBox!.y + stageBox!.height);
    await page.screenshot({ path: `test-results/recovery-frame-${viewport.name}.png`, fullPage: true });
    const counter = reader.getByTestId('physical-book-counter');
    const before = await counter.textContent();
    await reader.locator('.book-reader-controls button').last().click();
    await expect(counter).not.toHaveText(before!, { timeout: 4000 });
    await expect(reader.getByTestId('gretel-presence')).toHaveAttribute('data-page-ready', 'true', { timeout: 4000 });
    await reader.locator('.book-reader-controls button').first().click();
    await expect(counter).toHaveText(before!, { timeout: 4000 });
  });
}
