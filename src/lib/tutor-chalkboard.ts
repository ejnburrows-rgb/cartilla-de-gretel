/**
 * Interactive Spanish literacy chalkboard engine.
 *
 * Synchronizes authentic chalk writing, syllable demonstration bridges,
 * underlining, circling, and traditional felt-eraser wiping with Gretel's
 * recorded audio (`audio.currentTime`) and lesson teaching context while
 * keeping exact Cartilla Spanish spelling intact.
 */
import type { ChalkboardGazeTarget } from "./tutor-chalkboard-rig";

export type ChalkboardActionKind = "write" | "demonstrate" | "underline" | "circle" | "erase";

export interface ChalkboardAction {
  readonly kind: ChalkboardActionKind;
  readonly startSec: number;
  readonly endSec: number;
  readonly syllableIndex?: number;
  readonly targetSpan?: string;
}

export interface ChalkboardSequence {
  readonly word: string;
  readonly syllables: readonly string[];
  readonly focusSpan: string;
  readonly focusIndex: number;
  readonly durationSec: number;
  readonly actions: readonly ChalkboardAction[];
}

export interface ChalkboardFrameState {
  readonly word: string;
  readonly syllables: readonly string[];
  readonly focusIndex: number;
  readonly writeProgress: number;
  readonly activeSyllableIndex: number;
  readonly syllableArcProgress: readonly number[];
  readonly underlineProgress: number;
  readonly circleProgress: number;
  readonly eraseProgress: number;
  readonly activeAction: ChalkboardActionKind | "hold";
  readonly recommendedGaze: ChalkboardGazeTarget;
}

const VOWELS = new Set(["a", "e", "i", "o", "u", "á", "é", "í", "ó", "ú", "ü"]);
const STRONG_VOWELS = new Set(["a", "e", "o", "á", "é", "ó"]);
const INSEPARABLE_ONSETS = new Set([
  "bl",
  "br",
  "cl",
  "cr",
  "dr",
  "fl",
  "fr",
  "gl",
  "gr",
  "pl",
  "pr",
  "tr",
  "ch",
  "ll",
  "rr",
]);

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function isVowel(ch: string): boolean {
  return VOWELS.has(ch.toLowerCase());
}

/**
 * Splits a Spanish Cartilla word into clean instructional syllables
 * (handling digraphs ch/ll/rr, onset clusters, diphthongs, and hiatus).
 */
export function splitSpanishSyllables(rawWord: string): string[] {
  const clean = (rawWord ?? "").trim();
  if (!clean) return [];
  if (clean.includes(" ")) {
    return clean.split(/\s+/).filter(Boolean);
  }
  const chars = Array.from(clean);
  if (chars.length <= 2) return [clean];

  const vowelIndices: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    if (isVowel(chars[i])) vowelIndices.push(i);
  }
  if (vowelIndices.length <= 1) return [clean];

  // Collect syllable split boundaries between consecutive vowel nuclei
  const splits: number[] = [];
  for (let vi = 0; vi < vowelIndices.length - 1; vi++) {
    const v1 = vowelIndices[vi];
    const v2 = vowelIndices[vi + 1];
    const consCount = v2 - v1 - 1;

    if (consCount === 0) {
      // Adjacent vowels: break hiatus when both are strong or stressed weak vowel
      const c1 = chars[v1].toLowerCase();
      const c2 = chars[v2].toLowerCase();
      const strong1 = STRONG_VOWELS.has(c1) || c1 === "í" || c1 === "ú";
      const strong2 = STRONG_VOWELS.has(c2) || c2 === "í" || c2 === "ú";
      if (strong1 && strong2) {
        splits.push(v2);
      }
      continue;
    }

    if (consCount === 1) {
      splits.push(v1 + 1);
    } else if (consCount === 2) {
      const pair = (chars[v1 + 1] + chars[v1 + 2]).toLowerCase();
      splits.push(INSEPARABLE_ONSETS.has(pair) ? v1 + 1 : v1 + 2);
    } else {
      const lastTwo = (chars[v2 - 2] + chars[v2 - 1]).toLowerCase();
      splits.push(INSEPARABLE_ONSETS.has(lastTwo) ? v2 - 2 : v2 - 1);
    }
  }

  const result: string[] = [];
  let prev = 0;
  for (const s of splits) {
    if (s > prev) result.push(chars.slice(prev, s).join(""));
    prev = s;
  }
  if (prev < chars.length) result.push(chars.slice(prev).join(""));
  return result.length > 0 ? result : [clean];
}

