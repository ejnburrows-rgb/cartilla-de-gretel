# Test info

- Name: Lesson 9 native pages and syllable grading at 1280px
- Location: /workspace/tests/e2e/native-lesson-nine.spec.ts:4:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveAttribute(expected)

Locator: locator('.native-lesson-viewer')
Expected string: "27"
Received: <element(s) not found>
Call log:
  - expect.toHaveAttribute with timeout 5000ms
  - waiting for locator('.native-lesson-viewer')

    at /workspace/tests/e2e/native-lesson-nine.spec.ts:12:26
```

# Page snapshot

```yaml
- link "Saltar al contenido principal":
  - /url: "#main-content"
- banner:
  - link "Índice":
    - /url: /cartilla/lecciones
  - text: 0:00 L9/24
- main:
  - text: Lección 9 · páginas 27-30
  - region "Página de aprendizaje":
    - text: Lección 9 · Ss Página 27 · 1 de 4
    - progressbar "Progreso de páginas"
    - paragraph:
      - text: Traza con tu mejor letra.
      - 'button "Escuchar instrucciones: Traza con tu mejor letra."'
    - img "Toca los puntos en orden para formar la letra S":
      - button "Punto 2"
      - button "Punto 3"
      - button "Punto 4"
      - button "Punto 5"
      - button "Punto 6"
      - button "Punto 7"
      - button "Punto 8"
      - button "Punto 9"
      - button "Punto 1, toca aquí": "1"
    - text: Toca los puntos en orden
    - img "Toca los puntos en orden para formar la letra S":
      - button "Punto 2"
      - button "Punto 3"
      - button "Punto 4"
      - button "Punto 5"
      - button "Punto 6"
      - button "Punto 7"
      - button "Punto 8"
      - button "Punto 9"
      - button "Punto 1, toca aquí": "1"
    - text: Toca los puntos en orden
    - img "Toca los puntos en orden para formar la letra s":
      - button "Punto 2"
      - button "Punto 3"
      - button "Punto 4"
      - button "Punto 5"
      - button "Punto 6"
      - button "Punto 7"
      - button "Punto 8"
      - button "Punto 9"
      - button "Punto 1, toca aquí": "1"
    - text: Toca los puntos en orden
    - img "Toca los puntos en orden para formar la letra s":
      - button "Punto 2"
      - button "Punto 3"
      - button "Punto 4"
      - button "Punto 5"
      - button "Punto 6"
      - button "Punto 7"
      - button "Punto 8"
      - button "Punto 9"
      - button "Punto 1, toca aquí": "1"
    - text: Toca los puntos en orden
    - paragraph:
      - text: Haz un dibujo que represente una palabra que comienza con s.
      - 'button "Escuchar instrucciones: Haz un dibujo que represente una palabra que comienza con s."'
    - text: Dibuja
    - 'button "Color #1f2937"'
    - 'button "Color #E85D4C"'
    - 'button "Color #457B9D"'
    - 'button "Color #2A9D8F"'
    - 'button "Color #E9C46A"'
    - 'button "Color #9B5DE5"'
    - button "Borrador"
    - button "Deshacer"
    - button "Limpiar"
    - button "Listo" [disabled]
    - navigation "Navegación de páginas":
      - button "Anterior" [disabled]
      - text: 1 / 4
      - button "Siguiente"
    - complementary "Gretel, la guía de la cartilla":
      - button "Interactuar con Gretel":
        - img "Gretel"
```

# Test source

```ts
   1 | import { expect, test } from "@playwright/test";
   2 |
   3 | for (const width of [1280, 820, 390]) {
   4 |   test(`Lesson 9 native pages and syllable grading at ${width}px`, async ({ page }) => {
   5 |     await page.setViewportSize({ width, height: 900 });
   6 |     await page.addInitScript(() => {
   7 |       localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify([1,2,3,4,5,6,7,8]));
   8 |     });
   9 |     await page.goto("/cartilla/leccion/9", { waitUntil: "domcontentloaded" });
  10 |
  11 |     const lesson = page.locator(".native-lesson-viewer");
> 12 |     await expect(lesson).toHaveAttribute("data-native-page", "27");
     |                          ^ Error: Timed out 5000ms waiting for expect(locator).toHaveAttribute(expected)
  13 |     await expect(lesson).toContainText("Lección 9 · Ss");
  14 |     await expect(lesson).toContainText("Traza con tu mejor letra.");
  15 |     expect(await lesson.locator("img[src*='/art/source/workbook/']").count()).toBe(0);
  16 |
  17 |     const next = lesson.getByRole("button", { name: "Siguiente" });
  18 |     await next.click();
  19 |     await expect(lesson).toHaveAttribute("data-native-page", "28");
  20 |
  21 |     const sa = lesson.locator(".native-syllable").first();
  22 |     const distractor = sa.getByRole("button", { name: "semana" });
  23 |     await distractor.click();
  24 |     await expect(distractor).toHaveAttribute("aria-pressed", "false");
  25 |     await expect(sa.getByRole("status")).toContainText("0 de 3");
  26 |
  27 |     const correct = sa.getByRole("button", { name: "sala" });
  28 |     await correct.click();
  29 |     await expect(correct).toHaveAttribute("aria-pressed", "true");
  30 |     await expect(sa.getByRole("status")).toContainText("1 de 3");
  31 |
  32 |     await next.click();
  33 |     await expect(lesson).toHaveAttribute("data-native-page", "29");
  34 |     await expect(lesson).toContainText("Completa las palabras con la sílaba correcta.");
  35 |     await expect(lesson.locator(".fp-ix-fill__item")).toHaveCount(4);
  36 |
  37 |     await next.click();
  38 |     await expect(lesson).toHaveAttribute("data-native-page", "30");
  39 |     await expect(lesson).toContainText("sa se si so su");
  40 |     await expect(lesson).toContainText("Pepe puso un sapo en la mesa.");
  41 |     await expect(lesson).toContainText("Susi suma sopa.");
  42 |     await expect(lesson.getByRole("button", { name: "Terminar lección" })).toBeVisible();
  43 |
  44 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  45 |   });
  46 | }
  47 |
```