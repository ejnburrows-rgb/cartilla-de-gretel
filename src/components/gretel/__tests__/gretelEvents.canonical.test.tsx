import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useGretelEvents } from "../useGretelEvents";
import { gretelEvent } from "@/lib/gretel-bus";

vi.mock("@/lib/gretel-tts", () => ({
  speakGretelPhrase: vi.fn(),
}));

import { speakGretelPhrase } from "@/lib/gretel-tts";

describe("useGretelEvents canonical feedback phrases", () => {
  it("speaks 'Buen trabajo.' on answer:correct", () => {
    const { result } = renderHook(() => useGretelEvents());

    act(() => {
      gretelEvent("answer:correct");
    });

    expect(result.current.speechText).toBe("Buen trabajo.");
    expect(speakGretelPhrase).toHaveBeenCalledWith("Buen trabajo.");
    expect(result.current.machineState).toBe("cheering");
  });

  it("speaks 'Inténtalo otra vez.' on answer:wrong and uses gentle-error state", () => {
    const { result } = renderHook(() => useGretelEvents());

    act(() => {
      gretelEvent("answer:wrong");
    });

    expect(result.current.speechText).toBe("Inténtalo otra vez.");
    expect(speakGretelPhrase).toHaveBeenCalledWith("Inténtalo otra vez.");
    expect(result.current.machineState).toBe("gentle-error");
  });
});
