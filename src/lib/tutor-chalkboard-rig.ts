/**
 * Pure physics, gaze, blinking, eyebrow expression, secondary hair-curl sway,
 * and Rhubarb phonetic coarticulation solver for Gretel's chalkboard rig.
 *
 * Strictly enforces:
 * - Zero exaggerated bouncing or cartoonish gestures (`maxBouncePx = 0`).
 * - Primary phonetic lip-sync strictly driven by Rhubarb timelines + real `audio.currentTime`.
 * - Bounded pupil travel inside eye sockets, 5-stage smooth asymmetric blinking,
 *   continuous independent left/right eyebrow articulation, and delayed hair follow-through.
 * - Full `prefers-reduced-motion: reduce` calming identity mode.
 */
import type { VisemeCue, VisemeShape } from "./tutor-puppet-layers";
import { normalizeVisemeShape } from "./tutor-puppet-layers";

export type ChalkboardRigExpression =
  | "neutral"
  | "listening"
  | "thinking"
  | "speaking"
  | "smiling"
  | "encouraging"
  | "demonstrating"
  | "gentle-error";

export type ChalkboardGazeTarget =
  | "student"
  | "chalkboard-title"
  | "chalkboard-teaching"
  | "flipchart-right"
  | "thinking-up"
  | "workbook-down";

export const CHALKBOARD_RIG_LIMITS = {
  maxPupilX: 4.5,
  maxPupilY: 2.8,
  maxHeadTiltDeg: 3.0,
  maxHeadShiftX: 4.5,
  maxHeadShiftY: 3.0,
  maxBouncePx: 0,
  maxBrowLiftY: 3.5,
  maxBrowTiltDeg: 2.2,
  maxHairSwayDeg: 1.1,
  breathingPeriodSec: 4.1,
  maxBreathingScaleY: 1.006,
  blinkCloseMs: 55,
  blinkHoldClosedMs: 40,
  blinkOpenMs: 95,
} as const;

export type EyelidStage = 0 | 25 | 50 | 75 | 100;

export interface CoarticulatedViseme {
  readonly primaryShape: VisemeShape;
  readonly secondaryShape: VisemeShape | null;
  readonly primaryOpacity: number;
  readonly secondaryOpacity: number;
  readonly cueIndex: number | null;
  readonly source: "rhubarb-coarticulated" | "rest" | "muted" | "reduced-motion";
}

export interface ChalkboardRigFrame {
  readonly pupilX: number;
  readonly pupilY: number;
  readonly lidStage: EyelidStage;
  readonly leftBrowY: number;
  readonly rightBrowY: number;
  readonly leftBrowTiltDeg: number;
  readonly rightBrowTiltDeg: number;
  readonly headTiltDeg: number;
  readonly headShiftX: number;
  readonly headShiftY: number;
  readonly breathingScaleY: number;
  readonly hairLeftDeg: number;
  readonly hairRightDeg: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Resolves current and incoming Rhubarb phonetic mouth shapes at `currentTime`
 * with asymmetric coarticulation cross-fading (faster 38 ms lead-in into
 * bilabial closures `A`, smoother 55 ms blend across vowels/fricatives).
 */
export function resolveCoarticulatedViseme(input: {
  readonly currentTime: number | null | undefined;
  readonly timeline?: readonly VisemeCue[];
  readonly isSpeaking: boolean;
  readonly isPaused?: boolean;
  readonly isMuted?: boolean;
  readonly reducedMotion?: boolean;
}): CoarticulatedViseme {
  if (input.reducedMotion) {
    return {
      primaryShape: "X",
      secondaryShape: null,
      primaryOpacity: 1,
      secondaryOpacity: 0,
      cueIndex: null,
      source: "reduced-motion",
    };
  }
  if (input.isMuted) {
    return {
      primaryShape: "X",
      secondaryShape: null,
      primaryOpacity: 1,
      secondaryOpacity: 0,
      cueIndex: null,
      source: "muted",
    };
  }
  if (!input.isSpeaking || input.isPaused) {
    return {
      primaryShape: "X",
      secondaryShape: null,
      primaryOpacity: 1,
      secondaryOpacity: 0,
      cueIndex: null,
      source: "rest",
    };
  }

  const cues = input.timeline;
  const time = input.currentTime;
  if (!cues || cues.length === 0 || typeof time !== "number" || !Number.isFinite(time) || time < 0) {
    return {
      primaryShape: "X",
      secondaryShape: null,
      primaryOpacity: 1,
      secondaryOpacity: 0,
      cueIndex: null,
      source: "rest",
    };
  }

  // Binary search for cue covering `time`
  let lo = 0;
  let hi = cues.length - 1;
  let foundIdx = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const cue = cues[mid];
    if (time < cue.start) {
      hi = mid - 1;
    } else if (time >= cue.end) {
      lo = mid + 1;
    } else {
      foundIdx = mid;
      break;
    }
  }

