/**
 * remaster-webp-hd.mjs
 *
 * Converts the full-quality color workbook PNGs (2550×3301) to
 * high-quality WebP and writes them to /public/art/remastered/
 * using the non-zero-padded naming that getBookPageImage() expects.
 *
 * Source:  public/cartilla/art/color/workbook/page-NNN.png  (92 pages, 2550×3301)
 * Output:  public/art/remastered/page-N.webp                (1-based, non-padded)
 *
 * Also converts flipchart pages:
 * Source:  public/cartilla/art/raw/flipchart/page-NNN.png   (62 pages)
 * Output:  public/art/remastered/flipchart/page-N.webp
 *
 * Usage:   node scripts/remaster-webp-hd.mjs
 */

import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const WEBP_OPTIONS = { quality: 90, effort: 6, lossless: false };

async function processWorkbook() {
  const srcDir = path.join(PUBLIC, "cartilla", "art", "color", "workbook");
  const dstDir = path.join(PUBLIC, "art", "remastered");
  await mkdir(dstDir, { recursive: true });

  const files = (await readdir(srcDir)).filter((f) => f.endsWith(".png")).sort();

  console.log(`\n── workbook: ${files.length} pages → ${dstDir}`);
  let ok = 0,
    skip = 0;
  const start = Date.now();

  for (const file of files) {
    // page-001.png → 1 → page-1.webp
    const pageNum = parseInt(file.replace("page-", "").replace(".png", ""), 10);
    const dstName = `page-${pageNum}.webp`;
    const srcPath = path.join(srcDir, file);
    const dstPath = path.join(dstDir, dstName);

    if (existsSync(dstPath)) {
      skip++;
      process.stdout.write("·");
      continue;
    }

    try {
      await sharp(srcPath).webp(WEBP_OPTIONS).toFile(dstPath);
      ok++;
      process.stdout.write("✓");
      if ((ok + skip) % 20 === 0) {
        const pct = Math.round(((ok + skip) / files.length) * 100);
        process.stdout.write(` ${pct}% (${((Date.now() - start) / 1000).toFixed(1)}s)\n`);
      }
    } catch (err) {
      console.error(`\nERROR ${file}:`, err.message);
    }
  }
  console.log(
    `\n  Done: ${ok} converted, ${skip} skipped (${((Date.now() - start) / 1000).toFixed(1)}s)`,
  );
}

async function processFlipchartPages() {
  const srcDir = path.join(PUBLIC, "cartilla", "art", "raw", "flipchart");
  const dstDir = path.join(PUBLIC, "art", "remastered", "flipchart");
  await mkdir(dstDir, { recursive: true });

  const files = (await readdir(srcDir)).filter((f) => f.endsWith(".png")).sort();

  console.log(`\n── flipchart: ${files.length} pages → ${dstDir}`);
  let ok = 0,
    skip = 0;
  const start = Date.now();

  for (const file of files) {
    const pageNum = parseInt(file.replace("page-", "").replace(".png", ""), 10);
    const dstName = `page-${pageNum}.webp`;
    const srcPath = path.join(srcDir, file);
    const dstPath = path.join(dstDir, dstName);

    if (existsSync(dstPath)) {
      skip++;
      process.stdout.write("·");
      continue;
    }

    try {
      await sharp(srcPath).webp(WEBP_OPTIONS).toFile(dstPath);
      ok++;
      process.stdout.write("✓");
      if ((ok + skip) % 20 === 0) {
        const pct = Math.round(((ok + skip) / files.length) * 100);
        process.stdout.write(` ${pct}% (${((Date.now() - start) / 1000).toFixed(1)}s)\n`);
      }
    } catch (err) {
      console.error(`\nERROR ${file}:`, err.message);
    }
  }
  console.log(
    `\n  Done: ${ok} converted, ${skip} skipped (${((Date.now() - start) / 1000).toFixed(1)}s)`,
  );
}

async function main() {
  console.log("Ultra-HD WebP Remaster — quality 90, effort 6");
  console.log("Source: color/workbook (2550×3301), raw/flipchart");
  console.log("=================================================");
  await processWorkbook();
  await processFlipchartPages();
  console.log("\n✅  All done. Update getBookPageImage() to use /art/remastered/page-N.webp");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
