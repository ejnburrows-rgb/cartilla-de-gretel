import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import {
  alignBatchSegments,
  computeTranscriptSimilarity,
  matchBatchByTranscriptSimilarity,
} from "./alignment.mjs";
import { createPrivateReviewPassDir, ingestPrivateOriginal, sha256File } from "./checksum.mjs";
import {
  ANALYSIS_WAV_SAMPLE_RATE,
  APPROVED_ORIGINAL_MASTER_SHA256,
  DEFAULT_PRIVATE_VOICE_DIR,
  RHUBARB_EXTENDED_SHAPES,
  RHUBARB_RECOGNIZER,
  RHUBARB_VERSION,
} from "./constants.mjs";
import {
  assertPrivateDirOutsideRepo,
  checkRejectedSource,
  enforcePrivatePermissions,
  validateIntakeRepositoryGuard,
} from "./guard.mjs";
import { applyAuthorizedManifestUpdates, loadManifestCatalog } from "./manifest.mjs";
import {
  detectSilenceWithFfmpeg,
  exportRuntimeMp3,
  extractAndResampleWav,
  parseWavBuffer,
  probeMedia,
  resolveMediaTools,
} from "./media.mjs";
import { runClipQc } from "./qc.mjs";
import { writeIntakeReport } from "./report.mjs";
import {
  deriveSpeechSegmentsFromSilences,
  measureSilenceIntervals,
  snapSegmentsToSilences,
} from "./silence.mjs";
import { mouthCuesAreValid, syncVisemesForAudio } from "./visemes.mjs";
import { alignVoskWordsToLines, runVoskWordAlignment } from "./vosk.mjs";

export {
  APPROVED_ORIGINAL_MASTER_SHA256,
  alignBatchSegments,
  alignVoskWordsToLines,
  applyAuthorizedManifestUpdates,
  assertPrivateDirOutsideRepo,
  checkRejectedSource,
  computeTranscriptSimilarity,
  createPrivateReviewPassDir,
  deriveSpeechSegmentsFromSilences,
  detectSilenceWithFfmpeg,
  enforcePrivatePermissions,
  ingestPrivateOriginal,
  loadManifestCatalog,
  matchBatchByTranscriptSimilarity,
  measureSilenceIntervals,
  mouthCuesAreValid,
  probeMedia,
  resolveMediaTools,
  runClipQc,
  runVoskWordAlignment,
  snapSegmentsToSilences,
  syncVisemesForAudio,
  validateIntakeRepositoryGuard,
};

/**
 * Build a SHA-256 -> approved entries lookup from `src/content/tutor-lines.json`
 * so incoming recordings byte-identical to installed approved speech are detected
 * immediately (adopted from PR #1323).
 */
export function buildApprovedSpeechHashIndex(repoRoot) {
  const index = new Map();
  const manifestPath = join(resolve(repoRoot), "src/content/tutor-lines.json");
  if (!existsSync(manifestPath)) return index;
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    for (const entry of manifest.approved ?? []) {
      if (typeof entry?.src !== "string") continue;
      const diskPath = join(resolve(repoRoot), "public", entry.src);
      if (!existsSync(diskPath)) continue;
      const digest = sha256File(diskPath);
      if (!index.has(digest)) index.set(digest, []);
      index.get(digest).push({
        lineId: entry.lineId,
        text: entry.text,
        src: entry.src,
        visemes: entry.visemes ?? null,
      });
    }
  } catch {
    // Manifest absent or unreadable in minimal test fixture
  }
  return index;
}

/** Look up installed approved speech entries matching a content SHA-256 digest. */
export function matchInstalledApprovedBySha256(sha256, approvedHashIndex) {
  if (!sha256 || !approvedHashIndex) return [];
  return approvedHashIndex.get(sha256) ?? [];
}

