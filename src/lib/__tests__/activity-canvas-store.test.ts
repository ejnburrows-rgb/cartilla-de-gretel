import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  loadCanvasSnapshot,
  saveCanvasSnapshot,
  clearCanvasSnapshot,
  canvasStorageKey,
  loadLassoProgress,
  saveLassoProgress
} from "../activity-canvas-store";
import * as learnerStorage from "../learner-storage";

describe("activity-canvas-store", () => {
  const MOCK_PAGE_KEY = "test-page";

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 1).getTime());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("canvasStorageKey", () => {
    it("should generate the correct storage key using learnerStorageKey", () => {
      vi.spyOn(learnerStorage, "learnerStorageKey").mockImplementation((k) => `${k}:mocked-scope`);

      const key = canvasStorageKey(MOCK_PAGE_KEY);
      expect(key).toBe(`cartilla.activity.canvas.v1:paint:${MOCK_PAGE_KEY}:mocked-scope`);
    });
  });

  describe("Canvas Snapshot", () => {
    it("should return null if no snapshot exists", () => {
      expect(loadCanvasSnapshot(MOCK_PAGE_KEY)).toBeNull();
    });

    it("should save and load a canvas snapshot", () => {
      const dataUrl = "data:image/png;base64,mocked-data";

      saveCanvasSnapshot(MOCK_PAGE_KEY, dataUrl);

      const loaded = loadCanvasSnapshot(MOCK_PAGE_KEY);
      expect(loaded).not.toBeNull();
      expect(loaded?.dataUrl).toBe(dataUrl);
      expect(loaded?.updatedAt).toBe(Date.now());
    });

    it("should clear a canvas snapshot", () => {
      saveCanvasSnapshot(MOCK_PAGE_KEY, "test-data-url");
      expect(loadCanvasSnapshot(MOCK_PAGE_KEY)).not.toBeNull();

      clearCanvasSnapshot(MOCK_PAGE_KEY);
      expect(loadCanvasSnapshot(MOCK_PAGE_KEY)).toBeNull();
    });
  });

  describe("Lasso Progress", () => {
    it("should return null if no progress exists", () => {
      expect(loadLassoProgress(MOCK_PAGE_KEY)).toBeNull();
    });

    it("should save and load lasso progress", () => {
      const completedIds = ["target-1", "target-2"];

      saveLassoProgress(MOCK_PAGE_KEY, completedIds);

      const loaded = loadLassoProgress(MOCK_PAGE_KEY);
      expect(loaded).not.toBeNull();
      expect(loaded?.completedIds).toEqual(completedIds);
      expect(loaded?.updatedAt).toBe(Date.now());
    });
  });

  describe("Error handling and edge cases", () => {
    it("should return null if localStorage data is malformed (JSON parse error)", () => {
      const key = canvasStorageKey(MOCK_PAGE_KEY);
      localStorage.setItem(key, "invalid-json");

      expect(loadCanvasSnapshot(MOCK_PAGE_KEY)).toBeNull();

      const lassoKey = key.replace(":paint:", ":lasso:");
      localStorage.setItem(lassoKey, "invalid-json");

      expect(loadLassoProgress(MOCK_PAGE_KEY)).toBeNull();
    });

    it("should dispatch cartilla:work-save-failed event if localStorage.setItem fails for canvas", () => {
      const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
      const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

      saveCanvasSnapshot(MOCK_PAGE_KEY, "data-url");

      expect(setItemSpy).toHaveBeenCalled();
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

      const event = dispatchEventSpy.mock.calls[0][0] as Event;
      expect(event.type).toBe("cartilla:work-save-failed");
    });

    it("should dispatch cartilla:work-save-failed event if localStorage.setItem fails for lasso", () => {
      const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
      const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

      saveLassoProgress(MOCK_PAGE_KEY, ["id-1"]);

      expect(setItemSpy).toHaveBeenCalled();
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

      const event = dispatchEventSpy.mock.calls[0][0] as Event;
      expect(event.type).toBe("cartilla:work-save-failed");
    });

    it("should ignore errors when clearCanvasSnapshot throws", () => {
      const removeItemSpy = vi.spyOn(window.localStorage, "removeItem").mockImplementation(() => {
        throw new Error("StorageError");
      });

      expect(() => clearCanvasSnapshot(MOCK_PAGE_KEY)).not.toThrow();
      expect(removeItemSpy).toHaveBeenCalled();
    });
  });

  describe("SSR / typeof window === undefined", () => {
    let originalWindow: typeof window;

    beforeEach(() => {
      // Mock window as undefined to test SSR paths
      originalWindow = global.window;
      // @ts-ignore
      delete global.window;
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it("loadCanvasSnapshot should return null", () => {
      expect(loadCanvasSnapshot(MOCK_PAGE_KEY)).toBeNull();
    });

    it("saveCanvasSnapshot should return early", () => {
      expect(() => saveCanvasSnapshot(MOCK_PAGE_KEY, "data-url")).not.toThrow();
    });

    it("clearCanvasSnapshot should return early", () => {
      expect(() => clearCanvasSnapshot(MOCK_PAGE_KEY)).not.toThrow();
    });

    it("loadLassoProgress should return null", () => {
      expect(loadLassoProgress(MOCK_PAGE_KEY)).toBeNull();
    });

    it("saveLassoProgress should return early", () => {
      expect(() => saveLassoProgress(MOCK_PAGE_KEY, ["id-1"])).not.toThrow();
    });
  });
});
