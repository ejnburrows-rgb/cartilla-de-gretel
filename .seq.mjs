import { chromium } from "playwright";
import sharp from "sharp";
const b = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });
for (const rm of ["no-preference", "reduce"]) {
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: rm });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    const payload = JSON.stringify({ lesson: 3, page: 0 });
    localStorage.setItem("cartilla.learner-resume.v1:3", payload);
    localStorage.setItem("cartilla.learner-resume.v1", payload);
  });
  await p.goto("http://127.0.0.1:5173/cartilla/leccion/3", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(3000);
  const cell = p.locator("button.fp-ix-cell").nth(12);
  const seq = [];
  for (let i = 0; i < 24; i++) {
    const buf = await cell.screenshot();
    const { data } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    const png = { data };
    let dark = 0;
    for (let k = 0; k < png.data.length; k += 3) if (png.data[k] < 120 && png.data[k + 1] > 90) dark++;
    seq.push(dark > 300 ? "E" : ".");
    await p.waitForTimeout(500);
  }
  console.log(rm, seq.join(""));
  await ctx.close();
}
await b.close();
