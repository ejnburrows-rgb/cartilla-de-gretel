/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrefersReducedData } from "../usePrefersReducedData";

describe("usePrefersReducedData Hook", () => {
  let originalNavigator: Navigator;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalNavigator = window.navigator;
    originalMatchMedia = window.matchMedia;

    // Default mocks
    Object.defineProperty(window, "navigator", {
      value: { ...originalNavigator },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  // We need to keep a reference to the active mock media object
  // because the hook captures it in a closure in useEffect
  let activeMockMatchMedia: any;

  const setupMatchMedia = (
    matches: boolean,
    addEventListener?: ReturnType<typeof vi.fn>,
    addListener?: ReturnType<typeof vi.fn>,
    removeEventListener?: ReturnType<typeof vi.fn>,
    removeListener?: ReturnType<typeof vi.fn>
  ) => {
    const mockMatchMediaFn = vi.fn().mockImplementation((query) => {
       const mockMedia = {
        matches,
        media: query,
        onchange: null,
        addListener: addListener || vi.fn(),
        removeListener: removeListener || vi.fn(),
        addEventListener: addEventListener || vi.fn(),
        removeEventListener: removeEventListener || vi.fn(),
        dispatchEvent: vi.fn(),
      };
      // Keep a reference to the latest created mock
      activeMockMatchMedia = mockMedia;
      return mockMedia;
    });
    window.matchMedia = mockMatchMediaFn;
    return mockMatchMediaFn;
  };

  it("should return false by default when neither reduced data nor save data is preferred", () => {
    setupMatchMedia(false);

    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(false);
  });

  it("should return true when matchMedia indicates prefers-reduced-data: reduce", () => {
    setupMatchMedia(true);

    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(true);
  });

  it("should return true when navigator.connection.saveData is true", () => {
    setupMatchMedia(false);
    Object.defineProperty(window.navigator, "connection", {
      value: { saveData: true },
      writable: true,
    });

    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(true);
  });

  it("should support mozConnection fallback", () => {
    setupMatchMedia(false);
    (window.navigator as any).mozConnection = { saveData: true };

    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(true);
  });

  it("should support webkitConnection fallback", () => {
    setupMatchMedia(false);
    (window.navigator as any).webkitConnection = { saveData: true };

    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(true);
  });

  it("should handle changes to media query", () => {
    let changeHandler: EventListener | null = null;
    const mockAddEventListener = vi.fn().mockImplementation((event, handler) => {
      if (event === "change") changeHandler = handler;
    });

    setupMatchMedia(false, mockAddEventListener);

    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(false);

    // Simulate matchMedia change
    act(() => {
      // The hook captured the mediaQuery object, so we need to mutate matches on that object
      activeMockMatchMedia.matches = true;
      if (changeHandler) {
        changeHandler(new Event("change"));
      }
    });

    expect(result.current).toBe(true);
  });

  it("should fallback to addListener for media query changes", () => {
    let changeHandler: EventListener | null = null;
    const mockAddListener = vi.fn().mockImplementation((handler) => {
      changeHandler = handler;
    });

    // Explicitly do not provide addEventListener to force fallback
    const mockMatchMedia = vi.fn().mockImplementation((query) => {
       const mockMedia = {
        matches: false,
        media: query,
        onchange: null,
        addListener: mockAddListener,
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
      activeMockMatchMedia = mockMedia;
      return mockMedia;
    });
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(false);
    expect(mockAddListener).toHaveBeenCalled();
  });

  it("should handle changes to navigator.connection", () => {
    setupMatchMedia(false);
    let changeHandler: EventListener | null = null;
    const mockAddEventListener = vi.fn().mockImplementation((event, handler) => {
      if (event === "change") changeHandler = handler;
    });

    Object.defineProperty(window.navigator, "connection", {
      value: {
        saveData: false,
        addEventListener: mockAddEventListener
      },
      writable: true,
    });

    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(false);

    // Simulate connection change
    act(() => {
      // Re-define connection to mock the updated state
      // since the handler retrieves getConnection() each time
      Object.defineProperty(window.navigator, "connection", {
        value: { saveData: true },
        writable: true,
      });
      if (changeHandler) {
        changeHandler(new Event("change"));
      }
    });

    expect(result.current).toBe(true);
  });

  it("should clean up event listeners on unmount", () => {
    const mockRemoveEventListener = vi.fn();
    const mockConnRemoveEventListener = vi.fn();

    setupMatchMedia(false, vi.fn(), vi.fn(), mockRemoveEventListener, vi.fn());

    Object.defineProperty(window.navigator, "connection", {
      value: {
        saveData: false,
        addEventListener: vi.fn(),
        removeEventListener: mockConnRemoveEventListener
      },
      writable: true,
    });

    const { unmount } = renderHook(() => usePrefersReducedData());
    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(mockConnRemoveEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  it("should clean up with removeListener fallback on unmount", () => {
    const mockRemoveListener = vi.fn();

    // Explicitly do not provide addEventListener/removeEventListener to force fallback
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: mockRemoveListener,
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    const { unmount } = renderHook(() => usePrefersReducedData());
    unmount();

    expect(mockRemoveListener).toHaveBeenCalledWith(expect.any(Function));
  });
});
