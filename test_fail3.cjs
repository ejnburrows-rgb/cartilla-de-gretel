const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1238, height: 928 } });
  await page.goto('http://localhost:5173/cartilla/juegos/cow-game-m');
  await page.waitForTimeout(3000);

  const locators = await page.getByRole('button').all();
  console.log("Button locators count:", locators.length);
  for (let i = 0; i < locators.length; i++) {
     console.log("Button", i, await locators[i].getAttribute('aria-label'));
  }

  await browser.close();
})();
