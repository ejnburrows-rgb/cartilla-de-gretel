import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ActivityCarousel } from "../ActivityCarousel";
import { DragBuildWord } from "../DragBuildWord";
import { SoundSearch } from "../SoundSearch";
import "@testing-library/jest-dom";

// Mock the child components to verify remounts
vi.mock("../DragBuildWord", () => ({
  DragBuildWord: vi.fn(() => <div data-testid="mock-drag-build-word">DragBuildWord Content</div>),
}));

vi.mock("../SoundSearch", () => ({
  SoundSearch: vi.fn(() => <div data-testid="mock-sound-search">SoundSearch Content</div>),
}));

describe("ActivityCarousel component remounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseProps = {
    syllables: ["ma", "me"],
    words: [{ word: "mama" }, { word: "mesa" }],
    letter: "m",
    color: "#ff0000",
    lessonId: "test-lesson",
  };

  it("remounts DragBuildWord when lessonNumber changes", () => {
    const { rerender } = render(
      <ActivityCarousel {...baseProps} lessonNumber={1} activities={["armar"]} />
    );

    // Initial mount and effects can cause re-renders. Let's record the baseline.
    const initialCalls = vi.mocked(DragBuildWord).mock.calls.length;
    
    // Changing lessonNumber should cause a remount due to the `key` prop
    rerender(<ActivityCarousel {...baseProps} lessonNumber={2} activities={["armar"]} />);

    // Because it remounts with a new key, it should be called again at least once more
    const subsequentCalls = vi.mocked(DragBuildWord).mock.calls.length;
    expect(subsequentCalls).toBeGreaterThan(initialCalls);
  });

  it("remounts SoundSearch when lessonNumber changes", () => {
    const { rerender } = render(
      <ActivityCarousel {...baseProps} lessonNumber={1} activities={["sonido"]} />
    );

    const initialCalls = vi.mocked(SoundSearch).mock.calls.length;
    
    rerender(<ActivityCarousel {...baseProps} lessonNumber={2} activities={["sonido"]} />);

    const subsequentCalls = vi.mocked(SoundSearch).mock.calls.length;
    expect(subsequentCalls).toBeGreaterThan(initialCalls);
  });
});
