// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  recordWorkbookAnswer,
  recordPageCompletion,
  getAnswersForPage,
  getCompletionsForPage,
  getOfflineQueue,
  syncOfflineProgressEvents,
  clearAllProgressEvents,
} from "@/lib/progress-events";

describe("progress-events", () => {
  beforeEach(() => {
    clearAllProgressEvents();
  });

  it("should record workbook answers and associate them with a page", () => {
    const answer = recordWorkbookAnswer(
      4,
      2,
      "l2-p4-listen-o",
      "TapToHear",
      "oso",
      true,
      "oso",
    );

    expect(answer.pageNumber).toBe(4);
    expect(answer.lessonNumber).toBe(2);
    expect(answer.isCorrect).toBe(true);

    const stored = getAnswersForPage(4);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(answer.id);
  });

  it("should record page completions", () => {
    const completion = recordPageCompletion(4, 2, 3, 3);
    expect(completion.score).toBe(100);

    const stored = getCompletionsForPage(4);
    expect(stored).toHaveLength(1);
  });

  it("should queue offline progress events and sync them", async () => {
    const originalOnLine = Object.getOwnPropertyDescriptor(
      navigator,
      "onLine",
    );

    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });

    recordWorkbookAnswer(5, 2, "i1", "TapSelect", "oreja", true, "oreja");
    expect(getOfflineQueue()).toHaveLength(1);

    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });

    const synced = await syncOfflineProgressEvents();
    expect(synced).toBe(1);
    expect(getOfflineQueue()).toHaveLength(0);

    if (originalOnLine) {
      Object.defineProperty(navigator, "onLine", originalOnLine);
    }
  });
});
