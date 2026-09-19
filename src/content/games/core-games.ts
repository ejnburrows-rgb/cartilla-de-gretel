import type { GameContent } from "@/lib/games/gameContent";

const ART = "/cartilla/art/faithful";
const VOWEL_TRAY = ["a", "e", "i", "o", "u"];

/**
 * Source-backed themed games that complete the eight-archetype Cartilla set.
 * The vocabulary is taken from the owner's Cartilla interactives and existing
 * verified workbook crops. No placeholder image paths are used here.
 */
export const MARIPOSAS_P: GameContent = {
  id: "mariposas-p",
  type: "mariposas",
  letter: "p",
  instructions: [
    "Escucha la palabra.",
    "Presiona la primera sílaba que necesitas para formar la palabra.",
    "Presiona la otra sílaba o las otras sílabas que forman la palabra.",
    "Completa la palabra para que las mariposas regresen al jardín.",
  ],
  words: [
    { word: "papi", syllables: ["pa", "pi"] },
    { word: "papá", syllables: ["pa", "pá"] },
    { word: "pomo", syllables: ["po", "mo"] },
  ],
  tiles: ["pa", "pi", "pá", "po", "mo", "pe", "pu"],
};

export const VOCAL_A: GameContent = {
  id: "vocal-a",
  type: "juego-vocal",
  letter: "a",
  instructions: [
    "Presiona cada dibujo y observa la palabra.",
    "Elige si la palabra comienza con Aa.",
    "El cuadro se marca en verde si está correcto y en rojo si está incorrecto.",
  ],
  words: [
    { word: "abeja", syllables: ["a", "be", "ja"], imageUrl: `${ART}/vocal-a/abeja.webp` },
    { word: "aguja", syllables: ["a", "gu", "ja"], imageUrl: `${ART}/vocal-a/aguja.webp` },
    { word: "oso", syllables: ["o", "so"], imageUrl: `${ART}/vocal-o/oso.webp` },
    { word: "ola", syllables: ["o", "la"], imageUrl: `${ART}/vocal-o/ola.webp` },
    { word: "oveja", syllables: ["o", "ve", "ja"], imageUrl: `${ART}/vocal-o/oveja.webp` },
  ],
  tiles: VOWEL_TRAY,
};

export const FONETICA_P: GameContent = {
  id: "fonetica-p",
  type: "fonetica-completar",
  letter: "p",
  instructions: [
    "¡A completar las palabras!",
    "Observa la palabra incompleta.",
    "Presiona la sílaba correcta para completar la palabra.",
  ],
  words: [
    { word: "papi", syllables: ["pa", "pi"] },
    { word: "papá", syllables: ["pa", "pá"] },
    { word: "pomo", syllables: ["po", "mo"] },
  ],
  tiles: ["pa", "pi", "pá", "po", "mo"],
};

export const RIMA_P: GameContent = {
  id: "rima-p",
  type: "lectura-rima",
  letter: "p",
  instructions: [
    "Lee la palabra modelo.",
    "Busca otra palabra que termine con la misma sílaba.",
    "Presiona la palabra que rima.",
  ],
  words: [
    { word: "papi", syllables: ["pa", "pi"] },
    { word: "Pepi", syllables: ["Pe", "pi"] },
    { word: "Pipo", syllables: ["Pi", "po"] },
    { word: "mapo", syllables: ["ma", "po"] },
  ],
  tiles: ["pa", "pi", "pe", "po", "pu", "ma", "me", "mi", "mo", "mu"],
};

const PPM_WORDS = [
  "papá",
  "Pepi",
  "pomo",
  "papi",
  "puma",
  "yo",
  "Pepe",
  "Mupi",
  "pipa",
  "Pipo",
  "mapa",
  "púa",
  "Pupi",
  "¡upa!",
  "Popi",
  "Mapi",
  "pie",
  "mapo",
];

export const PALABRAS_MINUTO_P: GameContent = {
  id: "palabras-minuto-p",
  type: "palabras-por-minuto",
  letter: "p",
  instructions: [
    "¿Cuántas palabras puedo leer por minuto?",
    "Lee cada palabra.",
    "Antes de comenzar, ajusta el cronómetro y presiona Empezar.",
  ],
  words: PPM_WORDS.map((word) => ({ word, syllables: [word] })),
  tiles: VOWEL_TRAY,
};

export const DIBUJOS_O: GameContent = {
  id: "dibujos-o",
  type: "dibujos",
  letter: "o",
  instructions: [
    "Lee la palabra.",
    "Presiona el dibujo que representa esa palabra.",
    "Continúa hasta completar todos los dibujos.",
  ],
  words: [
    { word: "oso", syllables: ["o", "so"], imageUrl: `${ART}/vocal-o/oso.webp` },
    { word: "ola", syllables: ["o", "la"], imageUrl: `${ART}/vocal-o/ola.webp` },
    { word: "oveja", syllables: ["o", "ve", "ja"], imageUrl: `${ART}/vocal-o/oveja.webp` },
  ],
  tiles: VOWEL_TRAY,
};

export const CORE_THEMED_GAMES: GameContent[] = [
  MARIPOSAS_P,
  VOCAL_A,
  FONETICA_P,
  RIMA_P,
  PALABRAS_MINUTO_P,
  DIBUJOS_O,
];
