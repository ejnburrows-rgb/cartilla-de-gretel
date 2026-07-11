
const fs = require("fs");

function updateFile(file) {
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  let updated = false;

  Object.values(data.pages).forEach(page => {
    const hasFill = page.regions.some(r => r.regionType === "fill-in-blank");
    if (hasFill) {
      const hasEscribe = page.regions.some(r => r.text && r.text.includes("Escribe oraciones"));
      if (!hasEscribe) {
        // Find the existing instruction region
        const instr = page.regions.find(r => r.regionType === "instruction");
        if (instr) {
          instr.text = "Completa las palabras con la sílaba correcta. Escribe oraciones con el nombre de cada figura. Usa las sílabas que aprendiste.";
          updated = true;
        }
      }
    }
  });

  if (updated) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log("Updated " + file);
  } else {
    console.log("No changes needed in " + file);
  }
}

updateFile("src/content/page-layouts.json");
updateFile("src/data/page-layouts.json");

