import { test, expect, type Page, type Locator } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PROOF_DIR = path.resolve('docs/proofs/archetypes-7-8');

const VIEWPORTS = [
  { name: 'laptop', width: 1280, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

async function dismissIntro(page: Page) {
  const start = page.getByRole('button', { name: 'Comenzar', exact: true });
  if (await start.isVisible().catch(() => false)) {
    await start.click();
    await expect(start).toBeHidden();
  }
}

async function expectNonBlank(shot: Buffer, label: string) {
  const stats = await sharp(shot).stats();
  expect(
    stats.channels.slice(0, 3).some(channel => channel.stdev >= 4),
    `${label} unexpectedly has near-uniform pixels`,
  ).toBe(true);
}

async function checkNoBrokenImagesAndNoOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow, `Horizontal overflow detected on ${label}`).toBe(false);

  const images = await page.locator('img:visible').evaluateAll(nodes =>
    nodes.map(node => {
      const img = node as HTMLImageElement;
      return {
        src: img.currentSrc || img.src,
        loaded: img.complete && img.naturalWidth > 0 && img.naturalHeight > 0,
      };
    }),
  );
  const broken = images.filter(image => !image.loaded);
  expect(broken, `Broken images found on ${label}`).toEqual([]);
}

async function stroke(page: Page, canvas: Locator) {
  await canvas.scrollIntoViewIfNeeded().catch(() => {});
  const box = await canvas.boundingBox();
  if (!box) return;
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.3);
  await page.mouse.down();
  for (let i = 1; i <= 20; i++) {
    await page.mouse.move(box.x + box.width * (0.25 + (0.4 * i) / 20), box.y + box.height * (0.3 + (0.3 * i) / 20));
    await page.waitForTimeout(10);
  }
  await page.mouse.up();
}

test.beforeAll(() => {
  fs.mkdirSync(PROOF_DIR, { recursive: true });
});

for (const viewport of VIEWPORTS) {
  test(`Archetype 7: Phonics / Reading Practice — Page 21 (${viewport.name})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/cartilla/pilot-faithful/21', { waitUntil: 'domcontentloaded' });

    const digitalSection = page.locator('[data-qa="digital"]');
    await expect(digitalSection).toBeVisible();

    // 1. Physical-source text verification
    await expect(digitalSection.locator('.fp-native-title, .fp-region--title')).toContainText('Mm');
    await expect(digitalSection.locator('.fp-native-syllables, .fp-region--syllable-bubble').first()).toContainText('ma');
    await expect(digitalSection.locator('.fp-native-vocab, .fp-region--vocab-grid')).toContainText('mamá');
    await expect(digitalSection.locator('.fp-region--reading-sentences')).toContainText('Mi mamá me ama.');

    // 2. Hierarchy and visual fit check
    await checkNoBrokenImagesAndNoOverflow(page, `Archetype 7 Page 21 (${viewport.name})`);

    // Capture proof screenshot of the digital page
    const shot = await digitalSection.screenshot({ type: 'png' });
    await expectNonBlank(shot, `Archetype 7 Page 21 (${viewport.name})`);
    fs.writeFileSync(path.join(PROOF_DIR, `archetype-7-reading-${viewport.name}.png`), shot);
  });

  test(`Archetype 8: Complete-Word + Sentence Writing — Page 22 (${viewport.name})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/cartilla/pilot-faithful/22', { waitUntil: 'domcontentloaded' });

    const digitalSection = page.locator('[data-qa="digital"]');
    await expect(digitalSection).toBeVisible();

    // 1. Physical source instructions verification
    await expect(digitalSection).toContainText('Completa las palabras con la sílaba correcta.');
    await expect(digitalSection).toContainText('Escribe oraciones. Usa las sílabas que aprendiste.');

    // 2. Complete-word interaction (Fill in blank items)
    const fillInBlankItems = digitalSection.locator('.fp-ix-fill__item');
    await expect(fillInBlankItems).toHaveCount(6);

    const items = [
      { word: 'amo', correctChoice: 'mo' },
      { word: 'M', correctChoice: 'mo' },
      { word: 'mamá', correctChoice: 'má' },
      { word: 'mima', correctChoice: 'ma' },
      { word: 'Mumi', correctChoice: 'Mu' },
      { word: 'mío', correctChoice: 'mí' },
    ];

    for (let i = 0; i < items.length; i++) {
      const itemLoc = fillInBlankItems.nth(i);
      await expect(itemLoc.locator('.fp-ix-fill__wordbox')).toContainText(items[i].word);
      const correctChoiceBtn = itemLoc.locator('button', { hasText: items[i].correctChoice });
      await correctChoiceBtn.click();
    }

    // 3. Sentence handwriting & text entry (Writing response)
    const writingArea = digitalSection.locator('.fp-writing-response');
    await expect(writingArea).toBeVisible();

    // Test Teclado mode
    const tecladoBtn = writingArea.getByRole('button', { name: 'Teclado' });
    await tecladoBtn.click();
    const textarea = writingArea.getByRole('textbox', { name: 'Escribe tus oraciones' });
    await textarea.fill('Mi mamá me ama y me mima.');
    await expect(textarea).toHaveValue('Mi mamá me ama y me mima.');

    // Test Mano alzada mode toggle and canvas presence
    const freehandBtn = writingArea.getByRole('button', { name: 'Mano alzada' });
    await freehandBtn.click();
    const canvas = writingArea.locator('canvas');
    await expect(canvas).toBeVisible();

    // Draw a stroke on freehand canvas
    await stroke(page, canvas);

    // Switch back to Teclado mode for clean screenshot proof
    await tecladoBtn.click();

    // Click "Listo" / "Completado" to mark writing task completed
    const markDoneBtn = writingArea.getByRole('button', { name: /Listo|Completado/ });
    if (await markDoneBtn.isVisible()) {
      await markDoneBtn.click();
    }

    // 4. Verify visual integrity and no overflow
    await checkNoBrokenImagesAndNoOverflow(page, `Archetype 8 Page 22 (${viewport.name})`);

    // Capture proof screenshot
    const shot = await digitalSection.screenshot({ type: 'png' });
    await expectNonBlank(shot, `Archetype 8 Page 22 (${viewport.name})`);
    fs.writeFileSync(path.join(PROOF_DIR, `archetype-8-complete-writing-${viewport.name}.png`), shot);
  });
}

