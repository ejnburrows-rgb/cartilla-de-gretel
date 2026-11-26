// Cow game measurements: drawn cow proportions at 7 screen sizes and the input lock per move.
// Run from the repo root with the dev server on 127.0.0.1:5173:
//   node docs/proofs/assets-motion-2026-11-26/scripts/cow-measure.mjs
// Measures both the local branch and the production preview. Fixed URLs and output paths.
import { chromium } from "@playwright/test";
import fs from "node:fs";

const TARGETS = {
  branch: "http://127.0.0.1:5173",
  production: "https://cartilla-de-gretel-psi.vercel.app",
};
const OUT = "/tmp/ev/cow-measure";
const SIZES = {
  phone: [390, 844],
  "phone-land": [844, 390],
  tablet: [1024, 768],
  "tablet-portrait": [768, 1024],
  desktop: [1366, 768],
  projector: [1920, 1080],
  ultrawide: [2560, 1080],
};
// Every cow layer is a 453×518 cut of the owner drawing.
const DRAWING_RATIO = 453 / 518;

fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });
const result = { drawingRatio: +DRAWING_RATIO.toFixed(3), ratio: {}, lockMs: {} };

for (const [target, base] of Object.entries(TARGETS)) {
  result.ratio[target] = {};
  for (const [size, [w, h]] of Object.entries(SIZES)) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto(`${base}/cartilla/juego/cow-game-m`);
    await p.waitForTimeout(2500);
    // The body layer fills the cow box (object-fit: fill), so its box is the drawn cow.
    const boxes = await p.evaluate(() =>
      [...document.querySelectorAll(".cg-cow .cg-body")].map((el) => {
        const r = el.getBoundingClientRect();
        return { w: r.width, h: r.height };
      }),
    );
    const ratios = boxes.map((x) => +(x.w / x.h).toFixed(3));
    result.ratio[target][size] = {
      cows: ratios.length,
      ratios,
      stretchPct: +((Math.max(...ratios) / DRAWING_RATIO - 1) * 100).toFixed(1),
    };
    await p.screenshot({ path: `${OUT}/${target}-${size}.png` });
    await p.close();
  }

  // Input lock: time from tapping a slot until the next cow can be selected.
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  await p.goto(`${base}/cartilla/juego/cow-game-m`);
  await p.waitForTimeout(1500);
  const lockAfter = async (cow, slot, next) => {
    await p.getByRole("button", { name: `Vaca ${cow}` }).click();
    await p.getByRole("button", { name: `Casilla ${slot}` }).click();
    const t0 = Date.now();
    const nextCow = p.getByRole("button", { name: `Vaca ${next}` });
    for (;;) {
      await nextCow.click({ force: true });
      if ((await nextCow.getAttribute("aria-pressed")) === "true") break;
      await p.waitForTimeout(50);
    }
    const ms = Date.now() - t0;
    await nextCow.click({ force: true });
    return ms;
  };
  const wrong = await lockAfter("mu", "mo", "mo");
  await p.waitForTimeout(1800);
  const correct = await lockAfter("mu", "mu", "mo");
  result.lockMs[target] = { wrongMove: wrong, correctMove: correct };
  await p.close();
}
await b.close();
fs.writeFileSync(`${OUT}/cow-measure.json`, JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
