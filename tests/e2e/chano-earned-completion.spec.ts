import { expect, test } from "@playwright/test";
const words = [
  ["mi", "ma"],
  ["ma", "ma"],
  ["me", "me"],
  ["mu", "mi"],
  ["ma", "mi"],
];
for (const size of [
  { name: "phone", width: 390, height: 844, touch: true },
  { name: "landscape", width: 844, height: 390, touch: true },
  { name: "desktop", width: 1366, height: 768, touch: false },
  { name: "projector", width: 1920, height: 1080, touch: false },
]) {
  test(`Chano earned completion and replay: ${size.name} (simulated)`, async ({
    browser,
  }, testInfo) => {
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      hasTouch: size.touch,
      isMobile: size.touch,
      recordVideo: {
        dir: testInfo.outputPath("video"),
        size: { width: size.width, height: size.height },
      },
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    const press = async (name: string) => {
      const button = page.getByRole("button", { name, exact: true });
      if (size.touch) await button.tap();
      else await button.click();
    };
    const solve = async (i: number) => {
      for (const syllable of words[i]) await press(syllable);
      await press("Comprobar");
      await expect(page.getByRole("status")).toHaveText("¡Muy bien!");
    };
    await page.goto("/cartilla/juego/payaso-chano-ss");
    await expect(page.locator(".chano-slot")).toHaveCount(2);
    for (let i = 0; i < words.length; i++) await press("Siguiente");
    await expect(page.locator(".chano-board-count")).toHaveText("Palabra 1 de 5");
    await page.screenshot({ path: testInfo.outputPath("skipped-not-completed.png") });
    // Wrong answer, explicit reset and correct retry through real controls.
    await press("ma");
    await press("mi");
    await press("Comprobar");
    await expect(page.getByRole("status")).toHaveText("Intenta otra vez.");
    await press("Borrar");
    for (let i = 0; i < words.length; i++) {
      await solve(i);
      await press("Siguiente");
    }
    await expect(page.locator(".chano-board-count")).toHaveText("¡Terminaste!");
    await expect(page.getByRole("status")).toContainText("5 de 5 aciertos");
    await page.screenshot({ path: testInfo.outputPath("earned-completion.png") });
    await press("Siguiente");
    for (let i = 0; i < words.length; i++) await press("Siguiente");
    await expect(page.locator(".chano-board-count")).toHaveText("Palabra 1 de 5");
    await expect(page.getByRole("status")).not.toContainText("5 de 5");
    expect(errors).toEqual([]);
    await context.close();
  });
}
