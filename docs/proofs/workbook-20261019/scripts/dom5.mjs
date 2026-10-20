import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173/cartilla/lecciones', { waitUntil: 'domcontentloaded' }).catch(() => {});
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:8', JSON.stringify({ lesson: 8, page: 0, printedPage: 23 })); });
await page.goto('http://localhost:5173/cartilla/leccion/8', { waitUntil: 'networkidle' });
await page.waitForSelector('.faithful-page', { timeout: 25000 });
const info = await page.evaluate(() => {
  const tb = document.querySelector('.fp-writing-line--freehand .am-dibuja__toolbar') || document.querySelector('.am-dibuja__toolbar');
  const chain = [];
  let el = tb;
  for (let i = 0; i < 7 && el; i++) { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); chain.push({ cls: String(el.className).slice(0, 60), w: Math.round(r.width), disp: cs.display, dir: cs.flexDirection }); el = el.parentElement; }
  return chain;
});
console.log(JSON.stringify(info, null, 1));
await b.close();
