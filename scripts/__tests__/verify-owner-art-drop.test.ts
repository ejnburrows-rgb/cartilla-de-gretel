import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { verifyArtDrop } from "../verify-owner-art-drop.mjs";

vi.mock("sharp", () => {
  return {
    default: (filePath) => {
      if (filePath.endsWith("invalid.jpg")) {
        return {
          metadata: async () => {
            throw new Error("Invalid image");
          },
        };
      }
      return {
        metadata: async () => ({
          format: "webp",
          width: 800,
          height: 600,
        }),
      };
    },
  };
});

describe("verifyArtDrop", () => {
  const auditPath = path.join(process.cwd(), "docs", "production-art-classification-audit.json");

  const originalCwd = process.cwd;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock filesystem methods
    vi.spyOn(fs, "existsSync").mockImplementation((p) => {
      if (p === auditPath) return true;
      if (p === "/mock/drop") return true;
      return false;
    });

    vi.spyOn(fs, "readFileSync").mockImplementation((p) => {
      if (p === auditPath) {
        return JSON.stringify({
          faithfulAudit: [
            { src: "/path/to/slot1.webp", classification: "PENDING NO VERIFIED SOURCE" },
            { src: "/path/to/slot2.webp", classification: "PENDING NO VERIFIED SOURCE" },
            { src: "/path/to/other.webp", classification: "PASS" },
          ],
        });
      }
      return "";
    });

    vi.spyOn(fs, "statSync").mockImplementation((p) => {
      return {
        isDirectory: () => false,
        size: 1024,
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should detect matching slots, missing slots, unknown files, and invalid files", async () => {
    vi.spyOn(fs, "readdirSync").mockImplementation(() => {
      return ["slot1.webp", "unknown.webp", "invalid.jpg"];
    });

    const report = await verifyArtDrop("/mock/drop");

    expect(report.expectedPendingCount).toBe(2);
    expect(report.dropFileCount).toBe(3);

    expect(report.matches.length).toBe(1);
    expect(report.matches[0].file.filename).toBe("slot1.webp");
    expect(report.matches[0].slots).toEqual(["/path/to/slot1.webp"]);

    expect(report.missingSlots.length).toBe(1);
    expect(report.missingSlots[0]).toBe("/path/to/slot2.webp");

    expect(report.unknownFiles.length).toBe(1);
    expect(report.unknownFiles[0].filename).toBe("unknown.webp");

    expect(report.invalidFiles.length).toBe(1);
    expect(report.invalidFiles[0].filename).toBe("invalid.jpg");
  });

  it("should handle ambiguous matches when a filename applies to multiple missing slots", async () => {
    vi.spyOn(fs, "readFileSync").mockImplementation((p) => {
      if (p === auditPath) {
        return JSON.stringify({
          faithfulAudit: [
            { src: "/path/to/slot1.webp", classification: "PENDING NO VERIFIED SOURCE" },
            { src: "/another/path/to/slot1.webp", classification: "PENDING NO VERIFIED SOURCE" },
          ],
        });
      }
      return "";
    });

    vi.spyOn(fs, "readdirSync").mockImplementation(() => {
      return ["slot1.webp"];
    });

    const report = await verifyArtDrop("/mock/drop");

    expect(report.expectedPendingCount).toBe(2);
    expect(report.dropFileCount).toBe(1);

    expect(report.matches.length).toBe(1);
    expect(report.matches[0].slots.length).toBe(2);
    expect(report.matches[0].slots).toContain("/path/to/slot1.webp");
    expect(report.matches[0].slots).toContain("/another/path/to/slot1.webp");
    expect(report.matches[0].note).toBeDefined();

    expect(report.missingSlots.length).toBe(0);
  });
});
