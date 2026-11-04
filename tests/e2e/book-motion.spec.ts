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

    // Gretel speaks through lesson cinematics and reactions; the clean
    // Workbook page carries no fixed Gretel companion (#538).

    // Completion gate: an unfinished page cannot be turned forward.
    const counter = reader.locator(".native-lesson-viewer__page");
    const before = (await counter.textContent()) ?? "";
    const next = reader.getByRole("button", { name: "Siguiente" });
    await expect(next).toBeVisible();
    if (await next.isEnabled()) {
      await next.click();
      await expect
        .poll(async () => (await counter.textContent()) ?? "", { timeout: 6000 })
        .not.toBe(before);
    } else {
      await expect(reader).toHaveAttribute("data-page-complete", "false");
    }
  });

  test("teacher presenter turns the printed Flip Chart sheet over the top binding", async ({ page }) => {
    await page.goto("/cartilla/presentar/7", { waitUntil: "domcontentloaded" });
    await dismissIntro(page);

    const panel = page.getByTestId("flipchart-hd-panel");
    await expect(panel).toBeVisible({ timeout: 15000 });
    await expect(panel).toHaveAttribute("data-hd-primary", "true");
    await expect(panel).toHaveAttribute("data-presenter-mode", "native");
    await expect(panel).toHaveAttribute("data-page-turn-axis", "vertical");
    await expect(panel).toHaveAttribute("data-page-turn-ms", "2000");
    await expect(panel).not.toHaveAttribute("data-physical-flipchart", /.*/);
    await expect(panel.locator(".fc-board__ring")).toHaveCount(0);
    await expect(panel.locator(".fc-board__binding")).toHaveCount(0);
    // The presented sheet is the printed-sheet replica (#744).
    const stage = page.getByTestId("flipchart-stage");
    await expect(stage.getByTestId("flipchart-replica-sheet").first()).toBeVisible();

    const counter = panel.getByTestId("flipchart-counter");
    await expect(counter).toContainText("Hoja 1 de");

    const next = panel.getByRole("button", { name: "Lámina siguiente", exact: true });
    if (await next.isEnabled()) {
      await next.click();
      await expect(counter).toContainText("Hoja 2 de", { timeout: 6000 });
    }
  });
});
