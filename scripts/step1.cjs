const fs = require("fs");
const path = require("path");

const flipchartDir = path.join(__dirname, "../public/cartilla/images/teacher-flipchart");
const sourceDir = path.join(__dirname, "../public/cartilla/images/source");

const flipchartPages = fs.existsSync(flipchartDir)
  ? fs.readdirSync(flipchartDir).filter((f) => f.endsWith(".jpg"))
  : [];
const workbookPages = [];
if (fs.existsSync(sourceDir)) {
  const letters = fs.readdirSync(sourceDir);
  letters.forEach((l) => {
    const p = path.join(sourceDir, l);
    if (fs.statSync(p).isDirectory()) {
      fs.readdirSync(p)
        .filter((f) => f.endsWith(".jpg"))
        .forEach((f) => {
          workbookPages.push(f);
        });
    }
  });
}

const inventory = {
  flipchart: {
    description: "Teacher classroom flipchart cards",
    path: "public/cartilla/images/teacher-flipchart",
    totalPages: flipchartPages.length,
    pagesPerLesson: 0,
    lessons: [],
  },
  workbook: {
    description: "Student libro del alumno",
    path: "public/cartilla/images/source",
    totalPages: workbookPages.length,
    pagesPerLesson: 0,
    lessons: [],
  },
};

fs.writeFileSync(
  path.join(__dirname, "../src/data/page-inventory.json"),
  JSON.stringify(inventory, null, 2),
);
