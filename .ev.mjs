import { chromium } from "playwright";
const OUT = process.argv[2];
const VPS = [["phone", 390, 844, 2], ["desktop", 1366, 768, 1], ["projector", 1920, 1080, 1]];
const TARGETS = [
  ["workbook-p007", "/cartilla/leccion/3", 3, 0],
  ["flipchart-sheet3", "/cartilla/presentar/1"],
  ["cow-game", "/cartilla/juego/cow-game-m"],
];
const b = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });
for (const [vn, w, h, dpr] of VPS) {
  for (const [name, url, lesson, idx] of TARGETS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    if (lesson) await p.addInitScript(({ l, i }) => {
      const payload = JSON.stringify({ lesson: l, page: i });
      localStorage.setItem(`cartilla.learner-resume.v1:${l}`, payload);
      localStorage.setItem("cartilla.learner-resume.v1", payload);
    }, { l: lesson, i: idx });
    await p.goto(`http://127.0.0.1:5173${url}`, { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(4000);
    const s = p.getByRole("button", { name: "Comenzar" });
    if (await s.isVisible().catch(() => false)) { await s.click(); await p.waitForTimeout(2000); }
    await p.screenshot({ path: `${OUT}/${name}-${vn}.jpg`, type: "jpeg", quality: 72 });
    await ctx.close();
  }
}
await b.close();
console.log("ok");
