import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HARNESS = fileURLToPath(new URL("../capture-finish-proof.mjs", import.meta.url));

// Run a real copy of the proof launcher in a disposable local Git checkout.
// The fake pnpm executable only supplies synthetic output files: this tests the
// integrity guards and never claims to verify actual Workbook rendering.
const FAKE_PLAYWRIGHT_CLI = String.raw`const fs = require("node:fs");
const path = require("node:path");
const dir = process.env.PROOF_DIR;
const mode = fs.readFileSync(path.join(__dirname, "mode.txt"), "utf8").trim();
if (mode === "hostile-path") {
  // Match Playwright webServer shell lookup without actually trusting the parent PATH.
  require("node:child_process").spawnSync("pnpm", ["--version"], { shell: true, stdio: "ignore" });
}
if (!dir) process.exit(3);
if (!process.argv.includes("--workers=1")) { console.error("proof must use one Playwright worker"); process.exit(4); }
if (mode === "source-changed") fs.appendFileSync(path.join(process.cwd(), "tracked.txt"), "changed during capture\n");
for (let i = 0; i < (mode === "incomplete" ? 59 : 60); i++) {
  const filename = "capture-" + String(i).padStart(2, "0") + ".png";
  const data = {
    filename, route: "/cartilla/leccion/1", expectedRoute: "/cartilla/leccion/1", device: "phone",
    surface: "student", lesson: 1, printedPage: 1,
    approvalStatus: "NOT_OWNER_APPROVED",
    sourceStandards: ["WORKBOOK_ARCHETYPE_STANDARD.md", "STUDENT_INTERACTION_STANDARD.md"],
  };
  if (mode === "bad-metadata" && i === 0) data.route = "/dev-gretel";
  if (mode === "wrong-in-scope-route" && i === 0) data.route = "/cartilla/teacher";
  if (mode === "wrong-source-standard" && i === 0) data.sourceStandards = ["PROJECT_SOURCE_OF_TRUTH.md", "DESIGN.md"];
  fs.writeFileSync(path.join(dir, filename), "synthetic test fixture");
  fs.writeFileSync(path.join(dir, filename + ".meta.json"), JSON.stringify(data));
}
`;

function runGit(cwd, ...args) {
  const p = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(p.status, 0, p.stderr);
}

function setup(t) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "cartilla-proof-guard-"));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  fs.mkdirSync(path.join(cwd, "scripts"), { recursive: true });
  const playwrightPkg = path.join(cwd, "node_modules", "@playwright", "test");
  fs.mkdirSync(playwrightPkg, { recursive: true });
  fs.writeFileSync(path.join(cwd, "scripts", "capture-finish-proof.mjs"), fs.readFileSync(HARNESS));
  fs.writeFileSync(path.join(cwd, ".gitignore"), "/node_modules/\n/docs/proofs/final-assembly/runs/\n");
  fs.writeFileSync(path.join(cwd, "tracked.txt"), "committed\n");
  fs.writeFileSync(path.join(playwrightPkg, "package.json"), JSON.stringify({
    name: "@playwright/test", type: "commonjs", exports: { "./cli": "./cli.cjs" },
  }));
  fs.writeFileSync(path.join(playwrightPkg, "cli.cjs"), FAKE_PLAYWRIGHT_CLI);
  runGit(cwd, "init", "-q");
  runGit(cwd, "config", "user.email", "test@invalid.example");
  runGit(cwd, "config", "user.name", "Local Proof Test");
  runGit(cwd, "add", ".");
  runGit(cwd, "commit", "-qm", "baseline");
  return cwd;
}

function runProof(cwd, mode = "success", extraEnv = {}) {
  // Test controls live in the ignored local Playwright fixture, never in the
  // environment forwarded to the proof runner's child process.
  fs.writeFileSync(path.join(cwd, "node_modules", "@playwright", "test", "mode.txt"), mode);
  return spawnSync(process.execPath, ["scripts/capture-finish-proof.mjs"], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...extraEnv },
  });
}

