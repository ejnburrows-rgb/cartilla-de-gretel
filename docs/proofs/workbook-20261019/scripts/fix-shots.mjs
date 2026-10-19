import { chromium } from 'playwright';
const pages = [[9,0,27],[13,0,43],[15,0,51],[17,0,59],[18,0,63]];
const vps = [[1440,900,'desktop'],[844,390,'landscape'],[390,844,'portrait']];
const b = await chromium.launch();
for (const [w,h,tag] of vps) {
  const page = await b.newPage({ viewport: { width: w, height: h } });
  await page.goto('http://localhost:5173/cartilla/lecciones', { waitUntil: 'domcontentloaded' }).catch(() => {});
  for (const [n,i,p] of pages) {
    await page.evaluate(([nn,ii,pp]) => { localStorage.clear(); localStorage.setItem(`cartilla.learner-resume.v1:${nn}`, JSON.stringify({ lesson: nn, page: ii, printedPage: pp })); }, [n,i,p]);
    await page.goto(`http://localhost:5173/cartilla/leccion/${n}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.faithful-page', { timeout: 25000 });
    await page.waitForTimeout(900);
    const diamond = await page.evaluate(() => document.querySelector('.faithful-page__pagenum')?.textContent?.trim());
    await page.screenshot({ path: `/tmp/fix/L${n}-p${p}-${tag}.png` });
    console.log(`L${n} p${p} ${tag} diamond=${diamond}`);
  }
  await page.close();
}
await b.close();
