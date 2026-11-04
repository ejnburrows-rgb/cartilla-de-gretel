import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const PROOF_DIR = process.env.PROOF_DIR || path.join(process.cwd(), "docs/proofs/teacher-final-preflight/");

test.beforeAll(() => {
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }
});

test.describe("Teacher + Flip Chart Pre-Final Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Seed teacher session so CRM/progress/reports data renders consistently
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("cartilla.seed.teacher.v1", "seed-teacher-leonor");
    });
  });

  test("Teacher guide navigation, section switching, device responsiveness, zero console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(`PageError: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(`ConsoleError: ${msg.text()}`);
      }
    });

    // 1. Visit Guide index
    await page.goto("/cartilla/teacher/guia");
    await expect(page.locator("h1.teacher-chrome__title")).toContainText("Guía del profesor");
    await page.screenshot({ path: path.join(PROOF_DIR, "teacher-guide-index.png") });

    // Open guide folder and click lesson guide
    await page.click("button >> text=Guía del profesor >> nth=0");
    await expect(page.locator("text=Ver guion completo de la lección").first()).toBeVisible();
    await page.click("text=Ver guion completo de la lección >> nth=0");

    // Exact URL check
    await expect(page).toHaveURL(/\/cartilla\/teacher\/guia\/1$/);

    // Assert guide section content and section switching
    const content = page.locator(".guide-html-content");
    await expect(content).toBeVisible();

    // Switch to Procedimiento tab
    await page.click("button:has-text('Procedimiento')");
    await expect(page.locator(".guide-html-content.active-tab-procedimiento")).toBeVisible();
    await expect(page.locator(".guide-html-content.active-tab-procedimiento")).toContainText("Las hermanitas vocales");

    // Switch to Evaluación tab
    await page.click("button:has-text('Evaluación')");
    await expect(page.locator(".guide-html-content.active-tab-evaluacion")).toBeVisible();

    // Verify back navigation to guide index
    await page.click("text=Carpetas");
    await expect(page).toHaveURL(/\/cartilla\/teacher\/guia(\/)?$/);

    // Responsive checks on guide
    const viewports = [
      { name: "phone", width: 375, height: 667 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "laptop", width: 1280, height: 900 },
      { name: "projector", width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/cartilla/teacher/guia/1");

      const isOverflowing = await page.evaluate(() => {
        const el = document.body;
        return el.scrollWidth > el.clientWidth;
      });
      expect(isOverflowing).toBe(false);

      // Check broken images
      const brokenImages = await page.evaluate(() =>
        Array.from(document.querySelectorAll("img"))
          .filter((img) => img.src && (!img.complete || img.naturalWidth === 0))
          .map((img) => img.src)
      );
      expect(brokenImages).toEqual([]);

      await page.screenshot({ path: path.join(PROOF_DIR, `teacher-guide-vp-${vp.name}.png`) });
    }

    expect(consoleErrors).toEqual([]);
  });

  test("Progress views and reports + CSV export", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(`PageError: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(`ConsoleError: ${msg.text()}`);
      }
    });

    // 1. Progress View
    await page.goto("/cartilla/teacher/progreso");
    await expect(page.locator("text=Progreso de la Clase")).toBeVisible();
    await expect(page.locator("table")).toBeVisible();

    const progressHeader = page.locator("header.no-print").filter({ hasText: "Progreso de la Clase" });
    await expect(progressHeader).toBeVisible();

    // Check no horizontal document overflow
    const docOverflowProgress = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(docOverflowProgress).toBe(false);

    await page.screenshot({ path: path.join(PROOF_DIR, "teacher-progreso-view.png") });

    // 2. Reports View
    await page.goto("/cartilla/teacher/reportes");
    await expect(page.locator("text=Panel de Reportes")).toBeVisible();

    const csvButton = page.getByRole("button", { name: "Exportar CSV" });
    await expect(csvButton).toBeVisible();

    // Trigger CSV export and verify download
    const downloadPromise = page.waitForEvent("download");
    await csvButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("reporte_clase");

    await page.screenshot({ path: path.join(PROOF_DIR, "teacher-reportes-view.png") });

    expect(consoleErrors).toEqual([]);
  });

  test("Printing flows and print media CSS assertions", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(`PageError: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(`ConsoleError: ${msg.text()}`);
    });

    // Print all
    await page.goto("/cartilla/imprimir/all");
    await expect(page.locator("text=Cuaderno completo")).toBeVisible();
    await expect(page.locator("section.workbook-print-sheet")).toHaveCount(90);

    const header = page.locator("header.no-print");
    await expect(header).toBeVisible();

    // Emulate print media and assert no-print class hides header
    await page.emulateMedia({ media: "print" });
    await expect(header).toBeHidden();

    await page.screenshot({ path: path.join(PROOF_DIR, "teacher-imprimir-all.png") });

    await page.emulateMedia({ media: "screen" });

    // Print single lesson
    await page.goto("/cartilla/imprimir/1");
    await expect(page.locator("section.workbook-print-sheet")).toHaveCount(3);

    expect(consoleErrors).toEqual([]);
  });

  test("Flip Chart catalog, presenter, top-bound page turns, device fit, return flow, reduced motion", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(`PageError: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(`ConsoleError: ${msg.text()}`);
    });

    // 1. Catalog view
    await page.goto("/cartilla/teacher/flipchart");
    await expect(page.locator("h1")).toContainText("Catálogo de Lecciones");
    await page.screenshot({ path: path.join(PROOF_DIR, "flipchart-catalog.png") });

    // 2. Presenter & top-bound page turn across devices
    const devices = [
      { name: "projector", width: 1920, height: 1080 },
      { name: "laptop", width: 1280, height: 900 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "phone", width: 375, height: 667 },
    ];

    for (const dev of devices) {
      await page.setViewportSize({ width: dev.width, height: dev.height });
      await page.goto("/cartilla/presentar/7");

      const panel = page.getByTestId("flipchart-hd-panel");
      await expect(panel).toBeVisible({ timeout: 15000 });

      // Top-bound physical page turn configuration attribute
      await expect(panel).toHaveAttribute("data-page-turn-axis", "vertical");

      const nativeBoard = page.getByTestId("flipchart-stage").getByTestId("flipchart-native-board");
      await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "9");

      // Verify device fit (no document horizontal overflow)
      const docOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(docOverflow).toBe(false);

      // Ensure stage is rendered
      const stage = page.getByTestId("teacher-presenter-stage");
      await expect(stage).toBeVisible();

      // Ensure no default scenic background layer is mounted on the flipchart.
      const scenicWallpaperCount = await page.locator(".fc-final-background, img[alt='Fondo de página']").count();
      expect(scenicWallpaperCount).toBe(0);

      // Verify no broken images (image element present with src that fails to load)
      const brokenImages = await page.evaluate(() =>
        Array.from(document.querySelectorAll("img"))
          .filter((img) => img.src && (img.naturalWidth === 0 && img.naturalHeight === 0 && img.complete))
          .map((img) => img.src)
      );
      expect(brokenImages).toEqual([]);

      await page.screenshot({ path: path.join(PROOF_DIR, `flipchart-presenter-${dev.name}-p9.png`) });

      // Page turn with Keyboard ArrowRight
      await page.keyboard.press("ArrowRight");
      await page.locator("[data-testid='vertical-flip-layer']").waitFor({ state: "detached", timeout: 5000 });
      await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "10");

      await page.screenshot({ path: path.join(PROOF_DIR, `flipchart-presenter-${dev.name}-p10.png`) });

      // Page turn back with button
      const prevBtn = panel.getByRole("button", { name: "Lámina anterior", exact: true });
      await expect(prevBtn).toBeEnabled();
      await prevBtn.click();
      await page.locator("[data-testid='vertical-flip-layer']").waitFor({ state: "detached", timeout: 5000 });
      await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "9");
    }

    // 3. Return-to-teacher navigation
    const exitBtn = page.getByRole("button", { name: "Volver al panel del docente", exact: true });
    await expect(exitBtn).toBeVisible();
    await exitBtn.click();
    await expect(page).toHaveURL(/\/cartilla\/teacher(\/)?$/);

    // 4. Reduced Motion test
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/cartilla/presentar/7");

    const panelRM = page.getByTestId("flipchart-hd-panel");
    await expect(panelRM).toBeVisible();
    const nativeBoardRM = page.getByTestId("flipchart-stage").getByTestId("flipchart-native-board");
    await expect(nativeBoardRM).toHaveAttribute("data-flipchart-page", "9");

    const nextBtn = panelRM.getByRole("button", { name: "Lámina siguiente", exact: true });
    await nextBtn.click();
    await page.waitForTimeout(100);

    // Reduced motion skips animation layer
    const flipWrapperCount = await page.locator(".flipchart-flip-wrapper").count();
    expect(flipWrapperCount).toBe(0);
    await expect(nativeBoardRM).toHaveAttribute("data-flipchart-page", "10");

    await page.screenshot({ path: path.join(PROOF_DIR, "flipchart-reduced-motion.png") });

    expect(consoleErrors).toEqual([]);
  });
});
