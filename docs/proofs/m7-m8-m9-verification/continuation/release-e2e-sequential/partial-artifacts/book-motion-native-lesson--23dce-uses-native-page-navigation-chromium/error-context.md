# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: book-motion.spec.ts >> native lesson and presenter motion >> student lesson uses native page navigation
- Location: tests\e2e\book-motion.spec.ts:9:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.native-lesson-viewer')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.native-lesson-viewer') with timeout 5000ms
  - waiting for locator('.native-lesson-viewer')
  - Protocol error (Runtime.callFunctionOn): Page crashed.

```

# Test source

```ts
  1  | import { test, expect, type Page } from "@playwright/test";
  2  | 
  3  | async function dismissIntro(page: Page) {
  4  |   const start = page.getByRole("button", { name: "Comenzar" });
  5  |   if (await start.isVisible().catch(() => false)) await start.click();
  6  | }
  7  | 
  8  | test.describe("native lesson and presenter motion", () => {
  9  |   test("student lesson uses native page navigation", async ({ page }) => {
  10 |     await page.goto("/cartilla/leccion/8", { waitUntil: "domcontentloaded" });
  11 |     await dismissIntro(page);
  12 | 
  13 |     const reader = page.locator(".native-lesson-viewer");
> 14 |     await expect(reader).toBeVisible();
     |                          ^ Error: expect(locator).toBeVisible() failed
  15 |     await expect(page.getByTestId("physical-book-reader")).toHaveCount(0);
  16 |     await expect(reader.locator(".native-lesson-viewer__content")).toBeVisible();
  17 |     await expect(reader.locator(".native-lesson-viewer__navigation")).toBeVisible();
  18 | 
  19 |     // Gretel speaks through lesson cinematics and reactions; the clean
  20 |     // Workbook page carries no fixed Gretel companion (#538).
  21 | 
  22 |     // Completion gate: an unfinished page cannot be turned forward.
  23 |     const counter = reader.locator(".native-lesson-viewer__page");
  24 |     const before = (await counter.textContent()) ?? "";
  25 |     const next = reader.getByRole("button", { name: "Siguiente" });
  26 |     await expect(next).toBeVisible();
  27 |     if (await next.isEnabled()) {
  28 |       await next.click();
  29 |       await expect
  30 |         .poll(async () => (await counter.textContent()) ?? "", { timeout: 6000 })
  31 |         .not.toBe(before);
  32 |     } else {
  33 |       await expect(reader).toHaveAttribute("data-page-complete", "false");
  34 |     }
  35 |   });
  36 | 
  37 |   test("teacher presenter turns the printed Flip Chart sheet over the top binding", async ({ page }) => {
  38 |     await page.goto("/cartilla/presentar/7", { waitUntil: "domcontentloaded" });
  39 |     await dismissIntro(page);
  40 | 
  41 |     const panel = page.getByTestId("flipchart-hd-panel");
  42 |     await expect(panel).toBeVisible({ timeout: 15000 });
  43 |     await expect(panel).toHaveAttribute("data-hd-primary", "true");
  44 |     await expect(panel).toHaveAttribute("data-presenter-mode", "native");
  45 |     await expect(panel).toHaveAttribute("data-page-turn-axis", "vertical");
  46 |     await expect(panel).toHaveAttribute("data-page-turn-ms", "2000");
  47 |     await expect(panel).not.toHaveAttribute("data-physical-flipchart", /.*/);
  48 |     await expect(panel.locator(".fc-board__ring")).toHaveCount(0);
  49 |     await expect(panel.locator(".fc-board__binding")).toHaveCount(0);
  50 |     // The presented sheet is the printed-sheet replica (#744).
  51 |     const stage = page.getByTestId("flipchart-stage");
  52 |     await expect(stage.getByTestId("flipchart-replica-sheet").first()).toBeVisible();
  53 | 
  54 |     const counter = panel.getByTestId("flipchart-counter");
  55 |     await expect(counter).toContainText("Hoja 1 de");
  56 | 
  57 |     const next = panel.getByRole("button", { name: "Lámina siguiente", exact: true });
  58 |     if (await next.isEnabled()) {
  59 |       await next.click();
  60 |       await expect(counter).toContainText("Hoja 2 de", { timeout: 6000 });
  61 |     }
  62 |   });
  63 | });
  64 | 
```