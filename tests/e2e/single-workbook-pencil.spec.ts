import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';

const baseline = process.env.PENCIL_BASELINE === '1';
const proofDir = process.env.PENCIL_PROOF_DIR || '/tmp/cartilla-pencil-proof';

test.use({ video: "on" });

async function openWorkbook(page: Page, lesson: number, pageIndex = 0) {
  await page.addInitScript(({ lesson, pageIndex }) => {
    // Pencil-only journeys use the app's genuine microphone-unavailable path.
    Object.defineProperty(window, 'SpeechRecognition', { configurable:true, value:undefined });
    Object.defineProperty(window, 'webkitSpeechRecognition', { configurable:true, value:undefined });
    const resume = JSON.stringify({ lesson, page: pageIndex });
    localStorage.setItem(`cartilla.learner-resume.v1:${lesson}`, resume);
    localStorage.setItem('cartilla.learner-resume.v1', resume);
  }, { lesson, pageIndex });
  page.on('pageerror', error => console.error('Workbook page error:', error.message));
  await page.goto(`/cartilla/leccion/${lesson}`, { waitUntil:'domcontentloaded' });
  await expect(page.locator('.native-lesson-viewer')).toBeVisible({ timeout: 30000 });
}

async function startFrames(page: Page) {
  await page.evaluate(() => {
    const frames: { ms: number; count: number; tips: {x:number;y:number}[] }[] = [];
    (window as any).__pencilFrames = frames;
    (window as any).__pencilSampling = true;
    const start = performance.now();
    function frame() {
      const shapes = [...document.querySelectorAll<SVGGraphicsElement>(
        '.workbook-pencil-flight .workbook-pencil__shape, .am-direct-pencil__active-line .workbook-pencil__shape, .am-direct-pencil__retry-group .workbook-pencil__shape')];
      const visible = shapes.filter((shape) => {
        let opacity = 1;
        for (let el: Element | null = shape; el; el = el.parentElement) {
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          opacity *= Number(style.opacity);
        }
        const r = shape.getBoundingClientRect();
        return opacity > .01 && r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight;
      });
      const tips = visible.map((s) => { const m = s.getScreenCTM()!; return {x:m.e,y:m.f}; });
      frames.push({ ms: performance.now() - start, count: visible.length, tips });
      if ((window as any).__pencilSampling) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

async function finishFrames(page: Page, label: string) {
  const frames = await page.evaluate(() => {
    (window as any).__pencilSampling = false;
    return (window as any).__pencilFrames as {ms:number;count:number;tips:{x:number;y:number}[]}[];
  });
  await fs.mkdir(proofDir, { recursive: true });
  await fs.writeFile(`${proofDir}/${label}-frames.json`, JSON.stringify(frames, null, 2));
  return frames;
}

for (const viewport of [{ width: 390, height: 844 }, { width: 1366, height: 768 }]) {
  const device = viewport.width === 390 ? "phone" : "desktop";
  test.describe(device, () => {
    test.use({ viewport, hasTouch: device === "phone", isMobile: device === "phone" });
    test("real Lesson route shows the large pencil tip and graphite result flow", async ({ page }, testInfo) => {
      test.setTimeout(90_000);
      await page.setViewportSize(viewport);
      await fs.mkdir(proofDir, { recursive: true });
      await openWorkbook(page, 2);
      const cell = page.locator('.fp-ix-cell[data-gretel-correct="true"]').first();
      await expect(cell).toBeVisible();
      const cursorAsset = page.locator(".workbook-pencil-touch-cursor");
      await expect(cursorAsset).toHaveAttribute("src", "/cartilla/images/ui/owner-pencil-tip.webp");
      await expect(cursorAsset).toHaveCSS("width", "240px");
      await expect.poll(() => cursorAsset.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBe(600);
      const visibleCursor = page.locator(".workbook-pencil-touch-cursor");
      if (device === "desktop") {
        await cell.hover();
        await expect(page.locator(".native-lesson-viewer")).toHaveCSS("cursor", "none");
        await expect(visibleCursor).toHaveCSS("opacity", "1");
        await page.screenshot({ path: `${proofDir}/${device}-large-tip-cursor.png` });
        await cell.click();
      } else {
        await cell.tap();
        await expect(visibleCursor).toHaveCSS("opacity", "1");
        await page.screenshot({ path: `${proofDir}/${device}-large-tip-cursor.png` });
      }
      expect(await page.locator(".workbook-pencil-flight").count()).toBe(0);
      await expect(cell).toHaveAttribute("aria-pressed", "true", { timeout: 12_000 });
      const correctMark = page.locator('.workbook-pencil-mark[data-mark-status="correct"]').first();
      await expect(correctMark).toBeVisible();
      await expect(correctMark.locator(".workbook-pencil-mark__stroke").first()).toHaveCSS("stroke", "rgb(37, 131, 81)");
      await page.screenshot({ path: `${proofDir}/${device}-charcoal-to-green.png` });

      await openWorkbook(page, 1);
      const wrong = page.locator('.fp-ix-cell[data-gretel-correct="false"]').first();
      if (device === "phone") await wrong.tap(); else await wrong.click();
      const eraser = page.locator(".workbook-pencil-flight .workbook-pencil__eraser-only");
      await expect(eraser).toBeVisible({ timeout: 10_000 });
      const redMark = page.locator('.workbook-pencil-mark[data-mark-status="erasing"] .workbook-pencil-mark__stroke').first();
      await expect(redMark).toHaveCSS("stroke", "rgb(196, 50, 10)", { timeout: 5_000 });
      expect(await page.locator(".workbook-pencil-flight .workbook-pencil__shape").count()).toBe(0);
      await page.screenshot({ path: `${proofDir}/${device}-red-eraser-wipe.png` });
      await expect(wrong).toHaveAttribute("aria-pressed", "false");
      await expect(page.locator(".workbook-pencil-flight")).toHaveCount(0, { timeout: 8_000 });

      const feedbackVideo = page.video();
      await page.close();
      expect(feedbackVideo).not.toBeNull();
      await feedbackVideo!.saveAs(`${proofDir}/${device}-pencil-feedback-flow.webm`);
    });
  });
}
