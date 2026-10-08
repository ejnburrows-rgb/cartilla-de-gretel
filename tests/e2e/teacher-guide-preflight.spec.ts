import { test, expect } from "@playwright/test";

test("teacher guide routes structure and interactions", async ({ page }) => {
  // Go to guide index
  await page.goto("/cartilla/teacher/guia");
  await expect(page.locator("h1.teacher-chrome__title")).toContainText("Guía del profesor");

  await page.screenshot({ path: "docs/proofs/teacher-guide-preflight/1-guide-index.png", fullPage: true });

  // Click on "Guía del profesor" folder specifically (it's the first button)
  await page.click("button >> text=Guía del profesor >> nth=0");

  // Need to make sure the folder actually opens and renders "Ver guion completo de la lección"
  await expect(page.locator("text=Ver guion completo de la lección").first()).toBeVisible();
  await page.screenshot({ path: "docs/proofs/teacher-guide-preflight/2-guide-folder-open.png", fullPage: true });

  await page.click("text=Ver guion completo de la lección >> nth=0");

  // Should be on /cartilla/teacher/guia/1
  await expect(page).toHaveURL(/\/cartilla\/teacher\/guia\/\d+/);

  await page.screenshot({ path: "docs/proofs/teacher-guide-preflight/3-lesson-guide-open.png", fullPage: true });

  // Switch to another tab (e.g., "Procedimiento")
  await page.click("text=Procedimiento");

  // Check that the tab switched
  await expect(page.locator(".guide-html-content.active-tab-procedimiento")).toBeVisible();
  await page.screenshot({ path: "docs/proofs/teacher-guide-preflight/4-lesson-guide-procedimiento.png", fullPage: true });

  // Verify back navigation works
  await page.click("text=Carpetas");
  await expect(page).toHaveURL(/\/cartilla\/teacher\/guia/);
});

test("teacher guide responsive fit and focus", async ({ page }) => {
  // Check mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/cartilla/teacher/guia/1");
  await expect(page.locator(".guide-layout select")).toBeVisible();
  await expect(page.locator(".guide-layout aside")).toBeHidden();
  await page.screenshot({ path: "docs/proofs/teacher-guide-preflight/5-mobile-viewport.png", fullPage: true });

  // Check laptop viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator(".guide-layout select")).toBeHidden();
  await expect(page.locator(".guide-layout aside")).toBeVisible();
  await page.screenshot({ path: "docs/proofs/teacher-guide-preflight/6-laptop-viewport.png", fullPage: true });

  // Check projector viewport (1024x768 typical)
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator(".guide-layout select")).toBeHidden();
  await expect(page.locator(".guide-layout aside")).toBeVisible();

  // Check keyboard focus on tabs
  await page.locator("button:has-text('Procedimiento')").focus();
  await expect(page.locator("button:has-text('Procedimiento')")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator(".guide-html-content.active-tab-procedimiento")).toBeVisible();
});

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
