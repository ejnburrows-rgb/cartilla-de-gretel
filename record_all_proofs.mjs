import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  { name: 'phone-portrait', width: 390, height: 844 },
  { name: 'phone-landscape', width: 844, height: 390 },
  { name: 'desktop', width: 1280, height: 800 }
];

const PROOFS_DIR = path.resolve('docs/proofs/marking-feel');
const VIDEOS_DIR = path.join(PROOFS_DIR, 'videos');
const SCREENSHOTS_DIR = path.join(PROOFS_DIR, 'screenshots');
const TMP_VIDEO_DIR = path.join(PROOFS_DIR, 'tmp_videos');

fs.mkdirSync(VIDEOS_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(TMP_VIDEO_DIR, { recursive: true });

async function recordMarkX(browser, vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    recordVideo: { dir: TMP_VIDEO_DIR, size: { width: vp.width, height: vp.height } }
  });
  const page = await context.newPage();

  console.log(`[mark-x] [${vp.name}] Loading page 4...`);
  await page.goto('http://127.0.0.1:5173/cartilla/cuaderno');
  await page.evaluate(() => localStorage.setItem('cartilla.workbook-reader-page.v1', '4'));
  await page.goto('http://127.0.0.1:5173/cartilla/cuaderno');
  await page.waitForSelector('.fp-ix-cell');
  await page.waitForTimeout(1000);

  const cells = await page.$$('.fp-ix-cell');
  // Wrong pick: Cell 1 (iglú)
  console.log(`[mark-x] [${vp.name}] Clicking wrong cell (iglú)...`);
  await cells[1].scrollIntoViewIfNeeded();
  await cells[1].click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `mark-x_${vp.name}_ash.png`) });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `mark-x_${vp.name}_mid_erase.png`) });
  await page.waitForTimeout(2200); // Erase complete, retry-ready

  // Right pick: Cell 0 (ola)
  console.log(`[mark-x] [${vp.name}] Clicking right cell (ola)...`);
  await cells[0].scrollIntoViewIfNeeded();
  await cells[0].click();
  await page.waitForTimeout(2000); // Green resolve
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `mark-x_${vp.name}_green.png`) });
  await page.waitForTimeout(1200);

  const video = page.video();
  await page.close();
  await context.close();
  if (video) {
    const videoPath = await video.path();
    const dest = path.join(VIDEOS_DIR, `mark-x_${vp.name}.webm`);
    fs.copyFileSync(videoPath, dest);
    try { fs.unlinkSync(videoPath); } catch (e) {}
    console.log(`[mark-x] [${vp.name}] Saved video to ${dest}`);
  }
}

async function recordTapSelect(browser, vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    recordVideo: { dir: TMP_VIDEO_DIR, size: { width: vp.width, height: vp.height } }
  });
  const page = await context.newPage();

  console.log(`[tap-select] [${vp.name}] Loading page 2...`);
  await page.goto('http://127.0.0.1:5173/cartilla/cuaderno');
  await page.evaluate(() => localStorage.setItem('cartilla.workbook-reader-page.v1', '2'));
  await page.goto('http://127.0.0.1:5173/cartilla/cuaderno');
  await page.waitForSelector('.fp-ix-cell');
  await page.waitForTimeout(1000);

  const cells = await page.$$('.fp-ix-cell');
  // Wrong pick: Cell 1 (manzana)
  console.log(`[tap-select] [${vp.name}] Clicking wrong cell (manzana)...`);
  await cells[1].scrollIntoViewIfNeeded();
  await cells[1].click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `tap-select_${vp.name}_ash.png`) });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `tap-select_${vp.name}_mid_erase.png`) });
  await page.waitForTimeout(2200); // Erase complete, retry-ready

  // Right pick: Cell 0 (anillo)
  console.log(`[tap-select] [${vp.name}] Clicking right cell (anillo)...`);
  await cells[0].scrollIntoViewIfNeeded();
  await cells[0].click();
  await page.waitForTimeout(2000); // Green resolve
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `tap-select_${vp.name}_green.png`) });
  await page.waitForTimeout(1200);

  const video = page.video();
  await page.close();
  await context.close();
  if (video) {
    const videoPath = await video.path();
    const dest = path.join(VIDEOS_DIR, `tap-select_${vp.name}.webm`);
    fs.copyFileSync(videoPath, dest);
    try { fs.unlinkSync(videoPath); } catch (e) {}
    console.log(`[tap-select] [${vp.name}] Saved video to ${dest}`);
  }
}

