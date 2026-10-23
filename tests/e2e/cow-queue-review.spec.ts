import { expect, test } from "@playwright/test";
for (const viewport of [
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
]) {
  test(`cow wrong/correct and reset ${viewport.width}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto("/cartilla/juego/cow-game-m");
    await expect(page.getByRole("button", { name: "Vaca mu", exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("start.png") });
    await page.getByRole("button", { name: "Vaca mu", exact: true }).click();
    await page.getByRole("button", { name: "Casilla ma", exact: true }).click();
    await expect(page.getByRole("status")).toHaveText("Inténtalo otra vez", { timeout: 8000 });
    await expect(page.getByRole("status")).toHaveText("", { timeout: 8000 });
    await expect(page.locator(".cg-walking")).toHaveCount(0, { timeout: 8000 });
    await page.getByRole("button", { name: "Vaca mu", exact: true }).click();
    await page.getByRole("button", { name: "Casilla mu", exact: true }).click();
    await expect(page.getByRole("status")).toHaveText("¡Muy bien!", { timeout: 8000 });
    await page.screenshot({ path: testInfo.outputPath("correct.png") });
    await expect(page.locator(".cg-walking")).toHaveCount(0, { timeout: 8000 });
    await page.getByRole("button", { name: "Vaca mo", exact: true }).click();
    await page.getByRole("button", { name: "Casilla mo", exact: true }).click();
    await page.getByRole("button", { name: "Ajustes", exact: true }).click();
    await page.getByRole("button", { name: "Empezar de nuevo", exact: true }).click();
    await page.waitForTimeout(6500);
    await page.screenshot({ path: testInfo.outputPath("reset.png") });
    await expect(page.getByRole("status")).toHaveText("");
    const pos = await page
      .locator(".cg-card")
      .evaluateAll((els) => els.map((el) => Number.parseInt((el as HTMLElement).style.zIndex)));
    expect(pos).not.toContain(65);
  });
}
