/**
 * Faithful crops from source scans for remaining L19–L24 object slots.
 * Source-only: no AI, no redesign. Boxes calibrated on intro pages.
 *
 * Run: node scratch/agent2-crop-l19-l24.mjs
 * Then: node scratch/agent2-wire-l19-l24.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PROBE = process.argv.includes("--probe");
const outProbe = path.join(ROOT, "generated/agent2-crop-probe");

/**
 * Layout pattern on letter intro pages (~2454×3127):
 *  top scene, then 3-cell mid row, then 2-cell bottom row.
 * Mid row cells (approx): left/mid/right at top≈1280–1380
 * Bottom row: left/right at top≈2100–2200
 */
const CROPS = [
  // ── L19 G — g-page-43.jpg ─────────────────────────────────────────────
  {
    slug: "gaveta",
    word: "gaveta",
    lessonNumber: 19,
    outDir: "leccion-19-g",
    source: "public/cartilla/images/source/g/g-page-43.jpg",
    sourceFlipchartPage: "g-page-43.jpg",
    box: { left: 120, top: 1280, width: 700, height: 620 },
    note: "open drawer with papers",
  },
  {
    slug: "gusano",
    word: "gusano",
    lessonNumber: 19,
    outDir: "leccion-19-g",
    source: "public/cartilla/images/source/g/g-page-43.jpg",
    sourceFlipchartPage: "g-page-43.jpg",
    box: { left: 820, top: 1480, width: 640, height: 360 },
    note: "green worm (re-crop tight, correct subject)",
  },
  {
    slug: "goloso",
    word: "Goloso",
    lessonNumber: 19,
    outDir: "leccion-19-g",
    source: "public/cartilla/images/source/g/g-page-43.jpg",
    sourceFlipchartPage: "g-page-43.jpg",
    box: { left: 1560, top: 1300, width: 680, height: 560 },
    note: "cat Goloso with necktie",
  },
  {
    slug: "gorra",
    word: "gorra",
    lessonNumber: 19,
    outDir: "leccion-19-g",
    source: "public/cartilla/images/source/g/g-page-43.jpg",
    sourceFlipchartPage: "g-page-43.jpg",
    box: { left: 300, top: 2140, width: 680, height: 560 },
    note: "striped baseball cap",
  },
  {
    slug: "mago",
    word: "mago",
    lessonNumber: 19,
    outDir: "leccion-19-g",
    source: "public/cartilla/images/source/g/g-page-43.jpg",
    sourceFlipchartPage: "g-page-43.jpg",
    box: { left: 1220, top: 2100, width: 900, height: 700 },
    note: "magician with rabbit and hat",
  },

  // ── L20 F — f-page-46.jpg ─────────────────────────────────────────────
  {
    slug: "foto",
    word: "foto",
    lessonNumber: 20,
    outDir: "leccion-20-f",
    source: "public/cartilla/images/source/f/f-page-46.jpg",
    sourceFlipchartPage: "f-page-46.jpg",
    box: { left: 140, top: 1320, width: 640, height: 540 },
    note: "framed portrait photo",
  },
  {
    slug: "fideos",
    word: "fideos",
    lessonNumber: 20,
    outDir: "leccion-20-f",
    source: "public/cartilla/images/source/f/f-page-46.jpg",
    sourceFlipchartPage: "f-page-46.jpg",
    box: { left: 860, top: 1300, width: 620, height: 560 },
    note: "man eating noodles/fideos",
  },
  {
    slug: "familia",
    word: "familia",
    lessonNumber: 20,
    outDir: "leccion-20-f",
    source: "public/cartilla/images/source/f/f-page-46.jpg",
    sourceFlipchartPage: "f-page-46.jpg",
    box: { left: 1580, top: 1300, width: 680, height: 560 },
    note: "family of four",
  },
  {
    slug: "felo",
    word: "Felo",
    lessonNumber: 20,
    outDir: "leccion-20-f",
    source: "public/cartilla/images/source/f/f-page-46.jpg",
    sourceFlipchartPage: "f-page-46.jpg",
    box: { left: 220, top: 2200, width: 820, height: 640 },
    note: "man on red tractor Felo",
  },
  {
    slug: "funda",
    word: "funda",
    lessonNumber: 20,
    outDir: "leccion-20-f",
    source: "public/cartilla/images/source/f/f-page-46.jpg",
    sourceFlipchartPage: "f-page-46.jpg",
    box: { left: 1280, top: 2180, width: 720, height: 560 },
    note: "yellow pillowcase/funda",
  },

  // ── L21 J — j-page-49.jpg ─────────────────────────────────────────────
  {
    slug: "jirafa",
    word: "jirafa",
    lessonNumber: 21,
    outDir: "leccion-21-j",
    source: "public/cartilla/images/source/j/j-page-49.jpg",
    sourceFlipchartPage: "j-page-49.jpg",
    box: { left: 60, top: 100, width: 1050, height: 1100 },
    note: "giraffe with glasses (top scene)",
  },
  {
    slug: "jicotea",
    word: "jicotea",
    lessonNumber: 21,
    outDir: "leccion-21-j",
    source: "public/cartilla/images/source/j/j-page-49.jpg",
    sourceFlipchartPage: "j-page-49.jpg",
    box: { left: 120, top: 1300, width: 640, height: 520 },
    note: "turtle jicotea",
  },
  {
    slug: "jugo",
    word: "jugo",
    lessonNumber: 21,
    outDir: "leccion-21-j",
    source: "public/cartilla/images/source/j/j-page-49.jpg",
    sourceFlipchartPage: "j-page-49.jpg",
    box: { left: 860, top: 1280, width: 620, height: 520 },
    note: "glass of juice with orange",
  },
  {
    slug: "jesus",
    word: "Jesús",
    lessonNumber: 21,
    outDir: "leccion-21-j",
    source: "public/cartilla/images/source/j/j-page-49.jpg",
    sourceFlipchartPage: "j-page-49.jpg",
    box: { left: 1520, top: 1240, width: 700, height: 580 },
    note: "boy Jesús with oversized pencil",
  },
  {
    slug: "ajo",
    word: "ajo",
    lessonNumber: 21,
    outDir: "leccion-21-j",
    source: "public/cartilla/images/source/j/j-page-49.jpg",
    sourceFlipchartPage: "j-page-49.jpg",
    box: { left: 280, top: 2180, width: 620, height: 520 },
    note: "garlic bulb",
  },
  {
    slug: "jarra",
    word: "jarra",
    lessonNumber: 21,
    outDir: "leccion-21-j",
    source: "public/cartilla/images/source/j/j-page-49.jpg",
    sourceFlipchartPage: "j-page-49.jpg",
    box: { left: 1180, top: 2100, width: 700, height: 620 },
    note: "pink pitcher jarra",
  },

  // ── L22 C — c-page-52.jpg ─────────────────────────────────────────────
  {
    slug: "cuna",
    word: "cuna",
    lessonNumber: 22,
    outDir: "leccion-19-c",
    source: "public/cartilla/images/source/c/c-page-52.jpg",
    sourceFlipchartPage: "c-page-52.jpg",
    box: { left: 120, top: 1300, width: 660, height: 540 },
    note: "baby crib (re-crop correct subject)",
  },
  {
    slug: "conejo",
    word: "conejo",
    lessonNumber: 22,
    outDir: "leccion-19-c",
    source: "public/cartilla/images/source/c/c-page-52.jpg",
    sourceFlipchartPage: "c-page-52.jpg",
    box: { left: 900, top: 1280, width: 560, height: 540 },
    note: "rabbit with bowtie",
  },
  {
    slug: "casa",
    word: "casa",
    lessonNumber: 22,
    outDir: "leccion-19-c",
    source: "public/cartilla/images/source/c/c-page-52.jpg",
    sourceFlipchartPage: "c-page-52.jpg",
    box: { left: 1540, top: 1300, width: 660, height: 540 },
    note: "house with trees (verify existing)",
  },
  {
    slug: "cubo",
    word: "cubo",
    lessonNumber: 22,
    outDir: "leccion-19-c",
    source: "public/cartilla/images/source/c/c-page-52.jpg",
    sourceFlipchartPage: "c-page-52.jpg",
    box: { left: 320, top: 2120, width: 640, height: 600 },
    note: "green bucket cubo",
  },
  {
    slug: "catalina",
    word: "Catalina",
    lessonNumber: 22,
    outDir: "leccion-19-c",
    source: "public/cartilla/images/source/c/c-page-52.jpg",
    sourceFlipchartPage: "c-page-52.jpg",
    box: { left: 1280, top: 2080, width: 720, height: 660 },
    note: "hen Catalina",
  },

  // ── L23 Y — y-page-55.jpg ─────────────────────────────────────────────
  {
    slug: "yate",
    word: "yate",
    lessonNumber: 23,
    outDir: "leccion-22-y",
    source: "public/cartilla/images/source/y/y-page-55.jpg",
    sourceFlipchartPage: "y-page-55.jpg",
    box: { left: 120, top: 1320, width: 660, height: 520 },
    note: "yacht (re-verify)",
  },
  {
    slug: "yema",
    word: "yema",
    lessonNumber: 23,
    outDir: "leccion-22-y",
    source: "public/cartilla/images/source/y/y-page-55.jpg",
    sourceFlipchartPage: "y-page-55.jpg",
    box: { left: 900, top: 1520, width: 560, height: 300 },
    note: "fried egg yolk",
  },
  {
    slug: "yayita",
    word: "Yayita",
    lessonNumber: 23,
    outDir: "leccion-22-y",
    source: "public/cartilla/images/source/y/y-page-55.jpg",
    sourceFlipchartPage: "y-page-55.jpg",
    box: { left: 1560, top: 1260, width: 660, height: 560 },
    note: "blue octopus-like Yayita character",
  },
  {
    slug: "mayuscula",
    word: "mayúscula",
    lessonNumber: 23,
    outDir: "leccion-22-y",
    source: "public/cartilla/images/source/y/y-page-55.jpg",
    sourceFlipchartPage: "y-page-55.jpg",
    box: { left: 220, top: 2100, width: 780, height: 640 },
    note: "decorated capital Y with girl",
  },
  {
    slug: "yoyo",
    word: "yoyo",
    lessonNumber: 23,
    outDir: "leccion-22-y",
    source: "public/cartilla/images/source/y/y-page-55.jpg",
    sourceFlipchartPage: "y-page-55.jpg",
    box: { left: 1260, top: 2100, width: 700, height: 600 },
    note: "yo-yo toy",
  },

  // ── L24 Z — z-page-58.jpg ─────────────────────────────────────────────
  {
    slug: "zapato",
    word: "zapato",
    lessonNumber: 24,
    outDir: "leccion-23-z",
    source: "public/cartilla/images/source/z/z-page-58.jpg",
    sourceFlipchartPage: "z-page-58.jpg",
    box: { left: 120, top: 1320, width: 660, height: 520 },
    note: "purple shoe (re-verify)",
  },
  {
    slug: "zigzag",
    word: "zig-zag",
    lessonNumber: 24,
    outDir: "leccion-23-z",
    source: "public/cartilla/images/source/z/z-page-58.jpg",
    sourceFlipchartPage: "z-page-58.jpg",
    box: { left: 900, top: 1360, width: 560, height: 440 },
    note: "zigzag chevron graphic",
  },
  {
    slug: "zorro",
    word: "zorro",
    lessonNumber: 24,
    outDir: "leccion-23-z",
    source: "public/cartilla/images/source/z/z-page-58.jpg",
    sourceFlipchartPage: "z-page-58.jpg",
    box: { left: 1540, top: 1320, width: 680, height: 540 },
    note: "fox (re-verify)",
  },
  {
    slug: "zepelin",
    word: "zepelín",
    lessonNumber: 24,
    outDir: "leccion-23-z",
    source: "public/cartilla/images/source/z/z-page-58.jpg",
    sourceFlipchartPage: "z-page-58.jpg",
    box: { left: 240, top: 2100, width: 760, height: 600 },
    note: "zeppelin airship",
  },
  {
    slug: "zulema",
    word: "Zulema",
    lessonNumber: 24,
    outDir: "leccion-23-z",
    source: "public/cartilla/images/source/z/z-page-58.jpg",
    sourceFlipchartPage: "z-page-58.jpg",
    box: { left: 1240, top: 2080, width: 780, height: 700 },
    note: "girl Zulema with pinwheel",
  },
];

