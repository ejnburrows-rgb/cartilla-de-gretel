import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GRETEL_POSES, GRETEL_FALLBACKS } from "../src/components/gretel/gretelPoses.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const problems: string[] = [];

console.log("Starting sanity checks...");

// 1. Check book page images
let bookImagesFound = 0;
const expectedBookPages = 90;
for (let i = 1; i <= expectedBookPages; i++) {
  const imgPath = path.join(rootDir, "public", "art", "hd", `page-${i}.png`);
  if (fs.existsSync(imgPath)) {
    bookImagesFound++;
  } else {
    problems.push(`Missing book page image: public/art/hd/page-${i}.png`);
  }
}

// 2. Check Gretel mascot assets
let gretelAssetsFound = 0;
let expectedGretelAssets = 0;

for (const [pose, assetPath] of Object.entries(GRETEL_POSES)) {
  expectedGretelAssets++;
  const cleanPath = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  const fullPath = path.join(rootDir, "public", cleanPath);
  if (fs.existsSync(fullPath)) {
    gretelAssetsFound++;
  } else {
    problems.push(`Missing Gretel pose asset for ${pose}: public/${cleanPath}`);
  }
}

for (const [pose, assetPath] of Object.entries(GRETEL_FALLBACKS)) {
  expectedGretelAssets++;
  const cleanPath = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  const fullPath = path.join(rootDir, "public", cleanPath);
  if (fs.existsSync(fullPath)) {
    gretelAssetsFound++;
  } else {
    problems.push(`Missing Gretel fallback asset for ${pose}: public/${cleanPath}`);
  }
}

// 3. Check Lesson wiring
const lessonsDir = path.join(rootDir, "src", "data", "lessons");
if (fs.existsSync(lessonsDir)) {
  const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith(".ts") || f.endsWith(".tsx"));
  for (const file of files) {
    const filePath = path.join(lessonsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    
    const blockRegex = /{\s*id:\s*["']([^"']+)["'][^}]+pageNumber:\s*(\d+)/g;
    let match;
    while ((match = blockRegex.exec(content)) !== null) {
      const id = match[1];
      const pageNumStr = match[2];
      const pageNum = parseInt(pageNumStr, 10);
      
      if (!content.includes('title:')) {
         problems.push(`Lesson file ${file} might be missing 'title' field for ${id}`);
      }
      
      if (isNaN(pageNum) || pageNum < 1 || pageNum > 90) {
        problems.push(`Invalid page number ${pageNum} in lesson file ${file} for item ${id}`);
      }
      
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= 90) {
        const imgPath = path.join(rootDir, "public", "art", "hd", `page-${pageNum}.png`);
        if (!fs.existsSync(imgPath)) {
          problems.push(`Lesson wiring issue in ${file}: item ${id} references page ${pageNum} which is missing.`);
        }
      }
    }
  }
} else {
  problems.push(`Lessons directory not found at ${lessonsDir}`);
}

console.log(`\n--- Summary ---`);
console.log(`Book images found: ${bookImagesFound} / ${expectedBookPages}`);
console.log(`Gretel assets found: ${gretelAssetsFound} / ${expectedGretelAssets}`);

if (problems.length === 0) {
  console.log("\nSanity check passed: all assets and lessons OK.");
  process.exit(0);
} else {
  console.log("\n--- ISSUES FOUND ---");
  
  const missingAssets = problems.filter(p => p.includes("Missing"));
  const wiringIssues = problems.filter(p => !p.includes("Missing"));
  
  if (missingAssets.length > 0) {
    console.log("\n[Missing Assets]");
    missingAssets.forEach(p => console.log(` - ${p}`));
  }
  
  if (wiringIssues.length > 0) {
    console.log("\n[Lesson Wiring Issues]");
    wiringIssues.forEach(p => console.log(` - ${p}`));
  }
  
  process.exit(1);
}
