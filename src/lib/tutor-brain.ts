/**
 * Tutor brain — the pure, deterministic state machine
 * (GRETEL-TUTOR-BUILD-SPEC §4 and §5, intent wiring §18.3).
 *
 * `reduce(state, ev, rng)` implements every row of the §5 table. It is pure:
 * no Math.random (rng injected), no clock, no storage, no network. Side
 * effects are returned as an ordered effect list for the runtime to play:
 *   playLine(lineId) | highlight(itemId) | markCorrect | markWrongErase |
 *   logProgress(evt) | stopMic | showUnavailable(problem)
 * plus cancelSpeech (EXIT) and flushLog (IDLE_TIMEOUT) from the same table.
 *
 * Consecutive playLine effects are a response "sequence": whole lines back
 * to back with a 400 ms pause (§18.5), never mid-sentence joins.
 *
 * The mic is the runtime's: it opens only on MIC_TAP in LISTEN, so a HEARD
 * event before a tap is ignored ("mic never opens before the tap").
 */
import { itemsForLesson, tutorItems, type TutorItem } from "./tutor-content";
import { classifyIntent, heardVowel, COMMAND_PHRASES, VOWELS, VOWEL_ALIASES } from "./tutor-intent";
import {
  confusionLineIdFor,
  createLinePickerState,
  modelLineIdForItem,
  pickLine,
  type LinePickerState,
  type TutorLineRole,
} from "./tutor-line-picker";
import { matchTarget, normalize } from "./tutor-match";
import type { EarsProblem } from "./tutor-ears";

export type Phase = "GREET" | "MODEL" | "LISTEN" | "MATCH" | "RESPOND" | "CELEBRATE" | "ENDED";

export type BrainEvent =
  | { type: "START" }
  | { type: "LINE_DONE" }
  | { type: "MIC_TAP" }
  | { type: "HEARD"; transcript: string; alternatives: string[] }
  | { type: "EARS_PROBLEM"; problem: EarsProblem }
  | { type: "IDLE_TIMEOUT" }
  | { type: "EXIT" };

export type ItemResult = "correct" | "correct_after_retry" | "missed";

/**
 * One progress event per finished item (spec §10). The runtime stamps
 * `created_at` when it writes; the brain is deterministic and clockless.
 */
export interface ProgressEvent {
  sessionId: string;
  lessonId: string;
  itemId: string;
  result: ItemResult;
  attempts: number;
}

export type Effect =
  | { type: "playLine"; lineId: string }
  | { type: "highlight"; itemId: string }
  | { type: "markCorrect" }
  | { type: "markWrongErase" }
  | { type: "logProgress"; evt: ProgressEvent }
  | { type: "stopMic" }
  | { type: "showUnavailable"; problem: EarsProblem }
  | { type: "cancelSpeech" }
  | { type: "flushLog" };

export type RespondKind = "correct" | "retry" | "missed";

export interface BrainState {
  phase: Phase;
  /** START has not arrived yet — every other event is ignored. */
  started: boolean;
  lesson: number;
  sessionId: string;
  /** Lesson items in locked order (the main queue). */
  items: readonly TutorItem[];
  itemIndex: number;
  /** Counted attempts on the current item (TARGET/CLOSE/OTHER_VOWEL/OTHER_WORD only). */
  attempts: number;
  /** Consecutive first-try corrects across items. */
  streak: number;
  /** Consecutive counted misses (across items) — pacing input (§18.4). */
  missesInARow: number;
  /** Mic open: set by MIC_TAP in LISTEN, cleared by HEARD / EARS_PROBLEM / end paths. */
  capturing: boolean;
  /** Returning child (from tutor-memory) → greeting-return line at START. */
  returning: boolean;
  /** What the current RESPOND phase is answering. */
  respondKind: RespondKind | null;
  /** Progress for the current item already logged (missed logs at the 3rd fail). */
  itemLogged: boolean;
  /** Silence nudges since the last tap (§18.3 SILENCE). */
  silenceNudges: number;
  /** Item ids missed in this session (input for the review round and memory). */
  missedItemIds: readonly string[];
  /** Review queue (§18.4): one more try before celebrate; empty = no review. */
  reviewItemIds: readonly string[];
  inReview: boolean;
  reviewIndex: number;
  endedReason: "idle" | "exit" | "complete" | null;
  /** Line picker state (no-repeat window + play counts) travels with the brain. */
  lines: LinePickerState;
}

