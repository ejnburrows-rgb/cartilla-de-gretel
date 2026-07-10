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
  it("Ñ and rr (upper and lower) have no template — must return null, never a substitute", () => {
    expect(getLetterTemplate("Ñ")).toBeNull();
    expect(getLetterTemplate("ñ")).toBeNull();
    expect(getLetterTemplate("RR")).toBeNull();
    expect(getLetterTemplate("rr")).toBeNull();
  });

  it("never silently substitutes the 'A' template (or any other letter's template) for a letter with no real template", () => {
    // This is the exact historical regression: tracing used to fall back to
    // drawing the letter "A"'s shape for any letter without a real template.
    const untemplatedLetters = ["Ñ", "ñ", "RR", "rr"];
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
      // If a template IS returned, it must be the template keyed to this
      // exact letter (case-insensitive) — never a different letter's shape.
      const expected = LETTER_TEMPLATES[text.toUpperCase()];
      expect(result).toBe(expected);
    }

    // Lock in the specific known-missing set so this test fails loudly
    // (rather than silently passing) the moment real Ñ/rr templates arrive —
    // that's a real content addition to celebrate, not a silent drift. The
    // digraphs (Ñ, rr) are always missing; lowercase letters whose shape
    // genuinely differs from their uppercase are intentionally untemplated
    // too (see CASE_SHAPE_MATCHES_UPPER) — both are correct nulls, not bugs.
    const CASE_SHAPE_MATCHES_UPPER = new Set(["O", "U", "C", "S", "V", "Z"]);
    const expectedMissing = modelTexts.filter((t) => {
      const isLower = t === t.toLowerCase() && t !== t.toUpperCase();
      return t.toUpperCase() === "Ñ" || t.toUpperCase() === "RR" || (isLower && !CASE_SHAPE_MATCHES_UPPER.has(t.toUpperCase()));
    });
    const missing = modelTexts.filter((t) => getLetterTemplate(t) === null);
    expect(new Set(missing)).toEqual(new Set(expectedMissing));
    // The digraphs specifically must always be in that missing set.
    expect(missing).toEqual(expect.arrayContaining(["Ñ", "ñ", "RR", "rr"]));
  });

  it("lowercase letters with a genuinely different shape than their uppercase (a, e, i, m, p, t, d, l, n, b, r, g, f, j, y) are not templated yet — correctly null, never guessed", () => {
    const untemplatedLowercase = ["a", "e", "i", "m", "p", "t", "d", "l", "n", "b", "r", "g", "f", "j", "y"];
    for (const letter of untemplatedLowercase) {
      expect(getLetterTemplate(letter)).toBeNull();
    }
  });
});