test('Archetype 8: Persistence and Save/Reload Verification', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/cartilla/pilot-faithful/22', { waitUntil: 'domcontentloaded' });

  const digitalSection = page.locator('[data-qa="digital"]');
  await expect(digitalSection).toBeVisible();

  // Fill in blanks
  const fillInBlankItems = digitalSection.locator('.fp-ix-fill__item');
  const items = [
    { word: 'amo', correctChoice: 'mo' },
    { word: 'M', correctChoice: 'mo' },
    { word: 'mamá', correctChoice: 'má' },
    { word: 'mima', correctChoice: 'ma' },
    { word: 'Mumi', correctChoice: 'Mu' },
    { word: 'mío', correctChoice: 'mí' },
  ];
  for (let i = 0; i < items.length; i++) {
    await fillInBlankItems.nth(i).locator('button', { hasText: items[i].correctChoice }).click();
  }

  // Type sentence
  const writingArea = digitalSection.locator('.fp-writing-response');
  const textarea = writingArea.getByRole('textbox', { name: 'Escribe tus oraciones' });
  await textarea.fill('Amo a mami y mami me mima.');

  const markDoneBtn = writingArea.getByRole('button', { name: /Listo|Completado/ });
  if (await markDoneBtn.isVisible()) {
    await markDoneBtn.click();
  }

  // Reload page to test persistence
  await page.reload({ waitUntil: 'domcontentloaded' });

  const reloadedDigitalSection = page.locator('[data-qa="digital"]');
  await expect(reloadedDigitalSection).toBeVisible();

  // Verify stored sentence text was restored
  const reloadedTextarea = reloadedDigitalSection.locator('.fp-writing-response').getByRole('textbox', { name: 'Escribe tus oraciones' });
  await expect(reloadedTextarea).toHaveValue('Amo a mami y mami me mima.');

  // Verify completed status was restored
  await expect(reloadedDigitalSection.locator('.fp-writing-response')).toContainText('Completado');

  // Capture reloaded persistence proof screenshot
  const shot = await reloadedDigitalSection.screenshot({ type: 'png' });
  await expectNonBlank(shot, 'Archetype 8 Persistence Reloaded');
  fs.writeFileSync(path.join(PROOF_DIR, 'archetype-8-persistence-reloaded.png'), shot);
});
