/**
 * Tutor brain — the pure, deterministic state machine
 * (GRETEL-TUTOR-BUILD-SPEC §4 and §5, intent wiring §18.3, Milestone 9).
 *
 * `reduce(state, ev, rng)` implements every row of the §5 table and extends
 * cleanly across all 24 lessons using `tutor-content.ts` + `tutor-dialogue-manifest.ts`.
 * It is pure: no Math.random (rng injected), no clock, no storage, no network.
 *
 * Milestone 9 additions:
 * - Unreliable transcripts (`reliable === false` or `confidence < threshold`)
 *   are NEVER graded as counted attempts.
 * - `INTERRUPT` event provides always-available stop/interrupt.
 * - `recommendedEarsMode(state)` selects `"constrained"` vs `"broad"`.
 * - `buildCoachingResponse()` produces compatible whole-utterance chains
 *   (`acknowledge -> explain -> example -> one question`) with honest
 *   `approved-audio` vs `text-only-fallback` delivery metadata.
 * - `buildListenGrammar(lesson)` works across all 24 lessons (vowels,
 *   syllables, words, sight-words, and sentence words).
 */
import { itemsForLesson, lessonGraphFor, tutorItems, type TutorItem } from "./tutor-content";
import {
  classifyBroadCommand,
  classifyIntent,
  heardVowel,
  COMMAND_PHRASES,
  VOWELS,
  VOWEL_ALIASES,
} from "./tutor-intent";
import {
  TEXT_ONLY_FALLBACK_LABEL,
  buildProgressiveHint,
  confusionLineIdFor,
  createLinePickerState,
  modelDeliveryForItem,
  modelLineIdForItem,
  pickContextualChain,
  pickLessonStageLine,
  pickLine,
  type LinePickerState,
  type TutorLineRole,
  type UtteranceChainResult,
  type UtteranceChainStep,
} from "./tutor-line-picker";
import { matchTarget, normalize } from "./tutor-match";
import {
  DEFAULT_CONFIDENCE_THRESHOLD,
  type EarsProblem,
  type EarsRecognitionMode,
} from "./tutor-ears";

export type Phase = "GREET" | "MODEL" | "LISTEN" | "MATCH" | "RESPOND" | "CELEBRATE" | "ENDED";

export type PedagogicalStage =
  | "WELCOME"
  | "OBJECTIVE"
  | "FLIPCHART"
  | "MODEL"
  | "QUESTION"
  | "ASSESS"
  | "HINT_ESCALATION"
  | "WORKBOOK_PRACTICE"
  | "GAME_PRACTICE"
  | "REVIEW"
  | "CELEBRATE"
  | "ENDED";

export interface BrainHint {
  readonly level: 1 | 2 | 3;
  readonly itemId: string;
  readonly hintText: string;
  readonly visualCue: string;
  readonly explanationText: string;
}

export type BrainEvent =
  | { type: "START" }
  | { type: "LINE_DONE" }
  | { type: "MIC_TAP" }
  | { type: "MIC_CANCEL" }
  | { type: "INTERRUPT" }
  | { type: "OPEN_WORKBOOK"; printedPage?: number }
  | { type: "COMPLETE_WORKBOOK" }
  | { type: "LAUNCH_GAME"; gameId?: string }
  | { type: "COMPLETE_GAME" }
  | {
      type: "HEARD";
      transcript: string;
      alternatives: string[];
      confidence?: number;
      reliable?: boolean;
      mode?: EarsRecognitionMode;
    }
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
  | { type: "showTextFallback"; lineId: string | null; text: string; label: string }
  | { type: "presentChain"; steps: readonly UtteranceChainStep[] }
  | { type: "highlight"; itemId: string }
  | { type: "openFlipchart"; sheetNumber: number; layout: "split" | "flipchart-pip" }
  | { type: "setLayout"; layout: "call" | "split" | "flipchart-pip" | "practice" }
  | { type: "openWorkbook"; printedPage: number }
  | { type: "launchGame"; gameId: string }
  | {
      type: "showHint";
      level: 1 | 2 | 3;
      itemId: string;
      hintText: string;
      visualCue: string;
      explanationText: string;
    }
  | {
      type: "recordSessionEvent";
      kind:
        | "objective"
        | "flipchart"
        | "question"
        | "hint"
        | "correction"
        | "workbook"
        | "game"
        | "review"
        | "complete";
      summary: string;
      itemId?: string;
      itemText?: string;
      printedPage?: number;
      sheetNumber?: number;
      gameId?: string;
      hintLevel?: 1 | 2 | 3;
    }
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
  /** Line picker state (no-repeat window + cooldowns + play counts) travels with the brain. */
  lines: LinePickerState;
  /** Full autonomous pedagogical sequence enabled (objective -> flipchart -> items -> practice -> review -> celebrate). */
  pedagogicalFlow: boolean;
  /** Whether Workbook + Reinforcement Game stages run autonomously before review/celebrate. */
  includePracticeStages: boolean;
  stage: PedagogicalStage;
  hintLevel: 0 | 1 | 2 | 3;
  activeHint: BrainHint | null;
  priorCompletedCount: number;
  activeFlipchartSheet: number | null;
  activeWorkbookPage: number | null;
  activeGameId: string | null;
  workbookCompleted: boolean;
  gameCompleted: boolean;
}

