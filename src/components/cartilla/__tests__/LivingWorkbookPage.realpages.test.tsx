/**
 * @vitest-environment jsdom
 *
 * Grading-behavior regression tests for a representative real page per
 * interaction kind, loaded straight from the committed
 * workbook-manifest.json (via getWorkbookPage) — not synthetic fixtures.
 * Proves the manifest's real answer/target data actually grades correctly
 * through LivingWorkbookPage + each interaction component.
 *
 * pair-match / mark-circle production default is LassoConnect (cinematic rope);
 * MarkCircle/PairMatch remain in-repo as internal fallbacks.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import { LivingWorkbookPage } from "../LivingWorkbookPage";
import { getWorkbookPage, clearWorkbookManifestCache } from "@/content/workbook/loader";

vi.mock("@/lib/piano-audio", () => ({
  playCorrectChord: vi.fn(),
  playWrongBuzz: vi.fn(),
}));
vi.mock("@/lib/gretel-bus", () => ({
  gretelEvent: vi.fn(),
}));
vi.mock("@/lib/gretel-tts", () => ({
  speakGretelPhrase: vi.fn(),
}));

import { playCorrectChord } from "@/lib/piano-audio";

beforeEach(() => {
  clearWorkbookManifestCache();
  cleanup();
  vi.clearAllMocks();
  window.matchMedia =
    window.matchMedia ??
    ((query: string) =>
      ({
        matches: true, // reduced-motion: short lasso timers in tests
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList);
  Element.prototype.getBoundingClientRect = function () {
    return {
      x: 0,
      y: 0,
      top: 10,
      left: 10,
      bottom: 110,
      right: 110,
      width: 100,
      height: 100,
      toJSON: () => ({}),
    } as DOMRect;
  };
});

afterEach(() => cleanup());

async function flushLasso(ms = 500) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}

describe("LivingWorkbookPage — real manifest pages grade correctly", () => {
  it("MarkCircle → LassoConnect: page 4 (picture-grid) grades a real correct cell as correct", async () => {
    const page = getWorkbookPage(4);
    expect(page).not.toBeNull();
    const onResult = vi.fn();
    const { container } = render(
      <LivingWorkbookPage page={page!} onInteractionResult={onResult} />,
    );
    // Production default is cinematic lasso, not the old .lwp-mark-circle chip
    const firstChoice = container.querySelector(".am-lasso__target");
    expect(firstChoice).not.toBeNull();
    fireEvent.click(firstChoice!);
    await flushLasso(600);
    expect(playCorrectChord).toHaveBeenCalled();
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ objectId: "p4-cell-0", result: "correct" }),
    );
  });

  it("TapSelect: page 2 (vowel-pick-one, row a) grades the real correct answer", () => {
    const page = getWorkbookPage(2);
    expect(page).not.toBeNull();
    const onResult = vi.fn();
    const onComplete = vi.fn();
    render(
      <LivingWorkbookPage page={page!} onInteractionResult={onResult} onComplete={onComplete} />,
    );
    const button = document.querySelector('[aria-label="anillo"]');
    expect(button).not.toBeNull();
    fireEvent.click(button!);
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ objectId: "p2-a-0", result: "correct" }),
    );
    expect(onComplete).toHaveBeenCalled();
  });

  it("PairMatch → LassoConnect: page 3 (vowel-match-all) grades a real matching pair as correct", async () => {
    const page = getWorkbookPage(3);
    expect(page).not.toBeNull();
    const onResult = vi.fn();
    const { container } = render(
      <LivingWorkbookPage page={page!} onInteractionResult={onResult} />,
    );
    const targets = container.querySelectorAll(".am-lasso__target");
    expect(targets.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(targets[0]!);
    fireEvent.click(targets[1]!);
    await flushLasso(600);
    expect(playCorrectChord).toHaveBeenCalled();
    expect(onResult).toHaveBeenCalled();
  });

  it("DragPlace: page 22 (Lección 7 vocab) grades a real word placed on its real matching picture", () => {
    const page = getWorkbookPage(22);
    expect(page).not.toBeNull();
    const onResult = vi.fn();
    render(<LivingWorkbookPage page={page!} onInteractionResult={onResult} />);
    const draggable = document.querySelector('[aria-label^="mamá."]');
    const target = document.querySelector('[aria-label="mamá"]');
    expect(draggable).not.toBeNull();
    expect(target).not.toBeNull();
    fireEvent.click(draggable!);
    fireEvent.click(target!);
    expect(onResult).toHaveBeenCalledWith(
      expect.objectContaining({ objectId: "p22-word-0", result: "correct" }),
    );
  });

  it("TapToHear: page 26 (Lección 8 vocab) plays the real word/picture without grading it right or wrong", () => {
    const page = getWorkbookPage(26);
    expect(page).not.toBeNull();
    const onComplete = vi.fn();
    render(<LivingWorkbookPage page={page!} onComplete={onComplete} />);
    const button = document.querySelector('[aria-label="papá"]');
    expect(button).not.toBeNull();
    fireEvent.click(button!);
    // Only one real-art word on this page, so tapping it completes the (ungraded) exploration.
    expect(onComplete).toHaveBeenCalled();
  });

  it("returns null for a real physicalPage the manifest genuinely doesn't cover (e.g. 91)", () => {
    expect(getWorkbookPage(91)).toBeNull();
  });
});
