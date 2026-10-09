import { test, expect, Page } from "@playwright/test";

/**
 * Helper to verify that an element has a non-empty accessible name and proper semantic role.
 */
async function verifyElementAccessibility(
  page: Page,
  selector: string,
  expectedRole?: string,
) {
  const locator = page.locator(selector).first();
  await expect(locator).toBeVisible();

  if (expectedRole) {
    const role = await locator.getAttribute("role");
    const tagName = await locator.evaluate((el) => el.tagName.toLowerCase());
    const valid =
      role === expectedRole ||
      (expectedRole === "button" && tagName === "button") ||
      (expectedRole === "link" && tagName === "a") ||
      (expectedRole === "navigation" && (tagName === "nav" || role === "navigation")) ||
      (expectedRole === "region" && tagName === "section") ||
      (expectedRole === "table" && tagName === "table");
    expect(valid).toBe(true);
  }

  const accName = await locator.evaluate((el) => {
    return (
      el.getAttribute("aria-label") ||
      el.getAttribute("aria-labelledby") ||
      el.textContent?.trim() ||
      (el as HTMLInputElement).placeholder ||
      ""
    );
  });
  expect(accName.length).toBeGreaterThan(0);
}

/**
 * Helper to check visible focus ring on a focused element.
 */
async function verifyVisibleFocus(page: Page, locator: ReturnType<Page["locator"]>) {
  await locator.focus();
  await expect(locator).toBeFocused();

  const focusStyle = await locator.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow,
    };
  });

  const hasVisibleOutline =
    focusStyle.outlineStyle !== "none" &&
    focusStyle.outlineStyle !== "" &&
    focusStyle.outlineWidth !== "0px";
  const hasVisibleBoxShadow =
    focusStyle.boxShadow !== "none" && focusStyle.boxShadow !== "";

  expect(hasVisibleOutline || hasVisibleBoxShadow).toBe(true);
}

