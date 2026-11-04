import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PROOF_DIR = path.resolve(process.cwd(), "docs/proofs/final-assembly");

async function main() {
  console.log("=== Cartilla Owner-Proof Capture Harness ===");

  // Ensure proof directory exists
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }

  // Record commit SHA
  let commitSha = "unknown";
  try {
    commitSha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch (err) {
    console.error("Warning: Could not retrieve git commit SHA:", err.message);
  }

  console.log(`Captured Commit SHA: ${commitSha}`);
  console.log("Running Playwright proof capture spec against local dev:worker instance...");

  // Run Playwright capture test
  try {
    execSync("pnpm exec playwright test tests/e2e/finish-proof-capture.spec.ts --project=chromium", {
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

  // Scan output screenshots
  const files = fs.readdirSync(PROOF_DIR).filter((f) => f.endsWith(".png"));

  const manifest = {
    capturedAt: new Date().toISOString(),
    commitSha,
    harnessVersion: "1.0.0",
    devServerMode: "dev:worker",
    deviceMatrix: {
      phone: "390x844",
      tablet: "820x1180",
      laptop: "1280x800",
      projector: "1920x1080",
    },
    capturedScreenshots: files.sort(),
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
