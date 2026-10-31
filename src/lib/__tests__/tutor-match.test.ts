/**
 * Tutor match engine tests (GRETEL-TUTOR-BUILD-SPEC §12).
 *
 * Every fixture in tests/fixtures/tutor-transcripts.json runs against a real
 * derived lesson item, plus dedicated tests for each edit-distance threshold,
 * the distractor rule (which runs first and wins), and normalize().
 */
import { describe, expect, it } from "vitest";
import fixtures from "../../../tests/fixtures/tutor-transcripts.json";
import { findTutorItem } from "../tutor-content";
import { matchTarget, normalize } from "../tutor-match";

type FixtureCase = {
  name: string;
  lesson: number;
  target: string;
  transcript: string;
  alternatives?: string[];
  expect: { pass: boolean; rule: string };
  distance?: number;
  note?: string;
};

const cases = (fixtures as { cases: FixtureCase[] }).cases;

describe("normalize (spec §12)", () => {
  it("lowercases", () => {
    expect(normalize("OSO")).toBe("oso");
  });

  it("strips accents but keeps ñ", () => {
    expect(normalize("imán")).toBe("iman");
    expect(normalize("árbol")).toBe("arbol");
    expect(normalize("ÁRBOL")).toBe("arbol");
    expect(normalize("uña")).toBe("uña");
    expect(normalize("ÑOÑO")).toBe("ñoño");
    expect(normalize("pequeñito")).toBe("pequeñito");
  });

  it("drops punctuation", () => {
    expect(normalize("¡muy bien!")).toBe("muy bien");
    expect(normalize("¿oso?")).toBe("oso");
    expect(normalize("o-h.")).toBe("oh");
  });

  it("collapses spaces and trims", () => {
    expect(normalize("  la   ola  ")).toBe("la ola");
    expect(normalize("   ")).toBe("");
  });
});

describe("matchTarget fixtures (every §12 case)", () => {
  it("covers at least 30 fixtures", () => {
    expect(cases.length).toBeGreaterThanOrEqual(30);
  });

  it.each(cases)("$name", (fixture) => {
    const item = findTutorItem(fixture.lesson, fixture.target);
    const result = matchTarget(item, fixture.transcript, fixture.alternatives);
    expect(result.pass).toBe(fixture.expect.pass);
    expect(result.rule).toBe(fixture.expect.rule);
    if (fixture.distance !== undefined) {
      expect(result.distance).toBe(fixture.distance);
    }
  });
});

describe("edit-distance thresholds (dedicated, spec §12 rule 3)", () => {
  it("accepts distance 1 for 2–5 letter targets", () => {
    expect(matchTarget(findTutorItem(1, "imán"), "imam")).toEqual({
      pass: true,
      rule: "edit-distance",
      distance: 1,
    });
    expect(matchTarget(findTutorItem(2, "oveja"), "ovejo")).toEqual({
      pass: true,
      rule: "edit-distance",
      distance: 1,
    });
  });

  it("rejects distance 2 for 2–5 letter targets", () => {
    const result = matchTarget(findTutorItem(2, "oveja"), "ovaje");
    expect(result.pass).toBe(false);
    expect(result.rule).toBe("none");
    expect(result.distance).toBe(2);
  });

  it("accepts distance 2 for 6+ letter targets", () => {
    expect(matchTarget(findTutorItem(1, "abanico"), "anico")).toEqual({
      pass: true,
      rule: "edit-distance",
      distance: 2,
    });
  });

  it("rejects distance 3 for 6+ letter targets", () => {
    const result = matchTarget(findTutorItem(1, "abanico"), "bico");
    expect(result.pass).toBe(false);
    expect(result.rule).toBe("none");
    expect(result.distance).toBe(3);
  });

  it("never passes a single-letter (vowel) target by edit distance", () => {
    // "aa" is distance 1 from "a", but no rule covers one-letter targets.
    const result = matchTarget(findTutorItem(1, "a"), "aa");
    expect(result.pass).toBe(false);
    expect(result.rule).toBe("none");
  });
});

describe("distractor rule runs first and wins (spec §12)", () => {
  it("rejects 'oreja' for 'oveja' even though it is within the edit threshold", () => {
    const result = matchTarget(findTutorItem(2, "oveja"), "oreja");
    expect(result).toEqual({ pass: false, rule: "none", distance: 1 });
  });

  it("rejects a distractor token buried in a sentence", () => {
    const result = matchTarget(findTutorItem(2, "oveja"), "la oreja");
    expect(result.pass).toBe(false);
    expect(result.rule).toBe("none");
  });

  it("rejects another vowel item said for a vowel target", () => {
    expect(matchTarget(findTutorItem(1, "o"), "a").pass).toBe(false);
  });

  it("locks the ñ/n decision: 'una' passes for 'uña'", () => {
    // 'una' is distance 1 from both 'uña' (target) and 'uno' (same-lesson item).
    // The distractor rule only fails a transcript that equals another item or
    // sits strictly closer to one; a tie does not steal the answer, so the
    // distance-1 edit rule passes it. Locked per §12.
    expect(matchTarget(findTutorItem(1, "uña"), "una")).toEqual({
      pass: true,
      rule: "edit-distance",
      distance: 1,
    });
  });
});

describe("alternatives", () => {
  it("passes when any alternative hypothesis passes", () => {
    expect(matchTarget(findTutorItem(2, "ojos"), "mmm", ["ojos"])).toEqual({
      pass: true,
      rule: "contains",
      distance: 0,
    });
  });

  it("fails when no transcript and no alternative passes", () => {
    expect(matchTarget(findTutorItem(2, "ocho"), "mmm", ["nnn"]).pass).toBe(false);
  });

  it("a distractor-matching primary transcript does not block a passing alternative", () => {
    // "oso" is itself a Lección 2 item, so it is a distractor for "oveja";
    // the alternative "oveja" still rescues the match.
    expect(matchTarget(findTutorItem(2, "oveja"), "oso", ["oveja"])).toEqual({
      pass: true,
      rule: "contains",
      distance: 0,
    });
  });
});