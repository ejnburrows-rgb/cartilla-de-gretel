#!/usr/bin/env node
// restore-art.mjs — Faithful Restoration Standard pipeline (see AGENTS.md).
//
// Restoration CLEANS; it never INVENTS. This script runs ONLY the allowed
// pixel-cleanup ops on already-faithful art and writes the result to a
// mirrored restored/ path — it NEVER modifies an original or a raw scan.
// Every output is then checked by an automated acceptance test: the restored
// image is downscaled back to the original's size, overlaid on the original,
// and scored by edge-map drift. Any drift over the threshold = reject that
// image (its restored file is removed and the run fails).
//
// Allowed ops (all non-generative — they clean pixels, they don't redraw):
//   - upscale (Real-ESRGAN binary if RESRGAN_BIN is set, else sharp Lanczos)
//   - JPEG-noise / scan-speckle removal (gentle median)
//   - paper-shadow removal + white-balance (level normalize)
//   - palette normalization (mild, hue-preserving)
// Banned ops (generative fill, redraws, style transfer, anything that moves a
// line) are simply never invoked here — and the acceptance test is the
// backstop: a tool is judged by whether its OUTPUT passes the overlay test,
// not by whether it is internally "generative" (AGENTS.md, 2026-07-22).
//
// Free tools only ($0): sharp (bundled). Real-ESRGAN is optional.
//
// Usage:
//   node scripts/restore-art.mjs --src <dir> --out <dir> [options]
// Options:
//   --src <dir>        source dir of already-faithful art   (default: public/cartilla/art/hd/workbook)
//   --out <dir>        mirrored restored output dir          (default: public/cartilla/art/restored)
//   --proofs <dir>     where overlay proofs + report go      (default: <out>/_proofs)
//   --upscale <n>      target upscale factor (1 = off)       (default: 1)
//   --max-dim <px>     cap longest side after upscale        (default: 4000)
//   --threshold <t>    max allowed edge-drift score 0..1     (default: 0.06)
//   --limit <k>        process at most k images (sampling)   (default: all)
//   --dry             run + score but write nothing
//
// Exit code 0 only if every processed image PASSES the acceptance test.

import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const pexec = promisify(execFile);

// ── args ──────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = {
    src: "public/cartilla/art/hd/workbook",
    out: "public/cartilla/art/restored",
    proofs: null,
    upscale: 1,
    maxDim: 4000,
    threshold: 0.06,
    limit: Infinity,
    dry: false,
    gentle: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    const v = argv[i + 1];
    if (k === "--src") (a.src = v), i++;
    else if (k === "--out") (a.out = v), i++;
    else if (k === "--proofs") (a.proofs = v), i++;
    else if (k === "--upscale") (a.upscale = Number(v)), i++;
    else if (k === "--max-dim") (a.maxDim = Number(v)), i++;
    else if (k === "--threshold") (a.threshold = Number(v)), i++;
    else if (k === "--limit") (a.limit = Number(v)), i++;
    else if (k === "--dry") a.dry = true;
    else if (k === "--gentle") a.gentle = true;
  }
  a.proofs ??= path.join(a.out, "_proofs");
  return a;
}

const IMG = /\.(png|jpe?g|webp)$/i;

async function listImages(dir) {
  const out = [];
  async function walk(d) {
    let entries;
    try {
      entries = await fs.readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === "_proofs") continue;
        await walk(p);
      } else if (IMG.test(e.name)) out.push(p);
    }
  }
  await walk(dir);
  return out.sort();
}

// ── the restoration pass (allowed ops only) ────────────────────────────────
async function restore(srcPath, { upscale, maxDim, gentle }) {
  const original = sharp(srcPath, { failOn: "none" });
  const meta = await original.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  // 1. Upscale (optional). Real-ESRGAN if a binary is provided, else Lanczos.
  //    Never enlarge past maxDim on the longest side.
  let buf = await original.toBuffer();
  let curW = w;
  let curH = h;
  if (upscale > 1) {
    const longest = Math.max(w, h);
    const factor = Math.min(upscale, maxDim / longest);
    if (factor > 1.001) {
      const targetW = Math.round(w * factor);
      const targetH = Math.round(h * factor);
      const rbin = process.env.RESRGAN_BIN;
      if (rbin) {
        // Real-ESRGAN ncnn binary: writes an upscaled PNG we then read back.
        const tmpIn = srcPath;
        const tmpOut = `${srcPath}.resrgan.png`;
        await pexec(rbin, ["-i", tmpIn, "-o", tmpOut, "-s", String(Math.ceil(factor))]);
        buf = await sharp(tmpOut).resize(targetW, targetH, { kernel: "lanczos3" }).toBuffer();
        await fs.rm(tmpOut, { force: true });
      } else {
        buf = await sharp(buf).resize(targetW, targetH, { kernel: "lanczos3" }).toBuffer();
      }
      curW = targetW;
      curH = targetH;
    }
  }

  // 2. Gentle scan-speckle / JPEG-noise removal (median 1 — does not move lines).
  // 3. Paper-shadow removal + white-balance via level normalize.
  //    Default: full normalize (best for high-contrast line art / crops).
  //    --gentle: wide-percentile normalize (2..98) so soft watercolour washes
  //    keep their tonality instead of getting over-contrasted (no AI slop).
  let pipe = sharp(buf)
    .median(1)
    .normalise(gentle ? { lower: 2, upper: 98 } : undefined);

  const isPng = /\.png$/i.test(srcPath);
  const outBuf = await (isPng
    ? pipe.png({ compressionLevel: 9 })
    : pipe.jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
  ).toBuffer();

  return { outBuf, origW: w, origH: h, restW: curW, restH: curH, format: meta.format };
}

