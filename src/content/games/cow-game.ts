import type { GameContent } from "@/lib/games/gameContent";

const COW_ART = "/cartilla/art/games/cow.png";

/**
 * Cow game (juego de la vaca) — Mm syllable matching.
 * The cow walks to the fence slot, the fence opens, and the cow stands
 * under its syllable. The child picks the matching syllable tile.
 * Correct: plays "ma" placeholder audio and validates.
 * Wrong: plays moo placeholder audio and the cow returns for a retry.
 *
 * Audio is placeholder-only. No generated voice. Real owner recordings
 * can be wired later via audioUrl on each word.
 */
export const COW_GAME_M: GameContent = {
  id: "cow-game-m",
  type: "cow-game",
  letter: "m",
  instructions: [
    "La vaca camina hasta la cerca.",
    "La cerca se abre y la vaca se para bajo su sílaba.",
    "Presiona la sílaba correcta.",
    "Si aciertas, la vaca dice ma. Si no, la vaca dice muu y regresa.",
  ],
  words: [
    { word: "mamá", syllables: ["ma", "má"], imageUrl: COW_ART },
    { word: "mesa", syllables: ["me", "sa"], imageUrl: COW_ART },
    { word: "mimo", syllables: ["mi", "mo"], imageUrl: COW_ART },
    { word: "mono", syllables: ["mo", "no"], imageUrl: COW_ART },
    { word: "mula", syllables: ["mu", "la"], imageUrl: COW_ART },
  ],
  tiles: ["ma", "me", "mi", "mo", "mu"],
  assets: {
    props: {
      cow: COW_ART,
    },
  },
};

export const COW_GAMES: GameContent[] = [COW_GAME_M];
