// Pure game rules for the Butterfly Garden (Jardín de Mariposas).
// Source of truth: the approved artwork (word-list sign + 8 numbered instructions)
// and the existing Cartilla MariposasGame (case-insensitive syllable matching).

export type Butterfly = {
  id: string;
  syllable: string;
  /** home centre in garden-art percentages (art is 1718x720) */
  ax: number;
  ay: number;
  /** sprite width as % of art width */
  aw: number;
  /** tag sits on top of a wide butterfly (po, Pu) → tagless sprite is centred */
  centred?: boolean;
};

export const BUTTERFLIES: Butterfly[] = [
  { id: "ma", syllable: "ma", ax: 25.8, ay: 25.3, aw: 15 },
  { id: "mo", syllable: "mo", ax: 47.6, ay: 19.0, aw: 14 },
  { id: "mi", syllable: "mi", ax: 70.3, ay: 25.6, aw: 13 },
  { id: "Mu", syllable: "Mu", ax: 37.3, ay: 46.1, aw: 13.5 },
  { id: "pa", syllable: "pa", ax: 53.1, ay: 54.4, aw: 13.5 },
  { id: "po", syllable: "po", ax: 71.6, ay: 51.1, aw: 13.5, centred: true },
  { id: "me", syllable: "me", ax: 18.9, ay: 69.4, aw: 15 },
  { id: "Pe", syllable: "Pe", ax: 41.4, ay: 76.3, aw: 13.5 },
  { id: "pi", syllable: "pi", ax: 63.2, ay: 81.0, aw: 14 },
  { id: "Pu", syllable: "Pu", ax: 87.4, ay: 66.3, aw: 14, centred: true },
];

/** The six words on the approved word-list sign, in sign order. */
export const WORDS: { word: string; syllables: string[] }[] = [
  { word: "mapa", syllables: ["ma", "pa"] },
  { word: "pomo", syllables: ["po", "mo"] },
  { word: "Mupi", syllables: ["Mu", "pi"] },
  { word: "Pepe", syllables: ["Pe", "pe"] },
  { word: "puma", syllables: ["pu", "ma"] },
  { word: "Pupi", syllables: ["Pu", "pi"] },
];

/** The original board always shows three answer slots. */
export const SLOT_COUNT = 3;

export type Verdict = "ok" | "wrong" | null;

const norm = (s: string) => s.toLocaleLowerCase("es");

/** Same rule as the existing Cartilla MariposasGame: syllables match ignoring case. */
export function sameSyllable(a: string, b: string): boolean {
  return norm(a) === norm(b);
}

/**
 * Instruction 6 ("Presiona la mariposa para comprobar la palabra"):
 * slot k must hold syllable k of the word, slots past the word must stay empty.
 */
export function checkSlots(slots: (string | null)[], syllables: string[]): Verdict[] {
  return slots.map((s, k) => {
    if (s === null) return null;
    if (k >= syllables.length) return "wrong";
    return sameSyllable(s, syllables[k] ?? "") ? "ok" : "wrong";
  });
}

export function isWordComplete(slots: (string | null)[], syllables: string[]): boolean {
  const v = checkSlots(slots, syllables);
  return syllables.every((_, k) => v[k] === "ok") && v.every((x) => x !== "wrong");
}

/** Instruction 4: the selected flower slot wins, otherwise the first empty one. */
export function targetSlot(slots: (string | null)[], selected: number | null): number {
  if (selected !== null && slots[selected] === null) return selected;
  return slots.findIndex((s) => s === null);
}

export function nextWordIndex(i: number): number {
  return (i + 1) % WORDS.length;
}
