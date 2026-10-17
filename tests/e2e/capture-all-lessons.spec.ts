import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const PROOF_DIR =
  process.env.PROOF_DIR || path.join(process.cwd(), "docs/proofs/lesson-screenshots");

test.beforeAll(() => {
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }
});

test.describe("Capture All Lessons Screenshots", () => {
  for (let n = 1; n <= 24; n++) {
    test(`Capture Lesson ${n}`, async ({ page }) => {
      // Set to standard desktop viewport
      await page.setViewportSize({ width: 1280, height: 900 });

      // Navigate to the lesson to set up initial state
      await page.goto(`/cartilla/leccion/${n}`, { waitUntil: "domcontentloaded" });

      // Bypass completion gating to freely navigate
      await page.evaluate((lessonNumber) => {
        const completed = Array.from({ length: lessonNumber }, (_, i) => i + 1);
        localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify(completed));
        localStorage.setItem("cartilla:completed-lessons", JSON.stringify(completed));
        window.dispatchEvent(new Event("cartilla:lesson-progress"));
      }, n);

      await page.reload({ waitUntil: "domcontentloaded" });

      // Wait for the lesson viewer to be ready
      const viewer = page.locator(".native-lesson-viewer");
      await expect(viewer).toBeVisible({ timeout: 15000 });

      // Wait a short moment for initial render
      await page.waitForTimeout(1000);

      let currentNativePage = await viewer.getAttribute("data-native-page");
      let pageIndex = 1;

      while (true) {
        // Screenshot current page
        await page.screenshot({
          path: path.join(
            PROOF_DIR,
            `lesson-${String(n).padStart(2, "0")}-page-${String(pageIndex).padStart(2, "0")}.png`,
          ),
          fullPage: false,
        });

        // Turn page
        await page.keyboard.press("ArrowRight");

        // Wait for page turn animation to settle (usually ~2.0-3.0s, giving 3.5s to be safe)
        await page.waitForTimeout(3500);

        // Check if the viewer is still visible
        if (!(await viewer.isVisible())) {
          break; // Navigated away from lesson
        }

        const newNativePage = await viewer.getAttribute("data-native-page");
        if (newNativePage === currentNativePage || !newNativePage) {
          // No page change or attribute gone means we reached the end of the lesson
          break;
        }

        currentNativePage = newNativePage;
        pageIndex++;
      }
    });
  }
});
