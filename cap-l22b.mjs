import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--disable-gpu'] });
  const sizes = [[390,844],[844,390],[1366,900]];
  const pages = [79, 80, 81, 82];
  for (const [w, h] of sizes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5191/cartilla/leccion/22', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      await page.waitForTimeout(1500);
      const cur = await page.locator('[data-native-page]').first().getAttribute('data-native-page').catch(() => '?');
      await page.screenshot({ path: `/home/hatch/workspace/your_files/lesson-22-audit-p${p}-${w}x${h}.png` });
      console.log(`captured label-p${p} (actual page ${cur}) ${w}x${h}`);
      if (i < pages.length - 1) {
        try {
          await page.locator('button.native-corner-hotspot--next').first().click({ timeout: 5000 });
        } catch (e) { console.log(`click failed on label-p${p}: ${String(e).slice(0,80)}`); }
        await page.waitForTimeout(2500);
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log('done');
})();
