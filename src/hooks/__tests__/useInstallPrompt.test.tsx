import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useInstallPrompt, BeforeInstallPromptEvent } from "../useInstallPrompt";

describe("useInstallPrompt", () => {
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;
  let mediaQueryAddEventListenerSpy: any;
  let mediaQueryRemoveEventListenerSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock userAgent
    vi.stubGlobal("navigator", {
      ...window.navigator,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      standalone: undefined,
    });

    mediaQueryAddEventListenerSpy = vi.fn();
    mediaQueryRemoveEventListenerSpy = vi.fn();

    // Mock matchMedia
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: mediaQueryAddEventListenerSpy,
      removeEventListener: mediaQueryRemoveEventListenerSpy,
      dispatchEvent: vi.fn(),
    })));

    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.promptEvent).toBeNull();
    expect(result.current.isStandalone).toBe(false);
    expect(result.current.isIOS).toBe(false);
  });

  it("should detect iOS device correctly", () => {
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15",
    });

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isIOS).toBe(true);
  });

  it("should not detect iOS on other devices", () => {
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/68.0",
    });

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isIOS).toBe(false);
  });

  it("should detect standalone mode via matchMedia", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockImplementation((query) => ({
      matches: query === "(display-mode: standalone)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isStandalone).toBe(true);
  });

  it("should detect standalone mode via navigator.standalone (iOS PWA)", () => {
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (iPhone)",
      standalone: true,
    });

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.isStandalone).toBe(true);
  });

  it("should capture beforeinstallprompt event", () => {
    const { result } = renderHook(() => useInstallPrompt());

    // Find the registered event handler
    const beforeInstallPromptCall = addEventListenerSpy.mock.calls.find(
      (call: any[]) => call[0] === "beforeinstallprompt"
    );
    expect(beforeInstallPromptCall).toBeDefined();

    const handler = beforeInstallPromptCall[1];

    // Create a mock event
    const mockEvent = {
      preventDefault: vi.fn(),
      platforms: ["web"],
      userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
      prompt: vi.fn().mockResolvedValue(undefined),
    } as unknown as BeforeInstallPromptEvent;

    // Trigger the handler
    act(() => {
      handler(mockEvent as any);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(result.current.promptEvent).toBe(mockEvent);
  });

  it("should handle display-mode media query change", () => {
    const { result } = renderHook(() => useInstallPrompt());

    expect(mediaQueryAddEventListenerSpy).toHaveBeenCalledWith("change", expect.any(Function));

    const handler = mediaQueryAddEventListenerSpy.mock.calls[0][1];

    act(() => {
      handler({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current.isStandalone).toBe(true);

    act(() => {
      handler({ matches: false } as MediaQueryListEvent);
    });

    expect(result.current.isStandalone).toBe(false);
  });

  it("should cleanup event listeners on unmount", () => {
    const { unmount } = renderHook(() => useInstallPrompt());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "beforeinstallprompt",
      expect.any(Function)
    );
    expect(mediaQueryRemoveEventListenerSpy).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });

  it("should allow setting prompt event manually", () => {
    const { result } = renderHook(() => useInstallPrompt());

    const mockEvent = {
      platforms: ["web"],
    } as BeforeInstallPromptEvent;

    act(() => {
      result.current.setPromptEvent(mockEvent);
    });

    expect(result.current.promptEvent).toBe(mockEvent);
  });
});
