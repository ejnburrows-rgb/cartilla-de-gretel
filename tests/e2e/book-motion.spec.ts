import { test, expect } from "@playwright/test";

test.describe("physical book motion", () => {
  test("student lesson is a horizontal bound-book turn", async ({ page }) => {
    await page.goto("/cartilla/leccion/7", { waitUntil: "networkidle" });

    const reader = page.getByTestId("physical-book-reader");
    await expect(reader).toBeVisible();
    await expect(reader).toHaveAttribute("data-page-turn-axis", "horizontal");
    await expect(reader).toHaveAttribute("data-page-turn-ms", "960");
    await expect(reader).toHaveAttribute("data-page-turn-gesture", "edge-drag");
    await expect(reader).toHaveAttribute("data-book-companion", "true");
    await expect(reader.locator(".premium-book-shell")).toHaveCount(1);
    await expect(reader.locator(".premium-pageflip")).toHaveCount(1);
    const gretel = reader.getByTestId("gretel-presence");
    await expect(gretel).toHaveAttribute("data-placement", "book");
    await expect(gretel).toHaveAttribute("data-page-ready", "true", { timeout: 2500 });

    const counter = reader.getByTestId("physical-book-counter");
    const before = (await counter.textContent()) ?? "";
    const next = reader.getByRole("button", { name: /Siguiente/i });
    await expect(next).toBeEnabled();
    await next.click();

    await expect
      .poll(async () => (await counter.textContent()) ?? "", {
        timeout: 2500,
      })
      .not.toBe(before);
  });

  // The presenter keeps the vertical, top-bound *motion* of a paper flipchart
  // but deliberately drops the drawn binding hardware: the board is a clean
  // digital surface. That is the contract asserted by
  // src/components/cartilla/__tests__/FlipchartHdPanel.test.tsx ("renders a
  // wide clean digital presenter without simulated binding hardware"), so this
  // spec asserts the same thing end to end instead of the abandoned
  // skeuomorphic `data-physical-flipchart` / ring-spiral variant.
  test("teacher presenter is a vertical top-bound flipchart", async ({ page }) => {
    await page.goto("/cartilla/presentar/7", { waitUntil: "networkidle" });

    const panel = page.getByTestId("flipchart-hd-panel");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-hd-primary", "true");
    await expect(panel).toHaveAttribute("data-presenter-mode", "digital");
    await expect(panel).toHaveAttribute("data-page-turn-axis", "vertical");
    await expect(panel).toHaveAttribute("data-page-turn-ms", "1120");
    await expect(panel).not.toHaveAttribute("data-physical-flipchart", /.*/);
    await expect(panel.locator(".fc-board__ring")).toHaveCount(0);
    await expect(panel.locator(".fc-board__binding")).toHaveCount(0);

    const counter = panel.getByTestId("flipchart-counter");
    await expect(counter).toContainText("Hoja 1 de");

    await panel.getByRole("button", { name: /Lámina siguiente/i }).click();
    const flipLayer = panel.getByTestId("vertical-flip-layer");
    await expect(flipLayer).toBeVisible();

    const wrapper = flipLayer.locator(".flipchart-flip-wrapper");
    await expect
      .poll(async () => wrapper.getAttribute("style"), { timeout: 700 })
      .toContain("rotateX(-180deg)");

    await expect(counter).toContainText("Hoja 2 de", { timeout: 2500 });
  });
});
