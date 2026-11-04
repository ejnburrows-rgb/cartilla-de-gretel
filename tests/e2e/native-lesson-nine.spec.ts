import { expect, test } from "@playwright/test";
import { seedCompletedPages } from "./support/completion";

// Page wording and order are checked word-for-word by the book-fidelity unit
// tests; this browser test proves the four real pages render, turn and grade.
for (const width of [1280, 820, 390]) {
  test(`Lesson 9 native pages and syllable grading at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1,2,3,4,5,6,7,8]));
    });
    // Earlier pages are finished; the completion gate itself is covered elsewhere.
    await seedCompletedPages(page, [27, 28, 29]);
    await page.goto("/cartilla/leccion/9", { waitUntil: "domcontentloaded" });

    const lesson = page.locator(".native-lesson-viewer");
    await expect(lesson).toHaveAttribute("data-native-page", "27");
    await expect(lesson).toContainText("Lección 9 · Ss");
    await expect(lesson).toContainText("Escribe con tu mejor letra.");
    expect(await lesson.locator("img[src*='/art/source/workbook/']").count()).toBe(0);

    const next = lesson.getByRole("button", { name: "Siguiente" });
    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "28", { timeout: 6000 });
    await expect(lesson).toContainText("Encierra en un círculo la sílaba correspondiente.");
    await expect(lesson.locator(".native-syllable")).toHaveCount(5);
    const sa = lesson.locator(".native-syllable").first();
    await expect(sa.getByRole("status")).toContainText("de 6");

    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "29", { timeout: 6000 });
    await expect(lesson).toContainText("Pepe puso un sapo en la mesa.");

    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "30", { timeout: 6000 });
    await expect(lesson.locator(".fp-ix-fill__item").first()).toBeVisible();
    await expect(lesson.getByRole("button", { name: "Terminar lección" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
