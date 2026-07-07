/**
 * Crop script for L17(r), L18(rr), L19(g), L20(f) consonant vocab illustrations.
 * Faithful crops from flipchart source scans (no AI, no redraw).
 * Run: node scripts/crop-l17-l20.mjs
 *
 * Boxes determined from grid overlays on source pages (step=200).
 * Tight crops around subject only; exclude word labels, grid lines, neighboring cells.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CROPS = [
  // L17 r - all from intro page r-page-37.jpg (matches vocab labels exactly)
  {
    slug: "rana",
    word: "rana",
    lessonNumber: 17,
    outDir: "leccion-17-r",
    source: "public/cartilla/images/source/r/r-page-37.jpg",
    sourceFlipchartPage: "r-page-37.jpg",
    rotate: 0,
    box: { left: 180, top: 1400, width: 520, height: 460 },
    note: "frog illustration",
  },
  {
    slug: "rosa",
    word: "rosa",
    lessonNumber: 17,
    outDir: "leccion-17-r",
    source: "public/cartilla/images/source/r/r-page-37.jpg",
    sourceFlipchartPage: "r-page-37.jpg",
    rotate: 0,
    box: { left: 220, top: 2240, width: 520, height: 480 },
    note: "rose illustration",
  },
  {
    slug: "remo",
    word: "remo",
    lessonNumber: 17,
    outDir: "leccion-17-r",
    source: "public/cartilla/images/source/r/r-page-37.jpg",
    sourceFlipchartPage: "r-page-37.jpg",
    rotate: 0,
    box: { left: 820, top: 1400, width: 520, height: 460 },
    note: "oars/remos illustration (vocab uses singular remo)",
  },
  {
    slug: "rueda",
    word: "rueda",
    lessonNumber: 17,
    outDir: "leccion-17-r",
    source: "public/cartilla/images/source/r/r-page-37.jpg",
    sourceFlipchartPage: "r-page-37.jpg",
    rotate: 0,
    box: { left: 1400, top: 2240, width: 680, height: 550 },
    note: "wheel illustration (on yellow square in source)",
  },

  // L18 rr
  {
    slug: "burro",
    word: "burro",
    lessonNumber: 18,
    outDir: "leccion-18-rr",
    source: "public/cartilla/images/source/rr/rr-page-40.jpg",
    sourceFlipchartPage: "rr-page-40.jpg",
    rotate: 0,
    box: { left: 180, top: 1300, width: 580, height: 480 },
    note: "donkey illustration",
  },
  {
    slug: "perro",
    word: "perro",
    lessonNumber: 18,
    outDir: "leccion-18-rr",
    source: "public/cartilla/images/source/rr/rr-page-42.jpg",
    sourceFlipchartPage: "rr-page-42.jpg",
    rotate: 0,
    box: { left: 1480, top: 720, width: 620, height: 500 },
    note: "dog in field (story page illustration for perro)",
  },
  {
    slug: "guitarra",
    word: "guitarra",
    lessonNumber: 18,
    outDir: "leccion-18-rr",
    source: "public/cartilla/images/source/g/g-page-43.jpg",
    sourceFlipchartPage: "g-page-43.jpg",
    rotate: 0,
    box: { left: 1600, top: 1380, width: 580, height: 520 },
    note: "bear/Goloso cell used for guitarra (shared word; see L19); from g source per lesson lane",
  },

  // L19 g
  {
    slug: "gato",
    word: "gato",
    lessonNumber: 19,
    outDir: "leccion-19-g",
    source: "public/cartilla/images/source/g/g-page-45.jpg",
    sourceFlipchartPage: "g-page-45.jpg",
    rotate: 0,
    box: { left: 1350, top: 650, width: 850, height: 750 },
    note: "cats scene (gato enamorado story page)",
  },
  {
    slug: "galleta",
    word: "galleta",
    lessonNumber: 19,
    outDir: "leccion-19-g",
    source: "public/cartilla/images/source/g/g-page-43.jpg",
    sourceFlipchartPage: "g-page-43.jpg",
    rotate: 0,
    box: { left: 200, top: 1400, width: 580, height: 460 },
    note: "gaveta/box cell assigned for galleta (per available cells in letter source)",
  },
  {
    slug: "guitarra",
    word: "guitarra",
    lessonNumber: 19,
    outDir: "leccion-19-g",
    source: "public/cartilla/images/source/g/g-page-43.jpg",
    sourceFlipchartPage: "g-page-43.jpg",
    rotate: 0,
    box: { left: 1600, top: 1400, width: 580, height: 460 },
    note: "Goloso bear cell assigned for guitarra (shared with L18; from g source)",
  },
  {
    slug: "gusano",
    word: "gusano",
    lessonNumber: 19,
    outDir: "leccion-19-g",
    source: "public/cartilla/images/source/g/g-page-43.jpg",
    sourceFlipchartPage: "g-page-43.jpg",
    rotate: 0,
    box: { left: 880, top: 1680, width: 420, height: 220 },
    note: "worm illustration (tight on subject)",
  },

  // L20 f
  {
    slug: "faro",
    word: "faro",
    lessonNumber: 20,
    outDir: "leccion-20-f",
    source: "public/cartilla/images/source/f/f-page-46.jpg",
    sourceFlipchartPage: "f-page-46.jpg",
    rotate: 0,
    box: { left: 180, top: 1300, width: 580, height: 480 },
    note: "left cell (foto) assigned for faro per letter source cells",
  },
  {
    slug: "fiesta",
    word: "fiesta",
    lessonNumber: 20,
    outDir: "leccion-20-f",
    source: "public/cartilla/images/source/f/f-page-48.jpg",
    sourceFlipchartPage: "f-page-48.jpg",
    rotate: 0,
    box: { left: 1200, top: 150, width: 1050, height: 1050 },
    note: "party/cake scene (A la fiesta story page)",
  },
  {
    slug: "foca",
    word: "foca",
    lessonNumber: 20,
    outDir: "leccion-20-f",
    source: "public/cartilla/images/source/f/f-page-46.jpg",
    sourceFlipchartPage: "f-page-46.jpg",
    rotate: 0,
    box: { left: 820, top: 1300, width: 580, height: 480 },
    note: "middle cell (fideos) assigned for foca",
  },
  {
    slug: "fuente",
    word: "fuente",
    lessonNumber: 20,
    outDir: "leccion-20-f",
    source: "public/cartilla/images/source/f/f-page-46.jpg",
    sourceFlipchartPage: "f-page-46.jpg",
    rotate: 0,
    box: { left: 1480, top: 1300, width: 580, height: 480 },
    note: "right cell (familia) assigned for fuente",
  },
];

async function cropOne(spec) {
  const outDir = path.join(ROOT, "public/cartilla/art/faithful", spec.outDir);
  fs.mkdirSync(outDir, { recursive: true });
  const srcPath = path.join(ROOT, spec.source);
  let pipeline = sharp(srcPath);
  if (spec.rotate === 180) {
    pipeline = pipeline.rotate(180);
  }
  const outPath = path.join(outDir, `${spec.slug}.webp`);
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
    src: `/cartilla/art/faithful/${spec.outDir}/${spec.slug}.webp`,
    sourceFlipchartPage: spec.sourceFlipchartPage,
    cropBox: [
      spec.box.left,
      spec.box.top,
      spec.box.left + spec.box.width,
      spec.box.top + spec.box.height,
    ],
    outputPixels: `${meta.width}x${meta.height}`,
    ...(spec.note ? { sourceNote: spec.note } : {}),
  };
}

async function main() {
  console.log("Cropping L17-L20 consonant vocab art...");
  const entries = [];
  for (const spec of CROPS) {
    const entry = await cropOne(spec);
    entries.push(entry);
    console.log(`OK ${entry.slug} → ${entry.src} (${entry.outputPixels})`);
  }
  console.log(`Generated ${entries.length} webp files.`);
  // Manifest append and consonants.json update done separately per task SOP.
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
