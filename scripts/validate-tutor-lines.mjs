// #!/usr/bin/env node
/**
 * Tutor line-bank manifest validator (spec §6).
 *
 * Rejects:
 *  - approved entries missing an approval reference or a src file
 *  - pending entries that reference audio (only approved recordings may be wired)
 *  - pending entries whose wording is not marked "[DRAFT — owner to approve]"
 *    or "(reuse: …)" — the owner approves every line before it can play
 *  - duplicated lineIds
 *  - unknown roles
 *  - rejected-source paths (the 67-clip ZIP / rec_gretel_* material is
 *    owner-rejected for learner playback — AGENTS.md 2026-10-15)
 *
 * CLI: node scripts/validate-tutor-lines.mjs [path-to-manifest]
 * Exits non-zero with one clear message per problem.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const TUTOR_LINE_ROLES = [
  "greeting-first",
  "greeting-return",
  "praise",
  "praise-streak",
  "praise-after-retry",
  "close-miss",
  "try-again",
  "confusion",
  "wrong-word",
  "repeat-ack",
  "dont-know",
  "help",
  "silence-nudge",
  "noise",
  "redirect",
  "review-intro",
  "closing",
  "idle-end",
  "vowel-model",
  "word-model",
];

export const DRAFT_MARK = "[DRAFT — owner to approve]";
const REUSE_MARK = /\(reuse: [A-Za-zÀ-ÿ_ -]+\)$/;
const WORD_MODEL_ID = /^l(\d+)-model-(.+)$/;

/** Owner-rejected audio sources: the 67-clip ZIP material and rec_gretel_* clips. */
export function isRejectedSourcePath(path) {
  if (typeof path !== "string") return false;
  return (
    /rec_gretel_/i.test(path) ||
    /Gretel_67/i.test(path) ||
    /67_Audio/i.test(path) ||
    /Audio_Lecciones_Listo/i.test(path)
  );
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rejectSourcePath(value, errors, what, lineId) {
  if (isRejectedSourcePath(value)) {
    errors.push(
      `${lineId}: ${what} "${value}" is a REJECTED audio source (rec_gretel_* / 67-clip ZIP are owner-rejected; AGENTS.md 2026-10-15)`,
    );
    return true;
  }
  return false;
}

function validateEntry(entry, section, context, errors) {
  const { checkFiles, publicDir, approvedRecordings } = context;
  const where = `${section} entry`;
  if (!isPlainObject(entry)) {
    errors.push(`${where}: must be an object, got ${JSON.stringify(entry)}`);
    return;
  }
  const lineId = typeof entry.lineId === "string" && entry.lineId.length > 0 ? entry.lineId : "(missing lineId)";
  if (typeof entry.lineId !== "string" || entry.lineId.length === 0) {
    errors.push(`${where}: missing lineId`);
  }
  if (typeof entry.text !== "string" || entry.text.trim().length === 0) {
    errors.push(`${lineId}: missing text`);
  }
  if (!TUTOR_LINE_ROLES.includes(entry.role)) {
    errors.push(`${lineId}: unknown role "${String(entry.role)}" (allowed: ${TUTOR_LINE_ROLES.join(", ")})`);
  }
  if (typeof entry.emotion !== "string" || entry.emotion.trim().length === 0) {
    errors.push(`${lineId}: missing emotion`);
  }
  if (typeof entry.lesson !== "number" || !Number.isInteger(entry.lesson) || entry.lesson < 0) {
    errors.push(`${lineId}: lesson must be a non-negative integer (0 = shared across lessons)`);
  }

  if (section === "approved") {
    if (typeof entry.approval !== "string" || entry.approval.trim().length === 0) {
      errors.push(`${lineId}: approved entry is missing its approval reference`);
    }
    if (typeof entry.src !== "string" || entry.src.trim().length === 0) {
      errors.push(`${lineId}: approved entry is missing src`);
    } else {
      rejectSourcePath(entry.src, errors, "src", lineId);
      if (!entry.src.startsWith("/")) {
        errors.push(`${lineId}: src "${entry.src}" must be a public asset path starting with "/"`);
      }
      if (checkFiles && publicDir && !existsSync(join(publicDir, entry.src))) {
        errors.push(`${lineId}: src file does not exist under public/: ${entry.src}`);
      }
      if (approvedRecordings && entry.role === "word-model" && !approvedRecordings.has(entry.src)) {
        errors.push(
          `${lineId}: word-model src "${entry.src}" is not in the owner-approved picture-name recordings (src/content/picture-name-recordings.json)`,
        );
      }
    }
    if (typeof entry.visemes === "string") {
      rejectSourcePath(entry.visemes, errors, "visemes", lineId);
      if (checkFiles && publicDir && !existsSync(join(publicDir, entry.visemes))) {
        errors.push(`${lineId}: visemes file does not exist under public/: ${entry.visemes}`);
      }
    }
    if (entry.role === "word-model") {
      const match = typeof entry.lineId === "string" ? WORD_MODEL_ID.exec(entry.lineId) : null;
      if (!match) {
        errors.push(`${lineId}: word-model lineId must have the form l<n>-model-<word>`);
      } else if (Number(match[1]) !== entry.lesson) {
        errors.push(`${lineId}: word-model lineId lesson prefix l${match[1]} does not match lesson ${entry.lesson}`);
      } else if (entry.text !== match[2]) {
        errors.push(`${lineId}: word-model text "${String(entry.text)}" must equal the word in its lineId`);
      }
      if (typeof entry.approval === "string" && !entry.approval.includes("picture-name-recordings.json")) {
        errors.push(
          `${lineId}: word-model approval must reference picture-name-recordings.json (owner-approved picture-name recordings are the only approved audio source for word models)`,
        );
      }
    }
  } else {
    // pending: drafts only — audio wiring is forbidden until the owner approves
    if (typeof entry.src === "string") {
      errors.push(`${lineId}: pending entries must not reference audio (src). Move the line to "approved" once the owner approves a recording.`);
      rejectSourcePath(entry.src, errors, "src", lineId);
    }
    if (typeof entry.text === "string" && !entry.text.startsWith(DRAFT_MARK) && !REUSE_MARK.test(entry.text)) {
      errors.push(
        `${lineId}: pending wording must be marked "${DRAFT_MARK}" or carry a "(reuse: …)" note — never shipped as approved`,
      );
    }
  }
}

/**
 * Validate a tutor-lines manifest object.
 *
 * @param {unknown} manifest parsed JSON of { approved: [...], pending: [...] }
 * @param {{checkFiles?: boolean, publicDir?: string, approvedRecordings?: Set<string>}} [options]
 * @returns {{ ok: boolean, errors: string[], counts: { approved: number, pending: number } }}
 */
export function validateTutorLines(manifest, options = {}) {
  const errors = [];
  const counts = { approved: 0, pending: 0 };
  if (!isPlainObject(manifest)) {
    errors.push("manifest must be a JSON object");
    return { ok: false, errors, counts };
  }
  const approved = manifest.approved;
  const pending = manifest.pending;
  if (!Array.isArray(approved)) errors.push('manifest is missing the "approved" array');
  if (!Array.isArray(pending)) errors.push('manifest is missing the "pending" array');
  if (errors.length > 0) return { ok: false, errors, counts };

  counts.approved = approved.length;
  counts.pending = pending.length;
  const context = {
    checkFiles: options.checkFiles === true,
    publicDir: typeof options.publicDir === "string" ? options.publicDir : null,
    approvedRecordings: options.approvedRecordings instanceof Set ? options.approvedRecordings : null,
  };
  for (const entry of approved) validateEntry(entry, "approved", context, errors);
  for (const entry of pending) validateEntry(entry, "pending", context, errors);

  const seen = new Map();
  for (const entry of [...approved, ...pending]) {
    if (!isPlainObject(entry) || typeof entry.lineId !== "string" || entry.lineId.length === 0) continue;
    if (seen.has(entry.lineId)) {
      errors.push(`duplicate lineId "${entry.lineId}" (first seen in ${seen.get(entry.lineId)})`);
    } else {
      seen.set(entry.lineId, approved.includes(entry) ? "approved" : "pending");
    }
  }
  return { ok: errors.length === 0, errors, counts };
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
  let approvedRecordings = null;
  const recordingsPath = join(repoRoot, "src/content/picture-name-recordings.json");
  try {
    const recordings = JSON.parse(readFileSync(recordingsPath, "utf8"));
    if (Array.isArray(recordings.approved)) {
      approvedRecordings = new Set(recordings.approved.map((e) => e?.src).filter(Boolean));
    }
  } catch (error) {
    console.error(`✗ cannot read approved picture-name recordings ${recordingsPath}: ${error.message}`);
    process.exit(1);
  }

  const result = validateTutorLines(manifest, {
    checkFiles: true,
    publicDir: join(repoRoot, "public"),
    approvedRecordings,
  });
  if (!result.ok) {
    for (const error of result.errors) console.error(`✗ ${error}`);
    console.error(`FAILED: ${result.errors.length} problem(s) in ${manifestPath}`);
    process.exit(1);
  }
  console.log(
    `✓ ${manifestPath}: ${result.counts.approved} approved line(s), ${result.counts.pending} pending line(s) — approval references, files, roles, ids, and audio-source rules all check out.`,
  );
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("validate-tutor-lines.mjs")) {
  await main();
}
