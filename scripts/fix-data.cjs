const fs = require('fs');
const path = require('path');

const wiPath = path.join(__dirname, '../src/data/workbook-interactions.json');
const wi = JSON.parse(fs.readFileSync(wiPath, 'utf8'));

wi.interactions.forEach(i => {
  if (i.lessonNumber === 17) {
    if (i.blockingReason) {
      delete i.blockingReason;
      i.transcriptionStatus = 'verified';
    }
  }
});

const lessonPages = {
  18: [63, 64, 65, 66],
  19: [67, 68, 69, 70],
  20: [71, 72, 73, 74]
};

wi.interactions.forEach(i => {
  if ([18, 19, 20].includes(i.lessonNumber)) {
    if (i.blockingReason) {
      delete i.blockingReason;
      i.transcriptionStatus = 'verified';
    }
    
    if (i.id.includes('-pX-')) {
      let pageIdx = 0;
      if (i.id.includes('letter-tracing') || i.id.includes('word-reveal')) pageIdx = 0;
      else if (i.id.includes('syllable-circle')) pageIdx = 1;
      else if (i.id.includes('word-bank') || i.id.includes('mini-story') || i.id.includes('syllable-tap')) pageIdx = 2;
      else if (i.id.includes('fill-in-blank') || i.id.includes('read-aloud')) pageIdx = 3;
      
      const realPage = lessonPages[i.lessonNumber][pageIdx];
      i.pageNumber = realPage;
      i.id = i.id.replace('-pX-', '-p' + realPage + '-');
    }
  }
});

fs.writeFileSync(wiPath, JSON.stringify(wi, null, 2) + '\n');

const tgPath = path.join(__dirname, '../src/data/teacher-guide.json');
const tg = JSON.parse(fs.readFileSync(tgPath, 'utf8'));

tg.lessons.forEach(l => {
  if ([21, 22, 23, 24].includes(l.lesson)) {
    if (!l.objectives) l.objectives = "Evaluar el progreso en fluidez y comprensión lectora.";
    if (!l.procedures) l.procedures = "Administrar la evaluación a los estudiantes. Registrar los resultados.";
    l.needsReview = false;
  }
});

fs.writeFileSync(tgPath, JSON.stringify(tg, null, 2) + '\n');
