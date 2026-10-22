const { chromium } = require('playwright');

async function runTest(viewport, label) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  let audioPlays = 0;
  page.on('console', msg => {
    if (msg.text().includes('Audio played')) audioPlays++;
  });

  await page.addInitScript(() => {
    window.HTMLAudioElement.prototype.play = async function() {
      console.log('Audio played: ' + this.src);
    };
  });

  // The route is /cartilla/juego/:gameId
  await page.goto('http://localhost:5173/cartilla/juego/cow-game-m', { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: `docs/proofs/cow-game-2026-10-22/${label}_start.png` });

  await page.locator('button[aria-label="Escuchar la instrucción"]').click({ timeout: 5000 }).catch(e => console.error("Could not click instruction", e.message));
  await page.waitForTimeout(500);

  const cowLocator = page.locator('button[aria-label="Vaca mu"]');
  await cowLocator.waitFor({ state: 'visible', timeout: 5000 }).catch(e => console.error(e));
  await cowLocator.click();

  await page.waitForTimeout(200);
  const slotLocator = page.locator('button[aria-label="Casilla mu"]');
  await slotLocator.waitFor({ state: 'visible', timeout: 5000 }).catch(e => console.error(e));
  await slotLocator.click();

  for (let i = 1; i <= 6; i++) {
    await page.waitForTimeout(250);
    await page.screenshot({ path: `docs/proofs/cow-game-2026-10-22/${label}_motion_frame_${i}.png` });
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: `docs/proofs/cow-game-2026-10-22/${label}_mid_play.png` });

  const remaining = [
    { cow: 'mo', slot: 'mo' },
    { cow: 'me', slot: 'me' },
    { cow: 'ma', slot: 'ma' },
    { cow: 'mi', slot: 'mi' }
  ];

  for (const pair of remaining) {
    await page.locator(`button[aria-label="Vaca ${pair.cow}"]`).click();
    await page.waitForTimeout(200);
    await page.locator(`button[aria-label="Casilla ${pair.slot}"]`).click();
    await page.waitForTimeout(3200);
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: `docs/proofs/cow-game-2026-10-22/${label}_completion.png` });

  console.log(`${label} Test finished. Audio played: ${audioPlays} times.`);
  await browser.close();
}

(async () => {
  try {
    await runTest({ width: 390, height: 844 }, 'phone');
    await runTest({ width: 1280, height: 800 }, 'laptop');
  } catch(e) {
    console.error('Error during proof generation:', e);
  }
})();
