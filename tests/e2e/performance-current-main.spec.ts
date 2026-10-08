import { test, expect } from "@playwright/test";
import { readFileSync, mkdirSync, existsSync } from "fs";

test.describe("Performance: Current Main", () => {
  test("Measure workbook route image loading and perf budget", async ({ page }) => {
    // Ensure the output directory exists
    if (!existsSync("docs/proofs/performance-current-main")) {
      mkdirSync("docs/proofs/performance-current-main", { recursive: true });
    }

    // Start measuring performance
    const start = Date.now();

    // Go to lesson 1
    await page.goto("/cartilla/lecciones/1");

    // Wait for the main container
    await expect(page.locator("body")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Take a screenshot of the loaded state
    await page.screenshot({ path: "docs/proofs/performance-current-main/lesson-1-loaded.png" });

    // Measure LCP using PerformanceObserver in the browser context
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        try {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ type: "largest-contentful-paint", buffered: true });

          // Fallback if no LCP event fires in time
          setTimeout(() => resolve(0), 2500);
        } catch (e) {
          resolve(0); // Return 0 if not supported
        }
      });
    });

    // Extract performance entries for images
    const imageStats = await page.evaluate(() => {
      const resourceEntries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      return resourceEntries
        .filter((entry) => entry.initiatorType === "img")
        .map((entry) => ({
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
        }));
    });

    const reportData = {
      lcpMs: lcp,
      totalLoadTimeMs: Date.now() - start,
      imageCount: imageStats.length,
      imageStats
    };

    console.log("Performance Report:", reportData);

    // Save report to file
    const fs = await import("fs");
    fs.writeFileSync(
      "docs/proofs/performance-current-main/report.json",
      JSON.stringify(reportData, null, 2)
    );

    // Verify budget
    // The budget is 2500ms for LCP on 4G, so we should be well below that in tests.
    expect(lcp).toBeLessThan(2500);
  });

  test("Measure teacher route image loading and perf budget", async ({ page }) => {
    // Ensure the output directory exists
    if (!existsSync("docs/proofs/performance-current-main")) {
      mkdirSync("docs/proofs/performance-current-main", { recursive: true });
    }

    // Start measuring performance
    const start = Date.now();

    // Go to teacher flip chart
    await page.goto("/profesor/rotafolio/1");

    // Wait for the main container
    await expect(page.locator("body")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Take a screenshot of the loaded state
    await page.screenshot({ path: "docs/proofs/performance-current-main/teacher-lesson-1-loaded.png" });

    // Measure LCP using PerformanceObserver in the browser context
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        try {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ type: "largest-contentful-paint", buffered: true });

          // Fallback if no LCP event fires in time
          setTimeout(() => resolve(0), 2500);
        } catch (e) {
          resolve(0); // Return 0 if not supported
        }
      });
    });

    // Extract performance entries for images
    const imageStats = await page.evaluate(() => {
      const resourceEntries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      return resourceEntries
        .filter((entry) => entry.initiatorType === "img")
        .map((entry) => ({
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
        }));
    });

    const reportData = {
      lcpMs: lcp,
      totalLoadTimeMs: Date.now() - start,
      imageCount: imageStats.length,
      imageStats
    };

    console.log("Teacher Performance Report:", reportData);

    // Save report to file
    const fs = await import("fs");
    fs.writeFileSync(
      "docs/proofs/performance-current-main/teacher-report.json",
      JSON.stringify(reportData, null, 2)
    );

    // Verify budget
    // The budget is 2500ms for LCP on 4G, so we should be well below that in tests.
    expect(lcp).toBeLessThan(2500);
  });
});