/** 15 minutes without a tap ends the session (spec §5 IDLE_TIMEOUT row). */
export const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export interface CreateBrainStateOptions {
  lesson: number;
  sessionId: string;
  /** Defaults to the locked lesson items in order. */
  items?: readonly TutorItem[];
  /** From tutor-memory's beginSession — selects the greeting. */
  returning?: boolean;
  /** From tutor-memory's reviewRoundSet — one more try before celebrate. */
  reviewItemIds?: readonly string[];
  lines?: LinePickerState;
}

export function createBrainState(opts: CreateBrainStateOptions): BrainState {
  return {
    phase: "GREET",
    started: false,
    lesson: opts.lesson,
    sessionId: opts.sessionId,
    items: opts.items ?? itemsForLesson(opts.lesson),
    itemIndex: 0,
    attempts: 0,
    streak: 0,
    missesInARow: 0,
    capturing: false,
    returning: opts.returning ?? false,
    respondKind: null,
    itemLogged: false,
    silenceNudges: 0,
    missedItemIds: [],
    reviewItemIds: opts.reviewItemIds ?? [],
    inReview: false,
    reviewIndex: 0,
    endedReason: null,
    lines: opts.lines ?? createLinePickerState(),
  };
}

function noChange(state: BrainState): { state: BrainState; effects: Effect[] } {
  return { state, effects: [] };
}

/** The item the child is currently working on. */
export function currentTargetItem(state: BrainState): TutorItem {
  return state.items[state.itemIndex];
}

function progressEvent(
  state: BrainState,
  item: TutorItem,
  result: ItemResult,
  attempts: number,
): Effect {
  return {
    type: "logProgress",
    evt: {
      sessionId: state.sessionId,
      lessonId: String(state.lesson),
      itemId: item.id,
      result,
      attempts,
    },
  };
}

function playModel(item: TutorItem): Effect | null {
  const lineId = modelLineIdForItem(item);
  return lineId ? { type: "playLine", lineId } : null;
}

function pickedLine(
  state: BrainState,
  role: TutorLineRole,
  rng: () => number,
): { effect: Effect; state: BrainState } | null {
  const picked = pickLine(state.lines, { role, lesson: state.lesson }, rng);
  if (!picked) return null;
  return {
    effect: { type: "playLine", lineId: picked.lineId },
    state: { ...state, lines: picked.state },
  };
}

/** START → GREET: greeting rotates 1 of 3 (greeting-return for a returning child). */
function onStart(state: BrainState, rng: () => number): { state: BrainState; effects: Effect[] } {
  const role: TutorLineRole = state.returning ? "greeting-return" : "greeting-first";
  const picked = pickLine(state.lines, { role, lesson: state.lesson }, rng);
  const effects: Effect[] = [];
  let lines = state.lines;
  if (picked) {
    effects.push({ type: "playLine", lineId: picked.lineId });
    lines = picked.state;
  }
  return {
    state: { ...state, phase: "GREET", started: true, lines },
    effects,
  };
}

function reviewItem(state: BrainState, index: number): TutorItem | null {
  const id = state.reviewItemIds[index];
  return state.items.find((item) => item.id === id) ?? null;
}

/** The item the child is answering right now (main queue or review round). */
function activeItem(state: BrainState): TutorItem | null {
  return state.inReview ? reviewItem(state, state.reviewIndex) : currentTargetItem(state);
}

/** RESPOND LINE_DONE after correct/missed: log the final result, then advance. */
function onRespondDone(state: BrainState, rng: () => number): { state: BrainState; effects: Effect[] } {
  const item = state.inReview ? reviewItem(state, state.reviewIndex) : currentTargetItem(state);
  const effects: Effect[] = [];
  if (item && !state.itemLogged) {
    const result: ItemResult =
      state.respondKind === "correct"
        ? state.attempts <= 1
          ? "correct"
          : "correct_after_retry"
        : "missed";
    effects.push(progressEvent(state, item, result, state.attempts));
  }

  const reset: BrainState = {
    ...state,
    attempts: 0,
    itemLogged: false,
    respondKind: null,
  };
  return advance(reset, rng, effects);
}

