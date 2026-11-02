import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir = 'docs/proofs/corrective-action-2026-11-02';
fs.mkdirSync(outDir, { recursive: true });

const brainDirs = [
  'C:/Users/EJN/.gemini/antigravity/brain/80b9a867-0920-4826-8a58-d7027557dadf',
  'C:/Users/EJN/.gemini/antigravity/brain/a3125d81-518a-480c-a909-020d39ba3bff'
];

for (const dir of brainDirs) {
  if (fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const routes = [
  { name: 'leccion_1', path: '/cartilla/leccion/1' },
  { name: 'leccion_3', path: '/cartilla/leccion/3' },
  { name: 'teacher_flipchart', path: '/cartilla/teacher/flipchart' },
  { name: 'presentar_7', path: '/cartilla/presentar/7' }
];

const viewports = [
  { name: 'desktop', width: 1366, height: 768, isMobile: false, deviceScaleFactor: 1 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }
];

const baseURL = 'http://127.0.0.1:4173';

async function run() {
  console.log('Launching Chromium for corrective action visual verification...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });

  const report = {
    timestamp: new Date().toISOString(),
    baseURL,
    routes: []
  };

  try {
    for (const vp of viewports) {
      console.log(`\n================ Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ================`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        deviceScaleFactor: vp.deviceScaleFactor
      });

      const page = await context.newPage();
      await page.addInitScript(() => {
        window.SpeechRecognition = undefined;
        window.webkitSpeechRecognition = undefined;
      });

      for (const r of routes) {
        console.log(`\nNavigating to ${r.path} [${vp.name}]...`);
        const targetUrl = `${baseURL}${r.path}`;
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1500);

        // Verification evaluations
        const evalData = await page.evaluate(() => {
          const docEl = document.documentElement;
          const bodyEl = document.body;
          const docStyle = window.getComputedStyle(docEl);
          const bodyStyle = window.getComputedStyle(bodyEl);

          // Cursor verification
          const htmlClasses = docEl.className;
          const bodyClasses = bodyEl.className;
          const rootCursor = docStyle.cursor;
          const bodyCursor = bodyStyle.cursor;

          // Check if any element has custom SVG/pencil cursor
          const allElements = Array.from(document.querySelectorAll('*'));
          const pencilCursorElements = allElements.filter(el => {
            const c = window.getComputedStyle(el).cursor;
            return c.includes('data:image/svg') || c.includes('pencil') || c.includes('.svg') || c.includes('.png');
          }).map(el => ({ tag: el.tagName, class: el.className, cursor: window.getComputedStyle(el).cursor }));

          // Demo control center evaluation
          const demoControl = document.querySelector('[data-testid="demo-control-center"]') || 
                              document.querySelector('.lc-demo-control-center') ||
                              document.querySelector('aside[aria-label="Controles del demostrador"]');
          let demoControlMetrics = null;
          if (demoControl) {
            const rect = demoControl.getBoundingClientRect();
            const cs = window.getComputedStyle(demoControl);
            demoControlMetrics = {
              found: true,
              position: cs.position,
              top: rect.top,
              right: rect.right,
              width: rect.width,
              height: rect.height,
              isFloating: cs.position === 'fixed' || cs.position === 'absolute' || cs.position === 'sticky'
            };
          }

          // Artwork & Images evaluation
          const images = Array.from(document.querySelectorAll('img')).map(img => {
            const rect = img.getBoundingClientRect();
            const cs = window.getComputedStyle(img);
            return {
              src: img.currentSrc || img.src,
              alt: img.alt,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              renderedWidth: Math.round(rect.width),
              renderedHeight: Math.round(rect.height),
              objectFit: cs.objectFit,
              isBroken: img.naturalWidth === 0 && img.complete
            };
          });

          // Stage / Container / Flipchart evaluation
          const flipchartStage = document.querySelector('[data-testid="flipchart-stage"]') ||
                                 document.querySelector('.flipchart-hd-panel') ||
                                 document.querySelector('.flipchart-stage') ||
                                 document.querySelector('.presentation-shell') ||
                                 document.querySelector('.fc-replica-sheet');
          let flipchartMetrics = null;
          if (flipchartStage) {
            const rect = flipchartStage.getBoundingClientRect();
            flipchartMetrics = {
              selector: flipchartStage.className,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              viewportHeightRatio: (rect.height / window.innerHeight).toFixed(3),
              viewportWidthRatio: (rect.width / window.innerWidth).toFixed(3)
            };
          }

          // Main workbook container
          const workbookPage = document.querySelector('.cartilla-page') ||
                               document.querySelector('.faithful-page') ||
                               document.querySelector('.leccion-fit') ||
                               document.querySelector('article') ||
                               document.querySelector('main');
          let workbookMetrics = null;
          if (workbookPage) {
            const rect = workbookPage.getBoundingClientRect();
            workbookMetrics = {
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              top: Math.round(rect.top),
              left: Math.round(rect.left)
            };
          }

          return {
            title: document.title,
            htmlClasses,
            bodyClasses,
            rootCursor,
            bodyCursor,
            pencilCursorElements,
            demoControlMetrics,
            imageCount: images.length,
            brokenImages: images.filter(i => i.isBroken).length,
            imagesSample: images.slice(0, 8),
            flipchartMetrics,
            workbookMetrics,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            }
          };
        });

        // Screenshot filename
        const filename = `${vp.name}_${r.name}.png`;
        const screenshotPath = path.join(outDir, filename);

        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`Saved screenshot: ${screenshotPath}`);

        // Copy to brain dirs
        for (const bDir of brainDirs) {
          if (fs.existsSync(bDir)) {
            fs.copyFileSync(screenshotPath, path.join(bDir, filename));
          }
        }

        report.routes.push({
          route: r.path,
          name: r.name,
          viewport: vp.name,
          screenshot: filename,
          metrics: evalData
        });
      }

      await context.close();
    }

    const reportPath = path.join(outDir, 'verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    for (const bDir of brainDirs) {
      if (fs.existsSync(bDir)) {
        fs.copyFileSync(reportPath, path.join(bDir, 'verification-report.json'));
      }
    }
    console.log(`\nVerification report saved to: ${reportPath}`);

  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Visual verification failed:', err);
  process.exit(1);
});
