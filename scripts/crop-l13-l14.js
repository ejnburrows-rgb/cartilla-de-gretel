import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const crops = [
  // Lesson 13 (n)
  {
    word: 'nata',
    source: 'public/cartilla/images/source/n/n-page-25.jpg',
    left: 120,
    top: 20,
    width: 1100,
    height: 1180
  },
  {
    word: 'nube',
    source: 'public/cartilla/images/source/n/n-page-25.jpg',
    left: 1280,
    top: 0,
    width: 1120,
    height: 1220
  },
  {
    word: 'nido',
    source: 'public/cartilla/images/source/n/n-page-25.jpg',
    left: 160,
    top: 1220,
    width: 620,
    height: 620
  },
  {
    word: 'nariz',
    source: 'public/cartilla/images/source/n/n-page-25.jpg',
    left: 1700,
    top: 1260,
    width: 620,
    height: 600
  },

  // Lesson 14 (ñ)
  {
    word: 'muneca',
    source: 'public/cartilla/images/source/ñ/ñ-page-28.jpg',
    left: 280,
    top: 0,
    width: 750,
    height: 1180
  },
  {
    word: 'pina',
    source: 'public/cartilla/images/source/ñ/ñ-page-28.jpg',
    left: 60,
    top: 1280,
    width: 550,
    height: 630
  },
  {
    word: 'nino',
    source: 'public/cartilla/images/source/ñ/ñ-page-28.jpg',
    left: 1600,
    top: 1280,
    width: 550,
    height: 630
  }
];

async function processCrops() {
  for (const crop of crops) {
    const { word, source, left, top, width, height } = crop;
    
    // Determine target directory
    const isLesson13 = ['nata', 'nube', 'nido', 'nariz'].includes(word);
    const letter = isLesson13 ? 'n' : 'ñ';
    const targetDir = path.join('public/cartilla/images/consonants', letter);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const targetPath = path.join(targetDir, `${word}.jpg`);
    
    try {
      await sharp(source)
        .extract({ left, top, width, height })
        .toFile(targetPath);
      console.log(`Successfully cropped ${word} to ${targetPath}`);
    } catch (err) {
      console.error(`Error cropping ${word}:`, err);
    }
  }
}

processCrops();
