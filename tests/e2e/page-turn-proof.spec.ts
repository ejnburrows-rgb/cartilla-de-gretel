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

    const reader = page.locator(".native-lesson-viewer");
    await expect(reader).toBeVisible({ timeout: 15000 });
    await expect(page.locator("[data-native-page]")).toHaveCount(1);
    await expect(page.getByTestId("physical-book-reader")).toHaveCount(0);

    // 1. Before turn
    await page.screenshot({ path: path.join(PROOF_DIR, "workbook-01-before.png") });

    // 2. Click Siguiente and capture mid-turn curl
    const nextBtn = page.getByRole("button", { name: "Siguiente" });
    await nextBtn.click();
    await page.waitForTimeout(600); // Mid-turn during the 2-second native curl
    await page.screenshot({ path: path.join(PROOF_DIR, "workbook-02-mid-turn.png") });

    // 3. Wait for turn to settle completely
    await expect(reader).toHaveAttribute("data-native-page", "2", { timeout: 5000 });
    await page.screenshot({ path: path.join(PROOF_DIR, "workbook-03-settled-next.png") });

    // 4. Click Anterior and capture reverse turn
    const prevBtn = page.getByRole("button", { name: "Anterior" });
    await expect(prevBtn).toBeEnabled({ timeout: 5000 });
    await prevBtn.click();
    await page.waitForTimeout(600); // Mid-turn reverse
    await page.screenshot({ path: path.join(PROOF_DIR, "workbook-04-reverse-turn.png") });
    await expect(reader).toHaveAttribute("data-native-page", "1", { timeout: 5000 });
  });

  test("Current native book renders page 45 on desktop and final page 90 on phone", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/cartilla/lecciones");
    await page.evaluate(() => localStorage.setItem("cartilla.workbook-reader-page.v1", "45"));
    await page.goto("/cartilla/cuaderno");
    const reader = page.locator(".native-lesson-viewer");
    await expect(reader).toHaveAttribute("data-native-page", "45");
    await expect(page.locator("[data-native-page]")).toHaveCount(1);
    await expect(page.getByTestId("physical-book-reader")).toHaveCount(0);
    await expect(page.getByTestId("book-companion-anchor")).toHaveCount(0);
    await page.screenshot({ path: path.join(PROOF_DIR, "workbook-page45-desktop.png"), fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => localStorage.setItem("cartilla.workbook-reader-page.v1", "90"));
    await page.reload();
    await expect(reader).toHaveAttribute("data-native-page", "90");
    await expect(page.getByRole("button", { name: "Fin del cuaderno" })).toBeDisabled();
    await page.screenshot({ path: path.join(PROOF_DIR, "workbook-page90-phone.png"), fullPage: true });
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
    const nextBtn = panel.getByRole("button", { name: "Lámina siguiente", exact: true });
    await nextBtn.click();
    await page.waitForTimeout(600); // Mid-turn (~600ms into 2000ms)
    await page.screenshot({ path: path.join(PROOF_DIR, "flipchart-02-mid-turn.png") });

    // 3. Wait for turn to settle
    await page.waitForTimeout(1600);
    await page.screenshot({ path: path.join(PROOF_DIR, "flipchart-03-settled-next.png") });

    // 4. Click Anterior and capture reverse turn
    const prevBtn = panel.getByRole("button", { name: "Lámina anterior", exact: true });
    await prevBtn.click();
    await page.waitForTimeout(320); // Mid-turn reverse
    await page.screenshot({ path: path.join(PROOF_DIR, "flipchart-04-reverse-turn.png") });
  });

  test("Representative device views (tablet, mobile, projector)", async ({ page }) => {
    // Tablet view (Workbook)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/cartilla/cuaderno", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-native-page]")).toHaveCount(1);
    await expect(page.getByTestId("physical-book-reader")).toHaveCount(0);
    await page.screenshot({ path: path.join(PROOF_DIR, "representative-tablet.png") });

    // Phone view (Workbook)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/cartilla/cuaderno", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-native-page]")).toHaveCount(1);
    await expect(page.getByTestId("physical-book-reader")).toHaveCount(0);
    await page.screenshot({ path: path.join(PROOF_DIR, "representative-mobile.png") });

    // Projector view (Teacher Flipchart)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/cartilla/presentar/7", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);
    await expect(page.getByTestId("flipchart-hd-panel")).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(PROOF_DIR, "representative-projector.png") });
  });
});
