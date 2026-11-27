/**
 * Interactive Hybrid Animation Sequence Director.
 *
 * Orchestrates the complete 8-phase living teacher sequence over a continuous
 * timeline without abrupt cuts or teleporting poses:
 *   1. listen_1          — natural attentive listening & pupil micro-saccades
 *   2. acknowledge       — warm nod & smile acknowledging student's answer
 *   3. turn_to_board     — continuous 2.5D turn toward left deep-green chalkboard + raise chalk arm
 *   4. write_demonstrate — physical 2-bone IK chalk hand writing word, syllable breakdown, underline & circle
 *   5. erase_board       — felt eraser sweep erasing scratch mark with chalk dust
 *   6. turn_back         — lower arm & smoothly turn back toward the student
 *   7. speak_rhubarb     — real approved recording driven strictly by Rhubarb `.visemes.json`
 *   8. listen_feedback   — return to attentive listening + encouraging feedback smile
 *
 * Optional Google Flow silent action clips (`public/cartilla/images/gretel/tutor/flow-clips/`)
 * drop straight in via `resolveHybridClipSpec` when present, falling back seamlessly
 * to the local 60fps mesh-skinned + 2-bone IK engine offline at $0 cost.
 */
import type { ChalkboardGazeTarget, ChalkboardRigExpression } from "./tutor-chalkboard-rig";
import { splitSpanishSyllables } from "./tutor-chalkboard";
import type { Vec2 } from "./tutor-mesh-rig";

export type HybridPhaseId =
  | "listen_1"
  | "acknowledge"
  | "turn_to_board"
  | "write_demonstrate"
  | "erase_board"
  | "turn_back"
  | "speak_rhubarb"
  | "listen_feedback";

export type HybridToolMode = "none" | "chalk" | "eraser";

export interface HybridDirectorFrame {
  readonly phase: HybridPhaseId;
  readonly phaseLabelEs: string;
  /** Continuous front->3/4-left turn blend (0 = facing student, 1 = facing chalkboard). */
  readonly turnBlend: number;
  readonly expression: ChalkboardRigExpression;
  readonly gazeTarget: ChalkboardGazeTarget;
  /** Active arm extension (0 = lowered at rest, 1 = reaching onto chalkboard). */
  readonly armRaise: number;
  readonly activeTool: HybridToolMode;
  /** Chalk or eraser IK contact target in 1600x1000 stage coordinates. */
  readonly ikTargetStage: Vec2;
  /** Chalk reveals synchronized strictly to `ikTargetStage`. */
  readonly writeWordProgress: number;
  readonly underlineProgress: number;
  readonly circleProgress: number;
  readonly syllableArcProgress: readonly number[];
  readonly scratchNoteVisibleProgress: number;
  readonly scratchEraseProgress: number;
  /** Active Rhubarb speech time in seconds during `speak_rhubarb`, else null. */
  readonly audioSpeechTimeSec: number | null;
  readonly isSpeakingAudio: boolean;
}

export interface HybridPhaseWindow {
  readonly id: HybridPhaseId;
  readonly startSec: number;
  readonly endSec: number;
}

export const HYBRID_SEQUENCE_WINDOWS: readonly HybridPhaseWindow[] = [
  { id: "listen_1", startSec: 0.0, endSec: 1.7 },
  { id: "acknowledge", startSec: 1.7, endSec: 2.5 },
  { id: "turn_to_board", startSec: 2.5, endSec: 3.3 },
  { id: "write_demonstrate", startSec: 3.3, endSec: 6.1 },
  { id: "erase_board", startSec: 6.1, endSec: 7.4 },
  { id: "turn_back", startSec: 7.4, endSec: 8.2 },
  { id: "speak_rhubarb", startSec: 8.2, endSec: 10.0 },
  { id: "listen_feedback", startSec: 10.0, endSec: 11.6 },
];

export const HYBRID_SEQUENCE_DURATION_SEC = 11.6;

