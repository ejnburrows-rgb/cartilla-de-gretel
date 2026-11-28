import { execFileSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  APPROVED_ORIGINAL_MASTER_SHA256,
  alignBatchSegments,
  alignVoskWordsToLines,
  applyAuthorizedManifestUpdates,
  buildApprovedSpeechHashIndex,
  checkRejectedSource,
  computeTranscriptSimilarity,
  createPrivateReviewPassDir,
  deriveSpeechSegmentsFromSilences,
  enforcePrivatePermissions,
  ingestPrivateOriginal,
  matchBatchByTranscriptSimilarity,
  matchInstalledApprovedBySha256,
  measureSilenceIntervals,
  mouthCuesAreValid,
  proveApprovedRecordings,
  resolveMediaTools,
  runClipQc,
  runTutorIntake,
  runVoskWordAlignment,
  snapSegmentsToSilences,
  syncVisemesForAudio,
  validateIntakeRepositoryGuard,
} from "../tutor-intake/index.mjs";
import {
  assertPrivateDirOutsideRepo,
  verifyGitignorePrivateExclusions,
} from "../tutor-intake/guard.mjs";
import { needlemanWunschAlign } from "../tutor-intake/alignment.mjs";
import {
  encodeWavPcm16,
  extractAndResampleWav,
  FFMPEG_SECURITY_FLAGS,
  FFPROBE_SECURITY_FLAGS,
  parseWavBuffer,
  resolveFixedSystemBinary,
} from "../tutor-intake/media.mjs";
import { computeSpectralFlatnessStats } from "../tutor-intake/qc.mjs";
import { parseFfmpegSilencedetect } from "../tutor-intake/silence.mjs";

const REPO_ROOT = resolve(import.meta.dirname, "../..");
const tempDirs = [];

function makeTempDir(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

/** Generate deterministic mono PCM16 speech-like modulated tone segments separated by silences. */
function buildSpeechSamples(durationSec, sampleRate = 16000, amplitude = 9000, freqHz = 280) {
  const len = Math.round(durationSec * sampleRate);
  const out = new Int16Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate;
    const envelope = Math.sin(Math.PI * Math.min(1, t / durationSec));
    const mod = 0.65 + 0.35 * Math.sin(2 * Math.PI * 6 * t);
    out[i] = Math.round(
      amplitude *
        envelope *
        mod *
        (0.7 * Math.sin(2 * Math.PI * freqHz * t) +
          0.3 * Math.sin(2 * Math.PI * (freqHz * 2.1) * t)),
    );
  }
  return out;
}

