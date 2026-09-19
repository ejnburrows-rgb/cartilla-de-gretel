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

  // 3. Answer: tap a picture cell, then press "Comprobar".
  await cells.first().click();
  const check = page.getByRole("button", { name: "Comprobar" }).first();
  await expect(check).toBeEnabled();
  await check.click();

  // 4. A visible grading reaction (correct / incorrect state) appears, and the
  //    check button becomes disabled now that the activity has been graded.
  await expect(page.locator(".graded-correct, .graded-wrong, .graded-missed").first()).toBeVisible({
    timeout: 10_000,
  });
  await expect(check).toBeDisabled();

  // 5. Proof.
  await page.screenshot({
    path: "tests/e2e/__screenshots__/lesson-1-graded.png",
  });
});
