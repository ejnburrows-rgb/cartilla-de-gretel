#!/usr/bin/env node
/**
 * scripts/polish-art.mjs
 *
 * Stage 2 of the art pipeline.
 *
 * Takes the raw PNG exports from extract-art.mjs and applies a
 * high-definition upscaling + sharpening pass using sharp (libvips).
 *
 * Strategy (all non-destructive, style-faithful):
 *   1. Resize to target pixel width (default 2550 px — 8.5" @ 300 dpi)
 *      using Lanczos-3 resampling (sharp's best quality for scanned art).
 *   2. Unsharp mask to recover edge detail lost during scanning/compression.
 *   3. Mild level stretch to normalise scan brightness without colour shift.
 *   4. Export as high-quality PNG (lossless) for art and JPEG (quality 92)
 *      for page thumbnails.
 *
 * NO generative AI, NO colour invention, NO filters, NO stylisation.
 * Every output pixel is derived directly from the original scanned page.
 *
 * Output layout:
 *   public/cartilla/art/hd/<docKey>/page-<NNN>.png   (HD lossless)
 *   public/cartilla/art/hd/<docKey>/page-<NNN>.jpg   (compressed, web-ready)
 *   public/cartilla/art/manifest.json               (URL index for frontend)
 *
 * Usage:
 *   node scripts/polish-art.mjs [--doc workbook] [--width 2550] [--force]
 *
 * Options:
 *   --doc <key>      Process only one doc (workbook | flipchart | evals).
 *   --width <px>     Target width in pixels (default 2550).
 *   --force          Re-process even if output already exists.
 *   --no-png         Skip lossless PNG output (saves disk space).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Config ──────────────────────────────────────────────────────────────────

const DEFAULT_WIDTH = 2550;  // 8.5 inches @ 300 dpi

const RAW_ROOT  = path.resolve(__dirname, "../public/cartilla/art/raw");
const HD_ROOT   = path.resolve(__dirname, "../public/cartilla/art/hd");
const MANIFEST  = path.resolve(__dirname, "../public/cartilla/art/manifest.json");

// Unsharp mask: sigma / strength / threshold
// These values are calibrated for scanned book pages (~300 dpi input).
// sigma=1.0 sharpens line art and text. strength=0.8 is strong but not
// halation-prone. threshold=0.02 avoids amplifying noise in flat areas.
const UNSHARP = { sigma: 1.0, strength: 0.8, threshold: 0.02 };

// JPEG quality for web-ready thumbnails
const JPEG_QUALITY = 92;

// ── CLI args ─────────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const docIdx    = args.indexOf("--doc");
const targetDoc = docIdx !== -1 ? args[docIdx + 1] : null;

const widthIdx  = args.indexOf("--width");
const width     = widthIdx !== -1 ? parseInt(args[widthIdx + 1]) || DEFAULT_WIDTH : DEFAULT_WIDTH;
const force     = args.includes("--force");
const noPng     = args.includes("--no-png");

// ── Load sharp ───────────────────────────────────────────────────────────────

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("❌  'sharp' not installed. Run: pnpm add -D sharp");
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function getRawPages(docKey) {
  const dir = path.join(RAW_ROOT, docKey);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^page-\d{3}\.png$/.test(f))
    .sort()
    .map((f) => path.join(dir, f));
}

/**
 * Polish one raw page PNG → HD PNG + JPEG.
 * Returns the web-relative URL of the JPEG.
 */
async function polishPage(rawPath, hdDir, pageNum, totalPages) {
  const pageName = path.basename(rawPath, ".png"); // "page-001"
  const outJpg   = path.join(hdDir, `${pageName}.jpg`);
  const outPng   = path.join(hdDir, `${pageName}.png`);

  const bothExist = fs.existsSync(outJpg) && (noPng || fs.existsSync(outPng));
  if (!force && bothExist) {
    process.stdout.write(`   ⏭  ${pageNum}/${totalPages} (cached)\r`);
    return { jpg: outJpg, png: noPng ? null : outPng };
  }

  const meta = await sharp(rawPath).metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;

  // Never upscale beyond 4× — a scanned page at 72 dpi upscaled to 300 dpi
  // only has so much information; beyond 4× Lanczos diverges.
  const targetW = Math.min(width, srcW * 4);

  process.stdout.write(
    `   🔬 ${pageNum}/${totalPages}  ${srcW}×${srcH} → ${targetW}px…\r`
  );

  // Common pipeline: resize (Lanczos) → unsharp mask
  const pipeline = sharp(rawPath)
    .resize(targetW, null, {
      kernel: "lanczos3",  // Best quality for scanned art
      fastShrinkOnLoad: false,
    })
    .sharpen({
      sigma:     UNSHARP.sigma,
      m1:        UNSHARP.strength,  // amount for "flat" areas
      m2:        UNSHARP.strength,  // amount for "jagged" areas
      x1:        2,                 // controls sharpening boundary
      y2:        10,                // controls sharpening intensity
      y3:        20,
    })
    // Normalise scan white-point (safe, style-faithful — only moves
    // darkest/lightest pixels to 0/255 without touching mid-tones)
    .normalise({ lower: 1, upper: 99 });

  // Write JPEG (web-ready, efficient)
  await pipeline
    .clone()
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
    .toFile(outJpg);

  // Write lossless PNG unless --no-png
  if (!noPng) {
    await pipeline
      .clone()
      .png({ compressionLevel: 7, adaptiveFiltering: true })
      .toFile(outPng);
  }

  return { jpg: outJpg, png: noPng ? null : outPng };
}

