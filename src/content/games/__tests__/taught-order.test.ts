// taught-order.test.ts — the word-builder must never get ahead of the book.
//
// A child works the cartilla in order. At lesson 8 they have met m and p and
// nothing after. If a tile shows them a syllable from lesson 12, they cannot
// reason about it — they can only guess, and a wrong guess on material nobody
// showed them reads to a five-year-old as failure.
//
// This test walks every game the app can serve and checks every tile against
// the teaching order, which it DERIVES from the canon (`lesson-meta.ts`) rather
// than restating it. A hand-copied list of "allowed" syllables is exactly the
// thing that goes stale the first time the lesson order moves; this cannot,
// because there is only one copy of the order and the test reads it.
//
// Tiles fall into two groups, and they are not the same problem:
//
//   DECOY tiles — tiles no word in the lesson needs. These are pure
//   distractors, chosen by us, and there is no excuse for one from a later
//   lesson. Enforced strictly below: any offender fails the suite.
//
//   WORD tiles — tiles the lesson's own words require. These are forced by the
//   book's word list, which is the owner's alone to set (AGENTS.md). A vowel
//   lesson literally cannot avoid them: "oso" needs `so`, and s is lesson 9.
//   Failing the build over the book's own vocabulary would be wrong, so these
//   are pinned to a reviewed inventory instead — a new one fails, and so does
//   a stale entry. See ACKNOWLEDGED_WORD_TILES.
import { describe, it, expect } from "vitest";
import { LESSONS } from "@/content/lesson-meta";
import { SILABAS_VOCAL_O } from "../syllable-builder-pilot";
import type { GameContent } from "@/lib/games/gameContent";

/** Accents are a reading cue, not a different syllable, for this comparison. */
const bare = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// ---------------------------------------------------------------------------
// The teaching order, read from canon.
// ---------------------------------------------------------------------------

// Lesson 1 ("Las hermanitas vocales") carries `syllables: []` in lesson-meta.ts
// because it introduces no consonant family. It does teach all five vowels: the
// book's own teacher guide for lesson 1 says the children "identificarán y
// leerán las vocales ( a, e, i, o, u )" (src/content/guia/lesson-1.json), and
// src/data/lessons.json calls it the rima "that introduces the five vowels as
// sisters". Lessons 2-6 then take one vowel each for writing practice. Without
// this, the vowel lesson's own decoys would read as violations on a
// technicality — the child has met `a` and `e` by then.
const VOWELS_TAUGHT_IN_LESSON_1 = ["a", "e", "i", "o", "u"];

/** Syllable -> the first lesson number at which the book has taught it. */
const firstTaughtIn = new Map<string, number>();
for (const syllable of VOWELS_TAUGHT_IN_LESSON_1) firstTaughtIn.set(bare(syllable), 1);
for (const lesson of LESSONS) {
  for (const syllable of lesson.syllables) {
    const key = bare(syllable);
    if (!firstTaughtIn.has(key)) firstTaughtIn.set(key, lesson.n);
  }
}

/**
 * Which lesson a game sits at. Derived from the game's own `letter` field
 * against the canon, so a new game placed at "t" resolves to lesson 10 with no
 * edit here. A game covering several letters ("s/m/p") sits at the last of
 * them — that is the earliest point a child has met all of its material.
 */
function lessonOf(game: GameContent): number {
  const letters = game.letter.split("/").map((l) => bare(l.trim()));
  const numbers = letters.map((letter) => {
    const match = LESSONS.find((l) => l.letter !== "—" && bare(l.letter).startsWith(letter));
    return match?.n;
  });
  const resolved = numbers.filter((n): n is number => n !== undefined);
  // Every letter must place, or the game is unreviewable and the test says so.
  expect(
    resolved.length,
    `game "${game.id}" has letter "${game.letter}", which does not match any lesson in lesson-meta.ts`,
  ).toBe(letters.length);
  return Math.max(...resolved);
}

// ---------------------------------------------------------------------------
// Every game the app can serve, found on disk rather than listed by hand.
// ---------------------------------------------------------------------------

const isGameContent = (v: unknown): v is GameContent =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as GameContent).id === "string" &&
  typeof (v as GameContent).letter === "string" &&
  Array.isArray((v as GameContent).words);

// Globbing the folder means a new game file is covered the day it lands, with
// no import to remember here.
const modules = import.meta.glob("../*.ts", { eager: true }) as Record<
  string,
  Record<string, unknown>
>;

const ALL_GAMES: GameContent[] = Object.values(modules)
  .flatMap((mod) => Object.values(mod))
  .flatMap((value) => (Array.isArray(value) ? value : [value]))
  .filter(isGameContent)
  // The pilot array re-exports the same three objects the module exports singly.
  .filter((game, i, all) => all.findIndex((g) => g.id === game.id) === i)
  .sort((a, b) => a.id.localeCompare(b.id));

/** Tiles no word in this game uses — the distractors we chose ourselves. */
const decoysOf = (game: GameContent) => {
  const used = new Set(game.words.flatMap((w) => w.syllables ?? []).map(bare));
  return (game.tiles ?? []).filter((t) => !used.has(bare(t)));
};

