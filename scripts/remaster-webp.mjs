/**
 * remaster-webp.mjs
 *
 * Converts all raw workbook (92 pages) and raw flipchart (62 pages) PNGs
 * to high-quality WebP (quality 90, lossless=false) for web delivery.
 *
 * Input:   public/cartilla/art/raw/workbook/page-NNN.png  (92 pages)
 *          public/cartilla/art/raw/flipchart/page-NNN.png (62 pages)
 *
 * Output:  public/cartilla/art/remastered/workbook/page-NNN.webp
 *          public/cartilla/art/remastered/flipchart/page-NNN.webp
 *
 * Usage:   node scripts/remaster-webp.mjs
 */

import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ART = path.join(ROOT, "public", "cartilla", "art");

const JOBS = [
  {
    src: path.join(ART, "raw", "workbook"),
    dst: path.join(ART, "remastered", "workbook"),
    label: "workbook",
  },
  {
    src: path.join(ART, "raw", "flipchart"),
    dst: path.join(ART, "remastered", "flipchart"),
    label: "flipchart",
  },
];

const WEBP_OPTIONS = {
  quality: 90,
  effort: 6,       // 0-6; 6 = best compression (slower but smaller)
  lossless: false,
};

async function processJob(job) {
  await mkdir(job.dst, { recursive: true });

  const files = (await readdir(job.src))
    .filter((f) => f.endsWith(".png"))
    .sort();

  console.log(`\n── ${job.label}: ${files.length} pages → ${job.dst}`);

  let ok = 0;
  let skip = 0;
  const start = Date.now();

  for (const file of files) {
    const srcPath = path.join(job.src, file);
    const dstName = file.replace(/\.png$/i, ".webp");
    const dstPath = path.join(job.dst, dstName);

    if (existsSync(dstPath)) {
      skip++;
      process.stdout.write("·");
      continue;
    }

    try {
      const info = await sharp(srcPath)
        .webp(WEBP_OPTIONS)
        .toFile(dstPath);

      ok++;
      process.stdout.write("✓");

      if (ok % 20 === 0) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        const pct = Math.round(((ok + skip) / files.length) * 100);
        process.stdout.write(` ${pct}% (${elapsed}s)\n`);
      }
    } catch (err) {
      console.error(`\nERROR on ${file}:`, err.message);
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n  Done: ${ok} converted, ${skip} skipped (${elapsed}s)`);
}

async function main() {
  console.log("Remaster WebP Pipeline — quality 90, effort 6");
  console.log("==============================================");

  for (const job of JOBS) {
    await processJob(job);
  }

  console.log("\n✅  All done. Images written to public/cartilla/art/remastered/");
  console.log("   Next: update image paths in code to use .webp from remastered/");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
