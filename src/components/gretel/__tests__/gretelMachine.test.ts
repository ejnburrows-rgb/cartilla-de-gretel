import { describe, it, expect } from "vitest";
import { gretelReducer, canTransition } from "../gretelMachine";
import type { GretelState } from "../gretelMachine";

describe("GretelMachine", () => {
  it("canTransition validates legal transitions", () => {
    expect(canTransition("boot", { type: "INIT" })).toBe(true);
    expect(canTransition("idle", { type: "BLINK" })).toBe(true);
    expect(canTransition("idle", { type: "SETTLE" })).toBe(true);
    expect(canTransition("idle", { type: "SPEAK_START" })).toBe(true);
    expect(canTransition("talking", { type: "SPEAK_STOP" })).toBe(true);
    expect(canTransition("waving", { type: "IDLE" })).toBe(true);
  });

  it("canTransition rejects conflicting gestures while talking", () => {
    expect(canTransition("boot", { type: "IDLE" })).toBe(false);
    expect(canTransition("idle", { type: "SPEAK_STOP" })).toBe(false);
    expect(canTransition("talking", { type: "WAVE" })).toBe(false);
  });

  it("handles legal transitions", () => {
    expect(gretelReducer("boot", { type: "INIT" })).toBe("settling");
    expect(gretelReducer("settling", { type: "IDLE" })).toBe("idle");
    expect(gretelReducer("idle", { type: "SPEAK_START" })).toBe("talking");
    expect(gretelReducer("talking", { type: "SPEAK_STOP" })).toBe("idle");
    expect(gretelReducer("idle", { type: "WAVE" })).toBe("waving");
    expect(gretelReducer("idle", { type: "SETTLE" })).toBe("settling");
    expect(gretelReducer("waving", { type: "SETTLE" })).toBe("settling");
    expect(gretelReducer("idle", { type: "EXIT" })).toBe("exiting");
  });

  it("heals illegal transitions to idle", () => {
    expect(gretelReducer("talking", { type: "WAVE" })).toBe("idle");
  });

  it("handles missing asset recovery", () => {
    expect(gretelReducer("talking", { type: "ASSET_ERROR" })).toBe("error");
    expect(gretelReducer("idle", { type: "ASSET_ERROR" })).toBe("error");
    expect(gretelReducer("blinking", { type: "ASSET_ERROR" })).toBe("error");
    expect(canTransition("error", { type: "ASSET_ERROR" })).toBe(true);
    expect(gretelReducer("error", { type: "ASSET_ERROR" })).toBe("error");
    expect(gretelReducer("error", { type: "RESET" })).toBe("idle");
  });

  it("SPEAK_START + SPEAK_STOP returns to idle", () => {
    let state: GretelState = "idle";
    state = gretelReducer(state, { type: "SPEAK_START" });
    expect(state).toBe("talking");
    state = gretelReducer(state, { type: "SPEAK_STOP" });
    expect(state).toBe("idle");
  });

  it("lets real speech replace active gestures so mouth frames follow audio", () => {
    for (const state of ["waving", "pointing", "cheering", "exiting"] as const) {
      expect(canTransition(state, { type: "SPEAK_START" })).toBe(true);
      expect(gretelReducer(state, { type: "SPEAK_START" })).toBe("talking");
    }
  });
});
