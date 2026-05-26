#!/usr/bin/env node
// Walks public/cartilla/art/polished/ and writes manifest.json mapping
// each lesson number to its polished page assets. Reads lesson page ranges
// from src/content/consonants.json and hard-codes the intro + vowel ranges
// (kept in sync with src/lib/lesson-catalog.ts).
//
// Exits 0 on any failure.

import fs from "node:fs";
import path from "node:path";

const POLISHED_DIR = "public/cartilla/art/polished";
const MANIFEST_PATH = "public/cartilla/art/manifest.json";
const CONSONANTS_PATH = "src/content/consonants.json";

if (!fs.existsSync(POLISHED_DIR)) {
  console.log("[manifest] no polished dir, skipping");
  process.exit(0);
}

const files = fs
  .readdirSync(POLISHED_DIR)
  .filter((f) => /^page-\d+\.webp$/.test(f))
  .sort();

const pageMap = new Map();
for (const f of files) {
  const m = f.match(/page-(\d+)\.webp/);
  if (!m) continue;
  pageMap.set(parseInt(m[1], 10), "/cartilla/art/polished/" + f);
}

function parseRange(r) {
  if (!r) return [];
  const m = String(r).match(/^(\d+)(?:-(\d+))?$/);
  if (!m) return [];
  const a = parseInt(m[1], 10);
  const b = m[2] ? parseInt(m[2], 10) : a;
  const out = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

// Intro + vowels (mirrors VOWEL_PAGES in lesson-catalog.ts).
const LESSON_RANGES = {
  1: "1-3",
  2: "4-6",
  3: "7-9",
  4: "10-12",
  5: "13-15",
  6: "16-18",
};

// Consonants (read authoritative ranges from the JSON content file).
try {
  const raw = fs.readFileSync(CONSONANTS_PATH, "utf8");
  const cons = JSON.parse(raw);
  if (Array.isArray(cons)) {
    for (const c of cons) {
      if (
        c &&
        typeof c.lesson === "number" &&
        typeof c.pages === "string"
      ) {
        LESSON_RANGES[c.lesson] = c.pages;
      }
    }
  }
} catch (e) {
  console.log("[manifest] could not read consonants.json:", e.message);
}

const lessons = {};
for (const [lessonN, range] of Object.entries(LESSON_RANGES)) {
  const pages = parseRange(range)
    .map((p) => pageMap.get(p))
    .filter(Boolean);
  if (pages.length === 0) continue;
  lessons[lessonN] = {
    pageThumb: pages[0],
    // No bounding-box crop available yet, so the lesson's first page
    // doubles as the character thumbnail. Lane B can replace once
    // crop detection ships.
    character: pages[0],
    pages,
  };
}

const manifest = {
  builtAt: new Date().toISOString(),
  cover: pageMap.get(1) ?? null,
  lessons,
};

fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log(
  "[manifest] wrote",
  MANIFEST_PATH,
  "with",
  Object.keys(lessons).length,
  "lessons,",
  files.length,
  "pages",
);
process.exit(0);
