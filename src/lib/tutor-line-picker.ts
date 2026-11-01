/**
 * Tutor line picker (GRETEL-TUTOR-BUILD-SPEC §18.4 "Variety" / §18.5).
 *
 * Deterministic, context-aware line selection over the manifest in
 * src/content/tutor-lines.json. Rules:
 *   - never repeat a line within the last 5 plays of the same role;
 *   - weight least-played lines for the slot;
 *   - praise never repeats immediately (covered by the window, locked by a
 *     dedicated test);
 *   - a response may be an ordered sequence of two whole lines played back
 *     to back with a 400 ms pause — represented as an ordered line list,
 *     never mid-sentence joins.
 *
 * Pending lines (no audio yet) are part of the same pools; the voice layer
 * resolves them silently. The rng is injected — this module and the brain
 * never call Math.random.
 */
import tutorLinesJson from "../content/tutor-lines.json";
import type { TutorItem } from "./tutor-content";

/** Line-bank roles (spec §18.5). */
export type TutorLineRole =
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

export interface TutorLineEntry {
  lineId: string;
  lesson: number;
  role: TutorLineRole;
  text: string;
  src?: string;
  emotion?: string;
  approval?: string;
}

const manifest = tutorLinesJson as { approved: unknown[]; pending: unknown[] };

/** The whole line bank: approved + pending (pending resolve silently). */
export const TUTOR_LINES: readonly TutorLineEntry[] = [
  ...(manifest.approved as TutorLineEntry[]),
  ...(manifest.pending as TutorLineEntry[]),
];

/** Never repeat a line within the last N plays of the same role. */
export const RECENT_WINDOW = 5;

/** Pause between the two whole lines of a response sequence (spec §18.5). */
export const SEQUENCE_PAUSE_MS = 400;

export interface LinePickerState {
  /** role → last played lineIds, oldest first, capped at RECENT_WINDOW. */
  readonly recent: Readonly<Record<string, readonly string[]>>;
  /** role → lineId → times played. */
  readonly plays: Readonly<Record<string, Readonly<Record<string, number>>>>;
}

export function createLinePickerState(): LinePickerState {
  return { recent: {}, plays: {} };
}

/**
 * Pool for one role. Lesson-scoped roles (greeting-first, word-model) match
 * their lesson; shared roles carry lesson 0 and are always included, so a
 * lesson-scoped request still gets the shared lines.
 */
export function poolForRole(role: TutorLineRole, lesson?: number): readonly TutorLineEntry[] {
  const seen = new Set<string>();
  const pool: TutorLineEntry[] = [];
  for (const entry of TUTOR_LINES) {
    if (entry.role !== role) continue;
    if (lesson !== undefined && entry.lesson !== 0 && entry.lesson !== lesson) continue;
    if (seen.has(entry.lineId)) continue;
    seen.add(entry.lineId);
    pool.push(entry);
  }
  return pool;
}

function recordPlay(
  state: LinePickerState,
  role: string,
  lineId: string,
): LinePickerState {
  const recent = [...(state.recent[role] ?? []), lineId].slice(-RECENT_WINDOW);
  const plays = { ...(state.plays[role] ?? {}) };
  plays[lineId] = (plays[lineId] ?? 0) + 1;
  return {
    recent: { ...state.recent, [role]: recent },
    plays: { ...state.plays, [role]: plays },
  };
}

function weightedPick(
  candidates: readonly TutorLineEntry[],
  plays: Readonly<Record<string, number>>,
  rng: () => number,
): TutorLineEntry {
  // Weight = 1 / (1 + play count): least-played lines are most likely.
  const weights = candidates.map((entry) => 1 / (1 + (plays[entry.lineId] ?? 0)));
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
}

/**
 * Pick one line for a role: prefer lines outside the last-5 window, weight
 * least-played, and fall back to the whole pool only when every line is in
 * the window (pools smaller than the window must still be able to pick).
 */
export function pickLine(
  state: LinePickerState,
  opts: PickLineOptions,
  rng: () => number,
): { lineId: string; state: LinePickerState } | null {
  const pool = poolForRole(opts.role, opts.lesson);
  if (pool.length === 0) return null;

  const recent = state.recent[opts.role] ?? [];
  const fresh = pool.filter((entry) => !recent.includes(entry.lineId));
  const candidates = fresh.length > 0 ? fresh : pool;
  const chosen = weightedPick(candidates, state.plays[opts.role] ?? {}, rng);
  return { lineId: chosen.lineId, state: recordPlay(state, opts.role, chosen.lineId) };
}

export interface PickSequenceStep extends PickLineOptions {}

/**
 * Pick an ordered list of whole lines for a response sequence (spec §18.5:
 * two whole lines back to back with a 400 ms pause — never mid-sentence
 * joins). Each step applies the no-repeat window and weighting in order.
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
 * The fixed model line for one lesson item: `l0-vowel-model-*` for vowels,
 * and the manifest's word-model entry whose text is the item's word (the 43
 * approved picture-name recordings are reused across lessons, so the match
 * is by text, not by the manifest's lesson label).
 */
export function modelLineIdForItem(item: TutorItem): string | null {
  if (item.kind === "vowel") {
    const lineId = `l0-vowel-model-${item.text}`;
    return TUTOR_LINES.some((entry) => entry.lineId === lineId) ? lineId : null;
  }
  const entry = TUTOR_LINES.find(
    (candidate) => candidate.role === "word-model" && candidate.text === item.text,
  );
  return entry?.lineId ?? null;
}

/**
 * The fixed confusion line for the vowel the child actually said
 * ("Esa es la …", one per vowel, spec §18.5). Exact, never random.
 */
export function confusionLineIdFor(vowel: string): string | null {
  const lineId = `l0-confusion-${vowel}`;
  return TUTOR_LINES.some((entry) => entry.lineId === lineId) ? lineId : null;
}