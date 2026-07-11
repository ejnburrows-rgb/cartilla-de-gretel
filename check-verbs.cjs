
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("src/content/page-layouts.json", "utf8"));
const changes = [];

Object.entries(data.pages).forEach(([pageNum, page]) => {
  page.regions.forEach(r => {
    if (r.regionType === "instruction" && r.text && r.text.includes("Escribe")) {
      changes.push({ page: pageNum, old: r.text });
    }
  });
});

console.log(JSON.stringify(changes, null, 2));

