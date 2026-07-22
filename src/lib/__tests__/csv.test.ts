import { describe, it, expect } from "vitest";
import { toCSV } from "../csv";

describe("toCSV", () => {
  it("returns an empty string for no rows", () => {
    expect(toCSV([])).toBe("");
  });

  it("builds a header row from the first object's keys plus one line per row", () => {
    const csv = toCSV([
      { name: "Sofía", score: 9 },
      { name: "Mateo", score: 6 },
    ]);
    expect(csv).toBe("name,score\nSofía,9\nMateo,6");
  });

  it("honors an explicit column order/subset", () => {
    const csv = toCSV([{ a: 1, b: 2, c: 3 }], ["c", "a"]);
    expect(csv).toBe("c,a\n3,1");
  });

  it("renders null/undefined as empty cells", () => {
    const csv = toCSV([{ a: null, b: undefined, c: 0 }]);
    expect(csv).toBe("a,b,c\n,,0");
  });

  it("quotes and escapes fields containing commas, quotes, or newlines", () => {
    expect(toCSV([{ v: "a,b" }])).toBe('v\n"a,b"');
    expect(toCSV([{ v: 'he said "hi"' }])).toBe('v\n"he said ""hi"""');
    expect(toCSV([{ v: "line1\nline2" }])).toBe('v\n"line1\nline2"');
  });
});
