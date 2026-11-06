import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const UPLOADS = path.join(HERE, 'MIS_IMAGENES_NUEVAS');
const DEC = path.join(HERE, 'decisiones.json');
const EXPORT = path.join(HERE, 'EXPORTAR_RECHAZADOS');
fs.mkdirSync(UPLOADS, { recursive: true });
const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/art-board/board-data.json'), 'utf8')).rows;
const load = () => { try { return JSON.parse(fs.readFileSync(DEC, 'utf8')); } catch { return {}; } };
const save = d => fs.writeFileSync(DEC, JSON.stringify(d, null, 2));
const MIME = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const body = req => new Promise(r => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => r(Buffer.concat(c))); });
const safe = s => String(s).replace(/[^a-zA-Z0-9_-]/g, '_');

const srv = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  try {
    if (u.pathname === '/api/rows') { res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ rows, decisions: load() })); }
    if (u.pathname === '/api/decide' && req.method === 'POST') {
      const { id, decision, note } = JSON.parse((await body(req)).toString());
      const d = load(); d[id] = { ...(d[id] || {}), ...(decision !== undefined ? { decision } : {}), ...(note !== undefined ? { note } : {}) };
      save(d); return res.end('ok');
    }
    if (u.pathname === '/api/upload' && req.method === 'POST') {
      const id = safe(u.searchParams.get('id')), ext = (path.extname(u.searchParams.get('name') || '.png') || '.png').toLowerCase();
      for (const f of fs.readdirSync(UPLOADS)) if (f.startsWith(id + '.')) fs.unlinkSync(path.join(UPLOADS, f));
      const file = id + ext; fs.writeFileSync(path.join(UPLOADS, file), await body(req));
      const d = load(); d[u.searchParams.get('id')] = { ...(d[u.searchParams.get('id')] || {}), upload: file, decision: 'NO' }; save(d);
      return res.end(file);
    }
    if (u.pathname === '/api/export' && req.method === 'POST') {
      const d = load(), out = [];
      fs.rmSync(EXPORT, { recursive: true, force: true }); fs.mkdirSync(EXPORT, { recursive: true });
      for (const r of rows) { const x = d[r.id]; if (x?.decision !== 'NO') continue;
        const item = { id: r.id, book: r.book, page: r.page, word: r.appLabel || r.label, note: x.note || '', currentFile: r.current, originalCrop: r.original, fullPage: r.fullPage, circlePct: r.circlePct, ownerUploadedFile: x.upload || null };
        out.push(item);
        for (const k of ['original', 'current']) if (r[k] && fs.existsSync(path.join(ROOT, r[k]))) fs.copyFileSync(path.join(ROOT, r[k]), path.join(EXPORT, `${safe(r.id)}_${k}${path.extname(r[k])}`));
        if (x.upload) fs.copyFileSync(path.join(UPLOADS, x.upload), path.join(EXPORT, `${safe(r.id)}_OWNER_NEW${path.extname(x.upload)}`));
      }
      fs.writeFileSync(path.join(EXPORT, 'RECHAZADOS.json'), JSON.stringify({ instructions: 'Optimize each rejected item faithfully from the original crop. Never invent art. If ownerUploadedFile is set, use that file as the source.', count: out.length, items: out }, null, 2));
      res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ count: out.length, folder: EXPORT }));
    }
    const PD = path.join(ROOT, 'public/cartilla/art/owner-intake/imagegen-2026-11-06');
    if (u.pathname === '/api/proposals') { res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ items: JSON.parse(fs.readFileSync(path.join(PD, 'match-proposals.json'), 'utf8')), state: (() => { try { return JSON.parse(fs.readFileSync(path.join(HERE, 'propuestas.json'), 'utf8')); } catch { return {}; } })() })); }
    if (u.pathname === '/api/proposal-state' && req.method === 'POST') { fs.writeFileSync(path.join(HERE, 'propuestas.json'), (await body(req)).toString()); return res.end('ok'); }
    if (u.pathname === '/api/apply' && req.method === 'POST') {
      const { file, word } = JSON.parse((await body(req)).toString());
      if (!fs.existsSync(path.join(PD, path.basename(file)))) { res.statusCode = 400; return res.end('missing'); }
      exec(`node scripts/replace-and-purge-single-art.mjs --input "${path.join(PD, path.basename(file))}" --word "${String(word).replace(/[^\w\s-]/g, '')}"`, { cwd: ROOT }, (e, so, se) => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ ok: !e, out: (so || '').slice(-600), err: (se || '').slice(-400) })); });
      return;
    }
    if (u.pathname === '/api/open-export') { exec(`explorer "${EXPORT}"`); return res.end('ok'); }
    let rel = decodeURIComponent(u.pathname); if (rel === '/') rel = '/index.html';
    let p = path.join(HERE, rel); if (!fs.existsSync(p) || !fs.statSync(p).isFile()) p = path.join(ROOT, rel);
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || !fs.statSync(p).isFile()) { res.statusCode = 404; return res.end('no'); }
    res.setHeader('content-type', MIME[path.extname(p).toLowerCase()] || 'application/octet-stream'); fs.createReadStream(p).pipe(res);
  } catch (e) { res.statusCode = 500; res.end(String(e)); }
});
const port = Number(process.env.PORT || 4777);
srv.listen(port, '127.0.0.1', () => { console.log('READY http://127.0.0.1:' + port); if (!process.env.NO_OPEN) exec(`start http://127.0.0.1:${port}`); });
