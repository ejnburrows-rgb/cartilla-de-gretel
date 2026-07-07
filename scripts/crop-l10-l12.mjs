import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const crops = [
  // Lesson 12 (l)
  {
    inputFile: 'public/cartilla/images/source/l/l-page-22.jpg',
    outputFile: 'public/cartilla/art/faithful/leccion-12-l/luna.webp',
    word: 'luna',
    cropBox: { left: 1680, top: 0, width: 720, height: 720 }
  }
];

async function processCrops() {
  for (const crop of crops) {
    const inputPath = path.resolve(__dirname, '..', crop.inputFile);
    const outputPath = path.resolve(__dirname, '..', crop.outputFile);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      await sharp(inputPath)
        .extract(crop.cropBox)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Successfully created ${crop.outputFile}`);
    } catch (err) {
      console.error(`Error processing ${crop.word}:`, err);
    }
  }
}

processCrops();
