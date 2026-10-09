import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  runPerformanceBudgetCheck,
  BUDGET_LIMITS,
} from "../scripts/verify-performance-budget.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const PROOFS_DIR = path.join(ROOT_DIR, "docs", "proofs", "performance-budget");

describe("Local Performance Budget & Teacher Route Chunking", () => {
  let result;

  beforeAll(() => {
    // Run the performance budget check against dist/ (auto-builds if needed)
    result = runPerformanceBudgetCheck({
      autoBuild: true,
      writeReports: process.env.WRITE_PERF_REPORTS === "true",
    });
  });

  it("passes all budget checks without violations", () => {
    expect(result.violations).toEqual([]);
    expect(result.passed).toBe(true);
  });

  it("keeps Entry JS within raw and gzipped size budgets", () => {
    expect(result.entryJs.sizes.raw).toBeLessThanOrEqual(BUDGET_LIMITS.entryJsRawMax);
    expect(result.entryJs.sizes.gzip).toBeLessThanOrEqual(BUDGET_LIMITS.entryJsGzipMax);
  });

  it("keeps Entry CSS within raw and gzipped size budgets", () => {
    expect(result.entryCss.sizes.raw).toBeLessThanOrEqual(BUDGET_LIMITS.entryCssRawMax);
    expect(result.entryCss.sizes.gzip).toBeLessThanOrEqual(BUDGET_LIMITS.entryCssGzipMax);
  });

  it("keeps total first-paint JS payload within budget", () => {
    expect(result.totalFirstPaintJs.raw).toBeLessThanOrEqual(
      BUDGET_LIMITS.totalFirstPaintJsRawMax,
    );
    expect(result.totalFirstPaintJs.gzip).toBeLessThanOrEqual(
      BUDGET_LIMITS.totalFirstPaintJsGzipMax,
    );
  });

  it("ensures all required teacher routes are lazily chunked", () => {
    const teacherChunks = result.teacherChunks;
    expect(teacherChunks["flipchart.lazy"]).not.toBeNull();
    expect(teacherChunks["admin.lazy"]).not.toBeNull();
    expect(teacherChunks["reportes.lazy"]).not.toBeNull();
    expect(teacherChunks["roster.lazy"]).not.toBeNull();
    expect(teacherChunks["crm.artwork.lazy"]).not.toBeNull();
    expect(teacherChunks["crm.index.lazy"]).not.toBeNull();
    expect(teacherChunks["route.lazy"]).not.toBeNull();
    expect(teacherChunks["guia._n.lazy"]).not.toBeNull();

    // Verify chunk sizes exist and are non-zero
    Object.values(teacherChunks).forEach((chunk) => {
      expect(chunk).not.toBeNull();
      expect(chunk.sizes.raw).toBeGreaterThan(0);
    });
  });

  it("isolates heavy route assets and prevents preloading in index.html", () => {
    expect(result.isolation.violations).toEqual([]);
  });

  it("generates repeatable baseline proof reports in docs/proofs/performance-budget/", () => {
    const jsonPath = path.join(PROOFS_DIR, "baseline-report.json");
    const mdPath = path.join(PROOFS_DIR, "PERFORMANCE_BUDGET.md");

    expect(fs.existsSync(jsonPath)).toBe(true);
    expect(fs.existsSync(mdPath)).toBe(true);

    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    expect(jsonContent.passed).toBe(true);
    expect(jsonContent.violations).toEqual([]);
  });
});
