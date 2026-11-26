# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: all-games.spec.ts >> all themed games >> mariposas completes a source-backed word
- Location: tests\e2e\all-games.spec.ts:25:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'pa', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Saltar al contenido principal" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e5]:
    - generic [ref=e7]:
      - img "Jardín con flores, cartel de palabras, sol y regadera" [ref=e8]
      - 'button "Sol: escuchar de nuevo la palabra" [ref=e9] [cursor=pointer]'
      - 'button "Regadera: próxima palabra" [ref=e10] [cursor=pointer]'
    - generic [ref=e12]:
      - generic [ref=e13]:
        - 'button "Florecita 1: colocar aquí la próxima sílaba" [ref=e14] [cursor=pointer]':
          - generic [aria-hidden] [ref=e15]: ✿
        - 'button "Florecita 2: colocar aquí la próxima sílaba" [ref=e16] [cursor=pointer]':
          - generic [aria-hidden] [ref=e17]: ✿
        - 'button "Florecita 3: colocar aquí la próxima sílaba" [ref=e18] [cursor=pointer]':
          - generic [aria-hidden] [ref=e19]: ✿
      - generic [ref=e20]:
        - link "Volver a práctica" [ref=e21] [cursor=pointer]:
          - /url: /cartilla/practica
        - generic [ref=e24]: mapa
        - 'button "Mariposa: comprobar la palabra" [ref=e25] [cursor=pointer]'
        - 'button "Red: las mariposas regresan al jardín" [ref=e26] [cursor=pointer]'
        - button "Instrucciones" [ref=e31] [cursor=pointer]: "?"
    - generic:
      - button "Mariposa ma" [ref=e32] [cursor=pointer]
      - button "Mariposa mo" [ref=e35] [cursor=pointer]
      - button "Mariposa mi" [ref=e38] [cursor=pointer]
      - button "Mariposa Mu" [ref=e41] [cursor=pointer]
      - button "Mariposa pa" [ref=e44] [cursor=pointer]
      - button "Mariposa po" [ref=e47] [cursor=pointer]
      - button "Mariposa me" [ref=e50] [cursor=pointer]
      - button "Mariposa Pe" [ref=e53] [cursor=pointer]
      - button "Mariposa pi" [ref=e56] [cursor=pointer]
      - button "Mariposa Pu" [ref=e59] [cursor=pointer]
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
  20 |       await expect(page.getByRole("main")).toBeVisible();
  21 |       await expect(page.getByLabel("Instrucciones del juego")).toBeVisible();
  22 |     });
  23 |   }
  24 | 
  25 |   test("mariposas completes a source-backed word", async ({ page }) => {
  26 |     await page.goto("/cartilla/juego/mariposas-p");
> 27 |     await page.getByRole("button", { name: "pa", exact: true }).click();
     |                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
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