/** Tiles this game's own words force it to offer. */
const wordTilesOf = (game: GameContent) => {
  const used = new Set(game.words.flatMap((w) => w.syllables ?? []).map(bare));
  return (game.tiles ?? []).filter((t) => used.has(bare(t)));
};

/** Tiles that belong to a lesson later than the one the game sits at. */
const aheadOfLesson = (tiles: string[], lesson: number) =>
  tiles.filter((t) => {
    const taught = firstTaughtIn.get(bare(t));
    return taught === undefined || taught > lesson;
  });

const describeTile = (t: string) => `${t} (lesson ${firstTaughtIn.get(bare(t)) ?? "never taught"})`;

// ---------------------------------------------------------------------------

describe("word-builder tiles never run ahead of the teaching order", () => {
  it("finds the games to check", () => {
    // Guards the glob itself: if it silently matched nothing, every other
    // assertion below would pass vacuously.
    expect(ALL_GAMES.length).toBeGreaterThan(0);
    expect(ALL_GAMES.every((g) => (g.tiles ?? []).length > 0)).toBe(true);
  });

  it.each(ALL_GAMES.map((g) => [g.id, g] as const))(
    "%s offers no decoy from a later lesson",
    (_id, game) => {
      const lesson = lessonOf(game);
      const offenders = aheadOfLesson(decoysOf(game), lesson);
      expect(
        offenders.map(describeTile),
        `"${game.id}" sits at lesson ${lesson} and offers decoys the child has not been taught`,
      ).toEqual([]);
    },
  );

  // Without this, the rule above could be satisfied by deleting the challenge
  // instead of fixing it. The two archetypes earn their difficulty differently,
  // so the floor is stated per archetype rather than as one blanket rule.
  it.each(ALL_GAMES.map((g) => [g.id, g] as const))(
    "%s still makes the child choose",
    (_id, game) => {
      const tiles = game.tiles ?? [];
      const longestWord = Math.max(...game.words.map((w) => (w.syllables ?? []).length));

      // Every game shows one word at a time against the whole tray, so a tray
      // no bigger than the word is a game with nothing to decide.
      expect(
        tiles.length,
        `${game.id}: tray of ${tiles.length} for a ${longestWord}-syllable word`,
      ).toBeGreaterThan(longestWord);

      // `lectura-silabas` shows a handful of words and leans on tiles that
      // belong to no word at all. `payaso-chano` instead pools the syllables of
      // eight words into one tray — every tile is real for some word and a
      // distractor for the other seven — so it has no standalone decoys by
      // design, and demanding some would be demanding a different game.
      if (game.type === "lectura-silabas") {
        expect(decoysOf(game).length, `${game.id} has no decoys at all`).toBeGreaterThan(0);
      }
    },
  );

  it("keeps the regression that prompted this rule from coming back", () => {
    // `sa` (s, lesson 9) and `lo` (l, lesson 12) were offered as decoys in the
    // vowel lesson, long before either letter is introduced.
    const decoys = decoysOf(SILABAS_VOCAL_O).map(bare);
    expect(decoys).not.toContain("sa");
    expect(decoys).not.toContain("lo");
  });
});

// ---------------------------------------------------------------------------
// The book's own vocabulary, pinned rather than enforced.
// ---------------------------------------------------------------------------

// Every case where a game's word list forces a tile from a later lesson.
// Reviewed 2026-07-29; each is the book's word, and the word lists are the
// owner's to change, not ours. This is a tripwire, not an approval: it fails if
// a NEW one appears (someone added a word that reaches further ahead) and it
// fails if one of these disappears (so the list cannot quietly rot).
//
// The vowel lesson's three are structural — no Spanish word is spellable from
// vowels alone, so a vowel lesson that builds real words must borrow
// consonants. `mono` and `sopa` are not structural: both sit at a consonant
// lesson and reach exactly one lesson ahead, and both are open content
// questions for the owner. See the PR body.
const ACKNOWLEDGED_WORD_TILES: Record<string, string[]> = {
  // lesson 2 (O): oso -> so (9), ola -> la (12), oveja -> ve (16), ja (21)
  "silabas-o": ["so", "la", "ve", "ja"],
  // lesson 7 (M): mono -> no (13)
  "silabas-m": ["no"],
  // lesson 8 (P): sopa -> so (9)
  "silabas-p": ["so"],
  "payaso-chano-ss": [],
};

describe("words that reach past their own lesson stay a known, reviewed set", () => {
  it.each(ALL_GAMES.map((g) => [g.id, g] as const))("%s matches the reviewed list", (_id, game) => {
    const expected = ACKNOWLEDGED_WORD_TILES[game.id];
    expect(
      expected,
      `"${game.id}" is not in ACKNOWLEDGED_WORD_TILES — review its words against the teaching order and add it`,
    ).toBeDefined();

    const actual = aheadOfLesson(wordTilesOf(game), lessonOf(game)).map(bare);
    expect(actual.sort(), `"${game.id}" no longer matches its reviewed word-tile list`).toEqual(
      expected.map(bare).sort(),
    );
  });
});
