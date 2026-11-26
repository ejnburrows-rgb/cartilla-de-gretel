import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALLOWED_MOUTH_SHAPE_SET,
  RHUBARB_EXTENDED_SHAPES,
  RHUBARB_RECOGNIZER,
  RHUBARB_VERSION,
  VISEME_WAV_SAMPLE_RATE,
} from "./constants.mjs";
import { sha256File } from "./checksum.mjs";
import { checkRejectedSource } from "./guard.mjs";
import { extractAndResampleWav, resolveMediaTools } from "./media.mjs";

const DEFAULT_REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const PINNED_RHUBARB_LINUX_URL = `https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v${RHUBARB_VERSION}/Rhubarb-Lip-Sync-${RHUBARB_VERSION}-Linux.zip`;
export const PINNED_RHUBARB_LINUX_SHA256 =
  "a9a9074862cff47b2d59b8bf399a678a3b0b74f9452ad6ad94cb292913dd8667";

/** Validate Rhubarb mouth cues: non-empty, allowed shapes (A..H, X), monotonic times. */
export function mouthCuesAreValid(cues) {
  if (!Array.isArray(cues) || cues.length === 0) return false;
  let previousEnd = 0;
  for (const cue of cues) {
    if (!cue || typeof cue.value !== "string" || !ALLOWED_MOUTH_SHAPE_SET.has(cue.value)) {
      return false;
    }
    if (typeof cue.start !== "number" || typeof cue.end !== "number") return false;
    if (!(cue.start >= 0) || !(cue.start >= previousEnd - 1e-6) || !(cue.end > cue.start)) {
      return false;
    }
    previousEnd = cue.end;
  }
  return true;
}

