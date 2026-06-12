const fs = require('fs');
const path = require('path');

const tgPath = path.join(__dirname, '../src/data/teacher-guide.json');
const wiPath = path.join(__dirname, '../src/data/workbook-interactions.json');

const tgData = JSON.parse(fs.readFileSync(tgPath, 'utf8'));
const wiData = JSON.parse(fs.readFileSync(wiPath, 'utf8'));

const targetIds = [
  'l7-p13-syllable-circle',
  'l8-p17-syllable-circle',
  'l11-p33-syllable-circle',
  'l12-p37-syllable-circle',
  'l13-p41-syllable-circle'
];

let modified = 0;

wiData.interactions.forEach(interaction => {
  if (targetIds.includes(interaction.id)) {
    // Find the lesson in teacher-guide
    const lesson = tgData.lessons.find(l => l.lessonNumber === interaction.lessonNumber);
    if (lesson && lesson.syllables) {
      interaction.items = lesson.syllables.map(s => ({ id: `syl-${s}`, label: s }));
      interaction.sourceStatus = "teacher-derived";
      interaction.transcriptionStatus = "verified";
      modified++;
      console.log(`Updated ${interaction.id} with syllables: ${lesson.syllables.join(', ')}`);
    } else {
      console.log(`Could not find syllables for ${interaction.id} in teacher-guide.json`);
    }
  }
});

fs.writeFileSync(wiPath, JSON.stringify(wiData, null, 2) + "\n");
console.log(`Total updated: ${modified}`);
