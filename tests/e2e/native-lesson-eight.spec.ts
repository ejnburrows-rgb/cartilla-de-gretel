import { expect, test } from "@playwright/test";

for (const width of [1280, 820, 390]) {
  test(`Lesson 8 native pages at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1, 2, 3, 4, 5, 6, 7]));
    });
    await page.goto("/cartilla/leccion/8", { waitUntil: "domcontentloaded" });

    const lesson = page.locator(".native-lesson-viewer");
    await expect(lesson).toHaveAttribute("data-native-page", "23");
    await expect(lesson).toContainText("Lección 8 · Pp");
    await expect(lesson).toContainText("Traza con tu mejor letra.");
    expect(await lesson.locator("img[src*='/art/source/workbook/']").count()).toBe(0);

    const next = lesson.getByRole("button", { name: "Siguiente" });
    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "24");
    await expect(lesson.getByRole("button", { name: "papá" })).toBeVisible();

    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "25");
    await expect(lesson).toContainText("Completa las palabras con la sílaba correcta.");
    await expect(lesson.locator(".fp-ix-fill__item")).toHaveCount(4);

    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "26");
    await expect(lesson).toContainText("pa pe pi po pu");
    await expect(lesson).toContainText("Mi papá ama a Pupi.");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(lesson.getByRole("button", { name: "Terminar lección" })).toBeVisible();
  });
}