async function recordLineMatch(browser, vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    recordVideo: { dir: TMP_VIDEO_DIR, size: { width: vp.width, height: vp.height } }
  });
  const page = await context.newPage();

  console.log(`[line-match] [${vp.name}] Loading page 3...`);
  await page.goto('http://127.0.0.1:5173/cartilla/cuaderno');
  await page.evaluate(() => localStorage.setItem('cartilla.workbook-reader-page.v1', '3'));
  await page.goto('http://127.0.0.1:5173/cartilla/cuaderno');
  await page.waitForSelector('.am-direct-pencil__left-card');
  await page.waitForTimeout(1000);

  const leftCards = await page.$$('.am-direct-pencil__left-card');
  const targets = await page.$$('.am-direct-pencil__target');

  // Wrong pick: Left 0 ('o') -> Target 1 ('araña')
  console.log(`[line-match] [${vp.name}] Connecting wrong pair (o -> araña)...`);
  await leftCards[0].scrollIntoViewIfNeeded();
  await leftCards[0].click();
  await page.waitForTimeout(200);
  await targets[1].scrollIntoViewIfNeeded();
  await targets[1].click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `line-match_${vp.name}_ash.png`) });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `line-match_${vp.name}_mid_erase.png`) });
  await page.waitForTimeout(2200); // Erase complete, retry-ready

  // Right pick: Left 0 ('o') -> Target 0 ('ocho')
  console.log(`[line-match] [${vp.name}] Connecting right pair (o -> ocho)...`);
  await leftCards[0].scrollIntoViewIfNeeded();
  await leftCards[0].click();
  await page.waitForTimeout(200);
  await targets[0].scrollIntoViewIfNeeded();
  await targets[0].click();
  await page.waitForTimeout(1200); // Snaps and stays green/teal
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `line-match_${vp.name}_green.png`) });
  await page.waitForTimeout(1200);

  const video = page.video();
  await page.close();
  await context.close();
  if (video) {
    const videoPath = await video.path();
    const dest = path.join(VIDEOS_DIR, `line-match_${vp.name}.webm`);
    fs.copyFileSync(videoPath, dest);
    try { fs.unlinkSync(videoPath); } catch (e) {}
    console.log(`[line-match] [${vp.name}] Saved video to ${dest}`);
  }
}

async function recordSyllableCircle(browser, vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    recordVideo: { dir: TMP_VIDEO_DIR, size: { width: vp.width, height: vp.height } }
  });
  const page = await context.newPage();

  console.log(`[syllable-circle] [${vp.name}] Loading page 20...`);
  await page.goto('http://127.0.0.1:5173/cartilla/cuaderno');
  await page.evaluate(() => localStorage.setItem('cartilla.workbook-reader-page.v1', '20'));
  await page.goto('http://127.0.0.1:5173/cartilla/cuaderno');
  await page.waitForSelector('.native-syllable__word');
  await page.waitForTimeout(1000);

  const words = await page.$$('.native-syllable__word');
  const firstWord = words[0]; // 'mami'
  await firstWord.scrollIntoViewIfNeeded();
  const box = await firstWord.boundingBox();

  // Wrong pick: click right half of 'mami' (mi)
  console.log(`[syllable-circle] [${vp.name}] Clicking wrong syllable ('mi' in mami)...`);
  await page.mouse.click(box.x + box.width * 0.85, box.y + box.height / 2);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `syllable-circle_${vp.name}_ash.png`) });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `syllable-circle_${vp.name}_mid_erase.png`) });
  await page.waitForTimeout(2200); // Erase complete, retry-ready

  // Right pick: click left half of 'mami' (ma)
  console.log(`[syllable-circle] [${vp.name}] Clicking right syllable ('ma' in mami)...`);
  await page.mouse.click(box.x + box.width * 0.2, box.y + box.height / 2);
  await page.waitForTimeout(2000); // Green resolve
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `syllable-circle_${vp.name}_green.png`) });
  await page.waitForTimeout(1200);

  const video = page.video();
  await page.close();
  await context.close();
  if (video) {
    const videoPath = await video.path();
    const dest = path.join(VIDEOS_DIR, `syllable-circle_${vp.name}.webm`);
    fs.copyFileSync(videoPath, dest);
    try { fs.unlinkSync(videoPath); } catch (e) {}
    console.log(`[syllable-circle] [${vp.name}] Saved video to ${dest}`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  console.log('Starting full proof recording matrix...');

  for (const vp of VIEWPORTS) {
    console.log(`\n=================== VIEWPORT: ${vp.name} (${vp.width}x${vp.height}) ===================`);
    await recordMarkX(browser, vp);
    await recordTapSelect(browser, vp);
    await recordLineMatch(browser, vp);
    await recordSyllableCircle(browser, vp);
  }

  await browser.close();
  if (fs.existsSync(TMP_VIDEO_DIR)) {
    try { fs.rmdirSync(TMP_VIDEO_DIR, { recursive: true }); } catch (e) {}
  }
  console.log('\nAll 12 videos and 36 screenshots recorded successfully!');
})();
