/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCanvasContinuity } from "../use-canvas-continuity";
import { saveCanvasSnapshot } from "../activity-canvas-store";
import type { RefObject } from "react";

vi.mock("../activity-canvas-store", () => ({
  saveCanvasSnapshot: vi.fn(),
  canvasStorageKey: vi.fn((key) => `mocked_key_${key}`),
}));

describe("useCanvasContinuity", () => {
  const mockPageKey = "test-page";
  let canvasRef: RefObject<HTMLCanvasElement | null>;
  let activeRef: RefObject<boolean>;
  let mockCanvas: HTMLCanvasElement;
  let mockFlush: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCanvas = document.createElement("canvas");
    mockCanvas.toDataURL = vi.fn().mockReturnValue("data:image/png;base64,mockdata");

    canvasRef = { current: mockCanvas };
    activeRef = { current: true };
    mockFlush = vi.fn();

    // Reset document.hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
  });

  it("saves on unmount", () => {
    const { unmount } = renderHook(() =>
      useCanvasContinuity(canvasRef, activeRef, mockPageKey, mockFlush)
    );

    expect(saveCanvasSnapshot).not.toHaveBeenCalled();
    expect(mockFlush).not.toHaveBeenCalled();

    unmount();

    expect(mockFlush).toHaveBeenCalledTimes(1);
    expect(saveCanvasSnapshot).toHaveBeenCalledWith(
      mockPageKey,
      "data:image/png;base64,mockdata",
      `mocked_key_${mockPageKey}`
    );
  });

  it("saves on pagehide event", () => {
    renderHook(() =>
      useCanvasContinuity(canvasRef, activeRef, mockPageKey, mockFlush)
    );

    window.dispatchEvent(new Event("pagehide"));

    expect(mockFlush).toHaveBeenCalledTimes(1);
    expect(saveCanvasSnapshot).toHaveBeenCalledTimes(1);
  });

  it("saves on visibilitychange event when document becomes hidden", () => {
    renderHook(() =>
      useCanvasContinuity(canvasRef, activeRef, mockPageKey, mockFlush)
    );

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(mockFlush).toHaveBeenCalledTimes(1);
    expect(saveCanvasSnapshot).toHaveBeenCalledTimes(1);
  });

  it("does not save on visibilitychange event when document is visible", () => {
    renderHook(() =>
      useCanvasContinuity(canvasRef, activeRef, mockPageKey, mockFlush)
    );

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(mockFlush).not.toHaveBeenCalled();
    expect(saveCanvasSnapshot).not.toHaveBeenCalled();
  });

  it("does not save if canvas is null", () => {
    canvasRef.current = null;
    const { unmount } = renderHook(() =>
      useCanvasContinuity(canvasRef, activeRef, mockPageKey, mockFlush)
    );

    unmount();

    expect(mockFlush).not.toHaveBeenCalled();
    expect(saveCanvasSnapshot).not.toHaveBeenCalled();
  });

  it("does not save if activeRef is false", () => {
    activeRef.current = false;
    const { unmount } = renderHook(() =>
      useCanvasContinuity(canvasRef, activeRef, mockPageKey, mockFlush)
    );

    unmount();

    expect(mockFlush).not.toHaveBeenCalled();
    expect(saveCanvasSnapshot).not.toHaveBeenCalled();
  });

  it("dispatches cartilla:work-save-failed event if saveCanvasSnapshot throws", () => {
    vi.mocked(saveCanvasSnapshot).mockImplementation(() => {
      throw new Error("Save failed");
    });

    const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

    const { unmount } = renderHook(() =>
      useCanvasContinuity(canvasRef, activeRef, mockPageKey, mockFlush)
    );

    unmount();

    expect(saveCanvasSnapshot).toHaveBeenCalled();
    const dispatchedEvent = dispatchEventSpy.mock.calls.find(
      ([e]) => (e as Event).type === "cartilla:work-save-failed"
    );
    expect(dispatchedEvent).toBeDefined();

    dispatchEventSpy.mockRestore();
  });

  it("removes event listeners on unmount", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const docAddEventListenerSpy = vi.spyOn(document, "addEventListener");
    const docRemoveEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() =>
      useCanvasContinuity(canvasRef, activeRef, mockPageKey, mockFlush)
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith("pagehide", expect.any(Function));
    expect(docAddEventListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("pagehide", expect.any(Function));
    expect(docRemoveEventListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
    docAddEventListenerSpy.mockRestore();
    docRemoveEventListenerSpy.mockRestore();
  });
});
