#!/usr/bin/env node
// Vercel build-time PDF fetcher.
//
// Runs as `npm run prebuild` before `vite build`. Reads target
// configuration from .cartilla-import/targets.json (preferred) or the
// legacy .cartilla-import/notion-url.txt (id\noutPath pairs).
//
// For each target:
//   { pageId, outPath, fileBlockUuid? }
//
// the fetcher walks Notion's public loadPageChunk endpoint AND scrapes
// the public page HTML for candidate file URLs, then filters to URLs
// belonging to fileBlockUuid (if given). The first candidate that
// downloads and starts with the %PDF- magic header wins.
//
// Hard rule: NEVER fail the build. If a fetch fails, log it and
// exit 0 so the site still deploys.

import fs from 'node:fs';
import path from 'node:path';

const JSON_CONFIG = '.cartilla-import/targets.json';
const TXT_CONFIG = '.cartilla-import/notion-url.txt';

function readTargets() {
  if (fs.existsSync(JSON_CONFIG)) {
    try {
      const arr = JSON.parse(fs.readFileSync(JSON_CONFIG, 'utf8'));
      if (Array.isArray(arr)) return arr;
    } catch (e) {
      console.log('[prebuild] failed to parse', JSON_CONFIG, ':', e.message);
    }
  }
  if (fs.existsSync(TXT_CONFIG)) {
    const lines = fs
      .readFileSync(TXT_CONFIG, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const out = [];
    for (let i = 0; i + 1 < lines.length; i += 2) {
      out.push({ pageId: lines[i], outPath: lines[i + 1] });
    }
    return out;
  }
  return [];
}

const targets = readTargets();
if (targets.length === 0) {
  console.log('[prebuild] no targets configured, skipping');
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

function normalizeUuid(s) {
  return (s || '').toLowerCase().replace(/-/g, '');
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
    return [...new Set([...html.matchAll(re)].map((m) => m[0]))].map(
      (url) => ({ url, blockId: null, source: 'html' }),
    );
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
    const out = [];
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
                out.push({ url: v, blockId: k, source: 'chunk:source' });
              }
            }
          }
        }
      }
      if (b.format && b.format.display_source) {
        out.push({
          url: b.format.display_source,
          blockId: k,
          source: 'chunk:display_source',
        });
      }
    }
    return out;
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
      console.log(
        '[prebuild]     not a PDF, header was',
        JSON.stringify(hdr),
      );
      return false;
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    console.log(
      '[prebuild]     wrote',
      buf.length,
      'bytes to',
      outPath,
    );
    return true;
  } catch (e) {
    console.log('[prebuild]     download error:', e.message);
    return false;
  }
}

function matchesBlockFilter(cand, fileBlockUuid) {
  if (!fileBlockUuid) return true;
  const wanted = normalizeUuid(fileBlockUuid);
  if (cand.blockId && normalizeUuid(cand.blockId) === wanted) return true;
  if (cand.url && normalizeUuid(cand.url).includes(wanted)) return true;
  return false;
}

async function fetchOne(target) {
  const { pageId, outPath, fileBlockUuid, label } = target;
  const { idNoDash, idDashed } = normalizeId(pageId);
  console.log(
    '[prebuild] target',
    label || idNoDash,
    '->',
    outPath,
    fileBlockUuid ? '(block ' + fileBlockUuid + ')' : '',
  );

  const seen = new Map();
  for (const c of await htmlCandidates(idNoDash)) {
    if (!seen.has(c.url)) seen.set(c.url, c);
  }
  for (const c of await chunkCandidates(idDashed)) {
    if (!seen.has(c.url)) seen.set(c.url, c);
  }
  const all = [...seen.values()];
  console.log('[prebuild]   ' + all.length + ' total candidate URL(s)');

  const filtered = all.filter((c) => matchesBlockFilter(c, fileBlockUuid));
  console.log(
    '[prebuild]   ' +
      filtered.length +
      ' candidate(s) after block-uuid filter',
  );

  // Try filtered first. If filter is configured but yields zero, do NOT
  // fall back to other candidates: that's how we picked up the wrong PDF
  // last time.
  const ordered = fileBlockUuid ? filtered : all;

  for (const cand of ordered) {
    console.log(
      '[prebuild]   trying',
      cand.source,
      cand.url.slice(0, 96),
    );
    if (await downloadAndWrite(cand.url, outPath)) return true;
    const m = cand.url.match(
      /\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\//,
    );
    if (m) {
      const signed = await trySignFor(cand.url, m[1]);
      if (signed) {
        console.log('[prebuild]     signed retry');
        if (await downloadAndWrite(signed, outPath)) return true;
      }
    }
  }
  return false;
}

let anySuccess = false;
for (const target of targets) {
  try {
    const ok = await fetchOne(target);
    if (ok) anySuccess = true;
  } catch (e) {
    console.log('[prebuild] unexpected error for', target.pageId, e.message);
  }
}

if (!anySuccess) {
  console.log('[prebuild] no PDFs fetched \u2014 continuing build anyway');
}
process.exit(0);
