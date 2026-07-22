#!/usr/bin/env node
/*
 * clean-art.mjs — book-illustration cleanup pipeline.
 *
 * Turns the raw white-boxed, soft scans into crisp, transparent-background
 * illustrations WITHOUT ever redrawing, recoloring, or regenerating them.
 * Everything here is a lossless-in-spirit clean: remove the white paper
 * background, trim the border, de-fringe the edge, upscale small art, and
 * sharpen. Colors (hue) are never altered.
 *
 * Free/open-source only: Node + sharp. No GPU, no network, no ML service.
 *
 * PRESERVE-ART design:
 *  - The FIRST run snapshots each pristine original into `_originals/<rel>`.
 *  - Every run then processes FROM `_originals` and writes the cleaned result
 *    back to the wired path `<rel>` (so illustrationSrc paths never change).
 *  - Re-running is idempotent: it always reprocesses the untouched original,
 *    never a previously-processed output, so quality never degrades.
 *
 * Background removal is a BORDER FLOOD-FILL (4-connected) over the near-white,
 * low-saturation region touching the image edge. That only clears the outer
 * paper — white *inside* the drawing (highlights, an airplane fuselage) is
 * kept, and drawings that bleed to the edge are left fully intact.
 *
 * Usage:
 *   node scripts/art-pipeline/clean-art.mjs            # process everything wired
 *   node scripts/art-pipeline/clean-art.mjs --sample   # 5 samples -> /tmp/art-sample
 *   node scripts/art-pipeline/clean-art.mjs --file <path>
 *   node scripts/art-pipeline/clean-art.mjs --list <file-of-paths>
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const FAITHFUL = "public/cartilla/art/faithful";
const ORIG_ROOT = path.join(FAITHFUL, "_originals");

// --- tunables (calibrated on real samples) ---
const WHITE_MIN = 236; // a pixel is "paper" if its darkest channel >= this
const WHITE_SAT = 18; //   AND (max-min) channel spread <= this (low saturation)
const EDGE_EAT = 1; // dilate background this many px into the art to kill the JPEG/gray halo ring
const PAD_FRAC = 0.03; // transparent margin as a fraction of the longest side
const TARGET_LONG = 820; // upscale small art so its longest side reaches ~this
const MAX_SCALE = 3; // never upscale more than this (avoids invented detail)
const MAX_LONG = 1400; // never produce anything larger than this on the long side

function isPaper(r, g, b) {
  const mn = Math.min(r, g, b);
  const mx = Math.max(r, g, b);
  return mn >= WHITE_MIN && mx - mn <= WHITE_SAT;
}

/** 4-connected flood fill from every border pixel over the paper region.
 *  Returns Uint8Array mask: 1 = background (to be made transparent). */
function backgroundMask(data, w, h, ch) {
  const bg = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (bg[p]) return;
    const i = p * ch;
    if (!isPaper(data[i], data[i + 1], data[i + 2])) return;
    bg[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (stack.length) {
    const p = stack.pop();
    const x = p % w;
    const y = (p / w) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  return bg;
}

/** grow the background mask by `n` px (eats the near-edge fringe halo). */
function dilate(mask, w, h, n) {
  let cur = mask;
  for (let k = 0; k < n; k++) {
    const next = cur.slice();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const p = y * w + x;
        if (cur[p]) continue;
        if (
          (x > 0 && cur[p - 1]) ||
          (x < w - 1 && cur[p + 1]) ||
          (y > 0 && cur[p - w]) ||
          (y < h - 1 && cur[p + w])
        )
          next[p] = 1;
      }
    }
    cur = next;
  }
  return cur;
}

/** drop truly-isolated single foreground pixels (scanner dust). */
function despeckle(mask, w, h) {
  const out = mask.slice();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (mask[p]) continue; // already bg
      const up = y > 0 ? !mask[p - w] : false;
      const dn = y < h - 1 ? !mask[p + w] : false;
      const lf = x > 0 ? !mask[p - 1] : false;
      const rt = x < w - 1 ? !mask[p + 1] : false;
      if (!up && !dn && !lf && !rt) out[p] = 1; // no fg neighbours -> dust
    }
  }
  return out;
}

