import { describe, it, expect } from "vitest";
import { getLetterTemplate, LETTER_TEMPLATES } from "../letter-stroke-templates";
import pageLayouts from "@/data/page-layouts.json";

// Real distinct writing-line modelText values used across the actual 24
// lessons (src/data/page-layouts.json) — recomputed here directly from the
// data file so this test fails the moment new lesson content adds a letter
// this suite doesn't know about, rather than silently going stale.
function realModelTexts(): string[] {
  const pages = (
    pageLayouts as { pages: Record<string, { regions: Array<Record<string, unknown>> }> }
  ).pages;
  const found = new Set<string>();
  for (const page of Object.values(pages)) {
    for (const region of page.regions) {
      if (
        region.regionType === "writing-line" &&
        typeof region.modelText === "string" &&
        region.modelText
      ) {
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

  it("does not synthesize capital RR: the Workbook prints only lowercase rr", () => {
    for (const text of ["RR", "rr", "Rr", "rR"]) {
      expect(getLetterTemplate(text)).toBeNull();
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
      // If a template IS returned, it must be the template keyed to this
      // exact letter (case-insensitive) — never a different letter's shape.
      const expected = LETTER_TEMPLATES[text.toUpperCase()];
      expect(result).toBe(expected);
    }

    // Explicit source-audited sets, not a copy of the implementation's filter.
    // Any new guided path or curriculum model must be reviewed deliberately.
    const expectedMissing = [
      "Ñ",
      "ñ",
      "rr",
      "Z",
      "z",
      "a",
      "e",
      "i",
      "o",
      "u",
      "m",
      "p",
      "t",
      "d",
      "l",
      "n",
      "b",
      "v",
      "r",
      "g",
      "f",
      "j",
      "y",
    ];
    const expectedGuided = [
      "O",
      "A",
      "E",
      "I",
      "U",
      "M",
      "P",
      "S",
      "T",
      "D",
      "L",
      "N",
      "B",
      "V",
      "R",
      "G",
      "F",
      "J",
      "C",
      "Y",
      "s",
      "c",
    ];
    expect(new Set(modelTexts)).toEqual(new Set([...expectedMissing, ...expectedGuided]));
    const missing = modelTexts.filter((t) => getLetterTemplate(t) === null);
    expect(new Set(missing)).toEqual(new Set(expectedMissing));
    expect(missing).toEqual(expect.arrayContaining(["Ñ", "ñ", "rr", "Z", "z", "o", "u", "v"]));
    expect(missing).not.toEqual(expect.arrayContaining(["RR"]));
  });

  it("lowercase letters without their own verified implementation stay freehand, never capital fallbacks", () => {
    const untemplatedLowercase = [
      "a",
      "e",
      "i",
      "o",
      "u",
      "m",
      "p",
      "t",
      "d",
      "l",
      "n",
      "b",
      "v",
      "r",
      "g",
      "f",
      "j",
      "y",
      "z",
      "ñ",
      "rr",
    ];
    for (const letter of untemplatedLowercase) {
      expect(getLetterTemplate(letter)).toBeNull();
    }
  });
});

// Frozen numeric fixtures: the nine P0 specifications are taken verbatim from
// the completed printed-Workbook audit. Untouched strokes in A/M/N and the
// already-verified templates are pinned to main, not read back from the code.
const AUDITED_P0_PATHS: Record<string, Array<Array<[number, number]>>> = {
  O: [
    [
      [72, 27],
      [50, 20],
      [25, 25],
      [20, 60],
      [25, 95],
      [50, 100],
      [75, 95],
      [80, 60],
      [72, 27],
    ],
  ],
  A: [
    [
      [50, 20],
      [35, 60],
      [20, 100],
    ],
    [
      [80, 100],
      [65, 60],
      [50, 20],
    ],
    [
      [30, 65],
      [50, 65],
      [70, 65],
    ],
  ],
  M: [
    [
      [20, 20],
      [20, 60],
      [20, 100],
    ],
    [
      [20, 20],
      [35, 60],
      [50, 100],
    ],
    [
      [50, 100],
      [65, 60],
      [80, 20],
    ],
    [
      [80, 20],
      [80, 60],
      [80, 100],
    ],
  ],
  N: [
    [
      [25, 20],
      [25, 60],
      [25, 100],
    ],
    [
      [25, 20],
      [50, 60],
      [75, 100],
    ],
    [
      [75, 100],
      [75, 60],
      [75, 20],
    ],
  ],
  T: [
    [
      [50, 20],
      [50, 100],
    ],
    [
      [30, 20],
      [50, 20],
      [70, 20],
    ],
  ],
  V: [
    [
      [20, 20],
      [35, 60],
      [50, 100],
    ],
    [
      [50, 100],
      [65, 60],
      [80, 20],
    ],
  ],
  G: [
    [
      [70, 30],
      [50, 20],
      [30, 40],
      [30, 80],
      [50, 100],
      [70, 95],
      [72, 62],
    ],
    [
      [72, 62],
      [50, 62],
    ],
  ],
  Y: [
    [
      [20, 20],
      [35, 40],
      [50, 60],
    ],
    [
      [80, 20],
      [65, 40],
      [50, 60],
    ],
    [
      [50, 60],
      [50, 80],
      [50, 100],
    ],
  ],
  J: [
    [
      [65, 20],
      [65, 60],
      [65, 82],
      [55, 98],
      [40, 98],
      [30, 85],
      [30, 77],
    ],
  ],
};

const UNCHANGED_VERIFIED_PATHS: Record<string, Array<Array<[number, number]>>> = {
  E: [
    [
      [30, 20],
      [30, 60],
      [30, 100],
    ],
    [
      [30, 20],
      [55, 20],
      [70, 20],
    ],
    [
      [30, 60],
      [50, 60],
      [65, 60],
    ],
    [
      [30, 100],
      [55, 100],
      [70, 100],
    ],
  ],
  I: [
    [
      [50, 20],
      [50, 60],
      [50, 100],
    ],
    [
      [35, 20],
      [50, 20],
      [65, 20],
    ],
    [
      [35, 100],
      [50, 100],
      [65, 100],
    ],
  ],
  U: [
    [
      [25, 20],
      [25, 70],
      [32, 95],
      [50, 100],
      [68, 95],
      [75, 70],
      [75, 20],
    ],
  ],
  P: [
    [
      [30, 20],
      [30, 60],
      [30, 100],
    ],
    [
      [30, 20],
      [55, 20],
      [65, 35],
      [55, 50],
      [30, 50],
    ],
  ],
  S: [
    [
      [70, 30],
      [50, 20],
      [30, 30],
      [30, 48],
      [50, 60],
      [70, 72],
      [70, 90],
      [50, 100],
      [30, 90],
    ],
  ],
  L: [
    [
      [35, 20],
      [35, 60],
      [35, 100],
    ],
    [
      [35, 100],
      [55, 100],
      [70, 100],
    ],
  ],
  D: [
    [
      [30, 20],
      [30, 60],
      [30, 100],
    ],
    [
      [30, 20],
      [55, 20],
      [70, 40],
      [70, 80],
      [55, 100],
      [30, 100],
    ],
  ],
  R: [
    [
      [30, 20],
      [30, 60],
      [30, 100],
    ],
    [
      [30, 20],
      [55, 20],
      [65, 35],
      [55, 50],
      [30, 50],
    ],
    [
      [30, 50],
      [50, 75],
      [70, 100],
    ],
  ],
  C: [
    [
      [70, 30],
      [50, 20],
      [32, 40],
      [32, 80],
      [50, 100],
      [70, 90],
    ],
  ],
  B: [
    [
      [30, 20],
      [30, 60],
      [30, 100],
    ],
    [
      [30, 20],
      [55, 20],
      [60, 35],
      [50, 50],
      [30, 50],
    ],
    [
      [30, 50],
      [55, 50],
      [65, 70],
      [55, 100],
      [30, 100],
    ],
  ],
  F: [
    [
      [30, 20],
      [30, 60],
      [30, 100],
    ],
    [
      [30, 20],
      [55, 20],
      [70, 20],
    ],
    [
      [30, 55],
      [50, 55],
      [65, 55],
    ],
  ],
};

const UNCHANGED_GAME_ONLY_PATHS: Record<string, Array<Array<[number, number]>>> = {
  H: [
    [
      [25, 20],
      [25, 60],
      [25, 100],
    ],
    [
      [75, 20],
      [75, 60],
      [75, 100],
    ],
    [
      [25, 60],
      [50, 60],
      [75, 60],
    ],
  ],
  K: [
    [
      [30, 20],
      [30, 60],
      [30, 100],
    ],
    [
      [65, 20],
      [45, 50],
      [30, 60],
    ],
    [
      [30, 60],
      [45, 70],
      [70, 100],
    ],
  ],
  Z: [
    [
      [25, 20],
      [50, 20],
      [75, 20],
      [50, 60],
      [25, 100],
      [50, 100],
      [75, 100],
    ],
  ],
};

function asCoordinates(strokes: (typeof LETTER_TEMPLATES)[string]) {
  return strokes.map((stroke) => stroke.map(({ x, y }) => [x, y]));
}

describe("printed Workbook source-verified stroke regressions", () => {
  it.each(Object.entries(AUDITED_P0_PATHS))(
    "%s matches every audited checkpoint, stroke count and order",
    (letter, expected) => {
      const strokes = getLetterTemplate(letter);
      expect(strokes).not.toBeNull();
      expect(asCoordinates(strokes!)).toEqual(expected);
    },
  );

  it("O starts upper-right and travels counterclockwise in the SVG's downward-y coordinates", () => {
    const [stroke] = getLetterTemplate("O")!;
    expect(stroke[0]).toEqual({ x: 72, y: 27 });
    expect(stroke.at(-1)).toEqual(stroke[0]);
    const twiceSignedArea = stroke.slice(1).reduce((sum, point, index) => {
      const previous = stroke[index];
      return sum + previous.x * point.y - point.x * previous.y;
    }, 0);
    // Negative signed area is counterclockwise on a screen (y increases down).
    expect(twiceSignedArea).toBeLessThan(0);
  });

  it("A stroke 2 runs lower-right to apex; strokes 1 and 3 are unchanged", () => {
    expect(getLetterTemplate("A")![1]).toEqual([
      { x: 80, y: 100 },
      { x: 65, y: 60 },
      { x: 50, y: 20 },
    ]);
  });

  it.each(["M", "N"])("%s stroke 1 runs vertically downward", (letter) => {
    const stroke = getLetterTemplate(letter)![0];
    expect(stroke.map(({ y }) => y)).toEqual([20, 60, 100]);
    expect(new Set(stroke.map(({ x }) => x)).size).toBe(1);
  });

  it("T draws the vertical before the crossbar", () => {
    expect(asCoordinates(getLetterTemplate("T")!)).toEqual([
      [
        [50, 20],
        [50, 100],
      ],
      [
        [30, 20],
        [50, 20],
        [70, 20],
      ],
    ]);
  });

  it.each([
    ["V", 2],
    ["G", 2],
    ["Y", 3],
  ] as const)("%s has %i separate strokes", (letter, count) => {
    expect(getLetterTemplate(letter)).toHaveLength(count);
  });

  it("J has a single hooked stem, with no horizontal top-bar stroke", () => {
    const strokes = getLetterTemplate("J")!;
    expect(strokes).toHaveLength(1);
    expect(strokes[0].filter(({ y }) => y === 20)).toEqual([{ x: 65, y: 20 }]);
  });

  it.each(Object.entries(UNCHANGED_VERIFIED_PATHS))(
    "already-verified %s is unchanged",
    (letter, expected) => {
      expect(asCoordinates(getLetterTemplate(letter)!)).toEqual(expected);
    },
  );

  it.each(["s", "c"])("already-verified lowercase %s remains guided and unchanged", (letter) => {
    expect(getLetterTemplate(letter)).toBe(LETTER_TEMPLATES[letter.toUpperCase()]);
    expect(asCoordinates(getLetterTemplate(letter)!)).toEqual(
      UNCHANGED_VERIFIED_PATHS[letter.toUpperCase()],
    );
  });

  it.each(["Z", "z", " Z ", " z "])(
    "Workbook %s is freehand until printed page 87 is verified",
    (letter) => {
      expect(getLetterTemplate(letter)).toBeNull();
    },
  );

  it.each(Object.entries(UNCHANGED_GAME_ONLY_PATHS))(
    "game-only %s remains available and unchanged",
    (letter, expected) => {
      expect(asCoordinates(LETTER_TEMPLATES[letter])).toEqual(expected);
    },
  );

  it("all retained template checkpoints fit the 100 by 120 viewport", () => {
    for (const strokes of Object.values(LETTER_TEMPLATES)) {
      for (const point of strokes.flat()) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(100);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(120);
      }
    }
  });
});
