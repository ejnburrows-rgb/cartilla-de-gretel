#!/usr/bin/env node
/**
 * Capture Lesson 12 (Pp, printed pages 22-25) at the three owner-required
 * viewport sizes, as real-browser PNG proof of the wide cream-paper redesign.
 *
 * Usage:
 *   pnpm dev:worker            # in one terminal (http://localhost:5173)
 *   node scripts/capture-lesson-12-wide.mjs
 *
 * Environment:
 *   BASE_URL      base URL of the running dev server (default http://localhost:5173)
 *   OUT_DIR       output directory (default docs/proofs/lesson-12-wide-20261018)
 *   CHROMIUM_PATH optional path to a Chromium/Chrome executable when the
 *                 Playwright browser bundle is not installed
 *
 * The script never modifies app state beyond the browser profile it creates:
 * it seeds localStorage so Lesson 12 is unlocked and the exercise pages count
 * as complete, purely so the "Siguiente" button can turn pages for capture.
 * Binary PNGs are written locally only — they are never committed to GitHub.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:5173";
const OUT_DIR = process.env.OUT_DIR ?? "docs/proofs/lesson-12-wide-20261018";
const LESSON_URL = `${BASE_URL}/cartilla/leccion/12`;

const ALL_VIEWPORTS = [
  { name: "phone-portrait", width: 390, height: 844 },
  { name: "phone-landscape", width: 844, height: 390 },
  { name: "desktop", width: 1366, height: 900 },
];
// ONLY_VIEWPORT=name restricts the run to one viewport (lets long capture
// runs fit inside short-lived execution sandboxes).
const VIEWPORTS = process.env.ONLY_VIEWPORT
  ? ALL_VIEWPORTS.filter((v) => v.name === process.env.ONLY_VIEWPORT)
  : ALL_VIEWPORTS;

const PRINTED_PAGES = [39, 40, 41, 42];

/** Required activity ids per printed page (from page-layouts.json region ids:
 * `page-<n>-<regionId>`). Seeding these marks the exercises complete so the
 * page-turn button can advance; it does not fabricate student work proof. */
const COMPLETED_PAGE_ACTIVITIES = {
  39: ["p39-write-U", "p39-write-U2", "p39-write-l", "p39-write-l2", "p39-draw"].map(
    (r) => `page-39-${r}`,
  ),
  40: ["p40-la", "p40-le", "p40-li", "p40-lo", "p40-lu"].map((r) => `page-40-${r}`),
  41: [],
  42: ["p42-fill", "p42-write"].map((r) => `page-42-${r}`),
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const launchOptions = { headless: true };
  if (process.env.CHROMIUM_PATH) launchOptions.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(launchOptions);
  const summary = [];

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 2,
      });
      // Unlock the lesson and mark its exercise pages complete (local to this
      // browser profile) so the viewer can advance through pages 39→40→41→42.
      await context.addInitScript(
        ([lessonProgress, pageCompletion]) => {
          window.localStorage.setItem("cartilla.lesson-progress.v1", lessonProgress);
          window.localStorage.setItem("cartilla.page-completion.v1", pageCompletion);
        },
        [
          JSON.stringify(Array.from({ length: 11 }, (_, i) => i + 1)),
          JSON.stringify(COMPLETED_PAGE_ACTIVITIES),
        ],
      );
      const page = await context.newPage();
      await page.goto(LESSON_URL, { waitUntil: "networkidle" });
      await page.waitForSelector(".faithful-page", { timeout: 30000 });
      // Let the load animation settle before the first capture.
      await page.waitForTimeout(1200);

      for (const printedPage of PRINTED_PAGES) {
        const file = path.join(OUT_DIR, `lesson-12-${printedPage}-${viewport.name}.png`);
        // The data-gretel-activity ids (`page-<n>-<regionId>`) prove which
        // printed page is shown — robust across viewports and page turns.
        await page.waitForSelector(`[data-gretel-activity^="page-${printedPage}-"]`, {
          timeout: 30000,
        });
        // Wait until the page's fit-to-screen scale has settled (the shared
        // fit hook either finds a scale that fits or lets the page grow),
        // then let the page-turn and load animations finish.
        await page.waitForFunction(
          () => {
            const body = document.querySelector(".faithful-page__body");
            if (!body) return false;
            return (
              body.getAttribute("data-lc-fit-overflow") === "true" ||
              body.scrollHeight <= body.clientHeight + 1
            );
          },
          undefined,
          { timeout: 30000 },
        );
        await page.waitForTimeout(2000);
        await page.screenshot({ path: file, fullPage: false });
        summary.push({ page: printedPage, viewport: viewport.name, file });
        if (printedPage !== PRINTED_PAGES.at(-1)) {
          await page.locator(".native-lesson-viewer__navigation button").nth(1).click();
          await page.waitForTimeout(1400);
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  await writeFile(
    path.join(OUT_DIR, "capture-summary.json"),
    JSON.stringify({ base_url: BASE_URL, captures: summary }, null, 2),
  );
  console.log(`Captured ${summary.length} screenshots into ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
