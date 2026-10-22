const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1238, height: 928 } });
  await page.goto('http://localhost:5173/cartilla/juegos/cow-game-m');
  await page.waitForTimeout(3000);

  const html = await page.content();
  console.log("HTML length:", html.length);
  const buttons = await page.locator('button').allInnerTexts();
  console.log("Buttons:", buttons);

  await browser.close();
})();
