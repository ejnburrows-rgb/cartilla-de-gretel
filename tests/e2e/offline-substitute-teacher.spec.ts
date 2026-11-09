import { expect, test } from "@playwright/test";

test("the real substitute teacher guides and resumes a source-faithful lesson", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/cartilla/suplente");
  await expect(page.getByRole("heading", { name: "Maestra suplente" })).toBeVisible();
  const selector = page.getByLabel("Elegir lección para maestra suplente");
  await expect(selector.locator("option")).toHaveCount(24);
  await selector.selectOption("2");
  await expect(page.getByRole("heading", { name: /Lección 2: La vocal O/ })).toBeVisible();

  await selector.selectOption("7");
  await expect(page.getByRole("heading", { name: /Lección 7: La consonante Mm/ })).toBeVisible();
  await page.getByRole("button", { name: "Comenzar preguntas guiadas" }).click();

  await expect(page.getByText("Pregunta 1 de 5")).toBeVisible();
  await page.getByRole("button", { name: "me", exact: true }).click();
  await expect(page.getByText(/1 intentos para repetir/)).toBeVisible();
  await expect(page.getByText("Pregunta 1 de 5")).toBeVisible();
  await page.getByRole("button", { name: "ma", exact: true }).click();
  await expect(page.getByText("Pregunta 2 de 5")).toBeVisible();

  await page.reload();
  await expect(page.getByText("Pregunta 2 de 5")).toBeVisible();
  for (const syllable of ["me", "mi", "mo", "mu"]) {
    await page.getByRole("button", { name: syllable, exact: true }).click();
  }
  await expect(page.getByText("Terminaste las preguntas guiadas.")).toBeVisible();
  await page.getByRole("button", { name: "Revisar si la lección se completó" }).click();
  await expect(page.getByText(/todavía no registra la lección/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir cuaderno real" })).toHaveAttribute("href", "/cartilla/leccion/7");
  expect(pageErrors).toEqual([]);
});

test("the offline guide is readable without horizontal overflow on phone and desktop", async ({ page }) => {
  for (const viewport of [{ width: 320, height: 640 }, { width: 1366, height: 768 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/cartilla/suplente");
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(viewport.width);
    await expect(page.getByRole("button", { name: "Guardar guía sin conexión" })).toBeVisible();
    await expect(page.getByText(/sin sincronización ni envío de informes/)).toBeVisible();
  }
});
