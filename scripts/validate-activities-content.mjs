#!/usr/bin/env node
// validate-content.mjs — keeps the content sources of truth in lockstep.
// Runs in CI / prebuild. Exits non-zero on drift so a bad commit cannot ship.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const errors = [];
const warnings = [];

function read(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) {
    errors.push(`Missing required file: ${rel}`);
    return null;
  }
  return fs.readFileSync(p, "utf8");
}

// 1. page-bindings.json must have 90 entries keyed "1".."90"
const bindingsRaw = read("src/content/page-bindings.json");
if (bindingsRaw) {
  try {
    const bindings = JSON.parse(bindingsRaw);
    const keys = Object.keys(bindings);
    if (keys.length !== 90)
      errors.push(`page-bindings.json has ${keys.length} entries, expected 90`);
    for (let p = 1; p <= 90; p++) {
      if (!bindings[String(p)]) errors.push(`page-bindings.json missing page ${p}`);
    }
  } catch (e) {
    errors.push(`page-bindings.json invalid JSON: ${e.message}`);
  }
}

// 2. lesson-meta.ts must contain 24 LESSONS entries and total pages 90
const metaRaw = read("src/content/lesson-meta.ts");
if (metaRaw) {
  const pageRangeMatches = [...metaRaw.matchAll(/pages:\s*\[(\d+),\s*(\d+)\]/g)];
  if (pageRangeMatches.length !== 24) {
    errors.push(`lesson-meta.ts has ${pageRangeMatches.length} lessons, expected 24`);
  }
  let covered = 0;
  for (const m of pageRangeMatches) {
    const start = Number(m[1]);
    const end = Number(m[2]);
    if (end < start) errors.push(`lesson-meta.ts has inverted page range: [${start},${end}]`);
    covered += end - start + 1;
  }
  if (covered !== 90) errors.push(`lesson-meta.ts total page coverage = ${covered}, expected 90`);
}

// 3. exercise-seed.ts must exist and export INSTRUCTIONS with the locked Spanish
const seedRaw = read("src/content/exercise-seed.ts");
if (seedRaw) {
  const required = [
    "Toca la s", // "Toca la sílaba..."
    "Presiona aquel", // "Presiona aquel dibujo..."
    "Arrastra las s", // "Arrastra las sílabas..."
    "Lee en voz alta", // reading instruction
  ];
  for (const phrase of required) {
    if (!seedRaw.includes(phrase))
      errors.push(`exercise-seed.ts missing locked instruction phrase: "${phrase}""`);
  }
}

// 4. Banned words check across the user-facing content
const BANNED = ["demo", "Demo", "DEMO", "Pixar", "pixar"];
for (const file of [
  "src/content/exercise-seed.ts",
  "src/content/lesson-meta.ts",
  "src/content/sentence-bank.ts",
]) {
  const raw = read(file);
  if (!raw) continue;
  for (const word of BANNED) {
    if (raw.includes(word)) errors.push(`${file} contains banned word: ${word}`);
  }
}

// Report
if (warnings.length) {
  console.warn("\u26a0\ufe0f  content warnings:");
  for (const w of warnings) console.warn("  - " + w);
}
if (errors.length) {
  console.error("\u274c  content validation failed:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(
  "\u2705  content validation passed: 24 lessons, 90 pages, locked Spanish instructions, no banned words.",
);
process.exit(0);
