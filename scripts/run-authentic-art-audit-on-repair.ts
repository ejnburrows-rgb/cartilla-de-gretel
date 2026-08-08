import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const repairBranch = "repair/authentic-flipchart-art";

if (process.env.VERCEL === "1" && process.env.VERCEL_GIT_COMMIT_REF === repairBranch) {
  console.log("\n=== Authentic flipchart art audit (repair branch only) ===");
  execFileSync(
    "python3",
    [
      "-m",
      "pip",
      "install",
      "--break-system-packages",
      "--disable-pip-version-check",
      "--quiet",
      "opencv-python-headless",
      "numpy",
    ],
    { cwd: rootDir, stdio: "inherit" },
  );
  execFileSync("python3", ["scripts/find-authentic-flipchart-art.py"], {
    cwd: rootDir,
    stdio: "inherit",
  });

  const from = path.join(rootDir, "audit", "authentic-art");
  const to = path.join(rootDir, "public", "audit", "authentic-art");
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
  console.log(`Authentic-art audit copied to ${path.relative(rootDir, to)}`);
}
