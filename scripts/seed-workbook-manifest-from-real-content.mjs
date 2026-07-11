#!/usr/bin/env node
/**
 * Seeds src/content/workbook/workbook-manifest.json with a handful of REAL
 * pages so the living-workbook-page engine has something genuine to render
 * before Grok's 92-page census exists. This is NOT that census — it's a
 * mechanical conversion of content that is already real, already cropped,
 * and already shipped elsewhere in this repo:
 *
 *   - src/data/page-layouts.json — the faithful-pages transcription
 *     (physical pages 1, 2, 3 of Lección 1: picture-grid, vowel-pick-one,
 *     vowel-match-all), already rendered in production by
 *     FaithfulPageRenderer.
 *   - src/content/consonants.json — Lección 7 (M) vocabulary words that
 *     already have real cropped illustrations.
 *
 * Every instruction string, word, and asset path below is copied verbatim
 * from one of those two files — nothing is invented. Where a single
 * page-level interaction can't represent the full printed page (see the
 * per-page notes below), a real, clearly-documented subset is used instead
 * of forcing a mismatched mechanic.
 *
 * When Grok's real census lands, `pnpm build:manifest` regenerates
 * workbook-manifest.json from those CSVs and supersedes this seed entirely
 * — this script is a bridge, not a permanent data source.
 *
 * Usage: node scripts/seed-workbook-manifest-from-real-content.mjs [--out=path]
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

const BACKGROUND = "/art/hd/gretel-authentic.jpg"; // real book painting, already used as the engine's garden background elsewhere

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

// ── Physical page 1 (Lección 1) — picture-grid → MarkCircle ───────────────
// Real data: 20 cells, "correct" flag present on 16 of them (4 have no
// correct field in the source at all — genuinely undetermined, so they stay
// static/decorative rather than guessing a grading value for them).
{
  const region = pageLayouts["1"].regions.find((r) => r.regionType === "picture-grid");
  const instr = pageLayouts["1"].regions.find((r) => r.regionType === "instruction");
  const boxes = gridBoxes(region.cells.length, region.columns ?? 4);
  const answers = region.cells
    .map((cell, i) => ({ cell, i }))
    .filter(({ cell }) => cell.correct === true)
    .map(({ i }) => `p1-cell-${i}`);

  pages.push({
    physicalPage: 1,
    lesson: 1,
    instruction: instr?.text ?? "",
    background: BACKGROUND,
    interaction: { mechanic: "select", answers },
    objects: region.cells.map((cell, i) => ({
      id: `p1-cell-${i}`,
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
    source:
      "src/data/page-layouts.json page 1 (Lección 1) — already-verified faithful transcription",
  });
}

// ── Physical page 2 (Lección 1) — vowel-pick-one → TapSelect ───────────────
// Real data has 4 independent rows (a/e/i/o), each "pick the one correct
// picture" — a shape the engine's single page-level interaction can't
// represent as 4 separate graded groups. Using row "a" (3 cells, 1 correct)
// as the graded interaction; rows e/i/o render as real, visible, but
// non-graded static content, which is an honest documented subset, not an
// invented one.
{
  const region = pageLayouts["2"].regions.find((r) => r.regionType === "vowel-pick-one");
  const instr = pageLayouts["2"].regions.find((r) => r.regionType === "instruction");
  const rowA = region.vowelRows.find((r) => r.letter === "a");
  const otherRows = region.vowelRows.filter((r) => r.letter !== "a");

  const objects = [];
  const rowABoxes = gridBoxes(rowA.cells.length, 3, { marginY: 8, cellH: 20 });
  rowA.cells.forEach((cell, i) => {
    objects.push({
      id: `p2-a-${i}`,
      type: "illustration",
      asset: cell.illustrationSrc,
      x: rowABoxes[i].x,
      y: rowABoxes[i].y,
      width: rowABoxes[i].width,
      height: rowABoxes[i].height,
      word: cell.caption,
      interactive: true,
    });
  });
  const otherCells = otherRows.flatMap((row) => row.cells);
  const otherBoxes = gridBoxes(otherCells.length, 3, { marginY: 34, cellH: 18 });
  otherCells.forEach((cell, i) => {
    objects.push({
      id: `p2-other-${i}`,
      type: "illustration",
      asset: cell.illustrationSrc,
      x: otherBoxes[i].x,
      y: otherBoxes[i].y,
      width: otherBoxes[i].width,
      height: otherBoxes[i].height,
      word: cell.caption,
      interactive: false,
    });
  });

  const correctIndex = rowA.cells.findIndex((c) => c.correct === true);
  pages.push({
    physicalPage: 2,
    lesson: 1,
    instruction: instr?.text ?? "",
    background: BACKGROUND,
    interaction: { mechanic: "select", answers: [`p2-a-${correctIndex}`] },
    objects,
    status: "complete",
    source:
      "src/data/page-layouts.json page 2 (Lección 1), row 'a' only — already-verified faithful transcription (rows e/i/o shown as static real content, not part of this page's single graded interaction)",
  });
}

// ── Physical page 3 (Lección 1) — vowel-match-all → PairMatch ──────────────
// Real data is exactly 5 distinct 1:1 pairs (vowel letter <-> picture) —
// a natural, unmodified fit for PairMatch.
{
  const region = pageLayouts["3"].regions.find((r) => r.regionType === "vowel-match-all");
  const instr = pageLayouts["3"].regions.find((r) => r.regionType === "instruction");
  const leftBoxes = gridBoxes(region.vowelPairs.length, 1, { marginX: 10, cellH: 14, gutter: 3 });
  const rightBoxes = gridBoxes(region.vowelPairs.length, 1, { marginX: 55, cellH: 14, gutter: 3 });

  const objects = [];
  region.vowelPairs.forEach((pair, i) => {
    objects.push({
      id: `p3-letter-${pair.letter}`,
      type: "letter",
      x: leftBoxes[i].x,
      y: leftBoxes[i].y,
      width: 15,
      height: leftBoxes[i].height,
      word: pair.letter.toUpperCase(),
      interactive: true,
    });
    objects.push({
      id: `p3-pic-${pair.letter}`,
      type: "illustration",
      asset: pair.illustrationSrc,
      x: rightBoxes[i].x,
      y: rightBoxes[i].y,
      width: 30,
      height: rightBoxes[i].height,
      word: pair.caption,
      interactive: true,
    });
  });

  pages.push({
    physicalPage: 3,
    lesson: 1,
    instruction: instr?.text ?? "",
    background: BACKGROUND,
    interaction: {
      mechanic: "match",
      answers: region.vowelPairs.map((p) => `p3-letter-${p.letter}`),
      targets: region.vowelPairs.map((p) => `p3-pic-${p.letter}`),
    },
    objects,
    status: "complete",
    source:
      "src/data/page-layouts.json page 3 (Lección 1) — already-verified faithful transcription",
  });
}

// ── Derived vocab-practice pages (Lección 7 / M) ───────────────────────────
// Not a 1:1 scan of a printed page — these compose src/content/consonants.json's
// already-real word + illustration pairs (mamá/mono, the only two lesson-7
// vocab entries with a real crop) into new practice exercises demonstrating
// DragPlace and TapToHear with genuine content. No new art, no invented
// words; only the on-screen layout is new.
{
  const m = consonants.find((c) => c.letter === "m");
  const realVocab = m.vocab.filter((v) => v.illustrationSrc);

  // DragPlace: drag each word label onto its own matching picture.
  const dragBoxes = gridBoxes(realVocab.length, realVocab.length, {
    marginY: 45,
    cellH: 30,
    marginX: 10,
  });
  const wordBoxes = gridBoxes(realVocab.length, realVocab.length, {
    marginY: 8,
    cellH: 15,
    marginX: 10,
  });
  const dragObjects = [];
  realVocab.forEach((v, i) => {
    dragObjects.push({
      id: `p91-target-${i}`,
      type: "illustration",
      asset: v.illustrationSrc,
      x: dragBoxes[i].x,
      y: dragBoxes[i].y,
      width: dragBoxes[i].width,
      height: dragBoxes[i].height,
      word: v.word,
      interactive: true,
    });
    dragObjects.push({
      id: `p91-word-${i}`,
      type: "word",
      x: wordBoxes[i].x,
      y: wordBoxes[i].y,
      width: wordBoxes[i].width,
      height: wordBoxes[i].height,
      word: v.word,
      interactive: true,
    });
  });

  pages.push({
    physicalPage: 91,
    lesson: 7,
    instruction: "",
    background: BACKGROUND,
    interaction: {
      mechanic: "drag",
      answers: realVocab.map((_, i) => `p91-word-${i}`),
      targets: realVocab.map((_, i) => `p91-target-${i}`),
    },
    objects: dragObjects,
    status: "implementation-ready",
    source:
      "derived vocab-practice exercise built from src/content/consonants.json lesson 7 (M) vocab (mamá, mono) — not a 1:1 scan of a printed page",
  });

  // TapToHear: tap each real word/picture to hear it (audio not recorded
  // yet — safe no-op src, per the project's established audio convention).
  const hearBoxes = gridBoxes(realVocab.length, realVocab.length, {
    marginY: 25,
    cellH: 40,
    marginX: 15,
  });
  pages.push({
    physicalPage: 92,
    lesson: 7,
    instruction: "",
    background: BACKGROUND,
    interaction: { mechanic: "read", answers: [] },
    audio: realVocab.map((v) => v.word),
    objects: realVocab.map((v, i) => ({
      id: `p92-word-${i}`,
      type: "illustration",
      asset: v.illustrationSrc,
      x: hearBoxes[i].x,
      y: hearBoxes[i].y,
      width: hearBoxes[i].width,
      height: hearBoxes[i].height,
      word: v.word,
      audioId: v.word,
      interactive: true,
    })),
    status: "implementation-ready",
    source:
      "derived vocab-practice exercise built from src/content/consonants.json lesson 7 (M) vocab (mamá, mono) — not a 1:1 scan of a printed page; audio not yet recorded (safe no-op)",
  });
}

const manifest = {
  version: "0.1.0-seeded-from-real-content",
  generatedAt: new Date().toISOString(),
  pages,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Wrote ${pages.length} real pages to ${path.relative(rootDir, OUT)}`);
console.log("Next: pnpm validate:manifest");
