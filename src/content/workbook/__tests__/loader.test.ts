import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../workbook-manifest.json", () => ({
  default: {
    version: "test-1.0.0",
    pages: [
      { physicalPage: 1, lesson: 1, instruction: "Page one.", objects: [], status: "mapped" },
      { physicalPage: 5, lesson: 2, instruction: "Page five.", objects: [], status: "complete" },
    ],
  },
}));

// Imported after the mock so the mocked JSON is what loader.ts actually reads.
const {
  getWorkbookPage,
  listAvailablePhysicalPages,
  clearWorkbookManifestCache,
  getWorkbookManifest,
} = await import("../loader");

describe("loader", () => {
  beforeEach(() => {
    clearWorkbookManifestCache();
  });

  it("getWorkbookPage returns the matching page converted to the engine shape", () => {
    const page = getWorkbookPage(1);
    expect(page).not.toBeNull();
    expect(page?.pageNumber).toBe(1);
    expect(page?.instruction).toBe("Page one.");
  });

  it("getWorkbookPage returns null for a page not in the manifest (never invents)", () => {
    expect(getWorkbookPage(42)).toBeNull();
  });

  it("listAvailablePhysicalPages returns the real physicalPage numbers, sorted", () => {
    expect(listAvailablePhysicalPages()).toEqual([1, 5]);
  });

  it("getWorkbookManifest exposes the raw parsed manifest", () => {
    const manifest = getWorkbookManifest();
    expect(manifest.version).toBe("test-1.0.0");
    expect(manifest.pages).toHaveLength(2);
  });
});

describe("loader with an invalid manifest", () => {
  it("degrades to an empty manifest and logs an error rather than throwing", async () => {
    vi.resetModules();
    vi.doMock("../workbook-manifest.json", () => ({
      default: { version: "bad", pages: [{ physicalPage: "not-a-number" }] },
    }));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { getWorkbookManifest: getManifestAgain } = await import("../loader");
    const manifest = getManifestAgain();
    expect(manifest.pages).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
    vi.doUnmock("../workbook-manifest.json");
  });
});
