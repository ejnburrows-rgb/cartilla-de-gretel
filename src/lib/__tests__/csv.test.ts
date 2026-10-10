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

  it("escapes spreadsheet formula injection characters in string values", () => {
    expect(toCSV([{ v: "=1+1" }])).toBe("v\n'=1+1");
    expect(toCSV([{ v: "@SUM(A1)" }])).toBe("v\n'@SUM(A1)");
    expect(toCSV([{ v: "-2+3" }])).toBe("v\n'-2+3");
    expect(toCSV([{ v: "+123-abc" }])).toBe("v\n'+123-abc");
    expect(toCSV([{ v: "\t=1+1" }])).toBe("v\n'\t=1+1");
    expect(toCSV([{ v: "  =cmd|' /C calc'!A0" }])).toBe("v\n'  =cmd|' /C calc'!A0");
  });

  it("preserves legitimate numeric negative and positive values without formula escaping", () => {
    expect(toCSV([{ score: -5, delta: +5 }])).toBe("score,delta\n-5,5");
    expect(toCSV([{ score: "-5", delta: "+5.5" }])).toBe("score,delta\n-5,+5.5");
    expect(toCSV([{ pct: "-12.34" }])).toBe("pct\n-12.34");
    expect(toCSV([{ val: 0 }, { val: -0 }])).toBe("val\n0\n0");
  });

  it("handles combining quote escaping and formula escaping for strings with commas or quotes", () => {
    expect(toCSV([{ v: '=1,"2"' }])).toBe('v\n"\'=1,""2"""');
  });

  it("preserves headers, Spanish characters, nulls, and ordinary text", () => {
    const csv = toCSV([
      { leccion: 1, titulo: "Lección 1", completada: "sí", nota: -10 },
      { leccion: 2, titulo: "Matemáticas - Nivel 2", completada: "no", nota: null },
    ]);
    expect(csv).toBe(
      "leccion,titulo,completada,nota\n1,Lección 1,sí,-10\n2,Matemáticas - Nivel 2,no,",
    );
  });
});
