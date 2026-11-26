const fs = require('node:fs');
const { chromium } = require('@playwright/test');
const { performance } = require('node:perf_hooks');
const destination = 'docs/proofs/m7-m8-m9-verification/continuation/runner-repair/no-app-readiness.json';
const result = { startedUtc: new Date().toISOString(), pid: process.pid, mode: 'default Chromium, zero Vite servers, unchanged timeouts', stages: [] };
const save = () => fs.writeFileSync(destination, JSON.stringify(result, null, 2));
(async () => {
  let browser;
  save();
  try {
    let start = performance.now();
    browser = await chromium.launch({ args: ['--no-sandbox'] });
    result.stages.push({ name: 'launch', ms: performance.now() - start }); save();
    start = performance.now();
    const page = await browser.newPage();
    result.stages.push({ name: 'newPage', ms: performance.now() - start }); save();
    start = performance.now();
    await page.setContent('<h1>Browser fixture probe</h1>');
    result.text = await page.locator('h1').textContent();
    result.stages.push({ name: 'setContent/textContent', ms: performance.now() - start });
    result.pass = result.text === 'Browser fixture probe';
  } catch (error) { result.pass = false; result.error = String(error); }
  finally {
    if (browser) await browser.close().catch(error => { result.closeError = String(error); });
    result.finishedUtc = new Date().toISOString(); save();
    console.log(JSON.stringify(result));
  }
  process.exitCode = result.pass ? 0 : 1;
})();
