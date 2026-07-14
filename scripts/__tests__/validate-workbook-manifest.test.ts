import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const rootDir = path.resolve(__dirname, "../..");
const scriptPath = path.join(rootDir, "scripts/validate-workbook-manifest.mjs");

const tmpFiles: string[] = [];
function writeTmpManifest(manifest: unknown): string {
  const p = path.join(
    os.tmpdir(),
    `validate-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
  );
  fs.writeFileSync(p, JSON.stringify(manifest));
  tmpFiles.push(p);
  return p;
}

function runValidate(manifestPath: string): { status: number; output: string } {
  try {
    const output = execFileSync("node", [scriptPath, manifestPath], { encoding: "utf8" });
    return { status: 0, output };
  } catch (e) {
    const err = e as { status: number; stdout: string };
    return { status: err.status, output: err.stdout };
  }
}

afterEach(() => {
  for (const p of tmpFiles.splice(0)) if (fs.existsSync(p)) fs.unlinkSync(p);
});

function basePage(overrides: Record<string, unknown> = {}) {
  return {
    physicalPage: 1,
    lesson: 1,
    instruction: "Real instruction.",
    objects: [],
    status: "mapped",
    ...overrides,
  };
}

describe("validate-workbook-manifest.mjs — asset existence + blank-path checks", () => {
  it("fails when a background path doesn't resolve to a real file on disk", () => {
    const p = writeTmpManifest({
      version: "test",
      pages: [basePage({ background: "/does/not/exist.jpg" })],
    });
    const result = runValidate(p);
    expect(result.status).not.toBe(0);
    expect(result.output).toContain("does not exist on disk");
  });

  it("fails when an object's asset path is blank", () => {
    const p = writeTmpManifest({
      version: "test",
      pages: [
        basePage({
          objects: [{ id: "a", type: "shape", x: 0, y: 0, width: 10, asset: "   " }],
        }),
      ],
    });
    const result = runValidate(p);
    expect(result.status).not.toBe(0);
    expect(result.output).toContain("asset is blank");
  });

  it("fails when an object's asset path doesn't resolve to a real file", () => {
    const p = writeTmpManifest({
      version: "test",
      pages: [
        basePage({
          objects: [{ id: "a", type: "shape", x: 0, y: 0, width: 10, asset: "/nope.webp" }],
        }),
      ],
    });
    const result = runValidate(p);
    expect(result.status).not.toBe(0);
    expect(result.output).toContain("does not exist on disk");
  });

  it("passes when background/asset paths resolve to real public/ files", () => {
    const p = writeTmpManifest({
      version: "test",
      pages: [
        basePage({
          background: "/art/hd/gretel-authentic.jpg",
          objects: [
            {
              id: "a",
              type: "illustration",
              x: 0,
              y: 0,
              width: 10,
              asset: "/cartilla/art/faithful/vocal-a/anillo.webp",
            },
          ],
        }),
      ],
    });
    const result = runValidate(p);
    // A single-page fixture legitimately fails the real-page-count check
    // (it isn't trying to cover all 90 real pages) — this test only cares
    // that no asset/background/blank-path error fires for real, valid paths.
    expect(result.output).not.toContain("does not exist on disk");
    expect(result.output).not.toContain("is blank");
  });

  it("accepts the source-review-required status value", () => {
    const p = writeTmpManifest({
      version: "test",
      pages: [basePage({ status: "source-review-required" })],
    });
    const result = runValidate(p);
    expect(result.output).not.toContain("unknown status");
  });
});
