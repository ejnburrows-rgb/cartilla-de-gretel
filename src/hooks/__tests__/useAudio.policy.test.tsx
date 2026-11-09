/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { playPictureName } from "@/lib/picture-audio";
import { useAudio } from "../useAudio";

vi.mock("@/lib/picture-audio", () => ({ playPictureName: vi.fn() }));

describe("useAudio recorded-only policy", () => {
  afterEach(() => vi.restoreAllMocks());

  it("plays only words with an approved recording and never calls speech synthesis", () => {
    const speak = vi.fn();
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: { speak } });
    const { result } = renderHook(() => useAudio());

    expect(result.current.isAvailable("oso")).toBe(true);
    expect(result.current.isAvailable("ma")).toBe(false);
    act(() => {
      result.current.play("oso");
      result.current.play("ma");
    });

    expect(playPictureName).toHaveBeenCalledTimes(1);
    expect(playPictureName).toHaveBeenCalledWith(expect.objectContaining({ key: "oso" }));
    expect(speak).not.toHaveBeenCalled();
  });
});
