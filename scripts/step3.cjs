const fs = require("fs");
const path = require("path");

const tgPath = path.join(__dirname, "../src/data/teacher-guide.json");
const tg = JSON.parse(fs.readFileSync(tgPath, "utf8"));

tg.lessons.forEach((l) => {
  l.needsReview = true;
  if (!Array.isArray(l.vocabulary)) {
    l.vocabulary = l.vocabulary ? [l.vocabulary] : [];
  }
  if (!Array.isArray(l.poem)) {
    l.poem = l.poem ? [l.poem] : [];
  }
  // Clear them if we cannot confirm
  l.vocabulary = [];
  l.poem = [];
  if (l.procedures && !Array.isArray(l.procedures)) {
    l.procedures = [l.procedures];
  }
  if (l.objectives && !Array.isArray(l.objectives)) {
    l.objectives = [l.objectives];
  }

  if (l.lesson !== undefined && l.id === undefined) {
    l.id = l.lesson;
  }
});

fs.writeFileSync(tgPath, JSON.stringify(tg, null, 2) + "\n");
