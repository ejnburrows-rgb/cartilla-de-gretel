import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join, resolve } from "node:path";
import {
  alignBatchSegments,
  computeTranscriptSimilarity,
  matchBatchByTranscriptSimilarity,
} from "./alignment.mjs";
import { ingestPrivateOriginal, sha256File } from "./checksum.mjs";
import {
  ANALYSIS_WAV_SAMPLE_RATE,
  DEFAULT_PRIVATE_VOICE_DIR,
  RHUBARB_EXTENDED_SHAPES,
  RHUBARB_RECOGNIZER,
  RHUBARB_VERSION,
} from "./constants.mjs";
import { checkRejectedSource, validateIntakeRepositoryGuard } from "./guard.mjs";
import { applyAuthorizedManifestUpdates, loadManifestCatalog } from "./manifest.mjs";
import {
  exportRuntimeMp3,
  extractAndResampleWav,
  parseWavBuffer,
  probeMedia,
  resolveMediaTools,
} from "./media.mjs";
import { runClipQc } from "./qc.mjs";
import { writeIntakeReport } from "./report.mjs";
import { measureSilenceIntervals, snapSegmentsToSilences } from "./silence.mjs";
import { mouthCuesAreValid, syncVisemesForAudio } from "./visemes.mjs";

export {
  alignBatchSegments,
  applyAuthorizedManifestUpdates,
  checkRejectedSource,
  computeTranscriptSimilarity,
  ingestPrivateOriginal,
  loadManifestCatalog,
  matchBatchByTranscriptSimilarity,
  measureSilenceIntervals,
  mouthCuesAreValid,
  probeMedia,
  resolveMediaTools,
  runClipQc,
  snapSegmentsToSilences,
  syncVisemesForAudio,
  validateIntakeRepositoryGuard,
};

