import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('docs/proofs/review');
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });

  const viewports = [
    { name: 'desktop', width: 1366, height: 768, isMobile: false, scale: 1 },
    { name: 'mobile', width: 390, height: 844, isMobile: true, scale: 2 }
  ];

  for (const vp of viewports) {
    console.log(`Testing ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.scale,
      isMobile: vp.isMobile
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.SpeechRecognition = undefined;
      window.webkitSpeechRecognition = undefined;
    });

    // 1. Lecciones
    console.log(`Navigating to /cartilla/lecciones (${vp.name})...`);
    await page.goto('http://127.0.0.1:3000/cartilla/lecciones', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    const leccionesFile = path.join(outDir, `lecciones-${vp.name}.png`);
    await page.screenshot({ path: leccionesFile, fullPage: false });
    console.log(`Saved ${leccionesFile}`);

    // 2. Teacher
    console.log(`Navigating to /cartilla/teacher (${vp.name})...`);
    await page.goto('http://127.0.0.1:3000/cartilla/teacher', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    const teacherFile = path.join(outDir, `teacher-${vp.name}.png`);
    await page.screenshot({ path: teacherFile, fullPage: false });
    console.log(`Saved ${teacherFile}`);

    // 3. Art Board Review (Desktop only)
    if (vp.name === 'desktop') {
      console.log('Navigating to /art-board/review.html (desktop)...');
      await page.goto('http://127.0.0.1:3000/art-board/review.html', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      const reviewFile = path.join(outDir, 'art-board-review-desktop.png');
      await page.screenshot({ path: reviewFile, fullPage: false });
      console.log(`Saved ${reviewFile}`);
    }

    await context.close();
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch(err => {
  console.error('Snapshot failed:', err);
  process.exit(1);
});
