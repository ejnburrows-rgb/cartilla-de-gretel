import { execFileSync } from "node:child_process";
import { afterAll, describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Exercise the Windows regression even when the checkout itself has no spaces.
const scriptDir = fs.mkdtempSync(path.join(__dirname, "verify script path "));
const scriptPath = path.join(scriptDir, "verify-production-assets.mjs");
fs.copyFileSync(path.resolve(__dirname, "../verify-production-assets.mjs"), scriptPath);
afterAll(() => fs.rmSync(scriptDir, { recursive: true, force: true }));

describe("verify-production-assets.mjs", () => {
  it("fails fatally when a manifest is missing or unparseable", () => {
    // create empty temp dir
    const mockRoot = fs.mkdtempSync(path.join(os.tmpdir(), "verify-test-"));
    let error: any = null;
    try {
      execFileSync(process.execPath, [scriptPath, `--root=${mockRoot}`], { stdio: "pipe" });
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(error.status).toBe(1);
    expect(error.stderr.toString()).toContain("ENOENT");

    // Create unparseable manifest
    fs.mkdirSync(path.join(mockRoot, "src/data"), { recursive: true });
    fs.writeFileSync(path.join(mockRoot, "src/data/page-layouts.json"), "{ invalid }");
    let parseError: any = null;
    try {
      execFileSync(process.execPath, [scriptPath, `--root=${mockRoot}`], { stdio: "pipe" });
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
    fs.mkdirSync(path.join(mockRoot, "src/data"), { recursive: true });
    fs.writeFileSync(path.join(mockRoot, "src/data/page-layouts.json"), "[]");
    fs.writeFileSync(path.join(mockRoot, "src/data/flipchart-production-art.json"), "[]");
    fs.writeFileSync(path.join(mockRoot, "src/data/final-backgrounds.json"), "{}");
    fs.writeFileSync(path.join(mockRoot, "src/data/gretel-approved-master.json"), "{}");
    fs.writeFileSync(path.join(mockRoot, "src/data/gretel-approved-clips.json"), "{}");

    let error: any = null;
    try {
      execFileSync(process.execPath, [scriptPath, `--root=${mockRoot}`], { stdio: "pipe" });
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
