# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: final-backgrounds.spec.ts >> Workbook phone: background behind working picture targets
- Location: tests\e2e\final-backgrounds.spec.ts:7:3

# Error details

```
Error: locator.click: Page crashed
Call log:
  - waiting for locator('.native-lesson-viewer').getByRole('button', { name: 'Siguiente' })

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import layouts from "../../src/data/page-layouts.json" with { type: "json" };
  3  | for (const [name, viewport] of Object.entries({
  4  |   phone: { width: 390, height: 844 },
  5  |   tablet: { width: 820, height: 1180 },
  6  | })) {
  7  |   test(`Workbook ${name}: background behind working picture targets`, async ({ page }) => {
  8  |     await page.setViewportSize(viewport);
  9  |     await page.emulateMedia({ reducedMotion: "reduce" });
  10 |     await page.addInitScript(
  11 |       (done) => localStorage.setItem("cartilla.page-completion.v1", JSON.stringify({ "1": done })),
  12 |       layouts.pages["1"].regions.map((r) => `page-1-${r.id}`),
  13 |     );
  14 |     const failures: string[] = [];
  15 |     page.on("response", (r) => {
  16 |       if (r.url().includes("/backgrounds/final/") && !r.ok()) failures.push(r.url());
  17 |     });
  18 |     await page.goto("/cartilla/leccion/1");
  19 |     const viewer = page.locator(".native-lesson-viewer");
> 20 |     await viewer.getByRole("button", { name: "Siguiente" }).click();
     |                                                             ^ Error: locator.click: Page crashed
  21 |     const bg = viewer.locator(".final-page-background");
  22 |     await expect(bg).toHaveAttribute("data-background-printed-page", "2");
  23 |     await expect(bg).toHaveJSProperty("complete", true);
  24 |     await expect(bg).toHaveJSProperty("naturalWidth", 1103);
  25 |     expect(await bg.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none");
  26 |     expect(await bg.evaluate((el) => getComputedStyle(el).objectFit)).toBe("contain");
  27 |     const target = viewer.getByRole("button", { name: "anillo", exact: true });
  28 |     await target.scrollIntoViewIfNeeded();
  29 |     const before = await target.boundingBox();
  30 |     await bg.evaluate((el) => (el.style.display = "none"));
  31 |     expect(await target.boundingBox()).toEqual(before);
  32 |     await page.screenshot({
  33 |       path: `docs/proofs/final-backgrounds/workbook-${name}-before.png`,
  34 |       fullPage: true,
  35 |     });
  36 |     await bg.evaluate((el) => (el.style.display = ""));
  37 |     await target.click();
  38 |     await expect(target).toHaveClass(/graded-correct/);
  39 |     expect(failures).toEqual([]);
  40 |     await page.screenshot({
  41 |       path: `docs/proofs/final-backgrounds/workbook-${name}-after.png`,
  42 |       fullPage: true,
  43 |     });
  44 |   });
  45 | }
  46 | for (const [name, viewport] of Object.entries({
  47 |   portrait: { width: 820, height: 1180 },
  48 |   landscape: { width: 1280, height: 800 },
  49 | })) {
  50 |   test(`Flip Chart ${name}: sheet identity and whole-composition fit`, async ({ page }) => {
  51 |     // Owner direction 2026-10-07: the Flip Chart is a clean paper surface with
  52 |     // no background image; the sheet itself is the printed-layout replica.
  53 |     await page.setViewportSize(viewport);
  54 |     await page.goto("/cartilla/presentar/1");
  55 |     const stage = page.getByTestId("flipchart-stage");
  56 |     await expect(stage).toBeVisible();
  57 |     await expect(stage.locator(".final-page-background")).toHaveCount(0);
  58 |     const sheet = stage.locator('[data-native-flipchart="true"]').first();
  59 |     await expect(sheet).toHaveAttribute("data-flipchart-page", "3");
  60 |     const stageBox = (await stage.boundingBox())!;
  61 |     const sheetBox = (await sheet.boundingBox())!;
  62 |     expect(sheetBox.width).toBeGreaterThan(0);
  63 |     expect(sheetBox.x).toBeGreaterThanOrEqual(stageBox.x - 2);
  64 |     expect(sheetBox.x + sheetBox.width).toBeLessThanOrEqual(stageBox.x + stageBox.width + 2);
  65 |     await expect.poll(() => stage.locator("img").evaluateAll((images) =>
  66 |       images.every((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
  67 |     await stage.screenshot({ path: `docs/proofs/final-backgrounds/flipchart-${name}-after.png` });
  68 |     await page.goto("/cartilla/presentar/2");
  69 |     const second = page.getByTestId("flipchart-stage");
  70 |     await expect(second.locator(".final-page-background")).toHaveCount(0);
  71 |     await expect(second.locator('[data-native-flipchart="true"]').first()).toHaveAttribute("data-flipchart-page", "4");
  72 |   });
  73 | }
  74 | 
```