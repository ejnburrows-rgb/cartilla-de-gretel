/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrefersReducedData } from "../usePrefersReducedData";

describe("usePrefersReducedData", () => {
  let mockMatches: boolean;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;
  let mockAddListener: ReturnType<typeof vi.fn>;
  let mockRemoveListener: ReturnType<typeof vi.fn>;

  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  beforeEach(() => {
    mockMatches = false;
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();
    mockAddListener = vi.fn();
    mockRemoveListener = vi.fn();

    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => {
        if (query === "(prefers-reduced-data: reduce)") {
          return {
            get matches() { return mockMatches; },
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
            addListener: mockAddListener,
            removeListener: mockRemoveListener,
          };
        }
        return {
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
        };
      }),
    });

    // Reset navigator connection properties
    Object.defineProperty(global, "navigator", {
      writable: true,
      value: { ...originalNavigator },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // --- Static Tests ---
  it("should return false when neither saveData nor media query matches", () => {
    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(false);
  });

  it("should return true when navigator.connection.saveData is true", () => {
    (global.navigator as any).connection = { saveData: true };
    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(true);
  });

  it("should return true when navigator.mozConnection.saveData is true", () => {
    (global.navigator as any).mozConnection = { saveData: true };
    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(true);
  });

  it("should return true when navigator.webkitConnection.saveData is true", () => {
    (global.navigator as any).webkitConnection = { saveData: true };
    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(true);
  });

  it("should return true when window.matchMedia matches", () => {
    mockMatches = true;
    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(true);
  });

  // --- Dynamic Event Tests ---
  it("should update state on matchMedia change event (addEventListener)", () => {
    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(false);

    // Verify listener was added
    expect(mockAddEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    // Simulate change event
    const changeHandler = mockAddEventListener.mock.calls[0][1];

    // Update mockMatches instead of redefining matchMedia
    mockMatches = true;

    act(() => {
      changeHandler();
    });

    expect(result.current).toBe(true);
  });

  it("should use addListener/removeListener as fallback for matchMedia", () => {
    // Remove addEventListener/removeEventListener to force fallback
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => {
        if (query === "(prefers-reduced-data: reduce)") {
          return {
            get matches() { return mockMatches; },
            addEventListener: undefined,
            removeEventListener: undefined,
            addListener: mockAddListener,
            removeListener: mockRemoveListener,
          };
        }
        return {
          matches: false,
          addEventListener: undefined,
          removeEventListener: undefined,
          addListener: vi.fn(),
          removeListener: vi.fn(),
        };
      }),
    });

    const { result, unmount } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(false);

    // Verify fallback listener was added
    expect(mockAddListener).toHaveBeenCalledWith(expect.any(Function));

    // Simulate change event
    const changeHandler = mockAddListener.mock.calls[0][0];

    mockMatches = true;

    act(() => {
      changeHandler();
    });
    expect(result.current).toBe(true);

    // Verify fallback listener was removed on unmount
    unmount();
    expect(mockRemoveListener).toHaveBeenCalledWith(changeHandler);
  });

  it("should register and unregister change event for navigator.connection", () => {
    const mockConnAddEventListener = vi.fn();
    const mockConnRemoveEventListener = vi.fn();

    (global.navigator as any).connection = {
      saveData: false,
      addEventListener: mockConnAddEventListener,
      removeEventListener: mockConnRemoveEventListener
    };

    const { result, unmount } = renderHook(() => usePrefersReducedData());

    // Verify connection listener was added
    expect(mockConnAddEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    const changeHandler = mockConnAddEventListener.mock.calls[0][1];

    // Simulate connection change
    (global.navigator as any).connection.saveData = true;
    act(() => {
      changeHandler();
    });

    expect(result.current).toBe(true);

    // Verify listeners removed on unmount
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(mockConnRemoveEventListener).toHaveBeenCalledWith("change", changeHandler);
  });
});