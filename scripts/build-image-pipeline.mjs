import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ILLUSTRATIONS_DIR = path.resolve(__dirname, "../public/illustrations");

async function main() {
  console.log("🎨 Running image optimization pipeline...");

  if (!fs.existsSync(ILLUSTRATIONS_DIR)) {
    console.log("ℹ️ No public/illustrations directory found. Skipping image pipeline.");
    return;
  }

  const files = getFilesRecursively(ILLUSTRATIONS_DIR).filter(f =>
    /\.(png|jpg|jpeg)$/i.test(f)
  );

  if (files.length === 0) {
    console.log("ℹ️ No source illustrations (*.png, *.jpg, *.jpeg) found. Pipeline complete.");
    return;
  }

  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch (e) {
    console.warn("⚠️ 'sharp' module is not installed. WebP/AVIF generation and blur-up placeholders will be skipped.");
    console.warn("   To enable, run: npm install sharp --save-dev");
    return;
  }

  for (const filePath of files) {
    const relativePath = path.relative(ILLUSTRATIONS_DIR, filePath);
    console.log(`⚡ Processing: ${relativePath}`);

    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const dirName = path.dirname(filePath);

    const webpPath = path.join(dirName, `${baseName}.webp`);
    const avifPath = path.join(dirName, `${baseName}.avif`);
    const blurJsonPath = path.join(dirName, `${baseName}.blur.json`);

    try {
      // 1. Generate WebP
      if (!fs.existsSync(webpPath)) {
        await sharp(filePath)
          .webp({ quality: 80 })
          .toFile(webpPath);
        console.log(`   ✓ Generated WebP: ${baseName}.webp`);
      }

      // 2. Generate AVIF
      if (!fs.existsSync(avifPath)) {
        await sharp(filePath)
          .avif({ quality: 65 })
          .toFile(avifPath);
        console.log(`   ✓ Generated AVIF: ${baseName}.avif`);
      }

      // 3. Generate 16x16 blur placeholder JSON
      if (!fs.existsSync(blurJsonPath)) {
        const blurBuffer = await sharp(filePath)
          .resize(16, 16, { fit: "cover" })
          .png({ compressionLevel: 9 })
          .toBuffer();

        const base64 = blurBuffer.toString("base64");
        const dataUrl = `data:image/png;base64,${base64}`;

        const placeholderData = {
          src: relativePath,
          width: 16,
          height: 16,
          blurDataUrl: dataUrl
        };

        fs.writeFileSync(blurJsonPath, JSON.stringify(placeholderData, null, 2), "utf-8");
        console.log(`   ✓ Generated blur placeholder: ${baseName}.blur.json`);
      }
    } catch (err) {
      console.error(`❌ Failed to process ${baseName}:`, err);
    }
  }

  console.log("✓ Image pipeline execution finished successfully!");
}

function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

main().catch(err => {
  console.error("Fatal error in image pipeline:", err);
  process.exit(1);
});