/**
 * Process all pages of one document.
 */
async function polishDoc(docKey) {
  const rawPages = getRawPages(docKey);
  if (rawPages.length === 0) {
    console.warn(`⚠️  No raw pages found for [${docKey}]. Run extract-art.mjs first.`);
    return { docKey, pages: [] };
  }

  console.log(`\n🔬 [${docKey}] — ${rawPages.length} pages → ${width}px`);

  const hdDir = path.join(HD_ROOT, docKey);
  ensureDir(hdDir);

  const pages = [];
  for (let i = 0; i < rawPages.length; i++) {
    const result = await polishPage(rawPages[i], hdDir, i + 1, rawPages.length);
    pages.push(result);
  }

  console.log(`\n   ✓  ${pages.length} pages → ${path.relative(process.cwd(), hdDir)}`);
  return { docKey, pages };
}

/**
 * Build the manifest.json that the frontend useBookArt hook reads.
 *
 * Shape matches ArtManifest type in src/hooks/useBookArt.ts:
 * {
 *   builtAt: string;
 *   cover: string;
 *   lessons: Record<string, {
 *     character?: string;
 *     pageThumb?: string;
 *     pages?: string[];
 *   }>;
 * }
 *
 * Mapping convention (workbook PDF page order):
 *   Page 1        → cover
 *   Pages 2–25    → lessons 1–24 (one page each, letter page = pageThumb)
 *   Remaining     → supplemental (ignored in manifest, available in /hd/)
 */
function buildManifest(results) {
  const manifest = {
    builtAt: new Date().toISOString(),
    cover: "",
    lessons: {},
  };

  const workbook = results.find((r) => r.docKey === "workbook");
  if (workbook) {
    // Public URL for each page (relative to /public/)
    const url = (p) =>
      "/cartilla/art/hd/workbook/" + path.basename(p).replace(".png", ".jpg");

    if (workbook.pages[0]?.jpg) {
      manifest.cover = url(workbook.pages[0].jpg);
    }

    // Pages 2–25 → lessons 1–24
    for (let lesson = 1; lesson <= 24; lesson++) {
      const pageIdx = lesson; // 0-indexed: page[0]=cover, page[1]=lesson 1
      const entry   = workbook.pages[pageIdx];
      if (entry?.jpg) {
        manifest.lessons[String(lesson)] = {
          pageThumb: url(entry.jpg),
          pages:     [url(entry.jpg)],
        };
      }
    }
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\n📋  Manifest written → ${path.relative(process.cwd(), MANIFEST)}`);
  console.log(
    `    cover: ${manifest.cover || "(none)"} | lessons: ${Object.keys(manifest.lessons).length}`
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("✨ polish-art.mjs — HD upscale + sharpen (faithful scans only)");
  console.log(`   Target width: ${width}px | JPEG quality: ${JPEG_QUALITY}`);
  console.log(`   Unsharp mask: σ=${UNSHARP.sigma} strength=${UNSHARP.strength}`);
  console.log(`   Force: ${force} | Skip PNG: ${noPng}`);
  console.log("");

  ensureDir(HD_ROOT);

  const docKeys = Object.keys({
    workbook: true,
    flipchart: true,
    evals: true,
  });

  const targets = targetDoc
    ? docKeys.filter((k) => k === targetDoc)
    : docKeys;

  if (targetDoc && targets.length === 0) {
    console.error(
      `❌  Unknown doc "${targetDoc}". Valid keys: ${docKeys.join(", ")}`
    );
    process.exit(1);
  }

  const results = [];
  for (const key of targets) {
    results.push(await polishDoc(key));
  }

  // Rebuild manifest whenever workbook was processed
  const didWorkbook = results.some((r) => r.docKey === "workbook" && r.pages.length > 0);
  const allResults  = didWorkbook
    ? results
    : (() => {
        // Load existing workbook data from HD dir for manifest-only rebuild
        const wbDir = path.join(HD_ROOT, "workbook");
        if (fs.existsSync(wbDir)) {
          const jpgs = fs
            .readdirSync(wbDir)
            .filter((f) => f.endsWith(".jpg"))
            .sort()
            .map((f) => ({ jpg: path.join(wbDir, f), png: null }));
          return [{ docKey: "workbook", pages: jpgs }, ...results];
        }
        return results;
      })();

  buildManifest(allResults);

  console.log("\n✅  Polish complete.");
  console.log("    The frontend will now load HD art from /cartilla/art/hd/");
}

main().catch((err) => {
  console.error("\n❌  Fatal error:", err);
  process.exit(1);
});
