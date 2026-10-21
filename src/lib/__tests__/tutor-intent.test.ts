/**
 * Tutor intent engine tests (GRETEL-TUTOR-BUILD-SPEC §18.3, §18.6).
 *
 * ≥ 40 fixtures covering EVERY row of the §18.3 table, including the
 * command-word aliases, the vowel aliases, distractor routing, and the
 * command-beats-matching precedence.
 */
import { describe, expect, it } from "vitest";
import { findTutorItem, itemsForLesson } from "../tutor-content";
import {
  classifyIntent,
  countsAsAttempt,
  heardVowel,
  COMMAND_PHRASES,
  COMMAND_WORDS,
  VOWEL_ALIASES,
  type Intent,
} from "../tutor-intent";

interface IntentFixture {
  name: string;
  lesson: number;
  target: string;
  transcript: string;
  expect: Intent;
}

/** Every row of the §18.3 table, plus aliases and precedence cases. */
const fixtures: IntentFixture[] = [
  // --- TARGET: the matcher passes -------------------------------------
  { name: "exact word", lesson: 2, target: "oso", transcript: "oso", expect: "TARGET" },
  { name: "capitalization", lesson: 1, target: "oso", transcript: "OSO", expect: "TARGET" },
  { name: "with article", lesson: 2, target: "ola", transcript: "la ola", expect: "TARGET" },
  { name: "in a sentence", lesson: 2, target: "oso", transcript: "es un oso", expect: "TARGET" },
  { name: "in a sentence with article", lesson: 3, target: "abeja", transcript: "es una abeja", expect: "TARGET" },
  { name: "vowel alias oh", lesson: 1, target: "o", transcript: "oh", expect: "TARGET" },
  { name: "vowel accented ó", lesson: 2, target: "o", transcript: "ó", expect: "TARGET" },
  { name: "vowel alias uh", lesson: 1, target: "u", transcript: "uh", expect: "TARGET" },
  { name: "accent-free iman", lesson: 1, target: "imán", transcript: "iman", expect: "TARGET" },
  { name: "accent-free arbol", lesson: 3, target: "árbol", transcript: "arbol", expect: "TARGET" },
  { name: "ñ/n locked pass una", lesson: 1, target: "uña", transcript: "una", expect: "TARGET" },
  { name: "vowel exact in a sentence", lesson: 1, target: "o", transcript: "la vocal o", expect: "TARGET" },
  { name: "vowel alias in a sentence", lesson: 1, target: "a", transcript: "dije ah", expect: "TARGET" },
  { name: "edit-distance pass eso", lesson: 2, target: "oso", transcript: "eso", expect: "TARGET" },
  { name: "target beats command when both present", lesson: 2, target: "oso", transcript: "oso otra vez", expect: "TARGET" },

  // --- CLOSE: failed, within target length + 1, not a distractor ------
  { name: "osito close to oso", lesson: 2, target: "oso", transcript: "osito", expect: "CLOSE" },
  { name: "initial-vowel-drop bico close to abanico", lesson: 1, target: "abanico", transcript: "bico", expect: "CLOSE" },
  { name: "escaleritas close to escalera", lesson: 1, target: "escalera", transcript: "escaleritas", expect: "CLOSE" },
  { name: "avioneta close to avión", lesson: 3, target: "avión", transcript: "avioneta", expect: "CLOSE" },

  // --- OTHER_VOWEL: a different vowel was heard ------------------------
  { name: "a heard for target o", lesson: 1, target: "o", transcript: "a", expect: "OTHER_VOWEL" },
  { name: "a heard for target o (lesson 2, not an item)", lesson: 2, target: "o", transcript: "a", expect: "OTHER_VOWEL" },
  { name: "alias uh heard for target a", lesson: 1, target: "a", transcript: "uh", expect: "OTHER_VOWEL" },
  { name: "alias ii heard for target e", lesson: 1, target: "e", transcript: "ii", expect: "OTHER_VOWEL" },
  { name: "alias he heard for target u", lesson: 1, target: "u", transcript: "he", expect: "OTHER_VOWEL" },

  // --- OTHER_WORD: another lesson/page item ----------------------------
  { name: "same-lesson distractor oreja for oveja", lesson: 2, target: "oveja", transcript: "oreja", expect: "OTHER_WORD" },
  { name: "same-lesson distractor olla for oveja", lesson: 2, target: "oveja", transcript: "olla", expect: "OTHER_WORD" },
  { name: "same-page distractor olla for ojos", lesson: 1, target: "ojos", transcript: "olla", expect: "OTHER_WORD" },
  { name: "hola decodes to ola for target oso", lesson: 2, target: "oso", transcript: "hola", expect: "OTHER_WORD" },
  { name: "single vowel o named for word target oso", lesson: 2, target: "oso", transcript: "o", expect: "OTHER_WORD" },
  { name: "ocho named for target oso", lesson: 2, target: "oso", transcript: "ocho", expect: "OTHER_WORD" },

  // --- REPEAT -----------------------------------------------------------
  { name: "otra vez", lesson: 2, target: "oso", transcript: "otra vez", expect: "REPEAT" },
  { name: "repite", lesson: 2, target: "oso", transcript: "repite", expect: "REPEAT" },
  { name: "de nuevo", lesson: 2, target: "oso", transcript: "de nuevo", expect: "REPEAT" },
  { name: "alias repetir", lesson: 1, target: "a", transcript: "repetir", expect: "REPEAT" },
  { name: "polite otra vez por favor", lesson: 1, target: "a", transcript: "¡Otra vez, por favor!", expect: "REPEAT" },

  // --- DONT_KNOW --------------------------------------------------------
  { name: "no sé", lesson: 1, target: "a", transcript: "no sé", expect: "DONT_KNOW" },
  { name: "accent-free no se", lesson: 1, target: "a", transcript: "no se", expect: "DONT_KNOW" },
  { name: "no lo sé", lesson: 2, target: "oso", transcript: "no lo sé", expect: "DONT_KNOW" },
  { name: "command beats noise reading", lesson: 2, target: "oso", transcript: "no se", expect: "DONT_KNOW" },

  // --- HELP --------------------------------------------------------------
  { name: "ayuda", lesson: 1, target: "a", transcript: "ayuda", expect: "HELP" },
  { name: "ayúdame", lesson: 1, target: "a", transcript: "ayúdame", expect: "HELP" },
  { name: "accent-free ayudame", lesson: 2, target: "oso", transcript: "ayudame", expect: "HELP" },
  { name: "ayuda por favor", lesson: 2, target: "oso", transcript: "ayuda por favor", expect: "HELP" },

  // --- SILENCE ------------------------------------------------------------
  { name: "empty transcript", lesson: 1, target: "a", transcript: "", expect: "SILENCE" },
  { name: "whitespace only", lesson: 2, target: "ocho", transcript: "   ", expect: "SILENCE" },

  // --- NOISE ---------------------------------------------------------------
  { name: "only [unk]", lesson: 1, target: "a", transcript: "[unk]", expect: "NOISE" },
  { name: "several [unk]", lesson: 1, target: "oso", transcript: "unk unk", expect: "NOISE" },
  { name: "filler mmm", lesson: 1, target: "oso", transcript: "mmm", expect: "NOISE" },
  { name: "filler eh for word target", lesson: 1, target: "oso", transcript: "eh", expect: "NOISE" },
  { name: "single consonant", lesson: 2, target: "oso", transcript: "b", expect: "NOISE" },
  { name: "filler hm hm", lesson: 2, target: "ocho", transcript: "hm hm", expect: "NOISE" },

  // --- OFF_SCRIPT ------------------------------------------------------------
  { name: "long unrelated speech", lesson: 1, target: "oso", transcript: "hola como estas hoy", expect: "OFF_SCRIPT" },
  { name: "longer unrelated speech", lesson: 2, target: "oso", transcript: "me gusta jugar en el parque", expect: "OFF_SCRIPT" },
  { name: "single far word carries no target-like token", lesson: 2, target: "oso", transcript: "mariposa", expect: "OFF_SCRIPT" },
  { name: "short unrelated pair beyond close distance", lesson: 2, target: "oso", transcript: "zapatos grandes", expect: "OFF_SCRIPT" },
];

