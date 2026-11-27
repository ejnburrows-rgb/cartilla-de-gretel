/**
 * Tutor line picker (GRETEL-TUTOR-BUILD-SPEC §18.4 "Variety" / §18.5, Milestone 9).
 *
 * Deterministic, context-aware line selection over BOTH the intact legacy
 * manifest (`src/content/tutor-lines.json`) and the 24-lesson v2 dialogue
 * manifests (`src/lib/tutor-dialogue-manifest.ts`).
 *
 * Rules:
 *   - never repeat a line within the last 5 plays of the same role (`RECENT_WINDOW = 5`);
 *   - respect per-entry `cooldownTurns` across turns;
 *   - weight least-played lines (combined with manifest priority for v2 pools);
 *   - praise never repeats immediately;
 *   - compatible whole-utterance chaining (`acknowledge -> explain -> example -> one question`)
 *     with at most 1 question across the entire chain, never mid-sentence joins;
 *   - honest, clearly labeled text-only fallback whenever no approved audio exists
 *     (NEVER claim generated or scripted text is speech).
 */
import tutorLinesJson from "../content/tutor-lines.json";
import {
  countQuestions,
  isRejectedAudioSource,
  type DialogueLineV2,
  type TutorEvidenceKey,
} from "../content/tutor-dialogue/schema";
import { lessonGraphFor, type TutorItem } from "./tutor-content";
import {
  V2_DIALOGUE_ENTRIES,
  getDialogueEntry,
} from "./tutor-dialogue-manifest";
import { normalize } from "./tutor-match";
import { pictureModelById, pictureModelForWord } from "./tutor-picture-models";

/** Core legacy line-bank roles (spec §18.5). */
export type LegacyTutorLineRole =
  | "greeting-first"
  | "greeting-return"
  | "vowel-model"
  | "word-model"
  | "praise"
  | "praise-streak"
  | "praise-after-retry"
  | "close-miss"
  | "try-again"
  | "confusion"
  | "wrong-word"
  | "repeat-ack"
  | "dont-know"
  | "help"
  | "silence-nudge"
  | "noise"
  | "redirect"
  | "review-intro"
  | "closing"
  | "idle-end";

/** Extended v2 dialogue roles across Lessons 1–24. */
export type V2TutorLineRole =
  | "lesson-objective"
  | "lesson-focus"
  | "letter-name-model"
  | "phonetic-sound-model"
  | "explanation-primary"
  | "explanation-simple"
  | "syllable-practice"
  | "word-practice"
  | "sight-word-intro"
  | "sentence-practice"
  | "workbook-transition"
  | "page-instruction"
  | "page-complete"
  | "flipchart-intro"
  | "flipchart-illustration"
  | "reading-order"
  | "flipchart-model"
  | "flipchart-vocab"
  | "flipchart-rhyme"
  | "comprehension-question"
  | "common-mistake"
  | "review-check"
  | "assessment-prompt"
  | "next-step"
  | "game-intro"
  | "game-step"
  | "game-correct"
  | "game-retry"
  | "game-complete"
  | "adaptive-coaching"
  | "adaptive-pacing"
  | "off-script-redirect"
  | "conv-ack"
  | "conv-camera"
  | "camera-lighting";

export type TutorLineRole = LegacyTutorLineRole | V2TutorLineRole;

export interface TutorLineEntry {
  lineId: string;
  lesson: number;
  role: TutorLineRole;
  text: string;
  src?: string;
  emotion?: string;
  approval?: string;
  cooldownTurns?: number;
  priority?: number;
  status?: DialogueLineV2["status"];
  /** Evidence the app must hold before this line may play (see TUTOR_EVIDENCE_KEYS). */
  requiresEvidence?: readonly TutorEvidenceKey[];
}

/** A line with no evidence requirement is always eligible; otherwise every key must be held. */
export function isLineEligibleForEvidence(
  entry: Pick<TutorLineEntry, "requiresEvidence">,
  evidence?: ReadonlySet<TutorEvidenceKey>,
): boolean {
  const needed = entry.requiresEvidence;
  if (!needed || needed.length === 0) return true;
  if (!evidence) return false;
  return needed.every((key) => evidence.has(key));
}

export type LineDeliveryMode = "approved-audio" | "text-only-fallback";

/** Honest label shown whenever a line has no approved audio yet (never claimed as speech). */
export const TEXT_ONLY_FALLBACK_LABEL = "Solo texto (sin audio aprobado todavía)";

