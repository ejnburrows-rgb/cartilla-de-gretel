import { chromium } from 'playwright';
const [n, i, p, w, h, out] = process.argv.slice(2);
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: Number(w), height: Number(h) } });
await page.goto('http://localhost:5173/cartilla/lecciones', { waitUntil: 'domcontentloaded' }).catch(() => {});
await page.evaluate(([nn, ii, pp]) => {
  localStorage.clear();
  localStorage.setItem(`cartilla.learner-resume.v1:${nn}`, JSON.stringify({ lesson: nn, page: ii, printedPage: pp }));
}, [Number(n), Number(i), Number(p)]);
await page.goto(`http://localhost:5173/cartilla/leccion/${n}`, { waitUntil: 'networkidle' });
await page.waitForSelector('.faithful-page', { timeout: 25000 });
await page.waitForTimeout(900);
console.log(await page.evaluate(() => document.querySelector('.faithful-page__pagenum')?.textContent?.trim()));
await page.screenshot({ path: out });
await b.close();
