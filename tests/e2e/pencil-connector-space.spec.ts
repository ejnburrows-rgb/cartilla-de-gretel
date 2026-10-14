import { test, expect, type Page, type Locator, type CDPSession } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const proof = path.resolve('docs/proofs/connector-spacing-2026-10-14');
const pages = [
  { printed: 3, lesson: 1, index: 2, example: undefined },
  { printed: 5, lesson: 2, index: 1, example: 'ola' },
  { printed: 8, lesson: 3, index: 1, example: 'abeja' },
  { printed: 11, lesson: 4, index: 1, example: 'escalera' },
  { printed: 14, lesson: 5, index: 1, example: 'iguana' },
  { printed: 17, lesson: 6, index: 1, example: 'uña' },
];
const devices = [
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'phone', width: 390, height: 844 },
];
const pairLabels = ['ocho', 'araña', 'iglesia', 'escoba', 'uno'];
const center = '.am-direct-pencil__center';
const left = '.am-direct-pencil__left-card';
const target = '.am-direct-pencil__target';

async function frame(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}
async function point(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}
async function press(page: Page, source: Locator, cdp?: CDPSession) {
  const p = await point(source);
  if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  else { await page.mouse.move(p.x, p.y); await page.mouse.down(); }
  await frame(page);
  return p;
}
async function move(page: Page, p: { x: number; y: number }, cdp?: CDPSession) {
  if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...p, id: 1 }] });
  else await page.mouse.move(p.x, p.y);
  await frame(page);
}
async function release(page: Page, cdp?: CDPSession) {
  await frame(page); // pointer-up consumes the React hover state from the previous move
  if (cdp) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  else await page.mouse.up();
  await frame(page);
}
async function drag(page: Page, source: Locator, destination: Locator, cdp?: CDPSession) {
  const a = await press(page, source, cdp), b = await point(destination);
  for (let i = 1; i <= 6; i++) await move(page, { x: a.x + (b.x - a.x) * i / 6, y: a.y + (b.y - a.y) * i / 6 }, cdp);
  await release(page, cdp);
}
async function measure(page: Page) {
  return page.evaluate(() => {
    const rectangle = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height, label: el.getAttribute('aria-label') };
    };
    const sources = [...document.querySelectorAll('.am-direct-pencil__center,.am-direct-pencil__left-card')].map(rectangle);
    const targets = [...document.querySelectorAll('.am-direct-pencil__target')].map(rectangle);
    const stage = rectangle(document.querySelector('.am-direct-pencil__stage')!);
    const gap = (a: typeof stage, b: typeof stage) => Math.hypot(Math.max(0, a.x - b.right, b.x - a.right), Math.max(0, a.y - b.bottom, b.y - a.bottom));
    const all = [...sources, ...targets];
    return { sources, targets, stage,
      minGap: Math.min(...sources.flatMap(a => targets.map(b => gap(a, b)))),
      minCardGap: Math.min(...all.flatMap((a, i) => all.slice(i + 1).map(b => gap(a, b)))),
      clipped: all.some(r => r.x < stage.x - 1 || r.right > stage.right + 1 || r.y < stage.y - 1 || r.bottom > stage.bottom + 1),
      outsideViewport: all.some(r => r.x < 0 || r.right > innerWidth || r.y < 0 || r.bottom > innerHeight),
      hscroll: document.documentElement.scrollWidth - innerWidth,
    };
  });
}
function checkGeometry(m: Awaited<ReturnType<typeof measure>>, pair: boolean) {
  for (const r of m.targets) { expect(r.width, r.label ?? '').toBeGreaterThanOrEqual(71.9); expect(r.height).toBeGreaterThanOrEqual(71.9); }
  for (const r of m.sources) { expect(r.width).toBeGreaterThanOrEqual(pair ? 71.9 : 63.9); expect(r.height).toBeGreaterThanOrEqual(pair ? 71.9 : 63.9); }
  expect(m.minGap, 'source-to-picture edge drawing space').toBeGreaterThanOrEqual(24);
  expect(m.minCardGap, 'cards do not overlap').toBeGreaterThan(0);
  expect(m.clipped, 'cards remain within stage').toBe(false);
  expect(m.outsideViewport, 'cards remain visible within real viewport').toBe(false);
  expect(m.hscroll).toBeLessThanOrEqual(0);
}

