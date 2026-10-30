/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInstallPrompt } from "../useInstallPrompt";

describe("useInstallPrompt", () => {
  let originalNavigator: Navigator;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalNavigator = window.navigator;
    originalMatchMedia = window.matchMedia;

    // Reset window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Reset window.navigator
    Object.defineProperty(window, "navigator", {
      value: { ...originalNavigator, userAgent: "Mozilla/5.0" },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "navigator", {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it("should initialize with default states", () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.promptEvent).toBeNull();
    expect(result.current.isStandalone).toBe(false);
    expect(result.current.isIOS).toBe(false);
  });

  it("should detect iOS devices based on userAgent", () => {
    Object.defineProperty(window, "navigator", {
      value: {
        ...originalNavigator,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isIOS).toBe(true);
  });

  it("should not detect iOS if MSStream is present", () => {
    Object.defineProperty(window, "navigator", {
      value: {
        ...originalNavigator,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      },
      configurable: true,
      writable: true,
    });

    (window as any).MSStream = {};

    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isIOS).toBe(false);

    delete (window as any).MSStream;
  });

  it("should explicitly not detect iOS for non-iOS devices (e.g., Android)", () => {
    Object.defineProperty(window, "navigator", {
      value: {
        ...originalNavigator,
        userAgent: "Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36",
      },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isIOS).toBe(false);
  });

  it("should detect standalone mode via display-mode media query", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isStandalone).toBe(true);
  });

  it("should detect standalone mode via navigator.standalone", () => {
    Object.defineProperty(window, "navigator", {
      value: { ...originalNavigator, standalone: true },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isStandalone).toBe(true);
  });

  it("should update standalone state when display-mode changes", () => {
    let changeHandler: ((e: any) => void) | undefined;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event, handler) => {
        if (event === "change") changeHandler = handler;
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isStandalone).toBe(false);

    act(() => {
      if (changeHandler) {
        changeHandler({ matches: true });
      }
    });

    expect(result.current.isStandalone).toBe(true);
  });

  it("should handle beforeinstallprompt event correctly", () => {
    const { result } = renderHook(() => useInstallPrompt());

    const preventDefaultSpy = vi.fn();
    const mockEvent = new Event("beforeinstallprompt");
    mockEvent.preventDefault = preventDefaultSpy;

    act(() => {
      window.dispatchEvent(mockEvent);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(result.current.promptEvent).toBe(mockEvent);
  });

  it("should allow setting promptEvent manually via setPromptEvent", () => {
    const { result } = renderHook(() => useInstallPrompt());

    const mockEvent = new Event("beforeinstallprompt") as any;

    act(() => {
      result.current.setPromptEvent(mockEvent);
    });

    expect(result.current.promptEvent).toBe(mockEvent);
  });

  it("should cleanup event listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const mediaQueryRemoveEventListenerSpy = vi.fn();

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: mediaQueryRemoveEventListenerSpy,
      dispatchEvent: vi.fn(),
    }));

    const { unmount } = renderHook(() => useInstallPrompt());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("beforeinstallprompt", expect.any(Function));
    expect(mediaQueryRemoveEventListenerSpy).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
