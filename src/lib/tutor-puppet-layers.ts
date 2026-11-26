/**
 * Tutor puppet layers, native torso-up framing, playback-time-locked Rhubarb
 * lip-sync, and independent subtle motion channels (Milestone 5 / spec §2, §6, §17).
 *
 * Safety rules (LAYER-PACK-SPEC "no off-model piece is ever used"):
 * - `public/cartilla/images/gretel/layers/manifest.json` is the ONLY production
 *   gate for facial/limb layer art. Until the owner approves each piece
 *   side-by-side (`docs/tutor/AVATAR-APPROVAL-PREVIEW.html`), the manifest
 *   stays EMPTY and the puppet renders `gretel-approved-master.png` intact
 *   in native-pixel-scale torso-up framing.
 * - Every layer MUST carry a non-empty owner `approval` reference and a
 *   same-origin `.png`/`.webp` path inside `PUPPET_LAYERS_DIR` (no traversal).
 * - Lip-sync is locked to real `audio.currentTime` (Rhubarb A–G/X); any
 *   amplitude fallback is explicitly labeled `source: "amplitude-fallback"`.
 * - Motion channels enforce zero bouncing, zero mouth-scaling, zero exaggerated
 *   gestures, and strict `prefers-reduced-motion: reduce` gating.
 */

import type { GretelState } from "@/components/gretel/gretelMachine";

/** Where the puppet's layer manifest lives (served from public/). */
export const PUPPET_LAYERS_MANIFEST_URL = "/cartilla/images/gretel/layers/manifest.json";

/** Layer files must sit in this directory (same-origin, no traversal). */
export const PUPPET_LAYERS_DIR = "/cartilla/images/gretel/layers/";

/** Native canvas dimensions of `gretel-approved-master.png` (never stretched). */
export const MASTER_CANVAS = { width: 1086, height: 1448 } as const;

/**
 * Native-pixel-scale torso-up window inside the 1086×1448 master coordinate
 * system. Frames red bow, full wavy hair curls, face, striped sleeves, blue
 * pinafore bib, and top of clasped hands at 1:1 native pixels with zero
 * stretching and pixel-exact registration for all 1086×1448 overlay layers.
 */
export const TORSO_UP_VIEWBOX = { x: 184, y: 0, width: 718, height: 860 } as const;

export type PuppetFraming = "torso-up" | "full";

export interface PuppetViewBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function getPuppetViewBox(framing: PuppetFraming = "torso-up"): PuppetViewBox {
  if (framing === "full") {
    return { x: 0, y: 0, width: MASTER_CANVAS.width, height: MASTER_CANVAS.height };
  }
  return TORSO_UP_VIEWBOX;
}

/**
 * Roles the puppet understands. Pieces cut from the master (Step A) and
 * owner-approved generated pieces (Step B) map onto these:
 * - `static` — always-visible stack pieces (hair-back, torso, head-skin, …)
 * - `blink`  — eyelids (shown only during blink cycle)
 * - `brows`  — subtle eyebrow expression overlay
 * - `mouth`  — one entry per Rhubarb shape it covers (`shapes`)
 * - `expression` — warm smiling/encouraging expression
 * - `arm-wave` / `arm-point` — the wave/point arm pieces
 */
export const PUPPET_LAYER_ROLES = [
  "static",
  "blink",
  "brows",
  "mouth",
  "expression",
  "arm-wave",
  "arm-point",
] as const;

export type PuppetLayerRole = (typeof PUPPET_LAYER_ROLES)[number];

/** Rhubarb extended shapes (§6 lip-sync): A–G, H plus X (rest). */
export const VISEME_SHAPES = ["A", "B", "C", "D", "E", "F", "G", "H", "X"] as const;
export type VisemeShape = (typeof VISEME_SHAPES)[number];

/** Core Rhubarb A–G + X set used for lip-sync reporting. */
export const CORE_VISEME_SHAPES = ["A", "B", "C", "D", "E", "F", "G", "X"] as const;

