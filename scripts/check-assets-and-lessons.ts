import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const problems: { type: string; where: string; path: string }[] = [];

function checkFile(type: string, where: string, assetPath: string) {
  const cleanPath = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  const fullPath = path.join(rootDir, "public", cleanPath);
  if (!fs.existsSync(fullPath)) {
    problems.push({ type, where, path: `public/${cleanPath}` });
  }
}

// 1) Check Gretel original artwork (warn only — artist asset, not committed to git)
const gretelPath = "cartilla/images/gretel/gretel-original.png";
const gretelFull = path.join(rootDir, "public", gretelPath);
if (!fs.existsSync(gretelFull)) {
  console.warn(
    `[WARN] Gretel artwork not found at public/${gretelPath} — place the original PNG there.`,
  );
}

// 2) Scan for book page assets and validate lesson files
const lessonsDir = path.join(rootDir, "src", "data", "lesson-exercises");
if (fs.existsSync(lessonsDir)) {
  // index.ts is a barrel file that imports/aggregates the 24 real lesson
  // files — it never contains its own "export const lessonNN"/id/kind
  // fields, so it's exempt from the per-lesson structural checks below.
  const files = fs
    .readdirSync(lessonsDir)
    .filter((f: string) => f.endsWith(".ts") && !f.endsWith(".d.ts") && f !== "index.ts");

  for (const file of files) {
    const filePath = path.join(lessonsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");

    // Check for "export const lessonXX = ["
    if (!content.includes("export const lesson")) {
      problems.push({
        type: "Malformed lessons",
        where: file,
        path: "Missing export const lesson array",
      });
    }

    // Basic structural checks: must have id, kind
    const hasId = content.includes("id:");
    const hasKind = content.includes("kind:");
    if (!hasId || !hasKind) {
      problems.push({
        type: "Malformed lessons",
        where: file,
        path: "Missing required lesson fields (id, kind)",
      });
    }

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const pageMatches = line.match(/\/art\/hd\/page-[\w-]+\.png/g);
      if (pageMatches) {
        for (const match of pageMatches) {
          checkFile("Missing book assets", `src/data/lesson-exercises/${file}:${i + 1}`, match);
        }
      }

      if (line.includes("getBookPageImage(") && !line.match(/\/\/|getBookPageImage$/)) {
        const numMatch = line.match(/getBookPageImage\((\d+)\)/);
        if (numMatch) {
          const pageNum = parseInt(numMatch[1], 10);
          const expectedPath = `/art/hd/page-${pageNum}.png`;
          checkFile(
            "Bad page references",
            `src/data/lesson-exercises/${file}:${i + 1}`,
            expectedPath,
          );
        }
      }
    }
  }
} else {
  problems.push({
    type: "Malformed lessons",
    where: "src/data/lesson-exercises",
    path: "Directory missing",
  });
}

// Check other files for page assets
const filesToScan = [
  "src/components/cartilla/FlipBook.tsx",
  "src/components/cartilla/WorkbookPageRenderer.tsx",
  "src/components/FlipBook.tsx",
  "src/components/WorkbookPageRenderer.tsx",
];

for (const relativePath of filesToScan) {
  const filePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(filePath)) continue;

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const pageMatches = line.match(/\/art\/hd\/page-[\w-]+\.png/g);
    if (pageMatches) {
      for (const match of pageMatches) {
        checkFile("Missing book assets", `${relativePath}:${i + 1}`, match);
      }
    }
  }
}

// 3) Exit behavior
if (problems.length > 0) {
  const grouped = problems.reduce(
    (acc, curr) => {
      if (!acc[curr.type]) acc[curr.type] = [];
      acc[curr.type].push(curr);
      return acc;
    },
    {} as Record<string, typeof problems>,
  );

  for (const [type, items] of Object.entries(grouped)) {
    console.log(`\n=== ${type} ===`);
    for (const item of items) {
      console.log(`- [${item.path}] referenced in ${item.where}`);
    }
  }
  process.exitCode = 1;
} else {
  console.log("Sanity check passed: All assets and lessons are valid.");
  process.exitCode = 0;
}
