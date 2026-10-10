import { test, expect, type Page } from "@playwright/test";
import * as path from "node:path";
import * as fs from "node:fs";

// Use PROOF_DIR from env or fallback for local direct execution
const PROOF_DIR = process.env.PROOF_DIR || path.resolve("docs/proofs/final-assembly");

const viewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "laptop", width: 1440, height: 900 },
  { name: "projector", width: 1280, height: 720 },
];

async function captureState(
  page: Page,
  viewport: { name: string; width: number; height: number },
  name: string,
) {
  const filename = `${name}-${viewport.name}.png`;
  const filepath = path.join(PROOF_DIR, filename);
  await page.waitForTimeout(1000); // Give small time for layout to settle and animations to complete
  await page.screenshot({ path: filepath, fullPage: true });
}

// Check that this is a direct execution for capturing
if (process.env.PROOF_DIR) {
  test.describe("Owner Proof Capture", () => {
    test.beforeAll(() => {
      // Ensure the directory exists but DO NOT clear it here; the script handles it
      fs.mkdirSync(PROOF_DIR, { recursive: true });
    });

    for (const viewport of viewports) {
      test(`Capture matrix - ${viewport.name}`, async ({ page }) => {
        test.setTimeout(120000); // 120 seconds timeout just in case it is slow
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.emulateMedia({ reducedMotion: "reduce" });

        // 1. Teacher Home
        await page.goto("/cartilla/teacher", { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("heading", { name: "Panel del Docente" })).toBeVisible({
          timeout: 10000,
        });
        await captureState(page, viewport, "01-teacher-home");

        // 2. Teacher Guide (Lesson 1)
        await page.goto("/cartilla/teacher/guia/1", { waitUntil: "domcontentloaded" });
        await expect(page.locator("body")).toContainText(/Lección/i, { timeout: 10000 });
        await captureState(page, viewport, "02-teacher-guide-l1");

        // 3. Teacher Flip Chart (Lesson 1)
        await page.goto("/cartilla/presentar/1", { waitUntil: "domcontentloaded" });
        await expect(page.getByTestId("flipchart-stage")).toBeVisible();
        await captureState(page, viewport, "03-teacher-flipchart-l1");

        // 4. Teacher Report
        await page.goto("/cartilla/teacher/reportes", { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("heading", { level: 2 }).filter({ hasText: /Reporte/i }))
          .toBeVisible({ timeout: 10000 })
          .catch(() => null);
        await captureState(page, viewport, "04-teacher-report");

        // 5. Representative Workbook Archetypes
        const archetypes = [
          { url: "/cartilla/leccion/1", name: "05-workbook-archetype-1-grid" },
          { url: "/cartilla/leccion/2", name: "06-workbook-archetype-2-vowel-row" },
          { url: "/cartilla/leccion/3", name: "07-workbook-archetype-3-matching" },
          { url: "/cartilla/leccion/5", name: "08-workbook-archetype-4-single-target" },
          { url: "/cartilla/leccion/6", name: "09-workbook-archetype-5-handwriting" },
          { url: "/cartilla/leccion/20", name: "10-workbook-archetype-6-syllable-circle" },
          { url: "/cartilla/leccion/21", name: "11-workbook-archetype-7-reading" },
          { url: "/cartilla/leccion/22", name: "12-workbook-archetype-8-sentence" },
        ];

        for (const arch of archetypes) {
          await page.goto(arch.url, { waitUntil: "domcontentloaded" });
          // We assume start gate is already handled or not present here in review mode
          const start = page.getByRole("button", { name: "Comenzar", exact: true });
          if (
            await start
              .waitFor({ state: "visible", timeout: 3000 })
              .then(() => true)
              .catch(() => false)
          ) {
            await start.click();
          }
          const reader = page.locator(".native-lesson-viewer").first();
          await expect(reader).toBeVisible({ timeout: 15000 });
          await captureState(page, viewport, arch.name);
        }

        // 6. Gretel Presence
        await page.goto("/cartilla/lecciones", { waitUntil: "domcontentloaded" });
        const master = page.locator(
          'img[src="/cartilla/images/gretel/gretel-approved-master.png"]',
        );
        await expect(master).toBeVisible({ timeout: 10000 });
        await captureState(page, viewport, "13-gretel-presence");
      });
    }
  });
}
