import { amplitudeToDb } from "./silence.mjs";
import { normalizeSpanishText, tokenizeSpanish } from "./alignment.mjs";

/**
 * Audio Quality Control (QC) checks:
 * - clipping (digital full-scale saturation)
 * - excessive noise / low SNR
 * - background music / continuous bed contamination
 * - stutter / false start / repeated syllable or word
 * - duration & active speech sanity
 */

function computeZeroCrossingRate(samples, start, len) {
  let crossings = 0;
  for (let i = 1; i < len; i++) {
    const prev = samples[start + i - 1];
    const curr = samples[start + i];
    if ((prev >= 0 && curr < 0) || (prev < 0 && curr >= 0)) {
      crossings += 1;
    }
  }
  return crossings / Math.max(1, len - 1);
}

/** Check transcript text for lexical stutters (repeated words or truncated prefixes) not present in expectedText. */
export function detectTranscriptStutter(heardText, expectedText = "") {
  const heardTokens = tokenizeSpanish(heardText, { foldAccents: true });
  const expectedTokens = tokenizeSpanish(expectedText, { foldAccents: true });
  if (heardTokens.length < 2) return { detected: false, reasons: [] };

  const expectedNormalized = normalizeSpanishText(expectedText, { foldAccents: true });
  const reasons = [];

  for (let i = 0; i < heardTokens.length - 1; i++) {
    const a = heardTokens[i];
    const b = heardTokens[i + 1];
    const pair = `${a} ${b}`;
    if (a === b && !expectedNormalized.includes(pair)) {
      reasons.push(`Repeated word stutter detected in transcript: "${pair}"`);
    } else if (
      a.length >= 1 &&
      a.length <= 3 &&
      b.length > a.length + 1 &&
      b.startsWith(a) &&
      !expectedTokens.includes(a)
    ) {
      reasons.push(`Prefix false-start stutter detected in transcript: "${a} ${b}"`);
    }
  }

  return { detected: reasons.length > 0, reasons };
}

/**
 * Run full QC over mono PCM16 samples + optional transcript/expectedText.
 * @returns {{ passed: boolean, failures: string[], warnings: string[], metrics: object }}
 */
