const fs = require('fs');
const path = require('path');

const pPath = path.join(__dirname, '..', 'src', 'data', 'page-inventory.json');
const p = JSON.parse(fs.readFileSync(pPath, 'utf8'));

const lesson1 = p.workbook.lessons.find(l => l.lessonId === 1);
if (lesson1) {
  lesson1.pages = [
    'vocales-page-01.png',
    'vocales-page-02.png',
    'vocales-page-03.png',
    'vocales-page-04.png'
  ];
}

const lesson17 = p.workbook.lessons.find(l => l.lessonId === 17);
if (lesson17) {
  lesson17.pages = [
    'b-page-39.png',
    'b-page-40.png'
  ];
}

fs.writeFileSync(pPath, JSON.stringify(p, null, 2) + '\n', 'utf8');