describe("classifyIntent: every §18.3 row", () => {
  it("covers at least 40 fixtures", () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(40);
  });

  it.each(fixtures)("$name", (fixture) => {
    const target = findTutorItem(fixture.lesson, fixture.target);
    const intent = classifyIntent(fixture.transcript, target, itemsForLesson(fixture.lesson));
    expect(intent).toBe(fixture.expect);
  });
});

describe("countsAsAttempt (spec §18.3)", () => {
  it("counts only TARGET/CLOSE/OTHER_VOWEL/OTHER_WORD", () => {
    expect(countsAsAttempt("TARGET")).toBe(true);
    expect(countsAsAttempt("CLOSE")).toBe(true);
    expect(countsAsAttempt("OTHER_VOWEL")).toBe(true);
    expect(countsAsAttempt("OTHER_WORD")).toBe(true);
    expect(countsAsAttempt("REPEAT")).toBe(false);
    expect(countsAsAttempt("DONT_KNOW")).toBe(false);
    expect(countsAsAttempt("HELP")).toBe(false);
    expect(countsAsAttempt("SILENCE")).toBe(false);
    expect(countsAsAttempt("NOISE")).toBe(false);
    expect(countsAsAttempt("OFF_SCRIPT")).toBe(false);
  });
});

describe("command words and aliases (exported)", () => {
  it("carries the spec phrases", () => {
    expect(COMMAND_WORDS.repeat).toContain("otra vez");
    expect(COMMAND_WORDS.repeat).toContain("repite");
    expect(COMMAND_WORDS.repeat).toContain("de nuevo");
    expect(COMMAND_WORDS.dontKnow).toContain("no sé");
    expect(COMMAND_WORDS.help).toContain("ayuda");
    expect(COMMAND_WORDS.help).toContain("ayúdame");
  });

  it("flattens into the grammar phrase list", () => {
    const flat = COMMAND_PHRASES.join(" | ");
    expect(flat).toContain("otra vez");
    expect(flat).toContain("no sé");
    expect(flat).toContain("ayúdame");
  });
});

describe("heardVowel", () => {
  it("detects a plain vowel", () => {
    expect(heardVowel("a")).toBe("a");
  });

  it("detects a vowel alias", () => {
    expect(heardVowel("uh")).toBe("u");
    expect(heardVowel("dije ah")).toBe("a");
  });

  it("returns null for words and silence", () => {
    expect(heardVowel("oso")).toBeNull();
    expect(heardVowel("")).toBeNull();
    expect(heardVowel("mmm")).toBeNull();
  });
});

describe("vowel aliases (exported)", () => {
  it("match the §12 alias table", () => {
    expect(VOWEL_ALIASES.o).toEqual(["oh", "ó", "ou"]);
    expect(VOWEL_ALIASES.a).toEqual(["ah", "ha", "á"]);
    expect(VOWEL_ALIASES.e).toEqual(["eh", "he"]);
    expect(VOWEL_ALIASES.i).toEqual(["y", "hi", "ii"]);
    expect(VOWEL_ALIASES.u).toEqual(["uh", "hu", "ú"]);
  });
});