async function processOne(srcAbs) {
  const src = sharp(srcAbs, { failOn: "none" }).ensureAlpha();
  const { data, info } = await src.raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;

  let bg = backgroundMask(data, w, h, ch);
  const bgCount = bg.reduce((a, v) => a + v, 0);
  const coverage = bgCount / (w * h);
  // Only treat this as a white-paper crop when there's a real border to remove.
  // (Full-bleed scenes with coloured edges get coverage ~0 -> left opaque.)
  const removeBg = coverage > 0.02;
  if (removeBg) {
    if (EDGE_EAT > 0) bg = dilate(bg, w, h, EDGE_EAT);
    bg = despeckle(bg, w, h);
  }

  // write alpha + find content bbox
  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const i = p * ch;
      if (removeBg && bg[p]) {
        data[i + 3] = 0;
      } else {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) {
    // fully transparent? bail: keep original opaque
    minX = 0;
    minY = 0;
    maxX = w - 1;
    maxY = h - 1;
  }
  const cw = maxX - minX + 1;
  const chh = maxY - minY + 1;

  let img = sharp(Buffer.from(data), { raw: { width: w, height: h, channels: ch } }).extract({
    left: minX,
    top: minY,
    width: cw,
    height: chh,
  });

  // upscale small art (lanczos) + sharpen; cap the scale and final size
  const longNow = Math.max(cw, chh);
  let scale = 1;
  if (longNow < TARGET_LONG) scale = Math.min(MAX_SCALE, TARGET_LONG / longNow);
  let outLong = Math.round(longNow * scale);
  if (outLong > MAX_LONG) {
    scale *= MAX_LONG / outLong;
    outLong = MAX_LONG;
  }
  if (scale > 1.01) {
    img = img.resize({
      width: Math.round(cw * scale),
      height: Math.round(chh * scale),
      kernel: "lanczos3",
      fit: "fill",
    });
  }
  img = img.sharpen({ sigma: 1.0, m1: 0.6, m2: 2.2 });

  // soften the cut edge (anti-alias the alpha only) + consistent transparent pad
  const pad = Math.round(Math.max(cw, chh) * scale * PAD_FRAC);
  img = img
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 90, effort: 6, alphaQuality: 100 });

  return img.toBuffer();
}

function relFromFaithful(p) {
  return path.relative(FAITHFUL, p).split(path.sep).join("/");
}

async function ensureOriginal(wiredPath) {
  const rel = relFromFaithful(wiredPath);
  const origPath = path.join(ORIG_ROOT, rel);
  if (!fs.existsSync(origPath)) {
    fs.mkdirSync(path.dirname(origPath), { recursive: true });
    fs.copyFileSync(wiredPath, origPath); // snapshot pristine source once
  }
  return origPath;
}

async function run() {
  const args = process.argv.slice(2);
  const sample = args.includes("--sample");
  let files = [];
  if (args.includes("--file")) {
    files = [args[args.indexOf("--file") + 1]];
  } else if (args.includes("--list")) {
    files = fs
      .readFileSync(args[args.indexOf("--list") + 1], "utf8")
      .trim()
      .split("\n")
      .filter(Boolean);
  } else {
    // everything under faithful except the originals snapshot and quarantine
    const walk = (d) =>
      fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
        const fp = path.join(d, e.name);
        if (e.isDirectory()) {
          if (e.name === "_originals" || e.name === "_needs-recrop") return [];
          return walk(fp);
        }
        return e.name.endsWith(".webp") ? [fp] : [];
      });
    files = walk(FAITHFUL);
  }

  if (sample) files = files.slice(0, 5);
  const outDir = sample ? "/tmp/art-sample" : null;
  if (outDir) fs.mkdirSync(outDir, { recursive: true });

  let ok = 0,
    err = 0;
  for (const f of files) {
    try {
      const orig = sample ? f : await ensureOriginal(f);
      const buf = await processOne(orig);
      if (outDir) {
        fs.writeFileSync(path.join(outDir, path.basename(f)), buf);
      } else {
        fs.writeFileSync(f, buf); // overwrite wired path in place
      }
      ok++;
      if (ok % 25 === 0) console.log(`  ...${ok}/${files.length}`);
    } catch (e) {
      err++;
      console.error("FAIL", f, e.message);
    }
  }
  console.log(`done: ${ok} ok, ${err} failed${outDir ? ` -> ${outDir}` : ""}`);
}

run();
