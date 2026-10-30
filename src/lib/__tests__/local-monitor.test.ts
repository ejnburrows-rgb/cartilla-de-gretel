import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { localMonitor } from "../local-monitor";

const LOCAL_MONITOR_KEY = "cartilla:telemetry:errors";

describe("localMonitor", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should start with empty errors", () => {
    expect(localMonitor.getErrors()).toEqual([]);
  });

  it("should log a string error", () => {
    localMonitor.logError("Something went wrong");
    const errors = localMonitor.getErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual({
      message: "Something went wrong",
      stack: undefined,
      url: window.location.href,
      timestamp: "2023-01-01T00:00:00.000Z",
    });
  });

  it("should log an Error object", () => {
    const error = new Error("Bad thing");
    error.stack = "Error: Bad thing\n    at test";

    localMonitor.logError(error);
    const errors = localMonitor.getErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toEqual({
      message: "Bad thing",
      stack: "Error: Bad thing\n    at test",
      url: window.location.href,
      timestamp: "2023-01-01T00:00:00.000Z",
    });
  });

  it("should prepend new errors", () => {
    localMonitor.logError("Error 1");
    vi.setSystemTime(new Date("2023-01-01T00:00:01.000Z"));
    localMonitor.logError("Error 2");

    const errors = localMonitor.getErrors();
    expect(errors).toHaveLength(2);
    expect(errors[0].message).toBe("Error 2");
    expect(errors[1].message).toBe("Error 1");
  });

  it("should keep only the 50 most recent errors", () => {
    for (let i = 0; i < 55; i++) {
      localMonitor.logError(`Error ${i}`);
    }

    const errors = localMonitor.getErrors();
    expect(errors).toHaveLength(50);
    // The most recent error is "Error 54", so it should be at index 0.
    // The 50th error is "Error 5", which is at index 49.
    expect(errors[0].message).toBe("Error 54");
    expect(errors[49].message).toBe("Error 5");
  });

  it("should ignore logging if JSON parsing fails", () => {
    localStorage.setItem(LOCAL_MONITOR_KEY, "invalid json");
    localMonitor.logError("New error");

    // getErrors also fails and returns []
    expect(localMonitor.getErrors()).toEqual([]);

    // Check localStorage still has the bad string (it didn't get overwritten)
    expect(localStorage.getItem(LOCAL_MONITOR_KEY)).toBe("invalid json");
  });

  it("should return empty array if getErrors JSON parsing fails", () => {
    localStorage.setItem(LOCAL_MONITOR_KEY, "invalid json");
    expect(localMonitor.getErrors()).toEqual([]);
  });

  it("should clear errors", () => {
    localMonitor.logError("Error 1");
    expect(localMonitor.getErrors()).toHaveLength(1);

    localMonitor.clearErrors();
    expect(localMonitor.getErrors()).toHaveLength(0);
    expect(localStorage.getItem(LOCAL_MONITOR_KEY)).toBeNull();
  });

  it("should safely handle missing window object", () => {
    // Save original window
    const originalWindow = global.window;

    // @ts-ignore
    delete (global as any).window;

    try {
      // Should not throw and should return default/do nothing
      localMonitor.logError("Error 1");
      expect(localMonitor.getErrors()).toEqual([]);
      localMonitor.clearErrors();
    } finally {
      // Restore window
      global.window = originalWindow;
    }
  });
});
