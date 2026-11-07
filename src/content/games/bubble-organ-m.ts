import type { GameContent } from "@/lib/games/gameContent";

/** Lesson 7 Mm activity, adapted from the existing Lovable Bubble Organ prototype.
 * No device TTS and no substituted illustrations. Original artwork is pending exact export.
 */
export const BUBBLE_ORGAN_M: GameContent = {
  id: "bubble-organ-m",
  type: "bubble-organ",
  letter: "m",
  instructions: [
    "Toca los tubos ma, me, mi, mo y mu para hacer burbujas.",
    "Toca una burbuja para hacerla estallar.",
    "Toca ma dos veces para unir las burbujas y formar mamá.",
    "Presiona Otra vez para jugar de nuevo.",
  ],
  words: [{ word: "mamá", syllables: ["ma", "má"] }],
  tiles: ["ma", "me", "mi", "mo", "mu"],
};
