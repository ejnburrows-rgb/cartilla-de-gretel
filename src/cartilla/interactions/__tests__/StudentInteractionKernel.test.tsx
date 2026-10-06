import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import {
  ClassicPencilActor,
  RealWorkbookMark,
  runKernelMarkChoreography,
  KernelMarkState,
} from "../StudentInteractionKernel";

vi.mock("@/lib/gretel-tts", () => ({ speakGretelPhrase: vi.fn() }));
vi.mock("@/lib/piano-audio", () => ({ playCorrectChord: vi.fn(), playWrongBuzz: vi.fn() }));
vi.mock("@/lib/gretel-bus", () => ({ gretelEvent: vi.fn() }));

import { speakGretelPhrase } from "@/lib/gretel-tts";
import { playCorrectChord } from "@/lib/piano-audio";
import { gretelEvent } from "@/lib/gretel-bus";

describe("StudentInteractionKernel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders ClassicPencilActor in pencil and eraser modes", () => {
    const { rerender } = render(<ClassicPencilActor mode="pencil" />);
    const actor = screen.getByTestId("classic-pencil-actor");
    expect(actor.getAttribute("data-mode")).toBe("pencil");

    rerender(<ClassicPencilActor mode="eraser" />);
    expect(actor.getAttribute("data-mode")).toBe("eraser");
  });

  it("renders RealWorkbookMark for different states and types", () => {
    const { rerender } = render(<RealWorkbookMark type="circle" state="marking" />);
    const mark = screen.getByTestId("real-workbook-mark");
    expect(mark.getAttribute("data-state")).toBe("marking");
    expect(mark.getAttribute("data-type")).toBe("circle");

    rerender(<RealWorkbookMark type="x" state="success" />);
    expect(screen.getByTestId("real-workbook-mark").getAttribute("data-type")).toBe("x");
  });

  it("runs choreography for correct selection with neutral hold and success", () => {
    const states: KernelMarkState[] = [];
    const onStateChange = (s: KernelMarkState) => states.push(s);
    const onComplete = vi.fn();

    runKernelMarkChoreography({
      isCorrect: true,
      reducedMotion: false,
      onStateChange,
      onComplete,
    });

    expect(states).toEqual(["marking"]);

    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(states).toEqual(["marking", "neutral-hold"]);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(states).toEqual(["marking", "neutral-hold", "success"]);
    expect(playCorrectChord).toHaveBeenCalled();
    expect(speakGretelPhrase).toHaveBeenCalledWith("Buen trabajo.");
    expect(gretelEvent).toHaveBeenCalledWith("answer:correct");
    expect(onComplete).toHaveBeenCalledWith(true);
  });

  it("runs Pencil Retry choreography for wrong selection and erases mark (no buzzer)", () => {
    const states: KernelMarkState[] = [];
    const onStateChange = (s: KernelMarkState) => states.push(s);
    const onComplete = vi.fn();

    runKernelMarkChoreography({
      isCorrect: false,
      reducedMotion: false,
      onStateChange,
      onComplete,
    });

    expect(states).toEqual(["marking"]);

    act(() => {
      vi.advanceTimersByTime(450);
    });
    expect(states).toEqual(["marking", "neutral-hold"]);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(states).toEqual(["marking", "neutral-hold", "retry-erase"]);
    expect(speakGretelPhrase).toHaveBeenCalledWith("Inténtalo otra vez.");
    expect(gretelEvent).toHaveBeenCalledWith("answer:wrong");

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(states).toEqual(["marking", "neutral-hold", "retry-erase", "idle"]);
    expect(onComplete).toHaveBeenCalledWith(false);
  });

  it("supports reduced-motion mode immediately without timers", () => {
    const states: KernelMarkState[] = [];
    const onStateChange = (s: KernelMarkState) => states.push(s);
    const onComplete = vi.fn();

    runKernelMarkChoreography({
      isCorrect: true,
      reducedMotion: true,
      onStateChange,
      onComplete,
    });

    expect(states).toEqual(["success"]);
    expect(playCorrectChord).toHaveBeenCalled();
    expect(speakGretelPhrase).toHaveBeenCalledWith("Buen trabajo.");
    expect(onComplete).toHaveBeenCalledWith(true);
  });
});
