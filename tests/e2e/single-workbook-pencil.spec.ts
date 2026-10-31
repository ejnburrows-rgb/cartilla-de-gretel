import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';

const baseline = process.env.PENCIL_BASELINE === '1';
const proofDir = process.env.PENCIL_PROOF_DIR || '/tmp/cartilla-pencil-proof';

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

for (const viewport of [{width:390,height:844}, {width:1366,height:900}]) {
  const device = viewport.width === 390 ? 'phone' : 'desktop';
  test.describe(device, () => {
  test.use({viewport, hasTouch: device === 'phone', isMobile: device === 'phone'});
  test(`real Lesson 2 page 4 X has one pencil across both strokes`, async ({page}, testInfo) => {
    await page.setViewportSize(viewport);
    await fs.mkdir(proofDir, {recursive:true});
    await openWorkbook(page, 2);
    await expect(page.locator('.fp-region--instruction')).toContainText(/Marca con una x/i);
    const cell = page.locator('.fp-ix-cell[data-gretel-correct="true"]').first();
    await expect(cell).toBeVisible();
    await startFrames(page);
    if (device === 'phone') await cell.tap(); else await cell.click();
    await expect(page.locator('.workbook-pencil-flight')).toBeVisible();
    // Let the pencil reach the transition naturally before inspecting frames.
    await expect.poll(() => page.locator('.workbook-pencil-flight').evaluate((el:SVGSVGElement) => el.getCurrentTime())).toBeGreaterThan(1.7);
    // Inspect actual rendered SVG frames at every 10ms in the old overlap.
    const overlap = await page.evaluate(() => {
      const svg = document.querySelector<SVGSVGElement>('.workbook-pencil-flight')!;
      const currentTime = svg.getCurrentTime();
      svg.pauseAnimations();
      const samples: { ms:number; count:number }[] = [];
      for (let ms=1670;ms<=1930;ms+=10) {
        svg.setCurrentTime(ms/1000);
        const count = [...svg.querySelectorAll('.workbook-pencil')].filter((el) => Number(getComputedStyle(el).opacity) > .01).length;
        samples.push({ms,count});
      }
      svg.setCurrentTime(currentTime);
      svg.unpauseAnimations();
      return samples;
    });
    await page.screenshot({path:`${proofDir}/${device}-x-old-overlap.png`});
    // Natural playback includes both diagonals and its exit.
    await expect(page.locator('.workbook-pencil-flight')).toHaveCount(0, {timeout:7000});
    await expect(cell).toHaveAttribute('aria-pressed','true');
    const frames=await finishFrames(page,`${device}-x`);
    expect(frames.length).toBeGreaterThan(20);
    if (baseline) {
      expect(Math.max(...overlap.map(f=>f.count))).toBe(2);
    } else {
      expect(Math.max(...overlap.map(f=>f.count))).toBe(1);
      expect(Math.max(...frames.map(f=>f.count))).toBe(1);
      expect(await page.locator('html').getAttribute('data-workbook-pencil-active')).toBeNull();
      await page.reload();
      await expect(page.locator('.native-lesson-viewer')).toBeVisible();
      await expect(page.locator('.fp-ix-cell[data-gretel-correct="true"]').first()).toHaveAttribute('aria-pressed','true');
    }
    await page.screenshot({path:`${proofDir}/${device}-x-result.png`});
    await fs.writeFile(`${proofDir}/${device}-overlap.json`,JSON.stringify(overlap,null,2));
    await testInfo.attach(`${device}-overlap`,{body:JSON.stringify(overlap),contentType:'application/json'});
    if (baseline) return;

    // Normal circle, wrong-answer erasure and retry on real printed page 1.
    await openWorkbook(page,1);
    const right = page.locator('.fp-ix-cell[data-gretel-correct="true"]').first();
    const wrong = page.locator('.fp-ix-cell[data-gretel-correct="false"]').first();
    await startFrames(page);
    if (device === 'phone') await right.tap(); else await right.click();
    await expect(page.locator('.workbook-pencil-flight')).toHaveCount(1);
    expect(await page.locator('body').evaluate(el => getComputedStyle(el).cursor)).toBe('auto');
    await expect(page.locator('.workbook-pencil-flight')).toHaveCount(0,{timeout:7000});
    await expect(right).toHaveAttribute('aria-pressed','true');
    if (device === 'phone') await wrong.tap(); else await wrong.click();
    await expect(page.locator('.workbook-pencil--eraser')).toHaveCount(1,{timeout:6000});
    await page.screenshot({path:`${proofDir}/${device}-circle-eraser.png`});
    await expect(page.locator('.workbook-pencil-flight')).toHaveCount(0,{timeout:6000});
    await expect(wrong).toHaveAttribute('aria-pressed','false');
    if (device === 'phone') await wrong.tap(); else await wrong.click();
    await expect(page.locator('.workbook-pencil--eraser')).toHaveCount(1,{timeout:6000});
    await expect(page.locator('.workbook-pencil-flight')).toHaveCount(0,{timeout:6000});
    const circles = await finishFrames(page,`${device}-circle-retry`);
    expect(Math.max(...circles.map(f=>f.count))).toBe(1);

    // Direct line input remains usable while an earlier wrong line is erased.
    await openWorkbook(page,2,1);
    const connector=page.locator('.am-direct-pencil').first();
    await expect(connector).toBeVisible();
    const center=connector.locator('.am-direct-pencil__center');
    const bad=connector.locator('.am-direct-pencil__target[data-correct="false"]').first();
    const good=connector.locator('.am-direct-pencil__target[data-correct="true"]:not([data-example="true"])').first();
    const centerBox=(await center.boundingBox())!;
    const badBox=(await bad.boundingBox())!;
    const goodBox=(await good.boundingBox())!;
    const c={x:centerBox.x+centerBox.width/2,y:centerBox.y+centerBox.height/2};
    const b={x:badBox.x+badBox.width/2,y:badBox.y+badBox.height/2};
    const g={x:goodBox.x+goodBox.width/2,y:goodBox.y+goodBox.height/2};
    const touch=device==='phone' ? await page.context().newCDPSession(page) : null;
    const down=async () => {
      if (touch) await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...c,id:1}]});
      else { await page.mouse.move(c.x,c.y); await page.mouse.down(); }
    };
    const move=async (to:{x:number;y:number}) => {
      if (touch) await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...to,id:1}]});
      else await page.mouse.move(to.x,to.y,{steps:10});
    };
    const up=async () => {
      if (touch) await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      else await page.mouse.up();
    };
    await startFrames(page);
    await down(); await move(b); await up();
    await expect(connector.locator('.am-direct-pencil__retry-group')).toHaveCount(1);
    await down(); await move({x:(c.x+g.x)/2,y:(c.y+g.y)/2});
    await page.screenshot({path:`${proofDir}/${device}-line-during-erase.png`});
    expect(await connector.locator('.workbook-pencil__shape').count()).toBe(1);
    await move(g); await up();
    await expect(good).toHaveAttribute('aria-pressed','true');
    await expect(connector.locator('.am-direct-pencil__retry-group')).toHaveCount(0,{timeout:6000});
    const lines=await finishFrames(page,`${device}-line-retry`);
    expect(Math.max(...lines.map(f=>f.count))).toBe(1);
    await page.reload();
    await expect(page.locator('.am-direct-pencil__target[data-correct="true"]:not([data-example="true"])').first()).toHaveAttribute('aria-pressed','true');
    await page.screenshot({path:`${proofDir}/${device}-line-saved.png`});

    await page.emulateMedia({reducedMotion:'reduce'});
    await openWorkbook(page,2);
    const nextLabel=await page.locator('.fp-ix-cell[data-gretel-correct="true"]:not([aria-pressed="true"])').first().getAttribute('aria-label');
    const reduced=page.getByRole('button',{name:nextLabel!,exact:true}).first();
    if (device==='phone') await reduced.tap(); else await reduced.click();
    await expect(reduced).toHaveClass(/graded-correct/);
    expect(await page.locator('.workbook-pencil-flight').count()).toBe(0);
    await page.screenshot({path:`${proofDir}/${device}-reduced-motion.png`});

  });
  });
}
