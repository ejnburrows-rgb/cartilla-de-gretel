/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  cacheFolderAssignments,
  readCachedFolderAssignments,
} from "../folder-assignments-cache";
import type { FolderAssignment } from "../folder-assignments.functions";

describe("folder-assignments-cache", () => {
  const classId = "test-class-id";
  const KEY_PREFIX = "cartilla.folder-assignments.v1.";
  const storageKey = KEY_PREFIX + classId;
  const mockAssignments = [
    { id: "1", folder_id: 10, class_id: classId, order_index: 0 },
  ] as unknown as FolderAssignment[];

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("cacheFolderAssignments", () => {
    it("saves assignments to localStorage", () => {
      cacheFolderAssignments(classId, mockAssignments);
      const stored = localStorage.getItem(storageKey);
      expect(stored).toBe(JSON.stringify(mockAssignments));
    });

    it("does nothing if window is undefined", () => {
      const originalWindow = globalThis.window;
      // @ts-ignore
      delete globalThis.window;

      cacheFolderAssignments(classId, mockAssignments);

      globalThis.window = originalWindow;
      expect(localStorage.getItem(storageKey)).toBeNull();
    });

    it("ignores errors thrown during stringify or setItem", () => {
      // Mock setItem to throw
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      // Should not throw
      expect(() => {
        cacheFolderAssignments(classId, mockAssignments);
      }).not.toThrow();
    });
  });

  describe("readCachedFolderAssignments", () => {
    it("reads assignments from localStorage", () => {
      localStorage.setItem(storageKey, JSON.stringify(mockAssignments));
      const result = readCachedFolderAssignments(classId);
      expect(result).toEqual(mockAssignments);
    });

    it("returns empty array if no data exists", () => {
      const result = readCachedFolderAssignments(classId);
      expect(result).toEqual([]);
    });

    it("returns empty array if window is undefined", () => {
      localStorage.setItem(storageKey, JSON.stringify(mockAssignments));

      const originalWindow = globalThis.window;
      // @ts-ignore
      delete globalThis.window;

      const result = readCachedFolderAssignments(classId);

      globalThis.window = originalWindow;
      expect(result).toEqual([]);
    });

    it("returns empty array if parsed data is not an array", () => {
      localStorage.setItem(storageKey, JSON.stringify({ notAnArray: true }));
      const result = readCachedFolderAssignments(classId);
      expect(result).toEqual([]);
    });

    it("returns empty array and ignores errors during parse", () => {
      localStorage.setItem(storageKey, "invalid-json");
      const result = readCachedFolderAssignments(classId);
      expect(result).toEqual([]);
    });
  });
});
