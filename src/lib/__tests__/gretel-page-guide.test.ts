import { describe, expect, it } from "vitest";
import { buildGretelPageLine } from "../gretel-page-guide";

describe("buildGretelPageLine", () => {
  it("uses the exact faithful instruction when the page has one", () => {
    expect(
      buildGretelPageLine(
        [
          { regionType: "title", text: "La vocal O" },
          { regionType: "instruction", text: "Encierra en un círculo la vocal O." },
        ],
        12,
      ),
    ).toBe("Encierra en un círculo la vocal O.");
  });

  it("always gives Gretel a grounded page-specific fallback when no instruction exists", () => {
    expect(buildGretelPageLine([], 19)).toBe(
      "Página 19. Mira con atención y sigue las indicaciones.",
    );
  });
});
