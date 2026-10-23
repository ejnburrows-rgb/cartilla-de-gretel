/** Visual keyboard geometry shared by the two microphone-driven Piano Hablador designs. */

export const NOTE = {
  C4: 261.63,
  Cs4: 277.18,
  D4: 293.66,
  Ds4: 311.13,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  Gs4: 415.3,
  A4: 440.0,
  As4: 466.16,
  B4: 493.88,
  C5: 523.25,
} as const;

export interface WhiteKey {
  id: string;
  name: string;
  freq: number;
}
export interface BlackKey {
  id: string;
  name: string;
  freq: number;
  /** Sits on the boundary after white key `after` (0-based). */
  after: number;
}

/** One octave, do → do: 8 white + 5 black. Design A ("Piano"). */
export const OCTAVE_WHITE: WhiteKey[] = [
  { id: "C4", name: "do", freq: NOTE.C4 },
  { id: "D4", name: "re", freq: NOTE.D4 },
  { id: "E4", name: "mi", freq: NOTE.E4 },
  { id: "F4", name: "fa", freq: NOTE.F4 },
  { id: "G4", name: "sol", freq: NOTE.G4 },
  { id: "A4", name: "la", freq: NOTE.A4 },
  { id: "B4", name: "si", freq: NOTE.B4 },
  { id: "C5", name: "do alto", freq: NOTE.C5 },
];
export const OCTAVE_BLACK: BlackKey[] = [
  { id: "Cs4", name: "do sostenido", freq: NOTE.Cs4, after: 0 },
  { id: "Ds4", name: "re sostenido", freq: NOTE.Ds4, after: 1 },
  { id: "Fs4", name: "fa sostenido", freq: NOTE.Fs4, after: 3 },
  { id: "Gs4", name: "sol sostenido", freq: NOTE.Gs4, after: 4 },
  { id: "As4", name: "la sostenido", freq: NOTE.As4, after: 5 },
];

/** Five big keys, do → sol: one per syllable slot. Design B ("Cancionero"). */
export const FIVE_WHITE: WhiteKey[] = OCTAVE_WHITE.slice(0, 5);
export const FIVE_BLACK: BlackKey[] = OCTAVE_BLACK.slice(0, 3);

/** Warm colors from the original toy piano, one per syllable position. */
export const SYLLABLE_COLORS = [
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

/**
 * Owner-locked: a reliably recognized syllable turns GREEN and stays green
 * (its note on the staff and its piano key), whatever its position color.
 */
export const CONFIRMED_GREEN = "#16a34a";

/** Color for syllable `index`: its warm position color, or green once confirmed. */
export function syllableColor(index: number, state: string): string {
  return state === "confirmed" ? CONFIRMED_GREEN : SYLLABLE_COLORS[index % SYLLABLE_COLORS.length];
}

/** Accessible state words for a syllable key (same wording as before). */
export const STATE_LABEL = {
  pending: "por decir",
  next: "por decir",
  hearing: "escuchando",
  provisional: "casi",
  confirmed: "lista",
} as const;

