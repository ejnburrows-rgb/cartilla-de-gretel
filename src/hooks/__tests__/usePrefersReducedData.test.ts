/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrefersReducedData } from "../usePrefersReducedData";

describe("usePrefersReducedData Hook", () => {
  let matchMediaMock: {
    matches: boolean;
    addEventListener?: ReturnType<typeof vi.fn>;
    removeEventListener?: ReturnType<typeof vi.fn>;
    addListener?: ReturnType<typeof vi.fn>;
    removeListener?: ReturnType<typeof vi.fn>;
  };
  let connectionMock: {
    saveData: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Reset mocks
    matchMediaMock = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };

    connectionMock = {
      saveData: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // Setup window and navigator
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => {
        if (query === "(prefers-reduced-data: reduce)") {
          return matchMediaMock;
        }
        return {
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      }),
    });

    Object.defineProperty(navigator, "connection", {
      writable: true,
      value: connectionMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return false by default when neither setting is enabled", () => {
    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(false);
  });

  it("should return true initially if navigator.connection.saveData is true", () => {
    connectionMock.saveData = true;
    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(true);
  });

  it("should return true initially if matchMedia matches", () => {
    matchMediaMock.matches = true;
    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(true);
  });

  it("should update state when navigator.connection fires a change event", () => {
    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(false);

    // Get the change handler registered on connection
    const addEventListenerCall = connectionMock.addEventListener.mock.calls.find(
      (call: unknown[]) => call[0] === "change",
    );
    expect(addEventListenerCall).toBeDefined();

    if (addEventListenerCall) {
      const handleChange = addEventListenerCall[1] as () => void;

      act(() => {
        connectionMock.saveData = true;
        handleChange();
      });
    }

    expect(result.current).toBe(true);
  });

  it("should update state when matchMedia fires a change event", () => {
    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(false);

    // Get the change handler registered on matchMedia
    const addEventListenerCall = matchMediaMock.addEventListener!.mock.calls.find(
      (call: unknown[]) => call[0] === "change",
    );
    expect(addEventListenerCall).toBeDefined();

    if (addEventListenerCall) {
      const handleChange = addEventListenerCall[1] as () => void;

      act(() => {
        matchMediaMock.matches = true;
        handleChange();
      });
    }

    expect(result.current).toBe(true);
  });

  it("should use addListener/removeListener for older browsers on matchMedia", () => {
    matchMediaMock.addEventListener = undefined;
    matchMediaMock.removeEventListener = undefined;

    const { unmount } = renderHook(() => usePrefersReducedData());

    expect(matchMediaMock.addListener).toHaveBeenCalled();

    unmount();

    expect(matchMediaMock.removeListener).toHaveBeenCalled();
  });

  it("should handle missing navigator.connection gracefully", () => {
    Object.defineProperty(navigator, "connection", {
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(false);
  });

  it("should fallback to mozConnection or webkitConnection if available", () => {
    Object.defineProperty(navigator, "connection", {
      writable: true,
      value: undefined,
    });

    Object.defineProperty(navigator, "mozConnection", {
      writable: true,
      configurable: true,
      value: { ...connectionMock, saveData: true },
    });

    const { result } = renderHook(() => usePrefersReducedData());
    expect(result.current).toBe(true);

    // Clean up
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).mozConnection;
  });

  it.todo("should handle SSR context correctly", () => {
    // Testing SSR context (where typeof window === "undefined") within JSDOM using @testing-library/react
    // is difficult as React requires `window` for rendering.
    // This should potentially be covered in a separate e2e or unit test running in a Node environment.
  });

  it("should clean up event listeners on unmount", () => {
    const { unmount } = renderHook(() => usePrefersReducedData());

    unmount();

    expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(connectionMock.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
