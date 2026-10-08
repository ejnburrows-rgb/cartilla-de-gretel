import { execSync } from "node:child_process";
import { describe, it, expect, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../..");
const scriptPath = path.join(root, "scripts/verify-production-assets.mjs");

describe("verify-production-assets.mjs", () => {
  const backupPath = path.join(root, "src/data/page-layouts.json.bak");
  const targetPath = path.join(root, "src/data/page-layouts.json");

  const scanBackupPath = path.join(root, "public/cartilla/art/source/workbook/page-001.jpg.bak");
  const scanTargetPath = path.join(root, "public/cartilla/art/source/workbook/page-001.jpg");

  afterEach(() => {
    // Restore files if test failed and left them renamed
    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, targetPath);
    }
    if (fs.existsSync(scanBackupPath)) {
      fs.renameSync(scanBackupPath, scanTargetPath);
    }
  });

  it("fails fatally when a manifest is missing or unparseable", () => {
    // Rename manifest to simulate missing
    fs.renameSync(targetPath, backupPath);

    let error: any = null;
    try {
      execSync(`node ${scriptPath}`, { stdio: "pipe" });
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(error.status).toBe(1);
    expect(error.stderr.toString()).toContain("ENOENT");

    // Create unparseable manifest
    fs.writeFileSync(targetPath, "{ invalid json }");
    let parseError: any = null;
    try {
      execSync(`node ${scriptPath}`, { stdio: "pipe" });
    } catch (e) {
      parseError = e;
    }
    expect(parseError).not.toBeNull();
    expect(parseError.status).toBe(1);
    expect(parseError.stderr.toString()).toMatch(/SyntaxError|Unexpected token/);

    // Restore
    fs.rmSync(targetPath);
    fs.renameSync(backupPath, targetPath);
  });

  it("fails if a valid runtime Workbook source scan is missing", () => {
    // Rename page-001.jpg to simulate a missing source scan
    fs.renameSync(scanTargetPath, scanBackupPath);

    let error: any = null;
    try {
      execSync(`node ${scriptPath}`, { stdio: "pipe" });
    } catch (e) {
      error = e;
    }

    // Restore
    fs.renameSync(scanBackupPath, scanTargetPath);

    expect(error).not.toBeNull();
    expect(error.status).toBe(1);
    expect(error.stdout.toString()).toContain("page-001.jpg");
    expect(error.stdout.toString()).toContain("ENOENT");
  }, 30000); // give it more time to read all files
});