/**
 * Builds a deterministic, time-synced chalkboard teaching sequence
 * covering write -> underline/circle -> syllable demonstrate arcs -> erase.
 */
export function buildChalkboardSequence(input: {
  readonly text: string;
  readonly focusLetter?: string;
  readonly durationSec?: number;
  readonly mode?: "model" | "hint" | "correction" | "celebrate" | "idle";
  readonly includeEraseAtEnd?: boolean;
}): ChalkboardSequence {
  const word = (input.text ?? "").trim();
  const syllables = splitSpanishSyllables(word);
  const durationSec = Math.max(1.2, input.durationSec ?? 1.8);
  const mode = input.mode ?? "model";

  const focusLetter = (input.focusLetter ?? syllables[0]?.[0] ?? word[0] ?? "").trim();
  let focusIndex = 0;
  if (focusLetter) {
    const normalizedFocus = focusLetter.toLowerCase();
    const idx = syllables.findIndex((s) => s.toLowerCase().includes(normalizedFocus));
    if (idx >= 0) focusIndex = idx;
  }

  const actions: ChalkboardAction[] = [];

  if (mode === "idle") {
    return { word, syllables, focusSpan: syllables[0] ?? word, focusIndex, durationSec, actions };
  }

  // Write smoothly at the start of Gretel's prompt
  const writeEnd = Math.min(durationSec * 0.28, 0.48);
  actions.push({ kind: "write", startSec: 0, endSec: writeEnd, targetSpan: word });

  // Circle or underline target letter/syllable as she stresses it
  const emphasisStart = Math.max(0.12, writeEnd * 0.65);
  const emphasisEnd = Math.min(durationSec * 0.65, emphasisStart + 0.46);
  if (mode === "hint" || mode === "correction") {
    actions.push({
      kind: "circle",
      startSec: emphasisStart,
      endSec: emphasisEnd,
      syllableIndex: focusIndex,
      targetSpan: syllables[focusIndex] ?? word,
    });
    actions.push({
      kind: "underline",
      startSec: emphasisEnd * 0.85,
      endSec: Math.min(durationSec * 0.85, emphasisEnd + 0.35),
      syllableIndex: focusIndex,
    });
  } else {
    actions.push({
      kind: "underline",
      startSec: emphasisStart,
      endSec: emphasisEnd,
      syllableIndex: focusIndex,
      targetSpan: syllables[focusIndex] ?? word,
    });
    actions.push({
      kind: "circle",
      startSec: Math.max(emphasisStart + 0.08, emphasisEnd - 0.16),
      endSec: Math.min(durationSec * 0.78, emphasisEnd + 0.32),
      syllableIndex: focusIndex,
      targetSpan: syllables[focusIndex] ?? word,
    });
  }

  // Sequential syllable reading-bridge arcs synced across spoken utterance
  const sylCount = Math.max(1, syllables.length);
  const arcStart = Math.min(0.24, writeEnd * 0.7);
  const arcEnd = input.includeEraseAtEnd ? durationSec * 0.78 : durationSec * 0.92;
  const arcSpan = Math.max(0.25, arcEnd - arcStart) / sylCount;
  for (let i = 0; i < sylCount; i++) {
    actions.push({
      kind: "demonstrate",
      startSec: Number((arcStart + i * arcSpan).toFixed(3)),
      endSec: Number((arcStart + (i + 1) * arcSpan).toFixed(3)),
      syllableIndex: i,
      targetSpan: syllables[i],
    });
  }

  if (input.includeEraseAtEnd) {
    actions.push({
      kind: "erase",
      startSec: Number((durationSec * 0.84).toFixed(3)),
      endSec: durationSec,
    });
  }

  return {
    word,
    syllables,
    focusSpan: syllables[focusIndex] ?? word,
    focusIndex,
    durationSec,
    actions,
  };
}

