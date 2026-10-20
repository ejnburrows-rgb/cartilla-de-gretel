import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173/cartilla', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:8', JSON.stringify({lesson:8, page:0, printedPage:23})); });
await page.goto('http://localhost:5173/cartilla/leccion/8', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const r = await page.evaluate(() => {
  let found = [];
  for (const ss of document.styleSheets) {
    try { for (const rule of ss.cssRules) {
      const txt = rule.cssText || '';
      if (txt.includes('flex-basis: 100%') && txt.includes('am-dibuja__toolbar')) found.push(txt.slice(0,120));
      if (rule.cssRules) for (const r2 of rule.cssRules) {
        const t2 = r2.cssText || '';
        if (t2.includes('flex-basis: 100%') && t2.includes('am-dibuja__toolbar')) found.push('MEDIA:'+t2.slice(0,120));
      }
    } } catch(e) {}
  }
  const tb = document.querySelector('[data-gretel-activity="page-23-p23-write-l"] .am-dibuja__toolbar');
  const cs = tb ? getComputedStyle(tb) : null;
  const dibuja = document.querySelector('[data-gretel-activity="page-23-p23-write-l"] .am-dibuja');
  return { found, tbW: tb ? Math.round(tb.getBoundingClientRect().width) : null,
    tbCssW: cs?.width, tbBasis: cs?.flexBasis,
    parentDisplay: dibuja ? getComputedStyle(dibuja).display + '/' + getComputedStyle(dibuja).flexDirection : null,
    zoom: tb ? getComputedStyle(tb).zoom : null,
    activityZoom: getComputedStyle(document.querySelector('[data-gretel-activity="page-23-p23-write-l"]')).zoom };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