/** 15 minutes without a tap ends the session (spec §5 IDLE_TIMEOUT row). */
export const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export interface CreateBrainStateOptions {
  lesson: number;
  sessionId: string;
  /** Defaults to the locked lesson items in order (Lessons 1–24). */
  items?: readonly TutorItem[];
  /** From tutor-memory's beginSession — selects the greeting. */
  returning?: boolean;
  /** From tutor-memory's reviewRoundSet — one more try before celebrate. */
  reviewItemIds?: readonly string[];
  lines?: LinePickerState;
  pedagogicalFlow?: boolean;
  includePracticeStages?: boolean;
  priorCompletedCount?: number;
}

export function createBrainState(opts: CreateBrainStateOptions): BrainState {
  const graph = lessonGraphFor(opts.lesson);
  const pedagogicalFlow = opts.pedagogicalFlow ?? false;
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
    pedagogicalFlow,
    includePracticeStages: opts.includePracticeStages ?? false,
    stage: "WELCOME",
    hintLevel: 0,
    activeHint: null,
    priorCompletedCount: opts.priorCompletedCount ?? 0,
    activeFlipchartSheet: graph?.flipchartPages[0] ?? null,
    activeWorkbookPage: graph?.printedWorkbookPages.start ?? null,
    activeGameId: graph?.games[0]?.id ?? null,
    workbookCompleted: false,
    gameCompleted: false,
  };
}

function noChange(state: BrainState): { state: BrainState; effects: Effect[] } {
  return { state, effects: [] };
}

/** The item the child is currently working on. */
export function currentTargetItem(state: BrainState): TutorItem {
  return state.items[state.itemIndex];
}

/**
 * Recommends the Vosk recognition mode for the current brain phase:
 * - `"constrained"` during structured exercise answers (`LISTEN` with an active target)
 * - `"broad"` for open questions, commands, or navigation outside structured prompts.
 */
