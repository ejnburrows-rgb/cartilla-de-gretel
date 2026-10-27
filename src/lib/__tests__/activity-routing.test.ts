import { describe, expect, it } from "vitest";
import { normalizeActivityId } from "../activity-routing";

describe("normalizeActivityId", () => {
  it("keeps all valid activity ids exactly as provided", () => {
    const validIds = [
      "silabas",
      "palabras",
      "armar",
      "trazar",
      "piano",
      "sonido",
      "espejo",
    ];

    validIds.forEach((id) => {
      expect(normalizeActivityId(id)).toBe(id);
    });
  });

  it("falls back to 'silabas' for unknown string inputs", () => {
    expect(normalizeActivityId("unknown")).toBe("silabas");
    expect(normalizeActivityId("invalid-activity")).toBe("silabas");
  });

  it("falls back to 'silabas' for empty or whitespace strings", () => {
    expect(normalizeActivityId("")).toBe("silabas");
    expect(normalizeActivityId("   ")).toBe("silabas");
  });

  it("falls back to 'silabas' for null", () => {
    expect(normalizeActivityId(null)).toBe("silabas");
  });

  it("falls back to 'silabas' for differently cased valid IDs", () => {
    expect(normalizeActivityId("SILABAS")).toBe("silabas");
    expect(normalizeActivityId("Palabras")).toBe("silabas");
  });
});
