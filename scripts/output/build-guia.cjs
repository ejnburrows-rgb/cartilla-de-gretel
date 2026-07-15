const fs = require("fs");
const path = require("path");

const srcFile = path.resolve(
  __dirname,
  "../../docs/Transcripción Integral_ La cartilla de Gretel - Guía del profesor.txt",
);
const teacherDataFile = path.resolve(__dirname, "../../src/content/teacher-folder-data.ts");
let content = fs.readFileSync(srcFile, "utf8");

// Parse teacher-folder-data.ts
const teacherDataContent = fs.readFileSync(teacherDataFile, "utf8");
const teacherDataRegex =
  /(\d+):\s*\{\s*evaluationPage:\s*(null|\d+),\s*rhymeTitle:\s*(null|".*?")\s*\}/g;
const teacherData = {};
let tMatch;
while ((tMatch = teacherDataRegex.exec(teacherDataContent)) !== null) {
  teacherData[parseInt(tMatch[1], 10)] = {
    evaluationPage: tMatch[2] === "null" ? null : parseInt(tMatch[2], 10),
    rhymeTitle: tMatch[3] === "null" ? null : tMatch[3].replace(/"/g, ""),
  };
}

// Strip page headers
content = content.replace(/^Página \d+\s*$/gm, "");
content = content.replace(/^página \d+\s*$/gm, "");
content = content.replace(/Página \d+\r?\n?página \d+/g, "");

// normalize newlines
content = content.replace(/\r\n/g, "\n");

// Clean up text boundaries
content = content.replace(
  /Teacher’s GuideObjectivesListening \/ Speaking \/ Viewing/g,
  "Teacher’s Guide\nObjectives\nListening / Speaking / Viewing\n",
);
content = content.replace(/Reading \/ Literature/g, "\nReading / Literature\n");
content = content.replace(/Writing \/ Language Mechanics/g, "\nWriting / Language Mechanics\n");
content = content.replace(/Culture/g, "\nCulture\n");
content = content.replace(/Teaching Materials/g, "\nTeaching Materials\n");
content = content.replace(/Summary/g, "\nSummary\n");
content = content.replace(
  /Lesson DevelopmentOral Activity/g,
  "\nLesson Development\nOral Activity\n",
);
content = content.replace(/Motivación/g, "\nMotivación\n");
content = content.replace(/ReinforcementBlackline Masters/g, "\nReinforcement\nBlackline Masters");
content = content.replace(/EvaluationLección/g, "\nEvaluation\nLección");
content = content.replace(/EnrichmentReproducible/g, "\nEnrichment\nReproducible");

// Split into lessons by "Teacher’s Guide"
const startIndex = content.indexOf("Lección 1:");
content = content.substring(startIndex);

// Split the content by looking for "Lección X: ... Teacher's Guide"
// Wait, the replacement changed it to "Teacher's Guide\nObjectives..."
// The original was "Lección \d+: [^\n]*? Teacher’s Guide"
// Let's use a regex to split.
const parts = content.split(/(?=Lección \d+:.*Teacher’s Guide)/);

const lessons = [];

for (const part of parts) {
  const match = part.match(/^Lección (\d+):/);
  if (!match) continue;
  const lessonId = parseInt(match[1], 10);

  if (part.length < 200) continue;

  // Extract Objectives
  let objectivesStr = "";
  const objMatch = part.match(/Objectives\n([\s\S]*?)\nTeaching Materials/);
  if (objMatch) {
    objectivesStr = objMatch[1];
  }

  const objLines = objectivesStr
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const headingsToSkip = [
    "Listening / Speaking / Viewing",
    "Reading / Literature",
    "Writing / Language Mechanics",
    "Culture",
  ];
  const objectives = [];

  for (let line of objLines) {
    if (headingsToSkip.includes(line)) continue;
    objectives.push(line);
  }

  // Extract Lesson Development
  let lessonDevStr = "";
  const devMatch = part.match(/Lesson Development\n([\s\S]*?)(?=\nReinforcement|\nEvaluation|$)/);
  if (devMatch) {
    lessonDevStr = devMatch[1].trim();
  }

  // Extract Motivacion
  let motivation = "";
  const motMatch = lessonDevStr.match(
    /Motivación\n([\s\S]*?)(?=\nReading \/ Literature|\nOpen to Activity Book|\nWriting \/ Language Mechanics|$)/,
  );
  if (motMatch) {
    motivation = motMatch[1].trim();
  }

  // Extract Evaluation Note
  let evalNote = "";
  const evalMatch = part.match(/Evaluation\n([\s\S]*?)(?=\nEnrichment|$)/);
  if (evalMatch) {
    evalNote = evalMatch[1].trim().replace(/\n/g, " ");
  }

  const td = teacherData[lessonId] || { evaluationPage: null, rhymeTitle: null };

  const schemaJson = {
    lessonId,
    objectives,
    motivation,
    script: lessonDevStr,
    evaluationRef: {
      page: td.evaluationPage,
      note: evalNote || null,
    },
    rhyme: {
      title: td.rhymeTitle,
      text: null,
    },
    provenance: {
      source: "docs/Transcripción Integral_ La cartilla de Gretel - Guía del profesor.txt",
      verified: true,
    },
  };

  lessons.push(schemaJson);
}

// Generate for lessons 1 to 24
const outputDir = path.resolve(__dirname, "../../src/content/guia");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const manifest = {
  version: "1.0",
  lessons: {},
};

for (let i = 1; i <= 24; i++) {
  let json;
  if (i <= 15) {
    json = lessons.find((l) => l.lessonId === i);
    if (!json) {
      console.log("Missing lesson " + i);
    }
  } else {
    const td = teacherData[i] || { evaluationPage: null, rhymeTitle: null };
    json = {
      lessonId: i,
      objectives: ["AWAITING-SOURCE-SCAN"],
      motivation: "AWAITING-SOURCE-SCAN",
      script: "AWAITING-SOURCE-SCAN",
      evaluationRef: {
        page: td.evaluationPage,
        note: "AWAITING-SOURCE-SCAN",
      },
      rhyme: {
        title: td.rhymeTitle,
        text: null,
      },
      provenance: {
        source: "AWAITING-SOURCE-SCAN",
        verified: false,
      },
    };
  }

  // Write to file
  const fileName = `lesson-${i}.json`;
  if (json) {
    fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(json, null, 2), "utf8");
  }
  manifest.lessons[i] = {
    file: fileName,
    status: i <= 15 ? "transcribed" : "pending",
  };
}

fs.writeFileSync(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

console.log("Successfully generated JSON files.");
