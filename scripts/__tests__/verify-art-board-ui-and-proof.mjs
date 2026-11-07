import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { createArtReviewServer } from '../art-board-review-server.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');
const PROOFS_DIR = path.join(ROOT, 'docs/proofs');

if (!fs.existsSync(PROOFS_DIR)) {
  fs.mkdirSync(PROOFS_DIR, { recursive: true });
}

async function run() {
  console.log('--- IN-PROCESS ART BOARD & SYNC E2E VISUAL VERIFICATION ---');

  // 1. Start review server in-process on dynamic port
  console.log('1. Starting art-board-review-server in-process...');
  const server = createArtReviewServer({ rootDir: ROOT });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Art review server listening at ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });

  try {
    // 2. Desktop Viewport 1366x768
    console.log('2. Loading art board on Desktop (1366x768)...');
    const desktopPage = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    
    await desktopPage.goto(`${baseUrl}/art-board/verified-optimized.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    // Wait for card container to render
    await desktopPage.waitForSelector('.item-card', { timeout: 10000 });

    const pageTitle = await desktopPage.title();
    console.log('Page Title:', pageTitle);

    // Verify GitHub & NBO Hub Sync button is present
    const syncBtn = await desktopPage.$('#btn-sync-nbo');
    if (!syncBtn) {
      throw new Error('Sync button #btn-sync-nbo not found on page!');
    }
    const syncBtnText = await desktopPage.$eval('#btn-sync-nbo', el => el.textContent.trim());
    console.log('Sync Button Text:', syncBtnText);

    // Check card for DRAW-WB-03-1 (Abrigo)
    const abrigoCard = await desktopPage.$('#card-DRAW-WB-03-1');
    if (!abrigoCard) {
      throw new Error('Card for DRAW-WB-03-1 not found!');
    }
    console.log('Found card for DRAW-WB-03-1 (Abrigo)');

    // Scroll card into view
    await abrigoCard.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(600);

    // Verify Dropzone is present in this card
    const dropzone = await abrigoCard.$('.upload-dropzone-box');
    if (!dropzone) {
      throw new Error('Dropzone not found in DRAW-WB-03-1 card!');
    }
    const dropzoneText = await abrigoCard.$eval('.upload-dropzone-box', el => el.textContent.trim());
    console.log('Dropzone visible in card:', dropzoneText.includes('Arrastra aquí tu PNG'));

    // Check if Emilio's custom candidate exists with badge
    const priorBadge = await abrigoCard.$('.rec-tag.emilio');
    if (priorBadge) {
      const badgeText = await priorBadge.textContent();
      console.log('Pre-existing Emilio badge text:', badgeText.trim());
    }

    // Now test client-side file upload handling via input
    console.log('Testing client-side drag-and-drop upload simulation...');
    
    // Create a 200x200 sample PNG buffer to upload
    const samplePng = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 50, g: 120, b: 240, alpha: 0.9 }
      }
    }).png().toBuffer();

    const tempUploadPath = path.join(ROOT, 'scratch/test-ui-upload.png');
    if (!fs.existsSync(path.dirname(tempUploadPath))) {
      fs.mkdirSync(path.dirname(tempUploadPath), { recursive: true });
    }
    fs.writeFileSync(tempUploadPath, samplePng);

    // Trigger file picker for DRAW-WB-03-1
    await desktopPage.evaluate(() => {
      window.setSingleUploadGroupId('DRAW-WB-03-1');
    });
    await desktopPage.setInputFiles('#file-picker', tempUploadPath);
    await desktopPage.waitForTimeout(2000);

    // Verify that [🌟 SUBIDA POR EMILIO] appears and is selected
    const updatedCustomBadge = await desktopPage.$eval('#card-DRAW-WB-03-1 .rec-tag.emilio', el => el.textContent.trim()).catch(() => null);
    console.log('After upload, custom badge in card:', updatedCustomBadge);
    if (!updatedCustomBadge || !updatedCustomBadge.includes('SUBIDA POR EMILIO')) {
      throw new Error('Expected custom badge [🌟 SUBIDA POR EMILIO] was not found after upload!');
    }

    const isSelected = await desktopPage.$eval('#card-DRAW-WB-03-1 .opt-card.selected', el => Boolean(el)).catch(() => false);
    console.log('Option is auto-selected:', isSelected);
    if (!isSelected) {
      throw new Error('Uploaded candidate was expected to be auto-selected!');
    }

    const desktopProof = path.join(PROOFS_DIR, 'art-board-upload-feature-desktop.png');
    await desktopPage.screenshot({ path: desktopProof, fullPage: false });
    console.log('Saved desktop proof screenshot to:', desktopProof);
    await desktopPage.close();

    // 3. Mobile Viewport 390x844
    console.log('3. Loading art board on Mobile (390x844)...');
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await mobilePage.goto(`${baseUrl}/art-board/verified-optimized.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    await mobilePage.waitForSelector('.item-card', { timeout: 10000 });

    const mobileCard = await mobilePage.$('#card-DRAW-WB-03-1');
    if (mobileCard) {
      await mobileCard.scrollIntoViewIfNeeded();
      await mobilePage.waitForTimeout(500);
    }

    const mobileProof = path.join(PROOFS_DIR, 'art-board-upload-feature-mobile.png');
    await mobilePage.screenshot({ path: mobileProof, fullPage: false });
    console.log('Saved mobile proof screenshot to:', mobileProof);
    await mobilePage.close();

    // 4. Standalone Offline File (file:// URL)
    console.log('4. Loading TABLERO_DE_ARTE_INTERACTIVO_OFFLINE.html via file:// ...');
    const offlinePage = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    const offlinePath = path.join(ROOT, 'TABLERO_DE_ARTE_INTERACTIVO_OFFLINE.html');
    await offlinePage.goto(`file://${offlinePath}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await offlinePage.waitForSelector('.item-card', { timeout: 10000 });

    const offlineTitle = await offlinePage.title();
    console.log('Offline Page Title:', offlineTitle);
    const offlineCardCount = await offlinePage.$$eval('.item-card', els => els.length);
    console.log('Offline cards count:', offlineCardCount);

    const offlineProof = path.join(PROOFS_DIR, 'art-board-offline-standalone.png');
    await offlinePage.screenshot({ path: offlineProof, fullPage: false });
    console.log('Saved offline standalone proof screenshot to:', offlineProof);
    await offlinePage.close();

    // Cleanup
    if (fs.existsSync(tempUploadPath)) fs.unlinkSync(tempUploadPath);
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
    console.log('=== ALL BROWSER & UI VERIFICATIONS PASSED ===');
    process.exit(0);

  } catch (err) {
    console.error('Test execution error:', err);
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
