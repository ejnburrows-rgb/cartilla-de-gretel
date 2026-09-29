import { test, expect, type Page } from "@playwright/test";

async function dismissIntro(page: Page) {
  const start = page.getByRole("button", { name: "Comenzar" });
  if (await start.isVisible().catch(() => false)) await start.click();
}

test.describe("native lesson and presenter motion", () => {
  test("student lesson uses native page navigation", async ({ page }) => {
    await page.goto("/cartilla/leccion/8", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);

    const reader = page.locator(".native-lesson-viewer");
    await expect(reader).toBeVisible();
    await expect(page.getByTestId("physical-book-reader")).toHaveCount(0);
    await expect(reader.locator(".native-lesson-viewer__content")).toBeVisible();
    await expect(reader.locator(".native-lesson-viewer__navigation")).toBeVisible();

    const gretel = page.getByTestId("gretel-presence");
    await expect(gretel).toHaveAttribute("data-placement", "book");
    await expect(gretel).toHaveAttribute("data-page-ready", "true", { timeout: 2500 });

    const counter = reader.locator(".native-lesson-viewer__page");
    const before = (await counter.textContent()) ?? "";
    const next = reader.getByRole("button", { name: "Siguiente" });
    await expect(next).toBeEnabled();
    await next.click();

    await expect
      .poll(async () => (await counter.textContent()) ?? "", { timeout: 2500 })
      .not.toBe(before);
  });

  test("teacher presenter keeps the vertical native Flip Chart transition", async ({ page }) => {
    await page.goto("/cartilla/presentar/7", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);

    const panel = page.getByTestId("flipchart-hd-panel");
    await expect(panel).toBeVisible({ timeout: 15000 });
    await expect(panel).toHaveAttribute("data-hd-primary", "true");
    await expect(panel).toHaveAttribute("data-presenter-mode", "native");
    await expect(panel).toHaveAttribute("data-page-turn-axis", "vertical");
    await expect(panel).toHaveAttribute("data-page-turn-ms", "1120");
    await expect(panel).not.toHaveAttribute("data-physical-flipchart", /.*/);
    await expect(panel.locator(".fc-board__ring")).toHaveCount(0);
    await expect(panel.locator(".fc-board__binding")).toHaveCount(0);
    await expect(panel.locator('[data-native-flipchart="true"]')).toBeVisible();

    const counter = panel.getByTestId("flipchart-counter");
    await expect(counter).toContainText("Hoja 1 de");

    const next = panel.getByRole("button", { name: /Lámina siguiente/i });
    if (await next.isEnabled()) {
      await next.click();
      const flipLayer = panel.getByTestId("vertical-flip-layer");
      await expect(flipLayer).toBeVisible();

      const wrapper = flipLayer.locator(".flipchart-flip-wrapper");
      await expect
        .poll(async () => wrapper.getAttribute("style"), { timeout: 700 })
        .toContain("rotateX(-180deg)");

      await expect(counter).toContainText("Hoja 2 de", { timeout: 2500 });
    }
  });
});