/** Optional drop-in silent Google Flow clip registry ($0 local override). */
export const GOOGLE_FLOW_CLIP_SLOTS: Readonly<Record<HybridPhaseId, string>> = {
  listen_1: "/cartilla/images/gretel/tutor/flow-clips/natural-listening.mp4",
  acknowledge: "/cartilla/images/gretel/tutor/flow-clips/natural-listening.mp4",
  turn_to_board: "/cartilla/images/gretel/tutor/flow-clips/turn-and-write.mp4",
  write_demonstrate: "/cartilla/images/gretel/tutor/flow-clips/turn-and-write.mp4",
  erase_board: "/cartilla/images/gretel/tutor/flow-clips/turn-and-erase.mp4",
  turn_back: "/cartilla/images/gretel/tutor/flow-clips/turn-and-erase.mp4",
  speak_rhubarb: "/cartilla/images/gretel/tutor/flow-clips/natural-listening.mp4",
  listen_feedback: "/cartilla/images/gretel/tutor/flow-clips/natural-listening.mp4",
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function easeInOutCubic(t: number): number {
  const u = clamp01(t);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

/** Smooth writing trajectory across Left Slate Zone (`x: 130..440, y: 310..480`). */
function computeWritingChalkTip(p: number): Vec2 {
  const u = clamp01(p);
  if (u < 0.45) {
    // Writing word left -> right along y=342 with gentle handwritten vertical bob
    const w = u / 0.45;
    return {
      x: 120 + w * 250,
      y: 342 + Math.sin(w * Math.PI * 10) * 14,
    };
  }
  if (u < 0.68) {
    // Underlining cleanly left -> right below word (y=386)
    const ul = (u - 0.45) / 0.23;
    return {
      x: 112 + ul * 270,
      y: 386 + Math.sin(ul * Math.PI) * 5,
    };
  }
  // Circling target initial letter/syllable on syllable row (center 138, 442)
  const c = (u - 0.68) / 0.32;
  const ang = -Math.PI * 0.5 + c * Math.PI * 2;
  return {
    x: 142 + Math.cos(ang) * 46,
    y: 444 + Math.sin(ang) * 32,
  };
}

/**
 * Evaluates exact pose, body turn, 2-bone IK chalk/eraser coordinates, and
 * synced board reveal percentages at any timestamp `timeSec` in `[0, 11.6]`.
 */
export function evaluateHybridDirectorAtTime(input: {
  readonly timeSec: number;
  readonly word: string;
  readonly speechClipDurationSec?: number;
  readonly reducedMotion?: boolean;
}): HybridDirectorFrame {
  const syllables = splitSpanishSyllables(input.word);
  const speechDur = Math.max(1.2, input.speechClipDurationSec ?? 1.56);
  const t = Math.max(0, Math.min(HYBRID_SEQUENCE_DURATION_SEC, input.timeSec));

  if (input.reducedMotion) {
    return {
      phase: "speak_rhubarb",
      phaseLabelEs: "Modo calmado",
      turnBlend: 0,
      expression: "smiling",
      gazeTarget: "student",
      armRaise: 0,
      activeTool: "none",
      ikTargetStage: { x: 480, y: 680 },
      writeWordProgress: 1,
      underlineProgress: 1,
      circleProgress: 1,
      syllableArcProgress: syllables.map(() => 1),
      scratchNoteVisibleProgress: 0,
      scratchEraseProgress: 1,
      audioSpeechTimeSec: null,
      isSpeakingAudio: false,
    };
  }

  // Rest arm position neatly tucked off bottom-right
  const restHand: Vec2 = { x: 640, y: 740 };

  if (t < 1.7) {
    return {
      phase: "listen_1",
      phaseLabelEs: "1. Escuchando al estudiante",
      turnBlend: 0,
      expression: "listening",
      gazeTarget: "student",
      armRaise: 0,
      activeTool: "none",
      ikTargetStage: restHand,
      writeWordProgress: 0,
      underlineProgress: 0,
      circleProgress: 0,
      syllableArcProgress: syllables.map(() => 0),
      scratchNoteVisibleProgress: 1,
      scratchEraseProgress: 0,
      audioSpeechTimeSec: null,
      isSpeakingAudio: false,
    };
  }

  if (t < 2.5) {
    return {
      phase: "acknowledge",
      phaseLabelEs: "2. Asintiendo con calidez",
      turnBlend: 0,
      expression: "encouraging",
      gazeTarget: "student",
      armRaise: 0,
      activeTool: "none",
      ikTargetStage: restHand,
      writeWordProgress: 0,
      underlineProgress: 0,
      circleProgress: 0,
      syllableArcProgress: syllables.map(() => 0),
      scratchNoteVisibleProgress: 1,
      scratchEraseProgress: 0,
      audioSpeechTimeSec: null,
      isSpeakingAudio: false,
    };
  }

  // Smooth chalk trajectory across word -> underline -> circle while teacher looks warmly at board
  if (t < 3.3) {
    const p = easeInOutCubic((t - 2.5) / 0.8);
    const firstWritePt: Vec2 = { x: 120, y: 342 };
    return {
      phase: "turn_to_board",
      phaseLabelEs: "3. Enfocando la pizarra",
      turnBlend: p * 0.35,
      expression: "demonstrating",
      gazeTarget: "chalkboard-teaching",
      armRaise: p,
      activeTool: p > 0.2 ? "chalk" : "none",
      ikTargetStage: {
        x: lerp(restHand.x, firstWritePt.x, p),
        y: lerp(restHand.y, firstWritePt.y, p),
      },
      writeWordProgress: 0,
      underlineProgress: 0,
      circleProgress: 0,
      syllableArcProgress: syllables.map(() => 0),
      scratchNoteVisibleProgress: 1,
      scratchEraseProgress: 0,
      audioSpeechTimeSec: null,
      isSpeakingAudio: false,
    };
  }

  if (t < 6.1) {
    const p = clamp01((t - 3.3) / 2.8);
    const writeP = clamp01(p / 0.45);
    const ulP = clamp01((p - 0.45) / 0.23);
    const cirP = clamp01((p - 0.68) / 0.32);
    const tip = computeWritingChalkTip(p);
    return {
      phase: "write_demonstrate",
      phaseLabelEs: "4. Escribiendo y subrayando en tiza",
      turnBlend: 1,
      expression: "demonstrating",
      gazeTarget: "chalkboard-teaching",
      armRaise: 1,
      activeTool: "chalk",
      ikTargetStage: tip,
      writeWordProgress: writeP,
      underlineProgress: ulP,
      circleProgress: cirP,
      syllableArcProgress: syllables.map((_, idx) =>
        clamp01((p - (0.38 + idx * 0.16)) / 0.16),
      ),
      scratchNoteVisibleProgress: 1,
      scratchEraseProgress: 0,
      audioSpeechTimeSec: null,
      isSpeakingAudio: false,
    };
  }

  if (t < 7.4) {
    // Smooth horizontal wipe over upper-right slate scratch note (x: 410..625, y: 245)
    const p = clamp01((t - 6.1) / 1.3);
    const sweepX = 415 + (0.5 - 0.5 * Math.cos(p * Math.PI * 3)) * 185;
    const sweepY = 238 + Math.sin(p * Math.PI * 2) * 18;
    return {
      phase: "erase_board",
      phaseLabelEs: "5. Borrando nota auxiliar",
      turnBlend: 1,
      expression: "demonstrating",
      gazeTarget: "chalkboard-teaching",
      armRaise: 1,
      activeTool: "eraser",
      ikTargetStage: { x: sweepX, y: sweepY },
      writeWordProgress: 1,
      underlineProgress: 1,
      circleProgress: 1,
      syllableArcProgress: syllables.map(() => 1),
      scratchNoteVisibleProgress: 1,
      scratchEraseProgress: p,
      audioSpeechTimeSec: null,
      isSpeakingAudio: false,
    };
  }

  if (t < 8.2) {
    const p = easeInOutCubic((t - 7.4) / 0.8);
    const fromEraser: Vec2 = { x: 540, y: 245 };
    return {
      phase: "turn_back",
      phaseLabelEs: "6. Mirando al estudiante",
      turnBlend: (1 - p) * 0.35,
      expression: "smiling",
      gazeTarget: "student",
      armRaise: 1 - p,
      activeTool: p < 0.7 ? "eraser" : "none",
      ikTargetStage: {
        x: lerp(fromEraser.x, 178, p),
        y: lerp(fromEraser.y, 876, p),
      },
      writeWordProgress: 1,
      underlineProgress: 1,
      circleProgress: 1,
      syllableArcProgress: syllables.map(() => 1),
      scratchNoteVisibleProgress: 0,
      scratchEraseProgress: 1,
      audioSpeechTimeSec: null,
      isSpeakingAudio: false,
    };
  }

  if (t < 10.0) {
    const speechT = Math.min(speechDur, t - 8.2);
    return {
      phase: "speak_rhubarb",
      phaseLabelEs: "7. Hablando con voz grabada y visemas Rhubarb",
      turnBlend: 0,
      expression: "speaking",
      gazeTarget: "student",
      armRaise: 0,
      activeTool: "none",
      ikTargetStage: restHand,
      writeWordProgress: 1,
      underlineProgress: 1,
      circleProgress: 1,
      syllableArcProgress: syllables.map(() => 1),
      scratchNoteVisibleProgress: 0,
      scratchEraseProgress: 1,
      audioSpeechTimeSec: speechT,
      isSpeakingAudio: speechT < speechDur,
    };
  }

  return {
    phase: "listen_feedback",
    phaseLabelEs: "8. Escuchando nuevamente y animando",
    turnBlend: 0,
    expression: t > 10.8 ? "encouraging" : "listening",
    gazeTarget: "student",
    armRaise: 0,
    activeTool: "none",
    ikTargetStage: restHand,
    writeWordProgress: 1,
    underlineProgress: 1,
    circleProgress: 1,
    syllableArcProgress: syllables.map(() => 1),
    scratchNoteVisibleProgress: 0,
    scratchEraseProgress: 1,
    audioSpeechTimeSec: null,
    isSpeakingAudio: false,
  };
}
