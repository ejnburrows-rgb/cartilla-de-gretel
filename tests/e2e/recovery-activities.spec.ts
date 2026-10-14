import { test, expect, type Page } from '@playwright/test';
import { seedCompletedPages } from './support/completion';

async function dismissIntro(page: Page) {
  const start = page.getByRole('button', { name: 'Comenzar' });
  if (await start.isVisible().catch(() => false)) await start.click();
}

async function goToSecondNativePage(page: Page) {
  const reader = page.locator('.native-lesson-viewer');
  await expect(reader).toBeVisible();
  const counter = reader.locator('.native-lesson-viewer__page');
  await reader.getByRole('button', { name: 'Siguiente' }).click();
  await expect(counter).toContainText('Página 2', { timeout: 6000 });
}


test('picture selection grades a wrong attempt, retry, and independent completion', async ({ page }) => {
  // Each tap is graded at once: a wrong picture gets a pencil mark that is
  // erased (no answer revealed), a right picture keeps its circle. There is
  // no separate "Comprobar" step any more.
  test.setTimeout(90_000);
  await page.goto('/cartilla/leccion/1', { waitUntil: 'domcontentloaded' });
  await dismissIntro(page);
  const viewer = page.locator('.native-lesson-viewer');
  const grid = page.locator('.fp-ix-grid').first();
  await expect(grid).toBeVisible();
  await expect(grid.getByRole('button', { name: 'Comprobar' })).toHaveCount(0);
  const wrong = grid.locator('.fp-ix-cell[data-gretel-correct="false"]').first();
  await wrong.click();
  await expect(wrong.locator('[data-mark-status]')).toHaveCount(1);
  await expect(wrong.locator('[data-mark-status]')).toHaveCount(0, { timeout: 12_000 });
  await expect(wrong).toBeEnabled();
  await expect(grid.locator('.graded-wrong')).toHaveCount(0);
  await expect(viewer.getByRole('button', { name: 'Siguiente' })).toHaveAttribute('aria-disabled', 'true');
  const correct = grid.locator('.fp-ix-cell[data-gretel-correct="true"]');
  const count = await correct.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await correct.nth(i).click();
    await expect(correct.nth(i).locator('[data-mark-status="correct"]')).toHaveCount(1, { timeout: 8000 });
  }
  await expect(viewer.getByRole('button', { name: 'Siguiente' })).not.toHaveAttribute('aria-disabled', 'true');
});

test('real letter tracing completes and can reset', async ({ page }) => {
  await page.goto('/cartilla/leccion/7', { waitUntil: 'domcontentloaded' });
  await dismissIntro(page);
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
  // Page 2: circle the picture that starts with the row's vowel. Every tap is
  // graded at once; a wrong picture's pencil mark is erased, the right one stays.
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await seedCompletedPages(page, [1]);
  await page.goto('/cartilla/leccion/1', { waitUntil: 'domcontentloaded' });
  await dismissIntro(page);
  await goToSecondNativePage(page);
  const row = page.locator('.fp-ix-pick__row:visible').first();
  await expect(row.locator('.fp-ix-pick__letter')).toHaveText('Aa');
  const wrong = row.locator('.fp-ix-cell').filter({ hasNot: page.locator('[data-picture-name^="a"]') }).first();
  await wrong.click();
  await expect(wrong.locator('[data-mark-status]')).toHaveCount(1);
  await expect(wrong.locator('[data-mark-status]')).toHaveCount(0, { timeout: 12_000 });
  await expect(row.locator('.graded-correct')).toHaveCount(0);
  const correct = row.getByRole('button', { name: 'anillo', exact: true });
  await correct.click();
  await expect(correct).toHaveClass(/graded-correct/, { timeout: 8000 });
  await expect(correct).toBeDisabled();
});

test('drawing accepts a real stroke and completes', async ({ page }) => {
  await page.goto('/cartilla/leccion/7', { waitUntil: 'domcontentloaded' });
  await dismissIntro(page);
  const draw = page.locator('.am-dibuja:visible').first();
  await expect(draw).toBeVisible();
  // The Dibujar/Elegir toggle only appears when there are drawings to choose from.
  const drawMode = draw.getByRole('button', { name: 'Dibujar', exact: true });
  if (await drawMode.count()) await drawMode.click();
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

test('touch tap can circle the vowel picture without dragging', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 }, baseURL: 'http://127.0.0.1:5173' });
  const page = await context.newPage();
  try {
    await seedCompletedPages(page, [1]);
    await page.goto('/cartilla/leccion/1', { waitUntil: 'domcontentloaded' });
    await dismissIntro(page);
    const reader = page.locator('.native-lesson-viewer');
    await expect(reader).toBeVisible();
    await reader.getByRole('button', { name: 'Siguiente' }).tap();
    await expect(reader.locator('.native-lesson-viewer__page')).toContainText('Página 2', { timeout: 6000 });
    const row = page.locator('.fp-ix-pick__row:visible').first();
    const correct = row.getByRole('button', { name: 'anillo', exact: true });
    await correct.tap();
    await expect(correct).toHaveClass(/graded-correct/, { timeout: 8000 });
  } finally { await context.close(); }
});
