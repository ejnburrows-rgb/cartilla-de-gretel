import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/cartilla/lecciones', { waitUntil: 'domcontentloaded' }).catch(() => {});
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:9', JSON.stringify({ lesson: 9, page: 0, printedPage: 27 })); });
await page.goto('http://localhost:5173/cartilla/leccion/9', { waitUntil: 'networkidle' });
await page.waitForSelector('.faithful-page', { timeout: 25000 });
const info = await page.evaluate(() => {
  const tb = document.querySelector('.am-dibuja__toolbar');
  const cs = getComputedStyle(tb);
  const r = tb.getBoundingClientRect();
  const done = tb.querySelector('.am-dibuja__done');
  const dcs = getComputedStyle(done);
  const dr = done.getBoundingClientRect();
  const sheet = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules].map(r => r.cssText) } catch { return [] } }).filter(t => t.includes('am-dibuja__toolbar') && t.includes('padding-right'));
  return { tbPaddingRight: cs.paddingRight, tbDisplay: cs.display, tbJustify: cs.justifyContent, tbRect: { x: Math.round(r.x), right: Math.round(r.right) }, donePos: dcs.position, doneMarginLeft: dcs.marginLeft, doneRect: { x: Math.round(dr.x), right: Math.round(dr.right) }, matched: sheet };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
