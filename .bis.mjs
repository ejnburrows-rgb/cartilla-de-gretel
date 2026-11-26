import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: process.env.RM || "no-preference" });
const p = await ctx.newPage();
await p.addInitScript(() => {
  const payload = JSON.stringify({ lesson: 3, page: 0 });
  localStorage.setItem("cartilla.learner-resume.v1:3", payload);
  localStorage.setItem("cartilla.learner-resume.v1", payload);
});
await p.goto("http://127.0.0.1:5173/cartilla/leccion/3", { waitUntil: "domcontentloaded" });
await p.waitForTimeout(5000);
const cell = p.locator("button.fp-ix-cell").nth(12);
const steps = [
  ["base", () => {}],
  ["img-class-removed", () => { const im = [...document.images].find((i) => i.src.includes("ojo.png")); im.className = ""; im.style.cssText = "width:100%;height:100%;object-fit:contain"; }],
  ["span-class-removed", () => { const im = [...document.images].find((i) => i.src.includes("ojo.png")); im.parentElement.className = ""; }],
  ["button-class-removed", () => { const im = [...document.images].find((i) => i.src.includes("ojo.png")); im.closest("button").className = ""; }],
];
for (const [name, fn] of steps) {
  await p.evaluate(fn);
  await p.waitForTimeout(400);
  await cell.screenshot({ path: `/tmp/w/bis-${name}.png` }).catch((e) => console.log(name, e.message));
  const cssText = await p.evaluate(() => { const im = [...document.images].find((i) => i.src.includes("ojo.png")); const s = getComputedStyle(im); return [...s].filter((k) => /blend|mask|filter|backdrop|opacity|clip|visibility|content|transform|translate|scale|rotate/.test(k)).map((k) => `${k}=${s.getPropertyValue(k)}`).filter((x) => !/=(none|normal|auto|1|visible|0px 0px|50% 50%|0px)$/.test(x)).join(" "); });
  console.log(name, cssText.slice(0, 400));
}
await b.close();
