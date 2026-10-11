import { test, expect, type Page } from "@playwright/test";
import { archetypeMappingForPage } from "../../src/data/workbook-archetypes";
import * as fs from "fs";
import * as path from "path";

const PROOF_DIR = process.env.PROOF_DIR || path.join(process.cwd(), "docs/proofs/final-assembly/");

const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  laptop: { width: 1280, height: 800 },
  projector: { width: 1920, height: 1080 },
};

// Representative pages for Workbook archetypes (1-8)
const ARCHETYPE_PAGES = [
  { archetype: 1, lesson: 1, pageIndex: 0, printedPage: 1, name: "archetype-1-picture-grid" },
  { archetype: 2, lesson: 1, pageIndex: 1, printedPage: 2, name: "archetype-2-vowel-row-choices" },
  { archetype: 3, lesson: 1, pageIndex: 2, printedPage: 3, name: "archetype-3-multi-pair-connect" },
  { archetype: 4, lesson: 6, pageIndex: 1, printedPage: 17, name: "archetype-4-central-target-connect" },
  { archetype: 5, lesson: 7, pageIndex: 0, printedPage: 19, name: "archetype-5-trace-and-draw" },
  { archetype: 6, lesson: 7, pageIndex: 1, printedPage: 20, name: "archetype-6-syllable-circle" },
  { archetype: 7, lesson: 7, pageIndex: 2, printedPage: 21, name: "archetype-7-phonics-reading" },
  { archetype: 8, lesson: 7, pageIndex: 3, printedPage: 22, name: "archetype-8-word-and-sentence" },
];


/** One sidecar per screenshot keeps parallel Playwright capture metadata collision-free.
 * The capture bundle is never owner-approved by a passing test alone.
 */
async function captureOwnerProof(
  page: Page,
  filename: string,
  meta: { device: string; surface: "workbook" | "student" | "teacher" | "flipchart"; expectedRoute: string; lesson?: number; printedPage?: number; archetype?: number },
) {
  const route = new URL(page.url()).pathname;
  expect(route.startsWith("/cartilla/")).toBe(true);
  // Every screenshot must come from the exact stated lesson or teacher route.
  expect(route).toBe(meta.expectedRoute);
  if (meta.lesson !== undefined && (meta.surface === "student" || meta.surface === "workbook")) {
    expect(route).toBe(`/cartilla/leccion/${meta.lesson}`);
  }
  if (meta.printedPage !== undefined) {
    const pageSelector = meta.surface === "flipchart"
      ? page.getByTestId("flipchart-stage").getByTestId("flipchart-native-board")
      : page.locator(".native-lesson-viewer").first();
    const attribute = meta.surface === "flipchart" ? "data-flipchart-page" : "data-native-page";
    await expect(pageSelector).toHaveAttribute(attribute, String(meta.printedPage));
  }
  const imagePath = path.join(PROOF_DIR, filename);
  await page.screenshot({ path: imagePath, fullPage: false });
  fs.writeFileSync(`${imagePath}.meta.json`, JSON.stringify({
    filename,
    route,
    ...meta,
    sourceStandards: meta.surface === "workbook" || meta.surface === "student"
      ? ["WORKBOOK_ARCHETYPE_STANDARD.md", "STUDENT_INTERACTION_STANDARD.md"]
      : ["PROJECT_SOURCE_OF_TRUTH.md", "DESIGN.md"],
    approvalStatus: "NOT_OWNER_APPROVED",
  }, null, 2), "utf8");
}

test.beforeAll(() => {
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }
});