  if (foundIdx === -1) {
    return {
      primaryShape: "X",
      secondaryShape: null,
      primaryOpacity: 1,
      secondaryOpacity: 0,
      cueIndex: null,
      source: "rhubarb-coarticulated",
    };
  }

  const cur = cues[foundIdx];
  const curShape = normalizeVisemeShape(cur.shape);
  const next = cues[foundIdx + 1];
  if (!next) {
    return {
      primaryShape: curShape,
      secondaryShape: null,
      primaryOpacity: 1,
      secondaryOpacity: 0,
      cueIndex: foundIdx,
      source: "rhubarb-coarticulated",
    };
  }

  const nextShape = normalizeVisemeShape(next.shape);
  const blendWindow = nextShape === "A" || nextShape === "X" ? 0.038 : 0.055;
  const remaining = cur.end - time;
  if (nextShape !== curShape && remaining >= 0 && remaining < blendWindow) {
    const t = clamp(remaining / blendWindow, 0, 1);
    return {
      primaryShape: curShape,
      secondaryShape: nextShape,
      primaryOpacity: Number(t.toFixed(3)),
      secondaryOpacity: Number((1 - t).toFixed(3)),
      cueIndex: foundIdx,
      source: "rhubarb-coarticulated",
    };
  }

  return {
    primaryShape: curShape,
    secondaryShape: null,
    primaryOpacity: 1,
    secondaryOpacity: 0,
    cueIndex: foundIdx,
    source: "rhubarb-coarticulated",
  };
}

const GAZE_COORDS: Record<ChalkboardGazeTarget, { readonly x: number; readonly y: number }> = {
  student: { x: 0, y: 0 },
  "chalkboard-title": { x: -4.0, y: -2.0 },
  "chalkboard-teaching": { x: -3.8, y: -0.4 },
  "flipchart-right": { x: 3.6, y: -0.4 },
  "thinking-up": { x: -2.1, y: -2.3 },
  "workbook-down": { x: 0.7, y: 1.9 },
};

/**
 * Evaluates a 5-stage asymmetric human blink from normalized elapsed blink time `blinkElapsedMs`.
 * Returns `0` when eyes are open or `blinkElapsedMs < 0`.
 */
export function evaluateBlinkStage(blinkElapsedMs: number): EyelidStage {
  if (!Number.isFinite(blinkElapsedMs) || blinkElapsedMs < 0) return 0;
  const { blinkCloseMs, blinkHoldClosedMs, blinkOpenMs } = CHALKBOARD_RIG_LIMITS;
  const total = blinkCloseMs + blinkHoldClosedMs + blinkOpenMs;
  if (blinkElapsedMs >= total) return 0;

  if (blinkElapsedMs < blinkCloseMs) {
    const p = blinkElapsedMs / blinkCloseMs;
    if (p < 0.34) return 25;
    if (p < 0.68) return 50;
    return 75;
  }
  if (blinkElapsedMs < blinkCloseMs + blinkHoldClosedMs) {
    return 100;
  }
  const openElapsed = blinkElapsedMs - (blinkCloseMs + blinkHoldClosedMs);
  const p = openElapsed / blinkOpenMs;
  if (p < 0.33) return 75;
  if (p < 0.67) return 50;
  return 25;
}

interface ExprTargets {
  readonly leftBrowY: number;
  readonly rightBrowY: number;
  readonly leftBrowTiltDeg: number;
  readonly rightBrowTiltDeg: number;
  readonly headTiltDeg: number;
  readonly headShiftX: number;
  readonly headShiftY: number;
}

