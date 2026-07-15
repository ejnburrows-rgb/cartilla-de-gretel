const fs = require("fs");
const path = require("path");

const wPath = path.join(__dirname, "src", "data", "workbook-interactions.json");
const w = JSON.parse(fs.readFileSync(wPath, "utf8"));

for (let i = 0; i < w.interactions.length; i++) {
  const item = w.interactions[i];
  if (item.lessonNumber === 1 && item.transcriptionStatus === "needs-review") {
    item.sourcePage = "vocales-page-01.png";
  }
  if (item.lessonNumber === 17 && item.transcriptionStatus === "needs-review") {
    if (item.id === "l17-p61-poem-r") {
      item.sourcePage = "b-page-39.png";
    } else if (item.id === "l17-p62-read-aloud") {
      item.sourcePage = "b-page-40.png";
    }
  }
}

fs.writeFileSync(wPath, JSON.stringify(w, null, 2) + "\n", "utf8");
