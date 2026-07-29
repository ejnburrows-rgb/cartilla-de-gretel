// A child must never be asked to reject a syllable the book has not taught
// them yet. Rejecting an unknown syllable teaches nothing — it is a guess, and
// a wrong guess on material they were never shown reads to them as failure.
//
// This locks the decoy rule stated in the header of syllable-builder-pilot.ts:
// every tile a lesson's own words do not use must come from a letter family
// already taught by that point.
import { describe, it, expect } from "vitest";
import {
  SILABAS_VOCAL_O,
  SILABAS_M,
  SILABAS_P,
  SYLLABLE_BUILDER_PILOT,
} from "../syllable-builder-pilot";
import type { GameContent } from "@/lib/games/gameContent";

/** Accents are a reading cue, not a different syllable, for this comparison. */
const bare = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const VOWELS = ["a", "e", "i", "o", "u"];

/** ma/me/mi/mo/mu for "m", and so on — the family a lesson introduces. */
const familyOf = (consonant: string) => VOWELS.map((v) => consonant + v);

/**
 * What each pilot lesson is allowed to use as a decoy, in the book's teaching
 * order. The vowel lesson has only the vowels; each consonant lesson adds its
 * own family on top.
 */
const ALLOWED_DECOYS: Record<string, string[]> = {
  "silabas-o": VOWELS,
  "silabas-m": [...VOWELS, ...familyOf("m")],
  "silabas-p": [...VOWELS, ...familyOf("m"), ...familyOf("p")],
};

const decoysOf = (game: GameContent) => {
  const used = new Set(game.words.flatMap((w) => w.syllables ?? []).map(bare));
  return (game.tiles ?? []).filter((t) => !used.has(bare(t)));
};

describe("syllable word-builder — decoys only use already-taught material", () => {
  it.each([
    ["vowel lesson o", SILABAS_VOCAL_O],
    ["m lesson", SILABAS_M],
    ["p lesson", SILABAS_P],
  ])("%s draws every decoy from a taught family", (_label, game) => {
    const allowed = new Set(ALLOWED_DECOYS[game.id].map(bare));
    const offenders = decoysOf(game).filter((d) => !allowed.has(bare(d)));
    expect(offenders, `untaught decoy(s) in ${game.id}: ${offenders.join(", ")}`).toEqual([]);
  });

  it("keeps the regression that prompted this rule from coming back", () => {
    // `sa` (s, lesson 9) and `lo` (l, lesson 11) were offered as decoys in the
    // vowel lesson, well before either letter is introduced.
    const decoys = decoysOf(SILABAS_VOCAL_O).map(bare);
    expect(decoys).not.toContain("sa");
    expect(decoys).not.toContain("lo");
  });

  it("still offers real decoys, so the exercise keeps its difficulty", () => {
    for (const game of SYLLABLE_BUILDER_PILOT) {
      expect(decoysOf(game).length, `${game.id} has no decoys`).toBeGreaterThan(0);
    }
  });

  it("covers every lesson in the pilot, so a new lesson cannot slip past", () => {
    for (const game of SYLLABLE_BUILDER_PILOT) {
      expect(
        ALLOWED_DECOYS[game.id],
        `${game.id} has no taught-family list — add one before shipping it`,
      ).toBeDefined();
    }
  });
});