export function recommendedEarsMode(state: BrainState): EarsRecognitionMode {
  if (state.phase === "LISTEN" && activeItem(state) !== null) {
    return "constrained";
  }
  return "broad";
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
  if (lineId) return { type: "playLine", lineId };
  // Lessons 4–24 items without a manifest model line fall back honestly to labeled text-only.
  const delivery = modelDeliveryForItem(item);
  if (delivery.deliveryMode === "text-only-fallback") {
    return {
      type: "showTextFallback",
      lineId: null,
      text: delivery.text,
      label: delivery.fallbackLabel ?? TEXT_ONLY_FALLBACK_LABEL,
    };
  }
  return null;
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

/**
 * Builds a compatible whole-utterance coaching chain
 * (`acknowledge -> explain -> example -> one question`) for any lesson 1–24,
 * with honest `approved-audio` vs `text-only-fallback` labeling on every step.
 */
export function buildCoachingResponse(
  state: BrainState,
  reason: "help" | "dont-know" | "retry" | "explain",
  rng: () => number,
): { state: BrainState; chain: UtteranceChainResult; effects: Effect[] } {
  const acknowledgeRole: TutorLineRole =
    reason === "help"
      ? "help"
      : reason === "dont-know"
        ? "dont-know"
        : reason === "retry"
          ? "try-again"
          : "repeat-ack";
  const chain = pickContextualChain(
    state.lines,
    {
      lesson: state.lesson,
      acknowledgeRole,
      item: activeItem(state) ?? undefined,
    },
    rng,
  );
  return {
    state: { ...state, lines: chain.state },
    chain,
    effects: [{ type: "presentChain", steps: chain.steps }],
  };
}

function deliveryEffect(delivery: {
  lineId: string | null;
  text: string;
  deliveryMode: "approved-audio" | "text-only-fallback";
  fallbackLabel: string | null;
}): Effect {
  if (delivery.lineId) {
    return { type: "playLine", lineId: delivery.lineId };
  }
  return {
    type: "showTextFallback",
    lineId: null,
    text: delivery.text,
    label: delivery.fallbackLabel ?? TEXT_ONLY_FALLBACK_LABEL,
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
    state: {
      ...state,
      phase: "GREET",
      stage: "WELCOME",
      started: true,
      hintLevel: 0,
      activeHint: null,
      lines,
    },
    effects,
  };
}

function reviewItem(state: BrainState, index: number): TutorItem | null {
  const id = state.reviewItemIds[index];
  return state.items.find((item) => item.id === id) ?? null;
}

/** The item the child is answering right now (main queue or review round). */
function activeItem(state: BrainState): TutorItem | null {
  return state.inReview ? reviewItem(state, state.reviewIndex) : (currentTargetItem(state) ?? null);
}

/** Enter Mode D Workbook practice for the current lesson. */
function enterWorkbookPractice(
  state: BrainState,
  rng: () => number,
  effects: Effect[],
): { state: BrainState; effects: Effect[] } {
  const graph = lessonGraphFor(state.lesson);
  const printedPage =
    graph?.printedWorkbookPages.pages.find((p) => p !== 86 && p !== 87) ??
    graph?.printedWorkbookPages.start ??
    1;
  const stagePick = pickLessonStageLine(
    state.lines,
    {
      role: "page-instruction",
      lesson: state.lesson,
      fallbackText: `Abre tu cuaderno en la página ${printedPage} para practicar la Lección ${state.lesson}.`,
    },
    rng,
  );
  effects.push({ type: "openWorkbook", printedPage });
  effects.push({ type: "setLayout", layout: "practice" });
  effects.push(deliveryEffect(stagePick.delivery));
  effects.push({
    type: "recordSessionEvent",
    kind: "workbook",
    summary: `Práctica guiada en cuaderno (página impresa ${printedPage})`,
    printedPage,
  });
  return {
    state: {
      ...state,
      lines: stagePick.state,
      phase: "MODEL",
      stage: "WORKBOOK_PRACTICE",
      activeWorkbookPage: printedPage,
      capturing: false,
      hintLevel: 0,
      activeHint: null,
    },
    effects,
  };
}

/** Enter Mode D Reinforcement Game for the current lesson. */
function enterGamePractice(
  state: BrainState,
  rng: () => number,
  effects: Effect[],
  requestedGameId?: string,
): { state: BrainState; effects: Effect[] } {
  const graph = lessonGraphFor(state.lesson);
  const gameId = requestedGameId ?? graph?.games[0]?.id ?? "vocal-a";
  const stagePick = pickLessonStageLine(
    state.lines,
    {
      role: "game-intro",
      lesson: state.lesson,
      fallbackText: `¡Hora de reforzar con un juego interactivo de la Lección ${state.lesson}!`,
    },
    rng,
  );
  effects.push({ type: "launchGame", gameId });
  effects.push({ type: "setLayout", layout: "practice" });
  effects.push(deliveryEffect(stagePick.delivery));
  effects.push({
    type: "recordSessionEvent",
    kind: "game",
    summary: `Juego de refuerzo iniciado (${gameId})`,
    gameId,
  });
  return {
    state: {
      ...state,
      lines: stagePick.state,
      phase: "MODEL",
      stage: "GAME_PRACTICE",
      activeGameId: gameId,
      capturing: false,
      hintLevel: 0,
      activeHint: null,
    },
    effects,
  };
}

function enterReviewOrCelebrate(
  state: BrainState,
  rng: () => number,
  effects: Effect[],
): { state: BrainState; effects: Effect[] } {
  if (state.reviewItemIds.length > 0 && !state.inReview) {
    const first = reviewItem(state, 0);
    if (!first) return celebrate(state, rng, effects);
    const intro = pickedLine(state, "review-intro", rng);
    const withIntro = intro ? intro.state : state;
    if (intro) effects.push(intro.effect);
    effects.push({ type: "highlight", itemId: first.id });
    const model = playModel(first);
    if (model) effects.push(model);
    if (state.pedagogicalFlow) {
      effects.push({
        type: "recordSessionEvent",
        kind: "review",
        summary: `Ronda de repaso con ${state.reviewItemIds.length} elemento(s)`,
        itemId: first.id,
        itemText: first.text,
      });
    }
    return {
      state: {
        ...withIntro,
        phase: "MODEL",
        stage: "REVIEW",
        inReview: true,
        reviewIndex: 0,
        hintLevel: 0,
        activeHint: null,
      },
      effects,
    };
  }
  return celebrate(state, rng, effects);
}

/** RESPOND LINE_DONE after correct/missed: log the final result, then advance. */
function onRespondDone(
  state: BrainState,
  rng: () => number,
): { state: BrainState; effects: Effect[] } {
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
    hintLevel: 0,
    activeHint: null,
  };
  return advance(reset, rng, effects);
}

