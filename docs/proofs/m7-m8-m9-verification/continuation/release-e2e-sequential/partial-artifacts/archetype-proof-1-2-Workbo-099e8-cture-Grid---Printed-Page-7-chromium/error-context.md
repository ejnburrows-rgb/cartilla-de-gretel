# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: archetype-proof-1-2.spec.ts >> Workbook Archetypes 1 and 2 Proof >> Viewport: laptop (1280x800) >> Family 1 (Picture Grid) - Printed Page 7
- Location: tests\e2e\archetype-proof-1-2.spec.ts:32:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.native-lesson-viewer')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.native-lesson-viewer') with timeout 10000ms
  - waiting for locator('.native-lesson-viewer')
  - Protocol error (Runtime.callFunctionOn): Page crashed.

```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { archetypeMappingForPage, WorkbookArchetype } from "../../src/data/workbook-archetypes";
  3   | 
  4   | // Representative pages for Archetype 1 (Picture grid / circle-X)
  5   | const FAMILY_1_PAGES = [1, 4, 7, 10, 13, 16];
  6   | // Representative page for Archetype 2 (Vowel/letter + row choices)
  7   | const FAMILY_2_PAGES = [2];
  8   | 
  9   | const VIEWPORTS = {
  10  |   phone: { width: 390, height: 844 },
  11  |   tablet: { width: 820, height: 1180 },
  12  |   laptop: { width: 1280, height: 800 },
  13  | };
  14  | 
  15  | // Map printed page to lesson number and inner page index
  16  | function getLessonLocation(printedPage: number) {
  17  |   if (printedPage === 1) return { lesson: 1, pageIndex: 0 };
  18  |   if (printedPage === 2) return { lesson: 1, pageIndex: 1 };
  19  |   if (printedPage === 4) return { lesson: 2, pageIndex: 0 };
  20  |   if (printedPage === 7) return { lesson: 3, pageIndex: 0 };
  21  |   if (printedPage === 10) return { lesson: 4, pageIndex: 0 };
  22  |   if (printedPage === 13) return { lesson: 5, pageIndex: 0 };
  23  |   if (printedPage === 16) return { lesson: 6, pageIndex: 0 };
  24  |   throw new Error(`Unexpected test page: ${printedPage}`);
  25  | }
  26  | 
  27  | test.describe("Workbook Archetypes 1 and 2 Proof", () => {
  28  |   for (const [device, viewport] of Object.entries(VIEWPORTS)) {
  29  |     test.describe(`Viewport: ${device} (${viewport.width}x${viewport.height})`, () => {
  30  |       // Family 1: Picture grid / circle-X
  31  |       for (const printedPage of FAMILY_1_PAGES) {
  32  |         test(`Family 1 (Picture Grid) - Printed Page ${printedPage}`, async ({ page }) => {
  33  |           await page.setViewportSize(viewport);
  34  |           const mapping = archetypeMappingForPage(printedPage);
  35  |           expect(mapping.archetypes).toContain(WorkbookArchetype.PICTURE_GRID_CIRCLE_X);
  36  | 
  37  |           const { lesson, pageIndex } = getLessonLocation(printedPage);
  38  | 
  39  |           // Seed resume state to jump directly to pageIndex
  40  |           await page.addInitScript(
  41  |             ({ l, p }) => {
  42  |               const payload = JSON.stringify({ lesson: l, page: p });
  43  |               localStorage.setItem(`cartilla.learner-resume.v1:${l}`, payload);
  44  |               localStorage.setItem("cartilla.learner-resume.v1", payload);
  45  |             },
  46  |             { l: lesson, p: pageIndex },
  47  |           );
  48  | 
  49  |           await page.goto(`/cartilla/leccion/${lesson}`);
  50  | 
  51  |           // Ensure native lesson viewer loaded
  52  |           const viewer = page.locator(".native-lesson-viewer");
> 53  |           await expect(viewer).toBeVisible({ timeout: 10000 });
      |                                ^ Error: expect(locator).toBeVisible() failed
  54  | 
  55  |           // Verify clean digital canvas: scenic wallpaper must NOT be displayed on dense workbook pages
  56  |           const bgWallpaper = page.locator(".final-page-background");
  57  |           if ((await bgWallpaper.count()) > 0) {
  58  |             await expect(bgWallpaper).not.toBeVisible();
  59  |           }
  60  | 
  61  |           // Verify instruction hierarchy
  62  |           const instruction = page.locator(".fp-region--instruction");
  63  |           await expect(instruction).toBeVisible();
  64  | 
  65  |           // Verify picture grid structure (supports static and interactive grid selectors)
  66  |           const cells = page.locator(".fp-picture-grid__cell, .fp-ix-cell");
  67  |           const cellCount = await cells.count();
  68  |           expect(cellCount).toBeGreaterThan(0);
  69  | 
  70  |           // Verify images inside grid cells: no broken images
  71  |           const images = cells.locator("img");
  72  |           const imgCount = await images.count();
  73  |           expect(imgCount, `printed page ${printedPage} must render its source images`).toBeGreaterThan(0);
  74  |           for (let i = 0; i < imgCount; i++) {
  75  |             const img = images.nth(i);
  76  |             await expect(img).toBeVisible();
  77  |             const loaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
  78  |             expect(loaded, `Image ${i} on printed page ${printedPage} should be loaded`).toBe(true);
  79  |           }
  80  | 
  81  |           // Verify touch target sizes and cell containment
  82  |           for (let i = 0; i < Math.min(cellCount, 4); i++) {
  83  |             const box = await cells.nth(i).boundingBox();
  84  |             expect(box).not.toBeNull();
  85  |             if (box) {
  86  |               expect(box.width).toBeGreaterThanOrEqual(32);
  87  |               expect(box.height).toBeGreaterThanOrEqual(32);
  88  |             }
  89  |           }
  90  | 
  91  |           // Verify no horizontal overflow/clipping
  92  |           const overflow = await page.evaluate(() => {
  93  |             const body = document.body;
  94  |             return body.scrollWidth - body.clientWidth;
  95  |           });
  96  |           expect(overflow).toBeLessThanOrEqual(2);
  97  | 
  98  |           // Capture screenshot for visual proof
  99  |           await page.screenshot({
  100 |             path: `docs/proofs/archetypes-1-2/family-1-page-${printedPage}-${device}.png`,
  101 |             fullPage: true,
  102 |           });
  103 |         });
  104 |       }
  105 | 
  106 |       // Family 2: Vowel/letter + row choices
  107 |       for (const printedPage of FAMILY_2_PAGES) {
  108 |         test(`Family 2 (Vowel/Letter + Row Choices) - Printed Page ${printedPage}`, async ({ page }) => {
  109 |           await page.setViewportSize(viewport);
  110 |           const mapping = archetypeMappingForPage(printedPage);
  111 |           expect(mapping.archetypes).toContain(WorkbookArchetype.VOWEL_LETTER_ROW_CHOICES);
  112 | 
  113 |           const { lesson, pageIndex } = getLessonLocation(printedPage);
  114 | 
  115 |           await page.addInitScript(
  116 |             ({ l, p }) => {
  117 |               const payload = JSON.stringify({ lesson: l, page: p });
  118 |               localStorage.setItem(`cartilla.learner-resume.v1:${l}`, payload);
  119 |               localStorage.setItem("cartilla.learner-resume.v1", payload);
  120 |             },
  121 |             { l: lesson, p: pageIndex },
  122 |           );
  123 | 
  124 |           await page.goto(`/cartilla/leccion/${lesson}`);
  125 | 
  126 |           const viewer = page.locator(".native-lesson-viewer");
  127 |           await expect(viewer).toBeVisible({ timeout: 10000 });
  128 | 
  129 |           // Verify clean digital canvas: scenic wallpaper must NOT be displayed on dense workbook pages
  130 |           const bgWallpaper = page.locator(".final-page-background");
  131 |           if ((await bgWallpaper.count()) > 0) {
  132 |             await expect(bgWallpaper).not.toBeVisible();
  133 |           }
  134 | 
  135 |           // Verify instruction hierarchy
  136 |           const instruction = page.locator(".fp-region--instruction");
  137 |           await expect(instruction).toBeVisible();
  138 | 
  139 |           // Verify vowel pick rows and letter anchors (supports static and interactive selectors)
  140 |           const rows = page.locator(".fp-vowel-pick__row, .fp-ix-pick__row");
  141 |           const rowCount = await rows.count();
  142 |           expect(rowCount).toBeGreaterThan(0);
  143 | 
  144 |           const letterAnchors = page.locator(".fp-vowel-pick__letter, .fp-ix-pick__letter");
  145 |           expect(await letterAnchors.count()).toBe(rowCount);
  146 | 
  147 |           // Verify cell choices
  148 |           const cells = page.locator(".fp-vowel-pick__cell, .fp-ix-cell");
  149 |           const cellCount = await cells.count();
  150 |           expect(cellCount).toBeGreaterThan(0);
  151 | 
  152 |           // Verify images inside row choices: no broken images
  153 |           const images = cells.locator("img");
```