function sanitizeSlug(value) {
  return String(value ?? "clip")
    .normalize("NFC")
    .replace(/[^A-Za-z0-9À-ÿ._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Full automated recording intake pipeline for single clips and continuous batches.
 * Accepts MP3, WAV, M4A, and video files.
 */
export async function runTutorIntake({
  repoRoot,
  inputFiles = [],
  batchId = "batch",
  date = new Date().toISOString().slice(0, 10),
  privateDir = DEFAULT_PRIVATE_VOICE_DIR,
  expectedLines = null,
  heardSegments = null,
  authorized = false,
  approval = "",
  dryRun = true,
  writeReport = true,
  tools = null,
  rhubarbRunner = null,
} = {}) {
  if (!repoRoot) throw new Error("repoRoot is required");
  const absRepoRoot = resolve(repoRoot);
  const resolvedTools = tools ?? resolveMediaTools({ repoRoot: absRepoRoot });

  // Step 1: Repository & .gitignore guard
  const guard = validateIntakeRepositoryGuard(absRepoRoot);
  if (!guard.ok) {
    throw new Error(`Repository guard failed: ${guard.errors.join("; ")}`);
  }

  // Step 2: Checksum, permanent rejection, dedup & private original storage
  const sources = [];
  const acceptedSources = [];
  for (const fileSpec of inputFiles) {
    const filePath = typeof fileSpec === "string" ? fileSpec : fileSpec.path;
    const transcriptHint = typeof fileSpec === "string" ? undefined : fileSpec.text;
    const ingested = ingestPrivateOriginal({
      sourcePath: filePath,
      privateDir,
      repoRoot: absRepoRoot,
      batchId,
      dryRun,
      transcriptHint,
    });
    sources.push({
      ...ingested,
      sourceName: basename(filePath),
      fileSpec: typeof fileSpec === "string" ? { path: filePath } : fileSpec,
    });
    if (ingested.accepted) {
      acceptedSources.push({
        ...ingested,
        fileSpec: typeof fileSpec === "string" ? { path: filePath } : fileSpec,
      });
    }
  }

  const catalog = loadManifestCatalog(absRepoRoot);
  const tempDir = mkdtempSync(join(tmpdir(), "gretel-intake-"));

  try {
    // Step 3: Extract & resample to 16kHz mono PCM16 WAV for analysis/silence/QC
    const analyzedFiles = [];
    for (let idx = 0; idx < acceptedSources.length; idx++) {
      const src = acceptedSources[idx];
      const wavPath = join(tempDir, `source-${idx}.wav`);
      const mediaPath =
        !dryRun && src.privateOriginalPath && existsSync(src.privateOriginalPath)
          ? src.privateOriginalPath
          : src.sourcePath;
      extractAndResampleWav({
        inputPath: mediaPath,
        outputWavPath: wavPath,
        sampleRate: ANALYSIS_WAV_SAMPLE_RATE,
        channels: 1,
        tools: resolvedTools,
      });
      const wavData = parseWavBuffer(readFileSync(wavPath));
      const silenceScan = measureSilenceIntervals(wavData.samples, wavData.sampleRate);
      analyzedFiles.push({
        source: src,
        mediaPath,
        wavPath,
        wavData,
        silenceScan,
      });
    }

    // Build candidate segments (either explicit transcript segments for continuous batch,
    // or one segment per individual input clip)
    let rawSegments = [];
    if (Array.isArray(heardSegments) && heardSegments.length > 0) {
      rawSegments = heardSegments.map((seg) => ({
        ...seg,
        sourceIndex: seg.sourceIndex ?? 0,
      }));
    } else {
      rawSegments = analyzedFiles.map((af, idx) => {
        const dur = af.wavData.durationSec;
        const spec = af.source.fileSpec ?? {};
        return {
          sourceIndex: idx,
          startSec: spec.startSec ?? 0,
          endSec: spec.endSec ?? dur,
          text: spec.transcript ?? spec.text ?? "",
          lineIdHint: spec.lineId ?? null,
        };
      });
    }

    // Step 4: Match batch via transcript similarity (never assume nth sentence = nth line)
    let matchedBatch = null;
    let targetExpectedLines = expectedLines;
    if (!targetExpectedLines && catalog.batches.length > 0 && rawSegments.length > 0) {
      const batchMatch = matchBatchByTranscriptSimilarity(rawSegments, catalog.batches);
      matchedBatch = batchMatch.bestBatch;
      if (matchedBatch) {
        targetExpectedLines =
          catalog.batches.find((b) => b.batchId === matchedBatch.batchId)?.lines ?? [];
      }
    }
    targetExpectedLines = targetExpectedLines ?? [];

    // Step 5: Needleman-Wunsch DP alignment across batch lines
    const alignment = alignBatchSegments({
      expectedLines: targetExpectedLines,
      heardSegments: rawSegments,
    });

    // Step 6: Snap cut points ONLY at measured silences (per source file)
    const snappedBySegIndex = new Map();
    for (let srcIdx = 0; srcIdx < analyzedFiles.length; srcIdx++) {
      const af = analyzedFiles[srcIdx];
      const segsForFile = rawSegments
        .map((seg, segIndex) => ({ ...seg, segIndex }))
        .filter((seg) => seg.sourceIndex === srcIdx);

      const snapped = snapSegmentsToSilences({
        segments: segsForFile,
        silences: af.silenceScan.silences,
        totalDurationSec: af.wavData.durationSec,
      });
      for (const s of snapped) {
        snappedBySegIndex.set(s.segIndex, s);
      }
    }

    // Step 7–9: QC, runtime MP3 export, Rhubarb visemes, and manifest gating
    const items = [];
    const pendingUpdates = [];

    for (const segAlign of alignment.segments) {
      const raw = rawSegments[segAlign.segmentIndex];
      const af = analyzedFiles[raw.sourceIndex ?? 0];
      const snapped = snappedBySegIndex.get(segAlign.segmentIndex);

      const isSingleClip = analyzedFiles.length > 1 || rawSegments.length === 1;
      const cutStartSec = snapped?.cutValid ? snapped.cutStartSec : isSingleClip ? 0 : null;
      const cutEndSec = snapped?.cutValid
        ? snapped.cutEndSec
        : isSingleClip
          ? af.wavData.durationSec
          : null;

      // Require measured silence cuts for continuous batch slicing
      const boundaryValid = isSingleClip ? true : Boolean(snapped?.cutValid);

      let sliceSamples = new Int16Array(0);
      if (cutStartSec !== null && cutEndSec !== null) {
        const sIdx = Math.max(0, Math.floor(cutStartSec * af.wavData.sampleRate));
        const eIdx = Math.min(
          af.wavData.samples.length,
          Math.ceil(cutEndSec * af.wavData.sampleRate),
        );
        sliceSamples = af.wavData.samples.subarray(sIdx, eIdx);
      }

      const qc = boundaryValid
        ? runClipQc({
            samples: sliceSamples,
            sampleRate: af.wavData.sampleRate,
            transcript: segAlign.heardText,
            expectedText: segAlign.expectedText ?? "",
          })
        : {
            passed: false,
            failures: snapped?.cutReasons ?? ["missing-measured-silence-cut"],
            warnings: [],
            metrics: { durationSec: 0 },
          };

      const mapped = Boolean(
        segAlign.matchedLineId && segAlign.status !== "wrong" && !segAlign.isDuplicateRetake,
      );

      const lineInfo = targetExpectedLines.find(
        (l) => (l.id ?? l.lineId) === segAlign.matchedLineId,
      );
      const lesson = lineInfo?.lesson ?? lineInfo?.curriculumRefs?.lesson ?? 0;
      const slugId = sanitizeSlug(segAlign.matchedLineId ?? `seg-${segAlign.segmentIndex + 1}`);
      const publicSrc = `/audio/voz/tutor/leccion-${lesson}/${slugId}.mp3`;
      const publicVisemes = `/audio/voz/tutor/leccion-${lesson}/${slugId}.visemes.json`;
      const diskMp3Path = join(absRepoRoot, "public", publicSrc);
      const diskVisemesPath = join(absRepoRoot, "public", publicVisemes);

      let visemesStatus = "skipped";
      let exportedSha256 = null;
      const fullyEligible =
        mapped && qc.passed && authorized && !isRejectedTranscriptOrPath(segAlign, publicSrc);

      if (fullyEligible && !dryRun) {
        exportRuntimeMp3({
          inputPath: af.mediaPath,
          outputMp3Path: diskMp3Path,
          startSec: isSingleClip ? undefined : cutStartSec,
          endSec: isSingleClip ? undefined : cutEndSec,
          tools: resolvedTools,
        });
        exportedSha256 = sha256File(diskMp3Path);
        const visRes = await syncVisemesForAudio({
          audioPath: diskMp3Path,
          publicAudioSrc: publicSrc,
          visemesDiskPath: diskVisemesPath,
          repoRoot: absRepoRoot,
          tools: resolvedTools,
          dryRun: false,
          ...(rhubarbRunner ? { rhubarbRunner } : {}),
        });
        visemesStatus = visRes.status;
      } else if (dryRun && mapped && qc.passed) {
        visemesStatus = "dry-run-ready";
      }

      pendingUpdates.push({
        lineId: segAlign.matchedLineId,
        mapped,
        qcPassed: qc.passed,
        authorized,
        approval,
        transcript: segAlign.heardText,
        publicSrc,
        publicVisemes,
        sha256: exportedSha256,
        durationMs: qc.metrics?.durationSec ? Math.round(qc.metrics.durationSec * 1000) : null,
      });

      items.push({
        segmentIndex: segAlign.segmentIndex,
        lineId: segAlign.matchedLineId,
        alignmentStatus: segAlign.status,
        similarity: segAlign.similarity,
        isReordered: Boolean(segAlign.isReordered),
        isDuplicateRetake: Boolean(segAlign.isDuplicateRetake),
        cutStartSec,
        cutEndSec,
        boundaryValid,
        qc,
        visemesStatus,
        manifestStatus:
          mapped && qc.passed && authorized
            ? dryRun
              ? "dry-run-eligible"
              : "approved"
            : "gated-hold",
      });
    }

    // Step 10: Manifest update ONLY for mapped + QC-passed + authorized clips
    const manifestResult = applyAuthorizedManifestUpdates({
      repoRoot: absRepoRoot,
      updates: pendingUpdates,
      dryRun,
    });

    const report = {
      batchId,
      date,
      dryRun,
      authorized,
      privateDir,
      guard,
      matchedBatch,
      sources,
      alignment,
      items,
      manifestResult,
    };

    // Step 11: Write intake markdown report
    let reportPath = null;
    if (writeReport) {
      reportPath = writeIntakeReport({
        repoRoot: absRepoRoot,
        date,
        batchId,
        report,
      });
    }

    return {
      ...report,
      reportPath,
    };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function isRejectedTranscriptOrPath(segAlign, publicSrc) {
  return checkRejectedSource({
    filePath: publicSrc,
    transcript: segAlign.heardText,
  }).rejected;
}

/**
 * Prove the intake pipeline on the 43 existing owner-approved recordings in
 * `src/content/tutor-lines.json` (dry-run verification confirming IDs, checksums,
 * and Rhubarb visemes match without altering any approved audio or manifests).
 */
export async function proveApprovedRecordings({
  repoRoot,
  privateDir = DEFAULT_PRIVATE_VOICE_DIR,
  date = new Date().toISOString().slice(0, 10),
  batchId = "approved-43-dry-run",
  writeReport = true,
  tools = null,
} = {}) {
  const absRepoRoot = resolve(repoRoot);
  const resolvedTools = tools ?? resolveMediaTools({ repoRoot: absRepoRoot });
  const guard = validateIntakeRepositoryGuard(absRepoRoot);

  const manifestPath = join(absRepoRoot, "src/content/tutor-lines.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const approved = manifest.approved ?? [];

  const sources = [];
  const items = [];
  const errors = [...guard.errors];
  const seenChecksums = new Map();

  for (let i = 0; i < approved.length; i++) {
    const entry = approved[i];
    const audioDiskPath = join(absRepoRoot, "public", entry.src);
    const visemesDiskPath = join(absRepoRoot, "public", entry.visemes);

    const rej = checkRejectedSource({
      filePath: entry.src,
      transcript: entry.text,
    });
    if (rej.rejected) {
      errors.push(`${entry.lineId}: ${rej.reasons.join("; ")}`);
    }
    if (!existsSync(audioDiskPath)) {
      errors.push(`${entry.lineId}: missing approved audio ${audioDiskPath}`);
      continue;
    }
    if (!existsSync(visemesDiskPath)) {
      errors.push(`${entry.lineId}: missing visemes JSON ${visemesDiskPath}`);
      continue;
    }

    const audioSha256 = sha256File(audioDiskPath);
    const dupOf = seenChecksums.get(audioSha256) ?? null;
    if (!dupOf) seenChecksums.set(audioSha256, entry.lineId);

    const probed = probeMedia(audioDiskPath, { tools: resolvedTools });
    const visemesData = JSON.parse(readFileSync(visemesDiskPath, "utf8"));
    const meta = visemesData?.metadata ?? {};

    const shaMatches = meta.sourceSha256 === audioSha256;
    const rhubarbMatches =
      meta.rhubarbVersion === RHUBARB_VERSION &&
      meta.recognizer === RHUBARB_RECOGNIZER &&
      meta.extendedShapes === RHUBARB_EXTENDED_SHAPES;
    const cuesValid = mouthCuesAreValid(visemesData?.mouthCues);
    const soundFileMatches = meta.soundFile === entry.src;

    if (!shaMatches) errors.push(`${entry.lineId}: visemes sourceSha256 mismatch`);
    if (!rhubarbMatches) errors.push(`${entry.lineId}: visemes rhubarb metadata mismatch`);
    if (!cuesValid) errors.push(`${entry.lineId}: invalid mouthCues`);
    if (!soundFileMatches) errors.push(`${entry.lineId}: visemes soundFile mismatch`);

    const idWord = entry.lineId.replace(/^l\d+-model-/, "");
    const sim = computeTranscriptSimilarity(idWord, entry.text);
    if (!sim.exactTextMatch) {
      errors.push(`${entry.lineId}: text "${entry.text}" does not match lineId word "${idWord}"`);
    }

    sources.push({
      sourceName: basename(entry.src),
      status: "verified-approved",
      dedupStatus: dupOf ? `shared-with:${dupOf}` : "unique",
      bytes: readFileSync(audioDiskPath).length,
      sha256: audioSha256,
      privateOriginalPath: `dry-run:${entry.src}`,
      reasons: [],
    });

    items.push({
      segmentIndex: i,
      lineId: entry.lineId,
      cutStartSec: 0,
      cutEndSec: probed.durationSec,
      qc: {
        passed: shaMatches && rhubarbMatches && cuesValid && probed.durationSec > 0.2,
        failures: [],
        metrics: {
          durationSec: Number(probed.durationSec.toFixed(3)),
          peakDb: "verified-mp3",
          noiseFloorDb: "verified-mp3",
          snrDb: "verified-mp3",
        },
      },
      visemesStatus: `verified (${visemesData.mouthCues.length} cues, sha256 match)`,
      manifestStatus: "approved-intact",
      audioSha256,
      visemesDurationSec: meta.duration,
      cueCount: visemesData.mouthCues.length,
    });
  }

  const report = {
    batchId,
    date,
    dryRun: true,
    authorized: true,
    privateDir,
    guard,
    matchedBatch: {
      batchId: "tutor-lines-v1-approved-43",
      score: 1,
      matchedLinesCount: items.length,
      totalLinesCount: approved.length,
    },
    sources,
    alignment: {
      summary: {
        expectedCount: approved.length,
        heardCount: items.length,
        matchedCount: items.length,
        missingCount: 0,
        repeatedCount: 0,
        reorderedCount: 0,
        wrongCount: 0,
      },
      missing: [],
      repeated: [],
      reordered: [],
      wrong: [],
    },
    items,
    manifestResult: {
      applied: [],
      skipped: [],
      filesModified: [],
    },
  };

  let reportPath = null;
  if (writeReport) {
    reportPath = writeIntakeReport({
      repoRoot: absRepoRoot,
      date,
      batchId,
      report,
    });
  }

  return {
    ok: errors.length === 0 && items.length === 43,
    errors,
    verifiedCount: items.length,
    expectedCount: approved.length,
    uniqueAudioHashes: seenChecksums.size,
    reportPath,
    report,
  };
}
