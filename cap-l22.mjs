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
      await page.screenshot({ path: `/home/hatch/workspace/your_files/lesson-22-audit-p${p}-${w}x${h}.png` });
      console.log(`captured p${p} ${w}x${h}`);
      if (i < pages.length - 1) {
        const candidates = [
          page.locator('button:has-text(">")'),
          page.getByRole('button', { name: 'Siguiente' }),
        ];
        let clicked = false;
        for (const c of candidates) {
          try {
            const n = await c.count();
            if (n > 0) { await c.last().click({ timeout: 4000 }); clicked = true; break; }
          } catch (e) { /* try next */ }
        }
        if (!clicked) console.log(`NO next button found on p${p} ${w}x${h}`);
        await page.waitForTimeout(2500);
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log('done');
})();
