import { spawnSync } from "node:child_process";

const args = [
  "exec",
  "playwright",
  "test",
  "tests/e2e/recovery-visual-regression.spec.ts",
  "tests/e2e/recovery-book-frame.spec.ts",
  "--project=chromium",
  "--update-snapshots=none",
];

for (let run = 1; run <= 3; run += 1) {
  console.log(`VISUAL_GATE_RUN ${run}/3 (compare-only; baselines unchanged)`);
  const result = spawnSync("pnpm", args, {
    cwd: process.cwd(),
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("VISUAL_GATE_3X_COMPLETE");
