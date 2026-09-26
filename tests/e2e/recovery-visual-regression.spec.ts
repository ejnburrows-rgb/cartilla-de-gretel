import { test, expect } from '@playwright/test';
import sharp from 'sharp';

const LESSONS = [1, 2, 7, 8, 9, 13, 17, 18, 19, 20, 21, 22, 23, 24] as const;
const SIZES = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

async function expectNonBlank(shot: Buffer, label: string) {
  const stats = await sharp(shot).stats();
  expect(
    stats.channels.slice(0, 3).some(channel => channel.stdev >= 4),
    `${label} unexpectedly has near-uniform pixels`,
  ).toBe(true);
}

async function expectReaderGeometry(page: import('@playwright/test').Page, viewport: typeof SIZES[number], lesson: number) {
  const geometry = await page.evaluate(() => {
    const rect = (selector: string) => {
      const node = document.querySelector<HTMLElement>(selector);
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right, bottom: box.bottom };
    };
    return {
      reader: rect('[data-testid="physical-book-reader"]'),
      shell: rect('.premium-book-shell'),
      stage: rect('[data-testid="physical-book-stage"]'),
      pageflip: rect('.premium-pageflip'),
      controls: rect('.book-reader-controls'),
    };
  });
  expect(geometry.reader, `reader missing lesson ${lesson}`).not.toBeNull();
  expect(geometry.shell, `book shell missing lesson ${lesson}`).not.toBeNull();
  expect(geometry.stage, `book stage missing lesson ${lesson}`).not.toBeNull();
  expect(geometry.pageflip, `page-flip surface missing lesson ${lesson}`).not.toBeNull();
  expect(geometry.controls, `reader controls missing lesson ${lesson}`).not.toBeNull();
  const stage = geometry.stage!;
  const shell = geometry.shell!;
  const pageflip = geometry.pageflip!;
  const controls = geometry.controls!;
  expect(stage.width, `stage too narrow lesson ${lesson}`).toBeGreaterThanOrEqual(Math.min(300, viewport.width - 40));
  expect(stage.height, `stage too short lesson ${lesson}`).toBeGreaterThan(300);
  expect(stage.x, `stage clipped left lesson ${lesson}`).toBeGreaterThanOrEqual(shell.x - 2);
  expect(stage.right, `stage clipped right lesson ${lesson}`).toBeLessThanOrEqual(shell.right + 2);
  expect(pageflip.width, `page-flip width mismatch lesson ${lesson}`).toBeGreaterThanOrEqual(stage.width - 2);
  expect(pageflip.height, `page-flip height mismatch lesson ${lesson}`).toBeGreaterThanOrEqual(stage.height - 2);
  expect(controls.y, `reader controls overlap lesson ${lesson}`).toBeGreaterThanOrEqual(stage.bottom);
}

for (const viewport of SIZES) {
  test(`authored lesson reference layouts ${viewport.name}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    const broken: string[] = [];
    page.on('response', response => {
      if (response.status() >= 400 && /\.(webp|png|jpe?g|svg)(\?|$)/i.test(response.url())) broken.push(`${response.status()} ${response.url()}`);
    });
    for (const n of LESSONS) {
      await page.goto(`/cartilla/leccion/${n}`, { waitUntil: 'domcontentloaded' });
      const stage = page.getByTestId('physical-book-stage');
      await expect(stage).toBeVisible();
      await expect(page.getByTestId('gretel-presence')).toHaveAttribute('data-page-ready', 'true');
      await page.evaluate(() => document.fonts.ready);
      await expectReaderGeometry(page, viewport, n);
      const layout = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        viewport: innerWidth,
        zero: [...document.querySelectorAll<HTMLElement>('button, [role="button"]')].filter(el => {
          if (!el.getClientRects().length || el.closest('[aria-hidden="true"]')) return false;
          const r = el.getBoundingClientRect(); return r.width < 1 || r.height < 1;
        }).length,
      }));
      expect(layout.width, `horizontal overflow lesson ${n}`).toBeLessThanOrEqual(layout.viewport + 2);
      expect(layout.zero, `zero-size interactive target lesson ${n}`).toBe(0);
      const images = await stage.locator('img:visible').evaluateAll(nodes => nodes.map(node => {
        const img = node as HTMLImageElement;
        return { src: img.currentSrc || img.src, loaded: img.complete && img.naturalWidth > 0 && img.naturalHeight > 0 };
      }));
      expect(images.filter(image => !image.loaded), `missing art lesson ${n}`).toEqual([]);
      expect(broken, `broken image URL lesson ${n}`).toEqual([]);
      // Source illustrations are checked above, then masked so an intentional
      // replacement of original artwork cannot masquerade as a layout change.
      const shot = await stage.screenshot({ type: 'jpeg', quality: 65, animations: 'disabled',
        mask: [stage.locator('img')], maskColor: '#d3d3d3' });
      await expectNonBlank(shot, `lesson ${n} ${viewport.name}`);
      expect(shot).toMatchSnapshot(`lesson-${n}-${viewport.name}.jpg`, { maxDiffPixelRatio: 0.025 });
    }
  });
  test(`teacher presenter references ${viewport.name}`, async ({ page }) => {
    test.setTimeout(45_000);
    await page.setViewportSize(viewport);
    for (const n of [7, 18, 24]) {
      await page.goto(`/cartilla/presentar/${n}`, { waitUntil: 'domcontentloaded' });
      const panel = page.getByTestId('flipchart-hd-panel');
      await expect(panel).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const images = await panel.locator('img:visible').evaluateAll(nodes => nodes.map(node => {
        const img = node as HTMLImageElement; return { src: img.currentSrc || img.src, loaded: img.complete && img.naturalWidth > 0 };
      }));
      expect(images.filter(image => !image.loaded), `presenter missing image ${n}`).toEqual([]);
      const shot = await panel.screenshot({ type: 'jpeg', quality: 65, animations: 'disabled', mask: [panel.locator('img')], maskColor: '#d3d3d3' });
      await expectNonBlank(shot, `presenter ${n} ${viewport.name}`);
      expect(shot).toMatchSnapshot(`presenter-${n}-${viewport.name}.jpg`, { maxDiffPixelRatio: 0.025 });
    }
  });
}
