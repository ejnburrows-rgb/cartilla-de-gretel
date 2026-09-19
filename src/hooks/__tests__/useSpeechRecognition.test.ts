/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSpeechRecognition } from "../useSpeechRecognition";
import { MockSpeechRecognition } from "../../test/setup";

describe("useSpeechRecognition Hook and MockSpeechRecognition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with default states and recognize support", () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe("");
    expect(result.current.error).toBeNull();
  });

  it("should transition to listening state asynchronously", async () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.startListening();
    });

    // Before advancing timers, it shouldn't be listening yet
    expect(result.current.isListening).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isListening).toBe(true);
  });

  it("should handle speech results", async () => {
    const { result } = renderHook(() => useSpeechRecognition());

    await act(async () => {
      result.current.startListening();
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isListening).toBe(true);

    const instance = MockSpeechRecognition.getLastInstance();
    expect(instance).toBeDefined();

    act(() => {
      instance?.triggerResult("hola mundo");
    });

    expect(result.current.transcript).toBe("hola mundo");
  });

  it("should handle error asynchronously, stop listening and populate error state", async () => {
    const { result } = renderHook(() => useSpeechRecognition());

    await act(async () => {
      result.current.startListening();
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isListening).toBe(true);

    const instance = MockSpeechRecognition.getLastInstance();
    expect(instance).toBeDefined();

    await act(async () => {
      instance?.triggerError("no-speech");
      // triggerError calls stop() which triggers onend asynchronously.
      // So we need to advance timers to let onend fire.
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isListening).toBe(false);
    expect(result.current.error).toBe("no-speech");
  });

  it("should handle stop listening asynchronously", async () => {
    const { result } = renderHook(() => useSpeechRecognition());

    await act(async () => {
      result.current.startListening();
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isListening).toBe(true);

    await act(async () => {
      result.current.stopListening();
      expect(result.current.isListening).toBe(true); // Still true until onend callback fires
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isListening).toBe(false);
  });
});
