// syllable-builder.ts — pure logic for the syllable word-builder exercise.
//
// The book teaches reading syllable by syllable (ma + má → mamá), so this is
// the digital form of the cartilla's own method, and the app's first
// PRODUCTION exercise: the child assembles the word instead of picking a
// finished one.
//
// Everything here is pure so the grading can be unit-tested without mounting
// React or a pointer device. The component owns the dragging; this module owns
// "is the word right yet".

/** One slot in the word being built. `null` = still empty. */
export type PlacedSyllable = string | null;

export type SyllableGrade = {
  /** Every slot filled AND every slot matching the target, in order. */
  isCorrect: boolean;
  /** How many slots hold the right syllable (partial credit for reporting). */
  correctCount: number;
  /** How many syllables the word has. */
  total: number;
  /** True once the child has filled every slot (right or wrong). */
  isComplete: boolean;
};

/**
 * Normalizes a syllable for comparison: trims, lowercases, and settles the
 * accent representation so a composed "má" and a decomposed "má" match.
 * Accents are NOT stripped — "ma" and "má" are different syllables to a child
 * learning to read, and grading them as equal would teach the wrong thing.
 */
export function normalizeSyllable(s: string): string {
  return s.normalize("NFC").trim().toLowerCase();
}

/** True when the syllable in `slot` is the one the target expects there. */
export function isSlotCorrect(placed: PlacedSyllable[], target: string[], index: number): boolean {
  const got = placed[index];
  const want = target[index];
  if (got == null || want == null) return false;
  return normalizeSyllable(got) === normalizeSyllable(want);
}

/** Grades an in-progress or finished attempt against the target syllables. */
export function gradeAttempt(placed: PlacedSyllable[], target: string[]): SyllableGrade {
  const total = target.length;
  let correctCount = 0;
  for (let i = 0; i < total; i++) {
    if (isSlotCorrect(placed, target, i)) correctCount++;
  }
  const isComplete =
    total > 0 && placed.length >= total && placed.slice(0, total).every((s) => s != null);
  return {
    isCorrect: total > 0 && correctCount === total,
    correctCount,
    total,
    isComplete,
  };
}

/**
 * Deterministic Fisher-Yates shuffle. Takes the random source as an argument
 * so tests can pass a fixed sequence and assert an exact order — and so a
 * seeded generator can make a child's tray identical across a reload.
 */
export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Builds the tray of tiles the child drags from: every syllable the word
 * needs, plus any extra decoy syllables the lesson supplies, shuffled.
 *
 * Decoys are passed in by the content file (real syllables from the same
 * lesson) rather than invented here, so the exercise never asks a child to
 * reject a syllable the book has not taught them yet.
 */
export function buildTileBank(
  syllables: readonly string[],
  decoys: readonly string[] = [],
  rng: () => number = Math.random,
): string[] {
  return shuffle([...syllables, ...decoys], rng);
}

/**
 * Returns the index of the first empty slot, or -1 when the word is full.
 * Used for tap-to-place: tapping a tile drops it in the next gap, which is how
 * a young child expects it to work and what keyboard users get too.
 */
export function nextEmptySlot(placed: PlacedSyllable[]): number {
  return placed.findIndex((s) => s == null);
}
