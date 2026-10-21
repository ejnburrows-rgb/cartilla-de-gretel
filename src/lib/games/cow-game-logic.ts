// Rules for "Las vacas" (letter m). Matches the approved Cartilla mockup.

/** Fence windows, left to right. */
export const COW_SLOTS = ["mo", "mu", "ma", "mi", "me"] as const;
/** Cows in mockup order: upper row mu, mo, me; lower row ma, mi. */
export const COW_SYLLABLES = ["mu", "mo", "me", "ma", "mi"] as const;

/** Word-building target after all windows are filled: ma + ma = mamá. */
export const TARGET_WORD = { syllables: ["ma", "ma"], written: "mamá" } as const;

export type Stage = "match" | "build" | "done";

/** A cow earns a window only when its syllable is that window's syllable. */
export function isCorrectWindow(cow: number, slot: number): boolean {
  return COW_SYLLABLES[cow] === COW_SLOTS[slot];
}

/** In word building, a trip counts only if it brings the next needed syllable. */
export function isNextSyllable(built: readonly string[], cow: number, slot: number): boolean {
  const need = TARGET_WORD.syllables[built.length];
  return need !== undefined && COW_SYLLABLES[cow] === need && COW_SLOTS[slot] === need;
}

/** Text shown under the syllable while building; accent appears only when complete. */
export function wordDisplay(built: readonly string[]): string {
  if (built.length === TARGET_WORD.syllables.length) return TARGET_WORD.written;
  return built.join(" · ");
}
