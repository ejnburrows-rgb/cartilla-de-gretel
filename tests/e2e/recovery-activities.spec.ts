import { test, expect } from '@playwright/test';

test('picture selection grades a wrong attempt, retry, and independent completion', async ({ page }) => {
  await page.goto('/cartilla/leccion/1', { waitUntil: 'domcontentloaded' });
  const grid = page.locator('.fp-ix-grid').first();
  await expect(grid).toBeVisible();
  const wrong = grid.locator('.fp-ix-cell[data-gretel-correct="false"]:not(:disabled)').first();
  await wrong.click();
  await grid.getByRole('button', { name: 'Comprobar' }).click();
  await expect(grid.locator('.graded-wrong').first()).toBeVisible();
  await grid.getByRole('button', { name: 'Corregir respuestas' }).click();
  await wrong.click();
  const correct = grid.locator('.fp-ix-cell[data-gretel-correct="true"]:not(:disabled)');
  const count = await correct.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) await correct.nth(i).click();
  await grid.getByRole('button', { name: 'Comprobar' }).click();
  await expect(grid.getByRole('button', { name: 'Completado' })).toBeVisible();
});

test('real letter tracing completes and can reset', async ({ page }) => {
  await page.goto('/cartilla/leccion/7', { waitUntil: 'domcontentloaded' });
  const trace = page.locator('.fp-trace:visible').first();
  await expect(trace).toBeVisible();
  for (let i = 0; i < 70; i++) {
    const dot = trace.locator('.fp-trace__dot--active');
    if (await dot.count() === 0) break;
    await dot.click();
  }
  await expect(trace.getByText('¡Muy bien!')).toBeVisible();
  await trace.getByRole('button', { name: 'Reiniciar el trazo' }).click();
  await expect(trace.locator('.fp-trace__dot--active')).toHaveCount(1);
});

test('vowel choice responds to wrong and correct placement', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/cartilla/leccion/1', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('physical-book-reader').locator('.book-reader-controls button').last().click();
  await expect(page.getByTestId('physical-book-counter')).toContainText('Página 2');
  const row = page.locator('.fp-ix-pick__row:visible').first();
  await expect(row).toBeVisible();
  const letter = row.locator('.fp-ix-pick__letter');
  await letter.click();
  const wrong = row.locator('.fp-ix-cell--droppable[data-gretel-correct="false"]:not(:disabled)').first();
  await wrong.click();
  await expect(letter).not.toBeDisabled();
  const correct = row.locator('.fp-ix-cell--droppable[data-gretel-correct="true"]').first();
  await correct.click();
  await expect(correct).toHaveClass(/graded-correct/);
  await expect(letter).toBeDisabled();
});

test('drawing accepts a real stroke and completes', async ({ page }) => {
  await page.goto('/cartilla/leccion/7', { waitUntil: 'domcontentloaded' });
  const draw = page.locator('.am-dibuja:visible').first();
  await expect(draw).toBeVisible();
  await draw.getByRole('button', { name: 'Dibujar', exact: true }).click();
  const canvas = draw.locator('canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box!.width).toBeGreaterThan(40);
  await page.mouse.move(box!.x + 25, box!.y + 25);
  await page.mouse.down();
  await page.mouse.move(box!.x + 70, box!.y + 60, { steps: 16 });
  await page.mouse.up();
  await expect(draw.getByRole('button', { name: 'Listo' })).toBeEnabled();
  await draw.getByRole('button', { name: 'Listo' }).click();
  await expect(draw.getByText('¡Qué lindo dibujo!')).toBeVisible();
});

test('touch tap can place a vowel without dragging', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 }, baseURL: 'http://127.0.0.1:5173' });
  const page = await context.newPage();
  try {
    await page.goto('/cartilla/leccion/1', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('physical-book-reader').locator('.book-reader-controls button').last().tap();
    await expect(page.getByTestId('physical-book-counter')).toContainText('Página 2');
    const row = page.locator('.fp-ix-pick__row:visible').first();
    await row.locator('.fp-ix-pick__letter').tap();
    const correct = row.locator('.fp-ix-cell--droppable[data-gretel-correct="true"]').first();
    await correct.tap();
    await expect(correct).toHaveClass(/graded-correct/);
  } finally { await context.close(); }
});
