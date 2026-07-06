/**
 * Lane 1 crops: L8 papá, L9 sapo+sopa, L11 dado.
 * Run: node scripts/crop-lane1-l8-l9-l11.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CROPS = [
  {
    slug: "papa",
    word: "papá",
    lessonNumber: 8,
    outDir: "leccion-8-p",
    source: "public/cartilla/images/source/p/p-page-11.jpg",
    sourceFlipchartPage: "p-page-11.jpg",
    rotate: 0,
    box: { left: 60, top: 1180, width: 780, height: 700 },
  },
  {
    slug: "sapo",
    word: "sapo",
    lessonNumber: 9,
    outDir: "leccion-9-s",
    source: "public/cartilla/images/source/ss/ss-page-14.jpg",
    sourceFlipchartPage: "ss-page-14.jpg",
    rotate: 0,
    box: { left: 1540, top: 1180, width: 780, height: 700 },
  },
  {
    slug: "sopa",
    word: "sopa",
    lessonNumber: 9,
    outDir: "leccion-9-s",
    source: "public/cartilla/images/source/ss/ss-page-14.jpg",
    sourceFlipchartPage: "ss-page-14.jpg",
    rotate: 0,
    box: { left: 820, top: 1180, width: 780, height: 700 },
  },
  {
    slug: "dado",
    word: "dado",
    lessonNumber: 11,
    outDir: "leccion-11-d",
    source: "public/cartilla/images/source/d/d-page-19.jpg",
    sourceFlipchartPage: "d-page-19.jpg",
    rotate: 0,
    box: { left: 820, top: 1180, width: 780, height: 700 },
    note: "source label is 'dados' (dice pair)",
  },
];

async function cropOne(spec) {
  const outDir = path.join(ROOT, "public/cartilla/art/faithful", spec.outDir);
  fs.mkdirSync(outDir, { recursive: true });
  let pipeline = sharp(path.join(ROOT, spec.source));
  if (spec.rotate === 180) pipeline = pipeline.rotate(180);
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
    ...(spec.note ? { sourceNote: spec.note } : {}),
  };
}

async function main() {
  const manifestPath = path.join(ROOT, "public/cartilla/art/faithful/manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const spec of CROPS) {
    const entry = await cropOne(spec);
    const idx = manifest.findIndex((e) => e.slug === entry.slug);
    if (idx >= 0) manifest[idx] = entry;
    else manifest.push(entry);
    console.log(`OK ${entry.slug} → ${entry.src}`);
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});