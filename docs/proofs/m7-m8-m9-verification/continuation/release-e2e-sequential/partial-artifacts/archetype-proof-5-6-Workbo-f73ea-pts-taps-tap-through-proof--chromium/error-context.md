# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: archetype-proof-5-6.spec.ts >> Workbook Archetype 5 & 6 Proof >> Issue #660: trace hint never intercepts taps (tap-through proof)
- Location: tests\e2e\archetype-proof-5-6.spec.ts:180:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.fp-trace:visible').first()
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.fp-trace:visible').first() with timeout 15000ms
  - waiting for locator('.fp-trace:visible').first()
  - Page crashed

```

# Test source

```ts
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
  164 |     await page.setViewportSize({ width: 820, height: 1180 });
  165 |     await expectNoBrokenImages(page, "Archetype 6 tablet");
  166 |     await page.screenshot({ path: path.join(PROOF_DIR, "archetype-6-tablet.png") });
  167 | 
  168 |     // Phone (390x844)
  169 |     await page.setViewportSize({ width: 390, height: 844 });
  170 |     await expectNoBrokenImages(page, "Archetype 6 phone");
  171 |     await page.screenshot({ path: path.join(PROOF_DIR, "archetype-6-phone.png") });
  172 | 
  173 |     // Reduced motion presentation on desktop viewport
  174 |     await page.setViewportSize({ width: 1280, height: 800 });
  175 |     await page.emulateMedia({ reducedMotion: "reduce" });
  176 |     await page.screenshot({ path: path.join(PROOF_DIR, "archetype-6-reduced-motion.png") });
  177 |     await page.emulateMedia({ reducedMotion: "no-preference" });
  178 |   });
  179 | 
  180 |   test("Issue #660: trace hint never intercepts taps (tap-through proof)", async ({ page }) => {
  181 |     // Narrow phone viewport where the nowrap hint can span the footer and
  182 |     // overlap the mode toggle / tracing surface.
  183 |     await page.setViewportSize({ width: 390, height: 844 });
  184 |     await page.goto("/cartilla/leccion/7", { waitUntil: "domcontentloaded" });
  185 |     await dismissCinematic(page);
  186 |     const trace = page.locator(".fp-trace:visible").first();
> 187 |     await expect(trace).toBeVisible({ timeout: 15000 });
      |                         ^ Error: expect(locator).toBeVisible() failed
  188 | 
  189 |     const hint = trace.locator(".fp-trace__hint:visible").first();
  190 |     await expect(hint, "trace hint is rendered").toBeVisible({ timeout: 10000 });
  191 | 
  192 |     // 1. The hint must be non-interactive by style.
  193 |     const pointerEvents = await hint.evaluate((el) => getComputedStyle(el).pointerEvents);
  194 |     expect(pointerEvents, "hint pointer-events").toBe("none");
  195 | 
  196 |     // 2. Hit-testing at the hint's center must skip the hint element.
  197 |     const hit = await hint.evaluate((el) => {
  198 |       const r = el.getBoundingClientRect();
  199 |       const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) as HTMLElement | null;
  200 |       return {
  201 |         topTag: top?.tagName ?? null,
  202 |         topClass: String(top?.className ?? "").slice(0, 80),
  203 |         isHint: top === el || !!top?.closest?.(".fp-trace__hint"),
  204 |       };
  205 |     });
  206 |     expect(hit.isHint, `hit-test at hint center must not land on the hint (landed on ${hit.topTag}.${hit.topClass})`).toBe(false);
  207 | 
  208 |     // 3. A real tap at the hint's center must reach the layer beneath, not the hint.
  209 |     await page.evaluate(() => {
  210 |       (window as unknown as { __tapTarget: unknown }).__tapTarget = null;
  211 |       document.addEventListener(
  212 |         "pointerdown",
  213 |         (e) => {
  214 |           const t = e.target as HTMLElement;
  215 |           (window as unknown as { __tapTarget: unknown }).__tapTarget = {
  216 |             tag: t.tagName,
  217 |             cls: String(t.className ?? "").slice(0, 80),
  218 |             isHint: !!t.closest(".fp-trace__hint"),
  219 |           };
  220 |         },
  221 |         { capture: true, once: true },
  222 |       );
  223 |     });
  224 |     const box = await hint.boundingBox();
  225 |     expect(box, "hint has a bounding box").not.toBeNull();
  226 |     await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  227 |     const tapTarget = await page.evaluate(
  228 |       () => (window as unknown as { __tapTarget: { tag: string; cls: string; isHint: boolean } | null }).__tapTarget,
  229 |     );
  230 |     expect(tapTarget, "tap was captured").not.toBeNull();
  231 |     expect(tapTarget!.isHint, `tap at hint center must not target the hint (targeted ${tapTarget!.tag}.${tapTarget!.cls})`).toBe(false);
  232 | 
  233 |     // 4. The hint is still visible (non-interactive, not removed).
  234 |     await expect(hint).toBeVisible();
  235 |     await page.screenshot({ path: path.join(PROOF_DIR, "trace-hint-tap-through-390x844.png") });
  236 |   });
  237 | });
  238 | 
```