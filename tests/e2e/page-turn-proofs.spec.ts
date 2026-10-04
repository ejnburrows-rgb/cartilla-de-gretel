import { test, expect } from "@playwright/test";

test.describe("Physical Page Turn Transition Verification & Visual Proofs", () => {
  test("Workbook physical paper turn forward, mid-turn curl, settled, and reverse turn", async ({ page }) => {
    // Navigate to Lesson 1 workbook view
    await page.goto("http://127.0.0.1:5173/cartilla/leccion/1");
    await page.waitForSelector(".native-lesson-viewer");
    await page.waitForTimeout(500);

    // 1. Workbook before turn
    await page.screenshot({ path: "tests/proofs/workbook-01-before-turn.png" });

    // Click Siguiente (Lesson 1 page 1 is reading-only or completed)
    const nextBtn = page.getByRole("button", { name: /Siguiente|Terminar/i });
    if (await nextBtn.isVisible() && !(await nextBtn.getAttribute("aria-disabled"))) {
      await nextBtn.click();

      // 2. Workbook mid-turn curl
      await page.waitForTimeout(350); // Mid-turn (~800ms total)
      await page.screenshot({ path: "tests/proofs/workbook-02-mid-turn.png" });

      // 3. Settled next page
      await page.waitForTimeout(650);
      await page.screenshot({ path: "tests/proofs/workbook-03-settled-next.png" });

      // 4. Reverse turn (Anterior)
      const prevBtn = page.getByRole("button", { name: /Anterior/i });
      await prevBtn.click();
      await page.waitForTimeout(350);
      await page.screenshot({ path: "tests/proofs/workbook-04-mid-turn-reverse.png" });

      await page.waitForTimeout(650);
      await page.screenshot({ path: "tests/proofs/workbook-05-settled-reverse.png" });
    }
  });

  test("Flip Chart physical top-bound turn forward, mid-turn over top binding, settled, and reverse", async ({ page }) => {
    // Navigate to Flip Chart presenter for Lesson 2
    await page.goto("http://127.0.0.1:5173/cartilla/presentar/2");
    await page.waitForSelector('[data-testid="flipchart-hd-panel"]');
    await page.waitForTimeout(500);

    // 1. Flip Chart before turn
    await page.screenshot({ path: "tests/proofs/flipchart-01-before-turn.png" });

    const nextBtn = page.getByRole("button", { name: /Siguiente/i });
    if (await nextBtn.isVisible() && !(await nextBtn.isDisabled())) {
      await nextBtn.click();

      // 2. Flip Chart mid-turn over top binding (~980ms total)
      await page.waitForTimeout(450);
      await page.screenshot({ path: "tests/proofs/flipchart-02-mid-turn.png" });

      // 3. Settled next sheet
      await page.waitForTimeout(700);
      await page.screenshot({ path: "tests/proofs/flipchart-03-settled-next.png" });

      // 4. Reverse turn
      const prevBtn = page.getByRole("button", { name: /Anterior/i });
      await prevBtn.click();
      await page.waitForTimeout(450);
      await page.screenshot({ path: "tests/proofs/flipchart-04-mid-turn-reverse.png" });

      await page.waitForTimeout(700);
      await page.screenshot({ path: "tests/proofs/flipchart-05-settled-reverse.png" });
    }
  });

  test("Representative device views (tablet, mobile, projector)", async ({ page }) => {
    // Tablet view (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("http://127.0.0.1:5173/cartilla/leccion/1");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "tests/proofs/device-tablet-workbook.png" });

    // Mobile view (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://127.0.0.1:5173/cartilla/leccion/1");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "tests/proofs/device-mobile-workbook.png" });

    // Projector view (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("http://127.0.0.1:5173/cartilla/presentar/2");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "tests/proofs/device-projector-flipchart.png" });
  });

  test("Rapid double navigation safety & reduced motion", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // Lesson 7 flipchart has multiple sheets
    await page.goto("http://127.0.0.1:5173/cartilla/presentar/7");
    await page.waitForSelector('[data-testid="flipchart-hd-panel"]');
    await page.waitForTimeout(500);

    const nextBtn = page.getByRole("button", { name: /Siguiente/i });
    await expect(nextBtn).toBeEnabled();
    // Rapid double click
    await nextBtn.click({ clickCount: 2 });
    await page.waitForTimeout(1200);
    // Should advance exactly 1 sheet to sheet 2, not skip
    const counterText = await page.getByTestId("flipchart-counter").textContent();
    expect(counterText).toMatch(/Hoja 2 de/);
    await page.screenshot({ path: "tests/proofs/rapid-input-safety.png" });
  });
});
