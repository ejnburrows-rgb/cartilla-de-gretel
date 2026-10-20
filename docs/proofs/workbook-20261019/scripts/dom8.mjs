import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173/cartilla/lecciones', { waitUntil: 'domcontentloaded' }).catch(() => {});
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:8', JSON.stringify({ lesson: 8, page: 0, printedPage: 23 })); });
await page.goto('http://localhost:5173/cartilla/leccion/8', { waitUntil: 'networkidle' });
await page.waitForSelector('.faithful-page', { timeout: 25000 });
const info = await page.evaluate(() => {
  const act = document.querySelector('.gretel-activity[data-gretel-activity="page-23-p23-write-U"]');
  const cs = getComputedStyle(act);
  return { inline: act.getAttribute('style'), width: cs.width, maxW: cs.maxWidth, minW: cs.minWidth, justifySelf: cs.justifySelf, boxSizing: cs.boxSizing };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
