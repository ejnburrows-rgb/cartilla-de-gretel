import { test, expect } from "@playwright/test";

test.describe("Teacher shell/home/roster route smoke", () => {
  test("entry page loads cleanly without console exceptions", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/cartilla/teacher");
    await expect(page.getByRole("heading", { name: "Panel del Docente" }).first()).toBeVisible({
      timeout: 15_000,
    });

    // Check entry points
    await expect(page.getByText("Clase").first()).toBeVisible();
    await expect(page.getByText("Guía").first()).toBeVisible();
    await expect(page.getByText("Presentar").first()).toBeVisible();
    await expect(page.getByText("Reportes").first()).toBeVisible();

    expect(consoleErrors).toEqual([]);
    await page.screenshot({ path: "docs/proofs/teacher-route-smoke/01-teacher-hub.png" });
  });

  test("shell navigation items work and drawer toggles on mobile", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/cartilla/teacher");

    const menuButton = page.getByRole("button", { name: "Abrir menú" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const mobileNav = page.locator("nav.xl\\:hidden");
    // Check drawer navigation links
    await expect(mobileNav.getByRole("link", { name: "Alumnos", exact: true })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Clase", exact: true })).toBeVisible();

    // Click Alumnos link
    await mobileNav.getByRole("link", { name: "Alumnos", exact: true }).click();
    await expect(page).toHaveURL(/\/cartilla\/teacher\/roster/);
    await expect(page.getByRole("heading", { name: "Directorio de Alumnos" })).toBeVisible();

    expect(consoleErrors).toEqual([]);
    await page.screenshot({ path: "docs/proofs/teacher-route-smoke/02-mobile-navigation.png" });
  });

  test("roster page lists demo students and allows student actions", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/cartilla/teacher/roster");
    await expect(page.getByRole("heading", { name: "Directorio de Alumnos" })).toBeVisible({
      timeout: 15_000,
    });

    // Check demo class & students
    await expect(page.getByText("Miembros de la Clase")).toBeVisible();
    await expect(page.getByText("Sofía Ramírez").first()).toBeVisible();

    // Search student
    const searchInput = page.getByPlaceholder("Buscar alumno por nombre…");
    await searchInput.fill("Sofía");
    await expect(page.getByText("Sofía Ramírez")).toBeVisible();

    // Clear search
    await searchInput.fill("");

    expect(consoleErrors).toEqual([]);
    await page.screenshot({ path: "docs/proofs/teacher-route-smoke/03-roster-page.png" });
  });

  test("teacher home/daily page loads demo data and supports reload/back", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/cartilla/teacher/crm");
    await expect(page.getByRole("heading", { name: "Hoy en tu clase" })).toBeVisible({
      timeout: 15_000,
    });

    // Check content sections
    await expect(page.getByText("Necesitan atención")).toBeVisible();
    await expect(page.getByText("Asignado")).toBeVisible();

    // Test reload
    await page.reload();
    await expect(page.getByRole("heading", { name: "Hoy en tu clase" })).toBeVisible();

    // Test navigate to roster then back
    await page.goto("/cartilla/teacher/roster");
    await expect(page.getByRole("heading", { name: "Directorio de Alumnos" })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole("heading", { name: "Hoy en tu clase" })).toBeVisible();

    expect(consoleErrors).toEqual([]);
    await page.screenshot({ path: "docs/proofs/teacher-route-smoke/04-teacher-daily-home.png" });
  });

  test("responsive fit across viewports without horizontal overflow", async ({ page }) => {
    const viewports = [
      { name: "phone", width: 390, height: 844 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "laptop", width: 1280, height: 800 },
      { name: "projector", width: 1920, height: 1080 },
    ];

    const pagesToTest = [
      "/cartilla/teacher",
      "/cartilla/teacher/crm",
      "/cartilla/teacher/roster",
    ];

    for (const url of pagesToTest) {
      for (const vp of viewports) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(url);
        await page.waitForLoadState("domcontentloaded");

        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(overflow, `Horizontal overflow on ${url} at ${vp.name} (${vp.width}px)`).toBe(false);
      }
    }
  });
});
