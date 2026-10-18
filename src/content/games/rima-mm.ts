import type { GameContent } from "@/lib/games/gameContent";

/**
 * RIMA_MM — "Vamos a rimar" (Lectura de la rima, Mm).
 *
 * Source: teacher file 6 (6-Lectura_de_la_rima_Mm_9_e7yx.docx) + owner's
 * chosen mockup (issue #877, email "Lectura de la rima (Mm): chosen mockup").
 *
 * The teacher file has NO answer key. Blanks are placeholders — the answer
 * key needs owner confirmation. Do NOT invent or prefill answers.
 */
export interface RimaMmVerse {
  id: string;
  /** Text after the blank, e.g. "me ama" */
  ending: string;
  /** Placeholder answer key — UNCONFIRMED. Set by owner. */
  answerKey: string | null;
}

export const RIMA_MM_VERSES: RimaMmVerse[] = [
  { id: "v1", ending: "me ama", answerKey: null },
  { id: "v2", ending: "a mamá", answerKey: null },
  { id: "v3", ending: "mami", answerKey: null },
  { id: "v4", ending: "más.", answerKey: null },
];

export const RIMA_MM_WORDS = ["Mami", "mímame", "amo", "ámame"] as const;

export const RIMA_MM: GameContent = {
  id: "rima-mm",
  type: "lectura-rima-mm",
  letter: "m",
  instructions: [
    "Lee el verso.",
    "Arrastra la palabra que falta para completarlo.",
    "Si está correcta escucharás un sonido de campana.",
    "Si está incorrecta, la palabra subirá a su lugar.",
  ],
  words: RIMA_MM_WORDS.map((word) => ({ word, syllables: [word] })),
  tiles: [...RIMA_MM_WORDS],
};