/** Move to the next item, the review round, or celebrate. */
function advance(
  state: BrainState,
  rng: () => number,
  effects: Effect[],
): { state: BrainState; effects: Effect[] } {
  if (!state.inReview) {
    const nextMain = state.itemIndex + 1;
    if (nextMain < state.items.length) {
      const item = state.items[nextMain];
      effects.push({ type: "highlight", itemId: item.id });
      const model = playModel(item);
      if (model) effects.push(model);
      return { state: { ...state, phase: "MODEL", itemIndex: nextMain }, effects };
    }
    if (state.reviewItemIds.length > 0) {
      // Review round (§18.4): one more try for missed items before celebrate.
      const first = reviewItem(state, 0);
      if (!first) return celebrate(state, rng, effects);
      const intro = pickedLine(state, "review-intro", rng);
      const withIntro = intro ? intro.state : state;
      if (intro) effects.push(intro.effect);
      effects.push({ type: "highlight", itemId: first.id });
      const model = playModel(first);
      if (model) effects.push(model);
      return {
        state: { ...withIntro, phase: "MODEL", inReview: true, reviewIndex: 0 },
        effects,
      };
    }
    return celebrate(state, rng, effects);
  }

  const nextReview = state.reviewIndex + 1;
  const item = reviewItem(state, nextReview);
  if (!item) return celebrate(state, rng, effects);
  effects.push({ type: "highlight", itemId: item.id });
  const model = playModel(item);
  if (model) effects.push(model);
  return { state: { ...state, phase: "MODEL", reviewIndex: nextReview }, effects };
}

function celebrate(
  state: BrainState,
  rng: () => number,
  effects: Effect[],
): { state: BrainState; effects: Effect[] } {
  const picked = pickedLine(state, "closing", rng);
  const next = picked ? picked.state : state;
  if (picked) effects.push(picked.effect);
  return { state: { ...next, phase: "CELEBRATE" }, effects };
}

/** LINE_DONE dispatch by phase. */
function onLineDone(state: BrainState, rng: () => number): { state: BrainState; effects: Effect[] } {
  switch (state.phase) {
    case "GREET": {
      // GREET → MODEL: highlight the item, play its model line.
      const item = currentTargetItem(state);
      if (!item) return celebrate(state, rng, []);
      const effects: Effect[] = [{ type: "highlight", itemId: item.id }];
      const model = playModel(item);
      if (model) effects.push(model);
      return { state: { ...state, phase: "MODEL" }, effects };
    }
    case "MODEL":
      // MODEL → LISTEN: mic stays off; the child taps to open it.
      return { state: { ...state, phase: "LISTEN", capturing: false, silenceNudges: 0 }, effects: [] };
    case "RESPOND":
      if (state.respondKind === "retry") {
        // After a retry response (response line + slow-model hint) the child
        // listens again for the same item — the attempt counter stays.
        return { state: { ...state, phase: "LISTEN", capturing: false, respondKind: null }, effects: [] };
      }
      return onRespondDone(state, rng);
    case "CELEBRATE":
      // Closing line finished: the session is complete.
      return {
        state: { ...state, phase: "ENDED", endedReason: "complete", capturing: false },
        effects: [],
      };
    default:
      return noChange(state);
  }
}

/**
 * LISTEN + HEARD → MATCH, then the §5 "(auto)" rows resolve immediately in
 * the same reduce call: pass → RESPOND(correct); fail attempts<3 →
 * RESPOND(retry); fail attempts=3 → RESPOND(missed); off-script → LISTEN.
 */
