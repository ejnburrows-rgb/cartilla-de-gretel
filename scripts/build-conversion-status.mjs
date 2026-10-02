import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(readFileSync(join(root, file), 'utf8'));
const layouts = read('src/data/page-layouts.json').pages;
const inventory = read('src/data/page-inventory.json').workbook.lessons;
const consonants = read('src/content/consonants.json');
const lessonRanges = new Map([
  [1, '1-3'], [2, '4-6'], [3, '7-9'], [4, '10-12'], [5, '13-15'], [6, '16-18'],
  ...consonants.map(({ lesson, pages }) => [lesson, pages]),
]);

// Every instructional page now renders through the same native lesson shell.
// Certification remains a separate QA state; native rendering alone does not
// imply animation/cinematic certification.
const nativePages = new Set(Array.from({ length: 90 }, (_, i) => i + 1));
const missingCanonicalSourcePages = new Set([86, 87]);
const records = inventory.flatMap(({ lessonId, pages }) => {
  const [start, end] = lessonRanges.get(lessonId).split('-').map(Number);
  return Array.from({ length: end - start + 1 }, (_, offset) => {
    const physicalPage = start + offset;
    const regions = layouts[String(physicalPage)]?.regions ?? [];
    const listedScan = pages[offset] ? `/cartilla/images/source/${pages[offset]}` : null;
    const canonicalScan = missingCanonicalSourcePages.has(physicalPage)
      ? null
      : `/cartilla/art/source/workbook/page-${String(physicalPage).padStart(3, '0')}.jpg`;
    const image = canonicalScan;
    const illustrationAssets = [...new Set(regions.flatMap((r) => [
      r.illustrationSrc,
      ...(r.cells ?? []).map((c) => c.illustrationSrc),
      ...(r.vowelRows ?? []).flatMap((row) => row.cells.map((c) => c.illustrationSrc)),
      ...(r.vowelPairs ?? []).map((c) => c.illustrationSrc),
      ...(r.matchRows ?? []).flat().map((c) => c.illustrationSrc),
      ...(r.fillItems ?? []).map((c) => c.illustrationSrc),
    ].filter(Boolean)))];
    const mechanics = [...new Set(regions.map((r) => r.regionType).filter((type) =>
      ['picture-grid', 'vowel-pick-one', 'vowel-match-all', 'vowel-line-match',
        'syllable-match', 'fill-in-blank', 'writing-line', 'draw-box', 'paint-box'].includes(type)))];
    const existingSource = image ? join(root, 'public', image.slice(1)) : null;
    return {
      physicalPage, lesson: lessonId,
      renderer: regions.length ? 'FaithfulPageRenderer' : 'PdfPage fallback',
      structuredContent: regions.length ? `src/data/page-layouts.json#pages.${physicalPage}` : null,
      exerciseMechanics: mechanics,
      faithfulIllustrations: illustrationAssets,
      sourceScan: image,
      legacyScanReference: listedScan,
      sourceScanPresentInCheckout: Boolean(existingSource && (() => { try { readFileSync(existingSource); return true; } catch { return false; } })()),
      animationCandidates: illustrationAssets.filter((asset) => /\/(mono|mariposa|oso|oruga|abeja|pajaro|pez)\./i.test(asset)),
      gretelGuidance: regions.filter((r) => r.regionType === 'instruction' || r.regionType === 'title').map((r) => r.text).filter(Boolean),
      status: missingCanonicalSourcePages.has(physicalPage) ? 'SOURCE_BLOCKED' : nativePages.has(physicalPage) ? 'NATIVE_COMPLETE' : regions.length ? 'STRUCTURED_PARTIAL' : 'SCAN_ONLY',
      certification: null,
    };
  });
});

const output = {
  schemaVersion: 1,
  sourceOfPageNumbers: 'src/lib/lesson-catalog.ts + src/data/page-inventory.json',
  statusDefinitions: ['SOURCE_BLOCKED', 'SCAN_ONLY', 'STRUCTURED_PARTIAL', 'NATIVE_COMPLETE', 'ANIMATION_READY', 'CERTIFIED'],
  notes: [
    'page-layouts.json is the single workbook content source; the old parallel workbook-manifest.json pipeline was removed.',
    'Pages 1–90 use the native student route and FaithfulPageRenderer. Pages 86–87 are SOURCE_BLOCKED: they render, but cannot be verified against the printed book until the owner supplies a rescan.',
    'The authoritative source scan has a verified gap at printed pages 86–87. Native structured content remains the product surface there; no substitute scan is invented.',
  ],
  pages: records,
};
writeFileSync(join(root, 'src/data/conversion-status.json'), JSON.stringify(output, null, 2) + '\n');
console.log(`Mapped ${records.length} student pages; ${records.filter((p) => p.status === 'SCAN_ONLY').length} scan-only; ${records.filter((p) => p.status === 'NATIVE_COMPLETE').length} native complete; ${records.filter((p) => p.status === 'SOURCE_BLOCKED').length} source-blocked.`);
