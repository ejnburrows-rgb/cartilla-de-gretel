import { describe, it, expect, vi, afterEach } from "vitest";
import { defaultDibujaMode, detectTouchCapable } from "../pointer-policy";

describe("pointer-policy", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects coarse pointer as touch-capable", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: q.includes("pointer: coarse") || q.includes("any-pointer: coarse"),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    expect(detectTouchCapable()).toBe(true);
    expect(defaultDibujaMode()).toBe("draw");
  });

  it("defaults to pick on fine pointer without touch", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: false,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    Object.defineProperty(navigator, "maxTouchPoints", { configurable: true, value: 0 });
    expect(detectTouchCapable()).toBe(false);
    expect(defaultDibujaMode()).toBe("pick");
  });
});
