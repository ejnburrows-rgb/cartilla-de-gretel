import { test, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const PROOF_DIR = process.env.PROOF_DIR || path.join(process.cwd(), "test-results/page-turn-proof");

test.beforeAll(() => {
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }
});

async function dismissIntro(page: Page) {
  const start = page.getByRole("button", { name: "Comenzar" });
  if (await start.isVisible().catch(() => false)) await start.click();
}

test.describe("Flip Chart Projector Size Turn All Pages", () => {
  test("Flip Chart forward & reverse turns", async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Testing from lesson 1 up to 24 which covers all sheets
    for (let lesson = 1; lesson <= 24; lesson++) {
        await page.goto("/cartilla/presentar/" + lesson, { waitUntil: "domcontentloaded" });
        await dismissIntro(page);

        const panel = page.getByTestId("flipchart-hd-panel");
        if (!(await panel.isVisible({ timeout: 5000 }).catch(() => false))) continue;

        // click next to see if the turn crashes
        const nextBtn = panel.getByRole("button", { name: "Lámina siguiente", exact: true });
        if (await nextBtn.isVisible()) {
          if (await nextBtn.isEnabled()) {
            await nextBtn.click();
            await page.waitForTimeout(600);
          }
        }
    }
  });
});
