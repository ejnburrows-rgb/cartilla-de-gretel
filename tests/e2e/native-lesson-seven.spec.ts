import { expect, test } from "@playwright/test";

for (const width of [1280, 820, 390]) {
  test(`Lesson 7 native pages at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/cartilla/leccion/7", { waitUntil: "domcontentloaded" });
    const lesson = page.locator(".native-lesson-viewer");
    await expect(lesson).toHaveAttribute("data-native-page", "19");
    await expect(lesson).toContainText("Escribe con tu mejor letra.");
    expect(await lesson.locator("img[src*='/art/source/workbook/']").count()).toBe(0);
    const next = lesson.getByRole("button", { name: "Siguiente" });
    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "20");
    await expect(lesson.getByRole("button", { name: "Coloma" })).toBeVisible();
    const word = lesson.getByRole("button", { name: "mami" });
    await word.focus();
    await page.keyboard.press("Enter");
    await expect(word).toHaveAttribute("aria-pressed", "true");
    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "21");
    await expect(lesson).toContainText("Mi mamá me ama.");
    await next.click();
    await expect(lesson).toHaveAttribute("data-native-page", "22");
    await expect(lesson.locator(".fp-ix-fill__item")).toHaveCount(6);
    const writing = lesson.getByRole("textbox", { name: "Escribe tus oraciones" });
    await writing.fill("Mi mamá me ama.");
    await expect(writing).toHaveValue("Mi mamá me ama.");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(lesson.getByRole("button", { name: "Terminar lección" })).toBeVisible();
  });
}
