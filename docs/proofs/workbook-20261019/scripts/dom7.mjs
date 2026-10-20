import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173/cartilla/lecciones', { waitUntil: 'domcontentloaded' }).catch(() => {});
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:8', JSON.stringify({ lesson: 8, page: 0, printedPage: 23 })); });
await page.goto('http://localhost:5173/cartilla/leccion/8', { waitUntil: 'networkidle' });
await page.waitForSelector('.faithful-page', { timeout: 25000 });
const info = await page.evaluate(() => {
  const sel = '.lc-lesson-shell--fit[data-lesson="8"] .faithful-page:has(.gretel-activity[data-gretel-activity^="page-23-"]) .gretel-activity[data-gretel-activity*="-write-"]';
  const m = document.querySelectorAll(sel);
  const act = document.querySelector('.gretel-activity[data-gretel-activity="page-23-p23-write-U"]');
  const shell = document.querySelector('.lc-lesson-shell--fit');
  return { matched: m.length, shellLesson: shell?.getAttribute('data-lesson'), actW: act ? Math.round(act.getBoundingClientRect().width) : null, actParent: act?.parentElement?.className, gridChildren: [...document.querySelector('.faithful-page__body').children].map(c => c.className.slice(0, 40) + ':' + Math.round(c.getBoundingClientRect().width)) };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
