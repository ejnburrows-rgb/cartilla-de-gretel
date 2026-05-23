#!/usr/bin/env node
// Vercel build-time PDF fetcher.
//
// Runs as `npm run prebuild` before `vite build`. Reads pairs of
// (notion page id, output path) from .cartilla-import/notion-url.txt
// and downloads each PDF directly from Notion's public endpoints
// using only Node 20 built-ins (no playwright, no curl).
//
// Hard rule: NEVER fail the build. If a fetch fails, log it and
// exit 0 so the site still deploys with whatever public/book/book.pdf
// is currently committed (which may be absent during the gap).

import fs from 'node:fs';
import path from 'node:path';

const CONFIG = '.cartilla-import/notion-url.txt';
if (!fs.existsSync(CONFIG)) {
  console.log('[prebuild] no ' + CONFIG + ' present, skipping PDF fetch');
  process.exit(0);
}

const lines = fs
  .readFileSync(CONFIG, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);

const pairs = [];
for (let i = 0; i + 1 < lines.length; i += 2) {
  pairs.push({ id: lines[i], outPath: lines[i + 1] });
}
if (pairs.length === 0) {
  console.log('[prebuild] no (id, outPath) pairs found, skipping');
  process.exit(0);
}

const NOTION_HOST = 'www.notion.so';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const NCV = '23.13.0.3686';

function normalizeId(raw) {
  const stripped = raw
    .replace(/^https?:\/\/[^/]+\//, '')
    .replace(/[?#].*$/, '')
    .replace(/.*-/, '');
  const idNoDash = stripped.replace(/-/g, '');
  const idDashed =
    idNoDash.length === 32
      ? idNoDash.slice(0, 8) +
        '-' +
        idNoDash.slice(8, 12) +
        '-' +
        idNoDash.slice(12, 16) +
        '-' +
        idNoDash.slice(16, 20) +
        '-' +
        idNoDash.slice(20)
      : stripped;
  return { idNoDash, idDashed };
}

async function htmlCandidates(idNoDash) {
  try {
    const res = await fetch('https://' + NOTION_HOST + '/' + idNoDash, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
    });
    if (!res.ok) {
      console.log('[prebuild]   html status', res.status);
      return [];
    }
    const html = await res.text();
    const re =
      /https:\/\/(?:prod-files-secure[^"\s\\<>]+|[^"\s\\<>]+\.pdf[^"\s\\<>]*|file\.notion\.so[^"\s\\<>]+|www\.notion\.so\/signed[^"\s\\<>]+)/gi;
    return [...new Set([...html.matchAll(re)].map((m) => m[0]))];
  } catch (e) {
    console.log('[prebuild]   html scrape error:', e.message);
    return [];
  }
}

async function chunkCandidates(idDashed) {
  try {
    const res = await fetch(
      'https://' + NOTION_HOST + '/api/v3/loadPageChunk',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': UA,
          'Notion-Client-Version': NCV,
        },
        body: JSON.stringify({
          pageId: idDashed,
          limit: 200,
          cursor: { stack: [] },
          chunkNumber: 0,
          verticalColumns: false,
        }),
      },
    );
    if (!res.ok) {
      console.log('[prebuild]   loadPageChunk status', res.status);
      return [];
    }
    const data = await res.json();
    const urls = new Set();
    const blocks =
      (data && data.recordMap && data.recordMap.block) || {};
    for (const k in blocks) {
      const b = blocks[k] && blocks[k].value;
      if (!b) continue;
      const src = b.properties && b.properties.source;
      if (Array.isArray(src)) {
        for (const item of src) {
          if (Array.isArray(item)) {
            for (const v of item) {
              if (typeof v === 'string' && /^https?:\/\//.test(v)) {
                urls.add(v);
              }
            }
          }
        }
      }
      if (b.format && b.format.display_source) {
        urls.add(b.format.display_source);
      }
    }
    return [...urls];
  } catch (e) {
    console.log('[prebuild]   loadPageChunk error:', e.message);
    return [];
  }
}

async function trySignFor(url, blockId) {
  try {
    const res = await fetch(
      'https://' + NOTION_HOST + '/api/v3/getSignedFileUrls',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
        body: JSON.stringify({
          urls: [
            { url, permissionRecord: { table: 'block', id: blockId } },
          ],
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data && data.signedUrls && data.signedUrls[0]) || null;
  } catch {
    return null;
  }
}

async function downloadAndWrite(url, outPath) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      redirect: 'follow',
    });
    if (!res.ok) {
      console.log('[prebuild]     http', res.status);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 4096) {
      console.log('[prebuild]     too small:', buf.length);
      return false;
    }
    const hdr = buf.slice(0, 5).toString('ascii');
    if (!hdr.startsWith('%PDF-')) {
      console.log('[prebuild]     not a PDF, header was', JSON.stringify(hdr));
      return false;
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    console.log('[prebuild]     wrote', buf.length, 'bytes to', outPath);
    return true;
  } catch (e) {
    console.log('[prebuild]     download error:', e.message);
    return false;
  }
}

async function fetchOne(id, outPath) {
  const { idNoDash, idDashed } = normalizeId(id);
  console.log('[prebuild] target', idNoDash, '->', outPath);
  const candidates = new Set();
  for (const u of await htmlCandidates(idNoDash)) candidates.add(u);
  for (const u of await chunkCandidates(idDashed)) candidates.add(u);
  console.log('[prebuild]   ' + candidates.size + ' candidate URL(s)');
  for (const url of candidates) {
    console.log('[prebuild]   trying ' + url.slice(0, 96));
    if (await downloadAndWrite(url, outPath)) return true;
    const m = url.match(
      /\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\//,
    );
    if (m) {
      const signed = await trySignFor(url, m[1]);
      if (signed) {
        console.log('[prebuild]     signed retry');
        if (await downloadAndWrite(signed, outPath)) return true;
      }
    }
  }
  return false;
}

let anySuccess = false;
for (const { id, outPath } of pairs) {
  try {
    const ok = await fetchOne(id, outPath);
    if (ok) anySuccess = true;
  } catch (e) {
    console.log('[prebuild] unexpected error for', id, e.message);
  }
}

if (!anySuccess) {
  console.log('[prebuild] no PDFs fetched — continuing build anyway');
}
process.exit(0);
