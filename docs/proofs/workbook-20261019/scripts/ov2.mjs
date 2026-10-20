import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const [lesson, idx, P] of [[8,0,23],[11,0,35],[12,0,39],[13,0,43],[15,0,51],[17,0,59]]) {
  await page.goto('http://localhost:5173/cartilla', { waitUntil: 'domcontentloaded' });
  await page.evaluate(([l,i,p]) => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:'+l, JSON.stringify({lesson:l, page:i, printedPage:p})); }, [lesson, idx, P]);
  await page.goto('http://localhost:5173/cartilla/leccion/'+lesson, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const r = await page.evaluate(() => ({sx: document.documentElement.scrollWidth > 390, sy: document.documentElement.scrollHeight > 844}));
  console.log(`L${lesson} p${P}: overflowX=${r.sx} overflowY=${r.sy}`);
}
await browser.close();