export interface ResolvedLineDelivery {
  readonly lineId: string | null;
  readonly text: string;
  readonly deliveryMode: LineDeliveryMode;
  readonly audioSrc: string | null;
  /** True ONLY when an approved, non-rejected audio recording exists. */
  readonly isSpeech: boolean;
  /** Non-null when `deliveryMode === "text-only-fallback"`. */
  readonly fallbackLabel: string | null;
}

export type UtteranceChainSlot = "acknowledge" | "explain" | "example" | "question";

export interface UtteranceChainStep extends ResolvedLineDelivery {
  readonly slot: UtteranceChainSlot;
  readonly role: TutorLineRole;
}

export interface UtteranceChainResult {
  readonly steps: readonly UtteranceChainStep[];
  readonly pauseBetweenMs: number;
  readonly questionCount: number;
  readonly hasTextOnlyFallback: boolean;
  readonly state: LinePickerState;
}

const manifest = tutorLinesJson as { approved: unknown[]; pending: unknown[] };

/** The legacy 120-line bank: approved + pending (preserved for §18.5 compatibility). */
export const TUTOR_LINES: readonly TutorLineEntry[] = [
  ...(manifest.approved as TutorLineEntry[]),
  ...(manifest.pending as TutorLineEntry[]),
];

const V2_AS_TUTOR_LINES: readonly TutorLineEntry[] = V2_DIALOGUE_ENTRIES.map((entry) => ({
  lineId: entry.id,
  lesson: entry.curriculumRefs.lesson ?? 0,
  role: entry.role as TutorLineRole,
  text: entry.text,
  ...(entry.status === "approved" && entry.audio.src ? { src: entry.audio.src } : {}),
  emotion: entry.expression,
  ...(entry.approval ? { approval: entry.approval } : {}),
  cooldownTurns: entry.cooldownTurns,
  priority: entry.priority,
  status: entry.status,
  ...(entry.eligibility.requiresEvidence?.length
    ? { requiresEvidence: entry.eligibility.requiresEvidence }
    : {}),
}));

/** Full merged bank across legacy L1–3 and v2 Lessons 1–24. */
export const ALL_TUTOR_LINES: readonly TutorLineEntry[] = [...TUTOR_LINES, ...V2_AS_TUTOR_LINES];

/** Never repeat a line within the last N plays of the same role. */
export const RECENT_WINDOW = 5;

/** Pause between the whole lines of a response sequence (spec §18.5). */
export const SEQUENCE_PAUSE_MS = 400;

export interface LinePickerState {
  /** role → last played lineIds, oldest first, capped at RECENT_WINDOW. */
  readonly recent: Readonly<Record<string, readonly string[]>>;
  /** role → lineId → times played. */
  readonly plays: Readonly<Record<string, Readonly<Record<string, number>>>>;
  /** Monotonic turn counter used for per-entry `cooldownTurns` enforcement. */
  readonly turn?: number;
  /** lineId → turn index when it was last played. */
  readonly lastPlayedTurn?: Readonly<Record<string, number>>;
}

export function createLinePickerState(): LinePickerState {
  return { recent: {}, plays: {}, turn: 0, lastPlayedTurn: {} };
}

/**
 * Pool for one role.
 * - For legacy L1–3 roles that exist in `TUTOR_LINES`, preserves the exact §18.5 pool.
 * - For Lessons 4–24 or v2-only roles (e.g. `lesson-focus`, `syllable-practice`,
 *   `word-practice`, `sentence-practice`, `adaptive-coaching`), draws from the
 *   v2 dialogue manifests (`src/content/tutor-dialogue/*`).
 */
export function poolForRole(role: TutorLineRole, lesson?: number): readonly TutorLineEntry[] {
  const seen = new Set<string>();
  const legacyPool: TutorLineEntry[] = [];
  for (const entry of TUTOR_LINES) {
    if (entry.role !== role) continue;
    if (lesson !== undefined && entry.lesson !== 0 && entry.lesson !== lesson) continue;
    if (seen.has(entry.lineId)) continue;
    seen.add(entry.lineId);
    legacyPool.push(entry);
  }
  if (legacyPool.length > 0) return legacyPool;

  // Lesson 4–24 lesson-scoped roles or v2-only roles: query v2 dialogue entries.
  const v2LessonSpecific: TutorLineEntry[] = [];
  const v2Universal: TutorLineEntry[] = [];
  for (const entry of V2_AS_TUTOR_LINES) {
    if (entry.role !== role) continue;
    if (seen.has(entry.lineId)) continue;
    if (lesson !== undefined) {
      if (entry.lesson === lesson) {
        seen.add(entry.lineId);
        v2LessonSpecific.push(entry);
      } else if (entry.lesson === 0) {
        seen.add(entry.lineId);
        v2Universal.push(entry);
      }
    } else {
      seen.add(entry.lineId);
      v2LessonSpecific.push(entry);
    }
  }
  return v2LessonSpecific.length > 0 ? v2LessonSpecific : v2Universal;
}

