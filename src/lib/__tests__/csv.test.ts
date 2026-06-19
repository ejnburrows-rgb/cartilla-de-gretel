import { describe, it, expect } from "vitest";
import { toCSV } from "@/lib/csv";

describe("toCSV", () => {
  it("returns an empty string for no rows", () => {
    expect(toCSV([])).toBe("");
  });

  it("derives columns from the first row when none are given", () => {
    expect(toCSV([{ name: "Ana", score: 10 }])).toBe("name,score\nAna,10");
  });

  it("emits rows in the requested column order and subset", () => {
    const rows = [
      { name: "Ana", score: 10, extra: "x" },
      { name: "Leo", score: 7, extra: "y" },
    ];
    expect(toCSV(rows, ["score", "name"])).toBe("score,name\n10,Ana\n7,Leo");
  });

  it("quotes values containing commas, quotes, or newlines and doubles inner quotes", () => {
    const rows = [{ note: 'has, comma' }, { note: 'has "quote"' }, { note: "line\nbreak" }];
    expect(toCSV(rows)).toBe('note\n"has, comma"\n"has ""quote"""\n"line\nbreak"');
  });

  it("renders null and undefined as empty cells", () => {
    expect(toCSV([{ a: null, b: undefined, c: 0 }])).toBe("a,b,c\n,,0");
  });

  it("stringifies non-string scalars", () => {
    expect(toCSV([{ ok: true, n: 3.5 }])).toBe("ok,n\ntrue,3.5");
  });
});
