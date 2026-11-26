/**
 * Measured-silence detector and boundary snapper.
 * Cut points are NEVER guessed from fixed offsets or sentence counts;
 * every cut point must land inside a measured silence interval.
 */

export function amplitudeToDb(rms) {
  if (rms <= 1e-9) return -96;
  return 20 * Math.log10(rms / 32768);
}

/**
 * Measure silence intervals in mono PCM16 samples using 10ms RMS windows.
 * @returns {{ silences: Array<{startSec: number, endSec: number, durationSec: number, midpointSec: number, meanDb: number}>, noiseFloorDb: number, thresholdDb: number }}
 */
export function measureSilenceIntervals(
  samples,
  sampleRate,
  { frameMs = 10, silenceThresholdDb = -40, minSilenceDurationMs = 180, adaptive = true } = {},
) {
  const frameLen = Math.max(1, Math.round((sampleRate * frameMs) / 1000));
  const frameCount = Math.floor(samples.length / frameLen);
  if (frameCount === 0) {
    return { silences: [], noiseFloorDb: -96, thresholdDb: silenceThresholdDb };
  }

  const frameDbs = new Float64Array(frameCount);
  for (let f = 0; f < frameCount; f++) {
    const start = f * frameLen;
    let sumSq = 0;
    for (let i = 0; i < frameLen; i++) {
      const s = samples[start + i];
      sumSq += s * s;
    }
    const rms = Math.sqrt(sumSq / frameLen);
    frameDbs[f] = amplitudeToDb(rms);
  }

  const sorted = Array.from(frameDbs).sort((a, b) => a - b);
  const p10 = sorted[Math.floor(sorted.length * 0.1)] ?? -96;
  const thresholdDb = adaptive
    ? Math.max(silenceThresholdDb, Math.min(-34, p10 + 6))
    : silenceThresholdDb;

  const minSilenceFrames = Math.max(1, Math.round(minSilenceDurationMs / frameMs));
  const silences = [];

  let runStart = -1;
  let dbSum = 0;

  for (let f = 0; f <= frameCount; f++) {
    const isSilent = f < frameCount && frameDbs[f] <= thresholdDb;
    if (isSilent) {
      if (runStart === -1) {
        runStart = f;
        dbSum = 0;
      }
      dbSum += frameDbs[f];
    } else if (runStart !== -1) {
      const runLen = f - runStart;
      if (runLen >= minSilenceFrames) {
        const startSec = (runStart * frameLen) / sampleRate;
        const endSec = (f * frameLen) / sampleRate;
        silences.push({
          startSec: Number(startSec.toFixed(4)),
          endSec: Number(endSec.toFixed(4)),
          durationSec: Number((endSec - startSec).toFixed(4)),
          midpointSec: Number(((startSec + endSec) / 2).toFixed(4)),
          meanDb: Number((dbSum / runLen).toFixed(2)),
        });
      }
      runStart = -1;
    }
  }

  return {
    silences,
    noiseFloorDb: Number(p10.toFixed(2)),
    thresholdDb: Number(thresholdDb.toFixed(2)),
  };
}

/** Parse ffmpeg `silencedetect` stderr output into silence interval objects. */
export function parseFfmpegSilencedetect(stderrText, totalDurationSec = null) {
  const silences = [];
  let currentStart = null;
  for (const line of String(stderrText ?? "").split(/\r?\n/)) {
    const startMatch = /silence_start:\s*([0-9.+-]+)/.exec(line);
    if (startMatch) {
      currentStart = Number(startMatch[1]);
      continue;
    }
    const endMatch = /silence_end:\s*([0-9.+-]+)(?:\s*\|\s*silence_duration:\s*([0-9.+-]+))?/.exec(
      line,
    );
    if (endMatch && currentStart !== null) {
      const endSec = Number(endMatch[1]);
      const durationSec = endMatch[2] ? Number(endMatch[2]) : endSec - currentStart;
      silences.push({
        startSec: Number(currentStart.toFixed(4)),
        endSec: Number(endSec.toFixed(4)),
        durationSec: Number(durationSec.toFixed(4)),
        midpointSec: Number(((currentStart + endSec) / 2).toFixed(4)),
        meanDb: null,
      });
      currentStart = null;
    }
  }
  if (
    currentStart !== null &&
    typeof totalDurationSec === "number" &&
    totalDurationSec > currentStart
  ) {
    silences.push({
      startSec: Number(currentStart.toFixed(4)),
      endSec: Number(totalDurationSec.toFixed(4)),
      durationSec: Number((totalDurationSec - currentStart).toFixed(4)),
      midpointSec: Number(((currentStart + totalDurationSec) / 2).toFixed(4)),
      meanDb: null,
    });
  }
  return silences;
}

