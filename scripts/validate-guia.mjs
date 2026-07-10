import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const guiaDir = path.join(repoRoot, 'src', 'content', 'guia');
const manifestPath = path.join(guiaDir, 'manifest.json');

let hasErrors = false;

console.log("=== Validating Teacher Guide Extractions ===");

// 1. Check all 24 lesson JSON files
for (let i = 1; i <= 24; i++) {
    const lessonNum = i.toString().padStart(2, '0');
    const filePath = path.join(guiaDir, `leccion-${lessonNum}.json`);
    
    if (!fs.existsSync(filePath)) {
        console.error(`ERROR: Missing file ${filePath}`);
        hasErrors = true;
        continue;
    }
    
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Verify provenance
        const prov = data.provenance;
        if (prov !== "NOT-FOUND-AFTER-SEARCH") {
            const provPath = path.join(repoRoot, prov);
            if (!fs.existsSync(provPath)) {
                console.error(`ERROR: Provenance file '${prov}' in leccion-${lessonNum}.json does not exist in repo.`);
                hasErrors = true;
            }
        }
        
    } catch (e) {
        console.error(`ERROR: Failed to parse ${filePath}: ${e.message}`);
        hasErrors = true;
    }
}

console.log("=== Validating manifest.json ===");

if (!fs.existsSync(manifestPath)) {
    console.error(`ERROR: Missing manifest file ${manifestPath}`);
    hasErrors = true;
} else {
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        
        for (const item of manifest) {
            const itemPath = path.join(repoRoot, item.path);
            if (!fs.existsSync(itemPath)) {
                console.error(`ERROR: Path '${item.path}' in manifest does not resolve on disk.`);
                hasErrors = true;
            }
        }
    } catch (e) {
        console.error(`ERROR: Failed to parse ${manifestPath}: ${e.message}`);
        hasErrors = true;
    }
}

if (hasErrors) {
    console.error("\nValidation FAILED.");
    process.exit(1);
} else {
    console.log("\nValidation PASSED.");
    process.exit(0);
}
