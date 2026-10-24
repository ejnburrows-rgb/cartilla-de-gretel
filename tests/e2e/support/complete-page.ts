import { expect, type Page, type Locator } from '@playwright/test';
import fs from 'node:fs';

// Shared real-completion helpers: drive a printed workbook page's actual
// activities (trace, draw, circle, match, fill, write) exactly as the
// final-candidate walk does, so any spec can finish a page through the real UI.
const layouts = JSON.parse(fs.readFileSync('src/data/page-layouts.json', 'utf8')).pages;

export async function stroke(page: Page, canvas: Locator) {
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box!.x + box!.width * .25, box!.y + box!.height * .3);
  await page.mouse.down();
  for (let i = 1; i <= 30; i++) {
    await page.mouse.move(box!.x + box!.width * (.25 + .4 * i / 30), box!.y + box!.height * (.3 + .3 * i / 30));
    await page.waitForTimeout(12);
  }
  await page.mouse.up();
}
export async function completePage(page: Page, number: number) {
  const reader = page.locator('.native-lesson-viewer');
  for (const region of layouts[String(number)].regions) {
    // Solve the live page only: while a page turns, a copy is drawn underneath.
    await expect(reader.locator('.native-lesson-viewer__underneath')).toHaveCount(0, { timeout: 8000 });
    const area = reader.locator(`.native-lesson-viewer__leaf [data-gretel-activity="page-${number}-${region.id}"]`);
    const traces = area.locator('.fp-trace');
    if (await traces.count()) {
      // Exercise real press-and-drag tracing, not a hundred blind dot taps.
      if (await traces.getAttribute('data-mode') === 'tap') {
        // Lane-b pages keep the trace footer hidden until hover/focus-within
        // ("reveal existing tools on touch/keyboard focus"), so hovering the
        // trace is itself the real student step that exposes the toggle.
        await traces.hover();
        await traces.getByRole('button', { name: 'Cambiar a modo trazo libre' }).click({ timeout: 10000 });
      }
      const svg = traces.locator('svg');
      await svg.scrollIntoViewIfNeeded();
      const letter = (await svg.getAttribute('aria-label'))!.replace('Traza la letra ', '');
      const template = await page.evaluate(async (glyph) => {
        const mod = await import('/src/components/cartilla/letter-stroke-templates.ts');
        return mod.getLetterTemplate(glyph);
      }, letter);
      expect(template, `Verified stroke template for ${letter}`).not.toBeNull();
      const box = (await svg.boundingBox())!;
      for (const line of template!) {
        await page.mouse.move(box.x + line[0].x / 100 * box.width, box.y + line[0].y / 120 * box.height);
        await page.mouse.down();
        for (const point of line) {
          await page.mouse.move(box.x + point.x / 100 * box.width, box.y + point.y / 120 * box.height);
          await page.waitForTimeout(25);
        }
        await page.mouse.up();
      }
      await expect(traces).toHaveAttribute('data-status', 'done');
    }
    const draw = area.locator('.am-dibuja, .am-paint');
    if (await draw.count()) {
      await stroke(page, draw.locator('canvas').last());
      // Lane-b pages reveal the draw toolbar on hover/focus-within only; the
      // stroke leaves the pointer over the canvas, which keeps it revealed.
      // Exact name matching drops this button (its accessible name carries
      // the icon's inline text), so match the visible label loosely.
      await draw.getByRole('button', { name: /Listo/ }).click({ timeout: 10000 });
    }
    const circles = area.locator('.native-syllable');
    if (await circles.count()) {
      const words = region.matchRows.flat();
      for (let i = 0; i < words.length; i++) if (words[i].correct !== false) {
        const choice = circles.locator('button').nth(i);
        // Circle the syllable from the keyboard (a pointer tap must land on the
        // syllable's letters). Taps made while the previous circle is still
        // being drawn are ignored, so give each one time and retry.
        for (let attempt = 0; attempt < 5 && await choice.getAttribute('aria-pressed') !== 'true'; attempt++) {
          await choice.focus();
          await page.keyboard.press('Enter');
          await page.waitForTimeout(700);
        }
        await expect(choice).toHaveAttribute('aria-pressed', 'true');
      }
    }
    // Pencil-line matching: tap the vowel card, then the picture it belongs to.
    const pencil = area.locator('.am-direct-pencil');
    if (await pencil.count()) {
      const links: Array<{ left: string | null; target: string }> = region.vowelPairs
        ? region.vowelPairs.filter((pair: any) => pair.correct !== false).map((pair: any) => ({ left: `Vocal ${pair.letter}`, target: pair.caption }))
        : (region.cells ?? []).filter((cell: any) => cell.correct === true).map((cell: any) => ({ left: null, target: cell.caption }));
      for (const link of links) {
        const left = link.left
          ? pencil.locator(`.am-direct-pencil__left-card[aria-label="${link.left}"]`).first()
          : pencil.locator('.am-direct-pencil__center').first();
        const target = pencil.locator(`.am-direct-pencil__target[aria-label="${link.target}"]`).first();
        // The printed example line (e.g. Oo→ola) is already drawn.
        if (((await target.getAttribute('class')) ?? '').includes('is-connected')) continue;
        if (await left.isEnabled()) await left.click();
        await target.click();
        await page.waitForTimeout(150);
      }
      await expect(pencil).toHaveAttribute('data-complete', 'true', { timeout: 10000 });
    }
    const lasso = area.locator('.am-lasso');
    if (await lasso.count()) {
      const targets = lasso.locator('button.am-lasso__target[data-gretel-correct="true"]');
      const count = await targets.count();
      for (let i = 0; i < count; i++) {
        if ((await targets.nth(i).getAttribute("class"))?.includes("is-caught")) continue;
        await expect(targets.nth(i)).toBeEnabled({ timeout: 15000 });
        await targets.nth(i).click();
        await page.waitForTimeout(500);
      }
    }
    // Circle the picture that starts with each row's vowel (graded on tap).
    const picks = area.locator('.fp-ix-pick__row');
    for (let i = 0; i < await picks.count(); i++) {
      const row = picks.nth(i);
      const answer = region.vowelRows?.[i]?.cells?.find((cell: any) => cell.correct === true)?.caption;
      if (!answer) continue;
      const cell = row.getByRole('button', { name: answer, exact: true }).first();
      if (!((await cell.getAttribute('class')) ?? '').includes('graded-correct')) await cell.click();
      await expect(cell).toHaveClass(/graded-correct/, { timeout: 10000 });
    }
    const grid = area.locator('.fp-ix-grid');
    if (await grid.count()) {
      // Every right picture is graded on tap; there is no Comprobar step.
      const choices = grid.locator('.fp-ix-cell[data-gretel-correct="true"]');
      for (let i = 0; i < await choices.count(); i++) {
        const cell = choices.nth(i);
        if (!((await cell.getAttribute('class')) ?? '').includes('graded-correct')) await cell.click();
        await expect(cell).toHaveClass(/graded-correct/, { timeout: 15000 });
      }
    }
    const fill = area.locator('.fp-ix-fill');
    if (await fill.count()) {
      // Pick each blank's right syllable from the printed answer key; graded on tap.
      const items = fill.locator('.fp-ix-fill__item');
      for (let i = 0; i < await items.count(); i++) {
        const answer = region.fillItems?.[i]?.choices?.find((choice: any) => choice.correct === true)?.text;
        if (!answer) continue;
        const choice = items.nth(i).getByRole('button', { name: answer, exact: true }).first();
        if (!((await choice.getAttribute('class')) ?? '').includes('graded-correct')) await choice.click();
        await expect(choice).toHaveClass(/graded-correct/, { timeout: 10000 });
        await expect(items.nth(i).locator('.fp-ix-fill__blank')).toHaveClass(/fp-ix-fill__blank--correct/);
      }
    }
    const writing = area.locator('textarea');
    if (await writing.count()) {
      await writing.fill('Escribí una oración con las palabras de esta página.');
      // Writing is finished only when the learner confirms with Listo.
      const done = area.getByRole('button', { name: /Listo/ });
      if (await done.count()) await done.click();
    }
  }
  const reading = reader.getByRole('button', { name: 'Ya leí esta página' });
  if (await reading.count()) await reading.click();
}
