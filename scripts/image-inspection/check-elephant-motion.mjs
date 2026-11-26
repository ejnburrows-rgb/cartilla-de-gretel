// Images-lane check of the rebuilt Flip Chart sheet-6 elephant motion (assets-motion PR #1326).
// Renders the motion SVG in Chromium with motion off and at several animation times and
// compares each frame with the approved still. Fixed inputs in test-results/elephant/
// (git show of the #1326 head and main); writes PROOF/elephant-motion-check.{json,jpg}.
import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const IN = path.join(ROOT, "test-results", "elephant");
const PROOF = path.join(ROOT, "docs", "proofs", "image-inspection-2026-11-26");
const W = 570;
const H = 540;
const TIMES = [0, 400, 900, 1400, 2100, 2800, 3600];

const still = await sharp(path.join(IN, "still.png")).ensureAlpha().raw().toBuffer();
const browser = await chromium.launch({ channel: "chromium", args: ["--disable-dev-shm-usage"] });

async function frames(file, reduced) {
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  const svg = await fs.readFile(path.join(IN, file), "utf8");
  await page.setContent(
    `<html><body style="margin:0;background:transparent"><img id="a" style="display:block;width:${W}px;height:${H}px" src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}"></body></html>`,
  );
  await page.waitForFunction(() => document.getElementById("a").complete);
  const out = [];
  let last = 0;
  for (const t of reduced ? [0] : TIMES) {
    await page.waitForTimeout(t - last);
    last = t;
    out.push({
      t,
      png: await page.screenshot({
        omitBackground: true,
        clip: { x: 0, y: 0, width: W, height: H },
      }),
    });
  }
  await ctx.close();
  return out;
}

async function compare(png) {
  const px = await sharp(png).ensureAlpha().raw().toBuffer();
  let changed = 0,
    sum = 0,
    minX = W,
    minY = H,
    maxX = -1,
    maxY = -1;
  for (let i = 0; i < W * H; i++) {
    const k = i * 4;
    // compare over white so transparent pixels compare equal
    const a = (c) => (still[k + c] * still[k + 3] + 255 * (255 - still[k + 3])) / 255;
    const b = (c) => (px[k + c] * px[k + 3] + 255 * (255 - px[k + 3])) / 255;
    const d = Math.max(Math.abs(a(0) - b(0)), Math.abs(a(1) - b(1)), Math.abs(a(2) - b(2)));
    sum += d;
    if (d > 40) {
      changed++;
      const x = i % W,
        y = (i / W) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return {
    meanDiff: +(sum / (W * H)).toFixed(2),
    changedPct: +((100 * changed) / (W * H)).toFixed(2),
    changedBox: maxX < 0 ? null : [minX, minY, maxX, maxY],
  };
}

const report = {};
const sheetTiles = [];
for (const [label, file] of [
  ["rebuilt (#1326)", "new-alive.svg"],
  ["old (main)", "old-alive.svg"],
]) {
  const rm = await frames(file, true);
  const mv = await frames(file, false);
  report[label] = { reducedMotion: await compare(rm[0].png), frames: [] };
  for (const f of mv) report[label].frames.push({ t: f.t, ...(await compare(f.png)) });
  sheetTiles.push(
    { label: `${label}: motion off`, png: rm[0].png },
    { label: `${label}: t=${mv[3].t} ms`, png: mv[3].png },
  );
}
await browser.close();

const thumbs = await Promise.all(
  [
    { label: "approved still", png: await fs.readFile(path.join(IN, "still.png")) },
    ...sheetTiles,
  ].map(async (t) => ({
    label: t.label,
    buf: await sharp(t.png).flatten({ background: "#ffffff" }).resize(285, 270).jpeg().toBuffer(),
  })),
);
const composite = thumbs.map((t, i) => ({ input: t.buf, left: 10 + i * 295, top: 30 }));
const labels = thumbs
  .map(
    (t, i) =>
      `<text x="${10 + i * 295}" y="20" font-family="sans-serif" font-size="14">${t.label}</text>`,
  )
  .join("");
await sharp({
  create: { width: 10 + thumbs.length * 295, height: 310, channels: 3, background: "#ffffff" },
})
  .composite([
    ...composite,
    {
      input: Buffer.from(`<svg width="${10 + thumbs.length * 295}" height="30">${labels}</svg>`),
      left: 0,
      top: 0,
    },
  ])
  .jpeg({ quality: 82 })
  .toFile(path.join(PROOF, "elephant-motion-check.jpg"));
await fs.writeFile(path.join(PROOF, "elephant-motion-check.json"), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
