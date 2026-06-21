import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


// Depending on ts-node config, __dirname might not be available in ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const problems: { type: string; where: string; path: string }[] = [];

// Helper to check and record missing files
function checkFile(type: string, where: string, assetPath: string) {
  // Normalize expected URLs to absolute paths relative to project root
  const cleanPath = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  // If the path starts with something like "cartilla/images", we assume it should be in "public/"
  const fullPath = path.join(rootDir, "public", cleanPath);
  
  if (!fs.existsSync(fullPath)) {
    problems.push({ type, where, path: `public/${cleanPath}` });
  }
}



// 2) Check book pages and gretel images by scanning files
const filesToScan = [
  "src/components/cartilla/FlipBook.tsx", 
  "src/components/cartilla/WorkbookPageRenderer.tsx",
];

// Gather files from src/data/lessons/ or src/data/
const lessonsDir = path.join(rootDir, "src", "data", "lessons");
if (fs.existsSync(lessonsDir)) {
  const lessonFiles = fs.readdirSync(lessonsDir).filter(f => f.endsWith(".json") || f.endsWith(".ts") || f.endsWith(".tsx"));
  filesToScan.push(...lessonFiles.map(f => `src/data/lessons/${f}`));
} else {
  const dataDir = path.join(rootDir, "src", "data");
  if (fs.existsSync(dataDir)) {
    const dataFiles = fs.readdirSync(dataDir).filter(f => f.endsWith(".json") || f.endsWith(".ts"));
    filesToScan.push(...dataFiles.map(f => `src/data/${f}`));
  }
}

// Add specifically requested files if they exist in a different location
if (fs.existsSync(path.join(rootDir, "src", "components", "FlipBook.tsx"))) {
  filesToScan.push("src/components/FlipBook.tsx");
}
if (fs.existsSync(path.join(rootDir, "src", "components", "WorkbookPageRenderer.tsx"))) {
  filesToScan.push("src/components/WorkbookPageRenderer.tsx");
}

for (let relativePath of filesToScan) {
  let filePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(filePath)) {
    continue;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Find strings like "/art/hd/page-..."
    const pageMatches = line.match(/\/art\/hd\/page-[\w-]+\.png/g);
    if (pageMatches) {
      for (const match of pageMatches) {
        checkFile("Missing book page assets", `${relativePath}:${i + 1}`, match);
      }
    }
    
    // Find strings like "/cartilla/images/gretel/..."
    const gretelMatches = line.match(/\/cartilla\/images\/gretel\/[\w-/]+\.(?:png|webp)/g);
    if (gretelMatches) {
      for (const match of gretelMatches) {
        checkFile("Missing Gretel pose assets", `${relativePath}:${i + 1}`, match);
      }
    }
  }
}

// 3) Exit behavior
if (problems.length > 0) {
  const grouped = problems.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
  }, {} as Record<string, typeof problems>);

  for (const [type, items] of Object.entries(grouped)) {
    console.log(`\n=== ${type} ===`);
    for (const item of items) {
      console.log(`- [${item.path}] referenced in ${item.where}`);
    }
  }
  process.exitCode = 1;
} else {
  console.log("Asset check passed: all referenced images exist.");
  process.exitCode = 0;
}