/**
 * Pool across BOTH legacy and v2 manifests for a given role & lesson,
 * optionally preferring lesson-specific lines or approved audio.
 */
export function poolForRoleExtended(
  role: TutorLineRole,
  lesson?: number,
): readonly TutorLineEntry[] {
  const seen = new Set<string>();
  const pool: TutorLineEntry[] = [];
  for (const entry of ALL_TUTOR_LINES) {
    if (entry.role !== role) continue;
    if (lesson !== undefined && entry.lesson !== 0 && entry.lesson !== lesson) continue;
    if (seen.has(entry.lineId)) continue;
    seen.add(entry.lineId);
    pool.push(entry);
  }
  return pool;
}

function recordPlay(state: LinePickerState, role: string, lineId: string): LinePickerState {
  const nextTurn = (state.turn ?? 0) + 1;
  const recent = [...(state.recent[role] ?? []), lineId].slice(-RECENT_WINDOW);
  const plays = { ...(state.plays[role] ?? {}) };
  plays[lineId] = (plays[lineId] ?? 0) + 1;
  const lastPlayedTurn = { ...(state.lastPlayedTurn ?? {}), [lineId]: nextTurn };
  return {
    recent: { ...state.recent, [role]: recent },
    plays: { ...state.plays, [role]: plays },
    turn: nextTurn,
    lastPlayedTurn,
  };
}

function isOnCooldown(entry: TutorLineEntry, state: LinePickerState): boolean {
  const cooldown = entry.cooldownTurns ?? 0;
  if (cooldown <= 0) return false;
  const lastTurn = state.lastPlayedTurn?.[entry.lineId];
  if (lastTurn === undefined) return false;
  const currentTurn = state.turn ?? 0;
  return currentTurn - lastTurn < cooldown;
}