function onHeard(
  state: BrainState,
  ev: Extract<BrainEvent, { type: "HEARD" }>,
  rng: () => number,
): { state: BrainState; effects: Effect[] } {
  const item = activeItem(state);
  if (!item) return noChange(state);

  const intent = classifyIntent(ev.transcript, item, state.items);
  const commandish = intent === "REPEAT" || intent === "DONT_KNOW" || intent === "HELP";
  // Fusion (§18.2): the item passes if the matcher passes on the transcript
  // OR any alternative — but an explicit command always wins.
  const fused = matchTarget(item, ev.transcript, ev.alternatives);
  const pass = !commandish && (intent === "TARGET" || fused.pass);

  // Transient §5 "MATCH" phase — resolved below within this same event.
  let match: BrainState = { ...state, phase: "MATCH", capturing: false };

  if (pass) {
    const attempts = state.attempts + 1; // the successful attempt counts too
    const firstTry = attempts === 1;
    const streak = firstTry ? state.streak + 1 : 0;
    const role: TutorLineRole =
      firstTry && streak >= 3 ? "praise-streak" : attempts > 1 ? "praise-after-retry" : "praise";
    const effects: Effect[] = [{ type: "markCorrect" }];
    const praise = pickedLine(match, role, rng);
    match = praise ? praise.state : match;
    if (praise) effects.push(praise.effect);
    return {
      state: {
        ...match,
        phase: "RESPOND",
        respondKind: "correct",
        attempts,
        streak,
        missesInARow: 0,
        silenceNudges: 0,
      },
      effects,
    };
  }

  switch (intent) {
    case "REPEAT":
    case "DONT_KNOW":
    case "HELP": {
      // Not an attempt: acknowledge, then re-play the model.
      const role: TutorLineRole =
        intent === "REPEAT" ? "repeat-ack" : intent === "DONT_KNOW" ? "dont-know" : "help";
      const effects: Effect[] = [];
      const ack = pickedLine(match, role, rng);
      match = ack ? ack.state : match;
      if (ack) effects.push(ack.effect);
      const model = playModel(item);
      if (model) effects.push(model);
      return { state: { ...match, phase: "LISTEN" }, effects };
    }
    case "SILENCE": {
      // Silence nudge. The mic keeps listening; after 2 nudges it auto-offs
      // and the button waits for a fresh tap.
      const nudges = state.silenceNudges + 1;
      const effects: Effect[] = [];
      const nudge = pickedLine(match, "silence-nudge", rng);
      match = nudge ? nudge.state : match;
      if (nudge) effects.push(nudge.effect);
      const stillListening = nudges < 2;
      if (!stillListening) effects.push({ type: "stopMic" });
      return {
        state: {
          ...match,
          phase: "LISTEN",
          capturing: stillListening,
          silenceNudges: nudges,
        },
        effects,
      };
    }
    case "NOISE": {
      // "No te escuché bien" — not an attempt.
      const effects: Effect[] = [];
      const noise = pickedLine(match, "noise", rng);
      match = noise ? noise.state : match;
      if (noise) effects.push(noise.effect);
      return { state: { ...match, phase: "LISTEN" }, effects };
    }
    case "OFF_SCRIPT": {
      // No target-like token at all: redirect, NOT counted as an attempt.
      const effects: Effect[] = [];
      const redirect = pickedLine(match, "redirect", rng);
      match = redirect ? redirect.state : match;
      if (redirect) effects.push(redirect.effect);
      return { state: { ...match, phase: "LISTEN" }, effects };
    }
    default: {
      // CLOSE / OTHER_VOWEL / OTHER_WORD (or a fallback fail): counted.
      const attempts = state.attempts + 1;
      if (attempts >= 3) {
        // fail attempts=3 → RESPOND(missed): model once more, log missed, advance.
        const effects: Effect[] = [];
        const model = playModel(item);
        if (model) effects.push(model);
        effects.push(progressEvent(state, item, "missed", 3));
        return {
          state: {
            ...match,
            phase: "RESPOND",
            respondKind: "missed",
            attempts: 3,
            itemLogged: true,
            streak: 0,
            missesInARow: state.missesInARow + 1,
            missedItemIds: [...state.missedItemIds, item.id],
          },
          effects,
        };
      }
      // fail attempts<3 → RESPOND(retry): erase the wrong mark, intent-aware
      // response line, then the slow-model replay hint (400 ms pause).
      const effects: Effect[] = [{ type: "markWrongErase" }];
      if (intent === "OTHER_VOWEL") {
        // "Esa es la …" for the vowel actually heard, then the target model.
        const heard = heardVowel(ev.transcript);
        const lineId = heard ? confusionLineIdFor(heard) : null;
        if (lineId) effects.push({ type: "playLine", lineId });
      } else {
        const role: TutorLineRole =
          intent === "CLOSE" ? "close-miss" : intent === "OTHER_WORD" ? "wrong-word" : "try-again";
        const response = pickedLine(match, role, rng);
        match = response ? response.state : match;
        if (response) effects.push(response.effect);
      }
      const model = playModel(item);
      if (model) effects.push(model);
      return {
        state: {
          ...match,
          phase: "RESPOND",
          respondKind: "retry",
          attempts,
          streak: 0,
          missesInARow: state.missesInARow + 1,
        },
        effects,
      };
    }
  }
}

