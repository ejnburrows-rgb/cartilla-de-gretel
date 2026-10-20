import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173/cartilla', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:8', JSON.stringify({lesson:8, page:0, printedPage:23})); });
await page.goto('http://localhost:5173/cartilla/leccion/8', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const r = await page.evaluate(() => {
  const sw = document.querySelector('[data-gretel-activity="page-23-p23-write-l"] .am-dibuja__swatches');
  const sel = '.lc-lesson-shell--fit[data-lesson="8"] .faithful-page:has(.gretel-activity[data-gretel-activity^="page-23-"]) .am-dibuja__toolbar .am-dibuja__swatches';
  let matchedRules = [];
  for (const ss of document.styleSheets) {
    try { const walk = (rules) => { for (const rule of rules) {
      if (rule.cssRules) walk(rule.cssRules);
      else if (rule.selectorText && rule.selectorText.includes('swatches') && sw.matches(rule.selectorText)) matchedRules.push(rule.cssText.slice(0,160));
    } }; walk(ss.cssRules); } catch(e) {}
  }
  const cs = getComputedStyle(sw);
  // climb parents
  let chain = [], n = sw;
  for (let i=0; i<6 && n; i++) { chain.push(n.className + ' w=' + Math.round(n.getBoundingClientRect().width)); n = n.parentElement; }
  return { matches: sw.matches(sel), flexShrink: cs.flexShrink, w: cs.width, matchedRules, chain };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
