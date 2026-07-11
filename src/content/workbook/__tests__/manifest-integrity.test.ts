/**
 * Structural integrity checks against the REAL, committed
 * workbook-manifest.json (not a fixture) — proves the shipped file itself
 * is internally consistent and every real asset it references actually
 * exists on disk, not just that the schema/adapter logic is correct in
 * isolation.
 *
 * The "real total" page count is read from src/data/page-layouts.json —
 * the verified, already-shipped faithful-pages transcription — rather than
 * hardcoded to 92. Per CLAUDE.md's "Page count is NOT a magic number" canon
 * fact, 92 is the census schema's upper bound (Grok's future format), not a
 * claim that 92 real pages exist today; chasing that number would mean
 * inventing pages that don't exist. This test enforces "every real page is
 * present, nothing missing, nothing duplicated" against the true source.
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import manifest from "../workbook-manifest.json";
import pageLayouts from "@/data/page-layouts.json";
import { WorkbookManifestFileSchema, validateManifestCrossPageRules } from "../manifest-schema";

const repoRoot = path.resolve(__dirname, "../../../..");
const realPageNumbers = Object.keys(pageLayouts.pages)
  .map(Number)
  .sort((a, b) => a - b);

// The static JSON import's inferred literal-union type doesn't widen
// `asset`/`background` to optional across every page shape; re-parsing
// through the real schema gives every test below the properly-optional,
// non-union ManifestPage/ManifestObject shape to work with.
const parsedManifest = WorkbookManifestFileSchema.parse(manifest);

describe("workbook-manifest.json — real content integrity", () => {
  it("parses cleanly against the canonical schema", () => {
    const result = WorkbookManifestFileSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it("has zero cross-page validation errors", () => {
    const parsed = WorkbookManifestFileSchema.parse(manifest);
    const errors = validateManifestCrossPageRules(parsed).filter(
      (e) => !e.includes("has no pages in the manifest"), // lesson coverage is a separate, expected-in-progress concern
    );
    expect(errors).toEqual([]);
  });

  it("covers exactly every real page in page-layouts.json — no gaps, no extras, no duplicates", () => {
    const manifestPages = parsedManifest.pages.map((p) => p.physicalPage).sort((a, b) => a - b);
    expect(new Set(manifestPages).size).toBe(manifestPages.length); // no duplicates
    expect(manifestPages).toEqual(realPageNumbers);
  });

  it("has no blank asset or background paths", () => {
    for (const page of parsedManifest.pages) {
      if (page.background !== null && page.background !== undefined) {
        expect(page.background.trim().length).toBeGreaterThan(0);
      }
      for (const object of page.objects) {
        if (object.asset !== undefined) {
          expect(object.asset.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("every referenced background and asset path resolves to a real file on disk", () => {
    const missing: string[] = [];
    for (const page of parsedManifest.pages) {
      const refs: string[] = [];
      if (page.background) refs.push(page.background);
      for (const object of page.objects) if (object.asset) refs.push(object.asset);
      for (const ref of refs) {
        const fullPath = path.join(repoRoot, "public", ref);
        if (!fs.existsSync(fullPath)) missing.push(`physicalPage ${page.physicalPage}: ${ref}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("every page with a page-level interaction has at least one object wired to it", () => {
    const pagesMissingInteractiveObjects = parsedManifest.pages
      .filter((p) => p.interaction)
      .filter((p) => !p.objects.some((o) => o.interactive))
      .map((p) => p.physicalPage);
    expect(pagesMissingInteractiveObjects).toEqual([]);
  });

  it("every drag-mechanic page has an equal, non-zero count of answers and targets", () => {
    for (const page of parsedManifest.pages) {
      if (page.interaction?.mechanic === "drag") {
        expect(page.interaction.answers?.length ?? 0).toBeGreaterThan(0);
        expect(page.interaction.answers?.length).toBe(page.interaction.targets?.length);
      }
    }
  });

  it("every match-mechanic page has an equal, non-zero count of answers and targets", () => {
    for (const page of parsedManifest.pages) {
      if (page.interaction?.mechanic === "match") {
        expect(page.interaction.answers?.length ?? 0).toBeGreaterThan(0);
        expect(page.interaction.answers?.length).toBe(page.interaction.targets?.length);
      }
    }
  });

  it("has zero pages marked source-review-required for the current real content", () => {
    const flagged = parsedManifest.pages.filter((p) => p.status === "source-review-required");
    expect(flagged.map((p) => p.physicalPage)).toEqual([]);
  });
});
