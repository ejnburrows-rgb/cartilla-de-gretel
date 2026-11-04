import { expect, test } from "@playwright/test";
import { seedCompletedPages } from "./support/completion";

// Page wording and order are checked word-for-word by the book-fidelity unit
// tests; this browser test proves the four real pages render and turn.
for (const width of [1280, 820, 390]) {
  test(`Lesson 8 native pages at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1, 2, 3, 4, 5, 6, 7]));
    });
    // Earlier pages are finished; the completion gate itself is covered elsewhere.
    await seedCompletedPages(page, [23, 24, 25]);
    await page.goto("/cartilla/leccion/8", { waitUntil: "domcontentloaded" });

    const lesson = page.locator(".native-lesson-viewer");
    await expect(lesson).toHaveAttribute("data-native-page", "23");
    await expect(lesson).toContainText("Lección 8 · Pp");
    await expect(lesson).toContainText("Escribe con tu mejor letra.");
    expect(await lesson.locator("img[src*='/art/source/workbook/']").count()).toBe(0);

    const next = lesson.getByRole("button", { name: "Siguiente" });
    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "24", { timeout: 6000 });
    await expect(lesson.locator(".native-syllable")).toHaveCount(5);

    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "25", { timeout: 6000 });
    await expect(lesson).toContainText("Mi papá ama a Pupi.");

    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "26", { timeout: 6000 });
    await expect(lesson.locator(".fp-ix-fill__item").first()).toBeVisible();
    expect(await lesson.locator("img[src*='/art/source/workbook/']").count()).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(lesson.getByRole("button", { name: "Terminar lección" })).toBeVisible();
  });
}
