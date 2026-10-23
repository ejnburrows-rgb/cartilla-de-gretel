import { expect, test } from '@playwright/test';

const game = '/cartilla/juego/parejas-palabras-o';
const word = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'Palabra oveja', exact: true });
const picture = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'Dibujo de oveja', exact: true });

test('mouse clicks cannot answer a pencil matching exercise', async ({ page }) => {
  await page.goto(game);
  await word(page).click();
  await picture(page).click();
  await expect(page.locator('.am-direct-pencil__line-group')).toHaveCount(0);
});

test('release outside cancels and hover cannot restart drawing', async ({ page }) => {
  await page.goto(game);
  const box = await word(page).boundingBox();
  if (!box) throw new Error('Word missing');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(2, 2);
  await page.mouse.up();
  await page.mouse.move(box.x + box.width + 20, box.y + box.height / 2);
  await expect(page.locator('.am-direct-pencil__active-line')).toHaveCount(0);
  await expect(page.locator('.am-direct-pencil__line-group')).toHaveCount(0);
});

test('holding and releasing on the matching picture commits exactly once', async ({ page }) => {
  await page.goto(game);
  const a = await word(page).boundingBox();
  const b = await picture(page).boundingBox();
  if (!a || !b) throw new Error('Pair missing');
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 20 });
  await expect(page.locator('.am-direct-pencil__active-line')).toHaveCount(1);
  await expect(page.locator('.am-direct-pencil__line-group')).toHaveCount(0);
  await page.mouse.up();
  await expect(page.locator('.am-direct-pencil__active-line')).toHaveCount(0);
  await expect(page.locator('.am-direct-pencil__line-group')).toHaveCount(1);
});

test('keyboard activation remains available without mouse click fallback', async ({ page }) => {
  await page.goto(game);
  await word(page).focus();
  await page.keyboard.press('Enter');
  await picture(page).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.am-direct-pencil__line-group')).toHaveCount(1);
});

test('window blur clears an unfinished stroke', async ({ page }) => {
  await page.goto(game);
  const a = await word(page).boundingBox();
  if (!a) throw new Error('Word missing');
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('.am-direct-pencil__active-line')).toHaveCount(0);
  await page.mouse.up();
  await expect(page.locator('.am-direct-pencil__line-group')).toHaveCount(0);
});
