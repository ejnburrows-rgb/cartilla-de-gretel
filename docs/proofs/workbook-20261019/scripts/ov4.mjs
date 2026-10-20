import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173/cartilla', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:8', JSON.stringify({lesson:8, page:0, printedPage:23})); });
await page.goto('http://localhost:5173/cartilla/leccion/8', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
const rows = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('.faithful-page .gretel-activity').forEach(a => {
    const r = a.getBoundingClientRect();
    const paper = a.querySelector('.am-dibuja__paper');
    const tb = a.querySelector('.am-dibuja__toolbar');
    out.push({id: a.dataset.gretelActivity, h: Math.round(r.height), top: Math.round(r.top),
      paper: paper ? Math.round(paper.getBoundingClientRect().height) : null,
      tb: tb ? Math.round(tb.getBoundingClientRect().height) : null});
  });
  const instr = document.querySelector('.fp-region--instruction');
  if (instr) out.push({id:'INSTR', h: Math.round(instr.getBoundingClientRect().height), top: Math.round(instr.getBoundingClientRect().top)});
  return out;
});
console.log(JSON.stringify(rows, null, 0));
await browser.close();
