import type { GameContent } from "@/lib/games/gameContent";

/** Five unique cows each carry one card to one matching fence slot.
 * Wrong attempts keep the card; right attempts drop it and return home.
 * Audio remains empty until the owner's recordings exist.
 */
export const COW_SLOTS = ["mo", "mu", "ma", "mi", "me"] as const;

// Cow order is the order in the approved mockup: top row, then bottom row.
export const COW_SYLLABLES = ["mu", "mo", "me", "ma", "mi"] as const;

export const COW_GAME_M: GameContent = {
  id: "cow-game-m",
  type: "cow-game",
  letter: "m",
  instructions: ["Coloca cada vaca en su sílaba"],
  words: COW_SYLLABLES.map((syllable) => ({ word: syllable, syllables: [syllable] })),
  tiles: [...COW_SLOTS],
  assets: { board: "/cartilla/art/games/cow/scene.webp" },
};

export const COW_GAMES: GameContent[] = [COW_GAME_M];
