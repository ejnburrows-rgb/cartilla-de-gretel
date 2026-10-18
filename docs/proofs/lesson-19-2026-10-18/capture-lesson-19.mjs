/**
 * Lesson 19 (Gg) proof capture — reproduces every screenshot referenced in
 * docs/proofs/lesson-19-2026-10-18/README.md.
 *
 * Usage: pnpm dev   (in another terminal)
 *        node docs/proofs/lesson-19-2026-10-18/capture-lesson-19.mjs
 *
 * Needs: playwright + a Chromium binary (CHROME_PATH or /usr/local/bin/chromium).
 * The lesson is marked completed in localStorage ONLY so the page-turn
 * completion gate does not block capture; the gate itself was verified
 * working separately (locked nav controls on an unfinished page 67).
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "docs/proofs/lesson-19-2026-10-18");
const BASE = process.env.BASE_URL || "http://localhost:5173";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  // Playwright's bundled Chromium headless shell: the full Chrome binary
  // (CHROME_PATH) enforces Local Network Access checks that block
  // localhost navigation in this sandbox.
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: ["--no-sandbox"],
});

async function openLesson(page) {
  // Seed lesson progress BEFORE first load (addInitScript): marking lesson
  // 19 complete makes every page's completion gate pass (see
  // pageCompletionState in src/lib/page-completion.ts). A reload-based
  // approach is flaky under load, so the seed runs pre-navigation instead.
  await page.addInitScript(() => {
    try {
      localStorage.setItem(
        "cartilla.lesson-progress.v1",
        JSON.stringify(Array.from({ length: 19 }, (_, i) => i + 1)),
      );
    } catch { /* ignore */ }
  });
  await page.goto(`${BASE}/cartilla/leccion/19`, { waitUntil: "domcontentloaded" });
  await page.locator(".native-lesson-viewer").waitFor({ timeout: 30000 });
  await page.waitForTimeout(1800);
}

for (const vp of [
  { name: "desktop-1366x900", width: 1366, height: 900 },
  { name: "tablet-1280x800", width: 1280, height: 800 },
]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await openLesson(page);
  let current = await page.locator(".native-lesson-viewer").getAttribute("data-native-page");
  for (let i = 0; i < 8 && current && Number(current) <= 70; i++) {
    await page.screenshot({ path: `${OUT}/${vp.name}-p${String(current).padStart(2, "0")}.png` });
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(3200);
    const next = await page.locator(".native-lesson-viewer").getAttribute("data-native-page").catch(() => null);
    if (!next || next === current) break;
    current = next;
  }
  await page.close();
}

// Pencil interaction proof on the syllable-circling page (printed page 68).
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await openLesson(page);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(3200);
  // NOTE: the interactive syllable page renders word tiles as
  // button.native-syllable__word (not .fp-syllable-match__word, which is the
  // static renderer's class). "gato" starts with the target syllable ga.
  const word = page.locator('button.native-syllable__word[aria-label="gato"]');
  await word.waitFor({ timeout: 20000 });
  await word.click();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${OUT}/desktop-1366x900-p68-pencil-drawing.png` });
  await page.waitForTimeout(3800);
  await page.screenshot({ path: `${OUT}/desktop-1366x900-p68-pencil-done.png` });
  await page.close();
}

await browser.close();
console.log("DONE");
process.exit(0);
