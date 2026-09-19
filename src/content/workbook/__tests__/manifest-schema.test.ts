import { describe, it, expect } from "vitest";
import {
  ManifestPageSchema,
  WorkbookManifestFileSchema,
  validateManifestCrossPageRules,
  type WorkbookManifestFile,
} from "../manifest-schema";

function validPage(overrides: Partial<Parameters<typeof ManifestPageSchema.parse>[0]> = {}) {
  return {
    physicalPage: 1,
    lesson: 1,
    instruction: "Sample instruction.",
    objects: [{ id: "obj-1", type: "shape", x: 10, y: 10, width: 20 }],
    status: "mapped",
    ...overrides,
  };
}

describe("manifest-schema", () => {
  it("accepts a valid page", () => {
    const result = ManifestPageSchema.safeParse(validPage());
    expect(result.success).toBe(true);
  });

  it("rejects an out-of-range percent box", () => {
    const result = ManifestPageSchema.safeParse(
      validPage({ objects: [{ id: "obj-1", type: "shape", x: 150, y: 10, width: 20 }] }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a negative percent box", () => {
    const result = ManifestPageSchema.safeParse(
      validPage({ objects: [{ id: "obj-1", type: "shape", x: -5, y: 10, width: 20 }] }),
    );
    expect(result.success).toBe(false);
  });

  it("requires at least one non-empty answer for mechanics that need one", () => {
    const result = ManifestPageSchema.safeParse(validPage({ interaction: { mechanic: "select" } }));
    expect(result.success).toBe(false);
  });

  it("accepts a mechanic that needs answers when answers are present", () => {
    const result = ManifestPageSchema.safeParse(
      validPage({ interaction: { mechanic: "select", answers: ["obj-1"] } }),
    );
    expect(result.success).toBe(true);
  });

  it("does not require answers for mechanics that don't need them (read/trace/none)", () => {
    const result = ManifestPageSchema.safeParse(validPage({ interaction: { mechanic: "read" } }));
    expect(result.success).toBe(true);
  });

  it("rejects physicalPage outside 1-92", () => {
    expect(ManifestPageSchema.safeParse(validPage({ physicalPage: 0 })).success).toBe(false);
    expect(ManifestPageSchema.safeParse(validPage({ physicalPage: 93 })).success).toBe(false);
  });

  it("rejects an unknown status", () => {
    expect(ManifestPageSchema.safeParse(validPage({ status: "bogus" })).success).toBe(false);
  });

  it("accepts a full manifest file with valid pages", () => {
    const manifest = { version: "1.0.0", pages: [validPage()] };
    expect(WorkbookManifestFileSchema.safeParse(manifest).success).toBe(true);
  });

  describe("validateManifestCrossPageRules", () => {
    function manifest(pages: WorkbookManifestFile["pages"]): WorkbookManifestFile {
      return { version: "1.0.0", pages };
    }

    it("flags a duplicate physicalPage", () => {
      const errors = validateManifestCrossPageRules(
        manifest([
          { ...validPage(), physicalPage: 1 },
          { ...validPage(), physicalPage: 1 },
        ] as WorkbookManifestFile["pages"]),
      );
      expect(errors.some((e) => e.includes("duplicate physicalPage"))).toBe(true);
    });

    it("flags duplicate object ids on the same page", () => {
      const page = validPage({
        objects: [
          { id: "dup", type: "shape", x: 10, y: 10, width: 20 },
          { id: "dup", type: "shape", x: 30, y: 10, width: 20 },
        ],
      });
      const errors = validateManifestCrossPageRules(
        manifest([page] as WorkbookManifestFile["pages"]),
      );
      expect(errors.some((e) => e.includes('duplicate object id "dup"'))).toBe(true);
    });

    it("flags an object marked interactive with no page-level interaction", () => {
      const page = validPage({
        objects: [{ id: "obj-1", type: "shape", x: 10, y: 10, width: 20, interactive: true }],
      });
      const errors = validateManifestCrossPageRules(
        manifest([page] as WorkbookManifestFile["pages"]),
      );
      expect(
        errors.some((e) => e.includes("marked interactive but the page has no interaction")),
      ).toBe(true);
    });

    it("reports every lesson 1-24 with no pages", () => {
      const errors = validateManifestCrossPageRules(
        manifest([validPage()] as WorkbookManifestFile["pages"]),
      );
      expect(errors.filter((e) => e.includes("has no pages in the manifest")).length).toBe(23);
    });

    it("returns no errors for a clean, fully-covered manifest", () => {
      const pages = Array.from({ length: 24 }, (_, i) =>
        validPage({ physicalPage: i + 1, lesson: i + 1 }),
      );
      const errors = validateManifestCrossPageRules(
        manifest(pages as WorkbookManifestFile["pages"]),
      );
      expect(errors).toEqual([]);
    });
  });
});