/**
 * Pure transition function: every §5 table row. `rng` is injected — never
 * Math.random. Events that arrive out of turn (before START, after ENDED,
 * HEARD before MIC_TAP, taps outside LISTEN) are ignored with no effects.
 */
export function reduce(
  state: BrainState,
  ev: BrainEvent,
  rng: () => number,
): { state: BrainState; effects: Effect[] } {
  if (state.phase === "ENDED") return noChange(state);
  if (!state.started && ev.type !== "START") return noChange(state);

  switch (ev.type) {
    case "START":
      if (state.started) return noChange(state);
      return onStart(state, rng);
    case "EXIT":
      // any | EXIT → ENDED: cancelGretelSpeech + stopMic.
      return {
        state: { ...state, phase: "ENDED", endedReason: "exit", capturing: false },
        effects: [{ type: "cancelSpeech" }, { type: "stopMic" }],
      };
    case "IDLE_TIMEOUT":
      // any | IDLE_TIMEOUT (15 min no tap) → ENDED: stopMic + flush log.
      return {
        state: { ...state, phase: "ENDED", endedReason: "idle", capturing: false },
        effects: [{ type: "stopMic" }, { type: "flushLog" }],
      };
    case "EARS_PROBLEM":
      // any | EARS_PROBLEM → same phase: stopMic + showUnavailable (no voice).
      return {
        state: { ...state, capturing: false },
        effects: [{ type: "stopMic" }, { type: "showUnavailable", problem: ev.problem }],
      };
    case "LINE_DONE":
      return onLineDone(state, rng);
    case "MIC_TAP":
      // The mic opens only on a tap in LISTEN; taps anywhere else do nothing.
      if (state.phase !== "LISTEN" || state.capturing) return noChange(state);
      return { state: { ...state, capturing: true, silenceNudges: 0 }, effects: [] };
    case "HEARD":
      // Heard speech without a tap is ignored (mic-before-tap rule).
      if (state.phase !== "LISTEN" || !state.capturing) return noChange(state);
      return onHeard(state, ev, rng);
  }
}

/**
 * Grammar for ears.listen() (spec §18.2 / §18.6): lesson items ∪ same-page
 * distractors ∪ the 5 vowels and their aliases ∪ command words ∪ "[unk]".
 * Both the printed form (accents kept) and the normalized decode form are
 * included, deduped, in a deterministic order.
 */
export function buildListenGrammar(lesson: number): string[] {
  const lessonItems = itemsForLesson(lesson);
  const words = new Set<string>();

  for (const item of lessonItems) {
    words.add(item.text);
    words.add(normalize(item.text));
  }
  // Same-page distractors: any derived tutor item sharing a printed page
  // with this lesson (covers cross-lesson pages too).
  const pages = new Set(lessonItems.map((item) => item.printedPage));
  for (const item of tutorItems) {
    if (!pages.has(item.printedPage)) continue;
    words.add(item.text);
    words.add(normalize(item.text));
  }
  // The 5 vowels and their aliases.
  for (const vowel of VOWELS) {
    words.add(vowel);
    for (const alias of VOWEL_ALIASES[vowel]) words.add(alias);
  }
  // Command words + aliases.
  for (const phrase of COMMAND_PHRASES) words.add(phrase);

  // Always present: off-grammar speech degrades to [unk] (tutor-ears-vosk).
  words.add("[unk]");

  return [...words].sort();
}