// Stitch images side by side at equal height with labels.
import sharp from 'sharp';
import fs from 'fs';

const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
for (const j of jobs) {
  const H = j.height ?? 700;
  const parts = [];
  let x = 0;
  const labels = [];
  for (const p of j.inputs) {
    if (!fs.existsSync(p)) { console.error('missing', p); process.exit(1); }
    const buf = await sharp(p).resize({ height: H }).png().toBuffer();
    const meta = await sharp(buf).metadata();
    parts.push({ input: buf, left: x, top: 0 });
    labels.push({ x: x + 10, w: meta.width });
    x += meta.width + 8;
  }
  const svg = `<svg width="${x - 8}" height="40">${j.labels.map((l, i) => `<text x="${labels[i].x}" y="28" font-size="26" font-family="sans-serif" font-weight="bold" fill="#222">${l}</text>`).join('')}</svg>`;
  const labelBuf = Buffer.from(svg);
  await sharp({ create: { width: x - 8, height: H + 48, channels: 3, background: '#f5f5f5' } })
    .composite([{ input: labelBuf, left: 0, top: 0 }, ...parts.map(p => ({ ...p, top: 44 }))])
    .png().toFile(j.out);
  console.log('wrote', j.out);
}
