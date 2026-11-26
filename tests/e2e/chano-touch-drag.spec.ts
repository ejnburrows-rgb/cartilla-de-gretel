import { expect, test } from "@playwright/test";

// Regression: after a touch drag onto the board the next tap on a ball was swallowed,
// because a touch drag ends without the click that cleared the "skip click" flag.
test("Chano: touch drag a ball, then the next tap still places a ball", async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  await page.goto("/cartilla/juego/payaso-chano-ss");
  await expect(page.locator(".chano-slot")).toHaveCount(2);
  const centre = async (loc: ReturnType<typeof page.locator>) => {
    const r = (await loc.boundingBox())!;
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  };
  const from = await centre(page.getByRole("button", { name: "mi", exact: true }));
  const to = await centre(page.locator(".chano-slot").first());
  const cdp = await ctx.newCDPSession(page);
  const pt = (x: number, y: number) => [{ x, y, id: 1, radiusX: 4, radiusY: 4, force: 1 }];
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: pt(from.x, from.y),
  });
  for (let i = 1; i <= 10; i++)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: pt(from.x + ((to.x - from.x) * i) / 10, from.y + ((to.y - from.y) * i) / 10),
    });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.locator(".chano-slot").first()).toHaveAttribute("aria-label", /Casilla 1: mi/);

  await page.getByRole("button", { name: "ma", exact: true }).tap();
  await expect(page.locator(".chano-slot").nth(1)).toHaveAttribute("aria-label", /Casilla 2: ma/);
  await page.getByRole("button", { name: "Comprobar" }).tap();
  await expect(page.locator(".chano-board-hint")).toHaveText("¡Muy bien!");
  await ctx.close();
});
