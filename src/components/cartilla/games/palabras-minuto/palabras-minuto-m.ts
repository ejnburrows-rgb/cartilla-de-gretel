import type { GameContent } from "@/lib/games/gameContent";

// Mm set, word order as in the owner-approved mockup (3 columns, 6 rows, read left to right).
export const PALABRAS_MINUTO_M: GameContent = {
  id: "palabras-minuto-m",
  type: "palabras-por-minuto",
  letter: "m",
  instructions: [
    "¿Cuántas palabras puedo leer por minuto?",
    "Lee cada palabra. Antes de comenzar ajusta el cronómetro.",
  ],
  words: [
    "mamá",
    "mami",
    "Mimo",
    "mío",
    "me",
    "mímame",
    "Momi",
    "Meme",
    "mi",
    "Meme",
    "ama",
    "mía",
    "Mumi",
    "Memo",
    "mima",
    "amo",
    "Mimí",
    "ámame",
  ].map((word) => ({ word, syllables: [word] })),
};
