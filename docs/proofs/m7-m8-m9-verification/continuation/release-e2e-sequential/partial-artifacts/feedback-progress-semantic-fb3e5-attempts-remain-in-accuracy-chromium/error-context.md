# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: feedback-progress-semantics.spec.ts >> independent completion has independent evidence and wrong attempts remain in accuracy
- Location: tests\e2e\feedback-progress-semantics.spec.ts:88:1

# Error details

```
Error: locator.click: Target crashed 
Call log:
  - waiting for locator('.native-lesson-viewer').getByRole('button', { name: 'Siguiente' })

```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import layouts from '../../src/data/page-layouts.json' with { type: "json" };
  3   | 
  4   | test('page 1 pencil feedback preserves correct work, erases wrong marks, and restores completion', async ({ page }) => {
  5   |   await page.emulateMedia({ reducedMotion: 'reduce' });
  6   |   await page.goto('/cartilla/leccion/1');
  7   |   const viewer = page.locator('.native-lesson-viewer');
  8   |   await expect(viewer).toHaveAttribute('data-native-page', '1');
  9   | 
  10  |   const grid = viewer.locator('.fp-ix-grid');
  11  |   const correctTargets = grid.locator('[data-gretel-correct="true"]');
  12  |   const wrong = grid.locator('[data-gretel-correct="false"]').first();
  13  |   const correctCount = await correctTargets.count();
  14  |   expect(correctCount).toBeGreaterThan(0);
  15  |   await expect(grid.getByRole('button', { name: 'Comprobar' })).toHaveCount(0);
  16  | 
  17  |   const firstCorrect = correctTargets.first();
  18  |   await firstCorrect.click();
  19  |   await expect(firstCorrect.locator('[data-mark-status="correct"]')).toHaveCount(1, { timeout: 4000 });
  20  |   await expect(firstCorrect).toBeDisabled();
  21  | 
  22  |   // Under reduced motion the eraser step lasts only ~60 ms, so record every mark
  23  |   // status the wrong answer passes through instead of polling for that instant.
  24  |   await wrong.evaluate((el) => {
  25  |     const seen: string[] = ((window as any).__wrongMarkStatuses = []);
  26  |     const record = () => el.querySelectorAll('[data-mark-status]').forEach((m) => seen.push(m.getAttribute('data-mark-status') || ''));
  27  |     new MutationObserver(record).observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-mark-status'] });
  28  |   });
  29  |   await wrong.click();
  30  |   await expect.poll(() => page.evaluate(() => (window as any).__wrongMarkStatuses as string[]), { timeout: 8000 }).toContain('erasing');
  31  |   await expect(wrong.locator('.workbook-pencil-mark-container')).toHaveCount(0, { timeout: 1500 });
  32  |   await expect(wrong).toBeEnabled();
  33  |   await expect(grid.locator('.graded-wrong')).toHaveCount(0);
  34  | 
  35  |   await page.screenshot({ path: 'docs/proofs/batch-2/p1-pencil-retry-no-reveal.png', fullPage: true });
  36  | 
  37  |   for (let i = 1; i < correctCount; i++) {
  38  |     const target = correctTargets.nth(i);
  39  |     await target.click();
  40  |     await expect(target.locator('[data-mark-status="correct"]')).toHaveCount(1, { timeout: 4000 });
  41  |   }
  42  | 
  43  |   const next = viewer.getByRole('button', { name: 'Siguiente' });
  44  |   await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  45  |   await page.reload();
  46  |   await expect(viewer).toHaveAttribute('data-native-page', '1');
  47  |   await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  48  |   await expect(viewer.locator('[data-mark-status="correct"]')).toHaveCount(correctCount);
  49  | });
  50  | 
  51  | test('repeated syllables are accepted and Completa responds immediately without revealing the answer', async ({ page }) => {
  52  |   const data = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
  53  |   await page.addInitScript(done => localStorage.setItem('cartilla.page-completion.v1', JSON.stringify(done)), Object.fromEntries([23,24,25].map(n => [n, data[String(n)]!.regions.map(r => `page-${n}-${r.id}`)])));
  54  |   await page.goto('/cartilla/leccion/8');
  55  |   const viewer = page.locator('.native-lesson-viewer');
  56  |   await viewer.getByRole('button', { name: 'Siguiente' }).click();
  57  |   await expect(viewer).toHaveAttribute('data-native-page', '24', { timeout: 6000 });
  58  |   const paRow = viewer.locator('.native-syllable').first();
  59  |   // "papá" holds the syllable "pa" twice; it still counts as one right word.
  60  |   await paRow.getByRole('button', { name: 'papá', exact: true }).click();
  61  |   await expect(paRow.getByRole('status')).toContainText('1 de');
  62  |   await paRow.getByRole('button', { name: 'papá', exact: true }).click();
  63  |   await expect(paRow.getByRole('status')).not.toContainText('2 de');
  64  |   await page.screenshot({ path: 'docs/proofs/batch-2/repeated-syllable.png', fullPage: true });
  65  |   // The probe above changed live work on page 24; reload so the seeded finished
  66  |   // pages apply again and the walk continues to the fill-in page.
  67  |   await page.goto('/cartilla/leccion/8');
  68  |   if (await viewer.getAttribute('data-native-page') === '23') {
  69  |     await viewer.getByRole('button', { name: 'Siguiente' }).click();
  70  |     await expect(viewer).toHaveAttribute('data-native-page', '24', { timeout: 6000 });
  71  |   }
  72  |   await viewer.getByRole('button', { name: 'Siguiente' }).click();
  73  |   await expect(viewer).toHaveAttribute('data-native-page', '25', { timeout: 6000 });
  74  |   await viewer.getByRole('button', { name: 'Siguiente' }).click();
  75  |   await expect(viewer).toHaveAttribute('data-native-page', '26', { timeout: 8000 });
  76  |   const item = viewer.locator('.fp-ix-fill__item').first();
  77  |   // papá = pa + pá: "pa" is the wrong choice for the blank, "pá" the right one.
  78  |   // A wrong choice is marked for retry right away and never reveals the answer.
  79  |   await item.getByRole('button', { name: 'pa', exact: true }).click();
  80  |   await expect(item.locator('.is-retry')).toHaveCount(1);
  81  |   await expect(item.locator('.graded-correct')).toHaveCount(0);
  82  |   await expect(viewer.getByRole('button', { name: 'Comprobar' })).toHaveCount(0);
  83  |   await item.getByRole('button', { name: 'pá', exact: true }).click();
  84  |   await expect(item.locator('.graded-correct')).toHaveCount(1);
  85  |   await page.screenshot({ path: 'docs/proofs/batch-2/completa-corrected.png', fullPage: true });
  86  | });
  87  | 
  88  | test('independent completion has independent evidence and wrong attempts remain in accuracy', async ({ page }) => {
  89  |   const data = layouts.pages as Record<string, { regions: Array<{ id: string }> }>;
  90  |   await page.addInitScript(done => localStorage.setItem('cartilla.page-completion.v1', JSON.stringify({ '1': done })), data['1']!.regions.map(r => `page-1-${r.id}`));
  91  |   await page.goto('/cartilla/leccion/1');
  92  |   const viewer = page.locator('.native-lesson-viewer');
> 93  |   await viewer.getByRole('button', { name: 'Siguiente' }).click();
      |                                                           ^ Error: locator.click: Target crashed 
  94  |   for (const name of ['anillo', 'estrella', 'indio', 'oso', 'uniforme']) await viewer.getByRole('button', { name, exact: true }).click();
  95  |   await expect(viewer.getByRole('button', { name: 'Siguiente' })).not.toHaveAttribute('aria-disabled', 'true');
  96  |   const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('cartilla.exercise-stats.v1') || '{}'));
  97  |   const result = Object.values(stats['1']).find((s: any) => s.meta?.exercise?.startsWith('vowel_pick_one')) as any;
  98  |   expect(result.meta).toMatchObject({ outcome: 'independent-success', assisted: false, completed: true });
  99  |   expect(result.hits).toBe(5); expect(result.attempts).toBe(5);
  100 |   await page.screenshot({ path: 'docs/proofs/batch-2/independent-complete.png', fullPage: true });
  101 | });
  102 | 
```