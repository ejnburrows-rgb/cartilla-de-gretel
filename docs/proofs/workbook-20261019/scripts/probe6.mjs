import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173/cartilla', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:8', JSON.stringify({lesson:8, page:0, printedPage:23})); });
await page.goto('http://localhost:5173/cartilla/leccion/8', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const r = await page.evaluate(() => {
  const sw = document.querySelector('[data-gretel-activity="page-23-p23-write-l"] .am-dibuja__swatches');
  const hits = [];
  const walk = (rules, href) => { for (const rule of rules) {
    if (rule.cssRules) { walk(rule.cssRules, href); continue; }
    if (!rule.selectorText) continue;
    let m = false; try { m = sw.matches(rule.selectorText); } catch(e) {}
    if (m && /max-width|width|flex/.test(rule.style.cssText)) hits.push({sel: rule.selectorText.slice(0,140), style: rule.style.cssText.slice(0,200)});
  } };
  for (const ss of document.styleSheets) { try { walk(ss.cssRules, ss.href); } catch(e) {} }
  return { hits, mw: getComputedStyle(sw).maxWidth };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
