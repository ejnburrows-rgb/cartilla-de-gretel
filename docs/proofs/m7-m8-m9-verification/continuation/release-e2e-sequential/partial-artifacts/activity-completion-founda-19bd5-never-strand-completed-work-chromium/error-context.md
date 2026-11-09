# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: activity-completion-foundation.spec.ts >> p5 example + five answers; a wrong try, reload and return never strand completed work
- Location: tests\e2e\activity-completion-foundation.spec.ts:64:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: locator('.native-lesson-viewer')
Expected: "4"
Error: element(s) not found

Call log:
  - Expect "toHaveAttribute" locator('.native-lesson-viewer') with timeout 5000ms
  - waiting for locator('.native-lesson-viewer')
  - Protocol error (Runtime.callFunctionOn): Page crashed.

```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import layouts from '../../src/data/page-layouts.json' with { type: "json" };
  3   | 
  4   | function finishedPage(page: number) {
  5   |   const data = layouts.pages as Record<string, { regions: Array<{ id: string; regionType: string }> }>;
  6   |   return data[String(page)]!.regions.map(region => `page-${page}-${region.id}`);
  7   | }
  8   | 
  9   | test('p2 uses shared pencil feedback, stays keyboard accessible, and restores completed answers', async ({ page }) => {
  10  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  11  |   await page.addInitScript(done => localStorage.setItem('cartilla.page-completion.v1', JSON.stringify({ '1': done })), finishedPage(1));
  12  |   await page.goto('/cartilla/leccion/1');
  13  |   const viewer = page.locator('.native-lesson-viewer');
  14  |   await expect(viewer).toHaveAttribute('data-native-page', '1');
  15  |   await viewer.getByTestId('button-next').click();
  16  |   await expect(viewer).toHaveAttribute('data-native-page', '2');
  17  | 
  18  |   const next = viewer.getByTestId('button-next');
  19  |   await expect(next).toHaveAttribute('aria-disabled', 'true');
  20  |   expect(await viewer.getByRole('button', { name: /^Vocal/ }).count()).toBe(0);
  21  | 
  22  |   const wrong = viewer.getByRole('button', { name: 'manzana', exact: true });
  23  |   // Under reduced motion the eraser step lasts 60 ms, so record every mark state
  24  |   // the wrong picture passes through instead of hoping to catch it on screen.
  25  |   await wrong.evaluate(button => {
  26  |     const seen: string[] = ((window as unknown as { markStatuses: string[] }).markStatuses = []);
  27  |     new MutationObserver(() => {
  28  |       button.querySelectorAll('[data-mark-status]').forEach(mark => {
  29  |         const status = mark.getAttribute('data-mark-status');
  30  |         if (status && seen[seen.length - 1] !== status) seen.push(status);
  31  |       });
  32  |     }).observe(button, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-mark-status'] });
  33  |   });
  34  |   await wrong.click();
  35  |   await expect.poll(() => page.evaluate(() => (window as unknown as { markStatuses: string[] }).markStatuses), { timeout: 4000 }).toContain('erasing');
  36  |   await expect(wrong.locator('.workbook-pencil-mark-container')).toHaveCount(0, { timeout: 1500 });
  37  |   await expect(wrong).toBeEnabled();
  38  | 
  39  |   for (const name of ['anillo', 'estrella', 'indio', 'oso', 'uniforme']) {
  40  |     const target = viewer.getByRole('button', { name, exact: true });
  41  |     if (name === 'anillo') await target.click();
  42  |     else {
  43  |       await target.focus();
  44  |       await page.keyboard.press('Enter');
  45  |     }
  46  |     await expect(target.locator('[data-mark-status="correct"]')).toHaveCount(1, { timeout: 4000 });
  47  |   }
  48  | 
  49  |   await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  50  |   const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('cartilla.exercise-stats.v1') || '{}'));
  51  |   const result = Object.values(stats['1']).find((s: any) => s.meta?.exercise?.startsWith('vowel_pick_one')) as any;
  52  |   expect(result.hits).toBe(5);
  53  |   expect(result.attempts).toBe(6);
  54  |   expect(result.meta.completed).toBe(true);
  55  |   await page.screenshot({ path: 'verification-screenshots/p0-p2-pencil-feedback.png', fullPage: true });
  56  | 
  57  |   await page.reload();
  58  |   await expect(viewer).toHaveAttribute('data-native-page', '2');
  59  |   await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  60  |   await expect(viewer.locator('.fp-ix-cell.graded-correct')).toHaveCount(5);
  61  |   await expect(viewer.locator('[data-mark-status="correct"]')).toHaveCount(5);
  62  | });
  63  | 
  64  | test('p5 example + five answers; a wrong try, reload and return never strand completed work', async ({ page }) => {
  65  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  66  |   await page.addInitScript(done => {
  67  |     if (!localStorage.getItem('cartilla.page-completion.v1')) localStorage.setItem('cartilla.page-completion.v1', JSON.stringify({ '4': done }));
  68  |     (window as unknown as { proofEvents: unknown[] }).proofEvents = [];
  69  |     window.addEventListener('gretel:bus', event => (window as unknown as { proofEvents: unknown[] }).proofEvents.push((event as CustomEvent).detail));
  70  |   }, finishedPage(4));
  71  |   await page.goto('/cartilla/leccion/2');
  72  |   const viewer = page.locator('.native-lesson-viewer');
> 73  |   await expect(viewer).toHaveAttribute('data-native-page', '4');
      |                        ^ Error: expect(locator).toHaveAttribute(expected) failed
  74  |   await viewer.getByTestId('button-next').click();
  75  |   await expect(viewer).toHaveAttribute('data-native-page', '5');
  76  |   const next = viewer.getByTestId('button-next');
  77  |   await expect(viewer.getByRole('button', { name: 'ola', exact: true })).toHaveAttribute('data-example', 'true');
  78  |   await expect(viewer.getByRole('button', { name: 'ola', exact: true })).toHaveAttribute('aria-pressed', 'true');
  79  |   await next.click({ force: true }); await next.click({ force: true });
  80  |   expect(await page.evaluate(() => (window as unknown as { proofEvents: Array<{ type: string }> }).proofEvents.filter(event => event.type === 'hint:show').length)).toBe(0);
  81  |   const wrong = viewer.getByRole('button', { name: 'iglú', exact: true });
  82  |   await wrong.click();
  83  |   // Owner decision 2026-10-14: lesson pages have no Gretel guide (no cue, hint or
  84  |   // Ayuda button). A wrong picture is erased and can simply be tried again.
  85  |   await expect(page.locator('[data-testid="gretel-presence"]')).toHaveCount(0);
  86  |   await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toHaveCount(0);
  87  |   await expect(wrong).toBeEnabled({ timeout: 10_000 });
  88  |   await expect(wrong).toHaveAttribute('aria-pressed', 'false');
  89  |   for (const name of ['oveja', 'ojos']) {
  90  |     const target = viewer.getByRole('button', { name, exact: true }); await target.click();
  91  |     await expect(target).toHaveAttribute('aria-pressed', 'true');
  92  |   }
  93  |   await expect(next).toHaveAttribute('aria-disabled', 'true');
  94  |   await page.reload();
  95  |   await expect(viewer).toHaveAttribute('data-native-page', '5');
  96  |   await expect(viewer.getByRole('button', { name: 'oveja', exact: true })).toHaveAttribute('aria-pressed', 'true');
  97  |   for (const name of ['oreja', 'olla']) {
  98  |     const target = viewer.getByRole('button', { name, exact: true }); await target.click();
  99  |     await expect(target).toHaveAttribute('aria-pressed', 'true');
  100 |   }
  101 |   await expect(next).toHaveAttribute('aria-disabled', 'true');
  102 |   const last = viewer.getByRole('button', { name: 'oso', exact: true }); await last.click();
  103 |   await expect(last).toHaveAttribute('aria-pressed', 'true');
  104 |   await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  105 |   const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('cartilla.exercise-stats.v1') || '{}'));
  106 |   const result = Object.values(stats['2']).find((s: any) => s.meta?.exercise?.startsWith('pencil_line_2:p5')) as any;
  107 |   // No Gretel help exists on lesson pages, so finishing after one wrong try is the child's own success.
  108 |   expect(result.meta).toMatchObject({ outcome: 'independent-success', completed: true, assisted: false });
  109 |   expect(result.hits).toBe(5); expect(result.attempts).toBe(6);
  110 |   // Advance the browser clock beyond the former delayed-reset window.
  111 |   await page.clock.install(); await page.clock.fastForward(10000);
  112 |   await expect(last).toHaveAttribute('aria-pressed', 'true');
  113 |   await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  114 |   await page.screenshot({ path: 'verification-screenshots/p0-p5-assisted-complete.png', fullPage: true });
  115 |   await next.click();
  116 |   await expect(viewer).toHaveAttribute('data-native-page', '6');
  117 |   await expect(viewer.getByRole('button', { name: /Terminar lección/ })).toHaveAttribute('aria-disabled', 'true');
  118 |   await viewer.getByRole('button', { name: /Anterior/ }).click();
  119 |   await expect(viewer).toHaveAttribute('data-native-page', '5');
  120 |   await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  121 |   await page.reload();
  122 |   await expect(viewer).toHaveAttribute('data-native-page', '5');
  123 |   await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  124 |   await expect(viewer.getByRole('button', { name: 'oso', exact: true })).toHaveAttribute('aria-pressed', 'true');
  125 | });
  126 | 
```