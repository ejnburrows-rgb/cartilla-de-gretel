import type { GameContent } from "@/lib/games/gameContent";

const COW_ART = "/cartilla/art/cow/cow.png";

export const COW_GAME_M: GameContent = {
  id: "vaca",
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
