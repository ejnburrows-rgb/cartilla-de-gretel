import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const out = process.argv[2] || 'docs/proofs/lane-b-2026-10-20/round-1';
const first = Number(process.argv[3] || 23);
const last = Number(process.argv[4] || 66);
const width = Number(process.env.PROOF_WIDTH || 390);
const height = Number(process.env.PROOF_HEIGHT || 844);
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});
await fs.mkdir(out, { recursive: true });
const results = [];
try {
  for (let number = first; number <= last; number++) {
    const lesson = 8 + Math.floor((number - 23) / 4);
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', hasTouch: width < 600, isMobile: width < 600 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(({ lesson, number }) => {
      localStorage.setItem('reader.theme', JSON.stringify('light'));
      localStorage.setItem(`cartilla.learner-resume.v1:${lesson}`, JSON.stringify({ lesson, page: (number - 23) % 4, printedPage: number }));
    }, { lesson, number });
    const url = `http://127.0.0.1:5173/cartilla/leccion/${lesson}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator(`.native-lesson-viewer[data-native-page="${number}"]`).waitFor({ timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const paper = page.locator('.native-lesson-viewer__content .faithful-page--lane-b').first();
    const stem = `page-${String(number).padStart(3, '0')}-${width}x${height}`;
    await page.screenshot({ path: path.join(out, `${stem}-screen.png`), fullPage: true });
    const paperBounds = await paper.boundingBox();
    await page.screenshot({ path: path.join(out, `${stem}-paper.png`), clip: paperBounds, fullPage: true });
    const metrics = await paper.evaluate(node => {
      const rect = node.getBoundingClientRect();
      const blocks = [...node.querySelectorAll('.gretel-activity')].map(item => {
        const box = item.getBoundingClientRect();
        return { id: item.dataset.gretelActivity, x: box.x - rect.x, y: box.y - rect.y, width: box.width, height: box.height };
      });
      return {
        paper: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        text: node.innerText,
        subjectImages: node.querySelectorAll('img:not(.final-page-background)').length,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        fontFamily: getComputedStyle(node).fontFamily,
        fontLoaded: document.fonts.check('12px "Workbook Gothic"'),
        blocks,
      };
    });
    const result = { page: number, lesson, url, viewport: { width, height }, errors, ...metrics };
    results.push(result);
    console.log(JSON.stringify({ page: number, height: metrics.paper.height, errors, horizontalOverflow: metrics.documentWidth > width + 1 }));
    await context.close();
  }
} finally {
  await fs.writeFile(path.join(out, `capture-${width}x${height}.json`), JSON.stringify(results, null, 2));
  await browser.close();
}
