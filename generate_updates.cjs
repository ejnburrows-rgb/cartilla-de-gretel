const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/page-layouts.json', 'utf8'));
const audit = JSON.parse(fs.readFileSync('audit_report.json', 'utf8'));

for (let p of audit) {
  const pageId = p.page;
  const page = data.pages[pageId];
  const pageNum = parseInt(pageId);
  
  if (p.pageType === 'writing' || p.pageType === 'syllable') {
    if (pageNum >= 19) {
      // INVENTED content for consonants!
      page.regions.forEach(r => {
        if (r.regionType === 'instruction') {
          r.text = "UNREADABLE";
        }
      });
    } else {
      // Vowel tracing/matching. 
      // Paper says "Escribe con tu mejor letra." Screen has tracing, so text must say "Traza con tu mejor letra."
      // Paper says "Traza una línea desde..." Screen has matching, so text stays "Traza una línea desde..." or maybe "Presiona..."?
      // Wait, let's leave vowels alone unless explicitly instructed, but the example says "Escribe" -> "Traza".
      page.regions.forEach(r => {
        if (r.regionType === 'instruction' && r.text.includes('Escribe con tu mejor letra')) {
          r.text = r.text.replace('Escribe', 'Traza');
        }
      });
    }
  } else if (p.pageType === 'fill') {
    // Fill-in-blank pages have the first instruction "Completa las palabras con la sílaba correcta."
    // Paper also has: "Escribe oraciones. Usa las sílabas que aprendiste."
    const hasSecond = page.regions.some(r => r.text === "Escribe oraciones. Usa las sílabas que aprendiste.");
    if (!hasSecond) {
      page.regions.push({
        id: `p${pageId}-instr2`,
        regionType: "instruction",
        order: Math.max(...page.regions.map(r => r.order)) + 1,
        fontRole: "body",
        text: "Escribe oraciones. Usa las sílabas que aprendiste."
      });
    }
  } else if (p.pageType === 'reading') {
    // Vowels have reading pages 1-4.
    // e.g. "Circula los dibujos..." -> "Presiona los dibujos..."
    page.regions.forEach(r => {
      if (r.regionType === 'instruction' && r.text.startsWith('Circula ')) {
        r.text = r.text.replace('Circula', 'Presiona');
      }
    });
  }
}

fs.writeFileSync('src/data/page-layouts.json', JSON.stringify(data, null, 2));
console.log('Updated page-layouts.json!');