const EXPRESSION_TARGETS: Record<ChalkboardRigExpression, ExprTargets> = {
  neutral: {
    leftBrowY: 0,
    rightBrowY: 0,
    leftBrowTiltDeg: 0,
    rightBrowTiltDeg: 0,
    headTiltDeg: 0,
    headShiftX: 0,
    headShiftY: 0,
  },
  listening: {
    leftBrowY: -1.8,
    rightBrowY: -1.9,
    leftBrowTiltDeg: -0.9,
    rightBrowTiltDeg: 0.9,
    headTiltDeg: 2.1,
    headShiftX: 0.3,
    headShiftY: 1.0,
  },
  thinking: {
    leftBrowY: -2.4,
    rightBrowY: -1.6,
    leftBrowTiltDeg: -1.6,
    rightBrowTiltDeg: 0.4,
    headTiltDeg: -2.0,
    headShiftX: 1.4,
    headShiftY: -0.4,
  },
  speaking: {
    leftBrowY: -1.1,
    rightBrowY: -1.1,
    leftBrowTiltDeg: -0.4,
    rightBrowTiltDeg: 0.4,
    headTiltDeg: 0.4,
    headShiftX: 0,
    headShiftY: 0,
  },
  smiling: {
    leftBrowY: -1.4,
    rightBrowY: -1.4,
    leftBrowTiltDeg: -0.6,
    rightBrowTiltDeg: 0.6,
    headTiltDeg: 1.0,
    headShiftX: 0,
    headShiftY: 0,
  },
  encouraging: {
    leftBrowY: -2.2,
    rightBrowY: -2.2,
    leftBrowTiltDeg: -1.0,
    rightBrowTiltDeg: 1.0,
    headTiltDeg: 1.4,
    headShiftX: 0,
    headShiftY: 1.3,
  },
  demonstrating: {
    leftBrowY: -1.5,
    rightBrowY: -1.5,
    leftBrowTiltDeg: -0.5,
    rightBrowTiltDeg: 0.5,
    headTiltDeg: -1.3,
    headShiftX: -1.8,
    headShiftY: 0.4,
  },
  "gentle-error": {
    leftBrowY: 0.8,
    rightBrowY: 0.8,
    leftBrowTiltDeg: 1.2,
    rightBrowTiltDeg: -1.2,
    headTiltDeg: -1.5,
    headShiftX: 0,
    headShiftY: 1.0,
  },
};

/**
 * Computes one deterministic 60fps frame for all independent anatomical channels:
 * pupils + micro-saccades, 5-step eyelids, left/right brows, calm head motion,
 * torso breathing, and delayed secondary hair-curl follow-through.
 */
