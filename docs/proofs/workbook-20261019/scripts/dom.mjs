import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/cartilla/lecciones', { waitUntil: 'domcontentloaded' }).catch(() => {});
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:9', JSON.stringify({ lesson: 9, page: 0, printedPage: 27 })); });
await page.goto('http://localhost:5173/cartilla/leccion/9', { waitUntil: 'networkidle' });
await page.waitForSelector('.faithful-page', { timeout: 25000 });
const info = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')].filter(b => /listo/i.test(b.textContent || ''));
  return btns.map(b => {
    const chain = [];
    let el = b;
    for (let i = 0; i < 5 && el; i++) { chain.push(el.className); el = el.parentElement; }
    const r = b.getBoundingClientRect();
    return { chain, rect: { x: Math.round(r.x), right: Math.round(r.right), w: Math.round(r.width) } };
  });
});
console.log(JSON.stringify(info, null, 1));
await b.close();
