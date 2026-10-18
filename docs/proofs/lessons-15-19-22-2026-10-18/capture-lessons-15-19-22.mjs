/**
 * Proof capture for Lessons 15 (Bb, pages 51-54), 19 (Gg, 67-70) and
 * 22 (Cc, 79-82) — branch lessons/15-19-22.
 * Renders every changed page at portrait 390x844 AND landscape 844x390.
 * Usage: node capture-lessons-15-19-22.mjs   (dev server on :5173)
 */
import { chromium } from "playwright";
import fs from "node:fs";
import { URL } from "node:url";

const OUT = new URL(".", import.meta.url).pathname;
const BASE = process.env.BASE_URL || "http://localhost:5173";
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/chromium",
  args: ["--no-sandbox"],
});

const LESSONS = {
  15: [51, 52, 53, 54],
  19: [67, 68, 69, 70],
  22: [79, 80, 81, 82],
};

async function openLesson(page, n) {
  await page.goto(`${BASE}/cartilla/leccion/${n}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate((ln) => {
    localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify(Array.from({ length: ln }, (_, i) => i + 1)));
    window.dispatchEvent(new Event("cartilla:lesson-progress"));
  }, n);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator(".native-lesson-viewer").waitFor({ timeout: 30000 });
  await page.waitForTimeout(2500);
}

async function goPage(page, want) {
  for (let t = 0; t < 12; t++) {
    const cur = await page.locator(".native-lesson-viewer").getAttribute("data-native-page").catch(() => null);
    if (cur && Number(cur) === want) return true;
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(3500);
  }
  return (await page.locator(".native-lesson-viewer").getAttribute("data-native-page")) === String(want);
}

for (const [vp, tag] of [[{ width: 390, height: 844 }, "portrait-390x844"], [{ width: 844, height: 390 }, "landscape-844x390"]]) {
  const page = await browser.newPage({ viewport: vp });
  for (const [n, pages] of Object.entries(LESSONS)) {
    await openLesson(page, Number(n));
    for (const want of pages) {
      const ok = await goPage(page, want);
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `${OUT}${tag}-lesson${n}-p${want}.png` });
      console.log(tag, "lesson", n, "p", want, ok ? "OK" : "PAGE MISS");
    }
  }
  await page.close();
}

// Pencil interaction proof: tap a syllable word on each lesson's circling page
// (52 / 68 / 80) at phone portrait — the wooden pencil must fly in, draw the
// green circle, and the circle must stay.
for (const [n, p] of [[15, 52], [19, 68], [22, 80]]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await openLesson(page, n);
  await goPage(page, p);
  const word = page.locator(".native-syllable__word").first();
  await word.waitFor({ timeout: 15000 });
  await word.click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}portrait-390x844-lesson${n}-p${p}-pencil-drawing.png` });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT}portrait-390x844-lesson${n}-p${p}-pencil-done.png` });
  console.log("pencil proof lesson", n, "done");
  await page.close();
}

await browser.close();
console.log("DONE");