test("clean checkout produces complete, unapproved, versioned proof metadata", t => {
  const cwd = setup(t);
  const p = runProof(cwd);
  assert.equal(p.status, 0, p.stdout + p.stderr);
  const out = p.stdout.match(/Manifest written to: (.*MANIFEST\.json)/);
  assert.ok(out, p.stdout);
  const meta = JSON.parse(fs.readFileSync(out[1].trim(), "utf8"));
  assert.equal(meta.capturedScreenshots.length, 60);
  assert.equal(meta.captures.length, 60);
  assert.equal(meta.ownerApprovalStatus, "NOT_APPROVED_UNTIL_OWNER_REVIEWS_CURRENT_RENDER");
  runGit(cwd, "diff", "--exit-code");
  const status = spawnSync("git", ["status", "--porcelain"], { cwd, encoding: "utf8" });
  assert.equal(status.stdout.trim(), "", "generated proof must remain ignored");
});

test("dirty checkout is rejected before synthetic capture begins", t => {
  const cwd = setup(t);
  fs.appendFileSync(path.join(cwd, "tracked.txt"), "uncommitted\n");
  const p = runProof(cwd);
  assert.notEqual(p.status, 0);
  assert.match(p.stdout + p.stderr, /uncommitted\/dirty checkout/);
  assert.equal(fs.existsSync(path.join(cwd, "docs", "proofs")), false);
});

test("source changed during capture is rejected", t => {
  const cwd = setup(t);
  const p = runProof(cwd, "source-changed");
  assert.notEqual(p.status, 0);
  assert.match(p.stdout + p.stderr, /Source changed during capture/);
});

test("missing screenshots cannot yield a complete manifest", t => {
  const cwd = setup(t);
  const p = runProof(cwd, "incomplete");
  assert.notEqual(p.status, 0);
  assert.match(p.stdout + p.stderr, /expected 60 PNGs, found 59/);
});

test("a screenshot from a development route cannot be accepted", t => {
  const cwd = setup(t);
  const p = runProof(cwd, "bad-metadata");
  assert.notEqual(p.status, 0);
  assert.match(p.stdout + p.stderr, /Invalid or unapproved capture metadata/);
});

test("an otherwise valid but mismatched teacher route is rejected", t => {
  const cwd = setup(t);
  const p = runProof(cwd, "wrong-in-scope-route");
  assert.notEqual(p.status, 0);
  assert.match(p.stdout + p.stderr, /Invalid or unapproved capture metadata/);
});

test("teacher-only standards cannot be used for a student screenshot", t => {
  const cwd = setup(t);
  const p = runProof(cwd, "wrong-source-standard");
  assert.notEqual(p.status, 0);
  assert.match(p.stdout + p.stderr, /Incorrect source standards for screenshot/);
});


test("a hostile ambient PATH cannot launch shadow pnpm or forge source proof", t => {
  const cwd = setup(t);
  const shadowDir = path.join(cwd, "node_modules", "malicious-bin");
  fs.mkdirSync(shadowDir, { recursive: true });
  const sentinel = path.join(cwd, "node_modules", "shadow-was-executed");
  fs.writeFileSync(path.join(shadowDir, "pnpm"),
    `#!/bin/sh\nprintf exploited > "${sentinel}"\n`, { mode: 0o755 });
  fs.writeFileSync(path.join(shadowDir, "pnpm.cmd"),
    `@echo off\r\necho exploited>"${sentinel}"\r\n`);
  const p = runProof(cwd, "hostile-path", {
    PATH: shadowDir + path.delimiter + process.env.PATH,
    NODE_PATH: shadowDir,
  });
  assert.equal(p.status, 0, p.stdout + p.stderr);
  assert.equal(fs.existsSync(sentinel), false,
    "the browser server must never resolve a shadow pnpm from an ambient PATH");
});