function actionProgress(action: ChalkboardAction | undefined, timeSec: number): number {
  if (!action) return 0;
  if (timeSec <= action.startSec) return 0;
  if (timeSec >= action.endSec) return 1;
  const span = Math.max(0.001, action.endSec - action.startSec);
  const t = clamp01((timeSec - action.startSec) / span);
  // Cubic ease-out for crisp responsive chalk strokes
  return 1 - Math.pow(1 - t, 3);
}

/** Evaluates exact stroke reveal percentages & recommended eye gaze at `timeSec`. */
export function evaluateChalkboardAtTime(
  sequence: ChalkboardSequence,
  timeSec: number,
  reducedMotion = false,
): ChalkboardFrameState {
  if (!sequence.word) {
    return {
      word: "",
      syllables: [],
      focusIndex: 0,
      writeProgress: 0,
      activeSyllableIndex: -1,
      syllableArcProgress: [],
      underlineProgress: 0,
      circleProgress: 0,
      eraseProgress: 0,
      activeAction: "hold",
      recommendedGaze: "student",
    };
  }

  if (reducedMotion) {
    return {
      word: sequence.word,
      syllables: sequence.syllables,
      focusIndex: sequence.focusIndex,
      writeProgress: 1,
      activeSyllableIndex: -1,
      syllableArcProgress: sequence.syllables.map(() => 1),
      underlineProgress: 1,
      circleProgress: 1,
      eraseProgress: 0,
      activeAction: "hold",
      recommendedGaze: "student",
    };
  }

  const writeAct = sequence.actions.find((a) => a.kind === "write");
  const underlineAct = sequence.actions.find((a) => a.kind === "underline");
  const circleAct = sequence.actions.find((a) => a.kind === "circle");
  const eraseAct = sequence.actions.find((a) => a.kind === "erase");
  const demoActs = sequence.actions.filter((a) => a.kind === "demonstrate");

  const writeProgress = writeAct ? actionProgress(writeAct, timeSec) : 1;
  const underlineProgress = underlineAct ? actionProgress(underlineAct, timeSec) : 0;
  const circleProgress = circleAct ? actionProgress(circleAct, timeSec) : 0;
  const eraseProgress = eraseAct ? actionProgress(eraseAct, timeSec) : 0;

  let activeSyllableIndex = -1;
  const syllableArcProgress = demoActs.map((act, idx) => {
    const p = actionProgress(act, timeSec);
    if (timeSec >= act.startSec && timeSec < act.endSec) {
      activeSyllableIndex = idx;
    }
    return p;
  });

  let activeAction: ChalkboardActionKind | "hold" = "hold";
  if (eraseAct && timeSec >= eraseAct.startSec && timeSec < eraseAct.endSec) {
    activeAction = "erase";
  } else if (circleAct && timeSec >= circleAct.startSec && timeSec < circleAct.endSec) {
    activeAction = "circle";
  } else if (underlineAct && timeSec >= underlineAct.startSec && timeSec < underlineAct.endSec) {
    activeAction = "underline";
  } else if (activeSyllableIndex >= 0) {
    activeAction = "demonstrate";
  } else if (writeAct && timeSec >= writeAct.startSec && timeSec < writeAct.endSec) {
    activeAction = "write";
  }

  // Gretel glances warmly toward the chalkboard while writing or demonstrating,
  // then returns her eyes directly to the child for the remainder of the phrase.
  const glanceAtBoard =
    (writeProgress > 0.02 && writeProgress < 0.98) ||
    (circleProgress > 0.05 && circleProgress < 0.88);
  const recommendedGaze: ChalkboardGazeTarget = glanceAtBoard ? "chalkboard-teaching" : "student";

  return {
    word: sequence.word,
    syllables: sequence.syllables,
    focusIndex: sequence.focusIndex,
    writeProgress,
    activeSyllableIndex,
    syllableArcProgress,
    underlineProgress,
    circleProgress,
    eraseProgress,
    activeAction,
    recommendedGaze,
  };
}