export interface PuppetLayer {
  /** Unique id, e.g. "mouth-open" or "hair-back". */
  id: string;
  role: PuppetLayerRole;
  /** Same-origin path inside PUPPET_LAYERS_DIR, .png or .webp. */
  src: string;
  /** Mouth layers only: which Rhubarb shapes this piece shows. */
  shapes?: readonly VisemeShape[];
  /** Owner approval reference (LAYER-PACK-SPEC Step C) — required. */
  approval: string;
}

export interface PuppetLayerManifest {
  layers: readonly PuppetLayer[];
}

/** What the puppet should render. */
export type PuppetLayerResolution =
  | { mode: "master" }
  | { mode: "layered"; composition: "overlay" | "complete"; layers: readonly PuppetLayer[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPuppetLayerRole(value: unknown): value is PuppetLayerRole {
  return typeof value === "string" && (PUPPET_LAYER_ROLES as readonly string[]).includes(value);
}

function isVisemeShape(value: unknown): value is VisemeShape {
  return typeof value === "string" && (VISEME_SHAPES as readonly string[]).includes(value);
}

function isAllowedSrc(value: unknown): value is string {
  if (typeof value !== "string" || !value.startsWith(PUPPET_LAYERS_DIR)) return false;
  if (value.includes("..") || /[%\\?#]/.test(value)) return false;
  return /\.(?:png|webp)$/.test(value);
}

/**
 * Validate the raw manifest. Returns ONLY the valid layers, in manifest
 * order (stack order); duplicates and every invalid entry are dropped.
 * A malformed manifest (not an object / `layers` not an array) yields [].
 */
export function validatePuppetLayers(input: unknown): PuppetLayer[] {
  if (!isRecord(input) || !Array.isArray(input.layers)) return [];

  const seen = new Set<string>();
  const valid: PuppetLayer[] = [];
  for (const raw of input.layers) {
    if (!isRecord(raw)) continue;
    const { id, role, src, shapes, approval } = raw;
    if (typeof id !== "string" || id.trim().length === 0) continue;
    if (seen.has(id)) continue;
    if (!isPuppetLayerRole(role)) continue;
    if (!isAllowedSrc(src)) continue;
    if (typeof approval !== "string" || approval.trim().length === 0) continue;

    let layerShapes: readonly VisemeShape[] | undefined;
    if (role === "mouth") {
      // Mouth pieces map 1:1 to Rhubarb shapes (§6): at least one known shape.
      if (!Array.isArray(shapes) || shapes.length === 0) continue;
      if (!shapes.every(isVisemeShape)) continue;
      layerShapes = shapes as VisemeShape[];
    } else if (shapes !== undefined) {
      continue;
    }

    seen.add(id);
    valid.push(
      layerShapes === undefined
        ? { id, role, src, approval }
        : { id, role, src, shapes: layerShapes, approval },
    );
  }
  return valid;
}

/** Injectable JSON fetcher so tests never touch the network. */
export type PuppetManifestFetcher = (url: string) => Promise<unknown | null>;

async function defaultFetchJson(url: string): Promise<unknown | null> {
  try {
    if (typeof fetch !== "function") return null;
    const response = await fetch(url);
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

/**
 * Resolve what the puppet renders today.
 * - fetch failed / manifest missing or malformed / every layer invalid /
 *   empty `layers` → `{ mode: "master" }` (approved master intact).
 * - one or more valid layers → `{ mode: "layered", layers }`.
 */
export async function loadPuppetLayers(
  fetchJson: PuppetManifestFetcher = defaultFetchJson,
): Promise<PuppetLayerResolution> {
  let raw: unknown = null;
  try {
    raw = await fetchJson(PUPPET_LAYERS_MANIFEST_URL);
  } catch {
    // A failed fetch (offline, CORS, mid-deploy) means master mode, never an error.
    raw = null;
  }
  const layers = validatePuppetLayers(raw);
  if (layers.length === 0 || !isRecord(raw)) return { mode: "master" };
  // Activation requires approved registration on the actual source canvas.
  if (
    raw.width !== MASTER_CANVAS.width ||
    raw.height !== MASTER_CANVAS.height ||
    typeof raw.compositionApproval !== "string" ||
    !raw.compositionApproval.trim()
  )
    return { mode: "master" };
  if (raw.composition === "overlay") return { mode: "layered", composition: "overlay", layers };
  const bases = [
    "hair-back",
    "legs",
    "skirt",
    "torso",
    "neck",
    "head-skin",
    "eyes-open",
    "brows",
    "hair-front-left",
    "hair-front-right",
    "bow",
  ];
  const complete =
    bases.every((id) => layers.some((layer) => layer.id === id && layer.role === "static")) &&
    layers.some((layer) => layer.role === "mouth" && layer.shapes?.includes("X"));
  if (
    raw.composition !== "complete" ||
    !complete ||
    layers.length !== (raw.layers as unknown[]).length
  )
    return { mode: "master" };
  return { mode: "layered", composition: "complete", layers };
}

/* ============================================================================
 * Playback-time-locked Rhubarb A–G/X lip-sync engine
 * ============================================================================ */

export interface VisemeCue {
  /** Start timestamp in seconds from audio start. */
  readonly start: number;
  /** End timestamp in seconds from audio start. */
  readonly end: number;
  /** Rhubarb shape A–G (or H) or X (rest). */
  readonly shape: string;
}

export type LipSyncSource =
  | "rhubarb-timeline"
  | "amplitude-fallback"
  | "prop-override"
  | "rest"
  | "muted"
  | "reduced-motion";

export interface LipSyncInput {
  /** Real `audio.currentTime` in seconds (null/undefined when idle). */
  readonly currentTime: number | null | undefined;
  /** Rhubarb viseme cues sorted by `start` time. */
  readonly timeline?: readonly VisemeCue[];
  /** True only while real recorded speech is actively playing. */
  readonly isSpeaking: boolean;
  /** True when playback is paused, interrupted, or cancelled. */
  readonly isPaused?: boolean;
  /** True when audio is muted. */
  readonly isMuted?: boolean;
  /** True when `prefers-reduced-motion: reduce` is active. */
  readonly reducedMotion?: boolean;
  /** Optional normalized audio RMS/peak amplitude (0..1) for fallback ONLY. */
  readonly amplitude?: number | null;
  /** Optional legacy/controlled viseme prop when no timeline is supplied. */
  readonly propViseme?: string;
}

export interface LipSyncResolution {
  readonly shape: VisemeShape;
  readonly source: LipSyncSource;
  readonly cueIndex: number | null;
  /** Explicitly true whenever amplitude fallback is driving the mouth. */
  readonly isFallback: boolean;
}

/** Normalize any raw cue label into a valid Rhubarb shape (default "X"). */
export function normalizeVisemeShape(raw: string | undefined | null): VisemeShape {
  if (!raw) return "X";
  const upper = raw.trim().toUpperCase();
  if (isVisemeShape(upper)) return upper;
  return "X";
}

/**
 * Deterministic amplitude-to-viseme mapping used ONLY as an explicitly labeled
 * fallback when no Rhubarb timeline exists for a playing clip.
 * Never scales the mouth — only selects discrete shapes (X, A, B, C, D).
 */
export function visemeFromAmplitude(amplitude: number): VisemeShape {
  if (!Number.isFinite(amplitude) || amplitude <= 0.04) return "X";
  if (amplitude < 0.18) return "A";
  if (amplitude < 0.38) return "B";
  if (amplitude < 0.65) return "C";
  return "D";
}

/**
 * Resolve the exact Rhubarb viseme for the current playback frame.
 * Locked strictly to real `audio.currentTime`; never uses wall-clock timers.
 */
export function resolveLipSync(input: LipSyncInput): LipSyncResolution {
  if (input.reducedMotion) {
    return { shape: "X", source: "reduced-motion", cueIndex: null, isFallback: false };
  }
  if (input.isMuted) {
    return { shape: "X", source: "muted", cueIndex: null, isFallback: false };
  }
  if (!input.isSpeaking || input.isPaused) {
    return { shape: "X", source: "rest", cueIndex: null, isFallback: false };
  }

  const timeline = input.timeline;
  const time = input.currentTime;
  if (timeline && timeline.length > 0 && typeof time === "number" && Number.isFinite(time) && time >= 0) {
    // Binary search for the cue whose [start, end) contains `time`.
    let lo = 0;
    let hi = timeline.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const cue = timeline[mid];
      if (time < cue.start) {
        hi = mid - 1;
      } else if (time >= cue.end) {
        lo = mid + 1;
      } else {
        return {
          shape: normalizeVisemeShape(cue.shape),
          source: "rhubarb-timeline",
          cueIndex: mid,
          isFallback: false,
        };
      }
    }
    return { shape: "X", source: "rhubarb-timeline", cueIndex: null, isFallback: false };
  }

  if (typeof input.amplitude === "number" && Number.isFinite(input.amplitude)) {
    return {
      shape: visemeFromAmplitude(input.amplitude),
      source: "amplitude-fallback",
      cueIndex: null,
      isFallback: true,
    };
  }

  if (input.propViseme && normalizeVisemeShape(input.propViseme) !== "X") {
    return {
      shape: normalizeVisemeShape(input.propViseme),
      source: "prop-override",
      cueIndex: null,
      isFallback: false,
    };
  }

  return { shape: "X", source: "rest", cueIndex: null, isFallback: false };
}

/* ============================================================================
 * Independent subtle motion channels (emilkowalski-animation craft)
 * Zero bouncing, zero mouth-scaling, zero exaggerated gestures.
 * ============================================================================ */

export type TutorPuppetExpression =
  | "neutral"
  | "listening"
  | "thinking"
  | "smiling"
  | "encouraging"
  | "nodding"
  | "pointing"
  | "farewell"
  | "gentle-error";

export type TutorGazeTarget = "center" | "student" | "board-left" | "board-right" | "down-notes";

/** Emil Kowalski ease-out-quint curve for calm, physically grounded transitions. */
export const PUPPET_MOTION_EASE = [0.22, 1, 0.36, 1] as const;

/** Hard safety limits enforced across all puppet motion channels. */
export const PUPPET_CHANNEL_LIMITS = {
  maxTiltDeg: 4.5,
  maxShiftXPx: 6,
  maxShiftYPx: 3.5,
  maxBreathingScaleY: 1.008,
  minBreathingDurationSec: 3.6,
  blinkDurationMs: 130,
  blinkMinIntervalMs: 3200,
  blinkMaxIntervalMs: 5800,
  /** Mouth must NEVER scale — strictly discrete Rhubarb swaps only. */
  mouthScale: 1,
  /** Zero vertical bounce/hop allowed. */
  maxBouncePx: 0,
} as const;

export interface PuppetChannelPose {
  readonly headTiltDeg: number;
  readonly headShiftX: number;
  readonly headShiftY: number;
  readonly gazeOffsetX: number;
  readonly gazeOffsetY: number;
  readonly browLiftPx: number;
  readonly breathingEnabled: boolean;
  readonly breathingDurationSec: number;
  readonly breathingScaleY: number;
  /** Subtle downward affirmative nod sequence (never upward bounce). */
  readonly nodSequenceY: readonly number[] | null;
  readonly blinkEnabled: boolean;
  readonly smileActive: boolean;
  readonly pointingActive: boolean;
  readonly farewellActive: boolean;
  readonly transitionDurationSec: number;
  readonly transitionEase: readonly [number, number, number, number];
}

/** Map legacy `gretelMachine` state to a calm tutor expression when no explicit expression is passed. */
export function expressionFromState(state: GretelState): TutorPuppetExpression {
  switch (state) {
    case "listening":
      return "listening";
    case "help":
      return "thinking";
    case "cheering":
      return "encouraging";
    case "pointing":
    case "teaching":
      return "pointing";
    case "waving":
    case "exiting":
      return "farewell";
    case "gentle-error":
      return "gentle-error";
    default:
      return "neutral";
  }
}

const GAZE_OFFSETS: Record<TutorGazeTarget, { x: number; y: number }> = {
  center: { x: 0, y: 0 },
  student: { x: 0, y: -0.5 },
  "board-left": { x: -2.2, y: -0.4 },
  "board-right": { x: 2.2, y: -0.4 },
  "down-notes": { x: 0.4, y: 1.8 },
};

/**
 * Compute all independent subtle animation channels for the puppet.
 * - Zero bouncing (no upward hop).
 * - Zero mouth-scaling.
 * - Zero exaggerated gestures.
 * - Strict `prefers-reduced-motion: reduce` gating returns pure identity pose.
 */
export function computePuppetChannels(options: {
  readonly state: GretelState;
  readonly expression?: TutorPuppetExpression;
  readonly gazeTarget?: TutorGazeTarget;
  readonly reducedMotion: boolean;
}): PuppetChannelPose {
  const expr = options.expression ?? expressionFromState(options.state);

  if (options.reducedMotion) {
    return {
      headTiltDeg: 0,
      headShiftX: 0,
      headShiftY: 0,
      gazeOffsetX: 0,
      gazeOffsetY: 0,
      browLiftPx: 0,
      breathingEnabled: false,
      breathingDurationSec: 0,
      breathingScaleY: 1,
      nodSequenceY: null,
      blinkEnabled: false,
      smileActive: expr === "smiling" || expr === "encouraging",
      pointingActive: expr === "pointing",
      farewellActive: expr === "farewell",
      transitionDurationSec: 0,
      transitionEase: PUPPET_MOTION_EASE,
    };
  }

  const gaze = GAZE_OFFSETS[options.gazeTarget ?? "student"];

  let headTiltDeg = 0;
  let headShiftX = 0;
  let headShiftY = 0;
  let browLiftPx = 0;
  let nodSequenceY: readonly number[] | null = null;
  let transitionDurationSec = 0.45;

  switch (expr) {
    case "listening":
      headTiltDeg = 3.5;
      headShiftY = 1;
      browLiftPx = -1.5;
      transitionDurationSec = 0.52;
      break;
    case "thinking":
      headTiltDeg = -2.4;
      headShiftX = 1.5;
      browLiftPx = -1;
      transitionDurationSec = 0.55;
      break;
    case "smiling":
      headTiltDeg = 1.0;
      browLiftPx = -1;
      transitionDurationSec = 0.42;
      break;
    case "encouraging":
      // Warm calm lean-in + gentle downward nod — ZERO bouncing/hopping.
      headTiltDeg = 1.4;
      browLiftPx = -1.8;
      nodSequenceY = [0, 2.5, 0, 1.5, 0];
      transitionDurationSec = 0.48;
      break;
    case "nodding":
      headTiltDeg = 0.6;
      nodSequenceY = [0, 3, 0, 2, 0];
      transitionDurationSec = 0.44;
      break;
    case "pointing":
      headTiltDeg = -1.2;
      headShiftX = -3.5;
      transitionDurationSec = 0.48;
      break;
    case "farewell":
      headTiltDeg = 2.0;
      browLiftPx = -1.2;
      transitionDurationSec = 0.52;
      break;
    case "gentle-error":
      headTiltDeg = -1.8;
      headShiftY = 1.2;
      browLiftPx = 0.8;
      transitionDurationSec = 0.5;
      break;
    case "neutral":
    default:
      break;
  }

  return {
    headTiltDeg,
    headShiftX,
    headShiftY,
    gazeOffsetX: gaze.x,
    gazeOffsetY: gaze.y,
    browLiftPx,
    breathingEnabled: true,
    breathingDurationSec: 4.0,
    breathingScaleY: 1.007,
    nodSequenceY,
    blinkEnabled: true,
    smileActive: expr === "smiling" || expr === "encouraging",
    pointingActive: expr === "pointing",
    farewellActive: expr === "farewell",
    transitionDurationSec,
    transitionEase: PUPPET_MOTION_EASE,
  };
}
