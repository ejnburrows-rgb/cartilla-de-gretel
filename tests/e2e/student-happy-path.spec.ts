import { test, expect } from "@playwright/test";

// Student happy path: open Lesson 1, answer one activity, see it graded.
// This is a smoke test — it drives a real browser like a child would, so an
// accidental break in the core student flow is caught automatically. It seeds
// lesson progress in localStorage (key confirmed in src/lib/lesson-progress.ts)
// so the app starts in a known state; an empty array leaves Lesson 1 available.
test("student opens Lesson 1, answers a picture activity, and sees it graded", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([]));
  });

  await page.goto("/cartilla/leccion/1");

  // 1. The faithful lesson page renders.
  await expect(page.getByText(/LECCIÓN 1/i).first()).toBeVisible({ timeout: 20_000 });

  // 2. At least one interactive activity cell is present.
  const cells = page.locator(".fp-ix-cell");
  await expect(cells.first()).toBeVisible({ timeout: 20_000 });

  // 3. Answer: tap a right picture. Each tap is graded at once (there is no
  //    separate "Comprobar" step): the picture keeps its pencil circle.
  const right = page.locator('.fp-ix-cell[data-gretel-correct="true"]').first();
  await right.click();

  // 4. A visible grading reaction appears and the graded picture is locked.
  await expect(right).toHaveClass(/graded-correct/, { timeout: 10_000 });
  await expect(right.locator('[data-mark-status="correct"]')).toHaveCount(1);
  await expect(right).toBeDisabled();

  // 5. Proof.
  await page.screenshot({
    path: "tests/e2e/__screenshots__/lesson-1-graded.png",
  });
});