function concatSamples(chunks) {
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Int16Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

describe("tutor-intake guard, .gitignore, and permanent rejections", () => {
  it("verifies .gitignore excludes private voice dirs and repo guard passes", () => {
    const gi = verifyGitignorePrivateExclusions(REPO_ROOT);
    expect(gi.ok).toBe(true);
    expect(gi.missing).toEqual([]);

    const guard = validateIntakeRepositoryGuard(REPO_ROOT);
    expect(guard.ok).toBe(true);
    expect(guard.errors).toEqual([]);
  });

  it("refuses placing private originals inside the repository", () => {
    expect(() =>
      assertPrivateDirOutsideRepo(join(REPO_ROOT, "GretelVoicePrivate"), REPO_ROOT),
    ).toThrow(/must be outside repository/i);
    expect(() => assertPrivateDirOutsideRepo(join(REPO_ROOT, "public/audio"), REPO_ROOT)).toThrow(
      /must be outside repository/i,
    );
  });

  it("permanently rejects 67-clip ZIP, rec_gretel_*, and nina-sordita.mp3 (by path and SHA-256)", () => {
    const zipCheck = checkRejectedSource({
      filePath: "/tmp/Gretel_67_Audio_Lecciones_Listo.zip",
    });
    expect(zipCheck.rejected).toBe(true);

    const recCheck = checkRejectedSource({
      filePath: "/tmp/rec_gretel_01.mp3",
    });
    expect(recCheck.rejected).toBe(true);

    const sorditaPathCheck = checkRejectedSource({
      filePath: "/tmp/nina-sordita.mp3",
    });
    expect(sorditaPathCheck.rejected).toBe(true);

    // Even if renamed, the exact nina-sordita.mp3 SHA-256 is permanently rejected
    const privateDir = makeTempDir("gretel-priv-reject-");
    const workDir = makeTempDir("gretel-src-reject-");
    const renamedSordita = join(workDir, "innocent-name.mp3");
    copyFileSync(join(REPO_ROOT, "public/audio/voz/vocabulario/nina-sordita.mp3"), renamedSordita);
    const ingested = ingestPrivateOriginal({
      sourcePath: renamedSordita,
      privateDir,
      repoRoot: REPO_ROOT,
      batchId: "reject-test",
    });
    expect(ingested.accepted).toBe(false);
    expect(ingested.status).toBe("rejected");
    expect(ingested.sha256).toBe(
      "40400ef648db825bf5da6b732db97bc66b097192f3f6288b7bdb44d6788bbc91",
    );
  });

  it("accepts MP3, WAV, M4A, and video extensions and deduplicates by SHA-256 in private storage", () => {
    const privateDir = makeTempDir("gretel-priv-dedup-");
    const srcDir = makeTempDir("gretel-src-dedup-");

    for (const ext of [".mp3", ".wav", ".m4a", ".mp4", ".mov"]) {
      const file = join(srcDir, `sample${ext}`);
      writeFileSync(file, `fake-media-bytes-${ext}`);
      const first = ingestPrivateOriginal({
        sourcePath: file,
        privateDir,
        repoRoot: REPO_ROOT,
        batchId: "b1",
      });
      expect(first.accepted).toBe(true);
      expect(first.dedupStatus).toBe("new");
      expect(existsSync(first.privateOriginalPath)).toBe(true);

      const copy = join(srcDir, `duplicate${ext}`);
      writeFileSync(copy, `fake-media-bytes-${ext}`);
      const second = ingestPrivateOriginal({
        sourcePath: copy,
        privateDir,
        repoRoot: REPO_ROOT,
        batchId: "b2",
      });
      expect(second.accepted).toBe(true);
      expect(second.dedupStatus).toBe("duplicate");
      expect(second.privateOriginalPath).toBe(first.privateOriginalPath);
    }
  });
});

describe("transcript matching and Needleman-Wunsch DP alignment", () => {
  it("matches batches by transcript similarity without positional assumptions", () => {
    const candidateBatches = [
      {
        batchId: "B001-universal",
        lines: [
          { id: "u-01", seq: 1, text: "¡Muy bien! Lo lograste." },
          { id: "u-02", seq: 2, text: "Intentemos una vez más." },
          { id: "u-03", seq: 3, text: "Escucha con atención esta palabra." },
        ],
      },
      {
        batchId: "B002-vocal-o",
        lines: [
          { id: "o-01", seq: 1, text: "Hoy practicamos la vocal o." },
          { id: "o-02", seq: 2, text: "Di la palabra oso conmigo." },
        ],
      },
    ];

    const heardOutOfOrder = [
      { text: "escucha con atencion esta palabra", startSec: 0.2, endSec: 2.0 },
      { text: "muy bien lo lograste", startSec: 2.5, endSec: 4.1 },
    ];
    const match = matchBatchByTranscriptSimilarity(heardOutOfOrder, candidateBatches);
    expect(match.bestBatch?.batchId).toBe("B001-universal");
  });

  it("detects missing, repeated, reordered, and wrong lines via Needleman-Wunsch DP", () => {
    const nw = needlemanWunschAlign(
      ["vamos", "a", "practicar", "juntos"],
      ["vamos", "practicar", "todos", "juntos"],
    );
    expect(nw.missingTokens).toEqual(["a"]);
    expect(nw.extraTokens).toEqual(["todos"]);
    expect(nw.matchedTokens).toBe(3);

    const expectedLines = [
      { id: "l-1", seq: 1, text: "¡Hola! Vamos a comenzar." },
      { id: "l-2", seq: 2, text: "Escucha la palabra oso." },
      { id: "l-3", seq: 3, text: "Ahora repite conmigo: abanico." },
      { id: "l-4", seq: 4, text: "¡Excelente trabajo!" },
    ];

    // Heard segments: l-3 spoken before l-2 (reordered), l-4 repeated twice, l-1 missing, plus a wrong line
    const heardSegments = [
      { startSec: 0.3, endSec: 1.8, text: "ahora repite conmigo abanico" },
      { startSec: 2.2, endSec: 3.7, text: "escucha la palabra oso" },
      { startSec: 4.1, endSec: 5.5, text: "excelente trabajo" },
      { startSec: 6.0, endSec: 7.4, text: "excelente trabajo" },
      { startSec: 7.8, endSec: 9.2, text: "esta frase no pertenece al guion" },
    ];

    const alignment = alignBatchSegments({ expectedLines, heardSegments });
    expect(alignment.missing.map((m) => m.lineId)).toEqual(["l-1"]);
    expect(alignment.repeated.map((r) => r.lineId)).toEqual(["l-4"]);
    expect(alignment.reordered.map((o) => o.lineId)).toEqual(["l-2"]);
    expect(alignment.wrong.length).toBe(1);
    expect(alignment.wrong[0].heardText).toContain("no pertenece");
    expect(alignment.summary.matchedCount).toBe(3);
  });
});

describe("measured-silence cut points and audio QC", () => {
  it("snaps cut points only at measured silences and rejects mid-speech cuts", () => {
    const sr = 16000;
    const silence = new Int16Array(Math.round(0.4 * sr)); // 400ms true silence
    const speech1 = buildSpeechSamples(0.8, sr);
    const speech2 = buildSpeechSamples(0.7, sr);
    const combined = concatSamples([silence, speech1, silence, speech2, silence]);

    const scan = measureSilenceIntervals(combined, sr);
    expect(scan.silences.length).toBe(3);

    const snapped = snapSegmentsToSilences({
      segments: [
        { startSec: 0.38, endSec: 1.22, text: "primera linea" },
        { startSec: 1.58, endSec: 2.32, text: "segunda linea" },
      ],
      silences: scan.silences,
      totalDurationSec: combined.length / sr,
    });
    expect(snapped[0].cutValid).toBe(true);
    expect(snapped[1].cutValid).toBe(true);
    expect(snapped[0].cutStartSec).toBeGreaterThanOrEqual(scan.silences[0].startSec);
    expect(snapped[0].cutStartSec).toBeLessThanOrEqual(scan.silences[0].endSec);
    expect(snapped[0].cutEndSec).toBeGreaterThanOrEqual(scan.silences[1].startSec);
    expect(snapped[0].cutEndSec).toBeLessThanOrEqual(scan.silences[1].endSec);

    // No silence at 5.0s -> refuses blind cut
    const impossible = snapSegmentsToSilences({
      segments: [{ startSec: 5.0, endSec: 6.0, text: "sin silencio" }],
      silences: scan.silences,
      totalDurationSec: 8.0,
    });
    expect(impossible[0].cutValid).toBe(false);
    expect(impossible[0].cutReasons.join(" ")).toMatch(/No measured silence/);

    const parsedStderr = parseFfmpegSilencedetect(
      "[silencedetect @ 0x1] silence_start: 0.0\n[silencedetect @ 0x1] silence_end: 0.42 | silence_duration: 0.42",
    );
    expect(parsedStderr).toHaveLength(1);
    expect(parsedStderr[0].midpointSec).toBeCloseTo(0.21, 3);
  });

  it("detects clipping, noise, background music, stutter, and duration failures in QC", () => {
    const sr = 16000;
    const pad = new Int16Array(Math.round(0.15 * sr));

    // 1. Clean speech passes
    const clean = concatSamples([pad, buildSpeechSamples(0.9, sr, 9000), pad]);
    const cleanQc = runClipQc({
      samples: clean,
      sampleRate: sr,
      transcript: "vamos a empezar",
      expectedText: "Vamos a empezar.",
    });
    expect(cleanQc.passed).toBe(true);

    // 2. Clipping fails
    const clipped = new Int16Array(clean);
    for (let i = 4000; i < 4040; i++) clipped[i] = 32767;
    const clipQc = runClipQc({ samples: clipped, sampleRate: sr });
    expect(clipQc.passed).toBe(false);
    expect(clipQc.failures.join(" ")).toContain("clipping");

    // 3. Excessive noise fails
    const noisy = concatSamples([pad, buildSpeechSamples(0.8, sr, 4000), pad]);
    for (let i = 0; i < noisy.length; i++) {
      const pseudoNoise = Math.round(2800 * Math.sin(i * 1.73 + Math.cos(i * 0.37) * 5));
      noisy[i] = Math.max(-32767, Math.min(32767, noisy[i] + pseudoNoise));
    }
    const noiseQc = runClipQc({ samples: noisy, sampleRate: sr });
    expect(noiseQc.passed).toBe(false);
    expect(noiseQc.failures.join(" ")).toMatch(/excessive-noise|low-snr/);

    // 4. Continuous music bed fails
    const musicBed = new Int16Array(Math.round(1.2 * sr));
    const speechCore = buildSpeechSamples(0.8, sr, 9000);
    for (let i = 0; i < musicBed.length; i++) {
      const t = i / sr;
      const chord = Math.round(
        1800 * (Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 330 * t)) * 0.5,
      );
      const sp = i >= 3200 && i - 3200 < speechCore.length ? speechCore[i - 3200] : 0;
      musicBed[i] = Math.max(-32767, Math.min(32767, chord + sp));
    }
    const musicQc = runClipQc({ samples: musicBed, sampleRate: sr });
    expect(musicQc.passed).toBe(false);
    expect(musicQc.failures.join(" ")).toContain("music-or-continuous-bed");

    // 5. Stutter (transcript and acoustic) fails
    const stutterTextQc = runClipQc({
      samples: clean,
      sampleRate: sr,
      transcript: "va vamos a empezar",
      expectedText: "Vamos a empezar.",
    });
    expect(stutterTextQc.passed).toBe(false);
    expect(stutterTextQc.failures.join(" ")).toContain("stutter");

    const burst = buildSpeechSamples(0.08, sr, 8500);
    const gap = new Int16Array(Math.round(0.22 * sr));
    const mainWord = buildSpeechSamples(0.5, sr, 9500);
    const acousticStutterSamples = concatSamples([pad, burst, gap, mainWord, pad]);
    const acousticStutterQc = runClipQc({
      samples: acousticStutterSamples,
      sampleRate: sr,
      transcript: "oso",
      expectedText: "oso",
    });
    expect(acousticStutterQc.passed).toBe(false);
    expect(acousticStutterQc.failures.join(" ")).toContain("stutter");

    // 6. Duration too short fails
    const tinyQc = runClipQc({ samples: new Int16Array(800), sampleRate: sr });
    expect(tinyQc.passed).toBe(false);
    expect(tinyQc.failures.join(" ")).toContain("duration-too-short");
  });
});

