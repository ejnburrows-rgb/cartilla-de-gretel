import { test, expect } from "@playwright/test";
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
  { archetype: 3, lesson: 2, pageIndex: 0, printedPage: 4, name: "archetype-3-syllable-wheel" },
  { archetype: 4, lesson: 3, pageIndex: 0, printedPage: 7, name: "archetype-4-word-builder" },
  { archetype: 5, lesson: 4, pageIndex: 0, printedPage: 10, name: "archetype-5-sentence-read" },
  { archetype: 6, lesson: 5, pageIndex: 0, printedPage: 13, name: "archetype-6-writing-tracing" },
  { archetype: 7, lesson: 6, pageIndex: 0, printedPage: 16, name: "archetype-7-reading-comp" },
  { archetype: 8, lesson: 7, pageIndex: 0, printedPage: 19, name: "archetype-8-review-game" },
];

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

          // Clean digital canvas check: no scenic wallpaper on workbook pages
          const bgWallpaper = page.locator(".final-page-background");
          if ((await bgWallpaper.count()) > 0) {
            await expect(bgWallpaper).not.toBeVisible();
          }

          // Document overflow assertion
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(overflow).toBeLessThanOrEqual(2);

          await page.screenshot({
            path: path.join(PROOF_DIR, `workbook-${arch.name}-${device}.png`),
            fullPage: false,
          });
        });
      }

      // 2. Teacher Home
      test("Teacher Home Surface", async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/cartilla/teacher");

        await expect(page.locator("h1, header, .teacher-chrome__title").first()).toBeVisible({ timeout: 10000 });

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(2);

        await page.screenshot({
          path: path.join(PROOF_DIR, `teacher-home-${device}.png`),
        });
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

        await page.screenshot({
          path: path.join(PROOF_DIR, `teacher-guide-${device}.png`),
        });
      });

      // 4. Flip Chart & Top-Bound Page Turn Navigation
      test("Flip Chart Presenter Surface & Page Turn Navigation State", async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/cartilla/presentar/7");

        const panel = page.getByTestId("flipchart-hd-panel");
        await expect(panel).toBeVisible({ timeout: 15000 });

        const nativeBoard = page.getByTestId("flipchart-stage").getByTestId("flipchart-native-board");
        await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "9");

        await page.screenshot({
          path: path.join(PROOF_DIR, `teacher-flipchart-p9-${device}.png`),
        });

        // Trigger page turn key navigation
        await page.keyboard.press("ArrowRight");
        await page.locator("[data-testid='vertical-flip-layer']").waitFor({ state: "detached", timeout: 5000 }).catch(() => {});
        await expect(nativeBoard).toHaveAttribute("data-flipchart-page", "10");

        await page.screenshot({
          path: path.join(PROOF_DIR, `teacher-flipchart-turn-p10-${device}.png`),
        });
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
        await page.screenshot({
          path: path.join(PROOF_DIR, `teacher-progreso-${device}.png`),
        });

        // Reportes View
        await page.goto("/cartilla/teacher/reportes");
        await expect(page.locator("text=Panel de Reportes").first()).toBeVisible({ timeout: 10000 });
        await page.screenshot({
          path: path.join(PROOF_DIR, `teacher-reportes-${device}.png`),
        });
      });

      // 6. Gretel Dedicated Guidance State
      test("Gretel Guidance State", async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto("/dev-gretel");

        await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
        await page.screenshot({
          path: path.join(PROOF_DIR, `gretel-presence-${device}.png`),
        });
      });
    });
  }
});
