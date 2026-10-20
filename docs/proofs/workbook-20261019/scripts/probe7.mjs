import { chromium } from 'playwright';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.goto('http://localhost:5173/cartilla', { waitUntil: 'domcontentloaded' });
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('cartilla.learner-resume.v1:8', JSON.stringify({lesson:8, page:0, printedPage:23})); });
await page.goto('http://localhost:5173/cartilla/leccion/8', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const cdp = await page.context().newCDPSession(page);
await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
const doc = await cdp.send('DOM.getDocument');
const node = await cdp.send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '[data-gretel-activity="page-23-p23-write-l"] .am-dibuja__swatches' });
const m = await cdp.send('CSS.getMatchedStylesForNode', { nodeId: node.nodeId });
const out = [];
for (const e of (m.matchedCSSRules || [])) {
  const sel = e.rule.selectorList.text;
  const props = e.rule.style.cssProperties.filter(p => !p.disabled && ['width','max-width','min-width','flex','flex-basis','flex-shrink','flex-grow','display','flex-wrap'].includes(p.name)).map(p => `${p.name}:${p.value}${p.implicit?'(implicit)':''}`);
  if (props.length) out.push({origin: e.rule.origin, sel: sel.slice(0,120), props});
}
console.log(JSON.stringify(out, null, 1));
console.log('computed:', JSON.stringify((m.computedStyle||[]).filter(p=>['width','max-width','min-width','flex-basis','flex-shrink','display','zoom'].includes(p.name))));
await b.close();
