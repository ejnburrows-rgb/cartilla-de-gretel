#!/usr/bin/env node
/**
 * CLI for Milestone 4 Automated Recording Intake & Lip-Sync Pipeline.
 *
 * Usage:
 *   node scripts/tutor-intake/cli.mjs check-guard
 *   node scripts/tutor-intake/cli.mjs prove-approved [--no-report]
 *   node scripts/tutor-intake/cli.mjs ingest --batch <id> [--apply] [--authorized --approval "<ref>"] <files...>
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_PRIVATE_VOICE_DIR } from "./constants.mjs";
import {
  proveApprovedRecordings,
  runTutorIntake,
  validateIntakeRepositoryGuard,
} from "./index.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const opts = {
    command,
    files: [],
    batchId: "batch",
    date: new Date().toISOString().slice(0, 10),
    privateDir: DEFAULT_PRIVATE_VOICE_DIR,
    dryRun: true,
    authorized: false,
    approval: "",
    writeReport: true,
  };

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--batch" && rest[i + 1]) {
      opts.batchId = rest[++i];
    } else if (arg === "--date" && rest[i + 1]) {
      opts.date = rest[++i];
    } else if (arg === "--private-dir" && rest[i + 1]) {
      opts.privateDir = rest[++i];
    } else if (arg === "--approval" && rest[i + 1]) {
      opts.approval = rest[++i];
    } else if (arg === "--apply") {
      opts.dryRun = false;
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (arg === "--authorized") {
      opts.authorized = true;
    } else if (arg === "--no-report") {
      opts.writeReport = false;
    } else if (!arg.startsWith("-")) {
      opts.files.push(arg);
    }
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.command === "check-guard") {
    const res = validateIntakeRepositoryGuard(repoRoot);
    if (!res.ok) {
      for (const err of res.errors) console.error(`✗ ${err}`);
      process.exit(1);
    }
    console.log(
      "✓ Tutor intake repository guard passed (.gitignore, private-dir isolation, no rejected audio).",
    );
    return;
  }

  if (opts.command === "prove-approved") {
    const res = await proveApprovedRecordings({
      repoRoot,
      privateDir: opts.privateDir,
      date: opts.date,
      writeReport: opts.writeReport,
    });
    if (!res.ok) {
      for (const err of res.errors) console.error(`✗ ${err}`);
      process.exit(1);
    }
    console.log(
      `✓ Proved intake pipeline on ${res.verifiedCount}/${res.expectedCount} existing approved recordings (${res.uniqueAudioHashes} unique SHA-256s).` +
        (res.reportPath ? ` Report: ${res.reportPath}` : ""),
    );
    return;
  }

  if (opts.command === "ingest") {
    if (opts.files.length === 0) {
      console.error("✗ ingest requires at least one media file (MP3, WAV, M4A, or video).");
      process.exit(1);
    }
    const res = await runTutorIntake({
      repoRoot,
      inputFiles: opts.files,
      batchId: opts.batchId,
      date: opts.date,
      privateDir: opts.privateDir,
      dryRun: opts.dryRun,
      authorized: opts.authorized,
      approval: opts.approval,
      writeReport: opts.writeReport,
    });
    console.log(
      `✓ Intake ${opts.dryRun ? "(dry-run)" : "(applied)"} for batch ${opts.batchId}: ` +
        `${res.items.length} item(s) analyzed, ${res.manifestResult.applied.length} manifest update(s), ` +
        `${res.manifestResult.skipped.length} gated/skipped.` +
        (res.reportPath ? ` Report: ${res.reportPath}` : ""),
    );
    return;
  }

  console.log(
    "Usage:\n" +
      "  node scripts/tutor-intake/cli.mjs check-guard\n" +
      "  node scripts/tutor-intake/cli.mjs prove-approved [--no-report]\n" +
      '  node scripts/tutor-intake/cli.mjs ingest --batch <id> [--apply] [--authorized --approval "<ref>"] <files...>',
  );
}

await main();
