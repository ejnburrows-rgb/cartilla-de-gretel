#!/usr/bin/env node
/**
 * Tutor visemes builder (spec §6 — lip-sync).
 *
 * For every approved entry in src/content/tutor-lines.json:
 *   1. converts its mp3 to wav with ffmpeg into a temp dir outside the repo,
 *   2. runs Rhubarb Lip Sync with `-r phonetic -f json --extendedShapes GX`
 *      (the phonetic recognizer is for non-English audio like our Spanish
 *      recordings),
 *   3. writes the mouth-cue JSON to
 *      public/audio/voz/tutor/leccion-<lesson>/<lineId>.visemes.json
 *      (spec §3 — the tutor routes own their copies, NOT the vocabulario dir),
 *   4. adds a "visemes" field with that public path to the approved entry in
 *      src/content/tutor-lines.json, keeping every other field byte-identical
 *      (verified by a round-trip check before writing).
 *
 * Timing only — this script never generates, stitches, or alters any audio.
 * It only reads the existing owner-approved recordings.
 *
 * Rhubarb Lip Sync CLI: https://github.com/DanielSWolf/rhubarb-lip-sync
 * License: MIT (free). Downloaded at run time into the gitignored .tools dir;
 * the release and zip SHA-256 below are pinned. Never committed to the repo.
 *
 * Idempotent: entries whose visemes file already exists and matches (same
 * source audio SHA-256, same pinned Rhubarb release and recognizer flags)
 * are skipped. Use --force to rebuild every entry.
 *
 * CLI: node scripts/build-tutor-visemes.mjs [--force]
 * After the manifest update, run node scripts/validate-tutor-lines.mjs
 * and node scripts/validate-tutor-visemes.mjs.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { isRejectedSourcePath } from "./validate-tutor-lines.mjs";

/** Pinned Rhubarb release (MIT license — see header comment). */
const RHUBARB_VERSION = "1.14.0";
const RHUBARB_ZIP_URL =
  "https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v" +
  RHUBARB_VERSION +
  "/Rhubarb-Lip-Sync-" +
  RHUBARB_VERSION +
  "-Linux.zip";
const RHUBARB_ZIP_SHA256 = "a9a9074862cff47b2d59b8bf399a678a3b0b74f9452ad6ad94cb292913dd8667";
const RHUBARB_RECOGNIZER = "phonetic";
const RHUBARB_EXTENDED_SHAPES = "GX";
/** Mouth shapes Rhubarb may emit with standard + --extendedShapes GX. */
const ALLOWED_SHAPES = new Set(["A", "B", "C", "D", "E", "F", "G", "H", "X"]);

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(repoRoot, "src/content/tutor-lines.json");
const publicDir = join(repoRoot, "public");
const toolsDir = join(repoRoot, ".tools");
const rhubarbBinary = join(
  toolsDir,
  `Rhubarb-Lip-Sync-${RHUBARB_VERSION}-Linux`,
  "rhubarb",
);

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

