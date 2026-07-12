#!/usr/bin/env node
/**
 * scripts/validate-workbook-manifest.mjs
 *
 * Validates a workbook-manifest.json file against the canonical schema
 * documented in src/content/workbook/manifest-schema.ts. Deliberately a
 * standalone hand-rolled validator (no import from src/ TypeScript) —
 * matches the existing scripts/validate-content.mjs convention. If you
 * change manifest-schema.ts, update the checks below to match.
 *
 * Checks:
 *   - well-formed JSON, top-level { version, pages: [] }
 *   - every page: physicalPage (1-92, unique), lesson (1-24), instruction
 *     is a string, objects is an array, status is a known value
 *   - every object: id (unique per page), type, x/y/width are 0-100
 *     percentages, no height > 100
 *   - every background/asset path is non-blank AND resolves to a real file
 *     under public/ (hard error if missing — never a silently broken path)
 *   - every object marked interactive has a page-level interaction.mechanic
 *   - every interaction.mechanic that needs answers (select/match/connect/
 *     order) has at least one non-empty answer
 *   - the manifest's unique physicalPage count matches src/data/page-layouts.json's
 *     real, verified page count exactly (hard error if it doesn't — see
 *     CLAUDE.md's "Page count is NOT a magic number" canon fact: this is
 *     never hardcoded to 92, since that's just the census schema's upper
 *     bound, not a claim that 92 real pages exist). Falls back to a
 *     "<92 warning" only if page-layouts.json can't be read at all.
 *   - all lessons 1-24 have at least one page (warning, not error, since a
 *     real census may legitimately still be in progress for some lessons)
 *
 * Usage: node scripts/validate-workbook-manifest.mjs <path-to-manifest.json>
 * Exits 1 on any error, 0 otherwise (warnings never fail the run).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const MECHANICS = ["select", "match", "drag", "connect", "order", "trace", "read", "none"];
const STATUSES = [
  "mapped",
  "cropping-ready",
  "colorization-ready",
  "implementation-ready",
  "complete",
  "source-review-required",
];
const MECHANICS_REQUIRING_ANSWERS = new Set(["select", "match", "connect", "order"]);

/** The real, verified page count — read from page-layouts.json rather than
 * hardcoded to 92. Per CLAUDE.md's "Page count is NOT a magic number" canon
 * fact: 92 is Grok's future census format's upper bound, not a claim that
 * 92 real pages exist today. */
function getRealPageCount() {
  try {
    const layouts = JSON.parse(
      fs.readFileSync(path.join(repoRoot, "src/data/page-layouts.json"), "utf8"),
    );
    return Object.keys(layouts.pages ?? {}).length;
  } catch {
    return null;
  }
}

const errors = [];
const warnings = [];
function err(where, msg) {
  errors.push(`${where}: ${msg}`);
}
function warn(where, msg) {
  warnings.push(`${where}: ${msg}`);
}

function isPercent(n) {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 100;
}

function validateAssetPath(where, label, relPath) {
  if (relPath.trim().length === 0) {
    err(where, `${label} is blank`);
    return;
  }
  const fullPath = path.join(repoRoot, "public", relPath);
  if (!fs.existsSync(fullPath)) {
    err(where, `${label} "${relPath}" does not exist on disk`);
  }
}

function validateObject(page, object, index) {
  const where = `physicalPage ${page.physicalPage ?? "?"} / object[${index}]`;
  if (typeof object.id !== "string" || object.id.length === 0) err(where, "missing/empty id");
  if (typeof object.type !== "string" || object.type.length === 0) err(where, "missing/empty type");
  if (!isPercent(object.x))
    err(where, `x must be a 0-100 percent, got ${JSON.stringify(object.x)}`);
  if (!isPercent(object.y))
    err(where, `y must be a 0-100 percent, got ${JSON.stringify(object.y)}`);
  if (!isPercent(object.width))
    err(where, `width must be a 0-100 percent, got ${JSON.stringify(object.width)}`);
  if (object.height !== undefined && !isPercent(object.height))
    err(where, `height must be a 0-100 percent, got ${JSON.stringify(object.height)}`);
  if (object.asset !== undefined && typeof object.asset === "string") {
    validateAssetPath(where, "asset", object.asset);
  }
}

function validateInteraction(page) {
  const where = `physicalPage ${page.physicalPage ?? "?"} / interaction`;
  const interaction = page.interaction;
  if (!interaction) return;
  if (!MECHANICS.includes(interaction.mechanic)) {
    err(
      where,
      `unknown mechanic "${interaction.mechanic}" (expected one of ${MECHANICS.join(", ")})`,
    );
    return;
  }
  if (MECHANICS_REQUIRING_ANSWERS.has(interaction.mechanic)) {
    if (
      !Array.isArray(interaction.answers) ||
      interaction.answers.filter((a) => typeof a === "string" && a.trim()).length === 0
    ) {
      err(where, `mechanic "${interaction.mechanic}" requires at least one non-empty answer`);
    }
  }
}

