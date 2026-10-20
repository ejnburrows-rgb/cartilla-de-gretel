import { chromium } from 'playwright';
const lp = { 8: [23,24,25,26], 10: [31,32,33,34], 11: [35,36,37,38], 12: [39,40,41,42], 14: [47,48,49,50] };
const vps = [[1440,900,'desktop'],[390,844,'portrait']];
const b = await chromium.launch();
for (const [w,h,tag] of vps) {
  const page = await b.newPage({ viewport: { width: w, height: h } });
  await page.goto('http://localhost:5173/cartilla/lecciones', { waitUntil: 'domcontentloaded' }).catch(() => {});
  for (const [n, pages] of Object.entries(lp)) {
    for (const [i, p] of pages.entries()) {
      await page.evaluate(([nn,ii,pp]) => { localStorage.clear(); localStorage.setItem(`cartilla.learner-resume.v1:${nn}`, JSON.stringify({ lesson: nn, page: ii, printedPage: pp })); }, [Number(n), i, p]);
      await page.goto(`http://localhost:5173/cartilla/leccion/${n}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.faithful-page', { timeout: 25000 });
      await page.waitForTimeout(800);
      const d = await page.evaluate(() => document.querySelector('.faithful-page__pagenum')?.textContent?.trim());
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      await page.screenshot({ path: `/tmp/scout/L${n}-p${p}-${tag}.png` });
      console.log(`L${n} p${p} ${tag} diamond=${d} overflowX=${overflow}`);
    }
  }
  await page.close();
}
await b.close();
