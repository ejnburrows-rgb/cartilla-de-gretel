#!/usr/bin/env node
// Fetch a PDF attachment from a public Notion page via headless Chromium.
//
// Usage:
//   node notion-pdf-fetch.mjs <notion-public-url> <output-path>
//
// Strategy:
//   1. Open the public Notion page in Chromium.
//   2. Wait for network idle, then scroll to force lazy-load of file blocks.
//   3. Collect every URL that looks like a Notion PDF attachment
//      (prod-files-secure S3, file.notion.so, www.notion.so/signed, or *.pdf).
//   4. Try each candidate with the browser context (preserves cookies/headers)
//      until one returns binary content whose first 5 bytes are '%PDF-'.
//   5. Write the bytes to <output-path>.
//
// Exit codes:
//   0  success
//   1  bad args
//   2  no PDF candidate found
//   3  found candidates but none returned valid PDF bytes

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [notionUrl, outPath] = process.argv.slice(2);
if (!notionUrl || !outPath) {
  console.error('Usage: node notion-pdf-fetch.mjs <notion-public-url> <output-path>');
  process.exit(1);
}

console.log('[notion-pdf-fetch] Notion URL :', notionUrl);
console.log('[notion-pdf-fetch] Output path:', outPath);

const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const ctx = await browser.newContext({
  acceptDownloads: true,
  userAgent:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();

const candidates = new Set();

function consider(u) {
  if (!u || typeof u !== 'string') return;
  const lower = u.toLowerCase();
  const looksPdf =
    /\.pdf(?:\?|$|#)/.test(lower) ||
    lower.includes('content-type=application%2fpdf');
  const looksNotionFile =
    lower.includes('prod-files-secure') ||
    lower.includes('file.notion.so') ||
    lower.includes('www.notion.so/signed') ||
    lower.includes('s3.us-west-2.amazonaws.com');
  if (looksPdf || (looksNotionFile && lower.includes('attachment'))) {
    if (!candidates.has(u)) {
      candidates.add(u);
      console.log('[notion-pdf-fetch] candidate:', u);
    }
  }
}

page.on('request', (req) => consider(req.url()));
page.on('response', (res) => consider(res.url()));

console.log('[notion-pdf-fetch] navigating...');
await page.goto(notionUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

try {
  await page.waitForLoadState('networkidle', { timeout: 60000 });
} catch {
  // ignore — Notion keeps long-poll connections open
}

// Force lazy-load of file blocks by scrolling.
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const h = document.body ? document.body.scrollHeight : 2000;
  for (let y = 0; y < h; y += 400) {
    window.scrollTo(0, y);
    await sleep(150);
  }
  window.scrollTo(0, document.body ? document.body.scrollHeight : 4000);
  await sleep(2000);
});

await page.waitForTimeout(2000);

// DOM sweep for any anchor that looks like a PDF.
try {
  const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
  for (const h of hrefs) consider(h);
} catch {}

console.log('[notion-pdf-fetch] total candidates:', candidates.size);

if (candidates.size === 0) {
  console.error(
    '[notion-pdf-fetch] No PDF candidate found. Make sure the Notion page is shared to web and the PDF block is rendered.',
  );
  await browser.close();
  process.exit(2);
}

let wrote = false;
for (const u of candidates) {
  console.log('[notion-pdf-fetch] trying:', u);
  try {
    const r = await ctx.request.get(u, { timeout: 180000 });
    if (!r.ok()) {
      console.log('   HTTP', r.status());
      continue;
    }
    const buf = await r.body();
    if (buf.length < 4096) {
      console.log('   too small:', buf.length, 'bytes');
      continue;
    }
    const header = buf.slice(0, 5).toString('ascii');
    if (!header.startsWith('%PDF-')) {
      console.log('   not PDF header:', JSON.stringify(header));
      continue;
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    console.log('[notion-pdf-fetch] wrote', buf.length, 'bytes to', outPath);
    wrote = true;
    break;
  } catch (e) {
    console.log('   error:', (e && e.message) || e);
  }
}

await browser.close();
process.exit(wrote ? 0 : 3);
