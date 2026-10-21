#!/usr/bin/env node
/**
 * Prep-time download of the on-device Spanish speech model for the tutor's
 * "VoskEars" engine (spec §3, §18.2). No binary is ever committed to git.
 *
 * What it does:
 *  1. downloads the official `vosk-model-small-es-0.42` zip from
 *     alphacephei.com (Apache-2.0 licensed model, ~39 MB);
 *  2. verifies the pinned SHA-256 and byte size (the site publishes no
 *     checksum file; this digest was captured from the official release
 *     download on 2026-10-21 and is pinned here so every later run verifies
 *     against it);
 *  3. re-packs it as the tar.gz archive format that vosk-browser's WASM
 *     worker loads;
 *  4. writes it to public/models/vosk/ (served by the app, same-origin,
 *     git-ignored).
 *
 * Idempotent: if the output already exists, the script exits successfully
 * without touching the network (use --force to re-download).
 *
 * Usage:
 *   node scripts/fetch-vosk-model.mjs [--force]
 *
 * Requires the `unzip` and `tar` command-line tools (repacking needs a real
 * archive reader; the script fails with a clear message if either is absent).
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MODEL_NAME = "vosk-model-small-es-0.42";
const MODEL_URL = `https://alphacephei.com/vosk/models/${MODEL_NAME}.zip`;
// Pinned integrity of the official release (captured 2026-10-21).
const EXPECTED_SHA256 =
  "09b239888f633ef2f0b4e09736e3d9936acfd810bc65d53fad45261762c6511f";
const EXPECTED_BYTES = 39_817_833;

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const OUT_PATH = path.join(
  REPO_ROOT,
  "public",
  "models",
  "vosk",
  `${MODEL_NAME}.tar.gz`,
);

const force = process.argv.includes("--force");

function fail(message) {
  console.error(`fetch-vosk-model: ${message}`);
  process.exit(1);
}

if (!force && fileExists(OUT_PATH)) {
  console.log(
    `fetch-vosk-model: ${MODEL_NAME}.tar.gz already present at ${path.relative(REPO_ROOT, OUT_PATH)} (use --force to re-download)`,
  );
  process.exit(0);
}

console.log(`fetch-vosk-model: downloading ${MODEL_URL}`);

const zipPath = path.join(
  tmpdir(),
  `cartilla-${MODEL_NAME}-${process.pid}.zip`,
);
const extractDir = path.join(
  tmpdir(),
  `cartilla-${MODEL_NAME}-${process.pid}`,
);

try {
  const response = await fetch(MODEL_URL);
  if (!response.ok || !response.body) {
    fail(`download failed: HTTP ${response.status}`);
  }
  const hash = createHash("sha256");
  let bytes = 0;
  const { createWriteStream } = await import("node:fs");
  const stream = createWriteStream(zipPath);
  const reader = response.body.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      hash.update(value);
      if (!stream.write(value)) {
        await new Promise((resolve) => stream.once("drain", resolve));
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    await new Promise((resolve, reject) => {
      stream.end((error) => (error ? reject(error) : resolve()));
    });
  }

  const sha256 = hash.digest("hex");
  if (bytes !== EXPECTED_BYTES) {
    fail(
      `size mismatch: expected ${EXPECTED_BYTES} bytes, downloaded ${bytes}. Refusing to continue.`,
    );
  }
  if (sha256 !== EXPECTED_SHA256) {
    fail(
      `SHA-256 mismatch:\n  expected ${EXPECTED_SHA256}\n  got      ${sha256}\nThe download may be corrupted or the upstream model changed. Verify by hand before changing the pinned hash.`,
    );
  }
  console.log(`fetch-vosk-model: verified SHA-256 ${sha256}`);

  // --- unzip → tar.gz (vosk-browser loads models as gzipped tar archives) ---
  requireTool("unzip", ["-v"], "unzip");
  requireTool("tar", ["--version"], "tar");

  rmSync(extractDir, { recursive: true, force: true });
  run("unzip", ["-q", zipPath, "-d", extractDir]);
  const modelDir = path.join(extractDir, MODEL_NAME);
  try {
    if (!statSync(modelDir).isDirectory()) throw new Error("not a directory");
  } catch {
    fail(`unexpected archive layout: ${MODEL_NAME}/ not found inside the zip`);
  }

  mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  run("tar", ["-czf", OUT_PATH, "-C", extractDir, MODEL_NAME]);

  const outStat = statSync(OUT_PATH);
  console.log(
    `fetch-vosk-model: wrote ${path.relative(REPO_ROOT, OUT_PATH)} (${Math.round(outStat.size / 1e6)} MB) — git-ignored, never commit this binary`,
  );
} finally {
  rmSync(zipPath, { force: true });
  rmSync(extractDir, { recursive: true, force: true });
}

function fileExists(target) {
  try {
    return statSync(target).isFile();
  } catch {
    return false;
  }
}

function requireTool(command, versionArgs, label) {
  const probe = spawnSync(command, versionArgs, { encoding: "utf8" });
  if (probe.error) {
    fail(`the "${label}" command-line tool is required but not installed`);
  }
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    fail(
      `${command} ${args.join(" ")} failed (exit ${result.status}): ${result.stderr?.trim() ?? ""}`,
    );
  }
}