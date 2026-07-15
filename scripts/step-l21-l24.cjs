const fs = require("fs");
const path = require("path");

const wiPath = path.join(__dirname, "../src/data/workbook-interactions.json");
const piPath = path.join(__dirname, "../src/data/page-inventory.json");
const tgPath = path.join(__dirname, "../src/data/teacher-guide.json");

// Step 1: Update workbook-interactions.json
const wi = JSON.parse(fs.readFileSync(wiPath, "utf8"));
wi.interactions.forEach((i) => {
  if ([21, 22, 23, 24].includes(i.lessonNumber)) {
    i.sourceStatus = "teacher-distributed";
    i.transcriptionStatus = "not-applicable";
    i.note =
      "Teacher distributes this content as a separate handout. No bound workbook pages exist for this lesson.";
    i.items = [];
    if (i.targets) i.targets = [];
  }
});
fs.writeFileSync(wiPath, JSON.stringify(wi, null, 2) + "\n");

// Step 2: Update page-inventory.json
const pi = JSON.parse(fs.readFileSync(piPath, "utf8"));
if (!pi.workbook.lessons) pi.workbook.lessons = [];
[21, 22, 23, 24].forEach((lessonId) => {
  let lesson = pi.workbook.lessons.find((l) => l.lessonId === lessonId);
  if (!lesson) {
    lesson = { lessonId };
    pi.workbook.lessons.push(lesson);
  }
  lesson.pages = [];
  lesson.note = "Teacher-distributed. No bound workbook pages.";
});
fs.writeFileSync(piPath, JSON.stringify(pi, null, 2) + "\n");

// Step 3: Update teacher-guide.json
const tg = JSON.parse(fs.readFileSync(tgPath, "utf8"));
tg.lessons.forEach((l) => {
  const lessonId = l.lesson || l.id;
  if ([21, 22, 23, 24].includes(lessonId)) {
    l.distributionMethod = "teacher-handout";
    l.needsReview = false;
  }
});
fs.writeFileSync(tgPath, JSON.stringify(tg, null, 2) + "\n");
