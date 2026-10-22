const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1238, height: 928 } });
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', error => console.log('ERROR:', error.message));
  await page.goto('http://localhost:5173/cartilla/juegos/cow-game-m');
  await page.waitForTimeout(10000);
  console.log("Done waiting");
  await browser.close();
})();