export function computeChalkboardRigFrame(input: {
  readonly timeSec: number;
  readonly expression: ChalkboardRigExpression;
  readonly gazeTarget: ChalkboardGazeTarget;
  readonly isSpeaking: boolean;
  readonly blinkElapsedMs?: number;
  readonly reducedMotion: boolean;
}): ChalkboardRigFrame {
  if (input.reducedMotion) {
    return {
      pupilX: 0,
      pupilY: 0,
      lidStage: 0,
      leftBrowY: 0,
      rightBrowY: 0,
      leftBrowTiltDeg: 0,
      rightBrowTiltDeg: 0,
      headTiltDeg: 0,
      headShiftX: 0,
      headShiftY: 0,
      breathingScaleY: 1,
      hairLeftDeg: 0,
      hairRightDeg: 0,
    };
  }

  const t = Number.isFinite(input.timeSec) ? input.timeSec : 0;
  const base = EXPRESSION_TARGETS[input.expression] ?? EXPRESSION_TARGETS.neutral;
  const gaze = GAZE_COORDS[input.gazeTarget] ?? GAZE_COORDS.student;

  // Gentle organic fixation micro-saccades within clamped eye bounds
  const microSaccadeX = Math.sin(t * 1.15) * 0.35 + Math.sin(t * 2.9) * 0.18;
  const microSaccadeY = Math.cos(t * 0.95) * 0.22;
  const pupilX = clamp(
    gaze.x + microSaccadeX,
    -CHALKBOARD_RIG_LIMITS.maxPupilX,
    CHALKBOARD_RIG_LIMITS.maxPupilX,
  );
  const pupilY = clamp(
    gaze.y + microSaccadeY,
    -CHALKBOARD_RIG_LIMITS.maxPupilY,
    CHALKBOARD_RIG_LIMITS.maxPupilY,
  );

  // Smooth communicative brow micro-inflection while speaking or listening
  const browDrift = input.isSpeaking ? Math.sin(t * 2.4) * 0.55 : Math.sin(t * 0.9) * 0.25;
  const leftBrowY = clamp(
    base.leftBrowY + browDrift,
    -CHALKBOARD_RIG_LIMITS.maxBrowLiftY,
    CHALKBOARD_RIG_LIMITS.maxBrowLiftY,
  );
  const rightBrowY = clamp(
    base.rightBrowY + browDrift * 0.95,
    -CHALKBOARD_RIG_LIMITS.maxBrowLiftY,
    CHALKBOARD_RIG_LIMITS.maxBrowLiftY,
  );

  // Subtle living head motion (speaking cadence or attentive listening nods — zero bounce)
  let headX = base.headShiftX + Math.sin(t * 0.78) * 1.1 + gaze.x * 0.22;
  let headY = base.headShiftY + Math.cos(t * 0.92) * 0.65;
  let headTilt = base.headTiltDeg + Math.sin(t * 0.68) * 0.55;

  if (input.isSpeaking) {
    headY += Math.sin(t * 4.6) * 0.85;
    headTilt += Math.sin(t * 3.1) * 0.55;
  } else if (input.expression === "listening" || input.expression === "encouraging") {
    const nod = Math.max(0, Math.sin(t * 2.35));
    headY += nod * nod * 1.6;
  }

  headTilt = clamp(headTilt, -CHALKBOARD_RIG_LIMITS.maxHeadTiltDeg, CHALKBOARD_RIG_LIMITS.maxHeadTiltDeg);
  headX = clamp(headX, -CHALKBOARD_RIG_LIMITS.maxHeadShiftX, CHALKBOARD_RIG_LIMITS.maxHeadShiftX);
  headY = clamp(headY, -CHALKBOARD_RIG_LIMITS.maxHeadShiftY, CHALKBOARD_RIG_LIMITS.maxHeadShiftY);

  // Delayed secondary follow-through (320 ms lag behind head tilt/sway)
  const lagT = t - 0.32;
  const laggedHeadTilt =
    base.headTiltDeg +
    Math.sin(lagT * 0.68) * 0.55 +
    (input.isSpeaking ? Math.sin(lagT * 3.1) * 0.55 : 0);
  const hairLeftDeg = clamp(
    lerp(0, -laggedHeadTilt * 0.34, 1) + Math.sin(lagT * 0.88) * 0.25,
    -CHALKBOARD_RIG_LIMITS.maxHairSwayDeg,
    CHALKBOARD_RIG_LIMITS.maxHairSwayDeg,
  );
  const hairRightDeg = clamp(
    lerp(0, -laggedHeadTilt * 0.32, 1) + Math.sin(lagT * 0.88 - 0.18) * 0.25,
    -CHALKBOARD_RIG_LIMITS.maxHairSwayDeg,
    CHALKBOARD_RIG_LIMITS.maxHairSwayDeg,
  );

  // Calm 4.1 s torso breathing
  const breathePhase = (t / CHALKBOARD_RIG_LIMITS.breathingPeriodSec) * Math.PI * 2;
  const breathingScaleY =
    1 + (Math.sin(breathePhase) * 0.5 + 0.5) * (CHALKBOARD_RIG_LIMITS.maxBreathingScaleY - 1);

  return {
    pupilX: Number(pupilX.toFixed(2)),
    pupilY: Number(pupilY.toFixed(2)),
    lidStage: evaluateBlinkStage(input.blinkElapsedMs ?? -1),
    leftBrowY: Number(leftBrowY.toFixed(2)),
    rightBrowY: Number(rightBrowY.toFixed(2)),
    leftBrowTiltDeg: base.leftBrowTiltDeg,
    rightBrowTiltDeg: base.rightBrowTiltDeg,
    headTiltDeg: Number(headTilt.toFixed(2)),
    headShiftX: Number(headX.toFixed(2)),
    headShiftY: Number(headY.toFixed(2)),
    breathingScaleY: Number(breathingScaleY.toFixed(5)),
    hairLeftDeg: Number(hairLeftDeg.toFixed(2)),
    hairRightDeg: Number(hairRightDeg.toFixed(2)),
  };
}
