const fs = require('fs');
const path = require('path');

const srcFile = path.resolve(__dirname, '../../docs/Transcripción Integral_ La cartilla de Gretel - Guía del profesor.txt');
let content = fs.readFileSync(srcFile, 'utf8');

// Strip out the "Página X" and "página X" lines as they interrupt text
content = content.replace(/Página \d+\r?\n/g, '');
content = content.replace(/página \d+\r?\n?/g, '');

const lessons = [];
// Split by "Lección \d+:"
const parts = content.split(/(?=Lección \d+:)/g);

for (const part of parts) {
  const match = part.match(/^Lección (\d+):/);
  if (match) {
    lessons.push({
      lessonNumber: parseInt(match[1], 10),
      text: part
    });
  }
}

console.log(`Found ${lessons.length} lessons`);
console.log(lessons.map(l => l.lessonNumber));

// Write out lesson 1 for inspection
fs.writeFileSync(path.resolve(__dirname, 'lesson-1-debug.txt'), lessons[0].text, 'utf8');
