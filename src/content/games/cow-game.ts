import type { GameContent } from "@/lib/games/gameContent";

/**
 * Cow game (juego de la vaca), Mm set. Owner-approved mockup, 2026-10-19:
 * 8 cows each carry a syllable, a wooden fence has 5 labeled slots.
 * The child picks a cow and a slot; the cow walks to the fence, the slot
 * opens and the cow stands in it. Right slot: it says "ma ma" and stays.
 * Wrong slot: it moos and walks back to try again.
 *
 * Audio is empty on purpose (gap manifest only, see cow-game-audio-gaps.ts).
 * No generated voice.
 */
export const COW_SLOTS = ["mo", "mu", "ma", "mi", "me"] as const;

// Cow order is the order in the approved mockup: top row, then bottom row.
export const COW_SYLLABLES = ["mu", "mo", "me", "má", "ma", "mi", "mo", "mo"] as const;

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