function weightedPick(
  candidates: readonly TutorLineEntry[],
  plays: Readonly<Record<string, number>>,
  rng: () => number,
  usePriorityWeight = false,
): TutorLineEntry {
  // Weight = (priorityScale) / (1 + play count): least-played lines are most likely.
  const weights = candidates.map((entry) => {
    const playCount = plays[entry.lineId] ?? 0;
    const priorityFactor = usePriorityWeight && entry.priority ? entry.priority / 100 : 1;
    return priorityFactor / (1 + playCount);
  });
  const total = weights.reduce((sum, w) => sum + w, 0);
  let point = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    point -= weights[i];
    if (point <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export interface PickLineOptions {
  role: TutorLineRole;
  /** Lesson scope for lesson-scoped roles; shared lines are always eligible. */
  lesson?: number;
  /** Include v2 lines alongside legacy lines when available. */
  includeV2?: boolean;
  /** Exclude specific lineIds (e.g., to prevent duplicates within a chain). */
  excludeLineIds?: readonly string[];
  /** Evidence the app currently holds; lines that require more are not eligible. */
  evidence?: ReadonlySet<TutorEvidenceKey>;
}

/**
 * Pick one line for a role: prefer lines outside the last-5 window and off
 * per-entry cooldown, weight least-played, and fall back to the whole pool
 * only when every line is in the window/cooldown.
 */
export function pickLine(
  state: LinePickerState,
  opts: PickLineOptions,
  rng: () => number,
): { lineId: string; state: LinePickerState } | null {
  let pool = opts.includeV2
    ? poolForRoleExtended(opts.role, opts.lesson)
    : poolForRole(opts.role, opts.lesson);
  if (opts.excludeLineIds && opts.excludeLineIds.length > 0) {
    const excluded = new Set(opts.excludeLineIds);
    pool = pool.filter((entry) => !excluded.has(entry.lineId));
  }
  pool = pool.filter((entry) => isLineEligibleForEvidence(entry, opts.evidence));
  if (pool.length === 0) return null;

  const recent = state.recent[opts.role] ?? [];
  const fresh = pool.filter(
    (entry) => !recent.includes(entry.lineId) && !isOnCooldown(entry, state),
  );
  const offRecent = pool.filter((entry) => !recent.includes(entry.lineId));
  const candidates = fresh.length > 0 ? fresh : offRecent.length > 0 ? offRecent : pool;
  const chosen = weightedPick(
    candidates,
    state.plays[opts.role] ?? {},
    rng,
    Boolean(opts.includeV2),
  );
  return { lineId: chosen.lineId, state: recordPlay(state, opts.role, chosen.lineId) };
}

export type PickSequenceStep = PickLineOptions;

/**
 * Pick an ordered list of whole lines for a response sequence (spec §18.5:
 * whole lines back to back with a 400 ms pause — never mid-sentence joins).
 * Each step applies the no-repeat window, cooldowns, and weighting in order.
 */
export function pickSequence(
  state: LinePickerState,
  steps: readonly PickSequenceStep[],
  rng: () => number,
): { lineIds: string[]; state: LinePickerState } | null {
  const lineIds: string[] = [];
  let current = state;
  for (const step of steps) {
    const picked = pickLine(current, step, rng);
    if (!picked) return null;
    lineIds.push(picked.lineId);
    current = picked.state;
  }
  return { lineIds, state: current };
}

/**
 * Resolves whether a lineId has approved recorded audio or must be presented
 * as a clearly labeled text-only fallback. NEVER claims scripted/text-only
 * content is speech.
 */
export function resolveLineDelivery(lineId: string): ResolvedLineDelivery | null {
  const picture = pictureModelById(lineId);
  if (picture && !isRejectedAudioSource(picture.src)) {
    return {
      lineId,
      text: picture.text,
      deliveryMode: "approved-audio",
      audioSrc: picture.src,
      isSpeech: true,
      fallbackLabel: null,
    };
  }
  const entry = getDialogueEntry(lineId);
  if (!entry) return null;
  const hasApprovedAudio =
    entry.status === "approved" &&
    typeof entry.audio.src === "string" &&
    entry.audio.src.length > 0 &&
    !isRejectedAudioSource(entry.audio.src);

  if (hasApprovedAudio) {
    return {
      lineId: entry.id,
      text: entry.text,
      deliveryMode: "approved-audio",
      audioSrc: entry.audio.src!,
      isSpeech: true,
      fallbackLabel: null,
    };
  }
  return {
    lineId: entry.id,
    text: entry.text,
    deliveryMode: "text-only-fallback",
    audioSrc: null,
    isSpeech: false,
    fallbackLabel: TEXT_ONLY_FALLBACK_LABEL,
  };
}

/**
 * Builds an honest text-only fallback delivery when no manifest line or
 * approved audio exists for a curriculum item or coaching step.
 */
export function createTextOnlyFallback(
  text: string,
  lineId: string | null = null,
): ResolvedLineDelivery {
  return {
    lineId,
    text,
    deliveryMode: "text-only-fallback",
    audioSrc: null,
    isSpeech: false,
    fallbackLabel: TEXT_ONLY_FALLBACK_LABEL,
  };
}

export interface PickContextualChainOptions {
  lesson: number;
  /** Role for the `acknowledge` slot (e.g. `help`, `dont-know`, `close-miss`, `try-again`, `repeat-ack`). */
  acknowledgeRole: TutorLineRole;
  /** Optional role for the `explain` slot (defaults to `lesson-focus` or `adaptive-coaching`). */
  explainRole?: TutorLineRole;
  /** Optional role for the `example` slot (defaults to `word-practice` / `syllable-practice` / `flipchart-model`). */
  exampleRole?: TutorLineRole;
  /** Optional role for the single closing `question` slot (defaults to `page-instruction` / `silence-nudge`). */
  questionRole?: TutorLineRole;
  /** Optional item whose model text can serve as the example when no lesson example line exists. */
  item?: TutorItem;
}

/**
 * Compatible whole-utterance chaining:
 *   `acknowledge -> explain -> example -> one question`
 *
 * Enforces:
 * - Strict slot ordering (`acknowledge`, `explain`, `example`, `question`),
 * - Whole utterances only (never mid-sentence joins),
 * - At most ONE question mark across the entire chain,
 * - Cooldowns and weighted variation per role,
 * - Honest `approved-audio` vs `text-only-fallback` delivery labels on every step.
 */
export function pickContextualChain(
  state: LinePickerState,
  opts: PickContextualChainOptions,
  rng: () => number,
): UtteranceChainResult {
  const steps: UtteranceChainStep[] = [];
  const usedIds: string[] = [];
  let current = state;
  let totalQuestions = 0;

  const tryAddSlot = (
    slot: UtteranceChainSlot,
    roles: readonly TutorLineRole[],
    allowQuestion: boolean,
  ) => {
    for (const role of roles) {
      const pool = poolForRoleExtended(role, opts.lesson).filter(
        (entry) =>
          !usedIds.includes(entry.lineId) &&
          (allowQuestion
            ? totalQuestions + countQuestions(entry.text) <= 1
            : countQuestions(entry.text) === 0),
      );
      if (pool.length === 0) continue;

      const recent = current.recent[role] ?? [];
      const fresh = pool.filter(
        (entry) => !recent.includes(entry.lineId) && !isOnCooldown(entry, current),
      );
      const candidates = fresh.length > 0 ? fresh : pool;
      const chosen = weightedPick(candidates, current.plays[role] ?? {}, rng, true);
      const delivery =
        resolveLineDelivery(chosen.lineId) ?? createTextOnlyFallback(chosen.text, chosen.lineId);

      current = recordPlay(current, role, chosen.lineId);
      usedIds.push(chosen.lineId);
      totalQuestions += countQuestions(delivery.text);
      steps.push({ ...delivery, slot, role });
      return;
    }
  };

  // 1. Acknowledge (no question)
  tryAddSlot("acknowledge", [opts.acknowledgeRole], false);

  // 2. Explain (no question)
  tryAddSlot(
    "explain",
    opts.explainRole
      ? [opts.explainRole]
      : ["lesson-focus", "adaptive-coaching", "page-instruction"],
    false,
  );

  // 3. Example (no question; falls back to item model if available)
  const exampleRoles: TutorLineRole[] = opts.exampleRole
    ? [opts.exampleRole]
    : opts.item?.kind === "syllable"
      ? ["syllable-practice", "phonetic-sound-model", "word-practice"]
      : opts.item?.kind === "sentence"
        ? ["sentence-practice", "word-practice"]
        : ["word-practice", "flipchart-model", "phonetic-sound-model"];
  const beforeExample = steps.length;
  tryAddSlot("example", exampleRoles, false);
  if (steps.length === beforeExample && opts.item) {
    const modelDelivery = modelDeliveryForItem(opts.item);
    steps.push({
      ...modelDelivery,
      slot: "example",
      role: opts.item.kind === "vowel" ? "vowel-model" : "word-model",
    });
  }

  // 4. One question (at most 1 question across the entire chain)
  if (totalQuestions < 1) {
    const questionRoles: TutorLineRole[] = opts.questionRole
      ? [opts.questionRole]
      : ["silence-nudge", "page-instruction", "try-again"];
    tryAddSlot("question", questionRoles, true);
  }

  return {
    steps,
    pauseBetweenMs: SEQUENCE_PAUSE_MS,
    questionCount: totalQuestions,
    hasTextOnlyFallback: steps.some((s) => s.deliveryMode === "text-only-fallback"),
    state: current,
  };
}

/**
 * The fixed model line for one lesson item:
 * - `l0-vowel-model-*` for vowels,
 * - legacy `word-model` entry whose text matches `item.text`,
 * - `item.tutorLineId` when provided by the 24-lesson instructional graph,
 * - v2 dialogue entry for the item's lesson whose `curriculumRefs` references the item.
 */
export function modelLineIdForItem(item: TutorItem): string | null {
  if (item.kind === "vowel") {
    const lineId = `l0-vowel-model-${item.text}`;
    return TUTOR_LINES.some((entry) => entry.lineId === lineId) ? lineId : null;
  }
  const legacyWord = TUTOR_LINES.find(
    (candidate) => candidate.role === "word-model" && candidate.text === item.text,
  );
  if (legacyWord) return legacyWord.lineId;

  const assigned = item.tutorLineId ? getDialogueEntry(item.tutorLineId) : undefined;
  if (assigned?.status === "approved") return assigned.id;
  const graphAudio = item.approvedAudioSrc ??
    lessonGraphFor(item.lesson)?.items.find((candidate) => candidate.id === item.id)?.approvedAudioSrc;
  const picture = pictureModelForWord(item.text, graphAudio);
  if (picture) return picture.lineId;
  if (assigned) return assigned.id;

  // Look up lesson-scoped v2 model/practice lines for Lessons 4–24.
  const targetNorm = normalize(item.text);
  const v2Match = V2_DIALOGUE_ENTRIES.find((entry) => {
    if (entry.curriculumRefs.lesson !== item.lesson) return false;
    if (item.kind === "syllable") {
      return (
        entry.role === "syllable-practice" &&
        entry.curriculumRefs.syllables?.some((s) => normalize(s) === targetNorm)
      );
    }
    if (item.kind === "word" || item.kind === "sight-word") {
      return (
        (entry.role === "word-practice" || entry.role === "sight-word-intro") &&
        entry.curriculumRefs.words?.some((w) => normalize(w) === targetNorm)
      );
    }
    if (item.kind === "sentence") {
      return entry.role === "sentence-practice" && normalize(entry.text).includes(targetNorm);
    }
    return false;
  });
  return v2Match?.id ?? null;
}

/**
 * Resolves audio or honest text-only fallback for a curriculum item across all 24 lessons.
 */
export function modelDeliveryForItem(item: TutorItem): ResolvedLineDelivery {
  const lineId = modelLineIdForItem(item);
  if (lineId) {
    const resolved = resolveLineDelivery(lineId);
    if (resolved) return resolved;
  }
  const graphItem = lessonGraphFor(item.lesson)?.items.find(
    (candidate) => candidate.id === item.id,
  );
  const approvedSrc = item.approvedAudioSrc ?? graphItem?.approvedAudioSrc ?? null;
  if (
    typeof approvedSrc === "string" &&
    approvedSrc.length > 0 &&
    !isRejectedAudioSource(approvedSrc)
  ) {
    return {
      lineId: item.tutorLineId ?? graphItem?.tutorLineId ?? null,
      text: item.text,
      deliveryMode: "approved-audio",
      audioSrc: approvedSrc,
      isSpeech: true,
      fallbackLabel: null,
    };
  }
  return createTextOnlyFallback(item.text, lineId);
}

/**
 * Picks a pedagogical stage line for a lesson, preferring lesson-specific
 * entries before universal entries, and falling back to clearly labeled
 * text-only delivery when no manifest entry exists.
 */
export function pickLessonStageLine(
  state: LinePickerState,
  opts: {
    role: TutorLineRole;
    lesson: number;
    fallbackText: string;
  },
  rng: () => number,
): { delivery: ResolvedLineDelivery; state: LinePickerState } {
  const pool = poolForRoleExtended(opts.role, opts.lesson);
  const lessonScoped = pool.filter((entry) => entry.lesson === opts.lesson);
  const chosenPool = lessonScoped.length > 0 ? lessonScoped : pool;
  if (chosenPool.length > 0) {
    const recent = state.recent[opts.role] ?? [];
    const fresh = chosenPool.filter(
      (entry) => !recent.includes(entry.lineId) && !isOnCooldown(entry, state),
    );
    const offRecent = chosenPool.filter((entry) => !recent.includes(entry.lineId));
    const candidates = fresh.length > 0 ? fresh : offRecent.length > 0 ? offRecent : chosenPool;
    const chosen = weightedPick(candidates, state.plays[opts.role] ?? {}, rng, true);
    const nextState = recordPlay(state, opts.role, chosen.lineId);
    const delivery =
      resolveLineDelivery(chosen.lineId) ?? createTextOnlyFallback(chosen.text, chosen.lineId);
    return { delivery, state: nextState };
  }
  return {
    delivery: createTextOnlyFallback(opts.fallbackText, null),
    state,
  };
}

export interface ProgressiveHint {
  readonly level: 1 | 2 | 3;
  readonly itemId: string;
  readonly hintText: string;
  readonly visualCue: string;
  readonly explanationText: string;
  readonly delivery: ResolvedLineDelivery;
}

/**
 * Builds a 3-level progressive hint and simpler explanation grounded in the
 * canonical curriculum item and lesson graph (never inventing off-book content).
 */
export function buildProgressiveHint(
  item: TutorItem,
  level: 1 | 2 | 3,
  state: LinePickerState,
  rng: () => number,
): { hint: ProgressiveHint; state: LinePickerState } {
  const clean = item.text.trim();
  const chars = Array.from(clean);
  const firstChar = chars[0] ?? "";
  const prefix = chars.slice(0, Math.min(2, chars.length)).join("");

  let hintText: string;
  let visualCue: string;
  let explanationText: string;

  if (item.kind === "vowel") {
    if (level === 1) {
      hintText = `Escucha con calma el sonido de la vocal "${clean}".`;
      visualCue = clean;
      explanationText = `Abre un poco la boca y sostén el sonido "${clean}".`;
    } else if (level === 2) {
      hintText = `Observa la letra ${clean.toUpperCase()} ${clean.toLowerCase()} en la lámina y dilo despacio.`;
      visualCue = `${clean.toUpperCase()} ${clean.toLowerCase()}`;
      explanationText = `Es la vocal "${clean}", como en la primera letra que practicamos.`;
    } else {
      hintText = `Escucha y repite conmigo: "${clean}".`;
      visualCue = clean;
      explanationText = `Vamos juntos paso a paso: "${clean}".`;
    }
  } else if (item.kind === "syllable") {
    if (level === 1) {
      hintText = `Fíjate en el primer sonido "${firstChar}" antes de la vocal.`;
      visualCue = `${firstChar} + ${chars[1] ?? ""}`;
      explanationText = `Une los dos sonidos despacio para formar la sílaba.`;
    } else if (level === 2) {
      hintText = `Junta "${firstChar}" con "${chars.slice(1).join("")}" poco a poco.`;
      visualCue = `${firstChar} · ${chars.slice(1).join("")}`;
      explanationText = `Explicación simple: primero suena "${firstChar}" y enseguida "${chars.slice(1).join("")}".`;
    } else {
      hintText = `Escucha el modelo lento y repite conmigo: "${clean}".`;
      visualCue = clean;
      explanationText = `Di la sílaba completa despacio: "${clean}".`;
    }
  } else if (item.kind === "sentence") {
    const words = clean.split(/\s+/);
    const firstWord = words[0] ?? clean;
    if (level === 1) {
      hintText = `Empieza por la primera palabra: "${firstWord}".`;
      visualCue = `${firstWord}…`;
      explanationText = `Lee con tu dedo palabra por palabra sin prisa.`;
    } else if (level === 2) {
      const firstTwo = words.slice(0, 2).join(" ");
      hintText = `Lee primero "${firstTwo}" y luego continúa hasta el punto.`;
      visualCue = `${firstTwo}…`;
      explanationText = `Cada palabra se lee por partes, una después de la otra.`;
    } else {
      hintText = `Escucha la oración completa y repítela conmigo: "${clean}".`;
      visualCue = clean;
      explanationText = `Léela despacio siguiendo cada palabra.`;
    }
  } else {
    if (level === 1) {
      hintText = `Fíjate en el primer sonido: empieza con "${firstChar}".`;
      visualCue = `${firstChar}…`;
      explanationText = `Mira la ilustración o la letra inicial "${firstChar}".`;
    } else if (level === 2) {
      hintText = `Empieza con "${prefix}" y sigue leyendo hasta el final.`;
      visualCue = `${prefix}…`;
      explanationText = `Explicación simple: lee primero "${prefix}" y termina la palabra "${clean}".`;
    } else {
      hintText = `Escucha y repite conmigo: "${clean}".`;
      visualCue = clean;
      explanationText = `Vamos juntos despacio: "${clean}".`;
    }
  }

  const stageRole: TutorLineRole =
    level === 1 ? "close-miss" : level === 2 ? "explanation-simple" : "adaptive-coaching";
  const picked = pickLessonStageLine(
    state,
    { role: stageRole, lesson: item.lesson, fallbackText: hintText },
    rng,
  );

  return {
    hint: {
      level,
      itemId: item.id,
      hintText,
      visualCue,
      explanationText,
      delivery: level === 3 ? modelDeliveryForItem(item) : picked.delivery,
    },
    state: picked.state,
  };
}

/**
 * The fixed confusion line for the vowel the child actually said
 * ("Esa es la …", one per vowel, spec §18.5). Exact, never random.
 */
export function confusionLineIdFor(vowel: string): string | null {
  const lineId = `l0-confusion-${vowel}`;
  return TUTOR_LINES.some((entry) => entry.lineId === lineId) ? lineId : null;
}
