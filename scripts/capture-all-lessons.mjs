import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PROOF_DIR = path.resolve(process.cwd(), "docs/proofs/lesson-screenshots");

async function main() {
  console.log("=== Cartilla All Lessons Screenshot Capture ===");

  // Ensure proof directory exists
  if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
  }

  console.log("Running Playwright capture spec against local dev:worker instance...");

  // Run Playwright capture test
  try {
    execSync("pnpm exec playwright test tests/e2e/capture-all-lessons.spec.ts --project=chromium", {
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

  console.log("\n=== All Lessons Capture Complete ===");
  console.log(`Screenshots generated: ${files.length}`);
}

main().catch((err) => {
  console.error("Fatal error running lesson capture harness:", err);
  process.exit(1);
});
