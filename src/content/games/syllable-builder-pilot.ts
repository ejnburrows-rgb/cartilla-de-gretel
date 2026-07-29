// syllable-builder-pilot.ts — the 3-lesson pilot for the syllable word-builder
// (issue #344, owner decision 2026-07-25).
//
// Scope is deliberately three lessons: one vowel lesson (o) plus the m and p
// lessons — the first consonants the book teaches, and the ones that produce
// the classic first words a child builds (mamá, papá).
//
// ART RULE: `imageUrl` may only point at a crop that is a PASS in
// public/cartilla/art/faithful/qa-results.json. Words whose only crop sits in
// `_needs-recrop/` (pera, manzana) are deliberately NOT included rather than
// wired to a bad image — the exercise shows an honest "pendiente" card for any
// word without art, and a test enforces the PASS rule.
//
// DECOY RULE: a decoy tile — any tile the lesson's own words do not use — may
// only come from letter families the book has already taught by that lesson.
// In practice that means the five vowels, plus the lesson's own consonant
// family (ma/me/mi/mo/mu for the m lesson, pa/pe/pi/po/pu for p). A child must
// never be asked to reject a syllable they have not been taught, because the
// rejection teaches nothing — it is a guess. `__tests__/taught-order.test.ts`
// enforces this so it cannot regress, reading the teaching order out of
// `lesson-meta.ts` rather than keeping a second copy of it here.
//
// This rule previously read "real syllables from the same lesson's own words".
// The vowel lesson broke it in both directions: `sa` and `lo` appear in none of
// its words AND belong to the s and l families, which the book does not reach
// until lessons 9 and 12.
//
// The rule governs DECOYS only. A lesson's own words may still need a syllable
// from later on — "oso" needs `so` (lesson 9) at a lesson-2 vowel lesson — and
// those word lists are the owner's, not ours. The test pins them as a reviewed
// set instead of failing on them.
import type { GameContent } from "@/lib/games/gameContent";

const ART = "/cartilla/art/faithful";

/** Shared wording — one instruction set, so the three lessons read the same. */
const INSTRUCTIONS = [
  "Mira el dibujo y escucha la palabra.",
  "Arrastra las sílabas hasta las casillas, en orden.",
  "Cuando la palabra esté completa, toca Comprobar.",
];

export const SILABAS_VOCAL_O: GameContent = {
  id: "silabas-o",
  type: "lectura-silabas",
  letter: "o",
  instructions: INSTRUCTIONS,
  words: [
    { word: "oso", syllables: ["o", "so"], imageUrl: `${ART}/vocal-o/oso.webp` },
    { word: "ola", syllables: ["o", "la"], imageUrl: `${ART}/vocal-o/ola.webp` },
    { word: "oveja", syllables: ["o", "ve", "ja"], imageUrl: `${ART}/vocal-o/oveja.webp` },
  ],
  // Decoys are the other vowels. This is a vowel lesson, so the five vowels are
  // the only material the child has been taught — all five arrive together in
  // lesson 1, "Las hermanitas vocales". The previous decoys (`sa`, `lo`) came
  // from the s and l families, which the book does not reach until lessons 9
  // and 12.
  tiles: ["o", "so", "la", "ve", "ja", "a", "e"],
};

export const SILABAS_M: GameContent = {
  id: "silabas-m",
  type: "lectura-silabas",
  letter: "m",
  instructions: INSTRUCTIONS,
  words: [
    { word: "mamá", syllables: ["ma", "má"], imageUrl: `${ART}/leccion-7-m/mama.webp` },
    { word: "mono", syllables: ["mo", "no"], imageUrl: `${ART}/leccion-7-m/mono.webp` },
  ],
  tiles: ["ma", "má", "mo", "no", "mi", "me"],
};

export const SILABAS_P: GameContent = {
  id: "silabas-p",
  type: "lectura-silabas",
  letter: "p",
  instructions: INSTRUCTIONS,
  words: [
    { word: "papá", syllables: ["pa", "pá"], imageUrl: `${ART}/leccion-8-p/papa.webp` },
    { word: "sopa", syllables: ["so", "pa"], imageUrl: `${ART}/leccion-9-s/sopa.webp` },
  ],
  tiles: ["pa", "pá", "so", "pe", "pi", "po"],
};

/** The pilot, in teaching order: vowel first, then m, then p. */
export const SYLLABLE_BUILDER_PILOT: GameContent[] = [SILABAS_VOCAL_O, SILABAS_M, SILABAS_P];
