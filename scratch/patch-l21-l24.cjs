const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../src/data');

// 1. Update workbook-interactions.json
const wiPath = path.join(baseDir, 'workbook-interactions.json');
const wiData = JSON.parse(fs.readFileSync(wiPath, 'utf8'));

wiData.interactions.forEach(interaction => {
  if ([21, 22, 23, 24].includes(interaction.lessonNumber)) {
    interaction.sourceStatus = "teacher-distributed";
    interaction.transcriptionStatus = "not-applicable";
    interaction.note = "Content distributed separately by teacher. No bound workbook pages for this lesson.";
    interaction.items = [];
    
    // Clean up old fields if they were left over
    if (interaction.teacherNotes && interaction.teacherNotes.includes("Tracing activity")) {
       // just leave teacherNotes as is or replace, user says "Add a note field"
    }
  }
});
fs.writeFileSync(wiPath, JSON.stringify(wiData, null, 2) + "\n");

// 2. Update page-inventory.json
const piPath = path.join(baseDir, 'page-inventory.json');
if (fs.existsSync(piPath)) {
  const piData = JSON.parse(fs.readFileSync(piPath, 'utf8'));
  piData.workbook.lessons.forEach(lesson => {
    if ([21, 22, 23, 24].includes(lesson.lessonNumber)) {
      lesson.pages = [];
      lesson.note = "Teacher-distributed. No bound workbook pages.";
    }
  });
  fs.writeFileSync(piPath, JSON.stringify(piData, null, 2) + "\n");
} else {
  console.log('page-inventory.json not found!');
}

// 3. Update teacher-guide.json
const tgPath = path.join(baseDir, 'teacher-guide.json');
if (fs.existsSync(tgPath)) {
  const tgData = JSON.parse(fs.readFileSync(tgPath, 'utf8'));
  tgData.lessons.forEach(lesson => {
    if ([21, 22, 23, 24].includes(lesson.lessonNumber)) {
      lesson.distributionMethod = "teacher-handout";
      lesson.needsReview = false;
    }
  });
  fs.writeFileSync(tgPath, JSON.stringify(tgData, null, 2) + "\n");
} else {
  console.log('teacher-guide.json not found!');
}

console.log('Data files updated.');
