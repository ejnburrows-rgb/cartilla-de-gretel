import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173/cartilla/lecciones', { waitUntil: 'domcontentloaded' }).catch(() => {});
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:9', JSON.stringify({ lesson: 9, page: 1, printedPage: 28 })); });
await page.goto('http://localhost:5173/cartilla/leccion/9', { waitUntil: 'networkidle' });
await page.waitForSelector('.faithful-page', { timeout: 25000 });
const info = await page.evaluate(() => {
  const r = document.querySelector('.fp-region--instruction');
  const body = document.querySelector('.faithful-page__body');
  const page = document.querySelector('.faithful-page');
  const rr = r.getBoundingClientRect(), br = body.getBoundingClientRect(), pr = page.getBoundingClientRect();
  const cs = getComputedStyle(r), bcs = getComputedStyle(body);
  return { instrTop: Math.round(rr.top), instrHeight: Math.round(rr.height), instrPos: cs.position, instrMargin: cs.margin, bodyTop: Math.round(br.top), bodyPaddingTop: bcs.paddingTop, bodyJustify: bcs.justifyContent, bodyDisplay: bcs.display, pageTop: Math.round(pr.top), scrollTop: document.scrollingElement.scrollTop };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
