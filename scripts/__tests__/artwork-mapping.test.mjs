import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { CSV_PATH, MD_PATH, loadMapping, parseMapping, renderMapping, checkMapping } from "../artwork-mapping.mjs";

const root = path.resolve(import.meta.dirname, "../..");
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "artwork-mapping-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const name of [CSV_PATH, MD_PATH, "AGENTS.md", "PROJECT_SOURCE_OF_TRUTH.md", "README.md", "tasks/plan.md"]) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.copyFileSync(path.join(root, name), path.join(dir, name));
  }
  return dir;
}

test("existing CSV retains all unique placements and deterministic generated totals", () => {
  const rows = loadMapping(root);
  assert.equal(rows.length, 330);
  assert.equal(new Set(rows.map((row) => row.drawing_group_id)).size, 201);
  assert.equal(renderMapping(rows), renderMapping(loadMapping(root)));
  assert.deepEqual(checkMapping(root).errors, []);
  assert.match(renderMapping(rows), /READY never means owner-approved/);
});

test("quoted commas, newlines and escaped quotes survive parsing", () => {
  const header = "artwork_id,drawing_group_id,group_status,placement_status,source_crop_path,destination_path";
  const rows = parseMapping(header + '\r\nA,G,READY,READY,"one, two\nthree","a""b"\r\n');
  assert.equal(rows[0].source_crop_path, "one, two\nthree");
  assert.equal(rows[0].destination_path, 'a"b');
});

test("stale generated report is rejected", (t) => {
  const dir = fixture(t);
  fs.appendFileSync(path.join(dir, MD_PATH), "Owner approved everything\n");
  assert.equal(checkMapping(dir).ok, false);
});

test("old branch cannot be advertised as the current authority", (t) => {
  const dir = fixture(t);
  fs.appendFileSync(path.join(dir, "README.md"), "\n[current master mapping](https://github.com/ejnburrows-rgb/cartilla-de-gretel/blob/evidence/artwork-coverage-20261014/x)\n");
  assert.match(checkMapping(dir).errors.join("\n"), /obsolete branch/);
});

test("duplicate placement and conflicting group records are rejected", () => {
  const rows = loadMapping(root);
  const text = fs.readFileSync(path.join(root, CSV_PATH), "utf8");
  assert.throws(() => parseMapping(text + text.split(/\r?\n/)[1] + "\n"), /duplicate placement/);
  assert.throws(() => renderMapping([...rows, { ...rows[0], group_status: "FALSE_APPROVAL" }]), /Conflicting group/);
});

test("asset CLI enforces mapping drift before certifying files", (t) => {
  const dir = fixture(t);
  fs.appendFileSync(path.join(dir, MD_PATH), "stale\n");
  const result = spawnSync(process.execPath, [path.join(root, "scripts/verify-production-assets.mjs"), `--root=${dir}`], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /stale generated view/);
});

test("asset CLI retains malformed-manifest and missing-scan failures", (t) => {
  const dir = fixture(t);
  fs.mkdirSync(path.join(dir, "src/data"), { recursive: true });
  fs.writeFileSync(path.join(dir, "src/data/page-layouts.json"), "{ invalid }");
  const run = () => spawnSync(process.execPath, [path.join(root, "scripts/verify-production-assets.mjs"), `--root=${dir}`], { encoding: "utf8" });
  const malformed = run();
  assert.equal(malformed.status, 1);
  assert.match(malformed.stderr, /SyntaxError/);
  for (const name of ["page-layouts", "flipchart-production-art", "final-backgrounds", "gretel-approved-master", "gretel-approved-clips"]) {
    fs.writeFileSync(path.join(dir, `src/data/${name}.json`), "{}");
  }
  const missing = run();
  assert.equal(missing.status, 1);
  assert.match(missing.stdout, /page-001.jpg/);
  assert.match(missing.stdout, /ENOENT/);
});
