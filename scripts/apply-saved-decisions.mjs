import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { homedir } from 'node:os';

const repoRoot = 'C:/Users/EJN/Downloads/La Cartilla de Gretel';
const storageDir = path.join(homedir(), 'Cartilla-Gretel', 'art-review');
const decPath = path.join(storageDir, 'decisions.json');
const uploadsDir = path.join(storageDir, 'uploads');

if (!fs.existsSync(decPath)) {
  console.error('No decisions.json found at', decPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(decPath, 'utf8'));
const decisions = data.decisions || {};
console.log(`Found ${Object.keys(decisions).length} total decisions in storage.`);

let applied = 0;
let errors = 0;

for (const [gid, dec] of Object.entries(decisions)) {
  if (dec.status !== 'accepted') continue;

  let src = dec.selected_original_path;
  const target = dec.canonical_target;

  // Resolve upload files if not directly found
  if (!fs.existsSync(src)) {
    const uploadFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    const match = uploadFiles.find(f => f.startsWith(gid));
    if (match) {
      src = path.join(uploadsDir, match);
    }
  }

  if (!fs.existsSync(src)) {
    console.warn(`[SKIP] Missing source image for ${gid}: ${src}`);
    errors++;
    continue;
  }

  if (!target) {
    console.warn(`[SKIP] No canonical target defined for ${gid}`);
    errors++;
    continue;
  }

  const destPath = path.join(repoRoot, target);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  if (path.resolve(src).toLowerCase() === path.resolve(destPath).toLowerCase()) {
    console.log(`[ALREADY CANONICAL] ${gid} -> ${target} (source matches destination)`);
    applied++;
    continue;
  }

  const ext = path.extname(destPath).toLowerCase();
  const tmpDest = destPath + '.tmp' + ext;
  try {
    const img = sharp(src);
    const meta = await img.metadata();

    if (ext === '.webp') {
      await sharp(src)
        .webp({ quality: 92, alphaQuality: 95, effort: 6 })
        .toFile(tmpDest);
    } else if (ext === '.png') {
      await sharp(src)
        .png({ compressionLevel: 8 })
        .toFile(tmpDest);
    } else {
      fs.copyFileSync(src, tmpDest);
    }

    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    fs.renameSync(tmpDest, destPath);

    console.log(`[APPLIED] ${gid} -> ${target} (${meta.width}x${meta.height} ${meta.format})`);
    applied++;
  } catch (err) {
    if (fs.existsSync(tmpDest)) fs.unlinkSync(tmpDest);
    console.error(`[ERROR] Failed processing ${gid}:`, err.message);
    errors++;
  }
}

console.log(`\nSummary: ${applied} accepted drawings successfully applied to the app. ${errors} skipped/errors.`);
