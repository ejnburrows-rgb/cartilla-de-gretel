#!/usr/bin/env node
/**
 * scripts/validate-content.mjs
 *
 * Strict content validator for the three data files that drive the app:
 *   - src/data/page-layouts.json  (student workbook + teacher page content)
 *   - src/data/teacher-guide.json (teacher guide, schema-checked separately)
 *   - src/data/page-inventory.json (scan-file inventory per lesson)
 *
 * Checks:
 *   1. page-layouts.json: every region has a known regionType, required
 *      fields for its type are present, and every illustrationSrc path
 *      (region-level, grid cells, vowelRows, vowelPairs, matchRows,
 *      fillItems) resolves to a real file under public/.
 *   2. teacher-guide.json: validated against teacher-guide.schema.json
 *      (delegates to the existing validate-teacher-guide.cjs).
 *   3. page-inventory.json: required fields present, and every listed page
 *      filename exists under its declared `path`.
 *
 * Note: this is separate from scripts/validate-activities-content.mjs,
 * which checks a different, parallel content system (page-bindings.json /
 * lesson-meta.ts / exercise-seed.ts, used by src/routes/activities.tsx).
 *
 * Exits 1 on any error. Run before every commit (see package.json
 * "validate:content" script).
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const errors = [];
const warnings = [];

function err(where, msg) {
  errors.push(`${where}: ${msg}`);
}
function warn(where, msg) {
  warnings.push(`${where}: ${msg}`);
}

function fileExistsUnderPublic(assetPath) {
  const clean = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  return fs.existsSync(path.join(rootDir, "public", clean));
}

// ---------------------------------------------------------------------------
// 1. page-layouts.json
// ---------------------------------------------------------------------------

const KNOWN_REGION_TYPES = new Set([
  "title", "instruction", "vocab-grid", "tracing-line", "writing-line",
  "draw-box", "picture-grid", "syllable-bubble", "sentence-line",
  "illustration-slot", "syllable-match", "fill-in-blank",
  "vowel-line-match", "vowel-pick-one", "vowel-match-all", "reading-sentences", "footer",
]);

const REGION_REQUIRED_FIELDS = {
  "picture-grid": ["cells"],
  "syllable-match": ["syllable", "matchRows"],
  "fill-in-blank": ["fillItems"],
  "vowel-line-match": ["letterPair"],
  "vowel-pick-one": ["vowelRows"],
  "vowel-match-all": ["vowelPairs"],
  "reading-sentences": ["sentences"],
  instruction: ["text"],
  title: ["text"],
};

function checkImagePath(where, assetPath) {
  if (!assetPath) return;
  if (!fileExistsUnderPublic(assetPath)) {
    err(where, `references missing file "${assetPath}"`);
  }
}

function validatePageLayouts() {
  const p = path.join(rootDir, "src/data/page-layouts.json");
  if (!fs.existsSync(p)) {
    err("page-layouts.json", "file not found");
    return;
  }
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  const pages = data.pages;
  if (!pages || typeof pages !== "object") {
    err("page-layouts.json", '"pages" object missing');
    return;
  }

  for (const [pn, page] of Object.entries(pages)) {
    const regions = page.regions;
    if (!Array.isArray(regions)) {
      err(`page ${pn}`, '"regions" must be an array');
      continue;
    }
    regions.forEach((region, i) => {
      const where = `page ${pn} / region[${i}] (${region.id ?? "no id"})`;
      const type = region.regionType;
      if (!type) {
        err(where, "missing regionType");
        return;
      }
      if (!KNOWN_REGION_TYPES.has(type)) {
        err(where, `unknown regionType "${type}"`);
        return;
      }
      for (const field of REGION_REQUIRED_FIELDS[type] ?? []) {
        if (region[field] === undefined) {
          err(where, `regionType "${type}" missing required field "${field}"`);
        }
      }

      checkImagePath(where, region.illustrationSrc);

      for (const cell of region.cells ?? []) {
        checkImagePath(where, cell.illustrationSrc);
      }
      for (const row of region.vowelRows ?? []) {
        for (const cell of row.cells ?? []) checkImagePath(where, cell.illustrationSrc);
      }
      for (const pair of region.vowelPairs ?? []) {
        checkImagePath(where, pair.illustrationSrc);
      }
      for (const row of region.matchRows ?? []) {
        for (const word of row) checkImagePath(where, word.illustrationSrc);
      }
      for (const item of region.fillItems ?? []) {
        checkImagePath(where, item.illustrationSrc);
      }
    });
  }
}

// ---------------------------------------------------------------------------
// 2. teacher-guide.json — delegate to the existing ajv-based validator
// ---------------------------------------------------------------------------

function validateTeacherGuide() {
  const scriptPath = path.join(__dirname, "validate-teacher-guide.cjs");
  if (!fs.existsSync(scriptPath)) {
    warn("teacher-guide.json", "validate-teacher-guide.cjs not found, skipped");
    return;
  }
  const result = spawnSync("node", [scriptPath], { encoding: "utf8" });
  if (result.status !== 0) {
    err("teacher-guide.json", `schema validation failed:\n${result.stdout}${result.stderr}`);
  }
}

// ---------------------------------------------------------------------------
// 3. page-inventory.json
// ---------------------------------------------------------------------------

function validatePageInventory() {
  const p = path.join(rootDir, "src/data/page-inventory.json");
  if (!fs.existsSync(p)) {
    err("page-inventory.json", "file not found");
    return;
  }
  const data = JSON.parse(fs.readFileSync(p, "utf8"));

  for (const [section, val] of Object.entries(data)) {
    const where = `page-inventory.json / ${section}`;
    for (const field of ["description", "path", "totalPages", "lessons"]) {
      if (val[field] === undefined) err(where, `missing required field "${field}"`);
    }
    if (!val.path || !Array.isArray(val.lessons)) continue;

    const basePath = path.join(rootDir, val.path);
    const uniquePageFiles = new Set();
    val.lessons.forEach((lesson, i) => {
      const lessonWhere = `${where} / lessons[${i}] (lessonId ${lesson.lessonId ?? "?"})`;
      if (lesson.lessonId === undefined) err(lessonWhere, "missing lessonId");
      if (!Array.isArray(lesson.pages)) {
        err(lessonWhere, "missing pages array");
        return;
      }
      for (const pageFile of lesson.pages) {
        uniquePageFiles.add(pageFile);
        const full = path.join(basePath, pageFile);
        if (!fs.existsSync(full)) {
          err(lessonWhere, `page file not found: ${path.relative(rootDir, full)}`);
        }
      }
    });
    if (typeof val.totalPages === "number" && uniquePageFiles.size !== val.totalPages) {
      warn(where, `totalPages says ${val.totalPages}, but lessons[].pages lists ${uniquePageFiles.size} unique page files (some lessons share pages, e.g. review spreads, so this counts each file once)`);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

validatePageLayouts();
validateTeacherGuide();
validatePageInventory();

if (warnings.length > 0) {
  console.log(`⚠  ${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`   ${w}`);
}

if (errors.length > 0) {
  console.log(`\n❌  ${errors.length} error(s):`);
  for (const e of errors) console.log(`   ${e}`);
  process.exit(1);
}

console.log("✓ validate-content: PASS");
process.exit(0);
