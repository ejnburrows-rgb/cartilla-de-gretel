/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { consumeLastCapturedError } from "../error-capture";

describe("error-capture", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // clear out the error for the next test
    while (consumeLastCapturedError() !== undefined) {}
  });

  it("returns undefined if no error has been captured", () => {
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("captures and returns an error from an ErrorEvent", () => {
    const error = new Error("Test error");
    const event = new ErrorEvent("error", { error });
    globalThis.dispatchEvent(event);

    expect(consumeLastCapturedError()).toBe(error);
  });

  it("returns the event itself if ErrorEvent has no error property", () => {
    const event = new Event("error");
    globalThis.dispatchEvent(event);

    expect(consumeLastCapturedError()).toBe(event);
  });

  it("captures and returns a reason from a PromiseRejectionEvent", () => {
    const reason = new Error("Test rejection");
    const event = new PromiseRejectionEvent("unhandledrejection", { reason, promise: Promise.reject(reason).catch(() => {}) });
    globalThis.dispatchEvent(event);

    expect(consumeLastCapturedError()).toBe(reason);
  });

  it("returns undefined if the error was captured more than TTL_MS ago", () => {
    const error = new Error("Old error");
    const event = new ErrorEvent("error", { error });
    globalThis.dispatchEvent(event);

    vi.advanceTimersByTime(5001); // TTL_MS is 5000

    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("consumes the error (returns undefined on subsequent calls)", () => {
    const error = new Error("Test error");
    const event = new ErrorEvent("error", { error });
    globalThis.dispatchEvent(event);

    expect(consumeLastCapturedError()).toBe(error);
    expect(consumeLastCapturedError()).toBeUndefined();
  });
});
