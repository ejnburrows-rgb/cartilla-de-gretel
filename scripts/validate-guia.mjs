import fs from 'fs';
import path from 'path';

const guiaDir = path.join(process.cwd(), 'src', 'content', 'guia');
const manifestPath = path.join(guiaDir, 'manifest.json');

let hasError = false;

function error(msg) {
  console.error(`ERROR: ${msg}`);
  hasError = true;
}

// 1. Assert all 24 JSONs exist and parse, and no schema fields are empty
for (let i = 1; i <= 24; i++) {
  const fileName = `leccion-${String(i).padStart(2, '0')}.json`;
  const filePath = path.join(guiaDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    error(`${fileName} does not exist.`);
    continue;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Check fields
    if (!data.lessonId) error(`${fileName}: lessonId is empty`);
    if (!data.objectives || data.objectives.length === 0) error(`${fileName}: objectives is empty`);
    if (!data.motivation) error(`${fileName}: motivation is empty`);
    if (!data.script) error(`${fileName}: script is empty`);
    
    if (!data.evaluationRef) error(`${fileName}: evaluationRef is missing`);
    else {
      // page can be null, but note must not be empty
      if (!data.evaluationRef.note) error(`${fileName}: evaluationRef.note is empty`);
    }
    
    if (!data.rhyme) error(`${fileName}: rhyme is missing`);
    // rhyme.title and rhyme.text can be null based on schema, but the object must exist
    
    if (!data.provenance) error(`${fileName}: provenance is missing`);
    else {
      if (!data.provenance.source) error(`${fileName}: provenance.source is empty`);
    }
    
  } catch (e) {
    error(`Failed to parse ${fileName}: ${e.message}`);
  }
}

// 2. Manifest validation
if (!fs.existsSync(manifestPath)) {
  error(`manifest.json does not exist.`);
} else {
  try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(content);
    
    manifest.forEach((item, index) => {
      if (!item.name || !item.folder || item.lesson === undefined || !item.path || !item.type) {
        error(`manifest.json[${index}] has empty fields.`);
      }
      
      // Resolve path
      if (!item.path.startsWith('NOT-FOUND-AFTER-SEARCH')) {
        let resolvePath = item.path;
        // If it starts with /cartilla (like Vite paths), make it relative to public
        if (resolvePath.startsWith('/cartilla')) {
          resolvePath = path.join(process.cwd(), 'public', resolvePath);
        } else if (resolvePath.startsWith('public/')) {
          resolvePath = path.join(process.cwd(), resolvePath);
        }
        
        if (!fs.existsSync(resolvePath)) {
          error(`manifest.json[${index}] path does not exist on disk: ${item.path}`);
        }
      }
    });
  } catch (e) {
    error(`Failed to parse manifest.json: ${e.message}`);
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log("Validation passed successfully.");
}
