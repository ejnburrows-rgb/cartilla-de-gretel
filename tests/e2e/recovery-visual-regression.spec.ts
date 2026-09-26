import { test, expect } from '@playwright/test';

const LESSONS = [1, 2, 7, 8, 9, 13, 17, 18, 19, 20, 21, 22, 23, 24] as const;
const SIZES = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

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
      expect(shot).toMatchSnapshot(`presenter-${n}-${viewport.name}.jpg`, { maxDiffPixelRatio: 0.025 });
    }
  });
}
