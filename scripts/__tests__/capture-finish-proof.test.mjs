import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { expectedOwnerProofCaptures } from "../owner-proof-matrix.mjs";

const HARNESS = fileURLToPath(new URL("../capture-finish-proof.mjs", import.meta.url));
const OWNER_PROOF_CONFIG = fileURLToPath(new URL("../owner-proof-playwright.config.ts", import.meta.url));
const E2E_CAPTURE = fileURLToPath(new URL("../../tests/e2e/finish-proof-capture.spec.ts", import.meta.url));

// Run a real copy of the proof launcher in a disposable local Git checkout.
// The mock installed Playwright CLI only supplies synthetic output files: this tests the
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
if (!process.argv.includes("--config=scripts/owner-proof-playwright.config.ts")) {
  console.error("must use pinned owner-proof server configuration"); process.exit(5);
}
const configText = fs.readFileSync(path.join(process.cwd(), "scripts", "owner-proof-playwright.config.ts"), "utf8");
const activeConfig = configText.slice(configText.indexOf("export default defineConfig"));
if (!activeConfig.includes("quote(process.execPath)") || !activeConfig.includes("quote(viteCli)") ||
    /\b(?:pnpm|powershell)\s+(?:dev|[-\w])/i.test(activeConfig)) {
  console.error("unsafe or PATH-dependent owner-proof web server"); process.exit(6);
}
if (mode === "source-changed") fs.appendFileSync(path.join(process.cwd(), "tracked.txt"), "changed during capture\n");
const matrix = JSON.parse(fs.readFileSync(path.join(__dirname, "expected-matrix.json"), "utf8"));
for (let i = 0; i < (mode === "incomplete" ? 59 : matrix.length); i++) {
  const data = { ...matrix[i] };
  const filename = data.filename;
  if (mode === "bad-metadata" && i === 0) data.route = "/dev-gretel";
  if (mode === "wrong-in-scope-route" && i === 0) data.route = "/cartilla/teacher";
  if (mode === "wrong-source-standard" && i === 0) data.sourceStandards = ["PROJECT_SOURCE_OF_TRUTH.md", "DESIGN.md"];
  if (mode === "duplicate-device") data.device = "phone";
  if (mode === "wrong-printed-page" && i === 0) data.printedPage = 2;
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
  fs.writeFileSync(path.join(cwd, "scripts", "owner-proof-playwright.config.ts"), fs.readFileSync(OWNER_PROOF_CONFIG));
  fs.writeFileSync(path.join(cwd, ".gitignore"), "/node_modules/\n/docs/proofs/final-assembly/runs/\n");
  fs.writeFileSync(path.join(cwd, "tracked.txt"), "committed\n");
  fs.writeFileSync(path.join(playwrightPkg, "package.json"), JSON.stringify({
    name: "@playwright/test", type: "commonjs", exports: { "./cli": "./cli.cjs" },
  }));
  fs.writeFileSync(path.join(playwrightPkg, "cli.cjs"), FAKE_PLAYWRIGHT_CLI);
  fs.writeFileSync(path.join(playwrightPkg, "expected-matrix.json"), JSON.stringify(expectedOwnerProofCaptures()));
  fs.writeFileSync(path.join(cwd, "scripts", "owner-proof-matrix.mjs"), fs.readFileSync(new URL("../owner-proof-matrix.mjs", import.meta.url)));
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
  assert.equal(new Set(meta.captures.map((capture) => capture.filename)).size, 60);
  for (const device of ["phone", "tablet", "laptop", "projector"]) {
    assert.equal(meta.captures.filter((capture) => capture.device === device).length, 15);
  }
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

test("hostile HOME Git fsmonitor cannot execute while capturing source proof", t => {
  const cwd = setup(t);
  const hostileHome = path.join(cwd, "node_modules", "malicious-home");
  fs.mkdirSync(hostileHome, { recursive: true });
  const sentinel = path.join(cwd, "node_modules", "fsmonitor-was-executed");
  const monitor = path.join(hostileHome, process.platform === "win32" ? "fsmonitor.cmd" : "fsmonitor");
  fs.writeFileSync(monitor, process.platform === "win32"
    ? `@echo off\r\necho compromised>"${sentinel}"\r\n`
    : `#!/bin/sh\nprintf compromised > "${sentinel}"\n`, { mode: 0o755 });
  const config = path.join(hostileHome, ".gitconfig");
  fs.writeFileSync(config, `[core]\n  fsmonitor = "${monitor}"\n`);
  // The parent was given hostile configuration; the child must not inherit it.
  const p = runProof(cwd, "success", {
    HOME: hostileHome, GIT_CONFIG_GLOBAL: config,
  });
  assert.equal(p.status, 0, p.stdout + p.stderr);
  assert.equal(fs.existsSync(sentinel), false,
    "proof git status must not execute a HOME-supplied fsmonitor hook");
});

test("sixty duplicate phone captures cannot impersonate four device viewports", t => {
  const cwd = setup(t);
  const p = runProof(cwd, "duplicate-device");
  assert.notEqual(p.status, 0);
  assert.match(p.stdout + p.stderr, /Incorrect owner-proof source\/device matrix entry/);
});

test("correctly named images cannot impersonate another printed source page", t => {
  const cwd = setup(t);
  const p = runProof(cwd, "wrong-printed-page");
  assert.notEqual(p.status, 0);
  assert.match(p.stdout + p.stderr, /Incorrect owner-proof source\/device matrix entry/);
});

test("a PATH-injected Git executable is never used for source provenance", t => {
  const cwd = setup(t);
  const shadowDir = path.join(cwd, "node_modules", "shadow-git");
  fs.mkdirSync(shadowDir, { recursive: true });
  const sentinel = path.join(cwd, "node_modules", "git-shadow-executed");
  fs.writeFileSync(path.join(shadowDir, "git"),
    `#!/bin/sh\nprintf tampered > "${sentinel}"\n`, { mode: 0o755 });
  fs.writeFileSync(path.join(shadowDir, "git.exe"), "not a trusted Git executable");
  const p = runProof(cwd, "success", {
    PATH: shadowDir + path.delimiter + process.env.PATH,
  });
  assert.equal(p.status, 0, p.stdout + p.stderr);
  assert.equal(fs.existsSync(sentinel), false,
    "untrusted Git must never be used for exact-commit provenance");
});


test("every captured route and printed page is unique per device", () => {
  const captures = expectedOwnerProofCaptures();
  assert.equal(captures.length, 60);
  const keys = captures.map(({ route, printedPage, device }) =>
    JSON.stringify([route, printedPage ?? null, device]));
  assert.equal(new Set(keys).size, keys.length,
    "repeated route/page/device screenshots are not independent owner proof");
});


test("Windows child data directories ignore ambient redirect variables", () => {
  const source = fs.readFileSync(HARNESS, "utf8");
  assert.doesNotMatch(source, /process\.env\[(?:name|["'](?:LOCALAPPDATA|APPDATA|TEMP|TMP)["'])\]/);
  for (const variable of ["LOCALAPPDATA", "APPDATA", "TEMP", "TMP"]) {
    assert.match(source, new RegExp(variable + ": existingWindowsDataFolder\\(path\\.join\\(trustedHome,"));
  }
});

test("Flip Chart page 10 waits for loaded source art before capture", () => {
  const source = fs.readFileSync(E2E_CAPTURE, "utf8");
  const pageTen = source.indexOf('toHaveAttribute("data-flipchart-page", "10")');
  const capture = source.indexOf("teacher-flipchart-turn-p10-", pageTen);
  assert.ok(pageTen >= 0 && capture > pageTen, "page 10 capture sequence must exist");
  const readiness = source.slice(pageTen, capture);
  assert.match(readiness, /pageTenArt\.count\(\)/);
  assert.match(readiness, /image\.complete && image\.naturalWidth > 0/);
  assert.match(readiness, /Cargando lámina…/);
});
