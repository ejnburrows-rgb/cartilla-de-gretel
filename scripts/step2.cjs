const fs = require("fs");
const path = require("path");

const wiPath = path.join(__dirname, "../src/data/workbook-interactions.json");
const wi = JSON.parse(fs.readFileSync(wiPath, "utf8"));
const sourceDir = path.join(__dirname, "../public/cartilla/images/source");

// gather all workbook pages
const wbPages = {};
if (fs.existsSync(sourceDir)) {
  fs.readdirSync(sourceDir).forEach((l) => {
    const p = path.join(sourceDir, l);
    if (fs.statSync(p).isDirectory()) {
      fs.readdirSync(p).forEach((f) => {
        if (f.endsWith(".jpg")) {
          const match = f.match(/-page-(\d+)/);
          if (match) {
            wbPages[parseInt(match[1], 10)] = f;
          }
        }
      });
    }
  });
}

wi.interactions.forEach((i) => {
  if (i.pageNumber && wbPages[i.pageNumber]) {
    i.sourcePage = wbPages[i.pageNumber];
  } else if (i.pageNumber) {
    i.sourceStatus = "missing-source";
  }

  if (i.transcriptionStatus !== "verified") {
    i.transcriptionStatus = "needs-review";
    i.items = [];
    if (i.targets) i.targets = [];
    if (i.wordBank) i.wordBank = [];
    if (i.sightWords) i.sightWords = [];
  }
});

fs.writeFileSync(wiPath, JSON.stringify(wi, null, 2) + "\n");
