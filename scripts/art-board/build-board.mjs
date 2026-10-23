import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Use sharp for dimensions to avoid adding dependencies
import sharp from 'sharp';

function parseCSV(text) {
  return text.split('\n').filter(Boolean).map(line => {
    let row = [];
    let cur = '';
    let inQuote = false;
    for (let c of line) {
      if (c === '"') inQuote = !inQuote;
      else if (c === ',' && !inQuote) { row.push(cur); cur = ''; }
      else if (c !== '\r') cur += c;
    }
    row.push(cur);
    return row;
  });
}

function slugify(text) {
  if (!text) return '';
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function findFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const csvData = fs.readFileSync('docs/artwork-reconciliation/mapping/MASTER-MAPPING.csv', 'utf8');
const rows = parseCSV(csvData);
const groupMap = new Map();

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (row.length < 9) continue;

  const id = row[0]; // e.g. FC-003-02
  const groupId = row[4];

  if (!groupId) continue;

  if (!groupMap.has(groupId)) {
    groupMap.set(groupId, {
      groupId,
      label: row[5],
      sourceCrop: row[8],
      destPaths: new Set(),
      pages: new Set()
    });
  }
  const group = groupMap.get(groupId);
  group.pages.add(id);

  const destPath = row[10];
  if (destPath && destPath !== 'N/A' && destPath.startsWith('public/cartilla/art/')) {
    group.destPaths.add(destPath);
  }
}

for (const [groupId, group] of groupMap.entries()) {
  const slugs = new Set();

  if (group.label) {
    if (group.label.includes('Ilustración de la página')) {
      const match = group.label.match(/página (\d+)/);
      if (match) {
        slugs.add(`p${match[1].padStart(3, '0')}-scene`);
      }
    } else if (group.label.includes('Cover/title')) {
      slugs.add('composite-fc-front-001');
    } else {
      slugs.add(slugify(group.label));
    }
  }

  for (const p of group.destPaths) {
    slugs.add(path.parse(p).name);
    const match = path.parse(p).name.match(/^p\d+-(.+)$/);
    if (match) slugs.add(match[1]);
  }

  const m1 = groupId.replace(/^DRAW-/, '');
  slugs.add(m1);

  for (const pageId of group.pages) {
    slugs.add(pageId);
    slugs.add(pageId.toLowerCase());
  }

  group.slugs = Array.from(slugs).filter(s => s && s.length > 2);
}

const DIRS = ['optimized', 'faithful', 'delivery', 'hd', 'source', 'owner-intake', 'games'];
const allArtFiles = [];
for (const d of DIRS) {
  const dirPath = path.join('public/cartilla/art', d);
  allArtFiles.push(...findFiles(dirPath).filter(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f)));
}
const approvedFiles = findFiles('public/cartilla/art/approved').filter(f => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));

async function getFileStats(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(1) + ' KB';
    const buffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    let dims = '';
    try {
      if (filePath.endsWith('.svg')) {
        dims = 'svg'; // sharp doesn't always handle svg metadata well without density
      } else {
        const metadata = await sharp(filePath).metadata();
        dims = `${metadata.width}x${metadata.height}`;
      }
    } catch(e) {
      dims = 'unknown';
    }
    return { size, hash, dims, ctime: stats.ctimeMs };
  } catch(e) {
    return { size: '0 KB', hash: '', dims: 'unknown', ctime: 0 };
  }
}

