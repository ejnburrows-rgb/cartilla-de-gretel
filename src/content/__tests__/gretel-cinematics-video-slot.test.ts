import { describe, expect, it, vi } from "vitest";

// Test-only registry stand-in: no media is produced, registered, or
// substituted for owner assets. Pins the slot-resolution mechanism the
// owner's welcome video will flow through when the specialist registers it.
vi.mock("@/data/gretel-approved-clips.json", () => ({
  default: {
    "master-welcome": {
      mp4: "/test-only/welcome.mp4",
      webm: "/test-only/welcome.webm",
      poster: "/test-only/welcome-poster.webp",
    },
  },
}));

import { GRETEL_CINEMATICS, getCinematicById } from "@/content/gretel-cinematics";

describe("welcome video slot wiring", () => {
  it("resolves a registered master-welcome clip onto the welcome cinematic", () => {
    const welcome = getCinematicById("master-welcome");
    expect(welcome).not.toBeNull();
    expect(welcome?.kind).toBe("welcome");
    expect(welcome?.video).toEqual({
      mp4: "/test-only/welcome.mp4",
      webm: "/test-only/welcome.webm",
      poster: "/test-only/welcome-poster.webp",
    });
  });

  it("leaves every other cinematic on the approved still when only the welcome clip is registered", () => {
    for (const item of GRETEL_CINEMATICS) {
      if (item.id === "master-welcome") continue;
      expect(item.video).toBeUndefined();
    }
  });

  it("keeps the welcome slot keyed to the stable master-welcome id", () => {
    const ids = GRETEL_CINEMATICS.filter((item) => item.kind === "welcome").map((item) => item.id);
    expect(ids).toEqual(["master-welcome"]);
  });
});
