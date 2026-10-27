import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIdleCallback } from "../useIdleCallback";

describe("useIdleCallback", () => {
  const originalRequestIdleCallback = global.requestIdleCallback;
  const originalCancelIdleCallback = global.cancelIdleCallback;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    global.requestIdleCallback = originalRequestIdleCallback;
    global.cancelIdleCallback = originalCancelIdleCallback;
  });

  it("calls callback via requestIdleCallback if available", () => {
    const requestIdleCallbackMock = vi.fn((cb: IdleRequestCallback) => {
      cb({
        didTimeout: false,
        timeRemaining: () => 1,
      });
      return 1;
    });
    global.requestIdleCallback = requestIdleCallbackMock as unknown as typeof requestIdleCallback;

    const callback = vi.fn();
    renderHook(() => useIdleCallback(callback, 1000));

    expect(requestIdleCallbackMock).toHaveBeenCalledWith(expect.any(Function), {
      timeout: 1000,
    });
    expect(callback).toHaveBeenCalled();
  });

  it("cancels requestIdleCallback on unmount", () => {
    global.requestIdleCallback = vi
      .fn()
      .mockReturnValue(123) as unknown as typeof requestIdleCallback;
    const cancelIdleCallbackMock = vi.fn();
    global.cancelIdleCallback = cancelIdleCallbackMock;

    const { unmount } = renderHook(() => useIdleCallback(vi.fn(), 1000));

    unmount();
    expect(cancelIdleCallbackMock).toHaveBeenCalledWith(123);
  });

  it("falls back to setTimeout if requestIdleCallback is not available", () => {
    global.requestIdleCallback = undefined as unknown as typeof requestIdleCallback;
    const setTimeoutSpy = vi.spyOn(global, "setTimeout");

    const callback = vi.fn();
    renderHook(() => useIdleCallback(callback, 1000));

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1);
    vi.runAllTimers();
    expect(callback).toHaveBeenCalled();
  });

  it("clears timeout on unmount if requestIdleCallback is not available", () => {
    global.requestIdleCallback = undefined as unknown as typeof requestIdleCallback;
    global.cancelIdleCallback = undefined as unknown as typeof cancelIdleCallback;
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    const { unmount } = renderHook(() => useIdleCallback(vi.fn(), 1000));
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("updates callback ref without re-triggering effect", () => {
    global.requestIdleCallback = vi
      .fn()
      .mockReturnValue(1) as unknown as typeof requestIdleCallback;
    global.cancelIdleCallback = vi.fn();

    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(({ cb }) => useIdleCallback(cb, 1000), {
      initialProps: { cb: callback1 },
    });

    rerender({ cb: callback2 });

    expect(global.requestIdleCallback).toHaveBeenCalledTimes(1);

    const runCallback = vi.mocked(global.requestIdleCallback).mock.calls[0][0];
    runCallback({
      didTimeout: false,
      timeRemaining: () => 1,
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });
});
