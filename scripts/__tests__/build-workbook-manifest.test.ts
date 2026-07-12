import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const rootDir = path.resolve(__dirname, "../..");
const scriptPath = path.join(rootDir, "scripts/build-workbook-manifest.mjs");
const fixturesDir = path.join(rootDir, "scripts/fixtures/sample-workbook-census");

function runBuild(args: string[]): string {
  return execFileSync("node", [scriptPath, ...args], { encoding: "utf8", cwd: rootDir });
}

const tmpOutputs: string[] = [];
function tmpOut(): string {
  const p = path.join(
    os.tmpdir(),
    `manifest-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
  );
  tmpOutputs.push(p);
  return p;
}

afterEach(() => {
  for (const p of tmpOutputs.splice(0)) {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
});

describe("build-workbook-manifest.mjs", () => {
  it("degrades gracefully with zero inputs: produces a valid empty manifest, no crash", () => {
    const out = tmpOut();
    const stdout = runBuild([`--out=${out}`]);
    expect(stdout).toContain("SKIPPED");
    const manifest = JSON.parse(fs.readFileSync(out, "utf8"));
    expect(manifest.pages).toEqual([]);
    expect(typeof manifest.version).toBe("string");
  });

  it("merges the 4 sample census fixtures into a correct, honest manifest", () => {
    const out = tmpOut();
    runBuild([
      `--master=${path.join(fixturesDir, "cartilla_92_page_master_map.sample.csv")}`,
      `--content=${path.join(fixturesDir, "cartilla_page_content_extract.sample.csv")}`,
      `--interactions=${path.join(fixturesDir, "cartilla_interaction_content.sample.json")}`,
      `--crop=${path.join(fixturesDir, "cartilla_crop_manifest.sample.csv")}`,
      `--out=${out}`,
    ]);
    const manifest = JSON.parse(fs.readFileSync(out, "utf8"));
    expect(manifest.pages).toHaveLength(2);

    const page1 = manifest.pages.find((p: { physicalPage: number }) => p.physicalPage === 1);
    expect(page1.instruction).toBe("Sample instruction, with an embedded comma.");
    expect(page1.objects).toHaveLength(2);
    expect(page1.status).toBe("implementation-ready");

    // page 2's crop-manifest row has no percent box — must be skipped, not invented.
    const page2 = manifest.pages.find((p: { physicalPage: number }) => p.physicalPage === 2);
    expect(page2.objects).toEqual([]);
    expect(page2.status).toBe("mapped");
  });

  it("tolerates a missing input file with a clear SKIPPED note instead of crashing", () => {
    const out = tmpOut();
    const stdout = runBuild([
      `--master=${path.join(fixturesDir, "does-not-exist.csv")}`,
      `--out=${out}`,
    ]);
    expect(stdout).toContain("SKIPPED master map");
    const manifest = JSON.parse(fs.readFileSync(out, "utf8"));
    expect(manifest.pages).toEqual([]);
  });

  it("never invents an object position: a percent-less crop row is skipped with a warning, not a guessed value", () => {
    const out = tmpOut();
    const stdout = runBuild([
      `--crop=${path.join(fixturesDir, "cartilla_crop_manifest.sample.csv")}`,
      `--out=${out}`,
    ]);
    expect(stdout).toContain("no percent box");
    const manifest = JSON.parse(fs.readFileSync(out, "utf8"));
    const allObjectIds = manifest.pages.flatMap((p: { objects: Array<{ id: string }> }) =>
      p.objects.map((o) => o.id),
    );
    expect(allObjectIds).not.toContain("pixel-only-object");
  });
});
