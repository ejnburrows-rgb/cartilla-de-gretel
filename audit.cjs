const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/page-layouts.json', 'utf8'));

let report = [];

for (let i = 1; i <= 90; i++) {
  const pageStr = String(i);
  const page = data.pages[pageStr];
  if (!page) continue;

  const instructions = page.regions.filter(r => r.regionType === 'instruction');
  const hasWriting = page.regions.some(r => r.regionType === 'writing-line');
  const hasSyllable = page.regions.some(r => r.regionType === 'syllable-match');
  const hasFill = page.regions.some(r => r.regionType === 'fill-in-blank');
  const hasTitle = page.regions.some(r => r.regionType === 'title');

  let pageType = 'reading';
  if (hasWriting) pageType = 'writing';
  if (hasSyllable) pageType = 'syllable';
  if (hasFill) pageType = 'fill';
  if (hasTitle) pageType = 'title';

  // We can also extract the target letter/word to identify the lesson.
  let target = '';
  if (pageType === 'writing') target = page.regions.find(r => r.regionType === 'writing-line')?.modelText || '';
  if (pageType === 'title') target = page.regions.find(r => r.regionType === 'title')?.text || '';
  if (pageType === 'fill') target = page.regions.find(r => r.regionType === 'fill-in-blank')?.fillItems?.[0]?.wordBox || '';

  report.push({
    page: pageStr,
    pageType,
    target,
    jsonInstructions: instructions.map(r => r.text)
  });
}

fs.writeFileSync('audit_report.json', JSON.stringify(report, null, 2));
console.log('Wrote audit_report.json');
