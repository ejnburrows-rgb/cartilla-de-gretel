import { chromium } from "@playwright/test";
const w = Number(process.argv[2] || 1366);
const h = Number(process.argv[3] || 768);
const tag = process.argv[4] || "desk";
const base = process.argv[5] || "http://127.0.0.1:5173";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
await p.goto(`${base}/cartilla/juego/cow-game-m`);
await p.waitForTimeout(1500);
await p.getByRole("button", { name: "Vaca mu" }).click();
await p.getByRole("button", { name: "Casilla mu" }).click();
const t0 = Date.now();
for (let i = 0; i < 34; i++) {
  const r = await p.evaluate(() => {
    const cow = [...document.querySelectorAll(".cg-cow")].find((c) => c.getAttribute("aria-label") === "Vaca mu");
    const head = cow.querySelector(".cg-head").getBoundingClientRect();
    const card = [...document.querySelectorAll(".cg-card")].find((c) => c.textContent === "mu").getBoundingClientRect();
    return {
      cls: cow.className.replace(/cg-/g, "").trim(),
      headX: Math.round(head.x + head.width / 2),
      headY: Math.round(head.y + head.height / 2),
      cardX: Math.round(card.x + card.width / 2),
      cardY: Math.round(card.y + card.height / 2),
    };
  });
  console.log(Date.now() - t0, JSON.stringify(r));
  if (i === 19 || i === 23) await p.screenshot({ path: `/tmp/ev/cow-${tag}-${i}.png` });
  await p.waitForTimeout(100);
}
await b.close();
