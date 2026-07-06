/**
 * Phase 1: faithful crops for L7 mamá + mono.
 * Run: node scripts/crop-l7-mama-mono.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public/cartilla/art/faithful/leccion-7-m");

const CROPS = [
  {
    slug: "mama",
    word: "mamá",
    source: "public/cartilla/images/source/m/m-page-8.jpg",
    sourceFlipchartPage: "m-page-8.jpg",
    lessonNumber: 7,
    rotate: 0,
    // mamá — left cell, portrait only (source scan already upright for crop)
    box: { left: 100, top: 1200, width: 780, height: 620 },
  },
  {
    slug: "mono",
    word: "mono",
    source: "public/cartilla/images/source/n/n-page-25.jpg",
    sourceFlipchartPage: "n-page-25.jpg",
    lessonNumber: 7,
    rotate: 0,
    note: "cross-lesson: N flipchart page 25",
    // mono — middle-right cell (juggling monkey)
    box: { left: 1600, top: 950, width: 760, height: 680 },
  },
];

async function cropOne(spec) {
  const srcPath = path.join(ROOT, spec.source);
  let pipeline = sharp(srcPath);
  if (spec.rotate === 180) {
    pipeline = pipeline.rotate(180);
  }
  const outPath = path.join(OUT_DIR, `${spec.slug}.webp`);
  await pipeline
    .extract({
      left: spec.box.left,
      top: spec.box.top,
      width: spec.box.width,
      height: spec.box.height,
    })
    .webp({ quality: 92 })
    .toFile(outPath);

  const meta = await sharp(outPath).metadata();
  return {
    slug: spec.slug,
    word: spec.word,
    lessonNumber: spec.lessonNumber,
    pageNumber: null,
    src: `/cartilla/art/faithful/leccion-7-m/${spec.slug}.webp`,
    sourceFlipchartPage: spec.sourceFlipchartPage,
    crossLessonNote: spec.note ?? null,
    cropBox: [
      spec.box.left,
      spec.box.top,
      spec.box.left + spec.box.width,
      spec.box.top + spec.box.height,
    ],
    outputPixels: `${meta.width}x${meta.height}`,
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const entries = [];
  for (const spec of CROPS) {
    const entry = await cropOne(spec);
    entries.push(entry);
    console.log(`OK ${entry.slug} → ${entry.src} (${entry.outputPixels})`);
  }
  const manifestPath = path.join(ROOT, "public/cartilla/art/faithful/manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const entry of entries) {
    const idx = manifest.findIndex((e) => e.slug === entry.slug);
    const row = {
      slug: entry.slug,
      word: entry.word,
      lessonNumber: entry.lessonNumber,
      pageNumber: entry.pageNumber,
      src: entry.src,
      sourceFlipchartPage: entry.sourceFlipchartPage,
      cropBox: entry.cropBox,
      ...(entry.crossLessonNote ? { crossLessonNote: entry.crossLessonNote } : {}),
    };
    if (idx >= 0) manifest[idx] = row;
    else manifest.push(row);
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log("Manifest updated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});