for (const device of devices) for (const input of ['mouse', 'touch'] as const) {
  test.describe(`${device.name} ${input}`, () => {
    test.use({ viewport: { width: device.width, height: device.height }, hasTouch: input === 'touch', reducedMotion: input === 'touch' ? 'reduce' : 'no-preference' });
    for (const item of pages) test(`p${item.printed}: drawing space, retry, completion and saved return`, async ({ page, context }) => {
      test.setTimeout(90_000);
      fs.mkdirSync(proof, { recursive: true });
      await page.addInitScript(({ lesson, index }) => {
        const p = JSON.stringify({ lesson, page: index });
        localStorage.setItem('cartilla.learner-resume.v1', p);
        localStorage.setItem(`cartilla.learner-resume.v1:${lesson}`, p);
        (window as unknown as { connectorEvents: unknown[] }).connectorEvents = [];
        window.addEventListener('gretel:bus', e => (window as unknown as { connectorEvents: unknown[] }).connectorEvents.push((e as CustomEvent).detail));
      }, item);
      const url = `/cartilla/leccion/${item.lesson}`;
      const viewer = page.locator('.native-lesson-viewer');
      await page.goto(url);
      await expect(viewer).toHaveAttribute('data-native-page', String(item.printed));
      await expect(page.locator('.am-direct-pencil__stage')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('.am-direct-pencil__target img')].every(img => img.complete && img.naturalWidth > 0));
      await page.mouse.move(0, 0); await page.waitForTimeout(300);
      const pair = item.printed === 3;
      const cdp = input === 'touch' ? await context.newCDPSession(page) : undefined;
      if (item.example) {
        const example = page.locator(`${target}[data-example="true"]`);
        await expect(example).toHaveAttribute('aria-label', item.example);
        await expect(example).toBeDisabled();
        await expect(example).toHaveClass(/is-connected/);
      }
      const normal = await measure(page); checkGeometry(normal, pair);
      const active: Awaited<ReturnType<typeof measure>>[] = [];
      // Exercise every target approach, including middle left/right; never release on a disabled printed example.
      for (let i = 0; i < await page.locator(target).count(); i++) {
        const source = page.locator(pair ? left : center).first();
        await press(page, source, cdp); await move(page, await point(page.locator(target).nth(i)), cdp);
        await page.waitForTimeout(300); // include the full source/target hover enlargement
        const m = await measure(page); checkGeometry(m, pair); active.push(m);
        await move(page, await point(source), cdp); await release(page, cdp);
      }
      await page.mouse.move(0, 0); await page.waitForTimeout(300);
      if (input === 'mouse') await page.screenshot({ path: path.join(proof, `p${item.printed}-${device.name}-after.png`), fullPage: true });
      fs.writeFileSync(path.join(proof, `p${item.printed}-${device.name}-${input}-geometry.json`), JSON.stringify({ normal, active }, null, 2));
      const key = `cartilla.activity.canvas.v1:lasso:${item.lesson}:p${item.printed}-${pair ? 'pairs' : 'match'}`;
      const saved = () => page.evaluate(k => JSON.parse(localStorage.getItem(k) ?? '{"completedIds":[]}').completedIds as string[], key);
      const beforeWrong = await saved();
      const wrong = pair ? page.locator(target).filter({ has: page.locator('img') }).filter({ hasNotText: '__none__' }).nth(0) : page.locator(`${target}[data-correct="false"]`).first();
      const wrongSource = pair ? page.locator(left).filter({ hasText: /^o$/ }) : page.locator(center);
      // The first source picture is not ocho; select explicitly to keep pairing order independent.
      const wrongDestination = pair ? page.locator(`${target}[aria-label="araña"]`) : wrong;
      await drag(page, wrongSource, wrongDestination, cdp);
      await expect.poll(() => page.evaluate(() => (window as unknown as { connectorEvents: { type: string }[] }).connectorEvents.filter(e => e.type === 'answer:wrong').length)).toBeGreaterThan(0);
      await expect(wrongDestination).not.toHaveClass(/is-retry/, { timeout: 5000 });
      expect(await saved(), 'wrong answer is never saved').toEqual(beforeWrong);
      await expect(viewer).toHaveAttribute('data-page-complete', 'false');
      if (input === 'mouse' && device.name === 'phone') {
        // A second normal-motion wrong attempt preserves a genuine visible retry proof.
        await drag(page, wrongSource, wrongDestination, cdp);
        await expect(wrongDestination).toHaveClass(/is-retry/);
        await page.screenshot({ path: path.join(proof, `p${item.printed}-phone-retry.png`), fullPage: true });
        await expect(wrongDestination).not.toHaveClass(/is-retry/, { timeout: 5000 });
      }
      const correct = pair ? pairLabels : await page.locator(`${target}[data-correct="true"]:not([data-example])`).evaluateAll(els => els.map(e => e.getAttribute('aria-label')!));
      const connect = async (label: string, i: number) => {
        const source = pair ? page.locator(left).nth(i) : page.locator(center);
        const dest = page.locator(`${target}[aria-label="${label}"]`);
        await drag(page, source, dest, cdp); await expect(dest).toBeDisabled();
      };
      await connect(correct[0], 0);
      const partial = await saved(); expect(partial.length).toBeGreaterThan(beforeWrong.length);
      await page.reload();
      await expect(page.locator(`${target}[aria-label="${correct[0]}"]`)).toBeDisabled();
      expect(await saved()).toEqual(partial);
      for (let i = 1; i < correct.length; i++) await connect(correct[i], i);
      await expect(page.locator('.am-direct-pencil')).toHaveAttribute('data-complete', 'true');
      await expect(viewer).toHaveAttribute('data-page-complete', 'true');
      const allSaved = await saved(); expect(allSaved.length).toBe(correct.length + (pair ? 0 : 1));
      expect(await page.evaluate(n => localStorage.getItem('cartilla.page-completion.v1')?.includes(`page-${n}-p${n}-${n === 3 ? 'pairs' : 'match'}`), item.printed)).toBe(true);
      if (input === 'mouse') await page.screenshot({ path: path.join(proof, `p${item.printed}-${device.name}-completed.png`), fullPage: true });
      if (pair) await expect(page.getByRole('button', { name: 'Terminar lección', exact: true })).toBeEnabled();
      else await expect(viewer).not.toHaveAttribute('data-native-page', String(item.printed), { timeout: 8000 });
      expect(await saved(), 'completion persists after page navigation').toEqual(allSaved);
      await cdp?.detach();
    });
  });
}
