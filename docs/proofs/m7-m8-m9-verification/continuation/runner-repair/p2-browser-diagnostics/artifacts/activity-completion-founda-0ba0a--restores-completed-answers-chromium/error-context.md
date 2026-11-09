# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: activity-completion-foundation.spec.ts >> p2 uses shared pencil feedback, stays keyboard accessible, and restores completed answers
- Location: tests\e2e\activity-completion-foundation.spec.ts:10:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: locator('.native-lesson-viewer')
Expected: "1"
Error: element(s) not found

Call log:
  - Expect "toHaveAttribute" locator('.native-lesson-viewer') with timeout 5000ms
  - waiting for locator('.native-lesson-viewer')
  - Page crashed

```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import fs from 'node:fs';
  3   | import layouts from '../../src/data/page-layouts.json' with { type: "json" };
  4   | 
  5   | function finishedPage(page: number) {
  6   |   const data = layouts.pages as Record<string, { regions: Array<{ id: string; regionType: string }> }>;
  7   |   return data[String(page)]!.regions.map(region => `page-${page}-${region.id}`);
  8   | }
  9   | 
  10  | test('p2 uses shared pencil feedback, stays keyboard accessible, and restores completed answers', async ({ page }, testInfo) => {
  11  |   if (process.env.PLAYWRIGHT_CRASH_DIAGNOSTICS === '1') {
  12  |     const destination = testInfo.outputPath('browser-events.ndjson');
  13  |     let count = 0;
  14  |     const log = (kind: string, detail: unknown) => {
  15  |       if (count++ < 1000) fs.appendFileSync(destination, JSON.stringify({ utc: new Date().toISOString(), kind, detail }) + '\n');
  16  |     };
  17  |     page.on('crash', () => log('page-crash', page.url()));
  18  |     page.on('pageerror', error => log('page-error', error.stack || error.message));
  19  |     page.on('console', message => { if (message.type() === 'error') log('console-error', message.text()); });
  20  |     page.on('requestfailed', request => log('request-failed', { url: request.url(), failure: request.failure() }));
  21  |     page.on('response', response => { if (response.status() >= 400) log('http-error', { url: response.url(), status: response.status() }); });
  22  |   }
  23  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  24  |   await page.addInitScript(done => localStorage.setItem('cartilla.page-completion.v1', JSON.stringify({ '1': done })), finishedPage(1));
  25  |   await page.goto('/cartilla/leccion/1');
  26  |   const viewer = page.locator('.native-lesson-viewer');
> 27  |   await expect(viewer).toHaveAttribute('data-native-page', '1');
      |                        ^ Error: expect(locator).toHaveAttribute(expected) failed
  28  |   await viewer.getByTestId('button-next').click();
  29  |   await expect(viewer).toHaveAttribute('data-native-page', '2');
  30  | 
  31  |   const next = viewer.getByTestId('button-next');
  32  |   await expect(next).toHaveAttribute('aria-disabled', 'true');
  33  |   expect(await viewer.getByRole('button', { name: /^Vocal/ }).count()).toBe(0);
  34  | 
  35  |   const wrong = viewer.getByRole('button', { name: 'manzana', exact: true });
  36  |   // Under reduced motion the eraser step lasts 60 ms, so record every mark state
  37  |   // the wrong picture passes through instead of hoping to catch it on screen.
  38  |   await wrong.evaluate(button => {
  39  |     const seen: string[] = ((window as unknown as { markStatuses: string[] }).markStatuses = []);
  40  |     new MutationObserver(() => {
  41  |       button.querySelectorAll('[data-mark-status]').forEach(mark => {
  42  |         const status = mark.getAttribute('data-mark-status');
  43  |         if (status && seen[seen.length - 1] !== status) seen.push(status);
  44  |       });
  45  |     }).observe(button, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-mark-status'] });
  46  |   });
  47  |   await wrong.click();
  48  |   await expect.poll(() => page.evaluate(() => (window as unknown as { markStatuses: string[] }).markStatuses), { timeout: 4000 }).toContain('erasing');
  49  |   await expect(wrong.locator('.workbook-pencil-mark-container')).toHaveCount(0, { timeout: 1500 });
  50  |   await expect(wrong).toBeEnabled();
  51  | 
  52  |   for (const name of ['anillo', 'estrella', 'indio', 'oso', 'uniforme']) {
  53  |     const target = viewer.getByRole('button', { name, exact: true });
  54  |     if (name === 'anillo') await target.click();
  55  |     else {
  56  |       await target.focus();
  57  |       await page.keyboard.press('Enter');
  58  |     }
  59  |     await expect(target.locator('[data-mark-status="correct"]')).toHaveCount(1, { timeout: 4000 });
  60  |   }
  61  | 
  62  |   await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  63  |   const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('cartilla.exercise-stats.v1') || '{}'));
  64  |   const result = Object.values(stats['1']).find((s: any) => s.meta?.exercise?.startsWith('vowel_pick_one')) as any;
  65  |   expect(result.hits).toBe(5);
  66  |   expect(result.attempts).toBe(6);
  67  |   expect(result.meta.completed).toBe(true);
  68  |   await page.screenshot({ path: 'verification-screenshots/p0-p2-pencil-feedback.png', fullPage: true });
  69  | 
  70  |   await page.reload();
  71  |   await expect(viewer).toHaveAttribute('data-native-page', '2');
  72  |   await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  73  |   await expect(viewer.locator('.fp-ix-cell.graded-correct')).toHaveCount(5);
  74  |   await expect(viewer.locator('[data-mark-status="correct"]')).toHaveCount(5);
  75  | });
  76  | 
  77  | test('p5 example + five answers; a wrong try, reload and return never strand completed work', async ({ page }) => {
  78  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  79  |   await page.addInitScript(done => {
  80  |     if (!localStorage.getItem('cartilla.page-completion.v1')) localStorage.setItem('cartilla.page-completion.v1', JSON.stringify({ '4': done }));
  81  |     (window as unknown as { proofEvents: unknown[] }).proofEvents = [];
  82  |     window.addEventListener('gretel:bus', event => (window as unknown as { proofEvents: unknown[] }).proofEvents.push((event as CustomEvent).detail));
  83  |   }, finishedPage(4));
  84  |   await page.goto('/cartilla/leccion/2');
  85  |   const viewer = page.locator('.native-lesson-viewer');
  86  |   await expect(viewer).toHaveAttribute('data-native-page', '4');
  87  |   await viewer.getByTestId('button-next').click();
  88  |   await expect(viewer).toHaveAttribute('data-native-page', '5');
  89  |   const next = viewer.getByTestId('button-next');
  90  |   await expect(viewer.getByRole('button', { name: 'ola', exact: true })).toHaveAttribute('data-example', 'true');
  91  |   await expect(viewer.getByRole('button', { name: 'ola', exact: true })).toHaveAttribute('aria-pressed', 'true');
  92  |   await next.click({ force: true }); await next.click({ force: true });
  93  |   expect(await page.evaluate(() => (window as unknown as { proofEvents: Array<{ type: string }> }).proofEvents.filter(event => event.type === 'hint:show').length)).toBe(0);
  94  |   const wrong = viewer.getByRole('button', { name: 'iglú', exact: true });
  95  |   await wrong.click();
  96  |   // Owner decision 2026-10-14: lesson pages have no Gretel guide (no cue, hint or
  97  |   // Ayuda button). A wrong picture is erased and can simply be tried again.
  98  |   await expect(page.locator('[data-testid="gretel-presence"]')).toHaveCount(0);
  99  |   await expect(page.getByRole('button', { name: 'Ayuda', exact: true })).toHaveCount(0);
  100 |   await expect(wrong).toBeEnabled({ timeout: 10_000 });
  101 |   await expect(wrong).toHaveAttribute('aria-pressed', 'false');
  102 |   for (const name of ['oveja', 'ojos']) {
  103 |     const target = viewer.getByRole('button', { name, exact: true }); await target.click();
  104 |     await expect(target).toHaveAttribute('aria-pressed', 'true');
  105 |   }
  106 |   await expect(next).toHaveAttribute('aria-disabled', 'true');
  107 |   await page.reload();
  108 |   await expect(viewer).toHaveAttribute('data-native-page', '5');
  109 |   await expect(viewer.getByRole('button', { name: 'oveja', exact: true })).toHaveAttribute('aria-pressed', 'true');
  110 |   for (const name of ['oreja', 'olla']) {
  111 |     const target = viewer.getByRole('button', { name, exact: true }); await target.click();
  112 |     await expect(target).toHaveAttribute('aria-pressed', 'true');
  113 |   }
  114 |   await expect(next).toHaveAttribute('aria-disabled', 'true');
  115 |   const last = viewer.getByRole('button', { name: 'oso', exact: true }); await last.click();
  116 |   await expect(last).toHaveAttribute('aria-pressed', 'true');
  117 |   await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  118 |   const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('cartilla.exercise-stats.v1') || '{}'));
  119 |   const result = Object.values(stats['2']).find((s: any) => s.meta?.exercise?.startsWith('pencil_line_2:p5')) as any;
  120 |   // No Gretel help exists on lesson pages, so finishing after one wrong try is the child's own success.
  121 |   expect(result.meta).toMatchObject({ outcome: 'independent-success', completed: true, assisted: false });
  122 |   expect(result.hits).toBe(5); expect(result.attempts).toBe(6);
  123 |   // Advance the browser clock beyond the former delayed-reset window.
  124 |   await page.clock.install(); await page.clock.fastForward(10000);
  125 |   await expect(last).toHaveAttribute('aria-pressed', 'true');
  126 |   await expect(next).not.toHaveAttribute('aria-disabled', 'true');
  127 |   await page.screenshot({ path: 'verification-screenshots/p0-p5-assisted-complete.png', fullPage: true });
```