describe("manifest gating, visemes sync, and end-to-end intake", () => {
  it("discovers tools in .tools/ and enforces mapped + QC-passed + authorized gating", async () => {
    const fakeRepo = makeTempDir("gretel-fake-repo-");
    const privateDir = makeTempDir("gretel-fake-priv-");
    mkdirSync(join(fakeRepo, ".tools/bin"), { recursive: true });
    mkdirSync(join(fakeRepo, "src/content/tutor-dialogue"), { recursive: true });
    mkdirSync(join(fakeRepo, "public/audio/voz/tutor"), { recursive: true });

    writeFileSync(
      join(fakeRepo, ".gitignore"),
      "GretelVoicePrivate/\n.gretel-voice-private/\npublic/audio/private/\n",
    );
    const fakeFfmpeg = join(fakeRepo, ".tools/bin/ffmpeg");
    const fakeFfprobe = join(fakeRepo, ".tools/bin/ffprobe");
    const fakeRhubarbTargetDir = join(fakeRepo, ".tools/rhubarb");
    const fakeRhubarbTarget = join(fakeRhubarbTargetDir, "rhubarb");
    const fakeRhubarbLink = join(fakeRepo, ".tools/bin/rhubarb");
    mkdirSync(fakeRhubarbTargetDir, { recursive: true });
    writeFileSync(fakeFfmpeg, "#!/bin/sh\nexit 0\n");
    writeFileSync(fakeFfprobe, "#!/bin/sh\nexit 0\n");
    writeFileSync(fakeRhubarbTarget, "#!/bin/sh\nexit 0\n");
    chmodSync(fakeFfmpeg, 0o755);
    chmodSync(fakeFfprobe, 0o755);
    chmodSync(fakeRhubarbTarget, 0o755);
    symlinkSync("../rhubarb/rhubarb", fakeRhubarbLink);

    const tools = resolveMediaTools({ repoRoot: fakeRepo });
    expect(tools.ffmpeg).toBe(fakeFfmpeg);
    expect(tools.ffprobe).toBe(fakeFfprobe);
    expect(tools.rhubarb).toBe(fakeRhubarbLink);

    // V2 manifest gating check: unmapped / QC-failed / unauthorized must NOT update manifest
    const v2Path = join(fakeRepo, "src/content/tutor-dialogue/universal.json");
    writeFileSync(
      v2Path,
      JSON.stringify(
        {
          version: 2,
          scope: "universal",
          batchIds: ["B001"],
          entries: [
            {
              id: "u-01",
              text: "Hola, vamos a empezar.",
              batch: "B001",
              seq: 1,
              file: "u-01.mp3",
              status: "scripted",
              audio: {},
            },
            {
              id: "u-02",
              text: "Muy bien, sigue así.",
              batch: "B001",
              seq: 2,
              file: "u-02.mp3",
              status: "scripted",
              audio: {},
            },
          ],
        },
        null,
        2,
      ) + "\n",
    );

    const gated = applyAuthorizedManifestUpdates({
      repoRoot: fakeRepo,
      dryRun: false,
      updates: [
        {
          lineId: "u-01",
          mapped: true,
          qcPassed: true,
          authorized: false, // NOT authorized!
          approval: "",
          publicSrc: "/audio/voz/tutor/leccion-0/u-01.mp3",
        },
        {
          lineId: "u-02",
          mapped: true,
          qcPassed: false, // QC failed!
          authorized: true,
          approval: "Owner 2026-11-26",
          publicSrc: "/audio/voz/tutor/leccion-0/u-02.mp3",
        },
      ],
    });
    expect(gated.applied).toEqual([]);
    expect(gated.skipped).toHaveLength(2);

    const afterGate = JSON.parse(readFileSync(v2Path, "utf8"));
    expect(afterGate.entries[0].status).toBe("scripted");
    expect(afterGate.entries[1].status).toBe("scripted");

    // Only mapped + QC-passed + authorized updates manifest
    const allowed = applyAuthorizedManifestUpdates({
      repoRoot: fakeRepo,
      dryRun: false,
      updates: [
        {
          lineId: "u-01",
          mapped: true,
          qcPassed: true,
          authorized: true,
          approval: "Owner 2026-11-26",
          publicSrc: "/audio/voz/tutor/leccion-0/u-01.mp3",
          publicVisemes: "/audio/voz/tutor/leccion-0/u-01.visemes.json",
          sha256: "a".repeat(64),
          durationMs: 1200,
        },
      ],
    });
    expect(allowed.applied).toHaveLength(1);
    const updated = JSON.parse(readFileSync(v2Path, "utf8"));
    expect(updated.entries[0].status).toBe("approved");
    expect(updated.entries[0].audio.src).toBe("/audio/voz/tutor/leccion-0/u-01.mp3");
    expect(updated.entries[0].audio.visemes).toBe("/audio/voz/tutor/leccion-0/u-01.visemes.json");

    // Test WAV visemes sync with deterministic Rhubarb runner
    const wavPath = join(fakeRepo, "public/audio/voz/tutor/leccion-0/u-01.wav");
    mkdirSync(join(fakeRepo, "public/audio/voz/tutor/leccion-0"), { recursive: true });
    writeFileSync(wavPath, encodeWavPcm16(buildSpeechSamples(0.8, 16000), 16000));
    const visPath = join(fakeRepo, "public/audio/voz/tutor/leccion-0/u-01.visemes.json");
    const visRes = await syncVisemesForAudio({
      audioPath: wavPath,
      publicAudioSrc: "/audio/voz/tutor/leccion-0/u-01.wav",
      visemesDiskPath: visPath,
      repoRoot: fakeRepo,
      tools: { ffmpeg: null, ffprobe: null, rhubarb: "/mock/rhubarb" },
      rhubarbRunner: () => ({
        metadata: { soundFile: wavPath, duration: 0.8 },
        mouthCues: [
          { start: 0, end: 0.2, value: "X" },
          { start: 0.2, end: 0.5, value: "C" },
          { start: 0.5, end: 0.8, value: "X" },
        ],
      }),
    });
    expect(visRes.status).toBe("built");
    expect(mouthCuesAreValid(JSON.parse(readFileSync(visPath, "utf8")).mouthCues)).toBe(true);

    // Run end-to-end continuous WAV batch intake (no ffmpeg needed for WAV)
    const sr = 16000;
    const gap = new Int16Array(Math.round(0.4 * sr));
    const s1 = buildSpeechSamples(0.9, sr, 9000);
    const s2 = buildSpeechSamples(0.9, sr, 8500);
    const batchWav = join(privateDir, "incoming-batch.wav");
    writeFileSync(batchWav, encodeWavPcm16(concatSamples([gap, s1, gap, s2, gap]), sr));

    const intakeRes = await runTutorIntake({
      repoRoot: fakeRepo,
      inputFiles: [batchWav],
      batchId: "B001-test",
      date: "2026-11-26",
      privateDir,
      expectedLines: [
        { id: "u-01", seq: 1, lesson: 0, text: "Hola, vamos a empezar." },
        { id: "u-02", seq: 2, lesson: 0, text: "Muy bien, sigue así." },
      ],
      heardSegments: [
        { startSec: 0.35, endSec: 1.35, text: "muy bien sigue asi" }, // reordered!
        { startSec: 1.65, endSec: 2.65, text: "hola vamos a empezar" },
      ],
      authorized: false,
      dryRun: true,
      writeReport: true,
      tools: { ffmpeg: null, ffprobe: null, rhubarb: null },
    });
    expect(intakeRes.alignment.summary.matchedCount).toBe(2);
    expect(intakeRes.alignment.summary.reorderedCount).toBe(1);
    expect(intakeRes.items.every((it) => it.qc.passed && it.boundaryValid)).toBe(true);
    expect(intakeRes.manifestResult.applied).toHaveLength(0); // gated because authorized=false & dryRun=true
    expect(existsSync(intakeRes.reportPath)).toBe(true);
    expect(parseWavBuffer(readFileSync(batchWav)).sampleRate).toBe(16000);
  });
});

