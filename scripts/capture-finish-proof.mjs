import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const proofDir = path.resolve(process.cwd(), "docs/proofs/final-assembly");
const tempDir = path.resolve(process.cwd(), "docs/proofs/final-assembly-tmp");

console.log("Starting finish proof capture...");

// Remove existing temp dir if any
fs.rmSync(tempDir, { recursive: true, force: true });
fs.mkdirSync(tempDir, { recursive: true });

// Record exact commit
const commitHash = spawnSync("git", ["rev-parse", "HEAD"]).stdout.toString().trim();
const runDate = new Date().toISOString();

const metadata = {
  commit: commitHash,
  date: runDate,
  description: "Repeatable local owner-proof capture matrix",
};

const args = [
  "exec",
  "playwright",
  "test",
  "tests/e2e/finish-proof-capture.spec.ts",
  "--project=chromium", // We'll handle viewport sizing inside the spec
  "--update-snapshots=none"
];

console.log(`Running: pnpm ${args.join(" ")}`);

const result = spawnSync("pnpm", args, {
  cwd: process.cwd(),
  env: { ...process.env, PROOF_DIR: tempDir },
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error) throw result.error;
if (result.status !== 0) {
    console.error(`Playwright test failed with status ${result.status}`);
    process.exit(result.status ?? 1);
}

console.log(`Tests passed, moving to final directory and writing metadata atomically...`);

// Remove the old proofs and replace atomically
fs.rmSync(proofDir, { recursive: true, force: true });
fs.renameSync(tempDir, proofDir);

fs.writeFileSync(path.join(proofDir, "capture-metadata.json"), JSON.stringify(metadata, null, 2));

console.log(`Capture complete! Proof saved to docs/proofs/final-assembly/`);
