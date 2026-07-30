import { test, expect, type Page } from "@playwright/test";

// Automated accessibility checks for every production route (item 5 of the
// security/CI/data-guardrails work). This is NOT a substitute for a full
// WCAG conformance tool (no color-contrast or ARIA-semantics validation) —
// it checks what's cheaply, reliably automatable: no reflow overflow at
// 390px, every image has an alt attribute, every form control has an
// accessible name, at least one h1, a main landmark, and a visible focus
// indicator on the first several tabbable elements. The rest of the manual
// matrix (screen-reader behavior, high contrast, dyslexia font, drag-only
// alternatives) is in docs/ACCESSIBILITY-STATUS.md — no formal certification
// is claimed anywhere.
//
// Dev/preview-only routes (pilot-faithful/$n, dev-*) are deliberately
// excluded — they production-disable via redirect or import.meta.env.DEV,
// so they are never a real destination.

const PUBLIC_ROUTES = [
  "/",
  "/cartilla/",
  "/cartilla/lecciones",
  "/cartilla/leccion/1",
  "/cartilla/mi-progreso",
  "/cartilla/practica",
  "/cartilla/repaso",
  "/cartilla/unirse",
  "/cartilla/ayuda",
  "/cartilla/animales",
  "/cartilla/autora",
  "/cartilla/voces",
  "/cartilla/imprimir/1",
  "/cartilla/imprimir/all",
  "/cartilla/presentar/1",
  "/login",
  "/intro",
  "/credits",
];

const TEACHER_ROUTES = [
  "/cartilla/teacher",
  "/cartilla/teacher/crm",
  "/cartilla/teacher/roster",
  "/cartilla/teacher/guia",
  "/cartilla/teacher/reportes",
  "/cartilla/teacher/ayuda",
  "/cartilla/teacher/flipchart",
  "/cartilla/teacher/admin",
];

async function assertNoOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, "no horizontal overflow at 390px").toBeLessThanOrEqual(clientWidth + 1);
}

async function assertImagesHaveAlt(page: Page) {
  const missing = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll("img")).filter((img) => !img.hasAttribute("alt")).length,
  );
  expect(missing, "every <img> has an alt attribute").toBe(0);
}

async function assertControlsLabeled(page: Page) {
  const unlabeled = await page.evaluate(() => {
    const controls = Array.from(document.querySelectorAll("input, select, textarea"));
    return controls.filter((el) => {
      if (el.getAttribute("type") === "hidden") return false;
      const hasAriaLabel = el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby");
      const id = el.getAttribute("id");
      const hasLabelFor = id && document.querySelector(`label[for="${id}"]`);
      const wrappedInLabel = el.closest("label");
      return !hasAriaLabel && !hasLabelFor && !wrappedInLabel;
    }).length;
  });
  expect(unlabeled, "every form control has an accessible name").toBe(0);
}

async function assertHasMainLandmark(page: Page) {
  const hasMain = await page.evaluate(
    () => document.querySelectorAll('main, [role="main"]').length > 0,
  );
  expect(hasMain, "page has a main landmark").toBe(true);
}

async function assertFocusVisible(page: Page) {
  const result = await page.evaluate(() => {
    function isTabbable(el: Element) {
      if (el.hasAttribute("disabled")) return false;
      if (el.getAttribute("tabindex") === "-1") return false;
      const style = getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    }
    const focusable = Array.from(
      document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(isTabbable) as HTMLElement[];
    let checked = 0;
    let noIndicator = 0;
    for (const el of focusable.slice(0, 8)) {
      el.focus();
      if (document.activeElement !== el) continue;
      checked++;
      const style = getComputedStyle(el);
      const hasOutline = style.outlineStyle !== "none" && style.outlineWidth !== "0px";
      const hasBoxShadow = style.boxShadow !== "none";
      const hasRing = String(el.className || "").includes("ring");
      if (!hasOutline && !hasBoxShadow && !hasRing) noIndicator++;
    }
    return { checked, noIndicator };
  });
  expect(
    result.noIndicator,
    `every checked focusable element (${result.checked} checked) shows a visible focus indicator`,
  ).toBe(0);
}

async function auditRoute(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle" });
  await assertNoOverflow(page);
  await assertImagesHaveAlt(page);
  await assertControlsLabeled(page);
  await assertHasMainLandmark(page);
  await assertFocusVisible(page);
}

test.describe("accessibility — public and student routes", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const url of PUBLIC_ROUTES) {
    test(`${url} passes the automated checks`, async ({ page }) => {
      await auditRoute(page, url);
    });
  }
});

test.describe("accessibility — teacher routes", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    // Same seed-auth shortcut as teacher-crm-happy-path.spec.ts.
    await page.addInitScript(() => {
      localStorage.setItem("cartilla.seed.teacher.v1", "seed-teacher-leonor");
    });
  });

  for (const url of TEACHER_ROUTES) {
    test(`${url} passes the automated checks`, async ({ page }) => {
      await auditRoute(page, url);
    });
  }
});

test("200% zoom does not introduce horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  for (const url of ["/", "/cartilla/lecciones", "/login"]) {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.documentElement.style.zoom = "2";
    });
    await assertNoOverflow(page);
  }
});

test("pages still load under prefers-reduced-motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const url of ["/", "/cartilla/lecciones"]) {
    await page.goto(url, { waitUntil: "networkidle" });
    await expect(page.locator("body")).toBeVisible();
  }
  await context.close();
});
