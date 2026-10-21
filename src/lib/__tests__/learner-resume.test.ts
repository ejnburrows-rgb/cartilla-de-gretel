/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { readLearnerResume, saveLearnerResume } from "../learner-resume";
import { learnerStorageKey } from "../learner-storage";
import { KEYS } from "../storage-keys";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("learner-resume", () => {
  describe("saveLearnerResume", () => {
    it("saves basic lesson and page info", () => {
      saveLearnerResume(5, 10);
      const specificKey = learnerStorageKey(`${KEYS.learnerResume}:5`);
      const genericKey = learnerStorageKey(KEYS.learnerResume);

      const expected = JSON.stringify({ lesson: 5, page: 10 });
      expect(localStorage.getItem(specificKey)).toBe(expected);
      expect(localStorage.getItem(genericKey)).toBe(expected);
    });

    it("includes printedPage when it is a valid integer", () => {
      saveLearnerResume(5, 10, 42);
      const expected = JSON.stringify({ lesson: 5, page: 10, printedPage: 42 });
      expect(localStorage.getItem(learnerStorageKey(KEYS.learnerResume))).toBe(expected);
    });

    it("ignores printedPage when it is not an integer", () => {
      saveLearnerResume(5, 10, 42.5);
      const expected = JSON.stringify({ lesson: 5, page: 10 });
      expect(localStorage.getItem(learnerStorageKey(KEYS.learnerResume))).toBe(expected);
    });

    it("dispatches cartilla:work-save-failed when localStorage.setItem throws", () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error("Quota exceeded");
      });
      const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");

      saveLearnerResume(5, 10);

      expect(setItemSpy).toHaveBeenCalled();
      expect(dispatchEventSpy).toHaveBeenCalled();
      const eventArg = dispatchEventSpy.mock.calls[0][0] as Event;
      expect(eventArg.type).toBe("cartilla:work-save-failed");

      setItemSpy.mockRestore();
    });
  });

  describe("readLearnerResume", () => {
    it("returns null if storage is empty", () => {
      expect(readLearnerResume()).toBeNull();
      expect(readLearnerResume(5)).toBeNull();
    });

    it("returns null if storage contains malformed JSON", () => {
      localStorage.setItem(learnerStorageKey(KEYS.learnerResume), "{ malformed }");
      expect(readLearnerResume()).toBeNull();
    });

    it("returns null if lesson is missing or not an integer", () => {
      localStorage.setItem(learnerStorageKey(KEYS.learnerResume), JSON.stringify({ page: 10 }));
      expect(readLearnerResume()).toBeNull();

      localStorage.setItem(learnerStorageKey(KEYS.learnerResume), JSON.stringify({ lesson: 5.5, page: 10 }));
      expect(readLearnerResume()).toBeNull();
    });

    it("returns null if lesson is out of bounds", () => {
      localStorage.setItem(learnerStorageKey(KEYS.learnerResume), JSON.stringify({ lesson: 0, page: 10 }));
      expect(readLearnerResume()).toBeNull();

      localStorage.setItem(learnerStorageKey(KEYS.learnerResume), JSON.stringify({ lesson: 25, page: 10 }));
      expect(readLearnerResume()).toBeNull();
    });

    it("returns null if page is missing, not an integer, or negative", () => {
      localStorage.setItem(learnerStorageKey(KEYS.learnerResume), JSON.stringify({ lesson: 5 }));
      expect(readLearnerResume()).toBeNull();

      localStorage.setItem(learnerStorageKey(KEYS.learnerResume), JSON.stringify({ lesson: 5, page: 10.5 }));
      expect(readLearnerResume()).toBeNull();

      localStorage.setItem(learnerStorageKey(KEYS.learnerResume), JSON.stringify({ lesson: 5, page: -1 }));
      expect(readLearnerResume()).toBeNull();
    });

    it("returns valid generic resume object", () => {
      const data = { lesson: 5, page: 10, printedPage: 42 };
      localStorage.setItem(learnerStorageKey(KEYS.learnerResume), JSON.stringify(data));

      const result = readLearnerResume();
      expect(result).toEqual(data);
    });

    it("returns valid lesson-specific resume object", () => {
      const genericData = { lesson: 5, page: 10 };
      const specificData = { lesson: 3, page: 5 };

      localStorage.setItem(learnerStorageKey(KEYS.learnerResume), JSON.stringify(genericData));
      localStorage.setItem(learnerStorageKey(`${KEYS.learnerResume}:3`), JSON.stringify(specificData));

      const genericResult = readLearnerResume();
      expect(genericResult).toEqual(genericData);

      const specificResult = readLearnerResume(3);
      expect(specificResult).toEqual(specificData);
    });
  });
});
