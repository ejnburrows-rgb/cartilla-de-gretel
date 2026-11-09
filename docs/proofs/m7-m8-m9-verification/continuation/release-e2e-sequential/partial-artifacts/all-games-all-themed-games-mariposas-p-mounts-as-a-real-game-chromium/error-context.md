# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: all-games.spec.ts >> all themed games >> mariposas-p mounts as a real game
- Location: tests\e2e\all-games.spec.ts:17:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('main')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('main') with timeout 5000ms
  - waiting for getByRole('main')

```

```yaml
- link "Saltar al contenido principal":
  - /url: "#main-content"
- img "Jardín con flores, cartel de palabras, sol y regadera"
- 'button "Sol: escuchar de nuevo la palabra"'
- 'button "Regadera: próxima palabra"'
- 'button "Florecita 1: colocar aquí la próxima sílaba"'
- 'button "Florecita 2: colocar aquí la próxima sílaba"'
- 'button "Florecita 3: colocar aquí la próxima sílaba"'
- link "Volver a práctica":
  - /url: /cartilla/practica
- text: mapa
- 'button "Mariposa: comprobar la palabra"'
- 'button "Red: las mariposas regresan al jardín"'
- button "Instrucciones": "?"
- button "Mariposa ma"
- button "Mariposa mo"
- button "Mariposa mi"
- button "Mariposa Mu"
- button "Mariposa pa"
- button "Mariposa po"
- button "Mariposa me"
- button "Mariposa Pe"
- button "Mariposa pi"
- button "Mariposa Pu"
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | const LIVE_GAME_IDS = [
  4  |   "payaso-chano-ss",
  5  |   "mariposas-p",
  6  |   "vocal-a",
  7  |   "fonetica-p",
  8  |   "silabas-p",
  9  |   "rima-p",
  10 |   "palabras-minuto-p",
  11 |   "dibujos-o",
  12 |   "completar-palabras",
  13 | ] as const;
  14 | 
  15 | test.describe("all themed games", () => {
  16 |   for (const id of LIVE_GAME_IDS) {
  17 |     test(`${id} mounts as a real game`, async ({ page }) => {
  18 |       await page.goto(`/cartilla/juego/${id}`);
  19 |       await expect(page.getByText("Juego no encontrado.")).toHaveCount(0);
> 20 |       await expect(page.getByRole("main")).toBeVisible();
     |                                            ^ Error: expect(locator).toBeVisible() failed
  21 |       await expect(page.getByLabel("Instrucciones del juego")).toBeVisible();
  22 |     });
  23 |   }
  24 | 
  25 |   test("mariposas completes a source-backed word", async ({ page }) => {
  26 |     await page.goto("/cartilla/juego/mariposas-p");
  27 |     await page.getByRole("button", { name: "pa", exact: true }).click();
  28 |     await page.getByRole("button", { name: "pi", exact: true }).click();
  29 |     await expect(page.getByText("¡Palabra completa!")).toBeVisible();
  30 |   });
  31 | 
  32 |   test("vowel identification marks a correct answer", async ({ page }) => {
  33 |     await page.goto("/cartilla/juego/vocal-a");
  34 |     await page.getByRole("button", { name: "Sí", exact: true }).first().click();
  35 |     await expect(page.locator("div.border-emerald-400").first()).toBeVisible();
  36 |   });
  37 | 
  38 |   test("phonics completion accepts the missing syllable", async ({ page }) => {
  39 |     await page.goto("/cartilla/juego/fonetica-p");
  40 |     await page.getByRole("button", { name: "pa", exact: true }).click();
  41 |     await expect(page.getByText("¡Correcto!")).toBeVisible();
  42 |   });
  43 | 
  44 |   test("rhyme game accepts the matching ending", async ({ page }) => {
  45 |     await page.goto("/cartilla/juego/rima-p");
  46 |     await page.getByRole("button", { name: "Pepi", exact: true }).click();
  47 |     await expect(page.getByText("¡Riman!")).toBeVisible();
  48 |   });
  49 | 
  50 |   test("one-minute reading timer starts", async ({ page }) => {
  51 |     await page.goto("/cartilla/juego/palabras-minuto-p");
  52 |     await page.getByRole("button", { name: "Empezar 1 minuto" }).click();
  53 |     await expect(page.getByText(/59s|60s/)).toBeVisible();
  54 |   });
  55 | 
  56 |   test("picture matching accepts the correct verified crop", async ({ page }) => {
  57 |     await page.goto("/cartilla/juego/dibujos-o");
  58 |     await page.getByRole("button", { name: "Dibujo de oso" }).click();
  59 |     await expect(page.getByText("¡Ese es el dibujo!")).toBeVisible();
  60 |   });
  61 | });
  62 | 
```