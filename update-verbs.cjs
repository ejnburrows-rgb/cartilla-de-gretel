
const fs = require("fs");

function fixVerbs(file) {
  if (!fs.existsSync(file)) return;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  let updated = false;

  Object.values(data.pages).forEach(page => {
    page.regions.forEach(r => {
      if (r.regionType === "instruction" && r.text) {
        let newText = r.text;
        
        // Fix "Circula los dibujos..." -> "Toca los dibujos..."
        if (newText.startsWith("Circula ")) {
          newText = newText.replace("Circula", "Toca");
        }
        
        // Fix "Marca con una x los dibujos..." -> "Toca los dibujos..."
        if (newText.startsWith("Marca con una x los ")) {
          newText = newText.replace("Marca con una x los ", "Toca los ");
        }

        // Fix "Escribe con tu mejor letra." -> "Traza con tu mejor letra."
        if (newText.includes("Escribe con tu mejor letra")) {
          newText = newText.replace("Escribe con tu mejor letra", "Traza con tu mejor letra");
        }

        if (newText !== r.text) {
          console.log(`Page changed: ${r.text} -> ${newText}`);
          r.text = newText;
          updated = true;
        }
      }
    });
  });

  if (updated) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log("Updated " + file);
  }
}

fixVerbs("src/content/page-layouts.json");
fixVerbs("src/data/page-layouts.json");