test.describe("Non-Workbook Accessibility & Keyboard Preflight (#561 Excluded)", () => {
  // --------------------------------------------------------------------------
  // 1. Welcome and Primary Entry Actions
  // --------------------------------------------------------------------------
  test("1. Welcome and entry actions have semantic roles, accessible names, and visible focus", async ({
    page,
  }) => {
    await page.goto("/entrar");

    const welcomeTitle = page.locator("h1");
    await expect(welcomeTitle).toBeVisible();

    await verifyElementAccessibility(page, '[data-testid="wc-entrar"]', "link");
    const enterBtn = page.getByTestId("wc-entrar");
    await verifyVisibleFocus(page, enterBtn);

    const teacherLink = page.locator('a:has-text("Soy maestro")').first();
    if (await teacherLink.isVisible()) {
      await verifyElementAccessibility(page, 'a:has-text("Soy maestro")', "link");
      await verifyVisibleFocus(page, teacherLink);
    }
  });

  // --------------------------------------------------------------------------
  // 2. Teacher Shell and Main Navigation
  // --------------------------------------------------------------------------
  test("2. Teacher shell and main navigation have landmark roles, accessible names, and visible focus", async ({
    page,
  }) => {
    await page.goto("/cartilla/teacher/crm");

    await expect(page.locator(".crm-app")).toBeVisible();
    await expect(page.locator("aside.crm-sidebar")).toBeVisible();

    const navItems = [
      { text: "Tablero", href: "/cartilla/teacher/crm" },
      { text: "Alumnos", href: "/cartilla/teacher/roster" },
      { text: "Progreso", href: "/cartilla/teacher/progreso" },
      { text: "Lecciones", href: "/cartilla/teacher/lecciones" },
      { text: "Reportes", href: "/cartilla/teacher/reportes" },
      { text: "Arte", href: "/cartilla/teacher/crm/arte" },
      { text: "Ayuda", href: "/cartilla/teacher/ayuda" },
    ];

    for (const item of navItems) {
      const link = page.locator(`aside.crm-sidebar a:has-text("${item.text}")`).first();
      await expect(link).toBeVisible();
      await verifyVisibleFocus(page, link);
    }

    const bellBtn = page.locator('button[aria-label="Ver progreso de la clase"]');
    if (await bellBtn.isVisible()) {
      await verifyVisibleFocus(page, bellBtn);
    }

    const classSelect = page.locator("select").first();
    if (await classSelect.isVisible()) {
      await verifyVisibleFocus(page, classSelect);
    }
  });

  // --------------------------------------------------------------------------
  // 3. Guide Tabs and Sections
  // --------------------------------------------------------------------------
  test("3. Teacher guide tabs/sections keyboard reachability and visible focus", async ({
    page,
  }) => {
    await page.goto("/cartilla/teacher/guia/1");
    await expect(page).toHaveURL(/\/cartilla\/teacher\/guia\/1$/);

    const tabs = ["Objetivos", "Procedimiento", "Vocabulario y Poema", "Evaluación"];
    for (const tabName of tabs) {
      const tabBtn = page.locator(`button:has-text("${tabName}")`).first();
      if (await tabBtn.isVisible()) {
        await verifyVisibleFocus(page, tabBtn);
      }
    }

    const procTab = page.locator('button:has-text("Procedimiento")').first();
    if (await procTab.isVisible()) {
      await procTab.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator(".guide-html-content")).toBeVisible();
    }
  });

  // --------------------------------------------------------------------------
  // 4. Progress and Report Controls
  // --------------------------------------------------------------------------
  test("4. Progress/report controls, semantic tables, and export action focus", async ({
    page,
  }) => {
    await page.goto("/cartilla/teacher/progreso");
    await expect(page.locator("text=Progreso de la Clase")).toBeVisible();

    const table = page.locator("table");
    await expect(table).toBeVisible();
    const thead = page.locator("table thead");
    await expect(thead).toBeVisible();

    const headers = page.locator("table th");
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);

    const tableContainer = page.locator("div.overflow-x-auto");
    await expect(tableContainer).toBeVisible();

    await page.goto("/cartilla/teacher/reportes");
    await expect(page.locator("text=Panel de Reportes")).toBeVisible();

    const csvBtn = page.locator("button:has-text('Exportar CSV')").first();
    await expect(csvBtn).toBeVisible();
    await verifyVisibleFocus(page, csvBtn);

    const printBtn = page.getByRole("button", { name: /Imprimir/i }).first();
    if (await printBtn.isVisible()) {
      await verifyVisibleFocus(page, printBtn);
    }
  });

  // --------------------------------------------------------------------------
  // 5. Flip Chart Controls
  // --------------------------------------------------------------------------
  test("5. Flip Chart presenter controls accessibility, ARIA labels, and keyboard navigation", async ({
    page,
  }) => {
    await page.goto("/cartilla/presentar/1");

    const stage = page.getByTestId("flipchart-stage");
    await expect(stage).toBeVisible({ timeout: 30_000 });

    const header = page.getByTestId("teacher-presenter-header");
    await expect(header).toBeVisible();

    const exitBtn = page.locator('button[aria-label="Volver al panel del docente"]');
    const laserBtn = page.locator('button[aria-label="Alternar puntero láser"]');
    const focusBtn = page.locator('button[aria-label="Modo proyección sin cromo"]');
    const fullscreenBtn = page.locator('button[aria-label="Alternar pantalla completa"]');

    await expect(exitBtn).toBeVisible();
    await expect(laserBtn).toBeVisible();
    await expect(focusBtn).toBeVisible();
    await expect(fullscreenBtn).toBeVisible();

    await verifyVisibleFocus(page, exitBtn);
    await verifyVisibleFocus(page, laserBtn);
    await verifyVisibleFocus(page, focusBtn);
    await verifyVisibleFocus(page, fullscreenBtn);

    await page.goto("/cartilla/presentar/7");
    await expect(stage).toBeVisible({ timeout: 30_000 });

    const counter = page.getByTestId("flipchart-counter");
    await expect(counter).toContainText("Hoja 1 de 3");

    await page.keyboard.press("ArrowRight");
    await expect(counter).toContainText("Hoja 2 de 3");

    await page.keyboard.press("ArrowLeft");
    await expect(counter).toContainText("Hoja 1 de 3");
  });

  // --------------------------------------------------------------------------
  // 6. Reduced Motion Preference Respected by Shared Chrome
  // --------------------------------------------------------------------------
  test("6. Reduced-motion preference respected by shared chrome and flip chart panel", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto("/cartilla/presentar/1");
    const panel = page.getByTestId("flipchart-hd-panel");
    await expect(panel).toBeVisible({ timeout: 30_000 });

    await expect(panel).toHaveAttribute("data-reduced-motion", "true");

    const navBtn = page.locator('button[aria-label="Lámina anterior"]');
    const transitionDuration = await navBtn.evaluate((el) => {
      return window.getComputedStyle(el).transitionDuration;
    });

    const parseDurationMs = (dur: string): number => {
      if (!dur) return 0;
      if (dur.endsWith("ms")) return parseFloat(dur);
      if (dur.endsWith("s")) return parseFloat(dur) * 1000;
      return parseFloat(dur);
    };

    const ms = parseDurationMs(transitionDuration);
    expect(ms).toBeLessThanOrEqual(50);
  });
});
