import { test, expect, type Page } from '@playwright/test';
async function emit(page: Page, type: string, detail: Record<string, unknown> = {}) {
  await page.evaluate(({ type, detail }) => window.dispatchEvent(new CustomEvent('gretel:bus', { detail: { type, ...detail } })), { type, detail });
}
for (const viewport of [{ width: 1280, height: 900 }, { width: 820, height: 1180 }, { width: 390, height: 844 }]) {
  test(`Gretel interaction policy and safe placement ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/cartilla/leccion/7', { waitUntil: 'domcontentloaded' });
    const guide = page.getByTestId('gretel-presence');
    await expect(guide).toHaveAttribute('data-page-ready', 'true');
    const region = page.locator('.gretel-activity').filter({ has: page.locator('.fp-trace') }).first();
    const id = await region.getAttribute('data-gretel-activity');
    await emit(page, 'activity:focus', { activityId: id, pageNumber: 19, kind: 'writing-line' });
    await expect(guide).toHaveAttribute('data-focused', 'true');
    await expect(guide.getByTestId('gretel-live-avatar')).toHaveAttribute('data-paused', 'true');
    await emit(page, 'answer:wrong', { activityId: id });
    await expect(guide).toHaveAttribute('data-reaction', 'cue');
    await emit(page, 'answer:wrong', { activityId: id });
    await expect(guide).toHaveAttribute('data-reaction', 'hint');
    await expect(region.locator('[data-gretel-highlight]')).toHaveCount(1);
    await emit(page, 'answer:wrong', { activityId: id });
    await expect(guide).toHaveAttribute('data-reaction', 'demonstration');
    await emit(page, 'answer:correct', { activityId: id });
    await emit(page, 'activity:complete', { activityId: id });
    await expect(guide).toHaveAttribute('data-reaction', 'independent-retry');
    await expect(region.locator('[data-gretel-highlight]')).toHaveCount(0);
    await page.waitForTimeout(1700); // documented independent-attempt reset hold
    await emit(page, 'answer:correct', { activityId: id });
    await emit(page, 'activity:complete', { activityId: id });
    await expect(guide).toHaveAttribute('data-reaction', 'mastery');
    const paper = await page.locator('.native-lesson-viewer__content').boundingBox();
    const mascot = await guide.boundingBox();
    expect(mascot!.y).toBeGreaterThanOrEqual(paper!.y + paper!.height);
    const avatarImage = guide.locator('img[alt="Gretel"]');
    await expect(avatarImage).toBeVisible();
    await expect.poll(() => avatarImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 1)).toBe(true);
    await expect.poll(() => avatarImage.evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThan(50);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `test-results/gretel-${viewport.width}.png`, fullPage: true });
    const counter = page.locator('.native-lesson-viewer__page');
    const before = await counter.textContent();
    await page.locator('.native-lesson-viewer__navigation').getByRole('button', { name: 'Siguiente' }).click();
    await expect(guide).toHaveAttribute('data-page-ready', 'false');
    await expect(counter).not.toHaveText(before!);
    await expect(guide).toHaveAttribute('data-page-ready', 'true');
  });
}
test('reduced motion keeps help functional', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/cartilla/leccion/3', { waitUntil: 'domcontentloaded' });
  const guide = page.getByTestId('gretel-presence');
  await expect(guide).toHaveAttribute('data-page-ready', 'true');
  await emit(page, 'activity:focus', { activityId: 'reduced-test', pageNumber: 7, kind: 'writing-line' });
  await guide.getByRole('button', { name: 'Ayuda', exact: true }).click();
  await expect(guide).toHaveAttribute('data-reaction', 'hint');
  await expect(guide.getByTestId('gretel-live-avatar')).toHaveAttribute('data-reduced-motion', 'true');
});

test('real tracing activates context; idle help is restrained', async ({ page }) => {
  await page.clock.install();
  await page.goto('/cartilla/leccion/7', { waitUntil: 'domcontentloaded' });
  const guide = page.getByTestId('gretel-presence');
  await expect(guide).toHaveAttribute('data-page-ready', 'true');
  const trace = page.locator('.native-lesson-viewer .fp-trace').first();
  await trace.locator('.fp-trace__dot--active').click();
  await expect(guide).toHaveAttribute('data-activity-id', /page-19-/);
  await expect(guide).toHaveAttribute('data-focused', 'true');
  await page.clock.fastForward(50000);
  await expect(guide).toHaveAttribute('data-reaction', 'inactivity');
  await guide.getByRole('button', { name: 'Ayuda', exact: true }).click();
  await expect(guide).toHaveAttribute('data-reaction', 'hint');
  await expect(trace.locator('[data-gretel-highlight]')).toHaveCount(1);
});


for (const viewport of [{ width: 1280, height: 900 }, { width: 820, height: 1180 }, { width: 390, height: 844 }]) {
  test(`lesson-journey Gretel never covers lesson cards ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/cartilla/lecciones', { waitUntil: 'domcontentloaded' });

    const guide = page.getByTestId('book-hero-gretel');
    await expect(guide).toBeVisible();
    const guideBox = await guide.boundingBox();
    expect(guideBox).not.toBeNull();

    const cards = page.locator('main a[aria-label^="Lección"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const cardBox = await cards.nth(index).boundingBox();
      if (!cardBox || !guideBox) continue;
      const overlaps =
        guideBox.x < cardBox.x + cardBox.width &&
        guideBox.x + guideBox.width > cardBox.x &&
        guideBox.y < cardBox.y + cardBox.height &&
        guideBox.y + guideBox.height > cardBox.y;
      expect(overlaps, `Gretel overlaps lesson card ${index + 1} at ${viewport.width}px`).toBe(false);
    }

    await page.screenshot({
      path: `test-results/journey-gretel-${viewport.width}.png`,
      fullPage: true,
    });
  });
}
