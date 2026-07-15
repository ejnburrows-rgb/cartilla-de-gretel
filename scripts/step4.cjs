const fs = require("fs");
const path = require("path");

const wiPath = path.join(__dirname, "../src/data/workbook-interactions.json");
const tgPath = path.join(__dirname, "../src/data/teacher-guide.json");

const wi = JSON.parse(fs.readFileSync(wiPath, "utf8"));
const tg = JSON.parse(fs.readFileSync(tgPath, "utf8"));

// Build lesson letter mapping from teacher-guide
const lessonToLetter = {};
tg.lessons.forEach((l) => {
  const title = l.title || "";
  // Extract letter, e.g., "Mm" -> "m", "R inicial" -> "r", "Ññ" -> "ñ"
  let letter = title.toLowerCase().charAt(0);
  if (title === "R inicial") letter = "r";
  if (title === "rr") letter = "rr";
  if (title === "Ch ch") letter = "ch"; // If it exists
  if (title === "Ll") letter = "ll";

  if (title.length === 2 && title[0].toLowerCase() === title[1].toLowerCase()) {
    letter = title[0].toLowerCase();
  }
  lessonToLetter[l.lesson || l.id] = letter;
});

let filled = 0;
let leftNeedsReview = 0;

wi.interactions.forEach((i) => {
  if (
    i.transcriptionStatus === "needs-review" &&
    i.sourceStatus !== "missing-source" &&
    i.sourcePage
  ) {
    const lessonNum = i.lessonNumber;
    const expectedLetter = lessonToLetter[lessonNum];

    // Parse letter from filename (e.g., "n-page-27.jpg" -> "n")
    const fileLetterMatch = i.sourcePage.match(/^([a-zñ]+)-page-/i);
    const fileLetter = fileLetterMatch ? fileLetterMatch[1].toLowerCase() : null;

    // We only fill if we can confirm from the filename and teacher-guide
    // Since we cannot OCR the image, the only way to "confirm" is if the filename letter matches the lesson letter,
    // AND we can build the syllables from teacher-guide.
    // But since the instruction says "fill the interaction's items[] array using ONLY content that can be read directly from that image file",
    // and we have no OCR capability, we must leave it as needs-review if we can't extract the exact words.
    // For syllables, we could theoretically infer them, but it's risky.
    // However, the rule says: "If content CANNOT be confirmed from the image filename and teacher-guide.json alone -> leave as needs-review. Do NOT guess."

    let canConfirm = false;
    if (fileLetter && expectedLetter && fileLetter === expectedLetter) {
      // We'd still need to know what's on the page (word reveal vs syllable vs story).
      // Without OCR, we can't read the story or the words.
      // So we can never confirm the content.
      canConfirm = false;
    }

    if (!canConfirm) {
      leftNeedsReview++;
    } else {
      // In a real OCR scenario, we would fill it here.
      // i.transcriptionStatus = 'verified';
      // filled++;
    }
  }
});

fs.writeFileSync(wiPath, JSON.stringify(wi, null, 2) + "\n");

// Reporting
const lessonStats = {};
for (let i = 1; i <= 24; i++) {
  lessonStats[i] = { verified: 0, needsReview: 0, missingSource: 0, total: 0 };
}

wi.interactions.forEach((i) => {
  const l = i.lessonNumber;
  if (!lessonStats[l]) return;
  lessonStats[l].total++;
  if (i.transcriptionStatus === "verified") lessonStats[l].verified++;
  if (i.transcriptionStatus === "needs-review") lessonStats[l].needsReview++;
  if (i.sourceStatus === "missing-source" || i.sourceStatus === "missing")
    lessonStats[l].missingSource++;
});

let fullyVerified = [];
let needMissingSource = [];

Object.entries(lessonStats).forEach(([l, s]) => {
  if (s.total > 0 && s.verified === s.total) fullyVerified.push(l);
  if (s.missingSource > 0) needMissingSource.push(l);
});

console.log("Filled:", filled);
console.log("Left as needs-review:", leftNeedsReview);
console.log(
  "Fully verified lessons:",
  fullyVerified.map((l) => "L" + l.padStart(2, "0")).join(", "),
);
console.log(
  "Lessons needing missing source images:",
  needMissingSource.map((l) => "L" + l.padStart(2, "0")).join(", "),
);
