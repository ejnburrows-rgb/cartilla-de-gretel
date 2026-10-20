import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173/cartilla', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:8', JSON.stringify({lesson:8, page:0, printedPage:23})); });
await page.goto('http://localhost:5173/cartilla/leccion/8', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const r = await page.evaluate(() => {
  const tb = document.querySelector('[data-gretel-activity="page-23-p23-write-l"] .am-dibuja__toolbar');
  const cs = getComputedStyle(tb);
  const kids = [...tb.children].map(k => ({cls: k.className, base: getComputedStyle(k).flexBasis, grow: getComputedStyle(k).flexGrow, shrink: getComputedStyle(k).flexShrink, w: getComputedStyle(k).width, order: getComputedStyle(k).order}));
  return { dir: cs.flexDirection, wrap: cs.flexWrap, html: tb.outerHTML.slice(0, 900), kids };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
