import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expectedOwnerProofCaptures } from "./owner-proof-matrix.mjs";

// Never inherit PATH/NODE_OPTIONS/NODE_PATH or arbitrary environment from the shell.
// Playwright's webServer.command invokes pnpm through a shell; a hostile PATH
// could run a lookalike binary that forges all 60 screenshots and metadata.
const executableDirs = process.platform === "win32"
  ? [path.dirname(process.execPath), "C:\\Program Files\\Git\\cmd", "C:\\Program Files (x86)\\Git\\cmd", "C:\\Windows\\System32"]
  : [path.dirname(process.execPath), "/usr/local/bin", "/usr/bin", "/bin"];
// Discover absolute Git before replacing PATH. Never execute an ambient PATH shim.
function resolveVerifiedGit() {
  const binary = process.platform === "win32" ? "git.exe" : "git";
  const candidateDirs = [...executableDirs, ...String(process.env.PATH ?? "").split(path.delimiter)]
    .filter((directory) => path.isAbsolute(directory));
  const approvedWindowsRoots = ["C:\\Program Files\\Git\\cmd", "C:\\Program Files (x86)\\Git\\cmd",
    "C:\\Windows\\System32", path.dirname(process.execPath)];
  for (const directory of candidateDirs) {
    try {
      const candidate = fs.realpathSync(path.join(directory, binary));
      const stat = fs.statSync(candidate);
      if (!stat.isFile()) continue;
      if (process.platform === "win32") {
        if (!approvedWindowsRoots.some((root) => {
          const relative = path.relative(root, candidate);
          return relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative);
        })) continue;
      } else {
        let current = candidate, trusted = true;
        // Root-owned, non-group/world-writable files AND ancestors cannot be
        // replaced by merely prepending a malicious directory to PATH.
        while (true) {
          const part = fs.statSync(current);
          if (part.uid !== 0 || (part.mode & 0o022) !== 0) { trusted = false; break; }
          const parent = path.dirname(current);
          if (parent === current) break;
          current = parent;
        }
        if (!trusted) continue;
      }
      return candidate;
    } catch { /* Continue past missing or unsafe executable. */ }
  }
  throw new Error("No verified trusted Git executable found; refusing proof capture.");
}
const trustedGit = resolveVerifiedGit();
const trustedPath = [...new Set(executableDirs.filter((directory) => fs.existsSync(directory)))].join(path.delimiter);
const trustedHome = os.userInfo().homedir; // OS account database, NOT ambient HOME
function verifiedWindowsProfileFolder(...parts) {
  // Playwright caches executable browsers in LOCALAPPDATA. A caller-provided
  // absolute path can redirect it to a malicious binary. Ignore inherited
  // LOCALAPPDATA, APPDATA, TEMP and TMP entirely.
  const candidate = path.join(trustedHome, ...parts);
  try {
    const home = fs.realpathSync(trustedHome);
    const folder = fs.realpathSync(candidate);
    const relative = path.relative(home, folder);
    if (relative && relative !== ".." &&
        !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative) &&
        fs.statSync(folder).isDirectory()) return folder;
  } catch { /* Unavailable or redirected directory: fail closed. */ }
  throw new Error("Cannot verify a safe Windows proof directory under the OS account profile.");
}
const trustedChildEnv = {
  PATH: trustedPath,
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: os.devNull,
  GIT_CONFIG_SYSTEM: os.devNull,
  ...(process.platform === "win32"
    ? { SystemRoot: "C:\\Windows", USERPROFILE: trustedHome,
        LOCALAPPDATA: verifiedWindowsProfileFolder("AppData", "Local"),
        APPDATA: verifiedWindowsProfileFolder("AppData", "Roaming"),
        TEMP: verifiedWindowsProfileFolder("AppData", "Local", "Temp"),
        TMP: verifiedWindowsProfileFolder("AppData", "Local", "Temp") }
    : { HOME: trustedHome, TMPDIR: "/tmp" }),
};

