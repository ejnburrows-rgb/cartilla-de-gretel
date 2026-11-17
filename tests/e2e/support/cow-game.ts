import { expect, type Page, type TestInfo } from "@playwright/test";

export async function completeAndReplayCowGame(page: Page, info: TestInfo) {
  await expect(page.getByRole("status")).toHaveText("", { timeout: 6000 });
  for (const syllable of ["mu", "mo", "me", "ma", "mi"]) {
    await page.getByRole("button", { name: `Vaca ${syllable}` }).click();
    await page.getByRole("button", { name: `Casilla ${syllable}` }).click();
    if (syllable !== "mi") {
      await expect(page.getByRole("status")).toHaveText("¡Muy bien!", { timeout: 6000 });
      await expect(page.getByRole("status")).toHaveText("", { timeout: 4000 });
      await page.waitForTimeout(600);
    }
  }
  await expect(page.getByRole("dialog", { name: "Juego completado" })).toBeVisible({ timeout: 6000 });
  await page.screenshot({ path: info.outputPath("completed.png") });
  await page.getByRole("button", { name: "Jugar otra vez" }).click();
  await expect(page.getByRole("dialog", { name: "Juego completado" })).toHaveCount(0);
}
