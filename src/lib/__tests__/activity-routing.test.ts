import { describe, expect, it } from "vitest";
import { normalizeActivityId } from "../activity-routing";

describe("normalizeActivityId", () => {
  it("keeps both new student activity ids", () => {
    expect(normalizeActivityId("sonido")).toBe("sonido");
    expect(normalizeActivityId("espejo")).toBe("espejo");
  });

  it("keeps existing activity ids and safely falls back", () => {
    expect(normalizeActivityId("piano")).toBe("piano");
    expect(normalizeActivityId("unknown")).toBe("silabas");
    expect(normalizeActivityId(null)).toBe("silabas");
  });
});
