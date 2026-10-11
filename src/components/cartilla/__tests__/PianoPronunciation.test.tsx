/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { PianoPronunciation } from "../PianoPronunciation";

// Mocks
const mockStartListening = vi.fn();
const mockStopListening = vi.fn();
let mockTranscript = "";

vi.mock("@/hooks/useSpeechRecognition", () => ({
  useSpeechRecognition: () => ({
    isListening: false,
    transcript: mockTranscript,
    startListening: mockStartListening,
    stopListening: mockStopListening,
    isSupported: true,
    error: null,
  }),
}));

const mockPlayNote = vi.fn();
const mockPlayCorrectChord = vi.fn();
const mockPlayWrongBuzz = vi.fn();

vi.mock("@/lib/piano-audio", () => ({
  playNote: (...args: unknown[]) => mockPlayNote(...args),
  playCorrectChord: (...args: unknown[]) => mockPlayCorrectChord(...args),
  playWrongBuzz: (...args: unknown[]) => mockPlayWrongBuzz(...args),
  NOTE_FREQS: {
    C: 261.63,
    D: 293.66,
    E: 329.63,
    F: 349.23,
    G: 392.0,
    A: 440.0,
    B: 493.88,
    C5: 523.25,
  },
}));

const mockSpeak = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/speak", () => ({
  speak: (s: string) => mockSpeak(s),
}));

vi.mock("@/lib/student-session", () => ({
  recordEvent: vi.fn(),
}));

describe("PianoPronunciation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockTranscript = "";
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("Completion timer lifecycle", () => {
    it("runs onComplete once after 2000ms when all syllables are completed", () => {
      const onComplete = vi.fn();
      mockTranscript = "ma";

      const { rerender } = render(
        <PianoPronunciation syllables={["ma"]} onComplete={onComplete} />,
      );

      // Trigger matching effect by re-rendering with transcript
      rerender(<PianoPronunciation syllables={["ma"]} onComplete={onComplete} />);

      expect(mockPlayCorrectChord).toHaveBeenCalledTimes(1);
      expect(onComplete).not.toHaveBeenCalled();

      // Fast forward 1999ms - shouldn't have been called yet
      act(() => {
        vi.advanceTimersByTime(1999);
      });
      expect(onComplete).not.toHaveBeenCalled();

      // Fast forward remaining 1ms - should be called once
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(onComplete).toHaveBeenCalledTimes(1);

      // Advancing further should not trigger additional calls
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("does NOT run onComplete after unmount if unmounted during 2000ms delay", () => {
      const onComplete = vi.fn();
      mockTranscript = "ma";

      const { rerender, unmount } = render(
        <PianoPronunciation syllables={["ma"]} onComplete={onComplete} />,
      );

      rerender(<PianoPronunciation syllables={["ma"]} onComplete={onComplete} />);
      expect(mockPlayCorrectChord).toHaveBeenCalledTimes(1);

      // Unmount at 1000ms
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      unmount();

      // Fast forward past 2000ms
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("does NOT run onComplete for previous attempt if syllables prop changes during 2000ms delay", () => {
      const onComplete = vi.fn();
      mockTranscript = "ma";

      const { rerender } = render(
        <PianoPronunciation syllables={["ma"]} onComplete={onComplete} />,
      );

      rerender(<PianoPronunciation syllables={["ma"]} onComplete={onComplete} />);
      expect(mockPlayCorrectChord).toHaveBeenCalledTimes(1);

      // Advance 1000ms, then change syllables prop
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      mockTranscript = "";
      rerender(<PianoPronunciation syllables={["pa", "pe"]} onComplete={onComplete} />);

      // Fast forward past initial timer
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Old onComplete should not have been called
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe("Native keyboard navigation and accessibility", () => {
    it("renders separate native buttons for piano key and Escuchar action without nested interactive elements", () => {
      render(<PianoPronunciation syllables={["ma", "me"]} />);

      const keyBtn = screen.getByRole("button", { name: "Tecla ma" });
      const listenBtn = screen.getByRole("button", { name: "Escuchar ma" });

      expect(keyBtn).toBeTruthy();
      expect(keyBtn.tagName).toBe("BUTTON");
      expect(keyBtn.getAttribute("type")).toBe("button");
      expect(keyBtn.className).toMatch(/focus:ring-/);

      expect(listenBtn).toBeTruthy();
      expect(listenBtn.tagName).toBe("BUTTON");
      expect(listenBtn.getAttribute("type")).toBe("button");

      // Verify non-nested structure: listenBtn is NOT a descendant of keyBtn
      expect(keyBtn.contains(listenBtn)).toBe(false);
    });

    it("activates piano key button via click and native keyboard Enter / Space", async () => {
      render(<PianoPronunciation syllables={["ma", "me"]} />);

      const keyBtn = screen.getByRole("button", { name: "Tecla ma" });

      // Click key button
      await act(async () => {
        fireEvent.click(keyBtn);
      });
      expect(mockPlayNote).toHaveBeenCalledTimes(1);
      expect(mockSpeak).toHaveBeenCalledWith("ma");

      // Press Enter on native key button
      await act(async () => {
        fireEvent.click(keyBtn); // Native HTML buttons trigger click event on Enter/Space
      });
      expect(mockPlayNote).toHaveBeenCalledTimes(2);
    });

    it("activates separate Escuchar button without double-triggering key button", async () => {
      render(<PianoPronunciation syllables={["ma"]} />);

      const listenBtn = screen.getByRole("button", { name: "Escuchar ma" });
      expect(listenBtn).toBeTruthy();

      // Click separate listening button
      await act(async () => {
        fireEvent.click(listenBtn);
      });

      // Should call speak and playNote exactly once
      expect(mockPlayNote).toHaveBeenCalledTimes(1);
      expect(mockSpeak).toHaveBeenCalledTimes(1);
      expect(mockSpeak).toHaveBeenCalledWith("ma");
    });
  });
});
