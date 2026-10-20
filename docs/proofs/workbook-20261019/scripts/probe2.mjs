import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173/cartilla', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:8', JSON.stringify({lesson:8, page:0, printedPage:23})); });
await page.goto('http://localhost:5173/cartilla/leccion/8', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const r = await page.evaluate(() => {
  const act = '[data-gretel-activity="page-23-p23-write-l"] ';
  const el = s => document.querySelector(act + s);
  const sw = el('.am-dibuja__swatches');
  const swatch = el('.am-dibuja__swatch');
  const draw = el('.am-dibuja__draw');
  const dibuja = el('.am-dibuja');
  const kids = [...dibuja.children].map(k => ({cls: k.className, w: Math.round(k.getBoundingClientRect().width), h: Math.round(k.getBoundingClientRect().height)}));
  return {
    swW: sw ? getComputedStyle(sw).width : null, swRect: sw ? Math.round(sw.getBoundingClientRect().width) : null,
    swatchW: swatch ? getComputedStyle(swatch).width : null,
    swatchRect: swatch ? Math.round(swatch.getBoundingClientRect().width) : null,
    drawW: draw ? getComputedStyle(draw).width : null,
    dibujaKids: kids,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
