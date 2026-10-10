import { test, expect, type Page, type Request } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const PROOF_DIR = path.resolve("docs/proofs/product-route-health");

async function ensureProofDir() {
  await fs.mkdir(PROOF_DIR, { recursive: true });
}

async function dismissCinematic(page: Page) {
  const start = page.getByRole("button", { name: "Comenzar" });
  if (await start.isVisible().catch(() => false)) {
    await start.click();
  }
}

async function expectNoBrokenImages(scope: Page | import("@playwright/test").Locator, label: string) {
  const brokenSources = await scope.locator("img:visible").evaluateAll((elements) =>
    elements
      .filter((element) => {
        const image = element as HTMLImageElement;
        return !image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0;
      })
      .map((element) => {
        const image = element as HTMLImageElement;
        return image.currentSrc || image.src;
      }),
  );
  expect(brokenSources, `Broken visible images in ${label}`).toEqual([]);
}

async function assertNoHorizontalOverflow(page: Page, label: string) {
  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(
    geometry.scrollWidth,
    `Horizontal overflow detected on route (${label}): scrollWidth ${geometry.scrollWidth} > viewport ${geometry.viewportWidth}`,
  ).toBeLessThanOrEqual(geometry.viewportWidth + 2);
}

// Track reported console defects for README documentation without altering product code
const REPORTED_DEFECTS: Array<{ route: string; error: string }> = [];

function attachRouteErrorMonitors(page: Page, routeLabel: string) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!text.includes("favicon.ico")) {
        consoleErrors.push(text);
        REPORTED_DEFECTS.push({ route: routeLabel, error: text });
      }
    }
  });

  page.on("requestfailed", (request: Request) => {
    const url = request.url();
    const failure = request.failure()?.errorText || "failed";
    if (url.includes("127.0.0.1") || url.startsWith("/")) {
      if (!url.includes("favicon.ico")) {
        failedRequests.push(`${url} (${failure})`);
      }
    }
  });

  // HTTP error responses complete normally and never emit requestfailed, so
  // monitor them explicitly: a 404/500 asset must fail the sweep.
  page.on("response", (response) => {
    const url = response.url();
    if ((url.includes("127.0.0.1") || url.startsWith("/")) && response.status() >= 400) {
      if (!url.includes("favicon.ico")) {
        failedRequests.push(`${url} (HTTP ${response.status()})`);
      }
    }
  });

  return {
    assertClean: () => {
      expect(pageErrors, `Unhandled page errors on ${routeLabel}`).toEqual([]);
      // Never hide a real React duplicate-key console error from the release gate.
      expect(consoleErrors, `Console errors on ${routeLabel}`).toEqual([]);
      expect(failedRequests, `Failed network requests on ${routeLabel}`).toEqual([]);
    },
  };
}

async function checkBasicRoute(page: Page, route: string, label: string, proofName?: string) {
  const monitor = attachRouteErrorMonitors(page, label);
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await dismissCinematic(page);
  await expect(page.locator("body")).not.toBeEmpty();
  await assertNoHorizontalOverflow(page, label);
  await expectNoBrokenImages(page, label);
  if (proofName) {
    await page.screenshot({ path: path.join(PROOF_DIR, proofName), fullPage: true });
  }
  monitor.assertClean();
}