async function cropOne(spec) {
  const srcPath = path.join(ROOT, spec.source);
  if (!fs.existsSync(srcPath)) throw new Error("missing source " + spec.source);
  const meta = await sharp(srcPath).metadata();
  const box = { ...spec.box };
  // clamp
  box.left = Math.max(0, Math.min(box.left, meta.width - 2));
  box.top = Math.max(0, Math.min(box.top, meta.height - 2));
  box.width = Math.min(box.width, meta.width - box.left);
  box.height = Math.min(box.height, meta.height - box.top);

  if (PROBE) {
    fs.mkdirSync(outProbe, { recursive: true });
    const probePath = path.join(outProbe, `${spec.slug}.jpg`);
    await sharp(srcPath).extract(box).resize({ width: 400 }).jpeg({ quality: 85 }).toFile(probePath);
    return { slug: spec.slug, probe: probePath, box, page: `${meta.width}x${meta.height}` };
  }

  const outDir = path.join(ROOT, "public/cartilla/art/faithful", spec.outDir);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${spec.slug}.webp`);
  await sharp(srcPath).extract(box).webp({ quality: 92 }).toFile(outPath);
  const outMeta = await sharp(outPath).metadata();
  const bytes = fs.statSync(outPath).size;
  return {
    slug: spec.slug,
    word: spec.word,
    lessonNumber: spec.lessonNumber,
    pageNumber: null,
    src: `/cartilla/art/faithful/${spec.outDir}/${spec.slug}.webp`,
    sourceFlipchartPage: spec.sourceFlipchartPage,
    cropBox: [box.left, box.top, box.width, box.height],
    outputPixels: `${outMeta.width}x${outMeta.height}`,
    bytes,
    sourceNote: spec.note,
  };
}

async function main() {
  console.log(PROBE ? "PROBE mode — writing JPEG previews" : "CROP mode — writing faithful webp");
  const entries = [];
  for (const spec of CROPS) {
    const e = await cropOne(spec);
    entries.push(e);
    console.log("OK", e.slug, e.outputPixels || e.box, e.bytes || "");
  }
  const reportPath = path.join(ROOT, "generated/agent2-crop-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ mode: PROBE ? "probe" : "crop", entries }, null, 2));
  console.log("Wrote", reportPath, entries.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
