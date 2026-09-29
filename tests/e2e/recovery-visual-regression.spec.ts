import { test, expect, type Page } from '@playwright/test';
import sharp from 'sharp';

const LESSONS = [1, 2, 8, 9, 13, 17, 18, 19, 20, 21, 22, 23, 24] as const;
const SIZES = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

async function dismissIntro(page: Page) {
  const start = page.getByRole('button', { name: 'Comenzar' });
  if (await start.isVisible().catch(() => false)) await start.click();
}

async function expectNonBlank(shot: Buffer, label: string) {
  const stats = await sharp(shot).stats();
  expect(
    stats.channels.slice(0, 3).some(channel => channel.stdev >= 4),
    `${label} unexpectedly has near-uniform pixels`,
  ).toBe(true);
}

async function expectNativeReaderGeometry(
  page: Page,
  viewport: typeof SIZES[number],
  lesson: number,
) {
  const geometry = await page.evaluate(() => {
    const rect = (selector: string) => {
      const node = document.querySelector<HTMLElement>(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        right: box.right,
        bottom: box.bottom,
      };
    };
    return {
      reader: rect('.native-lesson-viewer'),
      content: rect('.native-lesson-viewer__content'),
      navigation: rect('.native-lesson-viewer__navigation'),
    };
  });

  expect(geometry.reader, `native reader missing lesson ${lesson}`).not.toBeNull();
  expect(geometry.content, `native content missing lesson ${lesson}`).not.toBeNull();
  expect(geometry.navigation, `native navigation missing lesson ${lesson}`).not.toBeNull();

  const reader = geometry.reader!;
  const content = geometry.content!;
  const navigation = geometry.navigation!;

  expect(reader.width, `reader too narrow lesson ${lesson}`).toBeGreaterThanOrEqual(
    Math.min(300, viewport.width - 24),
  );
  expect(content.height, `content too short lesson ${lesson}`).toBeGreaterThan(220);
  expect(content.x, `content clipped left lesson ${lesson}`).toBeGreaterThanOrEqual(reader.x - 2);
  expect(content.right, `content clipped right lesson ${lesson}`).toBeLessThanOrEqual(reader.right + 2);
  expect(navigation.y, `navigation overlaps content lesson ${lesson}`).toBeGreaterThanOrEqual(content.bottom - 2);
}

for (const viewport of SIZES) {
  test(`native lesson reference layouts ${viewport.name}`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);

    const broken: string[] = [];
    page.on('response', response => {
      if (response.status() >= 400 && /\.(webp|png|jpe?g|svg)(\?|$)/i.test(response.url())) {
        broken.push(`${response.status()} ${response.url()}`);
      }
    });

    for (const n of LESSONS) {
      await page.goto(`/cartilla/leccion/${n}`, { waitUntil: 'domcontentloaded' });
      await dismissIntro(page);

      const reader = page.locator('.native-lesson-viewer');
      const stage = reader.locator('.native-lesson-viewer__content');
      await expect(reader).toBeVisible();
      await expect(stage).toBeVisible();
      await expect(page.getByTestId('physical-book-reader')).toHaveCount(0);

      const guide = page.getByTestId('gretel-presence');
      await expect(guide).toHaveAttribute('data-page-ready', 'true');
      await page.evaluate(() => document.fonts.ready);
      await expectNativeReaderGeometry(page, viewport, n);

      const layout = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        viewport: innerWidth,
        zero: [...document.querySelectorAll<HTMLElement>('button, [role="button"]')].filter(el => {
          if (!el.getClientRects().length || el.closest('[aria-hidden="true"]')) return false;
          const r = el.getBoundingClientRect();
          return r.width < 1 || r.height < 1;
        }).length,
      }));
      expect(layout.width, `horizontal overflow lesson ${n}`).toBeLessThanOrEqual(layout.viewport + 2);
      expect(layout.zero, `zero-size interactive target lesson ${n}`).toBe(0);

      const images = await stage.locator('img:visible').evaluateAll(nodes =>
        nodes.map(node => {
          const img = node as HTMLImageElement;
          return {
            src: img.currentSrc || img.src,
            loaded: img.complete && img.naturalWidth > 0 && img.naturalHeight > 0,
          };
        }),
      );
      expect(images.filter(image => !image.loaded), `missing art lesson ${n}`).toEqual([]);

      const svgRig = page.locator('svg[data-gretel-rig="svg"]').first();
      await expect(svgRig).toBeVisible();

      const shot = await stage.screenshot({
        type: 'jpeg',
        quality: 65,
        animations: 'disabled',
      });
      await expectNonBlank(shot, `lesson ${n} ${viewport.name}`);
    }

    expect(broken, `broken image URL during ${viewport.name} lesson sweep`).toEqual([]);
  });

  test(`teacher presenter references ${viewport.name}`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);

    for (const n of [7, 18, 24]) {
      await page.goto(`/cartilla/presentar/${n}`, { waitUntil: 'domcontentloaded' });
      await dismissIntro(page);

      const panel = page.getByTestId('flipchart-hd-panel');
      await expect(panel).toBeVisible();
      await expect(panel).toHaveAttribute('data-presenter-mode', 'native');
      await expect(panel.locator('[data-native-flipchart="true"]')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);

      const pageImages = await panel.locator('img:visible').evaluateAll(nodes =>
        nodes.map(node => {
          const img = node as HTMLImageElement;
          return {
            src: img.currentSrc || img.src,
            loaded: img.complete && img.naturalWidth > 0,
          };
        }),
      );
      expect(pageImages.filter(image => !image.loaded), `presenter missing image ${n}`).toEqual([]);
      expect(
        pageImages.some(image => image.src.includes('/hd/flipchart/') || image.src.includes('/delivery/flipchart/')),
        `source-page image leaked into presenter ${n}`,
      ).toBe(false);

      const shot = await panel.screenshot({
        type: 'jpeg',
        quality: 65,
        animations: 'disabled',
      });
      await expectNonBlank(shot, `presenter ${n} ${viewport.name}`);
    }
  });
}