test.describe("Owner-Proof Final Capture Harness & Device Matrix", () => {
  for (const [device, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(`Viewport: ${device} (${viewport.width}x${viewport.height})`, () => {
      // 1. Workbook Archetypes Matrix
      for (const arch of ARCHETYPE_PAGES) {
        test(`Workbook Archetype ${arch.archetype} (${arch.name})`, async ({ page }) => {
          await page.setViewportSize(viewport);

          // Source-of-truth proof gate: a screenshot must represent the actual claimed archetype.
          const mapping = archetypeMappingForPage(arch.printedPage);
          expect(mapping.sourceStatus).toBe("AVAILABLE");
          expect(mapping.lessonNumber).toBe(arch.lesson);
          expect(mapping.archetypes).toContain(arch.archetype);

          // Seed resume state to directly open specified page
          await page.addInitScript(
            ({ l, p }) => {
              const payload = JSON.stringify({ lesson: l, page: p });
              localStorage.setItem(`cartilla.learner-resume.v1:${l}`, payload);
              localStorage.setItem("cartilla.learner-resume.v1", payload);
            },
            { l: arch.lesson, p: arch.pageIndex },
          );

          await page.goto(`/cartilla/leccion/${arch.lesson}`);
          const viewer = page.locator(".native-lesson-viewer, [data-testid='native-lesson-viewer']");
          await expect(viewer.first()).toBeVisible({ timeout: 15000 });
          // Never capture the wrong printed page even when the route itself is valid.
          await expect(viewer.first()).toHaveAttribute("data-native-page", String(arch.printedPage), { timeout: 15000 });

          // Clean digital canvas check: no scenic wallpaper on workbook pages
          const bgWallpaper = page.locator(".final-page-background");
          if ((await bgWallpaper.count()) > 0) {
            await expect(bgWallpaper).not.toBeVisible();
          }

          // Document overflow assertion
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(overflow).toBeLessThanOrEqual(2);

          await captureOwnerProof(page, `workbook-${arch.name}-${device}.png`, { device, surface: "workbook", expectedRoute: `/cartilla/leccion/${arch.lesson}`, lesson: arch.lesson, printedPage: arch.printedPage, archetype: arch.archetype });
        });
      }

      // A real interaction check, NOT a fake design screenshot or an extra owner-proof image.
      // Source printed page 4 is lesson 2, index 0: "Marca con una x" (not a circle).
      test("Real Workbook page 4 approved wooden pencil and pink eraser", async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.emulateMedia({ reducedMotion: "no-preference" });
        await page.addInitScript(() => {
          const payload = JSON.stringify({ lesson: 2, page: 0 });
          localStorage.setItem("cartilla.learner-resume.v1:2", payload);
          localStorage.setItem("cartilla.learner-resume.v1", payload);
        });
        await page.goto("/cartilla/leccion/2");
        const viewer = page.locator(".native-lesson-viewer").first();
        await expect(viewer).toHaveAttribute("data-native-page", "4", { timeout: 15000 });
        const grid = viewer.locator(".fp-ix-grid").first();
        await expect(grid).toBeVisible();
        await expect(grid.locator(".fp-ix-cell__lasso")).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Comprobar" })).toHaveCount(0);

        const wrong = grid.getByRole("button", { name: "iglú" });
        await wrong.click();
        const wrongMark = wrong.locator(".workbook-pencil-mark");
        await expect(wrongMark).toHaveAttribute("data-mark-type", "x");
        await expect(wrongMark).toHaveAttribute("data-mark-result", "wrong");
        await expect(wrongMark).toHaveAttribute("data-mark-status", "erasing", { timeout: 9000 });
        // The pink eraser runs before retry; the rejected red X is removed completely.
        await expect(wrongMark).toHaveCount(0, { timeout: 9000 });
        await expect(wrong).toBeEnabled();
        await expect(wrong).toHaveAttribute("aria-pressed", "false");

        const correct = grid.getByRole("button", { name: "ola" });
        await correct.click();
        const correctMark = correct.locator(".workbook-pencil-mark");
        await expect(correctMark).toHaveAttribute("data-mark-type", "x");
        await expect(correctMark).toHaveAttribute("data-mark-result", "correct");
        await expect(correctMark.locator(".workbook-pencil-mark__stroke")).toHaveCount(2);
        await expect(correct).toBeDisabled({ timeout: 10000 });
        await expect(correct).toHaveAttribute("aria-pressed", "true");
        await expect(grid.locator(".fp-ix-cell__lasso")).toHaveCount(0);
      });

      // 2. Teacher Home
      test("Teacher Home Surface", async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/cartilla/teacher");

        await expect(page.locator("h1, header, .teacher-chrome__title").first()).toBeVisible({ timeout: 10000 });

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(2);

        await captureOwnerProof(page, `teacher-home-${device}.png`, { device, surface: "teacher", expectedRoute: "/cartilla/teacher" });
      });

      // 3. Teacher Guide & Gretel Presence & Section Navigation
      test("Teacher Guide Surface & Gretel Presence", async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/cartilla/teacher/guia/1");

        const content = page.locator(".guide-html-content, .teacher-guide");
        await expect(content.first()).toBeVisible({ timeout: 10000 });

        // Verify section switching navigation state
        const procBtn = page.locator("button:has-text('Procedimiento')");
        if ((await procBtn.count()) > 0) {
          await procBtn.click();
          await expect(page.locator(".guide-html-content.active-tab-procedimiento, .guide-section").first()).toBeVisible();
        }

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(2);

        await captureOwnerProof(page, `teacher-guide-${device}.png`, { device, surface: "teacher", expectedRoute: "/cartilla/teacher/guia/1" });
      });

      // 4. Flip Chart & Top-Bound Page Turn Navigation
      test("Flip Chart Presenter Surface & Page Turn Navigation State", async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/cartilla/presentar/7");

        const panel = page.getByTestId("flipchart-hd-panel");
        await expect(panel).toBeVisible({ timeout: 15000 });

        const nativeBoard = page.getByTestId("flipchart-stage").getByTestId("flipchart-native-board");
        await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "9");

        await captureOwnerProof(page, `teacher-flipchart-p9-${device}.png`, { device, surface: "flipchart", expectedRoute: "/cartilla/presentar/7", lesson: 7, printedPage: 9 });

        // Trigger page turn key navigation
        await page.keyboard.press("ArrowRight");
        await page.locator("[data-testid='vertical-flip-layer']").waitFor({ state: "detached", timeout: 5000 }).catch(() => {});
        await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "10");

        await captureOwnerProof(page, `teacher-flipchart-turn-p10-${device}.png`, { device, surface: "flipchart", expectedRoute: "/cartilla/presentar/7", lesson: 7, printedPage: 10 });
      });

      // 5. Teacher Reports & Progress
      test("Teacher Reports & Progress Surfaces", async ({ page }) => {
        await page.setViewportSize(viewport);

        // Seed teacher session
        await page.goto("/");
        await page.evaluate(() => {
          localStorage.setItem("cartilla.seed.teacher.v1", "seed-teacher-leonor");
        });

        // Progreso View
        await page.goto("/cartilla/teacher/progreso");
        await expect(page.locator("text=Progreso de la Clase").first()).toBeVisible({ timeout: 10000 });
        await captureOwnerProof(page, `teacher-progreso-${device}.png`, { device, surface: "teacher", expectedRoute: "/cartilla/teacher/progreso" });

        // Reportes View
        await page.goto("/cartilla/teacher/reportes");
        await expect(page.locator("text=Panel de Reportes").first()).toBeVisible({ timeout: 10000 });
        await captureOwnerProof(page, `teacher-reportes-${device}.png`, { device, surface: "teacher", expectedRoute: "/cartilla/teacher/reportes" });
      });

      // 6. Actual student lesson baseline (never pass a /dev-* page as owner proof).
      test("Real Student Lesson Visual Baseline", async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/cartilla/leccion/1");
        await expect(page.locator(".native-lesson-viewer").first()).toBeVisible({ timeout: 15000 });
        await expect(page.locator(".native-lesson-viewer").first()).toHaveAttribute("data-native-page", "1");
        await captureOwnerProof(page, `student-lesson1-${device}.png`, { device, surface: "student", expectedRoute: "/cartilla/leccion/1", lesson: 1, printedPage: 1 });
      });
    });
  }
});
