# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: archetype-proof-5-6.spec.ts >> Workbook Archetype 5 & 6 Proof >> Archetype 5: Handwriting/tracing and freehand drawing, progressive fade, persistence, responsive fit, reduced motion
- Location: tests\e2e\archetype-proof-5-6.spec.ts:55:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.fp-trace:visible').first()
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.fp-trace:visible').first() with timeout 15000ms
  - waiting for locator('.fp-trace:visible').first()
  - Protocol error (Runtime.callFunctionOn): Page crashed.

```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import path from "node:path";
  3   | import fs from "node:fs/promises";
  4   | 
  5   | const PROOF_DIR = path.resolve("docs/proofs/archetypes-5-6");
  6   | 
  7   | async function ensureProofDir() {
  8   |   await fs.mkdir(PROOF_DIR, { recursive: true });
  9   | }
  10  | 
  11  | async function dismissCinematic(page: Page) {
  12  |   const start = page.getByRole("button", { name: "Comenzar" });
  13  |   if (await start.isVisible().catch(() => false)) {
  14  |     await start.click();
  15  |   }
  16  | }
  17  | 
  18  | async function expectNoBrokenImages(page: Page, label: string) {
  19  |   const visibleImages = page.locator("img:visible");
  20  |   const count = await visibleImages.count();
  21  |   for (let i = 0; i < count; i++) {
  22  |     const img = visibleImages.nth(i);
  23  |     const natural = await img.evaluate((node: HTMLImageElement) => ({
  24  |       src: node.currentSrc || node.src,
  25  |       complete: node.complete,
  26  |       naturalWidth: node.naturalWidth,
  27  |       naturalHeight: node.naturalHeight,
  28  |     }));
  29  |     expect(
  30  |       natural.complete && natural.naturalWidth > 0 && natural.naturalHeight > 0,
  31  |       `Broken visible image in ${label}: ${natural.src}`
  32  |     ).toBeTruthy();
  33  |   }
  34  | }
  35  | 
  36  | async function checkNoClippingOrOverflow(page: Page, label: string) {
  37  |   const fit = await page.evaluate(() => {
  38  |     const body = document.querySelector<HTMLElement>(".faithful-page__body") || document.body;
  39  |     return {
  40  |       windowOverflowX: document.documentElement.scrollWidth - window.innerWidth,
  41  |       windowOverflowY: document.documentElement.scrollHeight - window.innerHeight,
  42  |       bodyOverflowX: body.scrollWidth - body.clientWidth,
  43  |       bodyOverflowY: body.scrollHeight - body.clientHeight,
  44  |     };
  45  |   });
  46  |   expect(fit.windowOverflowX, `${label} window overflow X`).toBeLessThanOrEqual(2);
  47  |   expect(fit.bodyOverflowX, `${label} body overflow X`).toBeLessThanOrEqual(2);
  48  | }
  49  | 
  50  | test.describe("Workbook Archetype 5 & 6 Proof", () => {
  51  |   test.beforeAll(async () => {
  52  |     await ensureProofDir();
  53  |   });
  54  | 
  55  |   test("Archetype 5: Handwriting/tracing and freehand drawing, progressive fade, persistence, responsive fit, reduced motion", async ({ page }) => {
  56  |     // 1. Laptop fit (1280x800) & Initial visual check on Lesson 7 (Printed page 19 - Archetype 5)
  57  |     await page.setViewportSize({ width: 1280, height: 800 });
  58  |     await page.goto("/cartilla/leccion/7", { waitUntil: "domcontentloaded" });
  59  |     await dismissCinematic(page);
  60  |     // Wait for the real Workbook surface: domcontentloaded alone can capture a
  61  |     // blank page and still pass the generic helpers (the old laptop proof PNG
  62  |     // was an empty canvas).
> 63  |     await expect(page.locator(".fp-trace:visible").first()).toBeVisible({ timeout: 15000 });
      |                                                             ^ Error: expect(locator).toBeVisible() failed
  64  | 
  65  |     await expectNoBrokenImages(page, "Archetype 5 laptop");
  66  |     await checkNoClippingOrOverflow(page, "Archetype 5 laptop");
  67  | 
  68  |     // Capture laptop screenshot
  69  |     await page.screenshot({ path: path.join(PROOF_DIR, "archetype-5-laptop.png") });
  70  | 
  71  |     // Verify tracing guides and freehand drawing controls existence
  72  |     const trace = page.locator(".fp-trace:visible").first();
  73  |     const traceCount = await page.locator(".fp-trace:visible").count();
  74  |     expect(traceCount, "Tracing rows present").toBeGreaterThan(0);
  75  | 
  76  |     const drawCanvas = page.locator(".am-dibuja:visible").first();
  77  |     await expect(drawCanvas).toBeVisible();
  78  | 
  79  |     // Verify mode toggle / progressive fade / stroke interaction on trace
  80  |     const modeToggle = trace.locator(".fp-trace__mode-toggle");
  81  |     if (await modeToggle.isVisible().catch(() => false)) {
  82  |       await modeToggle.click({ force: true });
  83  |       await page.waitForTimeout(200);
  84  |     }
  85  | 
  86  |     // Perform freehand stroke on drawing canvas
  87  |     const drawBox = await drawCanvas.boundingBox();
  88  |     if (drawBox) {
  89  |       await page.mouse.move(drawBox.x + 40, drawBox.y + 40);
  90  |       await page.mouse.down();
  91  |       await page.mouse.move(drawBox.x + 120, drawBox.y + 90, { steps: 10 });
  92  |       await page.mouse.up();
  93  |       await page.waitForTimeout(300);
  94  |     }
  95  | 
  96  |     // Perform stroke on tracing guide
  97  |     const dot = trace.locator(".fp-trace__dot").first();
  98  |     if (await dot.isVisible().catch(() => false)) {
  99  |       await dot.click({ force: true });
  100 |       await page.waitForTimeout(200);
  101 |     }
  102 | 
  103 |     // Capture tracing and drawn proof
  104 |     await page.screenshot({ path: path.join(PROOF_DIR, "archetype-5-tracing-drawn.png") });
  105 | 
  106 |     // Verify persistence (reload page)
  107 |     await page.reload({ waitUntil: "domcontentloaded" });
  108 |     await dismissCinematic(page);
  109 |     await expect(page.locator(".fp-trace:visible").first()).toBeVisible({ timeout: 15000 });
  110 | 
  111 |     // Verify responsive viewports for Archetype 5
  112 |     // Tablet (820x1180)
  113 |     await page.setViewportSize({ width: 820, height: 1180 });
  114 |     await expectNoBrokenImages(page, "Archetype 5 tablet");
  115 |     await page.screenshot({ path: path.join(PROOF_DIR, "archetype-5-tablet.png") });
  116 | 
  117 |     // Phone (390x844)
  118 |     await page.setViewportSize({ width: 390, height: 844 });
  119 |     await expectNoBrokenImages(page, "Archetype 5 phone");
  120 |     await page.screenshot({ path: path.join(PROOF_DIR, "archetype-5-phone.png") });
  121 | 
  122 |     // Reduced motion presentation on desktop viewport
  123 |     await page.setViewportSize({ width: 1280, height: 800 });
  124 |     await page.emulateMedia({ reducedMotion: "reduce" });
  125 |     await page.screenshot({ path: path.join(PROOF_DIR, "archetype-5-reduced-motion.png") });
  126 |     await page.emulateMedia({ reducedMotion: "no-preference" });
  127 |   });
  128 | 
  129 |   test("Archetype 6: Syllable recognition / circle, ordering, save/reload persistence, responsive fit, reduced motion", async ({ page }) => {
  130 |     // 1. Laptop fit (1280x800) on Pilot faithful route for Printed page 20 (Archetype 6)
  131 |     await page.setViewportSize({ width: 1280, height: 800 });
  132 |     await page.goto("/cartilla/pilot-faithful/20", { waitUntil: "domcontentloaded" });
  133 |     await expect(
  134 |       page.locator(".native-syllable:visible, .fp-syllable-match:visible, .am-lasso:visible").first(),
  135 |     ).toBeVisible({ timeout: 15000 });
  136 | 
  137 |     await expectNoBrokenImages(page, "Archetype 6 laptop");
  138 |     await checkNoClippingOrOverflow(page, "Archetype 6 laptop");
  139 | 
  140 |     await page.screenshot({ path: path.join(PROOF_DIR, "archetype-6-laptop.png") });
  141 | 
  142 |     // Verify syllable match rows / circle selection / source ordering
  143 |     const syllableMatchRows = page.locator(".native-syllable:visible, .fp-syllable-match:visible, .am-lasso:visible");
  144 |     const matchCount = await syllableMatchRows.count();
  145 |     expect(matchCount, "Syllable match rows present").toBeGreaterThan(0);
  146 | 
  147 |     // Interact with first syllable / word choice
  148 |     const selectableWord = page.locator(".native-syllable__word:visible, .fp-syllable-match__word:visible, .am-lasso__target:visible").first();
  149 |     if (await selectableWord.isVisible().catch(() => false)) {
  150 |       await selectableWord.click();
  151 |       await page.waitForTimeout(300);
  152 |     }
  153 | 
  154 |     await page.screenshot({ path: path.join(PROOF_DIR, "archetype-6-syllable-selected.png") });
  155 | 
  156 |     // Verify save/reload persistence where supported
  157 |     await page.reload({ waitUntil: "domcontentloaded" });
  158 |     await expect(
  159 |       page.locator(".native-syllable:visible, .fp-syllable-match:visible, .am-lasso:visible").first(),
  160 |     ).toBeVisible({ timeout: 15000 });
  161 | 
  162 |     // Verify responsive viewports for Archetype 6
  163 |     // Tablet (820x1180)
```