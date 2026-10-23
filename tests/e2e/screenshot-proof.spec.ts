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

test.describe("Screenshot Proofs for Resolution", () => {
  test("Flip Chart Phone View (390px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/cartilla/presentar/6", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);
    await expect(page.getByTestId("flipchart-hd-panel")).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(PROOF_DIR, "390px-phone-flipchart.png") });
  });

  test("Flip Chart Tablet View (820px)", async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto("/cartilla/presentar/6", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);
    await expect(page.getByTestId("flipchart-hd-panel")).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(PROOF_DIR, "820px-tablet-flipchart.png") });
  });

  test("Flip Chart Laptop View (1440px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/cartilla/presentar/6", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);
    await expect(page.getByTestId("flipchart-hd-panel")).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(PROOF_DIR, "1440px-laptop-flipchart.png") });
  });
});