// Each run uses a fresh directory: never include older screenshots in a new proof manifest.
const PROOF_DIR = path.resolve(
  process.cwd(),
  "docs/proofs/final-assembly/runs",
  `${new Date().toISOString().replace(/[:.]/g, "-")}-${process.pid}`,
);

async function main() {
  console.log("=== Cartilla Owner-Proof Capture Harness ===");

  // Record commit SHA
  let commitSha = "unknown";
  try {
    commitSha = execFileSync(trustedGit, ["rev-parse", "HEAD"], { encoding: "utf8", env: trustedChildEnv }).trim();
  } catch (err) {
    console.error("Warning: Could not retrieve git commit SHA:", err.message);
  }

  if (!/^[0-9a-f]{40}$/i.test(commitSha)) {
    console.error("No verified Git commit SHA: refusing to capture untraceable owner proof.");
    process.exit(1);
  }
  // A valid HEAD does not prove provenance if source differs from the commit.
  // Refuse screenshots from tracked, staged or untracked worktree changes.
  let worktreeStatus;
  try {
    worktreeStatus = execFileSync(trustedGit, ["-c", "core.fsmonitor=false", "status", "--porcelain", "--untracked-files=normal"], {
      encoding: "utf8",
      env: trustedChildEnv,
    }).trim();
  } catch (err) {
    console.error("Cannot verify clean checkout; refusing owner-proof capture:", err.message);
    process.exit(1);
  }
  if (worktreeStatus) {
    console.error("Refusing owner-proof capture from an uncommitted/dirty checkout.");
    console.error(worktreeStatus);
    process.exit(1);
  }
  // Capture output must not create untracked files before checkout validation.
  fs.mkdirSync(PROOF_DIR, { recursive: true });
  console.log(`Captured Commit SHA: ${commitSha}`);
  console.log("Running Playwright proof capture spec against local dev:worker instance...");

  // Run Playwright capture test
  try {
    // The installed Playwright CLI is launched through Node directly on all OSes.
    // A dedicated config starts Vite using absolute Node/Vite paths, not pnpm or PowerShell.
    const playwrightCli = fileURLToPath(import.meta.resolve("@playwright/test/cli"));
    execFileSync(process.execPath, [playwrightCli, "test", "tests/e2e/finish-proof-capture.spec.ts", "--config=scripts/owner-proof-playwright.config.ts", "--project=chromium", "--workers=1"], {
      stdio: "inherit",
      env: { ...trustedChildEnv, PROOF_DIR },
    });
  } catch (err) {
    console.error("Error executing Playwright capture harness:", err.message);
    process.exit(1);
  }

  // Playwright/dev tooling may alter source after the initial check.
  // Refuse to attribute those changed files to the original commit.
  const statusAfter = execFileSync(trustedGit, ["-c", "core.fsmonitor=false", "status", "--porcelain", "--untracked-files=normal"], {
    encoding: "utf8",
    env: trustedChildEnv,
  }).trim();
  if (statusAfter) {
    console.error("Source changed during capture; refusing invalid exact-commit evidence.");
    console.error(statusAfter);
    process.exit(1);
  }

  // Scan output screenshots
  const files = fs.readdirSync(PROOF_DIR).filter((f) => f.endsWith(".png"));

  // The documented proof matrix is eight archetypes plus seven other routes,
  // each at four viewports. Partial output must not masquerade as full proof.
  if (files.length !== 60) {
    console.error(`Incomplete owner-proof capture: expected 60 PNGs, found ${files.length}`);
    process.exit(1);
  }
  const expectedCaptures = expectedOwnerProofCaptures();
  if (expectedCaptures.length !== 60) {
    throw new Error("Owner-proof contract must declare exactly 60 distinct source captures.");
  }
  const expectedByFilename = new Map(expectedCaptures.map((capture) => [capture.filename, capture]));
  if (expectedByFilename.size !== 60) {
    throw new Error("Duplicate filenames in the owner-proof source matrix.");
  }
  const captures = files.map((filename) => {
    const expected = expectedByFilename.get(filename);
    if (!expected) throw new Error(`Unexpected owner-proof screenshot: ${filename}`);
    const sidecarPath = path.join(PROOF_DIR, `${filename}.meta.json`);
    if (!fs.existsSync(sidecarPath)) {
      throw new Error(`Missing route/source metadata for screenshot: ${filename}`);
    }
    const meta = JSON.parse(fs.readFileSync(sidecarPath, "utf8"));
    if (meta.filename !== filename || typeof meta.route !== "string" ||
        !meta.route.startsWith("/cartilla/") || typeof meta.device !== "string" ||
        typeof meta.expectedRoute !== "string" || meta.route !== meta.expectedRoute ||
        meta.approvalStatus !== "NOT_OWNER_APPROVED") {
      throw new Error(`Invalid or unapproved capture metadata: ${filename}`);
    }
    // Reject misattribution of teacher captures to student interaction rules.
    const expectedStandards = meta.surface === "workbook" || meta.surface === "student"
      ? ["WORKBOOK_ARCHETYPE_STANDARD.md", "STUDENT_INTERACTION_STANDARD.md"]
      : meta.surface === "teacher" || meta.surface === "flipchart"
        ? ["PROJECT_SOURCE_OF_TRUTH.md", "DESIGN.md"] : null;
    if (!expectedStandards || !Array.isArray(meta.sourceStandards) ||
        meta.sourceStandards.length !== expectedStandards.length ||
        meta.sourceStandards.some((item, i) => item !== expectedStandards[i])) {
      throw new Error(`Incorrect source standards for screenshot: ${filename}`);
    }
    if (meta.surface === "workbook" &&
        (!Number.isInteger(meta.printedPage) || !Number.isInteger(meta.lesson) ||
         !Number.isInteger(meta.archetype) || meta.route !== `/cartilla/leccion/${meta.lesson}`)) {
      throw new Error(`Unverifiable workbook printed-page provenance: ${filename}`);
    }
    if (meta.surface === "flipchart" &&
        (!Number.isInteger(meta.printedPage) || meta.route !== "/cartilla/presentar/7")) {
      throw new Error(`Unverifiable Flip Chart source provenance: ${filename}`);
    }
    // Cardinality alone does not prove device/source coverage. Each unique
    // filename must match its exact route, physical page and viewport tuple.
    const actualKeys = Object.keys(meta).sort();
    const expectedKeys = Object.keys(expected).sort();
    if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys) ||
        expectedKeys.some((key) => JSON.stringify(meta[key]) !== JSON.stringify(expected[key]))) {
      throw new Error(`Incorrect owner-proof source/device matrix entry: ${filename}`);
    }
    return meta;
  });
  const manifest = {
    capturedAt: new Date().toISOString(),
    commitSha,
    harnessVersion: "1.2.0",
    evidenceRoute: "real-cartilla-lesson-and-teacher-routes-only",
    ownerApprovalStatus: "NOT_APPROVED_UNTIL_OWNER_REVIEWS_CURRENT_RENDER",
    approvalStandards: ["WORKBOOK_ARCHETYPE_STANDARD.md", "STUDENT_INTERACTION_STANDARD.md", "PROJECT_SOURCE_OF_TRUTH.md", "DESIGN.md"],
    devServerMode: "dev:worker",
    deviceMatrix: {
      phone: "390x844",
      tablet: "820x1180",
      laptop: "1280x800",
      projector: "1920x1080",
    },
    capturedScreenshots: files.sort(),
    captures,
    totalScreenshots: files.length,
  };

  const manifestPath = path.join(PROOF_DIR, "MANIFEST.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  console.log("\n=== Owner-Proof Capture Complete ===");
  console.log(`Commit captured: ${commitSha}`);
  console.log(`Screenshots generated: ${files.length}`);
  console.log(`Manifest written to: ${manifestPath}`);
}

main().catch((err) => {
  console.error("Fatal error running finish proof capture harness:", err);
  process.exit(1);
});