/** Move to the next item, workbook/game practice, the review round, or celebrate. */
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
      return {
        state: { ...state, phase: "MODEL", stage: "MODEL", itemIndex: nextMain },
        effects,
      };
    }
    if (state.pedagogicalFlow && state.includePracticeStages && !state.workbookCompleted) {
      return enterWorkbookPractice(state, rng, effects);
    }
    if (state.pedagogicalFlow && state.includePracticeStages && !state.gameCompleted) {
      return enterGamePractice(state, rng, effects);
    }
    return enterReviewOrCelebrate(state, rng, effects);
  }

  const nextReview = state.reviewIndex + 1;
  const item = reviewItem(state, nextReview);
  if (!item) return celebrate(state, rng, effects);
  effects.push({ type: "highlight", itemId: item.id });
  const model = playModel(item);
  if (model) effects.push(model);
  return {
    state: { ...state, phase: "MODEL", stage: "REVIEW", reviewIndex: nextReview },
    effects,
  };
}

function celebrate(
  state: BrainState,
  rng: () => number,
  effects: Effect[],
): { state: BrainState; effects: Effect[] } {
  if (state.pedagogicalFlow) {
    const stagePick = pickLessonStageLine(
      state.lines,
      {
        role: "closing",
        lesson: state.lesson,
        fallbackText: `¡Muy bien! Completaste la Lección ${state.lesson}.`,
      },
      rng,
    );
    effects.push(deliveryEffect(stagePick.delivery));
    effects.push({
      type: "recordSessionEvent",
      kind: "complete",
      summary: `Cierre y guardado de progreso de la Lección ${state.lesson}`,
    });
    return {
      state: {
        ...state,
        lines: stagePick.state,
        phase: "CELEBRATE",
        stage: "CELEBRATE",
        hintLevel: 0,
        activeHint: null,
      },
      effects,
    };
  }
  const picked = pickedLine(state, "closing", rng);
  const next = picked ? picked.state : state;
  if (picked) effects.push(picked.effect);
  return { state: { ...next, phase: "CELEBRATE", stage: "CELEBRATE" }, effects };
}

function startFirstItemModel(
  state: BrainState,
  rng: () => number,
  effects: Effect[] = [],
): { state: BrainState; effects: Effect[] } {
  const item = currentTargetItem(state);
  if (!item) {
    if (state.pedagogicalFlow && state.includePracticeStages && !state.workbookCompleted) {
      return enterWorkbookPractice(state, rng, effects);
    }
    return celebrate(state, rng, effects);
  }
  effects.push({ type: "highlight", itemId: item.id });
  const model = playModel(item);
  if (model) effects.push(model);
  return {
    state: { ...state, phase: "MODEL", stage: "MODEL", hintLevel: 0, activeHint: null },
    effects,
  };
}

