const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "../src/data/workbook-interactions.json");
const data = JSON.parse(fs.readFileSync(p, "utf8"));

// Helper to create simple text items
const textItems = (words) => words.map((w, i) => ({ id: `word-${i}`, label: w }));
const sylItems = (syls) => syls.map((s, i) => ({ id: `syl-${s}`, label: s }));

const updates = {
  // Cc Lesson 22
  "l22-p79-syllable-c": {
    items: [],
    targets: [],
    transcriptionStatus: "verified",
    sourceStatus: "verified-source-image",
    teacherNotes: "Tracing activity for C c on page 79.",
  },
  "l22-p80-words-c": {
    items: textItems([
      "cama",
      "cana",
      "cala",
      "loca",
      "casa",
      "saca",
      "coma",
      "cola",
      "cosa",
      "copa",
      "poco",
      "saco",
      "cuna",
      "acuso",
      "Cuba",
      "acumula",
      "acuna",
      "cubo",
    ]),
    targets: [],
    transcriptionStatus: "verified",
    sourceStatus: "verified-source-image",
    teacherNotes: "Encierra en un círculo la sílaba correspondiente. ca co cu.",
  },
  "l22-p80-read-aloud": {
    items: sylItems(["ca", "co", "cu"]),
    targets: [],
    transcriptionStatus: "verified",
    sourceStatus: "verified-source-image",
    teacherNotes: "Syllables ca co cu read aloud.",
  },
  "l22-p81-mini-story": {
    items: textItems([
      "carro",
      "coco",
      "casa",
      "Cuba",
      "camisa",
      "boca",
      "Colombia",
      "poco",
      "pico",
      "Cuco",
      "cuna",
      "saco",
      "roca",
      "cumbia",
      "colonia",
    ]),
    targets: [],
    transcriptionStatus: "verified",
    sourceStatus: "verified-source-image",
    teacherNotes:
      "Cuco Casanova es un buen amigo... Mini story text transcribed from source image.",
  },

  // Yy Lesson 23
  "l23-p83-syllable-y": {
    items: [],
    targets: [],
    transcriptionStatus: "verified",
    sourceStatus: "verified-source-image",
    teacherNotes: "Tracing activity for Y y on page 83.",
  },
  "l23-p84-words-y": {
    items: textItems([
      "yate",
      "yana",
      "Yara",
      "yagua",
      "payaso",
      "maya",
      "yegua",
      "Yesenia",
      "enyesado",
      "Yeyo",
      "yema",
      "yeso",
      "Mayito",
      "Yigüiro",
      "Yayita",
      "Yoyita",
      "Yayi",
      "Mayita",
      "cayo",
      "coyote",
      "yoyo",
      "yo",
      "rayo",
      "Yayo",
      "Yucatán",
      "yuca",
      "Cayuco",
      "ayuda",
      "ayudar",
      "desayuno",
    ]),
    targets: [],
    transcriptionStatus: "verified",
    sourceStatus: "verified-source-image",
    teacherNotes: "Encierra en un círculo la sílaba correspondiente. ya ye yi yo yu.",
  },
  "l23-p84-read-aloud": {
    items: sylItems(["ya", "ye", "yi", "yo", "yu"]),
    targets: [],
    transcriptionStatus: "verified",
    sourceStatus: "verified-source-image",
    teacherNotes: "Syllables ya ye yi yo yu read aloud.",
  },
  "l23-p85-mini-story": {
    items: textItems([
      "yuca",
      "yema",
      "yate",
      "yegua",
      "yagua",
      "ayer",
      "payaso",
      "yute",
      "yoyo",
      "Yucatán",
      "cayo",
      "Mayito",
      "joya",
      "yucateco",
      "yeso",
    ]),
    targets: [],
    transcriptionStatus: "verified",
    sourceStatus: "verified-source-image",
    teacherNotes:
      "El yate de Yayo está en Yateras... Mini story text transcribed from source image.",
  },
  "l23-p86-sentences": {
    items: textItems(["yate", "yuca", "yeso", "Mayito", "cayo", "yema"]),
    targets: [],
    transcriptionStatus: "verified",
    sourceStatus: "verified-source-image",
    teacherNotes: "Completa las palabras con la sílaba correcta.",
  },

  // Zz Lesson 24
  "l24-p87-syllable-z": {
    items: [],
    targets: [],
    transcriptionStatus: "verified",
    sourceStatus: "verified-source-image",
    teacherNotes: "Tracing activity for Z z on page 87.",
  },
};

let modified = 0;
data.interactions.forEach((interaction) => {
  if (updates[interaction.id]) {
    const u = updates[interaction.id];
    interaction.items = u.items;
    interaction.targets = u.targets;
    interaction.transcriptionStatus = u.transcriptionStatus;
    interaction.sourceStatus = u.sourceStatus;
    interaction.teacherNotes = u.teacherNotes;
    modified++;
  }
});

fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
console.log(`Updated ${modified} interactions.`);
