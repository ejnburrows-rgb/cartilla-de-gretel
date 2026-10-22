const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1238, height: 928 } });
  await page.goto('http://localhost:5173/cartilla/juegos/cow-game-m');
  await page.waitForTimeout(3000);

  const content = await page.content();
  const index = content.indexOf('cg-root');
  console.log("cg-root present?", index !== -1);
  if (index !== -1) {
    console.log(content.substring(index, index + 200));
  } else {
    console.log("Something else rendered. Title:", await page.title());
    console.log("Body:", await page.innerHTML('body'));
  }

  await browser.close();
})();
