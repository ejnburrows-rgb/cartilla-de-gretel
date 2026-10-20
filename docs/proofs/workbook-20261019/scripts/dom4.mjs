import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173/cartilla/lecciones', { waitUntil: 'domcontentloaded' }).catch(() => {});
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:8', JSON.stringify({ lesson: 8, page: 0, printedPage: 23 })); });
await page.goto('http://localhost:5173/cartilla/leccion/8', { waitUntil: 'networkidle' });
await page.waitForSelector('.faithful-page', { timeout: 25000 });
const info = await page.evaluate(() => {
  const tbs = [...document.querySelectorAll('.am-dibuja__toolbar')];
  return tbs.map(tb => {
    const cs = getComputedStyle(tb);
    const r = tb.getBoundingClientRect();
    const sw = tb.querySelector('.am-dibuja__swatches');
    const scs = sw ? getComputedStyle(sw) : null;
    return { w: Math.round(r.width), h: Math.round(r.height), dir: cs.flexDirection, wrap: cs.flexWrap, swDir: scs?.flexDirection, swWrap: scs?.flexWrap, swW: sw ? Math.round(sw.getBoundingClientRect().width) : null };
  });
});
console.log(JSON.stringify(info, null, 1));
await b.close();
