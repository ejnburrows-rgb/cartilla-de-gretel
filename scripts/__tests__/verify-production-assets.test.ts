import { execSync } from "node:child_process";
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const scriptPath = path.resolve(__dirname, "../verify-production-assets.mjs");

function copyMappingFixture(mockRoot: string) {
  const repoRoot = path.resolve(__dirname, "../..");
  for (const name of [
    "docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv",
    "docs/artwork-reconciliation/mapping/MASTER-MAPPING.md",
    "AGENTS.md", "PROJECT_SOURCE_OF_TRUTH.md", "README.md", "tasks/plan.md",
  ]) {
    fs.mkdirSync(path.dirname(path.join(mockRoot, name)), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, name), path.join(mockRoot, name));
  }
}


describe("verify-production-assets.mjs", () => {
  it("fails fatally when a manifest is missing or unparseable", () => {
    // create empty temp dir
    const mockRoot = fs.mkdtempSync(path.join(os.tmpdir(), "verify-test-"));
    let error: any = null;
    try {
      execSync(`node ${scriptPath} --root=${mockRoot}`, { stdio: "pipe" });
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(error.status).toBe(1);
    expect(error.stderr.toString()).toContain("ENOENT");

    copyMappingFixture(mockRoot);

    // Create unparseable manifest
    fs.mkdirSync(path.join(mockRoot, "src/data"), { recursive: true });
    fs.writeFileSync(path.join(mockRoot, "src/data/page-layouts.json"), "{ invalid }");
    let parseError: any = null;
    try {
      execSync(`node ${scriptPath} --root=${mockRoot}`, { stdio: "pipe" });
    } catch (e) {
      parseError = e;
    }
    expect(parseError).not.toBeNull();
    expect(parseError.status).toBe(1);
    expect(parseError.stderr.toString()).toMatch(/SyntaxError|Unexpected token/);

    fs.rmSync(mockRoot, { recursive: true, force: true });
  });

  it("fails if a valid runtime Workbook source scan is missing", () => {
    const mockRoot = fs.mkdtempSync(path.join(os.tmpdir(), "verify-test2-"));
    copyMappingFixture(mockRoot);
    fs.mkdirSync(path.join(mockRoot, "src/data"), { recursive: true });
    fs.writeFileSync(path.join(mockRoot, "src/data/page-layouts.json"), "[]");
    fs.writeFileSync(path.join(mockRoot, "src/data/flipchart-production-art.json"), "[]");
    fs.writeFileSync(path.join(mockRoot, "src/data/final-backgrounds.json"), "{}");
    fs.writeFileSync(path.join(mockRoot, "src/data/gretel-approved-master.json"), "{}");
    fs.writeFileSync(path.join(mockRoot, "src/data/gretel-approved-clips.json"), "{}");

    let error: any = null;
    try {
      execSync(`node ${scriptPath} --root=${mockRoot}`, { stdio: "pipe" });
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(error.status).toBe(1);
    expect(error.stdout.toString()).toContain("page-001.jpg");
    expect(error.stdout.toString()).toContain("ENOENT");

    fs.rmSync(mockRoot, { recursive: true, force: true });
  });
});
