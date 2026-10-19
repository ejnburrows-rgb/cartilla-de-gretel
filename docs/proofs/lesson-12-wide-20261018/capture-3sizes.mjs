import { chromium } from "playwright";
import path from "node:path";
import os from "node:os";
const SHELL = path.join(os.homedir(), ".cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell");
const BASE = process.env.BASE_URL || "http://127.0.0.1:5195";
const OUT = process.env.OUT_DIR || "docs/proofs/lesson-12-wide-20261018";
const browser = await chromium.launch({ executablePath: SHELL, args: ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"] });
for (const vp of [
  { name: "lesson-12-390x844", width: 390, height: 844 },
  { name: "lesson-12-844x390", width: 844, height: 390 },
  { name: "lesson-12-1366x900", width: 1366, height: 900 },
]) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(`${BASE}/cartilla/leccion/12`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.getByText("Lección 12").first().waitFor({ timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/${vp.name}.png` });
  console.log("saved", vp.name);
  await page.close();
}
await browser.close();
console.log("done");
