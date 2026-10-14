import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
] as const;

const OUT_DIR = path.resolve("test-results/flipchart-audit");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

test.describe("full flip chart visual audit capture", () => {
  test.describe.configure({ mode: "serial" });

  for (const viewport of VIEWPORTS) {
    test(`capture all flip chart pages — ${viewport.name}`, async ({ page }) => {
      test.setTimeout(15 * 60 * 1000);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
      });

      let captured = 0;
      for (let lesson = 1; lesson <= 24; lesson += 1) {
        const lessonDir = path.join(
          OUT_DIR,
          viewport.name,
          `lesson-${String(lesson).padStart(2, "0")}`,
        );
        await ensureDir(lessonDir);

        await page.goto(`/cartilla/presentar/${lesson}`, {
          waitUntil: "networkidle",
          timeout: 60_000,
        });

        const panel = page.getByTestId("flipchart-hd-panel");
        await expect(panel).toBeVisible({ timeout: 30_000 });
        const stage = page.getByTestId("flipchart-stage");
        await expect(stage).toBeVisible({ timeout: 30_000 });

        // Walk the lesson's sheets with the presenter's own "Lámina siguiente"
        // control; the counter ("Hoja 1 de N") gives the sheet count on every
        // viewport (the tab strip is not shown on small screens).
        const counter = page.getByTestId("flipchart-counter");
        await expect(counter).toContainText("Hoja 1 de");
        const sheetCount = Number((await counter.textContent())?.match(/de (\d+)/)?.[1] ?? 0);
        expect(sheetCount, `sheet count for lesson ${lesson}`).toBeGreaterThan(0);

        for (let sheet = 0; sheet < sheetCount; sheet += 1) {
          if (sheet > 0) {
            await page.getByRole("button", { name: "Lámina siguiente", exact: true }).click();
            await expect(counter).toContainText(`Hoja ${sheet + 1} de`, { timeout: 8000 });
            await page.waitForTimeout(600);
          }
          const broken = await stage.locator("img:visible").evaluateAll((nodes) =>
            nodes
              .filter((node) => { const img = node as HTMLImageElement; return !(img.complete && img.naturalWidth > 0); })
              .map((node) => (node as HTMLImageElement).currentSrc || (node as HTMLImageElement).src));
          expect(broken, `broken pictures on lesson ${lesson} sheet ${sheet + 1} (${viewport.name})`).toEqual([]);
          await stage.screenshot({
            path: path.join(lessonDir, `Hoja-${sheet + 1}-de-${sheetCount}.png`),
          });
          captured += 1;
        }
      }

      expect(captured, `sheets captured at ${viewport.name}`).toBeGreaterThanOrEqual(60);
      expect(
        errors,
        `console/page errors during flip chart capture (${viewport.name})`,
      ).toEqual([]);
    });
  }
});
