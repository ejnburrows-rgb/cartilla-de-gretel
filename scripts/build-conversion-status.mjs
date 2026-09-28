import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(readFileSync(join(root, file), 'utf8'));
const layouts = read('src/data/page-layouts.json').pages;
const inventory = read('src/data/page-inventory.json').workbook.lessons;
const manifest = read('src/content/workbook/workbook-manifest.json').pages;
const consonants = read('src/content/consonants.json');
const interactions = read('src/data/workbook-interactions.json');
const lessonRanges = new Map([
  [1, '1-3'], [2, '4-6'], [3, '7-9'], [4, '10-12'], [5, '13-15'], [6, '16-18'],
  ...consonants.map(({ lesson, pages }) => [lesson, pages]),
]);

const allInteractions = Array.isArray(interactions) ? interactions : Object.values(interactions).flat();
// Promotion is explicit after source comparison and browser checks. A layout
// record alone never promotes a student page to native.
const nativePages = new Set([19, 20, 21, 22, 23, 24, 25, 26]);
const records = inventory.flatMap(({ lessonId, pages }) => {
  const [start, end] = lessonRanges.get(lessonId).split('-').map(Number);
  return Array.from({ length: end - start + 1 }, (_, offset) => {
    const physicalPage = start + offset;
    const regions = layouts[String(physicalPage)]?.regions ?? [];
    const census = manifest.find((p) => p.physicalPage === physicalPage);
    const listedScan = pages[offset] ? `/cartilla/images/source/${pages[offset]}` : null;
    const canonicalScan = `/cartilla/art/source/workbook/page-${String(physicalPage).padStart(3, '0')}.jpg`;
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
      manifestRecord: census ? `src/content/workbook/workbook-manifest.json#${physicalPage}` : null,
      exerciseMechanics: mechanics,
      workbookInteractions: allInteractions.filter((i) => i && i.lessonNumber === lessonId && i.pageNumber === physicalPage).map((i) => i.id),
      faithfulIllustrations: illustrationAssets,
      sourceScan: image,
      legacyScanReference: listedScan,
      sourceScanPresentInCheckout: Boolean(existingSource && (() => { try { readFileSync(existingSource); return true; } catch { return false; } })()),
      animationCandidates: illustrationAssets.filter((asset) => /\/(mono|mariposa|oso|oruga|abeja|pajaro|pez)\./i.test(asset)),
      gretelGuidance: regions.filter((r) => r.regionType === 'instruction' || r.regionType === 'title').map((r) => r.text).filter(Boolean),
      status: nativePages.has(physicalPage) ? 'NATIVE_COMPLETE' : regions.length ? 'STRUCTURED_PARTIAL' : 'SCAN_ONLY',
      certification: null,
    };
  });
});

const output = {
  schemaVersion: 1,
  sourceOfPageNumbers: 'src/lib/lesson-catalog.ts + src/data/page-inventory.json',
  statusDefinitions: ['SCAN_ONLY', 'STRUCTURED_PARTIAL', 'NATIVE_COMPLETE', 'RIVE_READY', 'CERTIFIED'],
  notes: [
    'The separate 90-page workbook manifest disagrees with lesson-exercises/lesson-07.ts about Lesson 7 numbering; the actual student route uses page-layouts.json pages 19–22.',
    'Pages 19–26 use the native student route. Lessons 7 and 8 have been rendered and interaction-checked in the native shell; no page is animation certified.',
    'Missing source scans in this checkout remain recorded as references; do not silently substitute unrelated artwork.',
  ],
  pages: records,
};
writeFileSync(join(root, 'src/data/conversion-status.json'), JSON.stringify(output, null, 2) + '\n');
console.log(`Mapped ${records.length} student pages; ${records.filter((p) => p.status === 'SCAN_ONLY').length} scan-only; ${records.filter((p) => p.status === 'NATIVE_COMPLETE').length} native complete.`);