test.describe("Whole-Product Route Health + Console/Network Error Sweep", () => {
  test.beforeAll(async () => {
    await ensureProofDir();
  });

  test("1. Welcome / Home routes health and phone splash capture (#356 proof)", async ({ page }) => {
    // 1a. Phone viewport capture on welcome splash for owner issue #356
    await page.setViewportSize({ width: 390, height: 844 });
    const monitorPhone = attachRouteErrorMonitors(page, "welcome-phone /entrar");

    await page.goto("/entrar", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await dismissCinematic(page);

    await expect(page.locator("body")).not.toBeEmpty();
    await assertNoHorizontalOverflow(page, "welcome-phone /entrar");
    await expectNoBrokenImages(page, "welcome-phone");

    await page.screenshot({
      path: path.join(PROOF_DIR, "welcome-phone.png"),
      fullPage: true,
    });
    monitorPhone.assertClean();

    // 1b. Desktop viewport health check across welcome routes
    await page.setViewportSize({ width: 1280, height: 900 });
    const welcomeRoutes = ["/", "/cartilla/", "/entrar", "/cartilla/student-login"];

    for (const route of welcomeRoutes) {
      await checkBasicRoute(
        page,
        route,
        `welcome ${route}`,
        route === "/entrar" ? "welcome-desktop.png" : undefined,
      );
    }
  });

  test("2. Lesson catalog routes health", async ({ page }) => {
    const catalogRoutes = ["/cartilla/lecciones", "/cartilla/teacher/lecciones"];

    for (const route of catalogRoutes) {
      await checkBasicRoute(
        page,
        route,
        `catalog ${route}`,
        route === "/cartilla/lecciones" ? "lesson-catalog.png" : undefined,
      );
    }
  });

  test("3. Representative Workbook lessons health across early/middle/late pages", async ({ page }) => {
    const lessonSamples = [
      { lesson: 1, proofName: "workbook-early-l1.png" },
      { lesson: 2 },
      { lesson: 12, proofName: "workbook-middle-l12.png" },
      { lesson: 14 },
      { lesson: 23 },
      { lesson: 24, proofName: "workbook-late-l24.png" },
    ];

    for (const { lesson, proofName } of lessonSamples) {
      const monitor = attachRouteErrorMonitors(page, `workbook lesson ${lesson}`);
      await page.goto(`/cartilla/leccion/${lesson}`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      await dismissCinematic(page);

      const reader = page.locator(".native-lesson-viewer");
      await expect(reader).toBeVisible({ timeout: 15_000 });
      await assertNoHorizontalOverflow(page, `workbook lesson ${lesson}`);
      await expectNoBrokenImages(reader, `workbook lesson ${lesson}`);

      if (proofName) {
        await page.screenshot({
          path: path.join(PROOF_DIR, proofName),
          fullPage: true,
        });
      }
      monitor.assertClean();
    }
  });

  test("4. Print route health", async ({ page }) => {
    const printRoutes = [
      { route: "/cartilla/imprimir/1", proofName: "print-route.png" },
      { route: "/cartilla/imprimir/2" },
      { route: "/cartilla/imprimir/all" },
    ];

    for (const { route, proofName } of printRoutes) {
      const monitor = attachRouteErrorMonitors(page, `print ${route}`);
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});

      await expect(page.locator("body")).not.toBeEmpty();
      await assertNoHorizontalOverflow(page, `print ${route}`);

      if (proofName) {
        await page.screenshot({
          path: path.join(PROOF_DIR, proofName),
          fullPage: true,
        });
      }
      monitor.assertClean();
    }
  });

  test("5. Teacher home/guide/progress/reports routes health", async ({ page }) => {
    const teacherRoutes = [
      { route: "/cartilla/teacher", proofName: "teacher-home.png" },
      { route: "/cartilla/teacher/guide", proofName: "teacher-guide.png" },
      { route: "/cartilla/teacher/guia/1" },
      { route: "/cartilla/teacher/progreso", proofName: "teacher-progress.png" },
      { route: "/cartilla/teacher/reportes", proofName: "teacher-reports.png" },
      { route: "/cartilla/teacher/crm" },
      { route: "/cartilla/teacher/roster" },
    ];

    for (const { route, proofName } of teacherRoutes) {
      const monitor = attachRouteErrorMonitors(page, `teacher ${route}`);
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});

      await expect(page.locator("body")).not.toBeEmpty();
      await assertNoHorizontalOverflow(page, `teacher ${route}`);
      await expectNoBrokenImages(page, `teacher ${route}`);

      if (proofName) {
        await page.screenshot({
          path: path.join(PROOF_DIR, proofName),
          fullPage: true,
        });
      }
      monitor.assertClean();
    }
  });

  test("6. Flip Chart catalog & presenter routes health", async ({ page }) => {
    const flipchartRoutes = [
      { route: "/cartilla/teacher/flipchart", proofName: "flipchart-catalog.png" },
      { route: "/cartilla/presentar/1", proofName: "flipchart-presenter.png" },
      { route: "/cartilla/presentar/7" },
    ];

    for (const { route, proofName } of flipchartRoutes) {
      const monitor = attachRouteErrorMonitors(page, `flipchart ${route}`);
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      await dismissCinematic(page);

      await expect(page.locator("body")).not.toBeEmpty();
      await assertNoHorizontalOverflow(page, `flipchart ${route}`);
      await expectNoBrokenImages(page, `flipchart ${route}`);

      if (proofName) {
        await page.screenshot({
          path: path.join(PROOF_DIR, proofName),
          fullPage: true,
        });
      }
      monitor.assertClean();
    }
  });

  test("7. Voice audition route health", async ({ page }) => {
    const monitor = attachRouteErrorMonitors(page, "voice audition /cartilla/voces");
    await page.goto("/cartilla/voces", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    await expect(page.locator("body")).not.toBeEmpty();
    await assertNoHorizontalOverflow(page, "voice audition");
    await expectNoBrokenImages(page, "voice audition");

    await page.screenshot({
      path: path.join(PROOF_DIR, "voice-audition.png"),
      fullPage: true,
    });
    monitor.assertClean();
  });

  test("8. Source-blocked pages 86–87 remain documented exceptions without console errors or crash", async ({ page }) => {
    const monitor = attachRouteErrorMonitors(page, "source-blocked page 86");

    // Bookmark directly to Lección 23 page index 3 (physical page 86)
    await page.goto("/cartilla/lecciones");
    await page.evaluate(() => {
      localStorage.setItem("cartilla.learner-resume.v1:23", JSON.stringify({ lesson: 23, page: 3 }));
    });

    await page.goto("/cartilla/leccion/23", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await dismissCinematic(page);

    const reader = page.locator(".native-lesson-viewer");
    await expect(reader).toBeVisible({ timeout: 15_000 });

    const pageNum = await reader.getAttribute("data-native-page");
    expect(pageNum, "Must reach physical page 86 in Lección 23").toBe("86");

    // Verify source-blocked exception indicator is rendered
    const blockedNotice = page.locator(".fp-source-blocked, [data-source-blocked='true']");
    await expect(blockedNotice).toBeVisible();

    // The blocked page must not render inferred exercise content, artwork, or
    // interactions: pages 86-87 stay source-blocked with no guessed material.
    await expect(reader.locator("canvas, textarea, input, [data-picture-name], .fp-ix-shell, .fp-activity")).toHaveCount(0);
    await expect(reader.getByRole("button", { name: /Escribe|Une|Marca|Traza|Completa/i })).toHaveCount(0);

    await page.screenshot({
      path: path.join(PROOF_DIR, "source-blocked-p86.png"),
      fullPage: true,
    });

    monitor.assertClean();
  });
});
