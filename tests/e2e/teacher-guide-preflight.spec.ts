import { test, expect } from "@playwright/test";

test("teacher guide routes structure and interactions", async ({ page }) => {
  // Go to guide index
  await page.goto("/cartilla/teacher/guia");
  await expect(page.locator("h1.teacher-chrome__title")).toContainText("Guía del profesor");

  // Click on "Guía del profesor" folder specifically (it's the first button)
  await page.click("button >> text=Guía del profesor >> nth=0");

  // Need to make sure the folder actually opens and renders "Ver guion completo de la lección"
  await expect(page.locator("text=Ver guion completo de la lección").first()).toBeVisible();

  // Go to lesson 1
  await page.click("text=Ver guion completo de la lección >> nth=0");

  // Should exactly be on /cartilla/teacher/guia/1
  await expect(page).toHaveURL(/\/cartilla\/teacher\/guia\/1$/);

  // Assert real procedure content (Objectives)
  await expect(page.locator(".guide-html-content.active-tab-objetivos")).toContainText("Escucha un cuento simple basado en representaciones pictóricas");

  // Switch to another tab (e.g., "Procedimiento")
  await page.click("text=Procedimiento");

  // Check that the tab switched and has real content
  await expect(page.locator(".guide-html-content.active-tab-procedimiento")).toBeVisible();
  await expect(page.locator(".guide-html-content.active-tab-procedimiento")).toContainText("Las hermanitas vocales");

  // Verify EXACT back navigation works to the guide index
  await page.click("text=Carpetas");
  await expect(page).toHaveURL(/\/cartilla\/teacher\/guia(\/)?$/);
});

// Viewport configs to test clipping/overflow
const viewports = [
  { name: "mobile", width: 375, height: 667, isMobile: true },
  { name: "tablet", width: 768, height: 1024, isMobile: false },
  { name: "laptop", width: 1280, height: 800, isMobile: false },
  { name: "projector", width: 1024, height: 768, isMobile: false }
];

for (const vp of viewports) {
  test(`teacher guide responsive fit and focus (${vp.name})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/cartilla/teacher/guia/1");

    if (vp.width < 1024) {
      await expect(page.locator(".guide-layout select")).toBeVisible();
      await expect(page.locator(".guide-layout aside")).toBeHidden();
    } else {
      await expect(page.locator(".guide-layout select")).toBeHidden();
      await expect(page.locator(".guide-layout aside")).toBeVisible();
    }

    // Automated overflow/clipping assertions for the main container
    const isOverflowing = await page.evaluate(() => {
      const el = document.querySelector('.teacher-guide-page');
      if (!el) return false;
      return el.scrollWidth > el.clientWidth;
    });
    expect(isOverflowing).toBe(false);

    // Check keyboard focus on tabs
    await page.locator("button:has-text('Procedimiento')").focus();
    await expect(page.locator("button:has-text('Procedimiento')")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator(".guide-html-content.active-tab-procedimiento")).toBeVisible();
  });
}

test("teacher guide has no runtime errors", async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', error => errors.push(error));

  await page.goto("/cartilla/teacher/guia");
  await page.goto("/cartilla/teacher/guia/1");
  await page.goto("/cartilla/teacher/guide");
  await page.goto("/cartilla/teacher/lecciones");

  expect(errors).toHaveLength(0);
});

test("legacy resource panels and links load properly without crashing", async ({ page }) => {
  await page.goto("/cartilla/teacher/lecciones");
  // Should see catalog
  await expect(page.locator(".crm-main")).toBeVisible();
});
