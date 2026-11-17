import { expect, test } from "@playwright/test";
for (const size of [{ width: 390, height: 844 }, { width: 1366, height: 768 }]) {
  test(`cow review links and choices ${size.width}×${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto('/revision');
    const card = page.locator('#cow-game');
    await expect(card.getByRole('link', {name:'Open A — free selection'})).toHaveAttribute('href', '/cartilla/juego/cow-game-m?cow=free');
    await expect(card.getByRole('link', {name:'Open B — guided steps'})).toHaveAttribute('href', '/cartilla/juego/cow-game-m?cow=guided');
    for (const label of ['Approve A', 'Approve B', 'Reject both', 'Request changes']) await expect(card.getByRole('button',{name:label})).toBeVisible();
    await expect(card).toContainText('No decision yet');
    await card.getByRole('link',{name:'Open B — guided steps'}).click();
    await expect(page.locator('.cg-guide')).toHaveText('1. Elige una vaca');
    await page.getByRole('button',{name:'Ajustes'}).click();
    expect(parseFloat(await page.getByRole('button',{name:'Empezar de nuevo'}).evaluate(e=>getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(14);
  });
}
