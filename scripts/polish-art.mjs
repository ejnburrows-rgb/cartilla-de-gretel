#!/usr/bin/env node
// Polishes raw extracted page PNGs into clean WebPs via sharp.
// Deterministic operations only: normalise (level stretch), sharpen, resize.
// No redraws, no generative steps. The author/illustrator's design is preserved.
// Exits 0 on any failure.

import fs from "node:fs";
import path from "node:path";

const RAW_DIR = "public/cartilla/art/raw";
const OUT_DIR = "public/cartilla/art/polished";
const TARGET_WIDTH = 1600;
const WEBP_QUALITY = 86;
const TIME_BUDGET_MS = 60_000;
const started = Date.now();

if (!fs.existsSync(RAW_DIR)) {
  console.log("[polish-art] no raw dir at", RAW_DIR, "- skipping");
  process.exit(0);
}

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch (e) {
  console.log("[polish-art] sharp missing:", e.message);
  process.exit(0);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs
  .readdirSync(RAW_DIR)
  .filter((f) => /\.png$/i.test(f))
  .sort();

let written = 0;
for (const f of files) {
  if (Date.now() - started > TIME_BUDGET_MS) {
    console.log("[polish-art] time budget exceeded after", written, "files");
    break;
  }
  const inPath = path.join(RAW_DIR, f);
  const outPath = path.join(OUT_DIR, f.replace(/\.png$/i, ".webp"));
  try {
    await sharp(inPath)
      .normalise() // restore scan whites/blacks without altering hue
      .sharpen({ sigma: 0.8, m1: 1.0, m2: 2.0 }) // crisp linework
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outPath);
    written++;
  } catch (e) {
    console.log("[polish-art]", f, "failed:", e.message);
  }
}
console.log(
  "[polish-art] wrote",
  written,
  "/",
  files.length,
  "in",
  ((Date.now() - started) / 1000).toFixed(1) + "s",
);
process.exit(0);
