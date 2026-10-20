// Lane B proof screenshots via the REAL lesson route (/cartilla/leccion/N).
// Page navigation is gated behind activity completion, so each printed page is
// opened directly by seeding the learner-resume bookmark (test-only).
import { chromium } from 'playwright';
import fs from 'fs';

const outDir = process.argv[2];
const vpArg = process.argv[3];
const lessonPages = { 8: [23,24,25,26], 9: [27,28,29,30], 10: [31,32,33,34], 11: [35,36,37,38], 12: [39,40,41,42], 13: [43,44,45,46], 14: [47,48,49,50], 15: [51,52,53,54], 17: [59,60,61,62], 18: [63,64,65,66] };
const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'tablet-1280x800', width: 1280, height: 800 },
  { name: 'phone-portrait-390x844', width: 390, height: 844 },
  { name: 'phone-landscape-844x390', width: 844, height: 390 },
].filter(v => !vpArg || v.name === vpArg);
const base = 'http://localhost:5173';

const browser = await chromium.launch();
const problems = [];
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(base + '/cartilla/lecciones', { waitUntil: 'domcontentloaded' }).catch(() => {});
  for (const [n, pages] of Object.entries(lessonPages)) {
    for (const [i, p] of pages.entries()) {
      try {
        await page.evaluate(([nn, ii, pp]) => {
          localStorage.clear();
          localStorage.setItem(`cartilla.learner-resume.v1:${nn}`, JSON.stringify({ lesson: nn, page: ii, printedPage: pp }));
          localStorage.setItem('cartilla.learner-resume.v1', JSON.stringify({ lesson: nn, page: ii, printedPage: pp }));
        }, [Number(n), i, p]);
        await page.goto(`${base}/cartilla/leccion/${n}`, { waitUntil: 'networkidle' });
        await page.waitForSelector('.faithful-page', { timeout: 25000 });
        await page.waitForTimeout(900);
        const file = `${outDir}/${vp.name}/lesson-${n}-page-${p}.png`;
        fs.mkdirSync(`${outDir}/${vp.name}`, { recursive: true });
        await page.screenshot({ path: file });
        const m = await page.evaluate(() => ({
          sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
          shown: document.querySelector('.faithful-page__pagenum')?.textContent?.trim() ?? '',
        }));
        if (m.sw > m.cw + 1) problems.push(`${vp.name} L${n} p${p}: horizontal overflow sw=${m.sw} cw=${m.cw}`);
        if (!m.shown.includes(String(p))) problems.push(`${vp.name} L${n} p${p}: page diamond shows "${m.shown}"`);
      } catch (e) {
        problems.push(`${vp.name} L${n} p${p}: ERROR ${String(e).split('\n')[0]}`);
      }
    }
  }
  await page.close();
}
await browser.close();
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(`${outDir}/_problems.txt`, problems.join('\n') || 'none');
console.log(problems.length ? problems.join('\n') : 'OK');