function findSilenceNear(silences, targetSec, direction, maxDistanceSec) {
  let best = null;
  let bestDist = Infinity;

  for (const s of silences) {
    // Strictly prefer a silence interval that already contains targetSec
    if (targetSec >= s.startSec - 1e-4 && targetSec <= s.endSec + 1e-4) {
      return s;
    }
    const dist =
      direction === "before"
        ? targetSec >= s.endSec
          ? targetSec - s.endSec
          : s.startSec - targetSec <= 0.15
            ? s.startSec - targetSec
            : Infinity
        : s.startSec >= targetSec
          ? s.startSec - targetSec
          : targetSec - s.endSec <= 0.15
            ? targetSec - s.endSec
            : Infinity;

    if (dist <= maxDistanceSec && dist < bestDist) {
      best = s;
      bestDist = dist;
    }
  }
  return best;
}

/**
 * Snap coarse transcript segments onto measured silence intervals.
 * Rejects any segment whose start or end boundary lacks a measured silence.
 */
export function snapSegmentsToSilences({
  segments,
  silences,
  totalDurationSec,
  leadPaddingMs = 120,
  trailPaddingMs = 160,
  maxSnapSearchSec = 0.8,
}) {
  const leadPad = leadPaddingMs / 1000;
  const trailPad = trailPaddingMs / 1000;
  const sortedSilences = [...silences].sort((a, b) => a.startSec - b.startSec);

  return segments.map((seg, index) => {
    const startSilence = findSilenceNear(sortedSilences, seg.startSec, "before", maxSnapSearchSec);
    const endSilence = findSilenceNear(sortedSilences, seg.endSec, "after", maxSnapSearchSec);

    const reasons = [];
    if (!startSilence) {
      reasons.push(
        `No measured silence found near segment start (${seg.startSec.toFixed(3)}s); refusing blind cut`,
      );
    }
    if (!endSilence) {
      reasons.push(
        `No measured silence found near segment end (${seg.endSec.toFixed(3)}s); refusing blind cut`,
      );
    }

    let cutStartSec = null;
    let cutEndSec = null;

    if (startSilence && endSilence) {
      // Place cutStart inside startSilence with safe lead padding before speech onset
      const desiredStart = Math.max(startSilence.startSec, startSilence.endSec - leadPad);
      cutStartSec = Math.max(
        startSilence.startSec,
        Math.min(startSilence.endSec, Math.max(startSilence.midpointSec, desiredStart)),
      );

      // Place cutEnd inside endSilence with safe trailing padding after speech offset
      const desiredEnd = Math.min(endSilence.endSec, endSilence.startSec + trailPad);
      cutEndSec = Math.min(
        endSilence.endSec,
        Math.max(endSilence.startSec, Math.min(endSilence.midpointSec, desiredEnd)),
      );

      if (typeof totalDurationSec === "number") {
        cutEndSec = Math.min(totalDurationSec, cutEndSec);
      }

      cutStartSec = Number(cutStartSec.toFixed(4));
      cutEndSec = Number(cutEndSec.toFixed(4));

      if (!(cutEndSec > cutStartSec)) {
        reasons.push(
          `Invalid snapped silence window (${cutStartSec}s .. ${cutEndSec}s) for segment #${index + 1}`,
        );
      }
    }

    return {
      ...seg,
      cutValid: reasons.length === 0,
      cutReasons: reasons,
      cutStartSec,
      cutEndSec,
      startSilence,
      endSilence,
    };
  });
}
