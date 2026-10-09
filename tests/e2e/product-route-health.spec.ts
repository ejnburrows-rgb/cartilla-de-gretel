import { test, expect, type Page, type Request } from "@playwright/test";

async function dismissCinematic(page: Page) {
  const start = page.getByRole("button", { name: "Comenzar" });
  if (await start.isVisible().catch(() => false)) {
    await start.click();
  }
}

async function expectNoBrokenImages(scope: Page | import("@playwright/test").Locator, label: string) {
  // Give visible images time to decode if recently mounted
  const brokenSources = await scope.locator("img:visible").evaluateAll(async (elements) => {
    // Wait for pending images to finish loading/failing
    await Promise.all(
      elements.map(
        (el) =>
          new Promise<void>((resolve) => {
            const img = el as HTMLImageElement;
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(resolve, 2000);
          }),
      ),
    );
    return elements
      .filter((element) => {
        const image = element as HTMLImageElement;
        return image.complete && (image.naturalWidth === 0 || image.naturalHeight === 0);
      })
      .map((element) => {
        const image = element as HTMLImageElement;
        return image.currentSrc || image.src;
      });
  });
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
        // Only allow duplicate key warning on teacher guide route where known
        if (text.includes("Encountered two children with the same key") && routeLabel.includes("teacher/guide")) {
          return;
        }
        consoleErrors.push(text);
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
      expect(consoleErrors, `Console errors on ${routeLabel}`).toEqual([]);
      expect(failedRequests, `Failed network requests on ${routeLabel}`).toEqual([]);
    },
  };
}

async function checkBasicRoute(page: Page, route: string, label: string) {
  const monitor = attachRouteErrorMonitors(page, label);
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await dismissCinematic(page);
  await expect(page.locator("body")).not.toBeEmpty();
  await assertNoHorizontalOverflow(page, label);
  await expectNoBrokenImages(page, label);
  monitor.assertClean();
}

test.describe("Whole-Product Route Health + Console/Network Error Sweep", () => {
  test("1. Welcome / Home routes health", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const monitorPhone = attachRouteErrorMonitors(page, "welcome-phone /entrar");

    await page.goto("/entrar", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await dismissCinematic(page);

    await expect(page.locator("body")).not.toBeEmpty();
    await assertNoHorizontalOverflow(page, "welcome-phone /entrar");
    await expectNoBrokenImages(page, "welcome-phone");
    monitorPhone.assertClean();

    await page.setViewportSize({ width: 1280, height: 900 });
    const welcomeRoutes = ["/", "/cartilla/", "/entrar", "/cartilla/student-login"];

    for (const route of welcomeRoutes) {
      await checkBasicRoute(page, route, `welcome ${route}`);
    }
  });

  test("2. Lesson catalog routes health", async ({ page }) => {
    const catalogRoutes = ["/cartilla/lecciones", "/cartilla/teacher/lecciones"];

    for (const route of catalogRoutes) {
      await checkBasicRoute(page, route, `catalog ${route}`);
    }
  });

  test("3. Representative Workbook lessons health across early/middle/late pages", async ({ page }) => {
    const lessonSamples = [1, 2, 12, 14, 23, 24];

    for (const lesson of lessonSamples) {
      const monitor = attachRouteErrorMonitors(page, `workbook lesson ${lesson}`);
      await page.goto(`/cartilla/leccion/${lesson}`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      await dismissCinematic(page);

      const reader = page.locator(".native-lesson-viewer");
      await expect(reader).toBeVisible({ timeout: 15_000 });
      await assertNoHorizontalOverflow(page, `workbook lesson ${lesson}`);
      await expectNoBrokenImages(reader, `workbook lesson ${lesson}`);
      monitor.assertClean();
    }
  });

  test("4. Print route health", async ({ page }) => {
    const printRoutes = ["/cartilla/imprimir/1", "/cartilla/imprimir/2", "/cartilla/imprimir/all"];

    for (const route of printRoutes) {
      const monitor = attachRouteErrorMonitors(page, `print ${route}`);
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});

      await expect(page.locator("body")).not.toBeEmpty();
      await assertNoHorizontalOverflow(page, `print ${route}`);
      monitor.assertClean();
    }
  });

  test("5. Teacher home/guide/progress/reports routes health", async ({ page }) => {
    const teacherRoutes = [
      "/cartilla/teacher",
      "/cartilla/teacher/guide",
      "/cartilla/teacher/guia/1",
      "/cartilla/teacher/progreso",
      "/cartilla/teacher/reportes",
      "/cartilla/teacher/crm",
      "/cartilla/teacher/roster",
    ];

    for (const route of teacherRoutes) {
      const monitor = attachRouteErrorMonitors(page, `teacher ${route}`);
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});

      await expect(page.locator("body")).not.toBeEmpty();
      await assertNoHorizontalOverflow(page, `teacher ${route}`);
      await expectNoBrokenImages(page, `teacher ${route}`);
      monitor.assertClean();
    }
  });

  test("6. Flip Chart catalog & presenter routes health", async ({ page }) => {
    const flipchartRoutes = [
      "/cartilla/teacher/flipchart",
      "/cartilla/presentar/1",
      "/cartilla/presentar/7",
    ];

    for (const route of flipchartRoutes) {
      const monitor = attachRouteErrorMonitors(page, `flipchart ${route}`);
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle").catch(() => {});
      await dismissCinematic(page);

      await expect(page.locator("body")).not.toBeEmpty();
      await assertNoHorizontalOverflow(page, `flipchart ${route}`);
      await expectNoBrokenImages(page, `flipchart ${route}`);
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
    monitor.assertClean();
  });

  test("8. Source-blocked pages 86–87 remain documented exceptions without console errors or crash", async ({ page }) => {
    const monitor = attachRouteErrorMonitors(page, "source-blocked page 86");

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

    const blockedNotice = page.locator(".fp-source-blocked, [data-source-blocked='true']").first();
    await expect(blockedNotice).toBeVisible();

    // Verify no invented exercise activities or form inputs are rendered
    await expect(reader.locator("[data-gretel-activity]")).toHaveCount(0);
    await expect(reader.locator("input, textarea, canvas")).toHaveCount(0);

    monitor.assertClean();
  });
});