/** LINE_DONE dispatch by phase and pedagogical stage. */
function onLineDone(
  state: BrainState,
  rng: () => number,
): { state: BrainState; effects: Effect[] } {
  switch (state.phase) {
    case "GREET": {
      if (state.pedagogicalFlow && state.stage === "WELCOME") {
        // WELCOME → OBJECTIVE
        const graph = lessonGraphFor(state.lesson);
        const stagePick = pickLessonStageLine(
          state.lines,
          {
            role: "lesson-objective",
            lesson: state.lesson,
            fallbackText: graph
              ? `Objetivo de hoy: ${graph.title} (${graph.focus}).`
              : `Objetivo de la Lección ${state.lesson}.`,
          },
          rng,
        );
        const effects: Effect[] = [
          deliveryEffect(stagePick.delivery),
          {
            type: "recordSessionEvent",
            kind: "objective",
            summary: stagePick.delivery.text,
          },
        ];
        return {
          state: { ...state, lines: stagePick.state, phase: "GREET", stage: "OBJECTIVE" },
          effects,
        };
      }
      if (state.pedagogicalFlow && state.stage === "OBJECTIVE") {
        // OBJECTIVE → FLIPCHART (present Flip Chart sheet & highlight illustration in Split)
        const graph = lessonGraphFor(state.lesson);
        const firstSheet = graph?.flipchartPages[0] ?? null;
        if (firstSheet !== null) {
          const stagePick = pickLessonStageLine(
            state.lines,
            {
              role: "flipchart-intro",
              lesson: state.lesson,
              fallbackText: `Observemos juntos la lámina ${firstSheet} del rotafolio.`,
            },
            rng,
          );
          const effects: Effect[] = [
            { type: "openFlipchart", sheetNumber: firstSheet, layout: "split" },
            deliveryEffect(stagePick.delivery),
            {
              type: "recordSessionEvent",
              kind: "flipchart",
              summary: stagePick.delivery.text,
              sheetNumber: firstSheet,
            },
          ];
          return {
            state: {
              ...state,
              lines: stagePick.state,
              phase: "MODEL",
              stage: "FLIPCHART",
              activeFlipchartSheet: firstSheet,
            },
            effects,
          };
        }
      }
      // GREET → MODEL: highlight the item, play its model line.
      return startFirstItemModel(state, rng);
    }
    case "MODEL": {
      if (state.pedagogicalFlow && state.stage === "FLIPCHART") {
        // FLIPCHART → MODEL item 0 (return to Call mode so word card & pencil mark show cleanly)
        return startFirstItemModel(state, rng, [{ type: "setLayout", layout: "call" }]);
      }
      if (
        state.pedagogicalFlow &&
        (state.stage === "WORKBOOK_PRACTICE" || state.stage === "GAME_PRACTICE")
      ) {
        // Practice intro line finished → wait in LISTEN for practice completion or voice command.
        return {
          state: { ...state, phase: "LISTEN", capturing: false, silenceNudges: 0 },
          effects: [],
        };
      }
      // MODEL → LISTEN: mic stays off; the child taps to open it.
      const item = activeItem(state);
      const effects: Effect[] = [];
      if (state.pedagogicalFlow && item) {
        effects.push({
          type: "recordSessionEvent",
          kind: "question",
          summary: `Pregunta para el estudiante: ¿puedes decir "${item.text}"?`,
          itemId: item.id,
          itemText: item.text,
        });
      }
      return {
        state: {
          ...state,
          phase: "LISTEN",
          stage: state.inReview ? "REVIEW" : "QUESTION",
          capturing: false,
          silenceNudges: 0,
        },
        effects,
      };
    }
    case "RESPOND":
      if (state.respondKind === "retry") {
        // After a retry response (response line + slow-model hint) the child
        // listens again for the same item — the attempt counter stays.
        return {
          state: {
            ...state,
            phase: "LISTEN",
            stage: state.hintLevel > 0 ? "HINT_ESCALATION" : "QUESTION",
            capturing: false,
            respondKind: null,
          },
          effects: [],
        };
      }
      return onRespondDone(state, rng);
    case "CELEBRATE":
      // Closing line finished: the session is complete.
      return {
        state: {
          ...state,
          phase: "ENDED",
          stage: "ENDED",
          endedReason: "complete",
          capturing: false,
        },
        effects: [],
      };
    default:
      return noChange(state);
  }
}

function isUnreliableHeard(ev: Extract<BrainEvent, { type: "HEARD" }>): boolean {
  if (ev.reliable === false) return true;
  if (typeof ev.confidence === "number" && ev.confidence < DEFAULT_CONFIDENCE_THRESHOLD) {
    return true;
  }
  return false;
}

