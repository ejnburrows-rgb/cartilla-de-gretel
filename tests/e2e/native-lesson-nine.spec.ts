import { expect, test } from "@playwright/test";

for (const width of [1280, 820, 390]) {
  test(`Lesson 9 native pages and syllable grading at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1,2,3,4,5,6,7,8]));
    });
    await page.goto("/cartilla/leccion/9", { waitUntil: "domcontentloaded" });

    const lesson = page.locator(".native-lesson-viewer");
    await expect(lesson).toHaveAttribute("data-native-page", "27");
    await expect(lesson).toContainText("Lección 9 · Ss");
    await expect(lesson).toContainText("Traza con tu mejor letra.");
    expect(await lesson.locator("img[src*='/art/source/workbook/']").count()).toBe(0);

    const next = lesson.getByRole("button", { name: "Siguiente" });
    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "28");

    const sa = lesson.locator(".native-syllable").first();
    const distractor = sa.getByRole("button", { name: "semana" });
    await distractor.click();
    await expect(distractor).toHaveAttribute("aria-pressed", "false");
    await expect(sa.getByRole("status")).toContainText("0 de 3");

    const correct = sa.getByRole("button", { name: "sala" });
    await correct.click();
    await expect(correct).toHaveAttribute("aria-pressed", "true");
    await expect(sa.getByRole("status")).toContainText("1 de 3");

    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "29");
    await expect(lesson).toContainText("Completa las palabras con la sílaba correcta.");
    await expect(lesson.locator(".fp-ix-fill__item")).toHaveCount(4);

    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "30");
    await expect(lesson).toContainText("sa se si so su");
    await expect(lesson).toContainText("Pepe puso un sapo en la mesa.");
    await expect(lesson).toContainText("Susi suma sopa.");
    await expect(lesson.getByRole("button", { name: "Terminar lección" })).toBeVisible();

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
