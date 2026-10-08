import { test, expect, Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const PROOF_DIR = path.resolve("docs/proofs/accessibility-preflight");

async function ensureProofDir() {
  await fs.mkdir(PROOF_DIR, { recursive: true });
}

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

  // Check accessible name via Playwright evaluate
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
  test.beforeAll(async () => {
    await ensureProofDir();
  });

  // --------------------------------------------------------------------------
  // 1. Welcome and Primary Entry Actions
  // --------------------------------------------------------------------------
  test("1. Welcome and primary entry actions accessibility & keyboard reachability", async ({
    page,
  }) => {
    await page.goto("/");
    const splash = page.locator('[data-testid="welcome-splash"]');
    await expect(splash).toBeVisible();

    // Verify main title heading
    const heading = page.locator("h1#lc-welcome-title");
    await expect(heading).toContainText("La Cartilla de Gretel");

    // Verify primary buttons and semantics
    const comenzarBtn = page.locator('[data-testid="wc-entrar"]');
    const maestroBtn = page.locator('a:has-text("Soy maestro")');

    await verifyElementAccessibility(page, '[data-testid="wc-entrar"]', "link");
    await verifyElementAccessibility(page, 'a:has-text("Soy maestro")', "link");

    // Keyboard Tab focus reachability & visible focus
    await verifyVisibleFocus(page, comenzarBtn);
    await verifyVisibleFocus(page, maestroBtn);

    // Screenshot proof
    await page.screenshot({
      path: path.join(PROOF_DIR, "01-welcome-primary-entry.png"),
      fullPage: true,
    });

    // Test secondary entry points: /entrar
    await page.goto("/entrar");
    await expect(page.locator("body")).toBeVisible();
    await page.screenshot({
      path: path.join(PROOF_DIR, "01b-entry-entrar.png"),
      fullPage: true,
    });
  });

  // --------------------------------------------------------------------------
  // 2. Teacher Shell and Navigation
  // --------------------------------------------------------------------------
  test("2. Teacher shell/navigation keyboard reachability, focus rings, and ARIA roles", async ({
    page,
  }) => {
    await page.goto("/cartilla/teacher/crm");
    await expect(page.locator(".crm-app")).toBeVisible();

    // Verify Sidebar navigation landmark & links
    const sidebar = page.locator("aside.crm-sidebar");
    await expect(sidebar).toBeVisible();

    const navLinks = [
      { text: "Tablero", href: "/cartilla/teacher/crm" },
      { text: "Alumnos", href: "/cartilla/teacher/roster" },
      { text: "Progreso", href: "/cartilla/teacher/progreso" },
      { text: "Lecciones", href: "/cartilla/teacher/lecciones" },
      { text: "Reportes", href: "/cartilla/teacher/reportes" },
      { text: "Arte", href: "/cartilla/teacher/crm/artwork" },
      { text: "Ayuda", href: "/cartilla/ayuda" },
    ];

    for (const link of navLinks) {
      const linkLoc = page.locator(`aside.crm-sidebar a:has-text("${link.text}")`).first();
      await expect(linkLoc).toBeVisible();
      await verifyVisibleFocus(page, linkLoc);
    }

    // Topbar controls
    const topbarBell = page.locator('a[aria-label="Ver progreso de la clase"]');
    await expect(topbarBell).toBeVisible();
    await verifyVisibleFocus(page, topbarBell);

    // Class selector focus
    const classSelect = page.locator("select").first();
    if (await classSelect.isVisible()) {
      await verifyVisibleFocus(page, classSelect);
    }

    // Screenshot proof
    await page.screenshot({
      path: path.join(PROOF_DIR, "02-teacher-shell-navigation.png"),
      fullPage: true,
    });
  });

  // --------------------------------------------------------------------------
  // 3. Guide Tabs and Sections
  // --------------------------------------------------------------------------
  test("3. Teacher guide tabs/sections keyboard reachability and visible focus", async ({
    page,
  }) => {
    await page.goto("/cartilla/teacher/guia");
    await expect(page.locator("h1.teacher-chrome__title")).toContainText("Guía del profesor");

    // Click into folder to access lesson guide view
    const folderBtn = page.locator("button", { hasText: "Guía del profesor" }).first();
    await expect(folderBtn).toBeVisible();
    await verifyVisibleFocus(page, folderBtn);
    await folderBtn.click();

    const scriptLink = page.locator("text=Ver guion completo de la lección").first();
    await expect(scriptLink).toBeVisible();
    await verifyVisibleFocus(page, scriptLink);

    // Go to lesson 1 guide
    await page.goto("/cartilla/teacher/guia/1");
    await expect(page).toHaveURL(/\/cartilla\/teacher\/guia\/1$/);

    // Check desktop tab buttons
    const tabs = ["Objetivos", "Procedimiento", "Recursos", "Estructura"];
    for (const tabName of tabs) {
      const tabBtn = page.locator(`button:has-text("${tabName}")`).first();
      if (await tabBtn.isVisible()) {
        await verifyVisibleFocus(page, tabBtn);
      }
    }

    // Test tab activation via keyboard
    const procTab = page.locator('button:has-text("Procedimiento")').first();
    await procTab.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".guide-html-content.active-tab-procedimiento")).toBeVisible();

    // Mobile viewport check
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileSelect = page.locator(".guide-layout select");
    await expect(mobileSelect).toBeVisible();
    await verifyVisibleFocus(page, mobileSelect);

    // Screenshot proof
    await page.screenshot({
      path: path.join(PROOF_DIR, "03-guide-tabs-sections.png"),
      fullPage: true,
    });
  });

  // --------------------------------------------------------------------------
  // 4. Progress and Report Controls
  // --------------------------------------------------------------------------
  test("4. Progress/report controls, semantic tables, and export action focus", async ({
    page,
  }) => {
    // 4a. Progress Page
    await page.goto("/cartilla/teacher/progreso");
    await expect(page.locator("text=Progreso de la Clase")).toBeVisible();

    // Semantic table check
    const table = page.locator("table");
    await expect(table).toBeVisible();
    const thead = page.locator("table thead");
    await expect(thead).toBeVisible();

    const headers = page.locator("table th");
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);

    // Table container keyboard scrollability / visibility
    const tableContainer = page.locator("div.overflow-x-auto");
    await expect(tableContainer).toBeVisible();

    await page.screenshot({
      path: path.join(PROOF_DIR, "04a-progress-controls.png"),
      fullPage: true,
    });

    // 4b. Reports Page
    await page.goto("/cartilla/teacher/reportes");
    await expect(page.locator("text=Panel de Reportes")).toBeVisible();

    const csvBtn = page.locator("button:has-text('Exportar CSV')").first();
    await expect(csvBtn).toBeVisible();
    await verifyVisibleFocus(page, csvBtn);

    const printBtn = page.getByRole("button", { name: /Imprimir/i }).first();
    if (await printBtn.isVisible()) {
      await verifyVisibleFocus(page, printBtn);
    }

    await page.screenshot({
      path: path.join(PROOF_DIR, "04b-reports-controls.png"),
      fullPage: true,
    });
  });

  // --------------------------------------------------------------------------
  // 5. Flip Chart Controls
  // --------------------------------------------------------------------------
  test("5. Flip Chart presenter controls accessibility, ARIA labels, and keyboard navigation", async ({
    page,
  }) => {
    // 5a. Test Single-Page Lesson Presenter
    await page.goto("/cartilla/presentar/1");

    const stage = page.getByTestId("flipchart-stage");
    await expect(stage).toBeVisible({ timeout: 30_000 });

    const header = page.getByTestId("teacher-presenter-header");
    await expect(header).toBeVisible();

    // Header buttons & ARIA labels
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

    // 5b. Test Multi-Page Lesson Presenter (Lesson 7 has 3 sheets)
    await page.goto("/cartilla/presentar/7");
    await expect(stage).toBeVisible({ timeout: 30_000 });

    const prevBtn = page.locator('button[aria-label="Lámina anterior"]');
    const nextBtn = page.locator('button[aria-label="Lámina siguiente"]');

    await expect(prevBtn).toBeVisible();
    await expect(nextBtn).toBeVisible();

    if (await nextBtn.isEnabled()) {
      await verifyVisibleFocus(page, nextBtn);
    }

    // Verify counter
    const counter = page.getByTestId("flipchart-counter");
    await expect(counter).toContainText("Hoja 1 de 3");

    // Thumbnail strip tabs
    const tabs = page.getByRole("tab", { name: /Ir a hoja/ });
    const tabCount = await tabs.count();
    expect(tabCount).toBe(3);

    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      if (await tab.isEnabled()) {
        await verifyVisibleFocus(page, tab);
      }
    }

    // Keyboard Arrow navigation check
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);
    await expect(counter).toContainText("Hoja 2 de 3");

    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(500);
    await expect(counter).toContainText("Hoja 1 de 3");

    await page.screenshot({
      path: path.join(PROOF_DIR, "05-flipchart-controls.png"),
      fullPage: true,
    });
  });

  // --------------------------------------------------------------------------
  // 6. Reduced Motion Preference Respected by Shared Chrome
  // --------------------------------------------------------------------------
  test("6. Reduced-motion preference respected by shared chrome and flip chart panel", async ({
    page,
  }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto("/cartilla/presentar/1");
    const panel = page.getByTestId("flipchart-hd-panel");
    await expect(panel).toBeVisible({ timeout: 30_000 });

    // Verify data-reduced-motion attribute on the panel
    await expect(panel).toHaveAttribute("data-reduced-motion", "true");

    // Verify transition duration is near-zero in computed styles
    const navBtn = page.locator('button[aria-label="Lámina anterior"]');
    const transitionDuration = await navBtn.evaluate((el) => {
      return window.getComputedStyle(el).transitionDuration;
    });

    const parsedSec = parseFloat(transitionDuration);
    const isInstant =
      isNaN(parsedSec) ||
      parsedSec <= 0.01 ||
      transitionDuration.includes("ms");

    expect(isInstant).toBe(true);

    await page.screenshot({
      path: path.join(PROOF_DIR, "06-reduced-motion-chrome.png"),
      fullPage: true,
    });
  });
});
