import { describe, expect, it } from "vitest";
import { resolveEmergentArt } from "@/lib/emergent-art";

describe("repository-verified faithful artwork", () => {
  it("keeps the source-verified iglesia crop visible", () => {
    const path = "/cartilla/art/faithful/vocal-i/iglesia.webp";
    expect(resolveEmergentArt("iglesia", path)).toBe(path);
  });

  it("still blocks unverified emergent substitutions", () => {
    expect(resolveEmergentArt("iglesia", "/cartilla/art/emergent/i_4.png")).toBeUndefined();
  });
});
