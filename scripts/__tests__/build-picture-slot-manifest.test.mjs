import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..", "..");
const manifestPath = path.join(rootDir, "docs", "proofs", "picture-slot-manifest", "manifest.json");

function build() {
  execFileSync("node", ["scripts/build-picture-slot-manifest.mjs"], { cwd: rootDir, stdio: "pipe" });
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

describe("picture-slot manifest", () => {
  const manifest = build();

  it("covers every one of the 55 true-remainder slots", () => {
    assert.equal(manifest.stillMissingDropIn.length, 55);
    const fc = manifest.stillMissingDropIn.filter((s) => s.section === "FLIP CHART");
    const wb = manifest.stillMissingDropIn.filter((s) => s.section === "WORKBOOK");
    assert.equal(fc.length, 35);
    assert.equal(wb.length, 20);
  });

  it("names an existing drop-in file for every one of the 55 slots (zero rewiring)", () => {
    for (const slot of manifest.stillMissingDropIn) {
      assert.equal(slot.status, "NEEDS-NEW-PICTURE");
      assert.ok(slot.expected_drop_in_path, `no drop-in path for ${slot.slot_id}`);
      const onDisk = path.join(rootDir, "public", slot.expected_drop_in_path);
      assert.ok(fs.existsSync(onDisk), `drop-in path missing on disk: ${slot.expected_drop_in_path}`);
    }
  });

  it("confirms the avion slots wired to the pez file", () => {
    assert.ok(manifest.avionPezSlots.length >= 3, "expected at least the 3 page-layouts slots");
    for (const f of manifest.avionPezSlots) {
      assert.ok(f.artPath.endsWith("leccion-1/pez.webp"));
    }
  });

  it("records no undocumented caption/file-name mismatch", () => {
    assert.equal(manifest.totals.wordFileMismatch, 0);
  });

  it("is deterministic apart from the timestamp", () => {
    const again = build();
    const strip = (m) => JSON.stringify({ ...m, generatedAt: null });
    assert.equal(strip(again), strip(manifest));
  });
});
