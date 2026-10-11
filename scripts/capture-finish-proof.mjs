import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

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
    commitSha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
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
    worktreeStatus = execFileSync("git", ["status", "--porcelain", "--untracked-files=normal"], {
      encoding: "utf8",
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
    execFileSync(process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["exec", "playwright", "test", "tests/e2e/finish-proof-capture.spec.ts", "--project=chromium", "--workers=1"], {
      stdio: "inherit",
      env: {
        ...process.env,
        PROOF_DIR,
      },
    });
  } catch (err) {
    console.error("Error executing Playwright capture harness:", err.message);
    process.exit(1);
  }

  // Playwright/dev tooling may alter source after the initial check.
  // Refuse to attribute those changed files to the original commit.
  const statusAfter = execFileSync("git", ["status", "--porcelain", "--untracked-files=normal"], {
    encoding: "utf8",
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
  const captures = files.map((filename) => {
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
