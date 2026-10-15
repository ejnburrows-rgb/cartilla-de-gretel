import { useEffect } from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ActivityCarousel } from "../ActivityCarousel";
import "@testing-library/jest-dom";

// Mount counters: incremented ONLY on mount (empty-deps effect), never on re-render.
// A re-render without remount (the bug) leaves these unchanged.
let dragBuildWordMounts = 0;
let soundSearchMounts = 0;

vi.mock("../DragBuildWord", () => ({
  DragBuildWord: () => {
    useEffect(() => {
      dragBuildWordMounts += 1;
    }, []);
    return <div data-testid="mock-drag-build-word">DragBuildWord Content</div>;
  },
}));

vi.mock("../SoundSearch", () => ({
  SoundSearch: () => {
    useEffect(() => {
      soundSearchMounts += 1;
    }, []);
    return <div data-testid="mock-sound-search">SoundSearch Content</div>;
  },
}));

describe("ActivityCarousel remounts game state on lesson change", () => {
  beforeEach(() => {
    dragBuildWordMounts = 0;
    soundSearchMounts = 0;
  });

  const baseProps = {
    syllables: ["ma", "me"],
    words: [{ word: "mama" }, { word: "mesa" }],
    letter: "m",
    color: "#ff0000",
    lessonId: "test-lesson",
  };

  it("remounts DragBuildWord (Armar) when lessonNumber changes", () => {
    const { rerender } = render(
      <ActivityCarousel {...baseProps} lessonNumber={1} activities={["armar"]} />
    );
    expect(dragBuildWordMounts).toBe(1);

    rerender(<ActivityCarousel {...baseProps} lessonNumber={2} activities={["armar"]} />);

    // key={lessonNumber} forces a full remount, wiping the previous word's state
    expect(dragBuildWordMounts).toBe(2);
  });

  it("remounts SoundSearch (Busca el sonido) when lessonNumber changes", () => {
    const { rerender } = render(
      <ActivityCarousel {...baseProps} lessonNumber={1} activities={["sonido"]} />
    );
    expect(soundSearchMounts).toBe(1);

    rerender(<ActivityCarousel {...baseProps} lessonNumber={2} activities={["sonido"]} />);

    expect(soundSearchMounts).toBe(2);
  });
});