describe("proof on the approved word and vowel recordings", () => {
  it("confirms the IDs, SHA-256 checksums, and Rhubarb visemes without altering audio", async () => {
    const privateDir = makeTempDir("gretel-proof-");
    const proof = await proveApprovedRecordings({
      repoRoot: REPO_ROOT,
      privateDir,
      writeReport: false,
    });
    expect(proof.errors).toEqual([]);
    expect(proof.ok).toBe(true);
    expect(proof.verifiedCount).toBe(48);
    expect(proof.expectedCount).toBe(48);
    expect(proof.uniqueAudioHashes).toBe(48);

    // Also confirm generalized build-tutor-visemes.mjs --dry-run passes cleanly
    const out = execFileSync(
      process.execPath,
      [join(REPO_ROOT, "scripts/build-tutor-visemes.mjs"), "--dry-run"],
      { cwd: REPO_ROOT, encoding: "utf8" },
    );
    expect(out).toContain("48 approved entries processed");
    expect(out).toContain("48 already up to date");
  }, 60_000);
});

describe("silence-derived speech segmentation, spectral flatness, and real .tools integration", () => {
  it("derives utterance windows strictly between measured silences and computes spectral flatness", () => {
    const segs = deriveSpeechSegmentsFromSilences({
      silences: [
        { startSec: 0, endSec: 0.8 },
        { startSec: 2.1, endSec: 3.0 },
        { startSec: 4.3, endSec: 5.1 },
      ],
      totalDurationSec: 5.1,
    });
    expect(segs).toEqual([
      { startSec: 0.8, endSec: 2.1, durationSec: 1.3 },
      { startSec: 3.0, endSec: 4.3, durationSec: 1.3 },
    ]);

    const sr = 16000;
    const tone = buildSpeechSamples(0.9, sr, 9000, 440);
    const toneFlatness = computeSpectralFlatnessStats(tone);
    expect(toneFlatness.meanSpectralFlatness).toBeGreaterThanOrEqual(0);
    expect(toneFlatness.meanSpectralFlatness).toBeLessThan(0.1);

    const noise = new Int16Array(Math.round(0.9 * sr));
    let seed = 0x12345678;
    for (let i = 0; i < noise.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      noise[i] = Math.round(((seed / 0xffffffff) * 2 - 1) * 5000);
    }
    const noiseFlatness = computeSpectralFlatnessStats(noise);
    expect(noiseFlatness.meanSpectralFlatness).toBeGreaterThan(0.3);
    expect(noiseFlatness.meanSpectralFlatness).toBeGreaterThan(toneFlatness.meanSpectralFlatness);
  });

  it("discovers repo .tools binaries and runs continuous M4A batch intake with real ffmpeg + rhubarb", async () => {
    const tools = resolveMediaTools({ repoRoot: REPO_ROOT });
    if (!tools.ffmpeg || !tools.ffprobe || !tools.rhubarb) return;

    const workDir = makeTempDir("gretel-real-batch-");
    const privateDir = makeTempDir("gretel-real-priv-");
    const exportDir = makeTempDir("gretel-real-exp-");
    const batchWav = join(workDir, "mini-continuous.wav");
    const batchM4a = join(workDir, "mini-continuous.m4a");

    const osoWav = join(workDir, "oso.wav");
    const aroWav = join(workDir, "aro.wav");
    extractAndResampleWav({
      inputPath: join(REPO_ROOT, "public/audio/voz/vocabulario/oso.mp3"),
      outputWavPath: osoWav,
      sampleRate: 24000,
      channels: 1,
      tools,
    });
    extractAndResampleWav({
      inputPath: join(REPO_ROOT, "public/audio/voz/vocabulario/aro.mp3"),
      outputWavPath: aroWav,
      sampleRate: 24000,
      channels: 1,
      tools,
    });
    const osoSamples = parseWavBuffer(readFileSync(osoWav)).samples;
    const aroSamples = parseWavBuffer(readFileSync(aroWav)).samples;
    const silence700 = new Int16Array(Math.round(0.7 * 24000));
    const silence900 = new Int16Array(Math.round(0.9 * 24000));
    writeFileSync(
      batchWav,
      encodeWavPcm16(
        concatSamples([silence700, osoSamples, silence900, aroSamples, silence700]),
        24000,
      ),
    );
    execFileSync(
      tools.ffmpeg,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        batchWav,
        "-ar",
        "44100",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        batchM4a,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    const res = await runTutorIntake({
      repoRoot: REPO_ROOT,
      inputFiles: [batchM4a],
      batchId: "real-tools-mini-test",
      date: "2026-11-26",
      privateDir,
      exportDir,
      manifestWrite: false,
      minSilenceDurationSec: 0.5,
      expectedLines: [
        { id: "l1-model-aro", seq: 1, lesson: 1, text: "aro" },
        { id: "l1-model-oso", seq: 2, lesson: 1, text: "oso" },
      ],
      heardSegments: [{ text: "oso" }, { text: "aro" }], // intentionally out-of-order
      authorized: true,
      approval: "Owner 2026-11-26 test",
      dryRun: false,
      writeReport: false,
    });

    expect(res.silenceSummary[0].engine).toBe("ffmpeg-silencedetect");
    expect(res.alignment.summary.matchedCount).toBe(2);
    expect(res.alignment.summary.reorderedCount).toBe(1);
    expect(res.items.every((it) => it.qc.passed && it.boundaryValid)).toBe(true);
    expect(res.items.every((it) => it.visemesStatus === "built" && it.visemesCueCount > 0)).toBe(
      true,
    );
    expect(res.manifestResult.filesModified).toEqual([]);

    const osoVisemes = JSON.parse(
      readFileSync(join(exportDir, "leccion-1/l1-model-oso.visemes.json"), "utf8"),
    );
    expect(mouthCuesAreValid(osoVisemes.mouthCues)).toBe(true);
    expect(osoVisemes.metadata.recognizer).toBe("phonetic");
    expect(osoVisemes.metadata.extendedShapes).toBe("GX");
  }, 60_000);
});

describe("PR #1323 security hardening and S4036 fixed binary resolution", () => {
  it("resolves fixed system binaries via absolute paths without trusting PATH", () => {
    const gitBin = resolveFixedSystemBinary("git", { repoRoot: REPO_ROOT });
    expect(gitBin).toBeTruthy();
    expect(gitBin.startsWith("/")).toBe(true);

    const tarBin = resolveFixedSystemBinary("tar", { repoRoot: REPO_ROOT });
    expect(tarBin).toBeTruthy();
    expect(tarBin.startsWith("/")).toBe(true);

    const missingBin = resolveFixedSystemBinary("nonexistent-binary-xyz", { repoRoot: REPO_ROOT });
    expect(missingBin).toBeNull();
  });

  it("exports hardened ffmpeg and ffprobe protocol/stdin/error flags", () => {
    expect(FFMPEG_SECURITY_FLAGS).toEqual([
      "-nostdin",
      "-xerror",
      "-protocol_whitelist",
      "file,pipe",
    ]);
    expect(FFPROBE_SECURITY_FLAGS).toEqual(["-protocol_whitelist", "file,pipe"]);
  });

  it("enforces owner-only 0o700 dir and 0o600 file permissions on private originals", () => {
    if (process.platform === "win32") return;
    const privateDir = makeTempDir("gretel-priv-perms-");
    const srcDir = makeTempDir("gretel-src-perms-");
    const sample = join(srcDir, "sample.wav");
    writeFileSync(sample, encodeWavPcm16(buildSpeechSamples(0.5, 16000), 16000));

    const ingested = ingestPrivateOriginal({
      sourcePath: sample,
      privateDir,
      repoRoot: REPO_ROOT,
      batchId: "perm-test",
      dryRun: false,
    });
    expect(ingested.accepted).toBe(true);

    const permResult = enforcePrivatePermissions(privateDir, [ingested.privateOriginalPath]);
    expect(permResult.applied).toBe(true);
    expect(statSync(privateDir).mode & 0o777).toBe(0o700);
    expect(statSync(join(privateDir, "originals")).mode & 0o777).toBe(0o700);
    expect(statSync(join(privateDir, "index.json")).mode & 0o777).toBe(0o600);
    expect(statSync(ingested.privateOriginalPath).mode & 0o777).toBe(0o600);
  });

  it("matches incoming audio content hashes against installed approved speech", async () => {
    const hashIndex = buildApprovedSpeechHashIndex(REPO_ROOT);
    expect(hashIndex.size).toBe(48);

    const osoPath = join(REPO_ROOT, "public/audio/voz/vocabulario/oso.mp3");
    const privateDir = makeTempDir("gretel-priv-hash-");
    const srcDir = makeTempDir("gretel-src-hash-");
    const copiedOso = join(srcDir, "incoming-oso.mp3");
    copyFileSync(osoPath, copiedOso);

    const ingested = ingestPrivateOriginal({
      sourcePath: copiedOso,
      privateDir,
      repoRoot: REPO_ROOT,
      batchId: "hash-test",
      dryRun: true,
    });
    const matches = matchInstalledApprovedBySha256(ingested.sha256, hashIndex);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].lineId).toBe("l1-model-oso");
    expect(matches[0].src).toBe("/audio/voz/vocabulario/oso.mp3");
  });

  it("rejects --private-dir inside ANY git repository (not just repoRoot)", () => {
    const unrelatedRepo = makeTempDir("gretel-other-git-repo-");
    mkdirSync(join(unrelatedRepo, ".git"), { recursive: true });
    const nestedVault = join(unrelatedRepo, "nested", "vault");
    expect(() => assertPrivateDirOutsideRepo(nestedVault, REPO_ROOT)).toThrow(
      /must be outside every git repository/i,
    );

    const worktreeRepo = makeTempDir("gretel-worktree-git-repo-");
    writeFileSync(join(worktreeRepo, ".git"), "gitdir: /tmp/fake-gitdir\n");
    const nestedWorktreeVault = join(worktreeRepo, "sub", "private");
    expect(() => assertPrivateDirOutsideRepo(nestedWorktreeVault, REPO_ROOT)).toThrow(
      /must be outside every git repository/i,
    );
  });

  it("creates unique per-pass review directories (<sha12>-<timestamp>-<rand>) preserving prior evidence", async () => {
    const privateDir = makeTempDir("gretel-priv-passes-");
    const srcDir = makeTempDir("gretel-src-passes-");
    const sr = 16000;
    const pad = new Int16Array(Math.round(0.25 * sr));
    const wavFile = join(srcDir, "pass-test.wav");
    writeFileSync(wavFile, encodeWavPcm16(concatSamples([pad, buildSpeechSamples(0.8, sr), pad]), sr));

    const first = await runTutorIntake({
      repoRoot: REPO_ROOT,
      inputFiles: [wavFile],
      batchId: "pass-1",
      date: "2026-11-26",
      privateDir,
      expectedLines: [{ id: "u-01", seq: 1, lesson: 0, text: "Hola" }],
      heardSegments: [{ startSec: 0.2, endSec: 1.1, text: "hola" }],
      authorized: false,
      dryRun: false,
      writeReport: false,
      manifestWrite: false,
      tools: { ffmpeg: null, ffprobe: null, rhubarb: null },
    });

    const second = await runTutorIntake({
      repoRoot: REPO_ROOT,
      inputFiles: [wavFile],
      batchId: "pass-2",
      date: "2026-11-26",
      privateDir,
      expectedLines: [{ id: "u-01", seq: 1, lesson: 0, text: "Hola" }],
      heardSegments: [{ startSec: 0.2, endSec: 1.1, text: "hola" }],
      authorized: false,
      dryRun: false,
      writeReport: false,
      manifestWrite: false,
      tools: { ffmpeg: null, ffprobe: null, rhubarb: null },
    });

    expect(first.privateReviewDir).not.toBe(second.privateReviewDir);
    expect(existsSync(first.privateReviewReportPath)).toBe(true);
    expect(existsSync(second.privateReviewReportPath)).toBe(true);

    const passPattern = /^[0-9a-f]{12}-\d{8}-\d{6}-[0-9a-f]{8}$/;
    expect(first.privateReviewDir.split("/").pop()).toMatch(passPattern);
    expect(second.privateReviewDir.split("/").pop()).toMatch(passPattern);

    if (process.platform !== "win32") {
      expect(statSync(first.privateReviewDir).mode & 0o777).toBe(0o700);
      expect(statSync(first.privateReviewReportPath).mode & 0o777).toBe(0o600);
      expect(statSync(second.privateReviewDir).mode & 0o777).toBe(0o700);
      expect(statSync(second.privateReviewReportPath).mode & 0o777).toBe(0o600);
    }

    const standalone = createPrivateReviewPassDir({
      privateDir,
      repoRoot: REPO_ROOT,
      sha256: APPROVED_ORIGINAL_MASTER_SHA256,
      dryRun: true,
    });
    expect(standalone.passName.startsWith(APPROVED_ORIGINAL_MASTER_SHA256.slice(0, 12))).toBe(true);
    expect(standalone.created).toBe(false);
  });

  it("records approvedOriginalMaster, fullScaleSamples, and rmsDbfs in QC and intake output", () => {
    expect(APPROVED_ORIGINAL_MASTER_SHA256).toBe(
      "239e3518f364adfcefab39f4220a4b2b85a6e3987679af823d7ef0f26f76935d",
    );

    const sr = 16000;
    const pad = new Int16Array(Math.round(0.15 * sr));
    const samples = concatSamples([pad, buildSpeechSamples(0.8, sr, 9000), pad]);
    // Inject 5 positive full-scale (+32767), 3 negative full-scale (-32768), and 2 non-full-scale (32766)
    samples[3000] = 32767;
    samples[3010] = 32767;
    samples[3020] = 32767;
    samples[3030] = 32767;
    samples[3040] = 32767;
    samples[3050] = -32768;
    samples[3060] = -32768;
    samples[3070] = -32768;
    samples[3080] = 32766;
    samples[3090] = -32767;

    const qc = runClipQc({ samples, sampleRate: sr });
    expect(qc.metrics.fullScaleSamples).toBe(8);
    expect(typeof qc.metrics.rmsDbfs).toBe("number");
    expect(qc.metrics.rmsDbfs).toBeLessThan(0);
    expect(qc.metrics.rmsDbfs).toBeGreaterThan(-40);
  });

  it("supports optional --vosk-model offline word alignment with clean unavailable fallback", async () => {
    const privateDir = makeTempDir("gretel-priv-vosk-");
    const srcDir = makeTempDir("gretel-src-vosk-");
    const fakeModelDir = makeTempDir("gretel-vosk-model-");
    const sr = 16000;
    const gap = new Int16Array(Math.round(0.4 * sr));
    const wavFile = join(srcDir, "vosk-test.wav");
    writeFileSync(
      wavFile,
      encodeWavPcm16(
        concatSamples([gap, buildSpeechSamples(0.8, sr), gap, buildSpeechSamples(0.8, sr), gap]),
        sr,
      ),
    );

    // 1. Missing model path cleanly reports "local alignment model unavailable"
    const missingModel = runVoskWordAlignment({
      wavPath: wavFile,
      modelPath: join(srcDir, "does-not-exist-vosk-model"),
      repoRoot: REPO_ROOT,
    });
    expect(missingModel.available).toBe(false);
    expect(missingModel.status).toBe("local alignment model unavailable");

    // 2. Deterministic Vosk runner aligns words using PR #1323 gap (>=0.25s) & conf (>=0.85) rules
    const expectedLines = [
      { id: "u-01", seq: 1, lesson: 0, text: "Hola vamos" },
      { id: "u-02", seq: 2, lesson: 0, text: "Muy bien" },
    ];
    const mockWords = [
      { word: "hola", start: 0.42, end: 0.72, conf: 0.96 },
      { word: "vamos", start: 0.75, end: 1.15, conf: 0.94 },
      { word: "muy", start: 1.62, end: 1.92, conf: 0.95 },
      { word: "bien", start: 1.95, end: 2.35, conf: 0.97 },
    ];
    const aligned = alignVoskWordsToLines(mockWords, expectedLines, 2.8);
    expect(aligned.findings).toHaveLength(2);
    expect(aligned.findings.every((f) => f.status === "candidate")).toBe(true);

    const intakeRes = await runTutorIntake({
      repoRoot: REPO_ROOT,
      inputFiles: [wavFile],
      batchId: "vosk-hook-test",
      date: "2026-11-26",
      privateDir,
      expectedLines,
      voskModelPath: fakeModelDir,
      voskRunner: () => ({ available: true, words: mockWords }),
      authorized: false,
      dryRun: true,
      writeReport: false,
      tools: { ffmpeg: null, ffprobe: null, rhubarb: null },
    });
    expect(intakeRes.approvedOriginalMaster).toBe(false);
    expect(intakeRes.voskAlignment).toHaveLength(1);
    expect(intakeRes.voskAlignment[0].available).toBe(true);
    expect(intakeRes.voskAlignment[0].status).toBe("aligned");
    expect(intakeRes.alignment.summary.matchedCount).toBe(2);
    expect(intakeRes.items.every((it) => it.qc.passed && it.boundaryValid)).toBe(true);

    // 3. Unavailable vosk package inside runTutorIntake does not crash and reports cleanly
    const unavailRes = await runTutorIntake({
      repoRoot: REPO_ROOT,
      inputFiles: [wavFile],
      batchId: "vosk-unavail-test",
      date: "2026-11-26",
      privateDir,
      expectedLines,
      voskModelPath: fakeModelDir,
      voskRunner: () => ({ available: false, reason: "python vosk package not installed" }),
      authorized: false,
      dryRun: true,
      writeReport: false,
      tools: { ffmpeg: null, ffprobe: null, rhubarb: null },
    });
    expect(unavailRes.voskAlignment[0].available).toBe(false);
    expect(unavailRes.voskAlignment[0].status).toBe("local alignment model unavailable");
  });
});
