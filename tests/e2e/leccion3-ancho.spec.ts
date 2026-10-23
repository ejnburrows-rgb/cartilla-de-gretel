import { test, expect } from "@playwright/test";

test("Lesson 3 wide screen renders page curl", async ({ page }) => {
  await page.goto("/cartilla/leccion3-ancho");

  // It should show page 7 first
  await expect(page.locator(".l3w-p7").first()).toBeVisible();

  // The next button from NativeLessonViewer
  const nextBtn = page.getByRole("button", { name: /Siguiente/i });
  await nextBtn.waitFor({ state: 'visible' });

  // Click next button
  await nextBtn.click();

  // Check that the page curled to 8
  await page.waitForTimeout(2800);
  await expect(page.locator(".l3w-p8").first()).toBeVisible();
});
