/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FaithfulPageRenderer } from "../FaithfulPageRenderer";
import { buildPageArray } from "@/utils/buildPageArray";
import { getPageLayout } from "@/lib/book-faithful";
import { validSyllableStarts } from "@/cartilla/interactions/SyllableWordCircle";
vi.mock("@/lib/gretel-speak", () => ({ speakGretel: vi.fn(), cancelGretelSpeech: vi.fn() }));
vi.mock("@/lib/piano-audio", () => ({ playCorrectChord: vi.fn(), playNote: vi.fn() }));
afterEach(cleanup);
const lessons: Record<number, number[]> = {
  19: [67, 68, 69, 70],
  20: [71, 72, 73, 74],
  21: [75, 76, 77, 78],
  22: [79, 80, 81, 82],
  23: [83, 84, 85],
  24: [88, 89, 90],
};
describe("Lane C — every real source page, existing hosts", () => {
  for (const [lesson, numbers] of Object.entries(lessons)) {
    it(`lesson ${lesson} preserves exact printed-page order and skips 86–87`, () => {
      expect(
        buildPageArray(Number(lesson))
          .filter((p) => p.pageNumber !== undefined)
          .map((p) => p.pageNumber),
      ).toEqual(numbers);
    });
    for (const number of numbers) {
      it(`page ${number}: text-only source, native scoped shell, no invented art`, () => {
        const regions = getPageLayout(number)!;
        expect(regions.length).toBeGreaterThan(0);
        expect(regions.some((r) => /picture|illustration|paint/.test(r.regionType))).toBe(false);
        const { container } = render(
          <FaithfulPageRenderer pageNumber={number} lessonNumber={Number(lesson)} native />,
        );
        expect(container.querySelector(".fp-lane-c")).not.toBeNull();
        expect(
          container.querySelectorAll(".living-illustration, .fp-illustration-slot"),
        ).toHaveLength(0);
        for (const r of regions.filter((r) => r.regionType === "syllable-match")) {
          for (const word of (r.matchRows ?? []).flat()) {
            expect(
              validSyllableStarts(word.word, r.syllable!),
              `${number}: ${word.word}`,
            ).not.toHaveLength(0);
          }
        }
      });
    }
  }
  it("does not style other lessons or teacher/static views", () => {
    const { container, rerender } = render(
      <FaithfulPageRenderer pageNumber={65} lessonNumber={18} native />,
    );
    expect(container.querySelector(".fp-lane-c")).toBeNull();
    rerender(<FaithfulPageRenderer pageNumber={69} lessonNumber={19} />);
    expect(container.querySelector(".fp-lane-c")).toBeNull();
  });
  it("page 72 retains 5 real syllable circle hosts and every original word", () => {
    const { container } = render(
      <FaithfulPageRenderer pageNumber={72} lessonNumber={20} native interactive />,
    );
    expect(container.querySelectorAll(".native-syllable")).toHaveLength(5);
    expect(container.querySelectorAll(".native-syllable__word")).toHaveLength(30);
    expect(container.textContent).toContain("Encierra en un círculo la sílaba correspondiente.");
    expect(container.textContent).toContain("teléfono");
  });
});
