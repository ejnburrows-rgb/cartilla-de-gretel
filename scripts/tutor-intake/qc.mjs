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

/**
 * In-place radix-2 Cooley-Tukey FFT on Float64Array real/imag buffers (length must be power of 2).
 */
function fftRadix2(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wLenRe = Math.cos(ang);
    const wLenIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let wRe = 1;
      let wIm = 0;
      const half = len >> 1;
      for (let j = 0; j < half; j++) {
        const uRe = re[i + j];
        const uIm = im[i + j];
        const vRe = re[i + j + half] * wRe - im[i + j + half] * wIm;
        const vIm = re[i + j + half] * wIm + im[i + j + half] * wRe;
        re[i + j] = uRe + vRe;
        im[i + j] = uIm + vIm;
        re[i + j + half] = uRe - vRe;
        im[i + j + half] = uIm - vIm;
        const nextWRe = wRe * wLenRe - wIm * wLenIm;
        wIm = wRe * wLenIm + wIm * wLenRe;
        wRe = nextWRe;
      }
    }
  }
}

/**
 * Compute Wiener entropy (spectral flatness = geomMean / arithMean of power spectrum)
 * over Hann-windowed 512-sample frames for a PCM16 slice.
 */
export function computeSpectralFlatnessStats(samples, { fftSize = 512, hopSize = 256 } = {}) {
  if (!samples || samples.length < fftSize) {
    return { meanSpectralFlatness: 0, quietSpectralFlatness: 0, frameFlatness: [] };
  }
  const hann = new Float64Array(fftSize);
  for (let i = 0; i < fftSize; i++) {
    hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  }
  const re = new Float64Array(fftSize);
  const im = new Float64Array(fftSize);
  const halfBins = fftSize / 2 - 1; // exclude DC (bin 0) and Nyquist
  const frames = [];

  for (let start = 0; start + fftSize <= samples.length; start += hopSize) {
    let sumSq = 0;
    for (let i = 0; i < fftSize; i++) {
      const val = (samples[start + i] / 32768) * hann[i];
      re[i] = val;
      im[i] = 0;
      sumSq += val * val;
    }
    const rmsDb = amplitudeToDb(Math.sqrt(sumSq / fftSize) * 32768);
    if (rmsDb <= -72) continue;

    fftRadix2(re, im);
    let logSum = 0;
    let linSum = 0;
    const eps = 1e-12;
    for (let k = 1; k <= halfBins; k++) {
      const power = re[k] * re[k] + im[k] * im[k] + eps;
      logSum += Math.log(power);
      linSum += power;
    }
    const geomMean = Math.exp(logSum / halfBins);
    const arithMean = linSum / halfBins;
    const flatness = arithMean > 0 ? Math.min(1, geomMean / arithMean) : 0;
    frames.push({ rmsDb, flatness });
  }

  if (frames.length === 0) {
    return { meanSpectralFlatness: 0, quietSpectralFlatness: 0, frameFlatness: [] };
  }

  const meanSpectralFlatness = frames.reduce((acc, f) => acc + f.flatness, 0) / frames.length;
  const byEnergy = [...frames].sort((a, b) => a.rmsDb - b.rmsDb);
  const quietPool = byEnergy.slice(0, Math.max(1, Math.floor(byEnergy.length * 0.25)));
  const quietSpectralFlatness =
    quietPool.reduce((acc, f) => acc + f.flatness, 0) / quietPool.length;

  return {
    meanSpectralFlatness: Number(meanSpectralFlatness.toFixed(4)),
    quietSpectralFlatness: Number(quietSpectralFlatness.toFixed(4)),
    frameFlatness: frames,
  };
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
  let fullScaleSamples = 0;
  let consecutiveClipped = 0;
  let maxConsecutiveClipped = 0;

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const abs = Math.abs(sample);
    if (abs > peakAbs) peakAbs = abs;
    totalSumSq += sample * sample;
    if (sample >= 32767 || sample <= -32768) {
      fullScaleSamples += 1;
    }
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
  const rmsDbfs = Number(
    (
      10 *
      Math.log10(Math.max(totalSumSq / Math.max(1, samples.length), 1) / (32768 * 32768))
    ).toFixed(1),
  );
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
  // Music beds keep the quietest 15-25% frames elevated (>= -34 dBFS) with low ZCR variance
  // and/or low spectral flatness (tonal chords / sustained harmonic instruments).
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

  const flatnessStats = computeSpectralFlatnessStats(samples);

  const musicSuspected =
    durationSec >= 0.8 &&
    activeSpeechRatio > 0.2 &&
    ((p20Db > cfg.musicFloorDb && quietRatio < cfg.minQuietRatioForMultiWord) ||
      (noiseFloorDb > -35 &&
        ((varQuietZcr < 0.002 && meanQuietZcr < 0.2) ||
          flatnessStats.quietSpectralFlatness < 0.08)));

  if (musicSuspected) {
    failures.push(
      `music-or-continuous-bed (p20 ${p20Db.toFixed(1)} dBFS, quietRatio ${(quietRatio * 100).toFixed(1)}%, quietZcrVar ${varQuietZcr.toFixed(5)}, quietSpectralFlatness ${flatnessStats.quietSpectralFlatness})`,
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
      rmsDbfs,
      speechRmsDb: Number(speechRmsDb.toFixed(2)),
      noiseFloorDb: Number(noiseFloorDb.toFixed(2)),
      snrDb: Number(snrDb.toFixed(2)),
      activeSpeechRatio: Number(activeSpeechRatio.toFixed(4)),
      quietRatio: Number(quietRatio.toFixed(4)),
      spectralFlatness: flatnessStats.meanSpectralFlatness,
      quietSpectralFlatness: flatnessStats.quietSpectralFlatness,
      clippedSamples,
      fullScaleSamples,
      maxConsecutiveClipped,
      musicSuspected,
      stutterDetected: transcriptStutter.detected || acousticStutter,
    },
  };
}
