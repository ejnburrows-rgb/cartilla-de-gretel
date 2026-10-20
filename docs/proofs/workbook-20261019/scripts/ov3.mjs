import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const [lesson, idx, P] of [[9,0,27],[8,0,23],[8,1,24],[8,2,25],[8,3,26],[11,0,35]]) {
  await page.goto('http://localhost:5173/cartilla', { waitUntil: 'domcontentloaded' });
  await page.evaluate(([l,i,p]) => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:'+l, JSON.stringify({lesson:l, page:i, printedPage:p})); }, [lesson, idx, P]);
  await page.goto('http://localhost:5173/cartilla/leccion/'+lesson, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const r = await page.evaluate(() => {
    const el = document.scrollingElement;
    let cut = null;
    const last = document.querySelector('.faithful-page');
    if (last) { const b = last.getBoundingClientRect(); cut = Math.round(b.bottom); }
    return {sh: el.scrollHeight, vh: window.innerHeight, pageBottom: cut};
  });
  console.log(`L${lesson} p${P}: scrollH=${r.sh} vp=${r.vh} pageBottom=${r.pageBottom}`);
}
await browser.close();
