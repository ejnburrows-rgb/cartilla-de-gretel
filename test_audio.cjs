const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1238, height: 928 } });

  let audioPlayed = false;
  page.on('console', msg => {
    console.log(msg.text());
  });

  await page.goto('http://localhost:5173/cartilla/juego/cow-game-m');
  await page.waitForTimeout(3000);

  await page.locator('button[aria-label="Vaca mu"]').click();
  await page.waitForTimeout(500);

  await browser.close();
})();
