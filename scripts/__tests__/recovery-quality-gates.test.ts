import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("recovery quality gates", () => {
  it("separates compare-only verification from deliberate snapshot updates", () => {
    const scripts = JSON.parse(read("package.json")).scripts as Record<string, string>;
    expect(scripts["test:visual"]).toContain("--update-snapshots=none");
    expect(scripts["test:visual:update"]).toContain("--update-snapshots=all");
    expect(scripts["test:visual:3x"]).not.toContain("update-snapshots=all");
  });

  it("runs the same compare-only visual gate three times and stops on failure", () => {
    const script = read("scripts/run-visual-gate-3x.mjs");
    expect(script).toContain("run <= 3");
    expect(script).toContain("--update-snapshots=none");
    expect(script).toContain("process.exit(result.status ?? 1)");
    expect(script).not.toContain("--update-snapshots=all");
  });

  it("records semantic coverage and deterministic source-art identity", () => {
    const coverage = JSON.parse(read("tests/e2e/recovery-visual-coverage.json"));
    const inventory = JSON.parse(read("docs/production-art-inventory.json"));
    expect(coverage.viewports).toEqual(["desktop", "tablet", "mobile"]);
    expect(coverage.lessonSnapshots.state).toBe("initial-settled-page");
    expect(coverage.presenterSnapshots.lessons.length).toBeGreaterThan(0);
    expect(inventory.errors).toEqual([]);
    expect(inventory.assetSetSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(inventory.assets.length).toBeGreaterThan(0);
  });

  it("keeps required CI failures fatal", () => {
    const workflow = read(".github/workflows/visual-audit.yml");
    expect(workflow).toContain("run: pnpm build");
    expect(workflow).toContain("run: pnpm visual:metadata:check");
    expect(workflow).toContain("run: pnpm test:visual");
    expect(workflow).not.toContain("continue-on-error");
  });
});
