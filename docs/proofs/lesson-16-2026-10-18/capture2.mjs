import { chromium } from "playwright";
import fs from "node:fs";

const OUT = new URL(".", import.meta.url).pathname;
const BASE = process.env.BASE_URL || "http://localhost:5191";
const SH = `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`;

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || SH,
  args: ["--no-sandbox", "--no-proxy-server"],
});

async function shot(vp, pages) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  await page.goto(`${BASE}/cartilla/leccion/16`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify(Array.from({ length: 16 }, (_, i) => i + 1)));
    window.dispatchEvent(new Event("cartilla:lesson-progress"));
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator(".native-lesson-viewer").waitFor({ timeout: 30000 });
  await page.waitForTimeout(2500);
  for (const want of pages) {
    // advance until the viewer shows the wanted printed page
    for (let tries = 0; tries < 10; tries++) {
      const cur = await page.locator(".native-lesson-viewer").getAttribute("data-native-page").catch(() => null);
      if (cur && Number(cur) === want) break;
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(4000);
    }
    const cur = await page.locator(".native-lesson-viewer").getAttribute("data-native-page").catch(() => "?");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}${vp.name}-p${want}.png` });
    console.log(vp.name, "p" + want, "viewer shows", cur);
  }
  await page.close();
}

await shot({ name: "desktop-1440x900-", w: 1440, h: 900 }, [55, 56, 57, 58]);
await shot({ name: "tablet-1280x800-", w: 1280, h: 800 }, [55, 56, 57, 58]);

// pencil interaction on page 56
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/cartilla/leccion/16`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem("cartilla.lesson-progress.v1", JSON.stringify(Array.from({ length: 16 }, (_, i) => i + 1)));
    window.dispatchEvent(new Event("cartilla:lesson-progress"));
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator(".native-lesson-viewer").waitFor({ timeout: 30000 });
  await page.waitForTimeout(2500);
  for (let tries = 0; tries < 10; tries++) {
    const cur = await page.locator(".native-lesson-viewer").getAttribute("data-native-page").catch(() => null);
    if (cur && Number(cur) === 56) break;
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(4000);
  }
  const word = page.locator(".fp-syllable-match__word").first();
  await word.waitFor({ timeout: 15000 });
  await word.click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}desktop-1440x900-p56-pencil-drawing.png` });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT}desktop-1440x900-p56-pencil-done.png` });
  console.log("pencil shots done");
  await page.close();
}

await browser.close();
console.log("DONE");
