import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
] as const;

const OUT_DIR = path.resolve("test-results/visual-audit");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

test.describe("full workbook visual audit capture", () => {
  test.describe.configure({ mode: "serial" });

  for (const viewport of VIEWPORTS) {
    test(`capture all workbook states — ${viewport.name}`, async ({ page }) => {
      test.setTimeout(12 * 60 * 1000);
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

        await page.goto(`/cartilla/leccion/${lesson}`, {
          waitUntil: "networkidle",
          timeout: 60_000,
        });

        const reader = page.getByTestId("physical-book-reader");
        const stage = page.getByTestId("physical-book-stage");
        const counter = page.getByTestId("physical-book-counter");

        await expect(reader).toBeVisible({ timeout: 30_000 });
        await expect(stage).toBeVisible({ timeout: 30_000 });
        await expect(counter).toBeVisible({ timeout: 30_000 });

        await page.waitForTimeout(1000);

        let state = 0;
        for (;;) {
          const label = (await counter.textContent())?.trim() || `state-${state}`;
          const safeLabel = label
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .toLowerCase();

          await stage.screenshot({
            path: path.join(
              lessonDir,
              `${String(state).padStart(2, "0")}-${safeLabel}.jpg`,
            ),
            type: "jpeg",
            quality: 82,
          });

          const visibleImages = stage.locator("img:visible");
          const imageCount = await visibleImages.count();
          for (let i = 0; i < imageCount; i += 1) {
            const img = visibleImages.nth(i);
            const natural = await img.evaluate((node: HTMLImageElement) => ({
              src: node.currentSrc || node.src,
              complete: node.complete,
              naturalWidth: node.naturalWidth,
              naturalHeight: node.naturalHeight,
            }));
            expect(
              natural.complete && natural.naturalWidth > 0 && natural.naturalHeight > 0,
              `Broken visible image in lesson ${lesson}: ${natural.src}`,
            ).toBeTruthy();
          }

          const next = page.locator(".book-reader-controls button").last();
          if (await next.isDisabled()) break;

          await next.click();
          await page.waitForTimeout(1000);
          state += 1;

          if (state > 12) {
            throw new Error(`Unexpected page-turn loop in lesson ${lesson}`);
          }
        }
      }

      expect(errors, `Browser errors during ${viewport.name} capture`).toEqual([]);
    });
  }
});
