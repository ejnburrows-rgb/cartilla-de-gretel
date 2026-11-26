import { expect, test } from "@playwright/test";

for (const size of [
  { width: 320, height: 640 },
  { width: 390, height: 844 },
]) {
  test(`lesson header does not cover activity tabs at ${size.width}px`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/cartilla/leccion/1");

    const header = page.locator(".lc-lesson-header");
    const tabs = page.locator(".lc-lesson-main nav").first();
    await expect(header).toBeVisible();
    await expect(tabs).toBeVisible();

    const headerBox = await header.boundingBox();
    const tabsBox = await tabs.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(tabsBox).not.toBeNull();
    expect(headerBox!.y + headerBox!.height).toBeLessThanOrEqual(tabsBox!.y + 1);

    const selector = page.getByRole("combobox", { name: "Cambiar de lección" });
    await expect(selector).toBeInViewport();
    await selector.selectOption("2");
    await expect(page).toHaveURL(new RegExp("/cartilla/leccion/2$"));
  });
}
