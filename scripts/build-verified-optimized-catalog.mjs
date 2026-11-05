import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const repoRoot = 'c:/Users/EJN/Downloads/La Cartilla de Gretel';
const dropDir = 'C:/Users/EJN/Downloads/Cartilla-Drop';
const publicVerifiedDir = path.join(repoRoot, 'public/cartilla/art/verified-pc-candidates');
fs.mkdirSync(publicVerifiedDir, { recursive: true });
fs.mkdirSync(dropDir, { recursive: true });

// 1. Read known SHA256 -> provenance from ARTWORK_AUDIT_2026-10-16.md and owner-intake manifest
const auditMdPath = path.join(repoRoot, 'docs/artwork-reconciliation/ARTWORK_AUDIT_2026-10-16.md');
const auditMd = fs.existsSync(auditMdPath) ? fs.readFileSync(auditMdPath, 'utf8') : '';

// Also read current faithful manifest and board-data to know what is ALREADY installed in the repo
const boardDataPath = path.join(repoRoot, 'docs/art-board/board-data.json');
const boardData = fs.existsSync(boardDataPath) ? JSON.parse(fs.readFileSync(boardDataPath, 'utf8')) : { items: [] };

const oldCropsPath = path.join(repoRoot, 'docs/art-board/old-crops-replacement-inventory.json');
const oldCrops = fs.existsSync(oldCropsPath) ? JSON.parse(fs.readFileSync(oldCropsPath, 'utf8')) : { items: [] };

// Scan candidate directories on the user's PC
const scanTargets = [
  { label: 'Desktop', dir: 'C:/Users/EJN/Desktop', maxDepth: 2 },
  { label: 'Downloads (Root)', dir: 'C:/Users/EJN/Downloads', maxDepth: 1 },
  { label: 'Downloads/UNMATCHED-613-art-files/owner-intake', dir: 'C:/Users/EJN/Downloads/UNMATCHED-613-art-files/owner-intake', maxDepth: 4 },
  { label: 'Documents/Cartilla_Colored_Artwork_Library_2026-10-21', dir: 'C:/Users/EJN/Documents/Cartilla_Colored_Artwork_Library_2026-10-21', maxDepth: 3 },
  { label: 'CartillaOptimized', dir: 'C:/Users/EJN/CartillaOptimized', maxDepth: 3 },
];

// Exclude raw page scans, screenshots, UI board screenshots, and low-res regular crops
function shouldExcludePath(fullPath, fileName) {
  const norm = fullPath.replace(/\\/g, '/');
  if (norm.includes('/La Cartilla de Gretel/')) return true;
  if (norm.includes('/ai-board/')) return true;
  if (norm.includes('/Codex/')) return true;
  if (norm.includes('/Cartilla Color/')) return true; // 195x195 regular crops or full page scans
  if (norm.includes('/flipchart_all_separate_images_remastered/')) return true; // 320x320 regular crops
  if (/^page-\d+\.png$/i.test(fileName)) return true;
  if (/^Screenshot/i.test(fileName)) return true;
  if (/^PREVIEW_/i.test(fileName)) return true;
  if (/cartilla-jules-current/i.test(fileName)) return true;
  if (/Mariposas-/i.test(fileName)) return true;
  return false;
}

function collectFiles(dir, maxDepth, depth = 0, out = []) {
  if (depth > maxDepth || !fs.existsSync(dir)) return out;
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'La Cartilla de Gretel') continue;
      collectFiles(full, maxDepth, depth + 1, out);
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(e.name)) {
      if (shouldExcludePath(full, e.name)) continue;
      try {
        const st = fs.statSync(full);
        out.push({ full, name: e.name, size: st.size, sizeKB: Math.round(st.size / 1024), mtime: st.mtime.toISOString().slice(0, 10) });
      } catch {}
    }
  }
  return out;
}

