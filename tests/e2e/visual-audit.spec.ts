import { test, expect, type Page } from "@playwright/test";
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

async function dismissCinematic(page: Page) {
  const start = page.getByRole("button", { name: "Comenzar" });
  if (await start.isVisible().catch(() => false)) await start.click();
}

async function expectNoBrokenImages(scope: import("@playwright/test").Locator, label: string) {
  const visibleImages = scope.locator("img:visible");
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
      `Broken visible image in ${label}: ${natural.src}`,
    ).toBeTruthy();
  }
}

test.describe("complete native platform visual audit", () => {
  test.describe.configure({ mode: "serial" });

  for (const viewport of VIEWPORTS) {
    test(`capture all 90 workbook pages — ${viewport.name}`, async ({ page }) => {
      test.setTimeout(12 * 60 * 1000);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const errors: string[] = [];
      page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
      page.on("console", msg => {
        if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
      });

      let capturedPages = 0;

      for (let lesson = 1; lesson <= 24; lesson += 1) {
        const lessonDir = path.join(
          OUT_DIR,
          viewport.name,
          "workbook",
          `lesson-${String(lesson).padStart(2, "0")}`,
        );
        await ensureDir(lessonDir);

        await page.goto(`/cartilla/leccion/${lesson}`, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
        await dismissCinematic(page);

        const reader = page.locator(".native-lesson-viewer");
        const stage = reader.locator(".native-lesson-viewer__content");
        const counter = reader.locator(".native-lesson-viewer__page");

        await expect(reader).toBeVisible({ timeout: 30_000 });
        await expect(stage).toBeVisible({ timeout: 30_000 });
        await expect(counter).toBeVisible({ timeout: 30_000 });
        await expect(page.getByTestId("physical-book-reader")).toHaveCount(0);

        let state = 0;
        for (;;) {
          const pageNumber = Number(await reader.getAttribute("data-native-page"));
          expect(pageNumber).toBeGreaterThanOrEqual(1);
          expect(pageNumber).toBeLessThanOrEqual(90);

          await expectNoBrokenImages(stage, `workbook page ${pageNumber}`);
          await expect(page.locator('svg[data-gretel-rig="svg"]').first()).toBeVisible();

          const geometry = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            viewportWidth: innerWidth,
          }));
          expect(
            geometry.scrollWidth,
            `horizontal overflow on workbook page ${pageNumber}`,
          ).toBeLessThanOrEqual(geometry.viewportWidth + 2);

          await stage.screenshot({
            path: path.join(
              lessonDir,
              `${String(state).padStart(2, "0")}-page-${String(pageNumber).padStart(3, "0")}.jpg`,
            ),
            type: "jpeg",
            quality: 82,
            animations: "disabled",
          });
          capturedPages += 1;

          const next = reader.getByRole("button", { name: "Siguiente" });
          if ((await next.count()) === 0) break;

          await next.click();
          await expect(counter).not.toContainText(`Página ${pageNumber} ·`, { timeout: 4000 });
          state += 1;
          if (state > 12) throw new Error(`Unexpected page loop in lesson ${lesson}`);
        }
      }

      expect(capturedPages, `native workbook page count at ${viewport.name}`).toBe(90);
      expect(errors, `Browser errors during ${viewport.name} workbook sweep`).toEqual([]);
    });

    test(`capture all 62 native Flip Chart pages — ${viewport.name}`, async ({ page }) => {
      test.setTimeout(12 * 60 * 1000);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const errors: string[] = [];
      page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
      page.on("console", msg => {
        if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
      });

      const seen = new Set<number>();

      for (let lesson = 1; lesson <= 24; lesson += 1) {
        const lessonDir = path.join(
          OUT_DIR,
          viewport.name,
          "flipchart",
          `lesson-${String(lesson).padStart(2, "0")}`,
        );
        await ensureDir(lessonDir);

        await page.goto(`/cartilla/presentar/${lesson}`, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
        await dismissCinematic(page);

        const panel = page.getByTestId("flipchart-hd-panel");
        await expect(panel).toBeVisible({ timeout: 30_000 });

        const empty = page.getByTestId("flipchart-empty");
        if (await empty.isVisible().catch(() => false)) continue;

        for (let index = 0; index < 12; index += 1) {
          const board = panel.locator('[data-native-flipchart="true"]').first();
          await expect(board).toBeVisible();

          const rawPage = await board.getAttribute("data-flipchart-page")
            ?? await board.getAttribute("data-source-page");
          const pageNumber = Number(rawPage);
          expect(pageNumber).toBeGreaterThanOrEqual(1);
          expect(pageNumber).toBeLessThanOrEqual(62);
          seen.add(pageNumber);

          const visibleImages = panel.locator("img:visible");
          const sources = await visibleImages.evaluateAll(nodes =>
            nodes.map(node => (node as HTMLImageElement).currentSrc || (node as HTMLImageElement).src),
          );
          expect(
            sources.some(src => src.includes("/hd/flipchart/") || src.includes("/delivery/flipchart/")),
            `source page imagery leaked into Flip Chart page ${pageNumber}`,
          ).toBe(false);
          await expectNoBrokenImages(panel, `Flip Chart page ${pageNumber}`);

          const geometry = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            viewportWidth: innerWidth,
          }));
          expect(
            geometry.scrollWidth,
            `horizontal overflow on Flip Chart page ${pageNumber}`,
          ).toBeLessThanOrEqual(geometry.viewportWidth + 2);

          await panel.screenshot({
            path: path.join(
              lessonDir,
              `page-${String(pageNumber).padStart(3, "0")}.jpg`,
            ),
            type: "jpeg",
            quality: 82,
            animations: "disabled",
          });

          const next = panel.getByRole("button", { name: /Lámina siguiente/i });
          if ((await next.count()) === 0 || await next.isDisabled()) break;
          await next.click();
          await page.waitForTimeout(1200);
        }
      }

      expect([...seen].sort((a, b) => a - b)).toEqual(
        Array.from({ length: 62 }, (_, index) => index + 1),
      );
      expect(errors, `Browser errors during ${viewport.name} Flip Chart sweep`).toEqual([]);
    });
  }
});
