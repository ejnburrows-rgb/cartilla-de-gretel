import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

test.describe("Lesson Page Number Diamond Checks", () => {
  const PROOF_DIR = process.env.PROOF_DIR || path.join(process.cwd(), "tests/e2e/proofs");

  test.afterAll(() => {
    if (!fs.existsSync(PROOF_DIR)) {
      fs.mkdirSync(PROOF_DIR, { recursive: true });
    }
  });

  const checkLesson = async (lesson: number, pages: number[], startPage: number, browser: any) => {
    const contextPhone = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pagePhone = await contextPhone.newPage();

    await pagePhone.goto(`/cartilla/leccion/${lesson}`, { waitUntil: "domcontentloaded" });
    await pagePhone.evaluate((l) => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([l]));
      localStorage.setItem("cartilla:completed-lessons", JSON.stringify([l]));
      window.dispatchEvent(new Event("cartilla:lesson-progress"));
    }, lesson);
    await pagePhone.reload({ waitUntil: "domcontentloaded" });

    await expect(pagePhone.locator(".native-lesson-viewer")).toBeVisible({ timeout: 15000 });

    const numPages = pages.length;
    for (let i = 0; i < numPages; i++) {
        await pagePhone.waitForTimeout(1000);
        await pagePhone.screenshot({ path: path.join(PROOF_DIR, `after-390x844-l${lesson}-page-${pages[i]}.png`) });

        if (i < numPages - 1) {
            await pagePhone.keyboard.press('ArrowRight');
        }
    }
    await contextPhone.close();
  };

  test("Check L16 page numbers (55-58)", async ({ browser }) => {
    await checkLesson(16, [55, 56, 57, 58], 55, browser);
  });

  test("Check L17 page numbers (59-62)", async ({ browser }) => {
    await checkLesson(17, [59, 60, 61, 62], 59, browser);
  });

  test("Check L20 page numbers (71-74)", async ({ browser }) => {
    await checkLesson(20, [71, 72, 73, 74], 71, browser);
  });
});
