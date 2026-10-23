import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useIdleCallback } from "../useIdleCallback";

describe("useIdleCallback", () => {
  let originalRequestIdleCallback: unknown;
  let originalCancelIdleCallback: unknown;

  beforeEach(() => {
    vi.useFakeTimers();
    originalRequestIdleCallback = (window as Window & { requestIdleCallback?: unknown })
      .requestIdleCallback;
    originalCancelIdleCallback = (window as Window & { cancelIdleCallback?: unknown })
      .cancelIdleCallback;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    (window as Window & { requestIdleCallback?: unknown }).requestIdleCallback =
      originalRequestIdleCallback;
    (window as Window & { cancelIdleCallback?: unknown }).cancelIdleCallback =
      originalCancelIdleCallback;
  });

  it("should use requestIdleCallback if available", () => {
    const requestIdleCallbackMock = vi.fn((_cb: () => void, _opts?: { timeout: number }) => {
      // Don't call immediately to test the handle assignment
      return 123;
    });
    const cancelIdleCallbackMock = vi.fn();

    (window as Window & { requestIdleCallback?: unknown }).requestIdleCallback =
      requestIdleCallbackMock;
    (window as Window & { cancelIdleCallback?: unknown }).cancelIdleCallback =
      cancelIdleCallbackMock;

    const callback = vi.fn();
    const { unmount } = renderHook(() => useIdleCallback(callback, 3000));

    expect(requestIdleCallbackMock).toHaveBeenCalledTimes(1);
    expect(requestIdleCallbackMock).toHaveBeenCalledWith(expect.any(Function), { timeout: 3000 });

    // Ensure it can be unmounted
    unmount();
    expect(cancelIdleCallbackMock).toHaveBeenCalledTimes(1);
    expect(cancelIdleCallbackMock).toHaveBeenCalledWith(123);
  });

  it("should fall back to setTimeout if requestIdleCallback is not available", () => {
    (window as Window & { requestIdleCallback?: unknown }).requestIdleCallback = undefined;
    (window as Window & { cancelIdleCallback?: unknown }).cancelIdleCallback = undefined;

    const setTimeoutSpy = vi.spyOn(window, "setTimeout");
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

    const callback = vi.fn();
    const { unmount } = renderHook(() => useIdleCallback(callback, 3000));

    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1);

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
  });

  it("should execute the latest callback reference", () => {
    let storedCb: (() => void) | null = null;
    const requestIdleCallbackMock = vi.fn((cb: () => void) => {
      storedCb = cb;
      return 123;
    });
    const cancelIdleCallbackMock = vi.fn();

    (window as Window & { requestIdleCallback?: unknown }).requestIdleCallback =
      requestIdleCallbackMock;
    (window as Window & { cancelIdleCallback?: unknown }).cancelIdleCallback =
      cancelIdleCallbackMock;

    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(({ cb }) => useIdleCallback(cb, 3000), {
      initialProps: { cb: callback1 },
    });

    // Rerender with a new callback
    rerender({ cb: callback2 });

    // Execute the stored callback manually
    if (storedCb) {
      (storedCb as () => void)();
    }

    // callback1 should not be called, callback2 should be called
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
