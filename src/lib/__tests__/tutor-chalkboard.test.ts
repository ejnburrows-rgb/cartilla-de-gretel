import { describe, expect, it } from "vitest";
import {
  buildChalkboardSequence,
  evaluateChalkboardAtTime,
  splitSpanishSyllables,
} from "../tutor-chalkboard";

describe("tutor-chalkboard", () => {
  it("syllabifies authentic Spanish Cartilla vocabulary accurately", () => {
    expect(splitSpanishSyllables("abeja")).toEqual(["a", "be", "ja"]);
    expect(splitSpanishSyllables("abanico")).toEqual(["a", "ba", "ni", "co"]);
    expect(splitSpanishSyllables("elefante")).toEqual(["e", "le", "fan", "te"]);
    expect(splitSpanishSyllables("oso")).toEqual(["o", "so"]);
    expect(splitSpanishSyllables("escuela")).toEqual(["es", "cue", "la"]);
    expect(splitSpanishSyllables("árbol")).toEqual(["ár", "bol"]);
    expect(splitSpanishSyllables("mariposa")).toEqual(["ma", "ri", "po", "sa"]);
  });

  it("synchronizes write, underline, circle, demonstrate, and erase cleanly with gaze handoff", () => {
    const seq = buildChalkboardSequence({
      text: "abeja",
      focusLetter: "a",
      durationSec: 1.56,
      mode: "model",
      includeEraseAtEnd: true,
    });

    expect(seq.word).toBe("abeja");
    expect(seq.syllables).toEqual(["a", "be", "ja"]);
    expect(seq.focusIndex).toBe(0);

    // Mid-write: Gretel glances toward chalkboard while chalk reveals the word
    const midWrite = evaluateChalkboardAtTime(seq, 0.15, false);
    expect(midWrite.writeProgress).toBeGreaterThan(0);
    expect(midWrite.writeProgress).toBeLessThan(1);
    expect(midWrite.recommendedGaze).toBe("chalkboard-teaching");

    // End-of-phrase / hold: full word visible, arcs complete, gaze back on student
    const nearEnd = evaluateChalkboardAtTime(seq, 1.25, false);
    expect(nearEnd.writeProgress).toBe(1);
    expect(nearEnd.underlineProgress).toBe(1);
    expect(nearEnd.circleProgress).toBe(1);
    expect(nearEnd.recommendedGaze).toBe("student");

    // Erase window at tail
    const erasing = evaluateChalkboardAtTime(seq, 1.48, false);
    expect(erasing.activeAction).toBe("erase");
    expect(erasing.eraseProgress).toBeGreaterThan(0);
  });

  it("shows completed chalk state immediately under reduced-motion", () => {
    const seq = buildChalkboardSequence({
      text: "abanico",
      durationSec: 2.05,
      mode: "model",
    });
    const reduced = evaluateChalkboardAtTime(seq, 0.1, true);
    expect(reduced.writeProgress).toBe(1);
    expect(reduced.underlineProgress).toBe(1);
    expect(reduced.circleProgress).toBe(1);
    expect(reduced.eraseProgress).toBe(0);
    expect(reduced.recommendedGaze).toBe("student");
  });
});
