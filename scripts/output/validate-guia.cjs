const fs = require('fs');
const path = require('path');

const guiaDir = path.resolve(__dirname, '../../src/content/guia');
const outFile = path.resolve(__dirname, 'guia-validation.txt');
const schemaKeys = ['lessonId', 'objectives', 'motivation', 'script', 'evaluationRef', 'rhyme', 'provenance'];

let out = '';
out += "=== Teacher's Guide JSON Schema Validation ===\n";

let validCount = 0;
let errors = [];

const manifestStr = fs.readFileSync(path.join(guiaDir, 'manifest.json'), 'utf8');
const manifest = JSON.parse(manifestStr);

for (let i = 1; i <= 24; i++) {
  const file = path.join(guiaDir, `lesson-${i}.json`);
  if (!fs.existsSync(file)) {
    errors.push(`lesson-${i}.json: Missing file`);
    continue;
  }
  
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    errors.push(`lesson-${i}.json: JSON Parse Error`);
    continue;
  }
  
  // Validate schema
  let fileErrors = [];
  
  for (const key of schemaKeys) {
    if (!(key in json)) fileErrors.push(`Missing key: ${key}`);
  }
  
  if (typeof json.lessonId !== 'number') fileErrors.push('lessonId must be a number');
  if (!Array.isArray(json.objectives)) fileErrors.push('objectives must be an array');
  if (typeof json.motivation !== 'string') fileErrors.push('motivation must be a string');
  if (typeof json.script !== 'string') fileErrors.push('script must be a string');
  
  if (!json.evaluationRef) {
    fileErrors.push('evaluationRef is missing');
  } else {
    if (json.evaluationRef.page !== null && typeof json.evaluationRef.page !== 'number') fileErrors.push('evaluationRef.page must be null or number');
    if (json.evaluationRef.note !== null && typeof json.evaluationRef.note !== 'string') fileErrors.push('evaluationRef.note must be null or string');
  }
  
  if (!json.rhyme) {
    fileErrors.push('rhyme is missing');
  } else {
    if (json.rhyme.title !== null && typeof json.rhyme.title !== 'string') fileErrors.push('rhyme.title must be null or string');
    if (json.rhyme.text !== null && typeof json.rhyme.text !== 'string') fileErrors.push('rhyme.text must be null or string');
  }
  
  if (!json.provenance) {
    fileErrors.push('provenance is missing');
  } else {
    if (typeof json.provenance.source !== 'string') fileErrors.push('provenance.source must be string');
    if (typeof json.provenance.verified !== 'boolean') fileErrors.push('provenance.verified must be boolean');
  }
  
  if (fileErrors.length > 0) {
    errors.push(`lesson-${i}.json: ` + fileErrors.join(', '));
  } else {
    validCount++;
  }
}

out += `\nValidated ${validCount} / 24 lessons successfully.\n`;
if (errors.length > 0) {
  out += "\nErrors:\n" + errors.join('\n') + "\n";
} else {
  out += "\nNo schema errors found.\n";
}

out += "\nCoverage Breakdown:\n";
out += "===================\n";
for (let i = 1; i <= 24; i++) {
  const st = manifest.lessons[i].status;
  out += `Lesson ${i}: ${st.toUpperCase()}\n`;
  if (st === 'missing_content') {
    out += '  -> Missing: Entire text (Objectives, Motivation, Script, Evaluation Note)\n';
    out += '  -> Paths Searched: docs/Transcripción Integral_ La cartilla de Gretel - Guía del profesor.txt, src/content/guides/lesson-*.tsx, src/data/**, teacher-folder-data.ts\n';
  }
}

fs.writeFileSync(outFile, out, 'utf8');
console.log('Validation complete, output written to ' + outFile);
