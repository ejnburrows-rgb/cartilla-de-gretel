# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: archetype-proof-3-4.spec.ts >> Workbook Archetypes 3 & 4 Proof Suite >> Archetype 4: Single central target + surrounding pictures >> Printed Page 17 (Central target Uu) rendered fidelity and fit
- Location: tests\e2e\archetype-proof-3-4.spec.ts:159:7

# Error details

```
Error: page.waitForSelector: Target crashed 
Call log:
  - waiting for locator('.native-lesson-viewer[data-native-page]') to be visible

```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import * as path from "path";
  3   | import * as fs from "fs";
  4   | 
  5   | const PROOF_DIR = path.resolve(process.cwd(), "docs/proofs/archetypes-3-4");
  6   | 
  7   | test.beforeAll(() => {
  8   |   if (!fs.existsSync(PROOF_DIR)) {
  9   |     fs.mkdirSync(PROOF_DIR, { recursive: true });
  10  |   }
  11  | });
  12  | 
  13  | /** Helper to set the resume page in localStorage before navigating to a lesson. */
  14  | async function navigateToLessonPage(page: Page, lessonNumber: number, pageIndex: number) {
  15  |   await page.addInitScript(
  16  |     ({ lesson, pageIndex }) => {
  17  |       const val = JSON.stringify({ lesson, page: pageIndex });
  18  |       window.localStorage.setItem(`cartilla.learner-resume.v1:${lesson}`, val);
  19  |       window.localStorage.setItem("cartilla.learner-resume.v1", val);
  20  |     },
  21  |     { lesson: lessonNumber, pageIndex },
  22  |   );
  23  |   await page.goto(`/cartilla/leccion/${lessonNumber}`, { waitUntil: "domcontentloaded" });
> 24  |   await page.waitForSelector(".native-lesson-viewer[data-native-page]", { timeout: 15000 });
      |              ^ Error: page.waitForSelector: Target crashed 
  25  | }
  26  | 
  27  | /** Verify that all img elements within a root container loaded successfully without broken image sources. */
  28  | async function verifyImagesLoaded(page: Page, containerSelector: string) {
  29  |   const images = page.locator(`${containerSelector} img`);
  30  |   const count = await images.count();
  31  |   expect(count).toBeGreaterThan(0);
  32  | 
  33  |   for (let i = 0; i < count; i++) {
  34  |     const img = images.nth(i);
  35  |     await expect(img).toBeVisible();
  36  |     const loaded = await img.evaluate((el: HTMLImageElement) => {
  37  |       return el.complete && el.naturalWidth > 0;
  38  |     });
  39  |     expect(loaded, `Image ${i} in ${containerSelector} should be fully loaded`).toBe(true);
  40  |   }
  41  | }
  42  | 
  43  | /** Check that window overflow is non-positive (no horizontal scrollbar / page clipping). */
  44  | async function checkViewportFit(page: Page) {
  45  |   const overflow = await page.evaluate(() => {
  46  |     return {
  47  |       windowWidthOverflow: document.documentElement.scrollWidth - window.innerWidth,
  48  |       bodyWidthOverflow: document.body.scrollWidth - window.innerWidth,
  49  |     };
  50  |   });
  51  |   expect(overflow.windowWidthOverflow, "Window horizontal scroll overflow").toBeLessThanOrEqual(0);
  52  | }
  53  | 
  54  | test.describe("Workbook Archetypes 3 & 4 Proof Suite", () => {
  55  |   test.describe("Archetype 3: Multi-pair matching / connect (Printed Page 3)", () => {
  56  |     test("Source order, labels, images, and Pencil Line presentation on Page 3", async ({ page }) => {
  57  |       await page.setViewportSize({ width: 1280, height: 900 });
  58  |       await navigateToLessonPage(page, 1, 2); // Printed Page 3 is index 2 in Lesson 1
  59  | 
  60  |       // 1. Verify archetype container and title
  61  |       const pageContainer = page.locator(".faithful-page--archetype-3");
  62  |       await expect(pageContainer).toBeVisible();
  63  | 
  64  |       const instruction = page.locator(".fp-region--instruction");
  65  |       await expect(instruction).toContainText("Traza una línea de la vocal al dibujo que le corresponde");
  66  | 
  67  |       // 2. Pencil Line direct connector is active, never lasso/rope
  68  |       const directPencil = page.locator(".am-direct-pencil");
  69  |       await expect(directPencil).toBeVisible();
  70  |       const ropeLayer = page.locator(".am-lasso__rope-layer");
  71  |       await expect(ropeLayer).toHaveCount(0);
  72  | 
  73  |       // 3. Verify left column vowel labels in source order
  74  |       const leftCards = page.locator(".am-direct-pencil__left-card");
  75  |       await expect(leftCards).toHaveCount(5);
  76  |       const expectedVowels = ["o", "a", "i", "e", "u"];
  77  |       for (let i = 0; i < 5; i++) {
  78  |         await expect(leftCards.nth(i)).toContainText(expectedVowels[i]);
  79  |       }
  80  | 
  81  |       // 4. Verify right column target images and captions
  82  |       const rightTargets = page.locator(".am-direct-pencil__column--right .am-direct-pencil__target");
  83  |       await expect(rightTargets).toHaveCount(5);
  84  |       await verifyImagesLoaded(page, ".am-direct-pencil__column--right");
  85  | 
  86  |       // 5. Screenshot laptop view
  87  |       await page.screenshot({ path: path.join(PROOF_DIR, "page3-archetype3-laptop.png") });
  88  |     });
  89  | 
  90  |     test("Completion compatibility for Archetype 3 (Page 3)", async ({ page }) => {
  91  |       await page.setViewportSize({ width: 1280, height: 900 });
  92  |       await navigateToLessonPage(page, 1, 2);
  93  | 
  94  |       const directPencil = page.locator(".am-direct-pencil");
  95  |       await expect(directPencil).toBeVisible();
  96  | 
  97  |       // Pair mappings for Page 3:
  98  |       // Left index 0 (vowel 'o') -> Right target 'ocho'
  99  |       // Left index 1 (vowel 'a') -> Right target 'araña'
  100 |       // Left index 2 (vowel 'i') -> Right target 'iglesia'
  101 |       // Left index 3 (vowel 'e') -> Right target 'escoba'
  102 |       // Left index 4 (vowel 'u') -> Right target 'uno'
  103 |       const pairs = [
  104 |         { leftText: "o", rightLabel: "ocho" },
  105 |         { leftText: "a", rightLabel: "araña" },
  106 |         { leftText: "i", rightLabel: "iglesia" },
  107 |         { leftText: "e", rightLabel: "escoba" },
  108 |         { leftText: "u", rightLabel: "uno" },
  109 |       ];
  110 | 
  111 |       for (const pair of pairs) {
  112 |         const leftBtn = page.locator(".am-direct-pencil__left-card", { hasText: pair.leftText });
  113 |         const rightBtn = page.locator(`.am-direct-pencil__column--right .am-direct-pencil__target[aria-label="${pair.rightLabel}"]`);
  114 | 
  115 |         await leftBtn.click();
  116 |         await rightBtn.click();
  117 |         await page.waitForTimeout(100);
  118 |       }
  119 | 
  120 |       // Verify completion state on direct pencil container and native page viewer
  121 |       await expect(directPencil).toHaveAttribute("data-complete", "true");
  122 |       const nativeViewer = page.locator(".native-lesson-viewer");
  123 |       await expect(nativeViewer).toHaveAttribute("data-page-complete", "true");
  124 | 
```