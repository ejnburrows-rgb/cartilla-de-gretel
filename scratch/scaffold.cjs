const fs = require("fs");

const letters = [
  { L: "T", l: "t", syls: ["ta", "te", "ti", "to", "tu"] }, // L9
  { L: "L", l: "l", syls: ["la", "le", "li", "lo", "lu"] }, // L10
  { L: "N", l: "n", syls: ["na", "ne", "ni", "no", "nu"] }, // L11
  { L: "D", l: "d", syls: ["da", "de", "di", "do", "du"] }, // L12
  { L: "R", l: "r", syls: ["ra", "re", "ri", "ro", "ru"] }, // L13
  { L: "F", l: "f", syls: ["fa", "fe", "fi", "fo", "fu"] }, // L14
  { L: "B", l: "b", syls: ["ba", "be", "bi", "bo", "bu"] }, // L15
  { L: "C", l: "c", syls: ["ca", "co", "cu"] }, // L16
];

const PENDIENTE = "PENDIENTE — requiere verificación con PDF";

// 1. Generate lesson-X.ts files
for (let i = 0; i < letters.length; i++) {
  const ln = i + 9;
  const m = letters[i];

  const content = `export const lesson${ln.toString().padStart(2, "0")} = [
  {
    id: "l${ln}-pX-letter-tracing",
    lessonNumber: ${ln},
    pageNumber: ${ln * 4 - 5},
    kind: "letter-tracing",
    title: "${PENDIENTE}",
    prompt: "${PENDIENTE}",
    items: [
      { id: "letter-${m.L}", label: "${m.L}" },
      { id: "letter-${m.l}", label: "${m.l}" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded tracing for ${m.L}.",
    sourcePage: ""
  },
  {
    id: "l${ln}-pX-syllable-circle",
    lessonNumber: ${ln},
    pageNumber: ${ln * 4 - 4},
    kind: "drag-syllable-to-slot",
    title: "${PENDIENTE}",
    prompt: "${PENDIENTE}",
    items: [
      ${m.syls.map((s) => `{ id: "syl-${s}", label: "${s}" }`).join(",\n      ")}
    ],
    targets: [
      ${m.syls.map((s) => `{ id: "slot-${s}", label: "${s}", coordinatesVerified: false, acceptsItemId: "syl-${s}" }`).join(",\n      ")}
    ],
    wordBank: [
      "${PENDIENTE}"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for ${m.L}.",
    sourcePage: ""
  },
  {
    id: "l${ln}-pX-syllable-tap",
    lessonNumber: ${ln},
    pageNumber: ${ln * 4 - 4},
    kind: "read-aloud",
    title: "${PENDIENTE}",
    prompt: "${PENDIENTE}",
    items: [
      ${m.syls.map((s) => `{ id: "ra-${s}", label: "${s}" }`).join(",\n      ")}
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for ${m.L}.",
    sourcePage: ""
  },
  {
    id: "l${ln}-pX-word-bank",
    lessonNumber: ${ln},
    pageNumber: ${ln * 4 - 4},
    kind: "listen-and-tap",
    title: "${PENDIENTE}",
    prompt: "${PENDIENTE}",
    items: [
      { id: "w-pendiente", label: "${PENDIENTE}" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for ${m.L}.",
    sourcePage: ""
  },
  {
    id: "l${ln}-pX-mini-story",
    lessonNumber: ${ln},
    pageNumber: ${ln * 4 - 4},
    kind: "mini-story",
    title: "${PENDIENTE}",
    prompt: "${PENDIENTE}",
    items: [
      { id: "story-${m.l}-1", label: "${PENDIENTE}" }
    ],
    targets: [],
    sightWords: [
      "${PENDIENTE}"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for ${m.L}.",
    sourcePage: ""
  },
  {
    id: "l${ln}-pX-fill-in-blank",
    lessonNumber: ${ln},
    pageNumber: ${ln * 4 - 3},
    kind: "drag-syllable-to-slot",
    title: "${PENDIENTE}",
    prompt: "${PENDIENTE}",
    items: [
      ${m.syls.map((s) => `{ id: "syl-${s}", label: "${s}" }`).join(",\n      ")}
    ],
    targets: [
      {
        id: "blank-1",
        label: "___",
        hint: "${PENDIENTE}",
        correctSyllable: "${m.syls[0]}",
        fullWord: "${PENDIENTE}",
        coordinatesVerified: false,
        acceptsItemId: "syl-${m.syls[0]}"
      }
    ],
    exercises: [
      {
        partial: "___",
        choices: ["${m.syls[0]}", "${m.syls[1] || m.syls[0]}"],
        answer: "${m.syls[0]}",
        fullWord: "${PENDIENTE}"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for ${m.L}.",
    sourcePage: ""
  }
];
`;
  fs.writeFileSync(`src/data/lessons/lesson-${ln.toString().padStart(2, "0")}.ts`, content);
}

// 2. Update consonants.json
const consPath = "src/content/consonants.json";
let cons = JSON.parse(fs.readFileSync(consPath, "utf8"));

// Filter out 9 to 16
const newCons = cons.filter((c) => c.lesson < 9 || c.lesson > 16);

const l9_16 = letters.map((m, i) => {
  const ln = i + 9;
  const startPage = 27 + i * 4;
  return {
    letter: m.l,
    lesson: ln,
    pages: `${startPage}-${startPage + 3}`,
    color:
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0"),
    syllables: m.syls,
    examples: m.syls.reduce((acc, s) => {
      acc[s] = [PENDIENTE];
      return acc;
    }, {}),
    sentences: [PENDIENTE],
  };
});

newCons.push(...l9_16);
newCons.sort((a, b) => a.lesson - b.lesson);
fs.writeFileSync(consPath, JSON.stringify(newCons, null, 2));

console.log("Done scaffolding files.");
