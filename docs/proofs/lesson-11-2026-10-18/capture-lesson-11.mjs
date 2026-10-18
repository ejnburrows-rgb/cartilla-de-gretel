/**
 * Lesson 11 (Dd) wide-screen design — proof capture.
 * Headless shell via playwright executablePath (--no-sandbox --disable-gpu
 * --disable-dev-shm-usage). Run with BASE_URL set to the dev server.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SHELL =
  path.join(os.homedir(), ".cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell");
const BASE = process.env.BASE_URL || "http://127.0.0.1:51811";
const OUT = process.env.OUT_DIR || path.join(os.homedir(), "workspace/your_files");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: SHELL,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});

async function openLesson(page) {
  await page.goto(`${BASE}/cartilla/leccion/11`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.getByText("Lección 11").first().waitFor({ timeout: 90000 });
  await page.waitForTimeout(3000);
}

async function currentPage(page) {
  return page.evaluate(() =>
    document.querySelector("[data-native-page]")?.getAttribute("data-native-page") ?? null
  );
}

// Required screenshots: page 35 at the three viewports.
for (const vp of [
  { name: "lesson-11-390x844", width: 390, height: 844 },
  { name: "lesson-11-844x390", width: 844, height: 390 },
  { name: "lesson-11-1366x900", width: 1366, height: 900 },
]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await openLesson(page);
  await page.screenshot({ path: `${OUT}/${vp.name}.png` });
  console.log("saved", vp.name, "printed page", await currentPage(page));
  await page.close();
}

// Extra PR proof: printed pages 35-38 at desktop size.
{
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await openLesson(page);
  let cur = await currentPage(page);
  for (let i = 0; i < 6 && cur && Number(cur) <= 38; i++) {
    await page.screenshot({ path: `${OUT}/lesson-11-page-${cur}.png` });
    console.log("saved lesson-11-page-" + cur);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(3000);
    const next = await currentPage(page);
    if (!next || next === cur) break;
    cur = next;
  }
  await page.close();
}

await browser.close();
console.log("done");