export function runClipQc({
  samples,
  sampleRate,
  transcript = "",
  expectedText = "",
  allowShortSingleVowel = false,
  thresholds = {},
}) {
  const cfg = {
    clipSampleThreshold: 32755,
    maxClippedSamples: 3,
    maxConsecutiveClipped: 2,
    maxNoiseFloorDb: -32,
    minSnrDb: 14,
    musicFloorDb: -34,
    minQuietRatioForMultiWord: 0.04,
    minDurationSec: allowShortSingleVowel ? 0.14 : 0.24,
    maxDurationSec: 30,
    minActiveSpeechRatio: 0.05,
    ...thresholds,
  };

  const failures = [];
  const warnings = [];

  const durationSec = samples.length / Math.max(1, sampleRate);
  if (durationSec < cfg.minDurationSec) {
    failures.push(`duration-too-short (${durationSec.toFixed(3)}s < ${cfg.minDurationSec}s)`);
  }
  if (durationSec > cfg.maxDurationSec) {
    failures.push(`duration-too-long (${durationSec.toFixed(3)}s > ${cfg.maxDurationSec}s)`);
  }

  // Peak & clipping analysis
  let peakAbs = 0;
  let totalSumSq = 0;
  let clippedSamples = 0;
  let consecutiveClipped = 0;
  let maxConsecutiveClipped = 0;

  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > peakAbs) peakAbs = abs;
    totalSumSq += samples[i] * samples[i];
    if (abs >= cfg.clipSampleThreshold) {
      clippedSamples += 1;
      consecutiveClipped += 1;
      if (consecutiveClipped > maxConsecutiveClipped) {
        maxConsecutiveClipped = consecutiveClipped;
      }
    } else {
      consecutiveClipped = 0;
    }
  }

  const peakDb = amplitudeToDb(peakAbs);
  const overallRmsDb = amplitudeToDb(Math.sqrt(totalSumSq / Math.max(1, samples.length)));
  const clippingDetected =
    clippedSamples > cfg.maxClippedSamples || maxConsecutiveClipped >= cfg.maxConsecutiveClipped;
  if (clippingDetected) {
    failures.push(
      `clipping (${clippedSamples} clipped samples, max run ${maxConsecutiveClipped}, peak ${peakDb.toFixed(2)} dBFS)`,
    );
  }

  // Frame-level noise, speech, music bed, and acoustic stutter analysis (10ms frames)
  const frameLen = Math.max(1, Math.round(sampleRate * 0.01));
  const frameCount = Math.floor(samples.length / frameLen);
  const frameDbs = [];
  const frameZcr = [];

  for (let f = 0; f < frameCount; f++) {
    const start = f * frameLen;
    let sumSq = 0;
    for (let i = 0; i < frameLen; i++) {
      const s = samples[start + i];
      sumSq += s * s;
    }
    frameDbs.push(amplitudeToDb(Math.sqrt(sumSq / frameLen)));
    frameZcr.push(computeZeroCrossingRate(samples, start, frameLen));
  }

  const sortedDbs = [...frameDbs].sort((a, b) => a - b);
  const noiseFloorDb = sortedDbs.length > 0 ? sortedDbs[Math.floor(sortedDbs.length * 0.1)] : -96;
  const activeFrames = frameDbs.filter((db) => db > -42);
  const activeSpeechRatio = frameCount > 0 ? activeFrames.length / frameCount : 0;

  if (activeSpeechRatio < cfg.minActiveSpeechRatio) {
    failures.push(
      `no-speech-energy (activeSpeechRatio ${(activeSpeechRatio * 100).toFixed(1)}%, overall ${overallRmsDb.toFixed(1)} dBFS)`,
    );
  }

  // Estimate speech level from frames clearly above noise floor, or top 25% active frames when noise is high
  const clearSpeechFrames = frameDbs.filter((db) => db > Math.max(-42, noiseFloorDb + 8));
  const topQuartileFrames = sortedDbs.slice(Math.floor(sortedDbs.length * 0.75));
  const speechPool =
    clearSpeechFrames.length > 0
      ? clearSpeechFrames
      : topQuartileFrames.length > 0
        ? topQuartileFrames
        : activeFrames;
  const speechRmsDb =
    speechPool.length > 0
      ? speechPool.reduce((a, b) => a + b, 0) / speechPool.length
      : overallRmsDb;
  const snrDb = speechRmsDb - noiseFloorDb;

  if (noiseFloorDb > cfg.maxNoiseFloorDb && activeSpeechRatio >= cfg.minActiveSpeechRatio) {
    failures.push(
      `excessive-noise (noiseFloor ${noiseFloorDb.toFixed(1)} dBFS > ${cfg.maxNoiseFloorDb} dBFS)`,
    );
  }
  if (activeSpeechRatio >= cfg.minActiveSpeechRatio && snrDb < cfg.minSnrDb) {
    failures.push(`low-snr (SNR ${snrDb.toFixed(1)} dB < ${cfg.minSnrDb} dB)`);
  }

  // Music / continuous bed detection:
  // Pure speech has true quiet gaps (< -38 dBFS) at edges/pauses and variable ZCR.
  // Music beds keep the quietest 15% frames elevated (>= -34 dBFS) with low ZCR variance (tonal).
  const quietFramesCount = frameDbs.filter((db) => db <= -38).length;
  const quietRatio = frameCount > 0 ? quietFramesCount / frameCount : 0;
  const p20Db = sortedDbs.length > 0 ? sortedDbs[Math.floor(sortedDbs.length * 0.2)] : -96;

  // Inspect ZCR stability in the quietest 25% of frames
  const indexedFrames = frameDbs.map((db, idx) => ({ db, zcr: frameZcr[idx] }));
  indexedFrames.sort((a, b) => a.db - b.db);
  const quietSlice = indexedFrames.slice(0, Math.max(1, Math.floor(indexedFrames.length * 0.25)));
  const meanQuietZcr = quietSlice.reduce((s, f) => s + f.zcr, 0) / quietSlice.length;
  const varQuietZcr =
    quietSlice.reduce((s, f) => s + (f.zcr - meanQuietZcr) ** 2, 0) / quietSlice.length;

  const musicSuspected =
    durationSec >= 0.8 &&
    activeSpeechRatio > 0.2 &&
    ((p20Db > cfg.musicFloorDb && quietRatio < cfg.minQuietRatioForMultiWord) ||
      (noiseFloorDb > -35 && varQuietZcr < 0.002 && meanQuietZcr < 0.2));

  if (musicSuspected) {
    failures.push(
      `music-or-continuous-bed (p20 ${p20Db.toFixed(1)} dBFS, quietRatio ${(quietRatio * 100).toFixed(1)}%, quietZcrVar ${varQuietZcr.toFixed(5)})`,
    );
  }

  // Stutter check: transcript-based AND acoustic false-start micro-burst check
  const transcriptStutter = detectTranscriptStutter(transcript, expectedText);
  let acousticStutter = false;
  let acousticStutterDetail = null;

  // Detect leading isolated micro-burst (40..140ms) followed by 120..450ms silence before main speech
  const speechThreshold = Math.max(-38, noiseFloorDb + 10);
  const bursts = [];
  let inBurst = false;
  let bStart = 0;
  for (let f = 0; f <= frameCount; f++) {
    const active = f < frameCount && frameDbs[f] > speechThreshold;
    if (active && !inBurst) {
      inBurst = true;
      bStart = f;
    } else if (!active && inBurst) {
      inBurst = false;
      bursts.push({ startFrame: bStart, endFrame: f, durationMs: (f - bStart) * 10 });
    }
  }
  if (bursts.length >= 2) {
    const first = bursts[0];
    const second = bursts[1];
    const gapMs = (second.startFrame - first.endFrame) * 10;
    const expectedWordCount = tokenizeSpanish(expectedText).length;
    if (
      first.durationMs >= 40 &&
      first.durationMs <= 140 &&
      gapMs >= 120 &&
      gapMs <= 450 &&
      second.durationMs >= 180 &&
      expectedWordCount <= 3
    ) {
      acousticStutter = true;
      acousticStutterDetail = `leading false-start burst (${first.durationMs}ms) + ${gapMs}ms pause before ${second.durationMs}ms utterance`;
    }
  }

  if (transcriptStutter.detected) {
    failures.push(`stutter (${transcriptStutter.reasons.join("; ")})`);
  } else if (acousticStutter) {
    failures.push(`stutter (${acousticStutterDetail})`);
  }

  return {
    passed: failures.length === 0,
    failures,
    warnings,
    metrics: {
      durationSec: Number(durationSec.toFixed(4)),
      peakDb: Number(peakDb.toFixed(2)),
      overallRmsDb: Number(overallRmsDb.toFixed(2)),
      speechRmsDb: Number(speechRmsDb.toFixed(2)),
      noiseFloorDb: Number(noiseFloorDb.toFixed(2)),
      snrDb: Number(snrDb.toFixed(2)),
      activeSpeechRatio: Number(activeSpeechRatio.toFixed(4)),
      quietRatio: Number(quietRatio.toFixed(4)),
      clippedSamples,
      maxConsecutiveClipped,
      musicSuspected,
      stutterDetected: transcriptStutter.detected || acousticStutter,
    },
  };
}
