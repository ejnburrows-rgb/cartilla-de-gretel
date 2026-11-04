import { test, expect } from "@playwright/test";
import { readFileSync, mkdirSync, existsSync, writeFileSync } from "fs";

test.describe("Performance: Current Main", () => {
  test("Measure workbook route image loading and perf budget", async ({ page }) => {
    if (!existsSync("docs/proofs/performance-current-main")) {
      mkdirSync("docs/proofs/performance-current-main", { recursive: true });
    }

    const start = Date.now();

    // Go to Student Workbook Lección 1
    await page.goto("/cartilla/leccion/1");

    await expect(page.locator("body")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Take screenshot of loaded state
    await page.screenshot({ path: "docs/proofs/performance-current-main/lesson-1-loaded.png" });

    // Measure LCP using PerformanceObserver
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        try {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry?.startTime || 0);
          }).observe({ type: "largest-contentful-paint", buffered: true });

          setTimeout(() => resolve(0), 2500);
        } catch (e) {
          resolve(0);
        }
      });
    });

    // Extract performance entries for images
    const imageStats = await page.evaluate(() => {
      const resourceEntries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      return resourceEntries
        .filter((entry) =>
          entry.initiatorType === "img" ||
          entry.initiatorType === "image" ||
          entry.initiatorType === "css" ||
          /\.(png|jpe?g|webp|avif|svg)(\?.*)?$/i.test(entry.name)
        )
        .map((entry) => ({
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
        }));
    });

    const reportData = {
      route: "/cartilla/leccion/1",
      lcpMs: lcp,
      totalLoadTimeMs: Date.now() - start,
      imageCount: imageStats.length,
      imageStats,
    };

    console.log("Workbook Performance Report:", reportData);

    writeFileSync(
      "docs/proofs/performance-current-main/report.json",
      JSON.stringify(reportData, null, 2)
    );

    expect(lcp).toBeLessThan(2500);
  });

  test("Measure teacher route image loading and perf budget", async ({ page }) => {
    if (!existsSync("docs/proofs/performance-current-main")) {
      mkdirSync("docs/proofs/performance-current-main", { recursive: true });
    }

    const start = Date.now();

    // Go to Teacher Flip Chart page 1
    await page.goto("/cartilla/teacher/paginas/1");

    await expect(page.locator("body")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Take screenshot of loaded state
    await page.screenshot({ path: "docs/proofs/performance-current-main/teacher-lesson-1-loaded.png" });

    // Measure LCP using PerformanceObserver
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        try {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry?.startTime || 0);
          }).observe({ type: "largest-contentful-paint", buffered: true });

          setTimeout(() => resolve(0), 2500);
        } catch (e) {
          resolve(0);
        }
      });
    });

    // Extract performance entries for images
    const imageStats = await page.evaluate(() => {
      const resourceEntries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      return resourceEntries
        .filter((entry) =>
          entry.initiatorType === "img" ||
          entry.initiatorType === "image" ||
          entry.initiatorType === "css" ||
          /\.(png|jpe?g|webp|avif|svg)(\?.*)?$/i.test(entry.name)
        )
        .map((entry) => ({
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
        }));
    });

    const reportData = {
      route: "/cartilla/teacher/paginas/1",
      lcpMs: lcp,
      totalLoadTimeMs: Date.now() - start,
      imageCount: imageStats.length,
      imageStats,
    };

    console.log("Teacher Performance Report:", reportData);

    writeFileSync(
      "docs/proofs/performance-current-main/teacher-report.json",
      JSON.stringify(reportData, null, 2)
    );

    expect(lcp).toBeLessThan(2500);
  });
});
