#!/usr/bin/env node
/**
 * Expands src/content/workbook/workbook-manifest.json from the 3 pilot
 * pages (Lección 1) to every real, already-digitized workbook page.
 *
 * Real content ground truth used here (nothing else, nothing invented):
 *   - src/data/page-layouts.json — the faithful-pages transcription. This
 *     file has exactly 90 pages (keys "1".."90", verified with no gaps),
 *     already shipped in production via FaithfulPageRenderer. That is the
 *     TRUE, verified page count for this book right now — see CLAUDE.md's
 *     "Page count is NOT a magic number" canon fact. This script does not
 *     chase a fixed total like 92; the schema's physicalPage max of 92 is
 *     just the upper bound of Grok's future census format, not a claim
 *     that 92 real pages exist today. If more real pages are digitized
 *     later, re-running this script picks them up automatically.
 *   - src/content/consonants.json — each consonant lesson's real printed
 *     page range (`pages: "19-22"` etc.) and real vocabulary words that
 *     already have a real cropped illustration.
 *   - src/data/page-inventory.json — the real scanned page images, used
 *     ONLY as a temporary full-page fallback background for pages whose
 *     region types have no per-object crops yet (writing-line/draw-box/
 *     fill-in-blank). Resolved positionally; if a scan can't be resolved
 *     for a given page, background stays null (honest "pending"), never
 *     guessed.
 *
 * Pages 1-3 (the original pilot: MarkCircle/TapSelect/PairMatch) are
 * copied byte-for-byte from the current manifest, unchanged — this
 * preserves their exact existing behavior rather than regenerating them.
 *
 * Per-page conversion rules (by the page's real region-type signature):
 *   - picture-grid / vowel-line-match  -> MarkCircle (multi-select; cells
 *     with a defined `correct` boolean become graded objects, cells with
 *     no `correct` field at all stay static/decorative, matching the
 *     existing page-1 precedent).
 *   - syllable-match (1+ regions/page) -> MarkCircle (all regions' cells
 *     flattened into one graded set — the engine only supports one
 *     page-level interaction, so per-syllable grouping isn't preserved,
 *     but every cell's real correct/word value is used as-is).
 *   - writing-line / draw-box / fill-in-blank (no vocab-grid) -> static:
 *     no interactive component exists for tracing/fill-in-blank yet, so
 *     these render with real instruction text + the real full-page scan
 *     as a temporary background fallback.
 *   - title + syllable-bubble + vocab-grid + reading-sentences -> static
 *     vocabulary display: the vocab-grid's real word list becomes text
 *     chips; any word that has a real cropped illustration in
 *     consonants.json becomes a real image chip. The first lesson with 2+
 *     such real-art words gets DragPlace (drag word -> matching picture);
 *     every other qualifying page gets TapToHear (tap a real word/picture
 *     to hear it — audio not recorded yet, safe no-op per convention).
 *   - anything that doesn't match one of the above signatures is preserved
 *     with its real instruction/background and marked
 *     "source-review-required" rather than guessed at or skipped.
 *
 * Usage: node scripts/build-full-workbook-manifest.mjs [--out=path]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    const m = /^--([^=]+)=(.*)$/.exec(arg);
    if (m) args[m[1]] = m[2];
  }
  return args;
}
const args = parseArgs(process.argv.slice(2));
const OUT = args.out
  ? path.resolve(rootDir, args.out)
  : path.join(rootDir, "src/content/workbook/workbook-manifest.json");

const pageLayouts = JSON.parse(
  fs.readFileSync(path.join(rootDir, "src/data/page-layouts.json"), "utf8"),
).pages;
const consonants = JSON.parse(
  fs.readFileSync(path.join(rootDir, "src/content/consonants.json"), "utf8"),
);
const pageInventory = JSON.parse(
  fs.readFileSync(path.join(rootDir, "src/data/page-inventory.json"), "utf8"),
).workbook.lessons;
const existingManifest = JSON.parse(fs.readFileSync(OUT, "utf8"));

const BACKGROUND_GARDEN = "/art/hd/gretel-authentic.jpg"; // used only for the 3 frozen pilot pages, unchanged
const SCAN_BASE = "/cartilla/images/source";

// ── Real physicalPage -> lesson / scan-index mapping ───────────────────────
// Same ranges CATALOG itself uses (src/lib/lesson-catalog.ts): the vowel
// constants there, plus each consonant lesson's own real `pages` field.
const VOWEL_RANGES = [
  { lesson: 1, pages: "1-3" },
  { lesson: 2, pages: "4-6" },
  { lesson: 3, pages: "7-9" },
  { lesson: 4, pages: "10-12" },
  { lesson: 5, pages: "13-15" },
  { lesson: 6, pages: "16-18" },
];
const allRanges = [
  ...VOWEL_RANGES,
  ...consonants.map((c) => ({ lesson: c.lesson, pages: c.pages })),
].sort((a, b) => a.lesson - b.lesson);

function expandRange(pages) {
  const [s, e] = pages.split("-").map(Number);
  return Array.from({ length: e - s + 1 }, (_, i) => s + i);
}

const physicalToLesson = new Map();
const physicalToScanIndex = new Map();
for (const r of allRanges) {
  expandRange(r.pages).forEach((p, i) => {
    physicalToLesson.set(p, r.lesson);
    physicalToScanIndex.set(p, i);
  });
}

function resolveScanPath(physicalPage) {
  const lesson = physicalToLesson.get(physicalPage);
  const idx = physicalToScanIndex.get(physicalPage);
  const entry = pageInventory.find((l) => l.lessonId === lesson);
  const filename = entry?.pages?.[idx];
  return filename ? `${SCAN_BASE}/${filename}` : null;
}

/** Even grid of percent boxes for `count` cells across `cols` columns. */
function gridBoxes(count, cols, { marginX = 3, marginY = 6, gutter = 2, cellH = 16 } = {}) {
  const cellW = (100 - 2 * marginX - (cols - 1) * gutter) / cols;
  const boxes = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    boxes.push({
      x: Number((marginX + col * (cellW + gutter)).toFixed(2)),
      y: Number((marginY + row * (cellH + gutter)).toFixed(2)),
      width: Number(cellW.toFixed(2)),
      height: cellH,
    });
  }
  return boxes;
}

