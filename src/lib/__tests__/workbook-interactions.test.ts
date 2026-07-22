import { describe, it, expect, vi } from "vitest";
import {
  getInteractionReadinessForLesson,
  getInteractionsForLesson,
  getInteractionsForPage,
  getPageInteractionSet,
  hasVerifiedHotspots,
  type WorkbookInteraction,
} from "../workbook-interactions";

vi.mock("@/data/workbook-interactions.json", () => ({
  default: {
    interactions: [
      {
        id: "1",
        lessonNumber: 1,
        pageNumber: 10,
        sourceStatus: "verified",
        targets: [{ coordinatesVerified: true, xPercent: 10 }],
      },
      {
        id: "2",
        lessonNumber: 1,
        pageNumber: 10,
        sourceStatus: "needs-art-mapping",
        targets: [],
      },
      {
        id: "3",
        lessonNumber: 1,
        pageNumber: 11,
        sourceStatus: "book-derived",
        targets: [],
      },
      {
        id: "4",
        lessonNumber: 1,
        pageNumber: 12,
        sourceStatus: "needs-transcription",
        targets: [],
      },
      {
        id: "5",
        lessonNumber: 2,
        pageNumber: 10,
        sourceStatus: "verified",
        targets: [],
      },
    ],
  },
}));

describe("workbook-interactions", () => {
  describe("hasVerifiedHotspots", () => {
    it("returns true when at least one target has verified coordinates and xPercent", () => {
      const interaction = {
        targets: [{ coordinatesVerified: false }, { coordinatesVerified: true, xPercent: 10 }],
      } as unknown as WorkbookInteraction;
      expect(hasVerifiedHotspots(interaction)).toBe(true);
    });

    it("returns false when no targets have verified coordinates", () => {
      const interaction = {
        targets: [
          { coordinatesVerified: false },
          { coordinatesVerified: true }, // missing xPercent
        ],
      } as unknown as WorkbookInteraction;
      expect(hasVerifiedHotspots(interaction)).toBe(false);
    });
  });

  describe("getInteractionsForLesson", () => {
    it("returns all interactions for a specific lesson", () => {
      const result = getInteractionsForLesson(1);
      expect(result).toHaveLength(4);
      expect(result.every((i) => i.lessonNumber === 1)).toBe(true);
    });
  });

  describe("getInteractionsForPage", () => {
    it("returns all interactions for a specific page in a lesson", () => {
      const result = getInteractionsForPage(1, 10);
      expect(result).toHaveLength(2);
      expect(result.every((i) => i.lessonNumber === 1 && i.pageNumber === 10)).toBe(true);
    });
  });

  describe("getInteractionReadinessForLesson", () => {
    it("calculates readiness for the specified lesson and pages", () => {
      const result = getInteractionReadinessForLesson(1, [10, 11]);

      expect(result).toEqual({
        lessonNumber: 1,
        totalInteractions: 3,
        readyCount: 2, // "verified" + "book-derived"
        pendingArtMappingCount: 1, // "needs-art-mapping"
        pendingTranscriptionCount: 0, // "needs-transcription" on page 12 not included
        hasAnyVerifiedHotspots: true,
      });
    });

    it("returns 0 counts when no pages match", () => {
      const result = getInteractionReadinessForLesson(1, [99]);

      expect(result).toEqual({
        lessonNumber: 1,
        totalInteractions: 0,
        readyCount: 0,
        pendingArtMappingCount: 0,
        pendingTranscriptionCount: 0,
        hasAnyVerifiedHotspots: false,
      });
    });
  });

  describe("getPageInteractionSet", () => {
    it("builds a complete interaction set for a single page", () => {
      const result = getPageInteractionSet(1, 10);

      expect(result).toEqual({
        lessonNumber: 1,
        pageNumber: 10,
        interactions: expect.any(Array),
        hasVerifiedHotspots: true,
        readyCount: 1, // "verified"
        pendingArtCount: 1, // "needs-art-mapping"
        pendingTranscriptionCount: 0,
      });
      expect(result.interactions).toHaveLength(2);
    });
  });
});
