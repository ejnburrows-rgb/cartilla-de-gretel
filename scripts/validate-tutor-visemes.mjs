#!/usr/bin/env node
/**
 * Tutor visemes validator (spec §6 — lip-sync).
 *
 * Checks, for the manifest src/content/tutor-lines.json:
 *  - every visemes file referenced by an approved entry exists under public/
 *    and parses as JSON,
 *  - every mouth shape is in the allowed set A B C D E F G H X
 *    (Rhubarb standard shapes + --extendedShapes GX),
 *  - mouthCue times are monotonic (each cue starts at or after the previous
 *    cue's end, ends after its own start, and nothing is negative),
 *  - every approved entry that HAS a visemes field has the file present
 *    (approved entries without a visemes field are the runtime fallback case,
 *    reported as a count but not an error),
 *  - no visemes field points at a rejected-source path
 *    (rec_gretel_* / 67-clip ZIP — AGENTS.md 2026-10-15).
 *
 * CLI: node scripts/validate-tutor-visemes.mjs [path-to-manifest]
 * Exits non-zero with one clear message per problem.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isRejectedSourcePath } from "./validate-tutor-lines.mjs";

export const ALLOWED_MOUTH_SHAPES = ["A", "B", "C", "D", "E", "F", "G", "H", "X"];
const ALLOWED_SHAPES = new Set(ALLOWED_MOUTH_SHAPES);
const TUTOR_VISEMES_DIR = "/audio/voz/tutor/";

/**
 * Validate one parsed visemes file.
 * @returns {string[]} error messages (empty = valid)
 */
export function validateVisemesData(data, label) {
  const errors = [];
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return [`${label}: not a JSON object`];
  }
  if (typeof data.metadata !== "object" || data.metadata === null || Array.isArray(data.metadata)) {
    errors.push(`${label}: missing metadata object`);
  }
  const cues = data.mouthCues;
  if (!Array.isArray(cues) || cues.length === 0) {
    errors.push(`${label}: mouthCues must be a non-empty array`);
    return errors;
  }
  let previousEnd = 0;
  cues.forEach((cue, index) => {
    if (typeof cue !== "object" || cue === null || Array.isArray(cue)) {
      errors.push(`${label}: mouthCues[${index}] is not an object`);
      return;
    }
    if (typeof cue.value !== "string" || !ALLOWED_SHAPES.has(cue.value)) {
      errors.push(
        `${label}: mouthCues[${index}] shape ${JSON.stringify(cue.value)} is not one of ${ALLOWED_MOUTH_SHAPES.join(" ")}`,
      );
    }
    if (typeof cue.start !== "number" || typeof cue.end !== "number") {
      errors.push(`${label}: mouthCues[${index}] start/end must be numbers`);
      return;
    }
    if (!(cue.start >= 0) || !(cue.end > cue.start)) {
      errors.push(
        `${label}: mouthCues[${index}] has invalid times (start ${cue.start}, end ${cue.end}); need 0 ≤ start < end`,
      );
    }
    if (cue.start < previousEnd - 1e-6) {
      errors.push(
        `${label}: mouthCues[${index}] starts at ${cue.start} before the previous cue ends (${previousEnd}) — times must be monotonic`,
      );
    }
    previousEnd = cue.end;
  });
  return errors;
}

/**
 * Validate the manifest + visemes files.
 * @returns {{ ok: boolean, errors: string[], warnings: string[], counts: { approved: number, withVisemes: number, validatedFiles: number } }}
 */
export function validateTutorVisemes(manifest, options = {}) {
  const errors = [];
  const warnings = [];
  const counts = { approved: 0, withVisemes: 0, validatedFiles: 0 };
  const publicDir = typeof options.publicDir === "string" ? options.publicDir : null;

  if (typeof manifest !== "object" || manifest === null || !Array.isArray(manifest.approved)) {
    return {
      ok: false,
      errors: ["manifest must be an object with an approved array"],
      warnings,
      counts,
    };
  }
  counts.approved = manifest.approved.length;
  const checkedFiles = new Set();

  for (const entry of manifest.approved) {
    if (typeof entry !== "object" || entry === null) continue;
    const lineId = typeof entry.lineId === "string" && entry.lineId ? entry.lineId : "(missing lineId)";
    if (typeof entry.visemes !== "string") {
      warnings.push(`${lineId}: approved entry has no visemes field (runtime falls back to the amplitude envelope)`);
      continue;
    }
    counts.withVisemes += 1;
    const visemesPath = entry.visemes;
    if (isRejectedSourcePath(visemesPath)) {
      errors.push(`${lineId}: visemes "${visemesPath}" points at a REJECTED audio source (AGENTS.md 2026-10-15)`);
      continue;
    }
    if (!visemesPath.startsWith("/")) {
      errors.push(`${lineId}: visemes "${visemesPath}" must be a public asset path starting with "/"`);
      continue;
    }
    if (!visemesPath.startsWith(TUTOR_VISEMES_DIR)) {
      errors.push(`${lineId}: visemes "${visemesPath}" must live under ${TUTOR_VISEMES_DIR} (spec §3)`);
      continue;
    }
    if (publicDir) {
      const diskPath = join(publicDir, visemesPath);
      if (!existsSync(diskPath)) {
        errors.push(`${lineId}: visemes file does not exist under public/: ${visemesPath}`);
        continue;
      }
      if (checkedFiles.has(visemesPath)) continue; // already validated this exact file
      checkedFiles.add(visemesPath);
      let data;
      try {
        data = JSON.parse(readFileSync(diskPath, "utf8"));
      } catch (error) {
        errors.push(`${lineId}: visemes file does not parse: ${visemesPath} (${error.message})`);
        continue;
      }
      errors.push(...validateVisemesData(data, visemesPath));
    }
  }
  counts.validatedFiles = checkedFiles.size;
  return { ok: errors.length === 0, errors, warnings, counts };
}

async function main() {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const manifestPath = process.argv[2]
    ? resolve(process.cwd(), process.argv[2])
    : join(repoRoot, "src/content/tutor-lines.json");

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    console.error(`✗ cannot read manifest ${manifestPath}: ${error.message}`);
    process.exit(1);
  }

  const result = validateTutorVisemes(manifest, { publicDir: join(repoRoot, "public") });
  for (const warning of result.warnings) console.warn(`! ${warning}`);
  if (!result.ok) {
    for (const error of result.errors) console.error(`✗ ${error}`);
    console.error(`FAILED: ${result.errors.length} problem(s) in ${manifestPath}`);
    process.exit(1);
  }
  console.log(
    `✓ ${manifestPath}: ${result.counts.withVisemes}/${result.counts.approved} approved entries have visemes; ` +
      `${result.counts.validatedFiles} visemes file(s) parse with shapes in {${ALLOWED_MOUTH_SHAPES.join(" ")}} and monotonic cue times.`,
  );
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("validate-tutor-visemes.mjs")) {
  await main();
}
