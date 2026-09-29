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

        // Count the sheets via the strip tabs.
        const tabs = page.getByRole("tab", { name: /Ir a hoja/ });
        const sheetCount = await tabs.count();

        for (let sheet = 0; sheet < sheetCount; sheet += 1) {
          await tabs.nth(sheet).click();
          await page.waitForTimeout(800);
          const counter = await page
            .getByTestId("flipchart-counter")
            .textContent();
          const safeLabel =
            counter?.trim().replace(/[^a-zA-Z0-9áéíóúñü-]+/gi, "-") ??
            `sheet-${sheet + 1}`;
          await stage.screenshot({
            path: path.join(lessonDir, `${safeLabel}.png`),
          });
        }
      }

      expect(
        errors,
        `console/page errors during flip chart capture (${viewport.name})`,
      ).toEqual([]);
    });
  }
});