/** True when an existing visemes JSON matches audio SHA-256 and pinned Rhubarb flags. */
export function visemesFileMatches(visemesDiskPath, sourceSha256) {
  try {
    const data = JSON.parse(readFileSync(visemesDiskPath, "utf8"));
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
 * Ensure Rhubarb binary is available via `.tools/`, `PATH`, explicit override,
 * or (on Linux x64 when `autoDownload: true`) pinned MIT release download.
 */
export async function ensureRhubarbBinary({
  repoRoot = DEFAULT_REPO_ROOT,
  rhubarbPath,
  autoDownload = true,
} = {}) {
  const tools = resolveMediaTools({ repoRoot, rhubarbPath });
  if (tools.rhubarb) return tools.rhubarb;

  if (autoDownload && process.platform === "linux" && process.arch === "x64" && repoRoot) {
    const toolsDir = join(repoRoot, ".tools");
    const targetBin = join(toolsDir, `Rhubarb-Lip-Sync-${RHUBARB_VERSION}-Linux`, "rhubarb");
    if (existsSync(targetBin)) return targetBin;

    mkdirSync(toolsDir, { recursive: true });
    const zipPath = join(toolsDir, `rhubarb-${RHUBARB_VERSION}.zip`);
    const response = await fetch(PINNED_RHUBARB_LINUX_URL);
    if (!response.ok) {
      throw new Error(
        `Rhubarb download failed: HTTP ${response.status} for ${PINNED_RHUBARB_LINUX_URL}`,
      );
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (digest !== PINNED_RHUBARB_LINUX_SHA256) {
      throw new Error(
        `SHA-256 mismatch for ${PINNED_RHUBARB_LINUX_URL}: got ${digest}, expected ${PINNED_RHUBARB_LINUX_SHA256}`,
      );
    }
    writeFileSync(zipPath, bytes);
    execFileSync("unzip", ["-o", "-q", zipPath, "-d", toolsDir], { stdio: "pipe" });
    rmSync(zipPath, { force: true });
    if (existsSync(targetBin)) return targetBin;
  }

  throw new Error(
    `Rhubarb Lip Sync binary not found (checked explicit path, RHUBARB_PATH, .tools/, and PATH on ${process.platform}/${process.arch})`,
  );
}

/** Run Rhubarb with `-r phonetic -f json --extendedShapes GX`. */
export function runRhubarbCli(rhubarbBinary, wavPath, outputJsonPath) {
  execFileSync(
    rhubarbBinary,
    [
      "-r",
      RHUBARB_RECOGNIZER,
      "-f",
      "json",
      "--extendedShapes",
      RHUBARB_EXTENDED_SHAPES,
      "-o",
      outputJsonPath,
      wavPath,
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  return JSON.parse(readFileSync(outputJsonPath, "utf8"));
}

/**
 * Verify or build a `.visemes.json` file for one audio clip.
 * Never touches rejected sources.
 */
export async function syncVisemesForAudio({
  audioPath,
  publicAudioSrc,
  visemesDiskPath,
  repoRoot,
  tools,
  force = false,
  dryRun = false,
  autoDownloadRhubarb = true,
  rhubarbRunner = runRhubarbCli,
}) {
  const sourceSha256 = sha256File(audioPath);
  const rejected = checkRejectedSource({
    filePath: publicAudioSrc || audioPath,
    sha256: sourceSha256,
  });
  if (rejected.rejected) {
    throw new Error(`Refusing visemes for rejected audio: ${rejected.reasons.join("; ")}`);
  }

  if (!force && existsSync(visemesDiskPath) && visemesFileMatches(visemesDiskPath, sourceSha256)) {
    const existing = JSON.parse(readFileSync(visemesDiskPath, "utf8"));
    return {
      status: "up-to-date",
      sourceSha256,
      durationSec: existing.metadata?.duration ?? null,
      cueCount: existing.mouthCues?.length ?? 0,
      visemesDiskPath,
    };
  }

  if (dryRun) {
    return {
      status: existsSync(visemesDiskPath) ? "stale-or-mismatch" : "missing",
      sourceSha256,
      durationSec: null,
      cueCount: 0,
      visemesDiskPath,
    };
  }

  const autoTools = resolveMediaTools({ repoRoot: repoRoot ?? DEFAULT_REPO_ROOT });
  const resolvedTools = tools
    ? {
        ffmpeg: tools.ffmpeg === undefined ? autoTools.ffmpeg : tools.ffmpeg,
        ffprobe: tools.ffprobe === undefined ? autoTools.ffprobe : tools.ffprobe,
        rhubarb: tools.rhubarb === undefined ? autoTools.rhubarb : tools.rhubarb,
      }
    : autoTools;
  const rhubarb =
    resolvedTools.rhubarb ??
    (await ensureRhubarbBinary({
      repoRoot: repoRoot ?? DEFAULT_REPO_ROOT,
      autoDownload: autoDownloadRhubarb,
    }));

  const tempDir = mkdtempSync(join(tmpdir(), "gretel-visemes-"));
  try {
    const wavPath =
      extname(audioPath).toLowerCase() === ".wav" && !resolvedTools.ffmpeg
        ? audioPath
        : join(tempDir, "clip.wav");
    if (wavPath !== audioPath) {
      extractAndResampleWav({
        inputPath: audioPath,
        outputWavPath: wavPath,
        sampleRate: VISEME_WAV_SAMPLE_RATE,
        channels: 1,
        tools: resolvedTools,
      });
    }
    const rawJsonPath = join(tempDir, "raw.visemes.json");
    const rhubarbOutput = rhubarbRunner(rhubarb, wavPath, rawJsonPath);
    if (!mouthCuesAreValid(rhubarbOutput?.mouthCues)) {
      throw new Error(
        `Rhubarb output failed shape/monotonic-time validation for ${publicAudioSrc}`,
      );
    }
    if (typeof rhubarbOutput?.metadata?.duration !== "number") {
      throw new Error(`Rhubarb metadata missing numeric duration for ${publicAudioSrc}`);
    }

    const visemesJson = {
      metadata: {
        soundFile: publicAudioSrc,
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

    return {
      status: "built",
      sourceSha256,
      durationSec: rhubarbOutput.metadata.duration,
      cueCount: rhubarbOutput.mouthCues.length,
      visemesDiskPath,
    };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}
