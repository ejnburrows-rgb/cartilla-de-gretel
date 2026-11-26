import { chromium } from "playwright";
const [, , lesson, idx, out, w = "1366", h = "768"] = process.argv;
const b = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.addInitScript(({ l, i }) => {
  const payload = JSON.stringify({ lesson: l, page: i });
  localStorage.setItem(`cartilla.learner-resume.v1:${l}`, payload);
  localStorage.setItem("cartilla.learner-resume.v1", payload);
}, { l: +lesson, i: +idx });
await p.goto(`http://127.0.0.1:5173/cartilla/leccion/${lesson}`, { waitUntil: "domcontentloaded" });
await p.waitForTimeout(3000);
const s = p.getByRole("button", { name: "Comenzar" });
if (await s.isVisible().catch(() => false)) await s.click();
await p.waitForTimeout(2000);
console.log(await p.evaluate(() => ({ label: document.body.innerText.match(/P[áa]gina[^\n]{0,30}/)?.[0], svgs: document.querySelectorAll("svg").length, canvases: document.querySelectorAll("canvas").length, imgs: document.images.length })));
await p.screenshot({ path: out });
await b.close();
