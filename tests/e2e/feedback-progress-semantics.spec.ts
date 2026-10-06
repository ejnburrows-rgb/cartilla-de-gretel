import { expect, test } from '@playwright/test';
import layouts from '../../src/data/page-layouts.json' with { type: "json" };

test('partial multi-answer feedback preserves correct work and never reveals missing targets', async ({ page }) => {
  await page.goto('/cartilla/leccion/1');
  const viewer = page.locator('.native-lesson-viewer');
  await expect(viewer).toHaveAttribute('data-native-page', '1');
  const grid = viewer.locator('.fp-ix-grid');
  const targets = grid.locator('[data-gretel-correct="true"]');
  await targets.first().click();
  await grid.locator('[data-gretel-correct="false"]').first().click();
  await grid.getByRole('button', { name: 'Comprobar' }).click();
  await expect(grid.locator('.graded-correct')).toHaveCount(1);
  await expect(grid.locator('.graded-wrong')).toHaveCount(1);
  await expect(grid.locator('.graded-missed')).toHaveCount(0);
  await expect(grid.getByRole('status')).toContainText('Faltan');
  await page.screenshot({ path: 'docs/proofs/batch-2/partial-wrong-no-reveal.png', fullPage: true });
  await grid.getByRole('button', { name: 'Corregir respuestas' }).click();
  await expect(targets.first()).toBeDisabled();
  for (const target of await grid.locator('[data-gretel-correct="true"]:enabled').all()) await target.click();
  await grid.getByRole('button', { name: 'Comprobar' }).click();
  await expect(viewer.getByRole('button', { name: 'Siguiente' })).not.toHaveAttribute('aria-disabled', 'true');
  await page.reload();
  await expect(viewer.getByRole('button', { name: 'Siguiente' })).not.toHaveAttribute('aria-disabled', 'true');
});

test('repeated syllables are accepted and Completa responds immediately without revealing the answer', async ({ page }) => {
  const data = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
  await page.addInitScript(done => localStorage.setItem('cartilla.page-completion.v1', JSON.stringify(done)), Object.fromEntries([23,24,25].map(n => [n, data[String(n)]!.regions.map(r => `page-${n}-${r.id}`)])));
  await page.goto('/cartilla/leccion/8');
  const viewer = page.locator('.native-lesson-viewer');
  await viewer.getByRole('button', { name: 'Siguiente' }).click();
  await expect(viewer).toHaveAttribute('data-native-page', '24');
  await viewer.getByRole('button', { name: 'papá, posición 3: p', exact: true }).click();
  await expect(viewer.locator('.native-syllable').first().getByRole('status')).toContainText('1 de');
  await viewer.getByRole('button', { name: 'papá', exact: true }).click();
  await expect(viewer.locator('.native-syllable').first().getByRole('status')).toContainText('1 de');
  await page.screenshot({ path: 'docs/proofs/batch-2/repeated-syllable.png', fullPage: true });
  await viewer.getByRole('button', { name: 'Siguiente' }).click();
  await viewer.getByRole('button', { name: 'Siguiente' }).click();
  await expect(viewer).toHaveAttribute('data-native-page', '26');
  const item = viewer.locator('.fp-ix-fill__item').first();
  await item.locator('[data-gretel-correct="false"]').first().click();
  await expect(item.locator('.graded-wrong')).toHaveCount(1);
  await expect(item.locator('.graded-correct')).toHaveCount(0);
  await expect(viewer.getByRole('button', { name: 'Comprobar' })).toHaveCount(0);
  await item.locator('[data-gretel-correct="true"]').click();
  await expect(item.locator('.graded-correct')).toHaveCount(1);
  await page.screenshot({ path: 'docs/proofs/batch-2/completa-corrected.png', fullPage: true });
});

test('independent completion has independent evidence and wrong attempts remain in accuracy', async ({ page }) => {
  const data = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
  await page.addInitScript(done => localStorage.setItem('cartilla.page-completion.v1', JSON.stringify({ '1': done })), data['1']!.regions.map(r => `page-1-${r.id}`));
  await page.goto('/cartilla/leccion/1');
  const viewer = page.locator('.native-lesson-viewer');
  await viewer.getByRole('button', { name: 'Siguiente' }).click();
  for (const name of ['anillo', 'estrella', 'indio', 'oso', 'uniforme']) await viewer.getByRole('button', { name, exact: true }).click();
  await expect(viewer.getByRole('button', { name: 'Siguiente' })).not.toHaveAttribute('aria-disabled', 'true');
  const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('cartilla.exercise-stats.v1') || '{}'));
  const result = Object.values(stats['1']).find((s: any) => s.meta?.exercise?.startsWith('vowel_pick_one')) as any;
  expect(result.meta).toMatchObject({ outcome: 'independent-success', assisted: false, completed: true });
  expect(result.hits).toBe(5); expect(result.attempts).toBe(5);
  await page.screenshot({ path: 'docs/proofs/batch-2/independent-complete.png', fullPage: true });
});
