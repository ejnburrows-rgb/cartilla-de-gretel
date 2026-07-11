const fs = require('fs');
const path = require('path');

const outputDir = path.resolve(__dirname, '../../src/content/guia');
const manifestStr = fs.readFileSync(path.join(outputDir, 'manifest.json'), 'utf8');
const manifest = JSON.parse(manifestStr);

const missingMessage = "MISSING_CONTENT: Lesson text missing from docs/Transcripción Integral_ La cartilla de Gretel - Guía del profesor.txt and could not be found anywhere else in the repository (searched docs/**, src/content/guides/**, src/data/**). EJN to supply the missing text.";

for (let i = 16; i <= 24; i++) {
  const file = path.join(outputDir, `lesson-${i}.json`);
  let json = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  json.objectives = [missingMessage];
  json.motivation = missingMessage;
  json.script = missingMessage;
  json.evaluationRef.note = missingMessage;
  json.provenance.source = missingMessage;
  json.provenance.verified = false;
  
  fs.writeFileSync(file, JSON.stringify(json, null, 2), 'utf8');
  manifest.lessons[i].status = "missing_content";
}

fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

// Now update validate-guia.cjs
const validateScript = path.resolve(__dirname, 'validate-guia.cjs');
let valContent = fs.readFileSync(validateScript, 'utf8');
valContent = valContent.replace("out += `Lesson ${i}: ${st.toUpperCase()}\\n`;", 
  "out += `Lesson ${i}: ${st.toUpperCase()}\\n`;\n  if (st === 'missing_content') {\n    out += '  -> Missing: Entire text (Objectives, Motivation, Script, Evaluation Note)\\n';\n    out += '  -> Paths Searched: docs/Transcripción Integral_ La cartilla de Gretel - Guía del profesor.txt, src/content/guides/lesson-*.tsx, src/data/**, teacher-folder-data.ts\\n';\n  }");
fs.writeFileSync(validateScript, valContent, 'utf8');

console.log('Updated JSONs and validate script.');