async function main() {
  let rawCandidates = [];
  for (const t of scanTargets) {
    const found = collectFiles(t.dir, t.maxDepth);
    for (const f of found) {
      rawCandidates.push({ ...f, sourceGroup: t.label });
    }
  }

  console.log('Total raw candidate files collected (before resolution/size filter):', rawCandidates.length);

  // Deduplicate by SHA-256 and check resolution with sharp
  const byHash = new Map();
  let rejectedLowRes = 0;

  for (const item of rawCandidates) {
    // Hard filter 1: Minimum file size 250 KB (except transparent cutouts >= 800px)
    if (item.sizeKB < 180) {
      rejectedLowRes++;
      continue;
    }
    try {
      const meta = await sharp(item.full).metadata();
      const w = meta.width || 0;
      const h = meta.height || 0;
      // Hard filter 2: Minimum pixel dimension >= 750px on both axes (rejects 195x195, 320x320, 500x500 crops)
      if (w < 750 || h < 750) {
        rejectedLowRes++;
        continue;
      }
      const buf = fs.readFileSync(item.full);
      const sha256 = crypto.createHash('sha256').update(buf).digest('hex');

      if (!byHash.has(sha256)) {
        byHash.set(sha256, {
          sha256,
          width: w,
          height: h,
          hasAlpha: Boolean(meta.hasAlpha),
          format: meta.format,
          sizeKB: item.sizeKB,
          mtime: item.mtime,
          locations: [{ full: item.full, name: item.name, sourceGroup: item.sourceGroup }],
        });
      } else {
        byHash.get(sha256).locations.push({ full: item.full, name: item.name, sourceGroup: item.sourceGroup });
      }
    } catch {
      rejectedLowRes++;
    }
  }

  console.log('Rejected low-res / small crops:', rejectedLowRes);
  console.log('Unique high-resolution (>=750x750px) optimized master images by SHA-256:', byHash.size);

  // Also hash all currently installed faithful/optimized assets in public/cartilla/art to see which ones are already live
  const repoArtDir = path.join(repoRoot, 'public/cartilla/art');
  const repoFiles = collectFiles(repoArtDir, 5);
  const installedHashes = new Map();
  for (const rf of repoFiles) {
    try {
      const buf = fs.readFileSync(rf.full);
      const h = crypto.createHash('sha256').update(buf).digest('hex');
      installedHashes.set(h, rf.full.replace(/\\/g, '/').split('/public/')[1]);
    } catch {}
  }

  const uniqueList = [...byHash.values()].map((entry, idx) => {
    // Pick best human-readable name among all duplicate copies
    const names = entry.locations.map(l => l.name);
    const descriptiveName = names.find(n => /[a-zA-Z]{4,}/.test(n) && !/^image-gen/i.test(n) && !/^1[A-Za-z0-9_-]{20,}/.test(n) && !/^\d{6}\./.test(n))
      || names.find(n => /^image-gen/i.test(n))
      || names[0];

    const alreadyInstalledAt = installedHashes.get(entry.sha256) || null;
    return {
      index: idx + 1,
      descriptiveName,
      allNames: [...new Set(names)],
      ...entry,
      alreadyInstalledAt,
    };
  });

  // Sort: Descriptive named files first, then newest mtime
  uniqueList.sort((a, b) => {
    const aHasDesc = !/^image-gen|^1[A-Za-z0-9_-]{20,}|^\d{6}/.test(a.descriptiveName) ? 0 : 1;
    const bHasDesc = !/^image-gen|^1[A-Za-z0-9_-]{20,}|^\d{6}/.test(b.descriptiveName) ? 0 : 1;
    if (aHasDesc !== bHasDesc) return aHasDesc - bHasDesc;
    return b.mtime.localeCompare(a.mtime);
  });

  const outJsonPath = path.join(repoRoot, 'docs/art-board/verified-pc-highres-catalog.json');
  fs.writeFileSync(outJsonPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalRawScanned: rawCandidates.length,
    rejectedLowResCount: rejectedLowRes,
    uniqueHighResMastersCount: uniqueList.length,
    items: uniqueList,
  }, null, 2));

  console.log('Wrote catalog to:', outJsonPath);
  for (const u of uniqueList.slice(0, 45)) {
    console.log(`[#${u.index}] ${u.descriptiveName} (${u.width}x${u.height}, ${u.sizeKB}KB, copies:${u.locations.length}) ${u.alreadyInstalledAt ? 'INSTALLED:' + u.alreadyInstalledAt : ''}`);
  }
}

main();
