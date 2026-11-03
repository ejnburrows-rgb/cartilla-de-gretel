# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility-preflight.spec.ts >> Non-Workbook Accessibility & Keyboard Preflight (#561 Excluded) >> 5. Flip Chart presenter controls accessibility, ARIA labels, and keyboard navigation
- Location: tests\e2e\accessibility-preflight.spec.ts:275:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('flipchart-counter')
Expected substring: "Hoja 2 de 3"
Received string:    "Hoja 1 de 3Lámina 9 · Lección 7"
Timeout: 5000ms

Call log:
  - Expect "toContainText" getByTestId('flipchart-counter') with timeout 5000ms
  - waiting for getByTestId('flipchart-counter')
    14 × locator resolved to <div class="fc-board__counter" data-testid="flipchart-counter">…</div>
       - unexpected value "Hoja 1 de 3Lámina 9 · Lección 7"

```

```yaml
- text: Hoja 1 de 3 Lámina 9 · Lección 7
```

# Test source

```ts
  236 |     await expect(table).toBeVisible();
  237 |     const thead = page.locator("table thead");
  238 |     await expect(thead).toBeVisible();
  239 | 
  240 |     const headers = page.locator("table th");
  241 |     const headerCount = await headers.count();
  242 |     expect(headerCount).toBeGreaterThan(0);
  243 | 
  244 |     // Table container keyboard scrollability / visibility
  245 |     const tableContainer = page.locator("div.overflow-x-auto");
  246 |     await expect(tableContainer).toBeVisible();
  247 | 
  248 |     await page.screenshot({
  249 |       path: path.join(PROOF_DIR, "04a-progress-controls.png"),
  250 |       fullPage: true,
  251 |     });
  252 | 
  253 |     // 4b. Reports Page
  254 |     await page.goto("/cartilla/teacher/reportes");
  255 |     await expect(page.locator("text=Panel de Reportes")).toBeVisible();
  256 | 
  257 |     const csvBtn = page.locator("button:has-text('Exportar CSV')").first();
  258 |     await expect(csvBtn).toBeVisible();
  259 |     await verifyVisibleFocus(page, csvBtn);
  260 | 
  261 |     const printBtn = page.getByRole("button", { name: /Imprimir/i }).first();
  262 |     if (await printBtn.isVisible()) {
  263 |       await verifyVisibleFocus(page, printBtn);
  264 |     }
  265 | 
  266 |     await page.screenshot({
  267 |       path: path.join(PROOF_DIR, "04b-reports-controls.png"),
  268 |       fullPage: true,
  269 |     });
  270 |   });
  271 | 
  272 |   // --------------------------------------------------------------------------
  273 |   // 5. Flip Chart Controls
  274 |   // --------------------------------------------------------------------------
  275 |   test("5. Flip Chart presenter controls accessibility, ARIA labels, and keyboard navigation", async ({
  276 |     page,
  277 |   }) => {
  278 |     // 5a. Test Single-Page Lesson Presenter
  279 |     await page.goto("/cartilla/presentar/1");
  280 | 
  281 |     const stage = page.getByTestId("flipchart-stage");
  282 |     await expect(stage).toBeVisible({ timeout: 30_000 });
  283 | 
  284 |     const header = page.getByTestId("teacher-presenter-header");
  285 |     await expect(header).toBeVisible();
  286 | 
  287 |     // Header buttons & ARIA labels
  288 |     const exitBtn = page.locator('button[aria-label="Volver al panel del docente"]');
  289 |     const laserBtn = page.locator('button[aria-label="Alternar puntero láser"]');
  290 |     const focusBtn = page.locator('button[aria-label="Modo proyección sin cromo"]');
  291 |     const fullscreenBtn = page.locator('button[aria-label="Alternar pantalla completa"]');
  292 | 
  293 |     await expect(exitBtn).toBeVisible();
  294 |     await expect(laserBtn).toBeVisible();
  295 |     await expect(focusBtn).toBeVisible();
  296 |     await expect(fullscreenBtn).toBeVisible();
  297 | 
  298 |     await verifyVisibleFocus(page, exitBtn);
  299 |     await verifyVisibleFocus(page, laserBtn);
  300 |     await verifyVisibleFocus(page, focusBtn);
  301 |     await verifyVisibleFocus(page, fullscreenBtn);
  302 | 
  303 |     // 5b. Test Multi-Page Lesson Presenter (Lesson 7 has 3 sheets)
  304 |     await page.goto("/cartilla/presentar/7");
  305 |     await expect(stage).toBeVisible({ timeout: 30_000 });
  306 | 
  307 |     const prevBtn = page.locator('button[aria-label="Lámina anterior"]');
  308 |     const nextBtn = page.locator('button[aria-label="Lámina siguiente"]');
  309 | 
  310 |     await expect(prevBtn).toBeVisible();
  311 |     await expect(nextBtn).toBeVisible();
  312 | 
  313 |     if (await nextBtn.isEnabled()) {
  314 |       await verifyVisibleFocus(page, nextBtn);
  315 |     }
  316 | 
  317 |     // Verify counter
  318 |     const counter = page.getByTestId("flipchart-counter");
  319 |     await expect(counter).toContainText("Hoja 1 de 3");
  320 | 
  321 |     // Thumbnail strip tabs
  322 |     const tabs = page.getByRole("tab", { name: /Ir a hoja/ });
  323 |     const tabCount = await tabs.count();
  324 |     expect(tabCount).toBe(3);
  325 | 
  326 |     for (let i = 0; i < tabCount; i++) {
  327 |       const tab = tabs.nth(i);
  328 |       if (await tab.isEnabled()) {
  329 |         await verifyVisibleFocus(page, tab);
  330 |       }
  331 |     }
  332 | 
  333 |     // Keyboard Arrow navigation check
  334 |     await page.keyboard.press("ArrowRight");
  335 |     await page.waitForTimeout(500);
> 336 |     await expect(counter).toContainText("Hoja 2 de 3");
      |                           ^ Error: expect(locator).toContainText(expected) failed
  337 | 
  338 |     await page.keyboard.press("ArrowLeft");
  339 |     await page.waitForTimeout(500);
  340 |     await expect(counter).toContainText("Hoja 1 de 3");
  341 | 
  342 |     await page.screenshot({
  343 |       path: path.join(PROOF_DIR, "05-flipchart-controls.png"),
  344 |       fullPage: true,
  345 |     });
  346 |   });
  347 | 
  348 |   // --------------------------------------------------------------------------
  349 |   // 6. Reduced Motion Preference Respected by Shared Chrome
  350 |   // --------------------------------------------------------------------------
  351 |   test("6. Reduced-motion preference respected by shared chrome and flip chart panel", async ({
  352 |     page,
  353 |   }) => {
  354 |     // Emulate reduced motion preference
  355 |     await page.emulateMedia({ reducedMotion: "reduce" });
  356 | 
  357 |     await page.goto("/cartilla/presentar/1");
  358 |     const panel = page.getByTestId("flipchart-hd-panel");
  359 |     await expect(panel).toBeVisible({ timeout: 30_000 });
  360 | 
  361 |     // Verify data-reduced-motion attribute on the panel
  362 |     await expect(panel).toHaveAttribute("data-reduced-motion", "true");
  363 | 
  364 |     // Verify transition duration is near-zero in computed styles
  365 |     const navBtn = page.locator('button[aria-label="Lámina anterior"]');
  366 |     const transitionDuration = await navBtn.evaluate((el) => {
  367 |       return window.getComputedStyle(el).transitionDuration;
  368 |     });
  369 | 
  370 |     const toSeconds = (v: string) => {
  371 |       const t = v.trim();
  372 |       const n = parseFloat(t);
  373 |       if (isNaN(n)) return 0;
  374 |       return t.endsWith("ms") ? n / 1000 : n;
  375 |     };
  376 |     const durations = transitionDuration.split(",").map(toSeconds);
  377 |     expect(
  378 |       durations.every((d) => d <= 0.01),
  379 |       `reduced-motion transition durations must be near-zero, got ${transitionDuration}`,
  380 |     ).toBe(true);
  381 | 
  382 |     await page.screenshot({
  383 |       path: path.join(PROOF_DIR, "06-reduced-motion-chrome.png"),
  384 |       fullPage: true,
  385 |     });
  386 |   });
  387 | });
  388 | 
```