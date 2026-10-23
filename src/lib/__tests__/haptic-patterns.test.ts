import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { triggerHaptic, HAPTIC_PATTERNS } from "../haptic-patterns";

describe("triggerHaptic", () => {
  let vibrateMock: ReturnType<typeof vi.fn>;
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let getItemMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vibrateMock = vi.fn();
    matchMediaMock = vi.fn().mockReturnValue({ matches: false });
    getItemMock = vi.fn().mockReturnValue(null);

    // Mock navigator using Object.defineProperty to avoid issue where stubbing loses original global structure
    Object.defineProperty(global.navigator, "vibrate", {
      value: vibrateMock,
      configurable: true,
      writable: true,
    });

    // Mock window methods directly
    Object.defineProperty(global.window, "matchMedia", {
      value: matchMediaMock,
      configurable: true,
      writable: true,
    });

    Object.defineProperty(global.window, "localStorage", {
      value: { getItem: getItemMock },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("triggers the correct pattern for valid haptic kinds", () => {
    triggerHaptic("tap");
    expect(vibrateMock).toHaveBeenCalledWith(HAPTIC_PATTERNS.tap);

    vibrateMock.mockClear();

    triggerHaptic("success");
    expect(vibrateMock).toHaveBeenCalledWith(HAPTIC_PATTERNS.success);
  });

  it("bails out early and does not throw if navigator.vibrate is missing", () => {
    // Delete the property fully to make "vibrate" in navigator return false
    delete (global.navigator as any).vibrate;

    expect("vibrate" in global.navigator).toBe(false);

    expect(() => triggerHaptic("tap")).not.toThrow();
    // Prove it bailed out early before reaching localStorage
    expect(getItemMock).not.toHaveBeenCalled();
  });

  it('bails out if localStorage "cartilla:haptics:enabled" is "false"', () => {
    getItemMock.mockReturnValue("false");
    triggerHaptic("tap");
    expect(vibrateMock).not.toHaveBeenCalled();
    expect(getItemMock).toHaveBeenCalledWith("cartilla:haptics:enabled");
  });

  it('triggers if localStorage "cartilla:haptics:enabled" is "true"', () => {
    getItemMock.mockReturnValue("true");
    triggerHaptic("tap");
    expect(vibrateMock).toHaveBeenCalledWith(HAPTIC_PATTERNS.tap);
  });

  it("bails out if prefers-reduced-motion is true", () => {
    matchMediaMock.mockReturnValue({ matches: true });
    triggerHaptic("tap");
    expect(vibrateMock).not.toHaveBeenCalled();
    expect(matchMediaMock).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });

  it("suppresses exceptions safely if navigator.vibrate throws an error", () => {
    vibrateMock.mockImplementation(() => {
      throw new Error("vibrate error");
    });

    expect(() => triggerHaptic("tap")).not.toThrow();
    expect(vibrateMock).toHaveBeenCalled();
  });
});
