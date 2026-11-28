import { expect, test } from "@playwright/test";

// Regression: the walking cow used to be painted under every resting cow, so it
// disappeared while its syllable card moved to the fence.
for (const vp of [
  { name: "desktop", width: 1366, height: 768 },
  { name: "phone", width: 390, height: 844 },
]) {
  test(`moving cow stays visible with its card (${vp.name})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/cartilla/juego/cow-game-m");
    const cow = page.getByRole("button", { name: "Vaca mu" });
    await cow.click();
    await page.getByRole("button", { name: "Casilla mu" }).click();
    // Mid-walk and at the fence, the topmost element at the cow's head is that cow.
    for (const wait of [800, 1000]) {
      await page.waitForTimeout(wait);
      const onTop = await page.evaluate(() => {
        const el = [...document.querySelectorAll<HTMLElement>(".cg-cow")].find(
          (c) => c.getAttribute("aria-label") === "Vaca mu",
        )!;
        const head = el.querySelector(".cg-head")!.getBoundingClientRect();
        const hit = document.elementFromPoint(head.x + head.width * 0.4, head.y + head.height * 0.4);
        const others = [...document.querySelectorAll<HTMLElement>(".cg-cow")].filter((c) => c !== el);
        return {
          ownsPoint: !!hit && el.contains(hit),
          aboveResting: others.every((o) => Number(el.style.zIndex) > Number(o.style.zIndex)),
        };
      });
      expect(onTop.aboveResting).toBe(true);
      expect(onTop.ownsPoint).toBe(true);
    }
    await expect(page.getByRole("status")).toHaveText("¡Muy bien!", { timeout: 6000 });
  });
}
