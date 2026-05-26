#!/usr/bin/env node
// Resilient prebuild chain runner.
// Lane C bootstrap: runs each known prebuild step if its script exists; never fails the build.
// Lane B will progressively ship: verify-pdf, extract-art, polish-art, build-art-manifest.

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const CHAIN = [
  "scripts/prebuild-fetch-pdfs.mjs",
  "scripts/verify-pdf.mjs",
  "scripts/extract-art.mjs",
  "scripts/polish-art.mjs",
  "scripts/build-art-manifest.mjs",
];

const started = Date.now();
console.log("[prebuild-chain] starting", new Date().toISOString());

for (const script of CHAIN) {
  const full = path.resolve(process.cwd(), script);
  if (!existsSync(full)) {
    console.log(`[prebuild-chain] skip (not present): ${script}`);
    continue;
  }
  console.log(`[prebuild-chain] running: ${script}`);
  const res = spawnSync("node", [full], { stdio: "inherit" });
  if (res.error) {
    console.warn(`[prebuild-chain] ${script} spawn error: ${res.error.message} — continuing`);
    continue;
  }
  if (res.status !== 0) {
    console.warn(`[prebuild-chain] ${script} exited ${res.status} — continuing`);
  }
}

const elapsed = ((Date.now() - started) / 1000).toFixed(1);
console.log(`[prebuild-chain] done in ${elapsed}s`);
process.exit(0);
