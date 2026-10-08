import { test, expect } from "@playwright/test";

test.describe("Teacher Print/Report Readiness", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("renders progression and reports empty and seeded states", async ({ page }) => {
    // Navigate to teacher progress
    await page.goto("/cartilla/teacher/progreso");
    await expect(page.locator("text=Progreso de la Clase")).toBeVisible();
    await expect(page.locator("table")).toBeVisible();

    // Ensure table can scroll
    const tableContainer = page.locator('div.overflow-x-auto');
    await expect(tableContainer).toBeVisible();

    // Check report page
    await page.goto("/cartilla/teacher/reportes");
    await expect(page.locator("text=Panel de Reportes")).toBeVisible();
    await expect(page.locator("text=Exportar CSV")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Imprimir' })).toBeVisible();

    // Seed mode will likely preselect a class if available, wait for some report card text instead
    await expect(page.locator("text=Análisis y Progreso Grupal").or(page.locator("text=Reporte de Logros"))).toBeVisible();
  });

  test("verifies responsive layout on mobile", async ({ page }) => {
    // 375x667 is a typical mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/cartilla/teacher/progreso");
    // Ensure table can scroll
    const tableContainer = page.locator('div.overflow-x-auto');
    await expect(tableContainer).toBeVisible();

    // The table should have the class overflow-x-auto which enables horizontal scroll
    await expect(tableContainer).toHaveClass(/overflow-x-auto/);

    await page.goto("/cartilla/teacher/reportes");
    await expect(page.locator("text=Panel de Reportes")).toBeVisible();
  });

  test("renders print views and verifies print CSS", async ({ page }) => {
    await page.goto("/cartilla/imprimir/all");

    // First verify normal view elements
    await expect(page.locator("text=Cuaderno completo")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Imprimir' })).toBeVisible();

    const header = page.locator('header.no-print');

    // Require the header to exist and be visible under normal media
    await expect(header).toBeAttached();
    await expect(header).toBeVisible();

    // Emulate print media type to check if specific print-only styles apply
    await page.emulateMedia({ media: 'print' });

    // Under print CSS, `.no-print` elements should be hidden, rather than conditionally skipping
    await expect(header).toBeHidden();
  });
});