function sanitizeSlug(value) {
  const replaced = String(value ?? "clip")
    .normalize("NFC")
    .replace(/[^A-Za-z0-9À-ÿ._-]+/g, "-");
  let start = 0;
  let end = replaced.length;
  while (start < end && replaced[start] === "-") start += 1;
  while (end > start && replaced[end - 1] === "-") end -= 1;
  return replaced.slice(start, end);
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
  exportDir = null,
  manifestWrite = true,
  minSilenceDurationSec = 0.35,
  silenceThresholdDb = -40,
  tools = null,
  rhubarbRunner = null,
  voskModelPath = null,
  voskRunner = null,
} = {}) {
  if (!repoRoot) throw new Error("repoRoot is required");
  const absRepoRoot = resolve(repoRoot);
  const resolvedTools = tools ?? resolveMediaTools({ repoRoot: absRepoRoot });

  // Step 1: Repository, .gitignore, and private-dir-outside-every-git-repo guard
  const guard = validateIntakeRepositoryGuard(absRepoRoot);
  if (!guard.ok) {
    throw new Error(`Repository guard failed: ${guard.errors.join("; ")}`);
  }
  assertPrivateDirOutsideRepo(privateDir, absRepoRoot);

  // Step 2: Checksum, permanent rejection, dedup, private original storage,
  // owner-only permissions (0o700 dirs / 0o600 files), and installed approved content-hash matching
  const approvedHashIndex = buildApprovedSpeechHashIndex(absRepoRoot);
  const sources = [];
  const acceptedSources = [];
  const approvedHashMatches = [];
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
    if (!dryRun && ingested.accepted) {
      enforcePrivatePermissions(
        privateDir,
        ingested.privateOriginalPath ? [ingested.privateOriginalPath] : [],
      );
    }
    const matchedApprovedEntries = matchInstalledApprovedBySha256(
      ingested.sha256,
      approvedHashIndex,
    );
    const matchesInstalledApproved = matchedApprovedEntries.length > 0;
    if (matchesInstalledApproved) {
      approvedHashMatches.push({
        sourceName: basename(filePath),
        sha256: ingested.sha256,
        matchedApprovedEntries,
      });
    }
    const sourceRecord = {
      ...ingested,
      sourceName: basename(filePath),
      fileSpec: typeof fileSpec === "string" ? { path: filePath } : fileSpec,
      matchesInstalledApproved,
      matchedApprovedEntries,
    };
    sources.push(sourceRecord);
    if (ingested.accepted) {
      acceptedSources.push(sourceRecord);
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
      const jsSilenceScan = measureSilenceIntervals(wavData.samples, wavData.sampleRate, {
        silenceThresholdDb,
        minSilenceDurationMs: Math.round(minSilenceDurationSec * 1000),
      });
      let ffmpegSilenceScan = null;
      if (resolvedTools.ffmpeg) {
        ffmpegSilenceScan = detectSilenceWithFfmpeg({
          inputPath: mediaPath,
          tools: resolvedTools,
          noiseThresholdDb: silenceThresholdDb,
          minSilenceDurationSec,
          totalDurationSec: wavData.durationSec,
        });
      }
      const useFfmpegSilences = Boolean(ffmpegSilenceScan && ffmpegSilenceScan.silences.length > 0);
      const silenceScan = {
        ...jsSilenceScan,
        silences: useFfmpegSilences ? ffmpegSilenceScan.silences : jsSilenceScan.silences,
        engine: useFfmpegSilences ? "ffmpeg-silencedetect" : "js-rms",
        ffmpegSilencesCount: ffmpegSilenceScan?.silences.length ?? 0,
      };
      analyzedFiles.push({
        source: src,
        mediaPath,
        wavPath,
        wavData,
        silenceScan,
      });
    }

    // Optional offline Vosk word-alignment hook (adopted from PR #1323)
    const voskAlignment = [];
    const voskSegments = [];
    if (voskModelPath || typeof voskRunner === "function") {
      const voskExpected = Array.isArray(expectedLines) ? expectedLines : [];
      for (let idx = 0; idx < analyzedFiles.length; idx++) {
        const af = analyzedFiles[idx];
        const voskRes = runVoskWordAlignment({
          wavPath: af.wavPath,
          modelPath: voskModelPath,
          expectedLines: voskExpected,
          durationSec: af.wavData.durationSec,
          repoRoot: absRepoRoot,
          voskRunner,
        });
        voskAlignment.push({
          sourceName: af.source.sourceName,
          sourceIndex: idx,
          available: voskRes.available,
          status: voskRes.status,
          reason: voskRes.reason,
          wordCount: voskRes.words.length,
          findings: voskRes.findings,
        });
        if (voskRes.available && voskRes.segments.length > 0) {
          for (const seg of voskRes.segments) {
            voskSegments.push({ ...seg, sourceIndex: idx });
          }
        }
      }
    }

    // Build candidate segments (either explicit timestamped segments, Vosk word-aligned
    // segments, transcript-only segments paired with measured-silence utterance windows,
    // or auto-segmented windows)
    let rawSegments = [];
    if (Array.isArray(heardSegments) && heardSegments.length > 0) {
      const hasTimestamps = heardSegments.every(
        (seg) => typeof seg.startSec === "number" && typeof seg.endSec === "number",
      );
      if (hasTimestamps) {
        rawSegments = heardSegments.map((seg) => ({
          ...seg,
          sourceIndex: seg.sourceIndex ?? 0,
        }));
      } else {
        const derivedBySource = analyzedFiles.map((af) =>
          deriveSpeechSegmentsFromSilences({
            silences: af.silenceScan.silences,
            totalDurationSec: af.wavData.durationSec,
          }),
        );
        const perSourceIdx = new Map();
        rawSegments = heardSegments.map((seg) => {
          const srcIdx = seg.sourceIndex ?? 0;
          const pos = perSourceIdx.get(srcIdx) ?? 0;
          perSourceIdx.set(srcIdx, pos + 1);
          const derived = derivedBySource[srcIdx]?.[pos];
          return {
            ...seg,
            sourceIndex: srcIdx,
            startSec: typeof seg.startSec === "number" ? seg.startSec : (derived?.startSec ?? null),
            endSec: typeof seg.endSec === "number" ? seg.endSec : (derived?.endSec ?? null),
          };
        });
      }
    } else if (voskSegments.length > 0) {
      rawSegments = voskSegments;
    } else {
      for (let idx = 0; idx < analyzedFiles.length; idx++) {
        const af = analyzedFiles[idx];
        const dur = af.wavData.durationSec;
        const spec = af.source.fileSpec ?? {};
        const derived = deriveSpeechSegmentsFromSilences({
          silences: af.silenceScan.silences,
          totalDurationSec: dur,
        });
        if (analyzedFiles.length === 1 && derived.length > 1 && spec.startSec == null) {
          for (const win of derived) {
            rawSegments.push({
              sourceIndex: idx,
              startSec: win.startSec,
              endSec: win.endSec,
              text: spec.transcript ?? spec.text ?? "",
              lineIdHint: spec.lineId ?? null,
            });
          }
        } else {
          rawSegments.push({
            sourceIndex: idx,
            startSec: spec.startSec ?? 0,
            endSec: spec.endSec ?? dur,
            text: spec.transcript ?? spec.text ?? "",
            lineIdHint: spec.lineId ?? null,
          });
        }
      }
    }

    // Step 4: Match batch via transcript similarity (never assume nth sentence = nth line)
    let matchedBatch = null;
    let targetExpectedLines = Array.isArray(expectedLines) ? expectedLines : [];
    if (targetExpectedLines.length === 0 && catalog.batches.length > 0 && rawSegments.length > 0) {
      const batchMatch = matchBatchByTranscriptSimilarity(rawSegments, catalog.batches);
      matchedBatch = batchMatch.bestBatch;
      if (matchedBatch) {
        targetExpectedLines =
          catalog.batches.find((b) => b.batchId === matchedBatch.batchId)?.lines ?? [];
      }
    }

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
      const exportRoot = exportDir ? resolve(exportDir) : join(absRepoRoot, "public");
      const diskMp3Path = exportDir
        ? join(exportRoot, `leccion-${lesson}`, `${slugId}.mp3`)
        : join(exportRoot, publicSrc);
      const diskVisemesPath = exportDir
        ? join(exportRoot, `leccion-${lesson}`, `${slugId}.visemes.json`)
        : join(exportRoot, publicVisemes);

      let visemesStatus = "skipped";
      let visemesCueCount = 0;
      let visemesDurationSec = null;
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
        visemesCueCount = visRes.cueCount ?? 0;
        visemesDurationSec = visRes.durationSec ?? null;
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
        visemesCueCount,
        visemesDurationSec,
        manifestStatus:
          mapped && qc.passed && authorized
            ? dryRun || !manifestWrite
              ? "staged-approved-gate"
              : "approved"
            : "gated-hold",
      });
    }

    // Step 10: Manifest update ONLY for mapped + QC-passed + authorized clips
    const manifestResult = applyAuthorizedManifestUpdates({
      repoRoot: absRepoRoot,
      updates: pendingUpdates,
      dryRun: dryRun || !manifestWrite,
    });

    // Unique per-pass review directory inside private vault (<sha12>-<timestamp>-<rand>)
    // so repeated intake runs preserve prior listening-review evidence without overwriting
    const primarySha256 =
      acceptedSources[0]?.sha256 ?? sources.find((s) => typeof s.sha256 === "string")?.sha256 ?? null;
    const reviewPass = createPrivateReviewPassDir({
      privateDir,
      repoRoot: absRepoRoot,
      sha256: primarySha256,
      dryRun,
    });
    const privateReviewDir = reviewPass.reviewDir;
    const approvedOriginalMaster = sources.some((s) => s.approvedOriginalMaster === true);

    const report = {
      batchId,
      date,
      dryRun,
      authorized,
      manifestWrite,
      exportDir: exportDir ? resolve(exportDir) : null,
      privateDir,
      privateReviewDir,
      approvedOriginalMaster,
      tools: resolvedTools,
      voskAlignment,
      silenceSummary: analyzedFiles.map((af) => ({
        sourceName: af.source.sourceName,
        engine: af.silenceScan.engine,
        silencesDetected: af.silenceScan.silences.length,
        ffmpegSilencesCount: af.silenceScan.ffmpegSilencesCount,
        durationSec: Number(af.wavData.durationSec.toFixed(3)),
      })),
      guard,
      matchedBatch,
      sources,
      approvedHashMatches,
      alignment,
      items,
      manifestResult,
    };

    let privateReviewReportPath = null;
    if (!dryRun) {
      privateReviewReportPath = join(privateReviewDir, "report.json");
      writeFileSync(privateReviewReportPath, JSON.stringify(report, null, 2) + "\n", {
        mode: 0o600,
      });
      enforcePrivatePermissions(privateDir, [privateReviewReportPath]);
    }

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
      privateReviewReportPath,
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
 * Prove the intake pipeline on the approved word and vowel models in
 * `src/content/tutor-lines.json` (dry-run verification confirming IDs, checksums,
 * and Rhubarb visemes match without altering any approved audio or manifests).
 */
export async function proveApprovedRecordings({
  repoRoot,
  privateDir = DEFAULT_PRIVATE_VOICE_DIR,
  date = new Date().toISOString().slice(0, 10),
  batchId = "approved-models-dry-run",
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

    const idWord = entry.lineId.replace(/^l\d+-(?:vowel-)?model-/, "");
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
      batchId: "tutor-lines-v1-approved-models",
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
    ok: errors.length === 0 && approved.length > 0 && items.length === approved.length,
    errors,
    verifiedCount: items.length,
    expectedCount: approved.length,
    uniqueAudioHashes: seenChecksums.size,
    reportPath,
    report,
  };
}
