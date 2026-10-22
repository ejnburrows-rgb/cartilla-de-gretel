import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

test.describe("Lesson 17 Page Number Diamond Checks", () => {
  const PROOF_DIR = process.env.PROOF_DIR || path.join(process.cwd(), "docs/proofs/l17-diamond-2026-10-20");

  test.afterAll(() => {
    if (!fs.existsSync(PROOF_DIR)) {
      fs.mkdirSync(PROOF_DIR, { recursive: true });
    }
  });

  test("Check L17 page numbers (pages 59-62) clear corner peel", async ({ page, browser }) => {
    // 390x844 (phone portrait)
    const contextPhone = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pagePhone = await contextPhone.newPage();

    // Unlock lesson 17
    await pagePhone.goto("/cartilla/leccion/17", { waitUntil: "domcontentloaded" });
    await pagePhone.evaluate(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([17]));
      localStorage.setItem("cartilla:completed-lessons", JSON.stringify([17]));
      window.dispatchEvent(new Event("cartilla:lesson-progress"));
    });
    await pagePhone.reload({ waitUntil: "domcontentloaded" });

    // Wait for the lesson viewer
    await expect(pagePhone.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

    const numPages = 4; // L17 has 4 pages (59, 60, 61, 62)
    for (let i = 0; i < numPages; i++) {
        await pagePhone.waitForTimeout(1000);
        await pagePhone.screenshot({ path: path.join(PROOF_DIR, `after-390x844-page-${59 + i}.png`) });

        if (i < numPages - 1) {
            await pagePhone.keyboard.press('ArrowRight');
        }
    }
    
    await contextPhone.close();
    
    // 844x390 (phone landscape)
    const contextLandscape = await browser.newContext({ viewport: { width: 844, height: 390 } });
    const pageLandscape = await contextLandscape.newPage();

    // Unlock lesson 17
    await pageLandscape.goto("/cartilla/leccion/17", { waitUntil: "domcontentloaded" });
    await pageLandscape.evaluate(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([17]));
      localStorage.setItem("cartilla:completed-lessons", JSON.stringify([17]));
      window.dispatchEvent(new Event("cartilla:lesson-progress"));
    });
    await pageLandscape.reload({ waitUntil: "domcontentloaded" });

    // Wait for the lesson viewer
    await expect(pageLandscape.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

    for (let i = 0; i < numPages; i++) {
        await pageLandscape.waitForTimeout(1000);
        await pageLandscape.screenshot({ path: path.join(PROOF_DIR, `after-844x390-page-${59 + i}.png`) });

        if (i < numPages - 1) {
            await pageLandscape.keyboard.press('ArrowRight');
        }
    }
    
    await contextLandscape.close();
  });
});