/** SHA-256 hex digest of a file. */
function sha256File(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

/**
 * Ensure the pinned Rhubarb binary is present, downloading + verifying it on
 * first use. The zip and binary live only in the gitignored .tools dir.
 */
async function ensureRhubarb() {
  if (process.platform !== "linux" || process.arch !== "x64") {
    fail(`Rhubarb pinned download only covers linux/x64 (this host: ${process.platform}/${process.arch}).`);
  }
  if (existsSync(rhubarbBinary)) return;

  console.log(`Downloading Rhubarb Lip Sync v${RHUBARB_VERSION} (MIT) to ${toolsDir} …`);
  mkdirSync(toolsDir, { recursive: true });
  const zipPath = join(toolsDir, `rhubarb-${RHUBARB_VERSION}.zip`);
  const response = await fetch(RHUBARB_ZIP_URL);
  if (!response.ok) fail(`download failed: HTTP ${response.status} for ${RHUBARB_ZIP_URL}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== RHUBARB_ZIP_SHA256) {
    fail(`SHA-256 mismatch for ${RHUBARB_ZIP_URL}: got ${digest}, expected ${RHUBARB_ZIP_SHA256}`);
  }
  writeFileSync(zipPath, bytes);
  execFileSync("unzip", ["-o", "-q", zipPath, "-d", toolsDir], { stdio: "pipe" });
  rmSync(zipPath, { force: true });
  if (!existsSync(rhubarbBinary)) fail(`Rhubarb binary missing after extract: ${rhubarbBinary}`);
}

/**
 * Run Rhubarb on a wav file and return its parsed mouth-cue JSON.
 * Recognizer and shapes come from spec §6: `-r phonetic -f json --extendedShapes GX`.
 */
function runRhubarb(rhubarb, wavPath, outputPath) {
  execFileSync(
    rhubarb,
    [
      "-r", RHUBARB_RECOGNIZER,
      "-f", "json",
      "--extendedShapes", RHUBARB_EXTENDED_SHAPES,
      "-o", outputPath,
      wavPath,
    ],
    { stdio: ["ignore", "ignore", "pipe"] }, // progress bar goes to stderr; JSON goes to -o file
  );
  return JSON.parse(readFileSync(outputPath, "utf8"));
}

/** Validate Rhubarb's mouth-cue JSON: non-empty, allowed shapes, monotonic times. */
function mouthCuesAreValid(cues) {
  if (!Array.isArray(cues) || cues.length === 0) return false;
  let previousEnd = 0;
  for (const cue of cues) {
    if (!cue || typeof cue.value !== "string" || !ALLOWED_SHAPES.has(cue.value)) return false;
    if (typeof cue.start !== "number" || typeof cue.end !== "number") return false;
    if (!(cue.start >= previousEnd - 1e-6) || !(cue.end > cue.start)) return false;
    previousEnd = cue.end;
  }
  return true;
}

/** True when an existing visemes file matches the current audio + pipeline settings. */
function visemesFileMatches(visemesPath, sourceSha256) {
  try {
    const data = JSON.parse(readFileSync(visemesPath, "utf8"));
    const meta = data?.metadata ?? {};
    return (
      meta.rhubarbVersion === RHUBARB_VERSION &&
      meta.recognizer === RHUBARB_RECOGNIZER &&
      meta.extendedShapes === RHUBARB_EXTENDED_SHAPES &&
      meta.sourceSha256 === sourceSha256 &&
      mouthCuesAreValid(data.mouthCues)
    );
  } catch {
    return false;
  }
}

/**
 * Rebuild an approved entry object with "visemes" right after "src"
 * (spec §6 manifest example), preserving the original key order otherwise.
 */
function entryWithVisemes(entry, visemesPath) {
  const rebuilt = {};
  for (const [key, value] of Object.entries(entry)) {
    if (key === "visemes") continue; // re-inserted once, right after src
    if (key === "src") {
      rebuilt.src = value;
      rebuilt.visemes = visemesPath;
    } else {
      rebuilt[key] = value;
    }
  }
  if (!("visemes" in rebuilt)) rebuilt.visemes = visemesPath; // entry had no src yet? keep spec order anyway
  return rebuilt;
}

async function main() {
  const force = process.argv.includes("--force");
  const manifestText = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(manifestText);
  if (!Array.isArray(manifest.approved)) fail("manifest has no approved array");

  await ensureRhubarb();

  const tempDir = mkdtempSync(join(tmpdir(), "rhubarb-visemes-"));
  let built = 0;
  let skipped = 0;
  const updatedEntries = [];

  try {
    for (const entry of manifest.approved) {
      if (!entry || typeof entry.src !== "string" || typeof entry.lineId !== "string") {
        fail(`approved entry without src/lineId: ${JSON.stringify(entry)}`);
      }
      if (isRejectedSourcePath(entry.src)) {
        fail(`${entry.lineId}: src "${entry.src}" is a REJECTED audio source — refusing to build visemes from it`);
      }
      const mp3Path = join(publicDir, entry.src);
      if (!existsSync(mp3Path)) fail(`${entry.lineId}: src file missing under public/: ${entry.src}`);

      const lesson = typeof entry.lesson === "number" ? entry.lesson : 0;
      const visemesPublicPath = `/audio/voz/tutor/leccion-${lesson}/${entry.lineId}.visemes.json`;
      const visemesDiskPath = join(publicDir, visemesPublicPath);

      const sourceSha256 = sha256File(mp3Path);
      if (!force && existsSync(visemesDiskPath) && visemesFileMatches(visemesDiskPath, sourceSha256)) {
        skipped += 1;
        updatedEntries.push(entryWithVisemes(entry, visemesPublicPath));
        continue;
      }

      const wavPath = join(tempDir, `${entry.lineId}.wav`);
      const rawJsonPath = join(tempDir, `${entry.lineId}.raw.json`);
      execFileSync(
        "ffmpeg",
        ["-hide_banner", "-loglevel", "error", "-y", "-i", mp3Path, "-ac", "1", "-ar", "44100", "-c:a", "pcm_s16le", wavPath],
        { stdio: "pipe" },
      );

      const rhubarbOutput = runRhubarb(rhubarbBinary, wavPath, rawJsonPath);
      if (!mouthCuesAreValid(rhubarbOutput.mouthCues)) {
        fail(`${entry.lineId}: Rhubarb output failed shape/monotonic-time validation`);
      }
      if (rhubarbOutput?.metadata?.soundFile !== wavPath || typeof rhubarbOutput.metadata?.duration !== "number") {
        fail(`${entry.lineId}: unexpected Rhubarb metadata shape`);
      }

      const visemesJson = {
        metadata: {
          // Point at the real committed source (the public mp3), not the temp wav.
          soundFile: entry.src,
          duration: rhubarbOutput.metadata.duration,
          rhubarbVersion: RHUBARB_VERSION,
          recognizer: RHUBARB_RECOGNIZER,
          extendedShapes: RHUBARB_EXTENDED_SHAPES,
          sourceSha256,
        },
        mouthCues: rhubarbOutput.mouthCues,
      };

      mkdirSync(dirname(visemesDiskPath), { recursive: true });
      writeFileSync(visemesDiskPath, JSON.stringify(visemesJson, null, 2) + "\n");
      built += 1;
      updatedEntries.push(entryWithVisemes(entry, visemesPublicPath));
    }

    // Manifest update — every other field byte-identical.
    const newManifest = { ...manifest, approved: updatedEntries };
    const newText = JSON.stringify(newManifest, null, 2) + "\n";
    if (newText !== manifestText) {
      // Round-trip proof: strip the visemes fields and re-serialize — must
      // reproduce the original manifest text byte for byte.
      const stripped = JSON.parse(newText);
      const roundTrip = { ...stripped, approved: stripped.approved.map((entry) => {
        const copy = { ...entry };
        delete copy.visemes;
        return copy;
      }) };
      if (JSON.stringify(roundTrip, null, 2) + "\n" !== manifestText) {
        fail("manifest round-trip check failed — aborting without writing; nothing else may change");
      }
      writeFileSync(manifestPath, newText);
      console.log("manifest updated with visemes paths (all other fields byte-identical)");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }

  const total = manifest.approved.length;
  console.log(
    `✓ visemes: ${total} approved entr${total === 1 ? "y" : "ies"} processed — ${built} built, ${skipped} already up to date (Rhubarb v${RHUBARB_VERSION}, -r ${RHUBARB_RECOGNIZER}, --extendedShapes ${RHUBARB_EXTENDED_SHAPES})`,
  );
}

await main();