async function build() {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Art Approval Board</title>
<style>
  body { font-family: sans-serif; background: #111; color: #eee; margin: 0; padding: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #444; padding: 8px; text-align: left; vertical-align: top; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; }
  .candidate { border: 2px solid #555; padding: 10px; border-radius: 4px; background: #222; max-width: 250px; position: relative; }
  .candidate.recommended { border-color: #4CAF50; background: #1a3320; }
  .candidate img { max-width: 100%; height: auto; display: block; margin-bottom: 10px; background: #eee; }
  button { padding: 6px 12px; cursor: pointer; margin-top: 5px; }
  .book-original { border: 2px solid #00BCD4; padding: 10px; border-radius: 4px; background: #112222; }
  .book-original img { max-width: 200px; height: auto; }
  .info { font-size: 12px; margin-bottom: 5px; word-break: break-all; }
  .actions { display: flex; gap: 5px; margin-top: 10px; }
  .badge { position: absolute; top: -10px; right: -10px; background: #4CAF50; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
</style>
</head>
<body>
<h1>Art Approval Board</h1>
<button onclick="exportLedger()">Export Ledger</button>
<p>Total Groups: ${groupMap.size}</p>
<table>
  <thead>
    <tr>
      <th>Group</th>
      <th>Original</th>
      <th>Candidates</th>
    </tr>
  </thead>
  <tbody id="board">
`;

  function isApproved(filePath) {
    if (filePath.includes('/approved/')) return true;
    const name = path.parse(filePath).name.toLowerCase();
    if (['aguja', 'arco', 'elefante', 'arbol'].includes(name) && filePath.includes('owner-intake')) {
        return true;
    }
    return false;
  }

  const groupsArray = Array.from(groupMap.values());
  groupsArray.sort((a, b) => a.groupId.localeCompare(b.groupId));

  for (const group of groupsArray) {
    const candidatesMap = new Map();

    for (const f of allArtFiles.concat(approvedFiles)) {
      const p = f.replace(/\\/g, '/');
      const name = path.parse(f).name;
      const nameSlug = slugify(name);

      let match = false;
      for (const slug of group.slugs) {
        if (nameSlug === slug || name === slug || name.includes(slug) || slug.includes(name)) {
          match = true;
          break;
        }
      }

      if (group.label && group.label.includes('Ilustración de la página')) {
        const matchPage = group.label.match(/página (\d+)/);
        if (matchPage) {
          const pageNum = matchPage[1].padStart(3, '0');
          if (name.includes(`p${pageNum}`) && name.includes('scene')) {
            match = true;
          }
        }
      }

      if (match) {
        if (!candidatesMap.has(p)) {
          const stats = await getFileStats(f);
          candidatesMap.set(p, {
            path: p,
            ...stats
          });
        }
      }
    }

    const candidates = Array.from(candidatesMap.values());
    let recommended = null;

    const approvedCandidates = candidates.filter(c => isApproved(c.path));
    if (approvedCandidates.length > 0) {
      recommended = approvedCandidates[0];
    }

    if (!recommended) {
      const ownerIntake = candidates.filter(c => c.path.includes('owner-intake')).sort((a, b) => b.ctime - a.ctime);
      if (ownerIntake.length > 0) {
        recommended = ownerIntake[0];
      }
    }

    if (!recommended && candidates.length > 0) {
      recommended = candidates[0];
    }

    const sourceRelPath = group.sourceCrop ? '../../' + group.sourceCrop : '';

    html += `
      <tr data-group-id="${group.groupId}">
        <td>
          <strong>${group.groupId}</strong><br>
          <div class="info">Label: ${group.label}</div>
          <div class="info">Pages: ${Array.from(group.pages).join(', ')}</div>
          <div class="actions">
            <button onclick="approveNone('${group.groupId}')">NONE RIGHT</button>
            <button onclick="skip('${group.groupId}')">SKIP</button>
          </div>
        </td>
        <td>
          <div class="book-original">
            ${group.sourceCrop ? `<img src="${sourceRelPath}" alt="Original" loading="lazy">` : 'No original'}
          </div>
        </td>
        <td>
          <div class="row">
    `;

    for (const c of candidates) {
      const isRec = recommended && recommended.path === c.path;
      const relPath = '../../' + c.path;
      html += `
            <div class="candidate ${isRec ? 'recommended' : ''}" data-path="${c.path}" data-hash="${c.hash}">
              ${isRec ? '<div class="badge">RECOMMENDED</div>' : ''}
              <img src="${relPath}" alt="Candidate" loading="lazy">
              <div class="info">${path.basename(c.path)}</div>
              <div class="info">${c.dims}</div>
              <div class="info">${c.size}</div>
              <div class="info" title="${c.hash}">${c.hash.substring(0,8)}...</div>
              <div class="actions">
                <button onclick="approve('${group.groupId}', '${c.path}', '${c.hash}')">APPROVE</button>
              </div>
            </div>
      `;
    }

    html += `
          </div>
        </td>
      </tr>
    `;
  }

  html += `
    </tbody>
  </table>

  <script>
  const ledger = {};

  function approve(groupId, winnerPath, sha256) {
    ledger[groupId] = {
      groupId,
      winnerPath,
      sha256,
      approvedBy: 'owner',
      date: new Date().toISOString()
    };
    const tr = document.querySelector('tr[data-group-id="' + groupId + '"]');
    if (tr) tr.style.opacity = '0.5';
    console.log('Approved', groupId, winnerPath);
  }

  function approveNone(groupId) {
    ledger[groupId] = {
      groupId,
      winnerPath: 'NONE',
      sha256: null,
      approvedBy: 'owner',
      date: new Date().toISOString()
    };
    const tr = document.querySelector('tr[data-group-id="' + groupId + '"]');
    if (tr) tr.style.opacity = '0.5';
  }

  function skip(groupId) {
    const tr = document.querySelector('tr[data-group-id="' + groupId + '"]');
    if (tr) tr.style.opacity = '0.5';
  }

  function exportLedger() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Object.values(ledger), null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "ART_APPROVAL_LEDGER.json");
    dlAnchorElem.click();
  }

  document.querySelectorAll('.candidate.recommended').forEach(el => {
    const tr = el.closest('tr');
    const groupId = tr.getAttribute('data-group-id');
    const path = el.getAttribute('data-path');
    const hash = el.getAttribute('data-hash');
    ledger[groupId] = {
      groupId,
      winnerPath: path,
      sha256: hash,
      approvedBy: 'owner',
      date: new Date().toISOString()
    };
  });

  </script>
  </body>
  </html>
  `;

  fs.mkdirSync('docs/art-board', { recursive: true });
  fs.writeFileSync('docs/art-board/index.html', html);
  console.log('Built art-board HTML');
}

build();
