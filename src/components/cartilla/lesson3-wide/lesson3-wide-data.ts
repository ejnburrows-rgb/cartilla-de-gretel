/**
 * Lesson 3 wide-screen redesign — shared data (owner order 2026-10-17 20:46 EDT).
 *
 * Wide computer screens and horizontal tablets are the target. Vertical phone
 * is a separate simpler fit done later — nothing here is phone layout.
 *
 * Art paths point at the polished files already on this branch. Never replace
 * art from here; Codex owns artwork mapping.
 */

export interface Lesson3WidePicture {
  slug: string;
  /** Display caption (book spelling, accents kept). */
  caption: string;
  /** Polished art already on this branch. */
  src: string;
}

/** Page 7: the 8 vocal-a pictures, 4x2 grid, big and uncramped. */
export const LESSON3_VOCAL_A: Lesson3WidePicture[] = [
  { slug: "abanico", caption: "abanico", src: "/cartilla/art/faithful/vocal-a/abanico.webp" },
  { slug: "abeja", caption: "abeja", src: "/cartilla/art/faithful/vocal-a/abeja.webp" },
  { slug: "aguja", caption: "aguja", src: "/cartilla/art/faithful/vocal-a/aguja.webp" },
  { slug: "alas", caption: "alas", src: "/cartilla/art/faithful/vocal-a/alas.webp" },
  { slug: "arbol", caption: "árbol", src: "/cartilla/art/faithful/vocal-a/arbol.webp" },
  { slug: "ardilla", caption: "ardilla", src: "/cartilla/art/faithful/vocal-a/ardilla.webp" },
  { slug: "aro", caption: "aro", src: "/cartilla/art/faithful/vocal-a/aro.webp" },
  { slug: "avion", caption: "avión", src: "/cartilla/art/faithful/vocal-a/avion.webp" },
];

/** Page 8 uses the same 8 pictures in 2 columns x 4 rows on the right. */
export const LESSON3_PAGE8_PICTURES = LESSON3_VOCAL_A;

/** Book instruction wording, verbatim from page-layouts.json (do not edit text). */
export const P7_INSTRUCTION = "Marca con una x los dibujos de las palabras que comienzan con A a.";
export const P8_INSTRUCTION =
  "Traza una línea desde la vocal Aa hasta el dibujo de la palabra que comienza con Aa.";

/**
 * Owner's own voice recordings, split 2026-10-17 from
 * owner-voice-lesson3-5-lines.mp3 (28.3s, 5 lines in order).
 * See docs/audio/OWNER-RECORDINGS.md for the slot manifest.
 *
 * No TTS, no synthesized voice — these are the owner's recordings only.
 */
export const LESSON3_AUDIO = {
  /** Page 7 instruction line. Wired on the wide page 7. */
  p7Instr: "/audio/leccion3/p7-instr.mp3",
  /** Page 8 instruction line. Wired on the wide page 8. */
  p8Instr: "/audio/leccion3/p8-instr.mp3",
  /** Page 9 first instruction ("Escribe con tu mejor letra."). Slot ready for the page-9 draft. */
  p9Instr1: "/audio/leccion3/p9-instr1.mp3",
  /** Page 9 second instruction ("Haz un dibujo..."). Slot ready for the page-9 draft. */
  p9Instr2: "/audio/leccion3/p9-instr2.mp3",
  /** Correct-answer celebration ("¡Muy bien!"). Slot ready for the draft's success path. */
  muyBien: "/audio/leccion3/muy-bien.mp3",
} as const;

/**
 * Owner's intro line ("Hola, vamos a leer juntos..."). Stored in the repo's
 * audio area per owner order ("just leave it there") — NOT wired anywhere
 * until the owner says where it goes.
 */
export const LESSON3_INTRO_LINE_UNWIRED = "/audio/leccion3/intro-line.mp3";

/** Garden palette for instruction letters — colorful, calm, readable on cream paper. */
export const GARDEN_PALETTE = [
  "#2e7d32", // leaf green
  "#c2185b", // flower pink
  "#1565c0", // sky blue
  "#ef6c00", // marigold orange
  "#6a1b9a", // berry purple
  "#00838f", // pond teal
  "#b71c1c", // poppy red
  "#33691e", // grass green
] as const;
