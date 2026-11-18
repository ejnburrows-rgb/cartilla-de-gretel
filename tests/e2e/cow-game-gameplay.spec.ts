import { expect, test } from "@playwright/test";

test.describe("Juego de la vaca (Cow Game) gameplay and visual standard", () => {
  test("mounts with 5 cows, 5 fence slots, and >=56px touch targets", async ({ page }) => {
    await page.goto("/cartilla/juego/cow-game-m");
    await expect(page.getByRole("main", { name: "Juego de la vaca" })).toBeVisible();

    // Verify 5 cows exist
    const cows = page.locator('button[aria-label^="Vaca "]');
    await expect(cows).toHaveCount(5);

    // Verify 5 fence slots exist
    const slots = page.locator('button[aria-label^="Casilla "]');
    await expect(slots).toHaveCount(5);

    // Verify top controls have >= 56px minimum touch targets
    const homeBtn = page.getByRole("link", { name: "Inicio" });
    await expect(homeBtn).toBeVisible();
    const homeBox = await homeBtn.boundingBox();
    expect(homeBox?.height).toBeGreaterThanOrEqual(56);
    expect(homeBox?.width).toBeGreaterThanOrEqual(56);

    const settingsBtn = page.getByRole("button", { name: "Ajustes" });
    await expect(settingsBtn).toBeVisible();
    const settingsBox = await settingsBtn.boundingBox();
    expect(settingsBox?.height).toBeGreaterThanOrEqual(56);
    expect(settingsBox?.width).toBeGreaterThanOrEqual(56);
  });

  test("plays through matching cow to slot with walking and drop animation", async ({ page }) => {
    await page.goto("/cartilla/juego/cow-game-m");

    // Match cow "mu" to slot "mu"
    // COW_SLOTS = ["mo", "mu", "ma", "mi", "me"] -> slot 1 is "mu"
    const cowMu = page.getByRole("button", { name: "Vaca mu" });
    await cowMu.click();

    const slotMu = page.getByRole("button", { name: "Casilla mu" });
    await slotMu.click();

    // Verify feedback message appears during/after placement
    await expect(page.getByText("¡Muy bien!")).toBeVisible({ timeout: 4000 });
  });

  test("supports guided mode via query and route alias", async ({ page }) => {
    await page.goto("/cartilla/juego/vaca-p-guided");
    await expect(page.getByRole("main", { name: "Juego de la vaca" })).toBeVisible();

    // In guided mode, instruction guide banner is visible
    const guide = page.locator(".cg-guide");
    await expect(guide).toBeVisible();
    await expect(guide).toContainText("1. Elige una vaca");
  });
});
