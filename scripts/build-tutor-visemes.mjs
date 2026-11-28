#!/usr/bin/env node
/**
 * Generalized Tutor Visemes Builder (Milestone 4 — lip-sync).
 *
 * Supports both:
 *   - v1 manifest: src/content/tutor-lines.json (approved array, byte-identical round-trip proof)
 *   - v2 manifests: src/content/tutor-dialogue/*.json (entries with status "approved" | "validated" and audio.src)
 *
 * For every authorized entry with active audio:
 *   1. verifies the audio path & SHA-256 against permanent rejection rules (67-clip ZIP, nina-sordita.mp3),
 *   2. checks idempotency (same source audio SHA-256, Rhubarb v1.14.0, `-r phonetic --extendedShapes GX`),
 *   3. if missing/stale (or `--force`), converts audio to wav outside the repo via ffmpeg (.tools/ or PATH),
 *   4. runs Rhubarb Lip Sync (`-r phonetic -f json --extendedShapes GX`) via .tools/, PATH, or pinned Linux download,
 *   5. writes mouth-cue JSON under public/audio/voz/tutor/leccion-<lesson>/<id>.visemes.json,
 *   6. updates the manifest's `visemes` field without altering any audio or unapproved entries.
 *
 * CLI:
 *   node scripts/build-tutor-visemes.mjs [--force] [--dry-run] [--all] [--manifest <path>]
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  RHUBARB_EXTENDED_SHAPES,
  RHUBARB_RECOGNIZER,
  RHUBARB_VERSION,
} from "./tutor-intake/constants.mjs";
import { sha256File } from "./tutor-intake/checksum.mjs";
import { checkRejectedSource } from "./tutor-intake/guard.mjs";
import { resolveMediaTools } from "./tutor-intake/media.mjs";
import {
  ensureRhubarbBinary,
  syncVisemesForAudio,
  visemesFileMatches,
} from "./tutor-intake/visemes.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultV1Manifest = join(repoRoot, "src/content/tutor-lines.json");
const v2DialogueDir = join(repoRoot, "src/content/tutor-dialogue");
const publicDir = join(repoRoot, "public");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function entryWithVisemesV1(entry, visemesPath) {
  const rebuilt = {};
  for (const [key, value] of Object.entries(entry)) {
    if (key === "visemes") continue;
    if (key === "src") {
      rebuilt.src = value;
      rebuilt.visemes = visemesPath;
    } else {
      rebuilt[key] = value;
    }
  }
  if (!("visemes" in rebuilt)) rebuilt.visemes = visemesPath;
  return rebuilt;
}

function discoverTargetManifests(argv) {
  const manifestPaths = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--manifest" && argv[i + 1]) {
      manifestPaths.push(resolve(process.cwd(), argv[++i]));
    }
  }
  if (manifestPaths.length > 0) return manifestPaths;

  const targets = [defaultV1Manifest];
  if (argv.includes("--all") && existsSync(v2DialogueDir)) {
    const files = readdirSync(v2DialogueDir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(".json"))
      .map((e) => join(v2DialogueDir, e.name))
      .sort();
    targets.push(...files);
  }
  return targets;
}

async function processV1Manifest(manifestPath, { force, dryRun, tools }) {
  const manifestText = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(manifestText);
  if (!Array.isArray(manifest.approved)) fail(`${manifestPath}: manifest has no approved array`);

  let built = 0;
  let skipped = 0;
  let missingOrStale = 0;
  const updatedEntries = [];

  for (const entry of manifest.approved) {
    if (!entry || typeof entry.src !== "string" || typeof entry.lineId !== "string") {
      fail(`${manifestPath}: approved entry without src/lineId: ${JSON.stringify(entry)}`);
    }
    const audioDiskPath = join(publicDir, entry.src);
    if (!existsSync(audioDiskPath)) {
      fail(`${entry.lineId}: src file missing under public/: ${entry.src}`);
    }
    const sourceSha256 = sha256File(audioDiskPath);
    const rejected = checkRejectedSource({
      filePath: entry.src,
      sha256: sourceSha256,
      transcript: entry.text,
    });
    if (rejected.rejected) {
      fail(`${entry.lineId}: ${rejected.reasons.join("; ")}`);
    }

    const lesson = typeof entry.lesson === "number" ? entry.lesson : 0;
    const visemesPublicPath =
      typeof entry.visemes === "string" && entry.visemes.startsWith("/audio/voz/tutor/")
        ? entry.visemes
        : `/audio/voz/tutor/leccion-${lesson}/${entry.lineId}.visemes.json`;
    const visemesDiskPath = join(publicDir, visemesPublicPath);

    if (
      !force &&
      existsSync(visemesDiskPath) &&
      visemesFileMatches(visemesDiskPath, sourceSha256)
    ) {
      skipped += 1;
      updatedEntries.push(entryWithVisemesV1(entry, visemesPublicPath));
      continue;
    }

    if (dryRun) {
      missingOrStale += 1;
      updatedEntries.push(entryWithVisemesV1(entry, visemesPublicPath));
      continue;
    }

    if (!tools.rhubarb) {
      tools.rhubarb = await ensureRhubarbBinary({ repoRoot, autoDownload: true });
    }
    const res = await syncVisemesForAudio({
      audioPath: audioDiskPath,
      publicAudioSrc: entry.src,
      visemesDiskPath,
      repoRoot,
      tools,
      force,
      dryRun: false,
    });
    if (res.status === "built") built += 1;
    updatedEntries.push(entryWithVisemesV1(entry, visemesPublicPath));
  }

  if (!dryRun) {
    const newManifest = { ...manifest, approved: updatedEntries };
    const newText = JSON.stringify(newManifest, null, 2) + "\n";
    if (newText !== manifestText) {
      // Round-trip proof: strip visemes fields and re-serialize — must match original byte for byte.
      const stripped = JSON.parse(newText);
      const roundTrip = {
        ...stripped,
        approved: stripped.approved.map((entry) => {
          const copy = { ...entry };
          delete copy.visemes;
          return copy;
        }),
      };
      if (JSON.stringify(roundTrip, null, 2) + "\n" !== manifestText) {
        fail(
          "manifest round-trip check failed — aborting without writing; nothing else may change",
        );
      }
      writeFileSync(manifestPath, newText);
      console.log("manifest updated with visemes paths (all other fields byte-identical)");
    }
  }

  return { total: manifest.approved.length, built, skipped, missingOrStale };
}

async function processV2Manifest(manifestPath, { force, dryRun, tools }) {
  const manifestText = readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(manifestText);
  if (!Array.isArray(manifest.entries)) {
    fail(`${manifestPath}: v2 manifest has no entries array`);
  }

  let total = 0;
  let built = 0;
  let skipped = 0;
  let missingOrStale = 0;
  let changed = false;

  const updatedEntries = [];
  for (const entry of manifest.entries) {
    const active = entry?.status === "approved" || entry?.status === "validated";
    const src = entry?.audio?.src;
    if (!active || typeof src !== "string" || !src.startsWith("/")) {
      updatedEntries.push(entry);
      continue;
    }

    total += 1;
    const audioDiskPath = join(publicDir, src);
    if (!existsSync(audioDiskPath)) {
      fail(`${entry.id}: audio.src missing under public/: ${src}`);
    }
    const sourceSha256 = sha256File(audioDiskPath);
    const rejected = checkRejectedSource({
      filePath: src,
      sha256: sourceSha256,
      transcript: entry.text,
    });
    if (rejected.rejected) {
      fail(`${entry.id}: ${rejected.reasons.join("; ")}`);
    }

    const lesson = entry.curriculumRefs?.lesson ?? manifest.lesson ?? 0;
    const visemesPublicPath =
      typeof entry.audio?.visemes === "string" &&
      entry.audio.visemes.startsWith("/audio/voz/tutor/")
        ? entry.audio.visemes
        : `/audio/voz/tutor/leccion-${lesson}/${entry.id}.visemes.json`;
    const visemesDiskPath = join(publicDir, visemesPublicPath);

    if (
      !force &&
      existsSync(visemesDiskPath) &&
      visemesFileMatches(visemesDiskPath, sourceSha256)
    ) {
      skipped += 1;
      if (entry.audio.visemes !== visemesPublicPath || entry.audio.sha256 !== sourceSha256) {
        changed = true;
        updatedEntries.push({
          ...entry,
          audio: { ...entry.audio, sha256: sourceSha256, visemes: visemesPublicPath },
        });
      } else {
        updatedEntries.push(entry);
      }
      continue;
    }

    if (dryRun) {
      missingOrStale += 1;
      updatedEntries.push(entry);
      continue;
    }

    if (!tools.rhubarb) {
      tools.rhubarb = await ensureRhubarbBinary({ repoRoot, autoDownload: true });
    }
    const res = await syncVisemesForAudio({
      audioPath: audioDiskPath,
      publicAudioSrc: src,
      visemesDiskPath,
      repoRoot,
      tools,
      force,
      dryRun: false,
    });
    if (res.status === "built") built += 1;
    changed = true;
    updatedEntries.push({
      ...entry,
      audio: {
        ...entry.audio,
        sha256: sourceSha256,
        durationMs:
          typeof res.durationSec === "number"
            ? Math.round(res.durationSec * 1000)
            : (entry.audio?.durationMs ?? null),
        visemes: visemesPublicPath,
      },
    });
  }

  if (!dryRun && changed) {
    mkdirSync(dirname(manifestPath), { recursive: true });
    writeFileSync(
      manifestPath,
      JSON.stringify({ ...manifest, entries: updatedEntries }, null, 2) + "\n",
    );
    console.log(`updated v2 dialogue visemes metadata in ${manifestPath}`);
  }

  return { total, built, skipped, missingOrStale };
}

export async function buildTutorVisemes(argv = process.argv.slice(2)) {
  const force = argv.includes("--force");
  const dryRun = argv.includes("--dry-run") || argv.includes("--check");
  const tools = resolveMediaTools({ repoRoot });
  const targets = discoverTargetManifests(argv);

  let total = 0;
  let built = 0;
  let skipped = 0;
  let missingOrStale = 0;

  for (const manifestPath of targets) {
    if (!existsSync(manifestPath)) fail(`manifest not found: ${manifestPath}`);
    const parsed = JSON.parse(readFileSync(manifestPath, "utf8"));
    const stats = Array.isArray(parsed.approved)
      ? await processV1Manifest(manifestPath, { force, dryRun, tools })
      : await processV2Manifest(manifestPath, { force, dryRun, tools });
    total += stats.total;
    built += stats.built;
    skipped += stats.skipped;
    missingOrStale += stats.missingOrStale;
  }

  if (dryRun && missingOrStale > 0) {
    fail(`${missingOrStale} visemes file(s) missing or stale in dry-run mode`);
  }

  console.log(
    `✓ visemes: ${total} approved entr${total === 1 ? "y" : "ies"} processed across ${targets.length} manifest(s) — ` +
      `${built} built, ${skipped} already up to date (Rhubarb v${RHUBARB_VERSION}, -r ${RHUBARB_RECOGNIZER}, --extendedShapes ${RHUBARB_EXTENDED_SHAPES})`,
  );
  return { total, built, skipped, missingOrStale, manifests: targets.length };
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("build-tutor-visemes.mjs")
) {
  await buildTutorVisemes(process.argv.slice(2));
}
