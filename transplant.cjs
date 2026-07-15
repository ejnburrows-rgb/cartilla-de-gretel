const fs = require("fs");
const path = require("path");

const PUBLIC_ART_DIR = path.join(__dirname, "public", "cartilla", "art");
const MANIFEST_PATH = path.join(__dirname, "src", "content", "workbook", "workbook-manifest.json");

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allArtFiles = getAllFiles(PUBLIC_ART_DIR).filter((f) => !f.includes("faithful")); // exclude the ones we might be replacing to avoid matching 0-byte or broken ones if they exist, wait no, faithful has some good ones.
// Let's include everything but prefer HD/flipchart.
const allValidArtFiles = getAllFiles(PUBLIC_ART_DIR).filter((f) => fs.statSync(f).size > 0);

const fileMap = new Map();
// If multiple files have the same name, prefer the ones in 'hd' or 'flipchart'
for (const file of allValidArtFiles) {
  const parsed = path.parse(file);
  const name = parsed.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // if already mapped, override if this one is from 'hd'
  if (fileMap.has(name)) {
    const existing = fileMap.get(name);
    if (file.includes("hd") || file.includes("flipchart")) {
      fileMap.set(name, file);
    }
  } else {
    fileMap.set(name, file);
  }
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

let filledSlots = 0;
let genuinelyMissing = 0;

for (const p of manifest.pages) {
  if (!p.objects) continue;

  // Find a directory in faithful that corresponds to this lesson to use as target
  let targetLessonDir = `leccion-${p.lesson}`;
  const faithfulDir = path.join(PUBLIC_ART_DIR, "faithful");
  if (fs.existsSync(faithfulDir)) {
    const dirs = fs
      .readdirSync(faithfulDir)
      .filter((d) => fs.statSync(path.join(faithfulDir, d)).isDirectory());
    const match = dirs.find(
      (d) => d.startsWith(`leccion-${p.lesson}-`) || d === `leccion-${p.lesson}`,
    );
    if (match) {
      targetLessonDir = match;
    }
  }

  const destDirPath = path.join(faithfulDir, targetLessonDir);
  if (!fs.existsSync(destDirPath)) {
    fs.mkdirSync(destDirPath, { recursive: true });
  }

  for (const obj of p.objects) {
    if (obj.type === "illustration") {
      let isBroken = false;
      if (obj.asset) {
        const absoluteAssetPath = path.join(__dirname, "public", obj.asset);
        if (!fs.existsSync(absoluteAssetPath) || fs.statSync(absoluteAssetPath).size === 0) {
          isBroken = true;
        }
      }

      if (!obj.asset || isBroken) {
        const wordNorm = obj.word
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const sourceFile = fileMap.get(wordNorm);
        if (sourceFile) {
          const ext = path.extname(sourceFile);
          const destName = `${wordNorm}${ext}`;
          const destFilePath = path.join(destDirPath, destName);

          fs.copyFileSync(sourceFile, destFilePath);

          const newAssetUrl = `/cartilla/art/faithful/${targetLessonDir}/${destName}`;
          obj.asset = newAssetUrl;
          filledSlots++;
        } else {
          genuinelyMissing++;
          console.log(`Missing genuinely: ${obj.word} in lesson ${p.lesson}`);
        }
      }
    }
  }
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");

console.log(`Filled: ${filledSlots}`);
console.log(`Missing: ${genuinelyMissing}`);
