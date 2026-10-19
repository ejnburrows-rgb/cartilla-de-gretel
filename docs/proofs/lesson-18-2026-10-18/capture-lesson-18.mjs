/**
 * Lesson 18 (rr) proof capture — reproduces every screenshot referenced in
 * docs/proofs/lesson-18-2026-10-18/README.md.
 *
 * Usage: pnpm dev   (in another terminal; default port 5173)
 *        node docs/proofs/lesson-18-2026-10-18/capture-lesson-18.mjs
 *        BASE_URL=http://[::1]:5180 node docs/proofs/lesson-18-2026-10-18/capture-lesson-18.mjs
 *
 * Needs: playwright + a Chromium binary (CHROME_PATH or the playwright
 * headless shell). The lesson is marked completed in localStorage ONLY so
 * the page-turn completion gate does not block capture; the gate itself is
 * unchanged from main. Page turns use the real "Siguiente" button (keyboard
 * ArrowRight does not advance pages in this app).
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "docs/proofs/lesson-18-2026-10-18");
const BASE = process.env.BASE_URL || "http://localhost:5173";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell`,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--single-process"],
});

async function openLesson(page) {
  await page.goto(`${BASE}/cartilla/leccion/18`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const done = Array.from({ length: 18 }, (_, i) => i + 1);
    localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify(done));
    window.dispatchEvent(new Event("cartilla:lesson-progress"));
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".native-lesson-viewer").waitFor({ timeout: 30000 });
  await page.waitForTimeout(2500);
}

async function currentPage(page) {
  return page.locator(".native-lesson-viewer").getAttribute("data-native-page").catch(() => null);
}

async function nextPage(page) {
  await page.locator('[data-testid="button-next"]').click();
  await page.waitForTimeout(3500);
}

for (const vp of [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "tablet-1280x800", width: 1280, height: 800 },
]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await openLesson(page);
  let current = await currentPage(page);
  for (let i = 0; i < 8 && current && Number(current) <= 66; i++) {
    await page.screenshot({ path: `${OUT}/${vp.name}-p${String(current).padStart(2, "0")}.png` });
    await nextPage(page);
    const nxt = await currentPage(page);
    if (!nxt || nxt === current) break;
    current = nxt;
  }
  await page.close();
}

// Pencil interaction proof on the syllable-circling page (printed page 64).
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await openLesson(page);
  await nextPage(page); // 63 -> 64
  const word = page.locator(".native-syllable__word").first();
  await word.waitFor({ timeout: 15000 });
  await word.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/desktop-1440x900-p64-pencil-drawing.png` });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT}/desktop-1440x900-p64-pencil-done.png` });
  await page.close();
}

await browser.close();
console.log("DONE");
process.exit(0);
