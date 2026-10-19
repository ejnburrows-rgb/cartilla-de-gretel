/**
 * Lesson 15 (Bb) proof capture — reproduces every screenshot referenced in
 * docs/proofs/lesson-15-2026-10-18/README.md.
 *
 * Usage: pnpm dev   (in another terminal)
 *        node docs/proofs/lesson-15-2026-10-18/capture-lesson-15.mjs
 *
 * Needs: playwright + a Chromium binary (CHROME_PATH or /usr/local/bin/chromium).
 * The lesson is marked completed in localStorage ONLY so the page-turn
 * completion gate does not block capture; the gate itself was verified
 * working separately (2 locked nav controls on an unfinished page 51).
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "docs/proofs/lesson-15-2026-10-18");
const BASE = process.env.BASE_URL || "http://127.0.0.1:5173";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/chromium",
  args: ["--no-sandbox", "--disable-features=LocalNetworkAccessChecks"],
});

async function openLesson(page) {
  await page.goto(`${BASE}/cartilla/leccion/15`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const done = Array.from({ length: 15 }, (_, i) => i + 1);
    localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify(done));
    window.dispatchEvent(new Event("cartilla:lesson-progress"));
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".native-lesson-viewer").waitFor({ timeout: 20000 });
  await page.waitForTimeout(1800);
}

async function nextPage(page) {
  // Robust page-turn: try the accessible button first, fall back to a
  // direct DOM click (headless-shell flakiness workaround).
  try {
    await page.getByRole("button", { name: "Siguiente" }).click({ timeout: 8000 });
  } catch {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const next = btns.find((b) => (b.textContent || "").includes("Siguiente"));
      if (next) next.click();
      else throw new Error("no Siguiente button");
    });
  }
}

for (const vp of [
  { name: "desktop-1366x900", width: 1366, height: 900 },
  { name: "tablet-1280x800", width: 1280, height: 800 },
]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await openLesson(page);
  let current = await page.locator(".native-lesson-viewer").getAttribute("data-native-page");
  for (let i = 0; i < 8 && current && Number(current) <= 54; i++) {
    await page.screenshot({ path: `${OUT}/${vp.name}-p${String(current).padStart(2, "0")}.png` });
    await nextPage(page);
    await page.waitForTimeout(3200);
    const next = await page.locator(".native-lesson-viewer").getAttribute("data-native-page").catch(() => null);
    if (!next || next === current) break;
    current = next;
  }
  await page.close();
}

// Pencil interaction proof on the syllable-circling page (printed page 52).
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await openLesson(page);
  await nextPage(page);
  await page.waitForTimeout(3200);
  const word = page.locator(".native-syllable__word").first();
  await word.waitFor({ timeout: 10000 });
  await word.click();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${OUT}/desktop-1366x900-p52-pencil-drawing.png` });
  await page.waitForTimeout(3800);
  await page.screenshot({ path: `${OUT}/desktop-1366x900-p52-pencil-done.png` });
  await page.close();
}

await browser.close();
console.log("DONE");
process.exit(0);
