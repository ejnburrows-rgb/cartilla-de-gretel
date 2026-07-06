import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const crops = [
  // Lesson 15 (b)
  {
    lesson: 'leccion-15-b',
    src: 'b-page-31.jpg',
    word: 'bota',
    left: 400,
    top: 2200,
    width: 550,
    height: 700
  },
  {
    lesson: 'leccion-15-b',
    src: 'b-page-31.jpg',
    word: 'bebe',
    left: 1300,
    top: 2200,
    width: 650,
    height: 700
  },
  // Lesson 16 (v)
  {
    lesson: 'leccion-16-v',
    src: 'v-page-34.jpg',
    word: 'vela',
    left: 800,
    top: 1250,
    width: 550,
    height: 600
  }
];

async function processCrops() {
  for (const crop of crops) {
    const letterDir = crop.lesson.split('-').pop(); // 'b', 'v'
    const sourcePath = path.join(__dirname, `../public/cartilla/images/source/${letterDir}/${crop.src}`);
    const targetDir = path.join(__dirname, `../public/cartilla/art/faithful/${crop.lesson}`);
    const targetPath = path.join(targetDir, `${crop.word}.webp`);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    try {
      await sharp(sourcePath)
        .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
        .webp({ quality: 80 })
        .toFile(targetPath);
      console.log(`Created ${targetPath}`);
    } catch (err) {
      console.error(`Error processing ${crop.word}:`, err);
    }
  }
}

processCrops();