function completeCurrentPractice(
  state: BrainState,
  rng: () => number,
): { state: BrainState; effects: Effect[] } {
  if (state.stage === "WORKBOOK_PRACTICE") {
    const effects: Effect[] = [
      {
        type: "recordSessionEvent",
        kind: "workbook",
        summary: `Práctica de cuaderno completada (pág. ${state.activeWorkbookPage ?? ""})`,
        printedPage: state.activeWorkbookPage ?? undefined,
      },
    ];
    const nextBase: BrainState = { ...state, workbookCompleted: true, capturing: false };
    if (nextBase.includePracticeStages && !nextBase.gameCompleted) {
      return enterGamePractice(nextBase, rng, effects);
    }
    effects.push({ type: "setLayout", layout: "call" });
    return enterReviewOrCelebrate(nextBase, rng, effects);
  }
  if (state.stage === "GAME_PRACTICE") {
    const effects: Effect[] = [
      {
        type: "recordSessionEvent",
        kind: "game",
        summary: `Juego de refuerzo completado (${state.activeGameId ?? ""})`,
        gameId: state.activeGameId ?? undefined,
      },
      { type: "setLayout", layout: "call" },
    ];
    const nextBase: BrainState = { ...state, gameCompleted: true, capturing: false };
    return enterReviewOrCelebrate(nextBase, rng, effects);
  }
  return noChange(state);
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
  if (
    state.pedagogicalFlow &&
    (state.stage === "WORKBOOK_PRACTICE" || state.stage === "GAME_PRACTICE")
  ) {
    const norm = normalize(ev.transcript);
    const broad = classifyBroadCommand(ev.transcript);
    if (
      broad === "NEXT" ||
      norm === "listo" ||
      norm === "termine" ||
      norm === "ya termine" ||
      norm === "continuar"
    ) {
      return completeCurrentPractice(state, rng);
    }
  }

  const item = activeItem(state);
  if (!item) return noChange(state);

  // Milestone 9 safety rule: NEVER grade unreliable / low-confidence transcripts.
  if (isUnreliableHeard(ev)) {
    let match: BrainState = { ...state, phase: "MATCH", capturing: false };
    const effects: Effect[] = [];
    const noise = pickedLine(match, "noise", rng);
    match = noise ? noise.state : match;
    if (noise) effects.push(noise.effect);
    return { state: { ...match, phase: "LISTEN" }, effects };
  }

  // In "broad" mode, honor broad commands (STOP / SLOWER / QUESTION) without grading.
  if (ev.mode === "broad") {
    const broad = classifyBroadCommand(ev.transcript);
    if (broad === "STOP") {
      return {
        state: { ...state, phase: "LISTEN", capturing: false },
        effects: [{ type: "cancelSpeech" }, { type: "stopMic" }],
      };
    }
    if (broad === "SLOWER") {
      let match: BrainState = { ...state, phase: "MATCH", capturing: false };
      const effects: Effect[] = [];
      const ack = pickedLine(match, "repeat-ack", rng);
      match = ack ? ack.state : match;
      if (ack) effects.push(ack.effect);
      const model = playModel(item);
      if (model) effects.push(model);
      return { state: { ...match, phase: "LISTEN" }, effects };
    }
    if (broad === "QUESTION") {
      const match: BrainState = { ...state, phase: "MATCH", capturing: false };
      const { state: nextState, effects } = buildCoachingResponse(match, "help", rng);
      return { state: { ...nextState, phase: "LISTEN" }, effects };
    }
  }

  const intent = classifyIntent(ev.transcript, item, state.items);
  const commandish = intent === "REPEAT" || intent === "DONT_KNOW" || intent === "HELP";
  // Fusion (§18.2): the item passes if the matcher passes on the transcript
  // OR any alternative — but an explicit command always wins.
  const fused = matchTarget(item, ev.transcript, ev.alternatives);
  const pass = !commandish && intent !== "OFF_SCRIPT" && (intent === "TARGET" || fused.pass);

  // Transient §5 "MATCH" phase — resolved below within this same event.
  const matchBase: BrainState = { ...state, phase: "MATCH", capturing: false };
  let match = matchBase;

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
    if (state.pedagogicalFlow && attempts > 1) {
      effects.push({
        type: "recordSessionEvent",
        kind: "correction",
        summary: `Corrección lograda en "${item.text}" tras ${attempts} intentos`,
        itemId: item.id,
        itemText: item.text,
        hintLevel: state.hintLevel === 0 ? undefined : state.hintLevel,
      });
    }
    return {
      state: {
        ...match,
        phase: "RESPOND",
        stage: "ASSESS",
        respondKind: "correct",
        attempts,
        streak,
        missesInARow: 0,
        silenceNudges: 0,
        hintLevel: 0,
        activeHint: null,
      },
      effects,
    };
  }

  switch (intent) {
    case "REPEAT":
    case "DONT_KNOW":
    case "HELP": {
      // Not an attempt: acknowledge, escalate hint on HELP/DONT_KNOW, then re-play the model.
      const role: TutorLineRole =
        intent === "REPEAT" ? "repeat-ack" : intent === "DONT_KNOW" ? "dont-know" : "help";
      const effects: Effect[] = [];
      const ack = pickedLine(match, role, rng);
      match = ack ? ack.state : match;
      if (ack) effects.push(ack.effect);
      let nextHintLevel = state.hintLevel;
      let nextHint = state.activeHint;
      if (intent === "HELP" || intent === "DONT_KNOW") {
        const level = Math.min(3, Math.max(1, state.hintLevel + 1)) as 1 | 2 | 3;
        const built = buildProgressiveHint(item, level, match.lines, rng);
        match = { ...match, lines: built.state };
        nextHintLevel = level;
        nextHint = {
          level: built.hint.level,
          itemId: built.hint.itemId,
          hintText: built.hint.hintText,
          visualCue: built.hint.visualCue,
          explanationText: built.hint.explanationText,
        };
        if (state.pedagogicalFlow) {
          effects.push({
            type: "showHint",
            ...nextHint,
          });
          effects.push({
            type: "recordSessionEvent",
            kind: "hint",
            summary: `Pista nivel ${level}: ${nextHint.hintText}`,
            itemId: item.id,
            itemText: item.text,
            hintLevel: level,
          });
        }
      }
      const model = playModel(item);
      if (model) effects.push(model);
      return {
        state: {
          ...match,
          phase: "LISTEN",
          stage: nextHintLevel > 0 ? "HINT_ESCALATION" : state.stage,
          hintLevel: nextHintLevel,
          activeHint: nextHint,
        },
        effects,
      };
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
      const level = Math.min(3, Math.max(1, attempts)) as 1 | 2 | 3;
      const builtHint = buildProgressiveHint(item, level, match.lines, rng);
      const nextHint: BrainHint = {
        level: builtHint.hint.level,
        itemId: builtHint.hint.itemId,
        hintText: builtHint.hint.hintText,
        visualCue: builtHint.hint.visualCue,
        explanationText: builtHint.hint.explanationText,
      };
      if (state.pedagogicalFlow) {
        match = { ...match, lines: builtHint.state };
      }

      if (attempts >= 3) {
        // fail attempts=3 → RESPOND(missed): model once more, log missed, advance.
        const effects: Effect[] = [];
        if (state.pedagogicalFlow) {
          effects.push({ type: "showHint", ...nextHint });
          effects.push({
            type: "recordSessionEvent",
            kind: "hint",
            summary: `Pista nivel 3 (modelado directo): ${nextHint.hintText}`,
            itemId: item.id,
            itemText: item.text,
            hintLevel: 3,
          });
        }
        const model = playModel(item);
        if (model) effects.push(model);
        effects.push(progressEvent(state, item, "missed", 3));
        return {
          state: {
            ...match,
            phase: "RESPOND",
            stage: "HINT_ESCALATION",
            respondKind: "missed",
            attempts: 3,
            itemLogged: true,
            streak: 0,
            missesInARow: state.missesInARow + 1,
            missedItemIds: [...state.missedItemIds, item.id],
            hintLevel: 3,
            activeHint: nextHint,
          },
          effects,
        };
      }
      // fail attempts<3 → RESPOND(retry): erase the wrong mark, intent-aware
      // response line, escalating 3-level hint, then the slow-model replay hint.
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
      if (state.pedagogicalFlow) {
        effects.push({ type: "showHint", ...nextHint });
        effects.push({
          type: "recordSessionEvent",
          kind: "hint",
          summary: `Pista nivel ${level}: ${nextHint.hintText}`,
          itemId: item.id,
          itemText: item.text,
          hintLevel: level,
        });
      }
      const model = playModel(item);
      if (model) effects.push(model);
      return {
        state: {
          ...match,
          phase: "RESPOND",
          stage: "HINT_ESCALATION",
          respondKind: "retry",
          attempts,
          streak: 0,
          missesInARow: state.missesInARow + 1,
          hintLevel: level,
          activeHint: nextHint,
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
        state: { ...state, phase: "ENDED", stage: "ENDED", endedReason: "exit", capturing: false },
        effects: [{ type: "cancelSpeech" }, { type: "stopMic" }],
      };
    case "INTERRUPT":
      // Always-available stop/interrupt: stops speech & mic, parks cleanly in LISTEN.
      return {
        state: { ...state, phase: "LISTEN", capturing: false, respondKind: null },
        effects: [{ type: "cancelSpeech" }, { type: "stopMic" }],
      };
    case "IDLE_TIMEOUT":
      // any | IDLE_TIMEOUT (15 min no tap) → ENDED: cancelSpeech + stopMic + flush log.
      return {
        state: { ...state, phase: "ENDED", stage: "ENDED", endedReason: "idle", capturing: false },
        effects: [{ type: "cancelSpeech" }, { type: "stopMic" }, { type: "flushLog" }],
      };
    case "EARS_PROBLEM":
      // any | EARS_PROBLEM → same phase: stopMic + showUnavailable (no voice).
      return {
        state: { ...state, capturing: false },
        effects: [{ type: "stopMic" }, { type: "showUnavailable", problem: ev.problem }],
      };
    case "LINE_DONE":
      return onLineDone(state, rng);
    case "OPEN_WORKBOOK": {
      const effects: Effect[] = [];
      const next = enterWorkbookPractice(state, rng, effects);
      if (ev.printedPage !== undefined) {
        return {
          state: { ...next.state, activeWorkbookPage: ev.printedPage },
          effects: next.effects.map((eff) =>
            eff.type === "openWorkbook" ? { ...eff, printedPage: ev.printedPage! } : eff,
          ),
        };
      }
      return next;
    }
    case "COMPLETE_WORKBOOK":
      return completeCurrentPractice({ ...state, stage: "WORKBOOK_PRACTICE" }, rng);
    case "LAUNCH_GAME":
      return enterGamePractice(state, rng, [], ev.gameId);
    case "COMPLETE_GAME":
      return completeCurrentPractice({ ...state, stage: "GAME_PRACTICE" }, rng);
    case "MIC_CANCEL":
      return { state: { ...state, capturing: false }, effects: [{ type: "stopMic" }] };
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

export const SPANISH_CARRIER_WORDS = [
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "es",
  "vocal",
  "letra",
  "dije",
] as const;

/**
 * Grammar for ears.listen() in `"constrained"` mode (spec §18.2 / §18.6,
 * extended across all 24 lessons):
 * lesson items ∪ same-page distractors ∪ the 5 vowels and their aliases ∪
 * command words ∪ Spanish carrier words ∪ "[unk]".
 * For sentence items in Lessons 7–24, individual sentence words are also added
 * so Vosk can decode them cleanly.
 */
export function buildListenGrammar(lesson: number): string[] {
  const lessonItems = itemsForLesson(lesson);
  const words = new Set<string>();

  const addItemText = (item: TutorItem) => {
    words.add(item.text);
    const norm = normalize(item.text);
    if (norm) words.add(norm);
    if (item.kind === "sentence" && norm) {
      for (const token of norm.split(" ")) {
        if (token) words.add(token);
      }
    }
  };

  for (const item of lessonItems) {
    addItemText(item);
  }
  // Same-page distractors: any derived tutor item sharing a printed page
  // with this lesson (covers cross-lesson pages too).
  const pages = new Set(lessonItems.map((item) => item.printedPage));
  for (const item of tutorItems) {
    if (!pages.has(item.printedPage)) continue;
    addItemText(item);
  }
  // The 5 vowels and their aliases.
  for (const vowel of VOWELS) {
    words.add(vowel);
    for (const alias of VOWEL_ALIASES[vowel]) words.add(alias);
  }
  // Spanish carrier words.
  for (const word of SPANISH_CARRIER_WORDS) {
    words.add(word);
  }
  // Command words + aliases.
  for (const phrase of COMMAND_PHRASES) words.add(phrase);

  // Always present: off-grammar speech degrades to [unk] (tutor-ears-vosk).
  words.add("[unk]");

  return [...words].sort((a, b) => a.localeCompare(b));
}
