import { expect, test } from "@playwright/test";

test("quick Spanish syllable practice stays silent when syllable recordings are absent", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "__ttsCalls", { configurable: true, value: 0 });
    const originalSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = (...args) => {
      (window as Window & { __ttsCalls: number }).__ttsCalls += 1;
      originalSpeak(...args);
    };
  });
  await page.goto("/cartilla/practica");
  await page.getByRole("button", { name: /Empezar/ }).click();
  await expect(page.getByText("Lee la sílaba que aparece en cada tarjeta.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reescuchar" })).toHaveCount(0);
  expect(await page.evaluate(() => (window as Window & { __ttsCalls: number }).__ttsCalls)).toBe(0);
});