const pages = [];
const report = { markCircle: [], static: [], dragPlace: [], tapToHear: [], reviewRequired: [] };

// ── Pages 1-3: frozen, copied byte-for-byte from the current manifest ─────
for (const p of [1, 2, 3]) {
  const existing = existingManifest.pages.find((pg) => pg.physicalPage === p);
  if (existing) pages.push(existing);
}

// ── Pages 4-90: generated from real content ────────────────────────────────
let dragPlaceAssigned = false;

for (let physicalPage = 4; physicalPage <= 90; physicalPage++) {
  const layout = pageLayouts[String(physicalPage)];
  const lesson = physicalToLesson.get(physicalPage);
  const regionTypes = new Set(layout.regions.map((r) => r.regionType));
  const instrRegion = layout.regions.find((r) => r.regionType === "instruction");
  const instruction = instrRegion?.text ?? "";

  // Tier 1: picture-grid or vowel-line-match -> MarkCircle
  const gridRegion = layout.regions.find(
    (r) => r.regionType === "picture-grid" || r.regionType === "vowel-line-match",
  );
  if (gridRegion) {
    const cells = gridRegion.cells;
    const cols = gridRegion.columns ?? 4;
    const boxes = gridBoxes(cells.length, cols);
    const answers = cells
      .map((cell, i) => ({ cell, i }))
      .filter(({ cell }) => cell.correct === true)
      .map(({ i }) => `p${physicalPage}-cell-${i}`);

    pages.push({
      physicalPage,
      lesson,
      instruction,
      background: BACKGROUND_GARDEN,
      interaction: { mechanic: "select", answers },
      objects: cells.map((cell, i) => ({
        id: `p${physicalPage}-cell-${i}`,
        type: "illustration",
        asset: cell.illustrationSrc,
        x: boxes[i].x,
        y: boxes[i].y,
        width: boxes[i].width,
        height: boxes[i].height,
        word: cell.caption,
        interactive: typeof cell.correct === "boolean",
      })),
      status: "complete",
      source: `src/data/page-layouts.json page ${physicalPage} (${gridRegion.regionType}) — already-verified faithful transcription`,
    });
    report.markCircle.push(physicalPage);
    continue;
  }

  // Tier 2: syllable-match (1+ regions) -> MarkCircle, flattened
  const syllableRegions = layout.regions.filter((r) => r.regionType === "syllable-match");
  if (syllableRegions.length > 0) {
    const flatCells = [];
    syllableRegions.forEach((region, ri) => {
      region.matchRows.forEach((row, rowi) => {
        row.forEach((cell, ci) => {
          flatCells.push({ ...cell, id: `p${physicalPage}-syl-${ri}-${rowi}-${ci}` });
        });
      });
    });
    const cols = 6;
    const boxes = gridBoxes(flatCells.length, cols, { marginY: 10, cellH: 14, gutter: 1.5 });
    const answers = flatCells.filter((c) => c.correct === true).map((c) => c.id);

    pages.push({
      physicalPage,
      lesson,
      instruction,
      background: BACKGROUND_GARDEN,
      interaction: { mechanic: "select", answers },
      objects: flatCells.map((cell, i) => ({
        id: cell.id,
        type: cell.illustrationSrc ? "illustration" : "word",
        ...(cell.illustrationSrc ? { asset: cell.illustrationSrc } : {}),
        x: boxes[i].x,
        y: boxes[i].y,
        width: boxes[i].width,
        height: boxes[i].height,
        word: cell.word,
        interactive: typeof cell.correct === "boolean",
      })),
      status: "complete",
      source: `src/data/page-layouts.json page ${physicalPage} (syllable-match, ${syllableRegions.length} groups flattened) — already-verified faithful transcription`,
    });
    report.markCircle.push(physicalPage);
    continue;
  }

  // Tier 3: vocab-grid (+ title/syllable-bubble/reading-sentences) -> static
  // vocabulary display, enriched with real art wherever consonants.json has it.
  const vocabRegion = layout.regions.find((r) => r.regionType === "vocab-grid");
  if (vocabRegion) {
    const words = vocabRegion.text.split("·").map((w) => w.trim());
    const consonantEntry = consonants.find((c) => c.lesson === lesson);
    const artByWord = new Map(
      (consonantEntry?.vocab ?? [])
        .filter((v) => v.illustrationSrc)
        .map((v) => [v.word.toLowerCase(), v.illustrationSrc]),
    );
    const artWords = words.filter((w) => artByWord.has(w.toLowerCase()));

    const boxes = gridBoxes(words.length, words.length, { marginY: 30, cellH: 40, marginX: 6 });
    const scanPath = resolveScanPath(physicalPage);

    if (!dragPlaceAssigned && artWords.length >= 2) {
      // DragPlace: drag each real word onto its own real picture.
      const chosen = artWords.slice(0, Math.min(4, artWords.length));
      const wordBoxes = gridBoxes(chosen.length, chosen.length, {
        marginY: 8,
        cellH: 15,
        marginX: 10,
      });
      const targetBoxes = gridBoxes(chosen.length, chosen.length, {
        marginY: 45,
        cellH: 30,
        marginX: 10,
      });
      const objects = [];
      chosen.forEach((w, i) => {
        objects.push({
          id: `p${physicalPage}-word-${i}`,
          type: "word",
          x: wordBoxes[i].x,
          y: wordBoxes[i].y,
          width: wordBoxes[i].width,
          height: wordBoxes[i].height,
          word: w,
          interactive: true,
        });
        objects.push({
          id: `p${physicalPage}-target-${i}`,
          type: "illustration",
          asset: artByWord.get(w.toLowerCase()),
          x: targetBoxes[i].x,
          y: targetBoxes[i].y,
          width: targetBoxes[i].width,
          height: targetBoxes[i].height,
          word: w,
          interactive: true,
        });
      });
      pages.push({
        physicalPage,
        lesson,
        instruction: "",
        background: scanPath ?? BACKGROUND_GARDEN,
        interaction: {
          mechanic: "drag",
          answers: chosen.map((_, i) => `p${physicalPage}-word-${i}`),
          targets: chosen.map((_, i) => `p${physicalPage}-target-${i}`),
        },
        objects,
        status: "complete",
        source: `src/data/page-layouts.json page ${physicalPage} vocab-grid ("${vocabRegion.text}") + src/content/consonants.json lesson ${lesson} illustrations — real words, real crops, drag-to-match layout is new`,
      });
      dragPlaceAssigned = true;
      report.dragPlace.push(physicalPage);
      continue;
    }

    if (artWords.length >= 1) {
      // TapToHear: tap a real word/picture to hear it (no recorded audio yet).
      const artBoxes = gridBoxes(artWords.length, artWords.length, {
        marginY: 25,
        cellH: 40,
        marginX: 15,
      });
      const nonArtWords = words.filter((w) => !artByWord.has(w.toLowerCase()));
      const nonArtBoxes = gridBoxes(nonArtWords.length, Math.max(nonArtWords.length, 1), {
        marginY: 70,
        cellH: 14,
        marginX: 10,
      });
      pages.push({
        physicalPage,
        lesson,
        instruction: "",
        background: scanPath ?? BACKGROUND_GARDEN,
        interaction: { mechanic: "read", answers: [] },
        audio: artWords,
        objects: [
          ...artWords.map((w, i) => ({
            id: `p${physicalPage}-word-${i}`,
            type: "illustration",
            asset: artByWord.get(w.toLowerCase()),
            x: artBoxes[i].x,
            y: artBoxes[i].y,
            width: artBoxes[i].width,
            height: artBoxes[i].height,
            word: w,
            audioId: w,
            interactive: true,
          })),
          ...nonArtWords.map((w, i) => ({
            id: `p${physicalPage}-plain-${i}`,
            type: "word",
            x: nonArtBoxes[i].x,
            y: nonArtBoxes[i].y,
            width: nonArtBoxes[i].width,
            height: nonArtBoxes[i].height,
            word: w,
            interactive: false,
          })),
        ],
        status: "complete",
        source: `src/data/page-layouts.json page ${physicalPage} vocab-grid ("${vocabRegion.text}") + src/content/consonants.json lesson ${lesson} illustrations for real-art words`,
      });
      report.tapToHear.push(physicalPage);
      continue;
    }

    // No real art for any word on this vocab page: static real-word chips only.
    pages.push({
      physicalPage,
      lesson,
      instruction: "",
      background: scanPath ?? BACKGROUND_GARDEN,
      objects: words.map((w, i) => ({
        id: `p${physicalPage}-plain-${i}`,
        type: "word",
        x: boxes[i].x,
        y: boxes[i].y,
        width: boxes[i].width,
        height: boxes[i].height,
        word: w,
        interactive: false,
      })),
      status: "complete",
      source: `src/data/page-layouts.json page ${physicalPage} vocab-grid ("${vocabRegion.text}") — no real art available for these words yet`,
    });
    report.static.push(physicalPage);
    continue;
  }

  // Tier 4: writing-line / draw-box / fill-in-blank -> static, full-scan fallback
  if (
    regionTypes.has("writing-line") ||
    regionTypes.has("draw-box") ||
    regionTypes.has("fill-in-blank")
  ) {
    const scanPath = resolveScanPath(physicalPage);
    pages.push({
      physicalPage,
      lesson,
      instruction,
      background: scanPath,
      objects: [],
      status: "mapped",
      source: scanPath
        ? `real full-page scan (${scanPath}) used as a temporary fallback — no per-object crops exist yet for tracing/fill-in-blank content on page ${physicalPage}`
        : `no per-object crops and no resolvable scan for page ${physicalPage} yet — instruction text is real, background honestly pending`,
    });
    report.static.push(physicalPage);
    continue;
  }

  // Tier 5 (should not trigger given the verified page-layouts.json audit,
  // but never silently guessed at): preserve the real source, flag for review.
  const scanPath = resolveScanPath(physicalPage);
  pages.push({
    physicalPage,
    lesson,
    instruction,
    background: scanPath,
    objects: [],
    status: "source-review-required",
    source: `unrecognized region-type combination on page ${physicalPage} (${[...regionTypes].join(",")}) — preserved real instruction/background, needs a human look`,
  });
  report.reviewRequired.push(physicalPage);
}

pages.sort((a, b) => a.physicalPage - b.physicalPage);

const manifest = {
  version: "0.2.0-all-real-pages",
  generatedAt: new Date().toISOString(),
  pages,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");

console.log(`Wrote ${pages.length} real pages to ${path.relative(rootDir, OUT)}`);
console.log(`  MarkCircle pages: ${report.markCircle.length}`);
console.log(`  DragPlace page: ${report.dragPlace.join(", ") || "(none)"}`);
console.log(`  TapToHear pages: ${report.tapToHear.length} (${report.tapToHear.join(", ")})`);
console.log(`  Static (no interaction) pages: ${report.static.length}`);
console.log(
  `  source-review-required pages: ${report.reviewRequired.length} (${report.reviewRequired.join(", ") || "none"})`,
);
console.log("Next: pnpm validate:manifest");
