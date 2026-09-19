import { expect, test } from "@playwright/test";

const LIVE_GAME_IDS = [
  "payaso-chano-ss",
  "mariposas-p",
  "vocal-a",
  "fonetica-p",
  "silabas-p",
  "rima-p",
  "palabras-minuto-p",
  "dibujos-o",
] as const;

test.describe("all themed games", () => {
  for (const id of LIVE_GAME_IDS) {
    test(`${id} mounts as a real game`, async ({ page }) => {
      await page.goto(`/cartilla/juego/${id}`);
      await expect(page.getByText("Juego no encontrado.")).toHaveCount(0);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByLabel("Instrucciones del juego")).toBeVisible();
    });
  }

  test("mariposas completes a source-backed word", async ({ page }) => {
    await page.goto("/cartilla/juego/mariposas-p");
    await page.getByRole("button", { name: "pa", exact: true }).click();
    await page.getByRole("button", { name: "pi", exact: true }).click();
    await expect(page.getByText("¡Palabra completa!")).toBeVisible();
  });

  test("vowel identification marks a correct answer", async ({ page }) => {
    await page.goto("/cartilla/juego/vocal-a");
    await page.getByRole("button", { name: "Sí", exact: true }).first().click();
    await expect(page.locator("div.border-emerald-400").first()).toBeVisible();
  });

  test("phonics completion accepts the missing syllable", async ({ page }) => {
    await page.goto("/cartilla/juego/fonetica-p");
    await page.getByRole("button", { name: "pa", exact: true }).click();
    await expect(page.getByText("¡Correcto!")).toBeVisible();
  });

  test("rhyme game accepts the matching ending", async ({ page }) => {
    await page.goto("/cartilla/juego/rima-p");
    await page.getByRole("button", { name: "Pepi", exact: true }).click();
    await expect(page.getByText("¡Riman!")).toBeVisible();
  });

  test("one-minute reading timer starts", async ({ page }) => {
    await page.goto("/cartilla/juego/palabras-minuto-p");
    await page.getByRole("button", { name: "Empezar 1 minuto" }).click();
    await expect(page.getByText(/59s|60s/)).toBeVisible();
  });

  test("picture matching accepts the correct verified crop", async ({ page }) => {
    await page.goto("/cartilla/juego/dibujos-o");
    await page.getByRole("button", { name: "Dibujo de oso" }).click();
    await expect(page.getByText("¡Ese es el dibujo!")).toBeVisible();
  });
});