function validatePage(page, index, allObjectIds, seenPhysicalPages) {
  const where = `pages[${index}]`;
  if (
    typeof page.physicalPage !== "number" ||
    !Number.isInteger(page.physicalPage) ||
    page.physicalPage < 1 ||
    page.physicalPage > 92
  ) {
    err(where, `physicalPage must be an integer 1-92, got ${JSON.stringify(page.physicalPage)}`);
  } else {
    if (seenPhysicalPages.has(page.physicalPage))
      err(where, `duplicate physicalPage: ${page.physicalPage}`);
    seenPhysicalPages.add(page.physicalPage);
  }

  if (
    typeof page.lesson !== "number" ||
    !Number.isInteger(page.lesson) ||
    page.lesson < 1 ||
    page.lesson > 24
  ) {
    err(
      `physicalPage ${page.physicalPage ?? "?"}`,
      `lesson must be an integer 1-24, got ${JSON.stringify(page.lesson)}`,
    );
  }

  if (typeof page.instruction !== "string") {
    err(
      `physicalPage ${page.physicalPage ?? "?"}`,
      `instruction must be a string (empty string is fine, undefined is not)`,
    );
  }

  if (!STATUSES.includes(page.status)) {
    err(
      `physicalPage ${page.physicalPage ?? "?"}`,
      `unknown status "${page.status}" (expected one of ${STATUSES.join(", ")})`,
    );
  }

  if (
    page.background !== undefined &&
    page.background !== null &&
    typeof page.background === "string"
  ) {
    validateAssetPath(`physicalPage ${page.physicalPage ?? "?"}`, "background", page.background);
  }

  if (!Array.isArray(page.objects)) {
    err(`physicalPage ${page.physicalPage ?? "?"}`, "objects must be an array");
    return;
  }

  page.objects.forEach((object, objIndex) => {
    validateObject(page, object, objIndex);
    if (object && typeof object.id === "string") {
      const key = `${page.physicalPage}:${object.id}`;
      if (allObjectIds.has(key))
        err(`physicalPage ${page.physicalPage}`, `duplicate object id "${object.id}"`);
      allObjectIds.add(key);
    }
    if (object?.interactive && !page.interaction) {
      err(
        `physicalPage ${page.physicalPage}`,
        `object "${object.id}" is marked interactive but the page has no interaction.mechanic`,
      );
    }
  });

  validateInteraction(page);
}

function main() {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: node scripts/validate-workbook-manifest.mjs <path-to-manifest.json>");
    process.exit(1);
  }
  const fullPath = path.resolve(target);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ manifest not found: ${fullPath}`);
    process.exit(1);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (e) {
    console.error(`❌ invalid JSON in ${fullPath}: ${e.message}`);
    process.exit(1);
  }

  if (typeof manifest.version !== "string") err("root", "missing version string");
  if (!Array.isArray(manifest.pages)) {
    err("root", "missing pages array");
  } else {
    const seenPhysicalPages = new Set();
    const allObjectIds = new Set();
    manifest.pages.forEach((page, index) =>
      validatePage(page, index, allObjectIds, seenPhysicalPages),
    );

    const realPageCount = getRealPageCount();
    if (realPageCount !== null) {
      if (seenPhysicalPages.size !== realPageCount) {
        err(
          "root",
          `manifest has ${seenPhysicalPages.size} unique physicalPage value(s), but src/data/page-layouts.json has ${realPageCount} verified real pages — every real page must be covered, with no extras`,
        );
      }
    } else if (seenPhysicalPages.size < 92) {
      warn(
        "root",
        `only ${seenPhysicalPages.size}/92 physicalPage values present — expected for an in-progress census, not a hard error (could not read src/data/page-layouts.json to check against the real count)`,
      );
    }
    const coveredLessons = new Set(
      manifest.pages.map((p) => p.lesson).filter((n) => typeof n === "number"),
    );
    for (let lesson = 1; lesson <= 24; lesson++) {
      if (!coveredLessons.has(lesson)) warn("root", `lesson ${lesson} has no pages yet`);
    }
  }

  if (warnings.length > 0) {
    console.log(`⚠  ${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`   ${w}`);
  }

  if (errors.length > 0) {
    console.log(`\n❌  ${errors.length} error(s):`);
    for (const e of errors) console.log(`   ${e}`);
    process.exit(1);
  }

  console.log(`✓ validate-workbook-manifest: PASS (${manifest.pages?.length ?? 0} pages)`);
  process.exit(0);
}

main();
