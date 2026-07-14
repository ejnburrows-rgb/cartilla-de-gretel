import { describe, it, expect } from "vitest";
import { getLetterTemplate, LETTER_TEMPLATES } from "../letter-stroke-templates";
import pageLayouts from "@/data/page-layouts.json";

// Real distinct writing-line modelText values used across the actual 24
// lessons (src/data/page-layouts.json) — recomputed here directly from the
// data file so this test fails the moment new lesson content adds a letter
// this suite doesn't know about, rather than silently going stale.
function realModelTexts(): string[] {
  const pages = (pageLayouts as { pages: Record<string, { regions: Array<Record<string, unknown>> }> }).pages;
  const found = new Set<string>();
  for (const page of Object.values(pages)) {
    for (const region of page.regions) {
      if (region.regionType === "writing-line" && typeof region.modelText === "string" && region.modelText) {
        found.add(region.modelText);
      }
    }
  }
  return [...found];
}

describe("getLetterTemplate — no silent wrong-shape fallback", () => {
  it("Ñ and rr (lowercase digraph) have no template — must return null, never a substitute", () => {
    expect(getLetterTemplate("Ñ")).toBeNull();
    expect(getLetterTemplate("ñ")).toBeNull();
    expect(getLetterTemplate("rr")).toBeNull();
  });

  it("RR (uppercase digraph) traces as the real R template placed twice, not a guessed shape", () => {
    const result = getLetterTemplate("RR");
    expect(result).not.toBeNull();
    expect(result).not.toBe(LETTER_TEMPLATES.A);
    expect(result).not.toBe(LETTER_TEMPLATES.R);
    // 6 strokes: R's own 3 strokes, twice (left copy + right copy).
    expect(result!.length).toBe(LETTER_TEMPLATES.R.length * 2);
    // Every checkpoint in every stroke must fit the SVG viewport (0-100 x 0-120).
    for (const stroke of result!) {
      for (const pt of stroke) {
        expect(pt.x).toBeGreaterThanOrEqual(0);
        expect(pt.x).toBeLessThanOrEqual(100);
        expect(pt.y).toBeGreaterThanOrEqual(0);
        expect(pt.y).toBeLessThanOrEqual(120);
      }
    }
  });

  it("never silently substitutes the 'A' template (or any other letter's template) for a letter with no real template", () => {
    // This is the exact historical regression: tracing used to fall back to
    // drawing the letter "A"'s shape for any letter without a real template.
    const untemplatedLetters = ["Ñ", "ñ", "rr"];
    for (const letter of untemplatedLetters) {
      const result = getLetterTemplate(letter);
      expect(result).not.toBe(LETTER_TEMPLATES.A);
      expect(result).toBeNull();
    }
  });

  it("every real modelText used in the actual 24 lessons either has a genuine matching template or correctly returns null", () => {
    const modelTexts = realModelTexts();
    expect(modelTexts.length).toBeGreaterThan(0); // sanity: the data file loaded and has real content

    for (const text of modelTexts) {
      const result = getLetterTemplate(text);
      if (result === null) {
        // No template yet — acceptable, as long as it's genuinely null and
        // not a fallback masquerading as one.
        continue;
      }
      const isDoubledUpperDigraph =
        text === text.toUpperCase() && text.length === 2 && text[0] === text[1];
      if (isDoubledUpperDigraph) {
        // A doubled-uppercase digraph (RR) is a derived shape, not the base
        // letter's own template object — checked in its own dedicated test.
        continue;
      }
      // If a template IS returned, it must be the template keyed to this
      // exact letter (case-insensitive) — never a different letter's shape.
      const expected = LETTER_TEMPLATES[text.toUpperCase()];
      expect(result).toBe(expected);
    }

    // Lock in the specific known-missing set so this test fails loudly
    // (rather than silently passing) the moment a real ñ/rr (lowercase)
    // template arrives — that's a real content addition to celebrate, not a
    // silent drift. Ñ/ñ and lowercase rr are always missing; lowercase
    // letters whose shape genuinely differs from their uppercase are
    // intentionally untemplated too (see CASE_SHAPE_MATCHES_UPPER) — both are
    // correct nulls, not bugs. Uppercase RR is NOT in this missing set — it's
    // a derived digraph of the real, already-verified R template.
    const CASE_SHAPE_MATCHES_UPPER = new Set(["O", "U", "C", "S", "V", "Z"]);
    const expectedMissing = modelTexts.filter((t) => {
      const isLower = t === t.toLowerCase() && t !== t.toUpperCase();
      return t.toUpperCase() === "Ñ" || (t.toUpperCase() === "RR" && isLower) || (isLower && !CASE_SHAPE_MATCHES_UPPER.has(t.toUpperCase()));
    });
    const missing = modelTexts.filter((t) => getLetterTemplate(t) === null);
    expect(new Set(missing)).toEqual(new Set(expectedMissing));
    // Ñ/ñ and lowercase rr specifically must always be in that missing set;
    // uppercase RR must NOT be (it now has a derived digraph template).
    expect(missing).toEqual(expect.arrayContaining(["Ñ", "ñ", "rr"]));
    expect(missing).not.toEqual(expect.arrayContaining(["RR"]));
  });

  it("lowercase letters with a genuinely different shape than their uppercase (a, e, i, m, p, t, d, l, n, b, r, g, f, j, y) are not templated yet — correctly null, never guessed", () => {
    const untemplatedLowercase = ["a", "e", "i", "m", "p", "t", "d", "l", "n", "b", "r", "g", "f", "j", "y"];
    for (const letter of untemplatedLowercase) {
      expect(getLetterTemplate(letter)).toBeNull();
    }
  });
});
