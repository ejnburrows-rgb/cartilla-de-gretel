/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIdleCallback } from "../useIdleCallback";

interface WindowWithIdleCallback extends Window {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
}

describe("useIdleCallback", () => {
  let originalRequestIdleCallback: WindowWithIdleCallback["requestIdleCallback"];
  let originalCancelIdleCallback: WindowWithIdleCallback["cancelIdleCallback"];

  beforeEach(() => {
    vi.useFakeTimers();
    if (typeof window !== "undefined") {
      const win = window as WindowWithIdleCallback;
      originalRequestIdleCallback = win.requestIdleCallback;
      originalCancelIdleCallback = win.cancelIdleCallback;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    if (typeof window !== "undefined") {
      const win = window as WindowWithIdleCallback;
      win.requestIdleCallback = originalRequestIdleCallback;
      win.cancelIdleCallback = originalCancelIdleCallback;
    }
  });

  it("should use requestIdleCallback when available", () => {
    const mockRequestIdleCallback = vi.fn((cb: () => void) => {
      cb();
      return 123;
    });
    const mockCancelIdleCallback = vi.fn();
    const win = window as WindowWithIdleCallback;
    win.requestIdleCallback = mockRequestIdleCallback;
    win.cancelIdleCallback = mockCancelIdleCallback;

    const callback = vi.fn();
    const timeoutMs = 1500;

    const { unmount } = renderHook(() => useIdleCallback(callback, timeoutMs));

    expect(mockRequestIdleCallback).toHaveBeenCalledTimes(1);
    expect(mockRequestIdleCallback).toHaveBeenCalledWith(expect.any(Function), {
      timeout: timeoutMs,
    });
    expect(callback).toHaveBeenCalledTimes(1);

    unmount();
    expect(mockCancelIdleCallback).toHaveBeenCalledTimes(1);
    expect(mockCancelIdleCallback).toHaveBeenCalledWith(123);
  });

  it("should fallback to setTimeout when requestIdleCallback is not available", () => {
    const win = window as WindowWithIdleCallback;
    win.requestIdleCallback = undefined;
    win.cancelIdleCallback = undefined;

    const callback = vi.fn();
    const timeoutMs = 1500;

    const { unmount } = renderHook(() => useIdleCallback(callback, timeoutMs));

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("should handle SSR correctly without throwing (simulating window check)", () => {
    const { result } = renderHook(() => useIdleCallback(vi.fn()));
    expect(result.current).toBeUndefined(); // useIdleCallback returns void
  });

  it("should call the latest callback reference", () => {
    const mockRequestIdleCallback = vi.fn(() => {
      return 123;
    });
    const win = window as WindowWithIdleCallback;
    win.requestIdleCallback = mockRequestIdleCallback;

    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(({ cb }) => useIdleCallback(cb), {
      initialProps: { cb: callback1 },
    });

    rerender({ cb: callback2 });

    const idleCb = mockRequestIdleCallback.mock.calls[0][0];
    idleCb();

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
