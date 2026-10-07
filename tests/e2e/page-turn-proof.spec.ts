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

test.describe("Page Turn System - Visual Proof Milestone", () => {
  test("Workbook forward & reverse physical page turn frames", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cartilla/cuaderno", { waitUntil: "domcontentloaded" });

    const reader = page.getByTestId("physical-book-reader");
    await expect(reader).toBeVisible({ timeout: 15000 });

    // 1. Before turn
    await page.screenshot({ path: path.join(PROOF_DIR, "workbook-01-before.png") });

    // 2. Click Siguiente and capture mid-turn curl
    const nextBtn = page.getByRole("button", { name: "Siguiente" });
    await nextBtn.click();
    await page.waitForTimeout(250); // Mid-turn (~250ms into 800ms)
    await page.screenshot({ path: path.join(PROOF_DIR, "workbook-02-mid-turn.png") });

    // 3. Wait for turn to settle completely
    await page.waitForTimeout(1100);
    await page.screenshot({ path: path.join(PROOF_DIR, "workbook-03-settled-next.png") });

    // 4. Click Anterior and capture reverse turn
    const prevBtn = page.getByRole("button", { name: "Anterior" });
    await expect(prevBtn).toBeEnabled({ timeout: 5000 });
    await prevBtn.click();
    await page.waitForTimeout(250); // Mid-turn reverse
    await page.screenshot({ path: path.join(PROOF_DIR, "workbook-04-reverse-turn.png") });
  });

  test("Flip Chart forward & reverse physical page turn frames", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cartilla/presentar/7", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);

    const panel = page.getByTestId("flipchart-hd-panel");
    await expect(panel).toBeVisible({ timeout: 15000 });

    // 1. Before turn
    await page.screenshot({ path: path.join(PROOF_DIR, "flipchart-01-before.png") });

    // 2. Click Siguiente and capture mid-turn flip over top binding
    const nextBtn = panel.getByRole("button", { name: /Lámina siguiente/i });
    await nextBtn.click();
    await page.waitForTimeout(320); // Mid-turn (~320ms into 980ms)
    await page.screenshot({ path: path.join(PROOF_DIR, "flipchart-02-mid-turn.png") });

    // 3. Wait for turn to settle
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(PROOF_DIR, "flipchart-03-settled-next.png") });

    // 4. Click Anterior and capture reverse turn
    const prevBtn = panel.getByRole("button", { name: /Lámina anterior/i });
    await prevBtn.click();
    await page.waitForTimeout(320); // Mid-turn reverse
    await page.screenshot({ path: path.join(PROOF_DIR, "flipchart-04-reverse-turn.png") });
  });

  test("Representative device views (tablet, mobile, projector)", async ({ page }) => {
    // Tablet view (Workbook)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/cartilla/cuaderno", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("physical-book-reader")).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(PROOF_DIR, "representative-tablet.png") });

    // Phone view (Workbook)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/cartilla/cuaderno", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("physical-book-reader")).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(PROOF_DIR, "representative-mobile.png") });

    // Projector view (Teacher Flipchart)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/cartilla/presentar/7", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);
    await expect(page.getByTestId("flipchart-hd-panel")).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(PROOF_DIR, "representative-projector.png") });
  });
});
