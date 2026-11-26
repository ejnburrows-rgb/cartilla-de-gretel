import { chromium } from "playwright";
import sharp from "sharp";
const b = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const p = await ctx.newPage();
await p.addInitScript(() => {
  const payload = JSON.stringify({ lesson: 3, page: 0 });
  localStorage.setItem("cartilla.learner-resume.v1:3", payload);
  localStorage.setItem("cartilla.learner-resume.v1", payload);
});
await p.goto("http://127.0.0.1:5173/cartilla/leccion/3", { waitUntil: "domcontentloaded" });
const out = [];
for (let i = 0; i < 16; i++) {
  await p.waitForTimeout(700);
  const box = await p.locator("button.fp-ix-cell").nth(12).boundingBox().catch(() => null);
  if (!box) { out.push("?"); continue; }
  const buf = await p.screenshot({ clip: box });
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  let d = 0; for (let k = 0; k < data.length; k += info.channels) if (data[k] < 120 && data[k + 1] > 90) d++;
  out.push(d > 300 ? "E" : ".");
  if (i === 8) await p.mouse.move(700, 300);
}
console.log(out.join(""));
const box = await p.locator("button.fp-ix-cell").nth(12).boundingBox();
const full = await p.screenshot({ type: "jpeg", quality: 72 });
const { data, info } = await sharp(full).extract({ left: Math.round(box.x), top: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) - 2 }).raw().toBuffer({ resolveWithObject: true });
let d = 0; for (let k = 0; k < data.length; k += info.channels) if (data[k] < 120 && data[k + 1] > 90) d++;
console.log("full-page crop dark", d);
const full2 = await p.screenshot();
const r2 = await sharp(full2).extract({ left: Math.round(box.x), top: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) - 2 }).raw().toBuffer({ resolveWithObject: true });
let d2 = 0; for (let k = 0; k < r2.data.length; k += r2.info.channels) if (r2.data[k] < 120 && r2.data[k + 1] > 90) d2++;
console.log("full-page png crop dark", d2);
await b.close();
