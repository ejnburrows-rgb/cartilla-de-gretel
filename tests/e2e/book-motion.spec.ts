import { test, expect, type Page } from "@playwright/test";

async function dismissIntro(page: Page) {
  const start = page.getByRole("button", { name: "Comenzar" });
  if (await start.isVisible().catch(() => false)) await start.click();
}

test.describe("physical Workbook and Flip Chart motion", () => {
  test("full Workbook turns a real leaf and locks rapid navigation", async ({ page }) => {
    await page.goto("/cartilla/cuaderno", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);

    const reader = page.locator(".digital-reader");
    await expect(reader).toHaveAttribute("data-physical-workbook", "true");
    await expect(reader).toHaveAttribute("data-page-turn-ms", "800");

    const next = reader.getByRole("button", { name: "Página siguiente" });
    await next.click();
    await expect(next).toBeDisabled();

    const leaf = reader.getByTestId("workbook-turn-leaf");
    await expect(leaf).toBeVisible();
    await expect
      .poll(async () => leaf.locator(".workbook-flip-wrapper").getAttribute("style"), { timeout: 700 })
      .toContain("rotateY(-180deg)");

    await expect(leaf).toHaveCount(0, { timeout: 1800 });
    const previous = reader.getByRole("button", { name: "Página anterior" });
    await previous.click();
    await expect(reader.getByTestId("workbook-turn-leaf")).toBeVisible();
  });

  test("lesson viewer keeps completion gating while using the physical leaf", async ({ page }) => {
    await page.goto("/cartilla/leccion/8", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);

    const reader = page.locator(".native-lesson-viewer");
    await expect(reader).toHaveAttribute("data-physical-workbook", "true");
    await expect(reader).toHaveAttribute("data-page-turn-ms", "800");

    const next = reader.getByRole("button", { name: "Siguiente" });
    await expect(next).toBeEnabled();
    await next.click();
    await expect(reader.getByTestId("workbook-turn-leaf")).toBeVisible();
    await expect(reader.getByTestId("workbook-turn-leaf")).toHaveCount(0, { timeout: 1800 });
  });

  test("teacher Flip Chart turns upward over visible top rings", async ({ page }) => {
    await page.goto("/cartilla/presentar/7", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);

    const panel = page.getByTestId("flipchart-hd-panel");
    await expect(panel).toBeVisible({ timeout: 15000 });
    await expect(panel).toHaveAttribute("data-physical-flipchart", "true");
    await expect(panel).toHaveAttribute("data-page-turn-axis", "vertical");
    await expect(panel).toHaveAttribute("data-page-turn-ms", "980");
    await expect(panel.locator(".fc-board__binding")).toHaveCount(1);
    await expect(panel.locator(".fc-board__ring")).toHaveCount(6);

    const counter = panel.getByTestId("flipchart-counter");
    await expect(counter).toContainText("Hoja 1 de");
    const next = panel.getByRole("button", { name: /Lámina siguiente/i });
    if (await next.isEnabled()) {
      await next.click();
      const layer = panel.getByTestId("vertical-flip-layer");
      await expect(layer).toBeVisible();
      await expect
        .poll(async () => layer.locator(".flipchart-flip-wrapper").getAttribute("style"), { timeout: 700 })
        .toContain("rotateX(-180deg)");
      await expect(counter).toContainText("Hoja 2 de", { timeout: 2200 });

      const previous = panel.getByRole("button", { name: /Lámina anterior/i });
      await previous.click();
      await expect(panel.getByTestId("vertical-flip-layer")).toBeVisible();
    }
  });

  test("reduced motion replaces 3D turns without changing navigation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/cartilla/cuaderno", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);

    const reader = page.locator(".digital-reader");
    const next = reader.getByRole("button", { name: "Página siguiente" });
    await next.click();
    await expect(reader.getByTestId("workbook-turn-leaf")).toHaveCount(0);
    await expect(reader.getByRole("button", { name: "Página anterior" })).toBeEnabled();
  });
});
