import { describe, expect, it } from "vitest";
import { PAYASO_CHANO_SS } from "../payaso-chano-ss";
import { SYLLABLE_BUILDER_PILOT } from "../syllable-builder-pilot";
import { CORE_THEMED_GAMES } from "../core-games";
import type { GameArchetype } from "@/lib/games/gameContent";

const REQUIRED: GameArchetype[] = [
  "payaso-chano",
  "mariposas",
  "juego-vocal",
  "fonetica-completar",
  "lectura-silabas",
  "lectura-rima",
  "palabras-por-minuto",
  "dibujos",
];

const ALL = [PAYASO_CHANO_SS, ...SYLLABLE_BUILDER_PILOT, ...CORE_THEMED_GAMES];

describe("complete themed game set", () => {
  it("ships every declared archetype with playable content", () => {
    const types = new Set(ALL.map((game) => game.type));
    expect(REQUIRED.every((type) => types.has(type))).toBe(true);
    for (const game of ALL) {
      expect(game.id.trim()).not.toBe("");
      expect(game.instructions.length).toBeGreaterThan(0);
      expect(game.words.length).toBeGreaterThan(0);
    }
  });

  it("never duplicates a live game id", () => {
    const ids = ALL.map((game) => game.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses only real illustration paths for picture-based games", () => {
    const pictureGames = ALL.filter((game) => game.type === "juego-vocal" || game.type === "dibujos");
    for (const game of pictureGames) {
      for (const word of game.words) {
        expect(word.imageUrl).toMatch(/^\/cartilla\/art\/faithful\/.+\.webp$/);
      }
    }
  });
});