// ── acceptance test: overlay alignment + edge-map drift ─────────────────────
// Laplacian edge magnitude, compared at the original's resolution.
async function edgeBuffer(input, w, h) {
  return sharp(input)
    .resize(w, h, { fit: "fill" })
    .greyscale()
    .convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] })
    .raw()
    .toBuffer();
}

function meanAbsDiff(a, b) {
  const n = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += Math.abs(a[i] - b[i]);
  return sum / n / 255; // 0..1
}

async function acceptance(srcPath, restoredBuf, origW, origH, proofsDir, threshold, dry) {
  const [eo, er] = await Promise.all([
    edgeBuffer(srcPath, origW, origH),
    edgeBuffer(restoredBuf, origW, origH),
  ]);
  const drift = meanAbsDiff(eo, er);
  const pass = drift <= threshold;

  // Overlay proof: restored (downscaled to original size) at 50% over original.
  const base = path.basename(srcPath).replace(IMG, "");
  const proofPath = path.join(proofsDir, `${base}.overlay.png`);
  if (!dry) {
    const top = await sharp(restoredBuf)
      .resize(origW, origH, { fit: "fill" })
      .ensureAlpha(0.5)
      .png()
      .toBuffer();
    const overlay = await sharp(srcPath)
      .resize(origW, origH, { fit: "fill" })
      .composite([{ input: top, blend: "over" }])
      // keep proofs small so they are cheap to commit as evidence
      .resize({ width: Math.min(origW, 900) })
      .png()
      .toBuffer();
    await fs.mkdir(proofsDir, { recursive: true });
    await fs.writeFile(proofPath, overlay);
  }
  return { drift, pass, proofPath: path.relative(process.cwd(), proofPath) };
}

// ── main ────────────────────────────────────────────────────────────────────
async function main() {
  const a = parseArgs(process.argv);
  const srcAbs = path.resolve(a.src);
  const images = (await listImages(srcAbs)).slice(0, a.limit);
  if (images.length === 0) {
    console.error(`No images found under ${a.src}`);
    process.exit(2);
  }
  console.log(
    `restore-art: ${images.length} image(s) · upscale ${a.upscale}x · ${a.gentle ? "gentle" : "standard"} · threshold ${a.threshold} · resrgan ${process.env.RESRGAN_BIN ? "on" : "off (sharp lanczos)"}${a.dry ? " · DRY" : ""}`,
  );

  const report = [];
  let failed = 0;
  for (const srcPath of images) {
    const rel = path.relative(srcAbs, srcPath);
    const outPath = path.join(path.resolve(a.out), rel);
    try {
      const { outBuf, origW, origH, restW, restH } = await restore(srcPath, a);
      if (!a.dry) {
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        await fs.writeFile(outPath, outBuf);
      }
      const acc = await acceptance(srcPath, outBuf, origW, origH, path.resolve(a.proofs), a.threshold, a.dry);
      report.push({
        src: path.relative(process.cwd(), srcPath),
        out: a.dry ? null : path.relative(process.cwd(), outPath),
        origSize: `${origW}x${origH}`,
        restoredSize: `${restW}x${restH}`,
        drift: Number(acc.drift.toFixed(4)),
        pass: acc.pass,
        proof: acc.proofPath,
      });
      if (!acc.pass) {
        failed++;
        if (!a.dry) await fs.rm(outPath, { force: true }); // reject drifted output
        console.log(`  ✗ ${rel}  drift ${acc.drift.toFixed(4)} > ${a.threshold}  REJECTED`);
      } else {
        console.log(`  ✓ ${rel}  drift ${acc.drift.toFixed(4)}`);
      }
    } catch (e) {
      failed++;
      report.push({ src: path.relative(process.cwd(), srcPath), error: String(e.message || e), pass: false });
      console.log(`  ✗ ${rel}  ERROR ${e.message || e}`);
    }
  }

  if (!a.dry) {
    await fs.mkdir(path.resolve(a.proofs), { recursive: true });
    await fs.writeFile(
      path.join(path.resolve(a.proofs), "report.json"),
      JSON.stringify({ generatedAt: new Date().toISOString(), threshold: a.threshold, results: report }, null, 2),
    );
  }

  const passed = report.length - failed;
  console.log(`\nrestore-art: ${passed}/${report.length} passed, ${failed} rejected. Proofs: ${a.proofs}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
