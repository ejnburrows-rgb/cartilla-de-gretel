export const lesson12 = [
  {
    id: "l12-p35-letter-tracing",
    lessonNumber: 12,
    pageNumber: 35,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — N n",
    prompt: "Traza la letra N mayúscula y la n minúscula. Luego haz un dibujo de una palabra que comienza con n.",
    items: [
      {
        id: "letter-N",
        label: "N"
      },
      {
        id: "letter-n",
        label: "n"
      }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase N and lowercase n.",
    sourcePage: ""
  },
  {
    id: "l12-p36-syllable-circle",
    lessonNumber: 12,
    pageNumber: 36,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — N n",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-na", label: "na" },
      { id: "syl-ne", label: "ne" },
      { id: "syl-ni", label: "ni" },
      { id: "syl-no", label: "no" },
      { id: "syl-nu", label: "nu" }
    ],
    targets: [
      {
        id: "slot-na",
        label: "na",
        coordinatesVerified: false,
        acceptsItemId: "syl-na"
      },
      {
        id: "slot-ne",
        label: "ne",
        coordinatesVerified: false,
        acceptsItemId: "syl-ne"
      },
      {
        id: "slot-ni",
        label: "ni",
        coordinatesVerified: false,
        acceptsItemId: "syl-ni"
      },
      {
        id: "slot-no",
        label: "no",
        coordinatesVerified: false,
        acceptsItemId: "syl-no"
      },
      {
        id: "slot-nu",
        label: "nu",
        coordinatesVerified: false,
        acceptsItemId: "syl-nu"
      }
    ],
    wordBank: [
      "nene",
      "nido",
      "nudo",
      "pino",
      "mono",
      "luna",
      "mano",
      "nota",
      "lana",
      "dona"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for N.",
    sourcePage: ""
  },
  {
    id: "l12-p36-syllable-tap",
    lessonNumber: 12,
    pageNumber: 36,
    kind: "read-aloud",
    title: "Sílabas con N — página Nn",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-na", label: "na" },
      { id: "ra-ne", label: "ne" },
      { id: "ra-ni", label: "ni" },
      { id: "ra-no", label: "no" },
      { id: "ra-nu", label: "nu" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for N.",
    sourcePage: ""
  },
  {
    id: "l12-p36-word-bank",
    lessonNumber: 12,
    pageNumber: 36,
    kind: "listen-and-tap",
    title: "Palabras con N",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-nene", label: "nene" },
      { id: "w-nido", label: "nido" },
      { id: "w-nudo", label: "nudo" },
      { id: "w-pino", label: "pino" },
      { id: "w-mono", label: "mono" },
      { id: "w-luna", label: "luna" },
      { id: "w-mano", label: "mano" },
      { id: "w-nota", label: "nota" },
      { id: "w-lana", label: "lana" },
      { id: "w-dona", label: "dona" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for N.",
    sourcePage: ""
  },
  {
    id: "l12-p36-mini-story",
    lessonNumber: 12,
    pageNumber: 36,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-n-1", label: "El mono de Nina." },
      { id: "story-n-2", label: "Nina tiene una lana." },
      { id: "story-n-3", label: "La luna ilumina el pino." },
      { id: "story-n-4", label: "El nene de la mano." }
    ],
    targets: [],
    sightWords: [
      "yo",
      "y",
      "el",
      "la"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for N.",
    sourcePage: ""
  },
  {
    id: "l12-p37-fill-in-blank",
    lessonNumber: 12,
    pageNumber: 37,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — N n",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-do", label: "do" },
      { id: "syl-na", label: "na" },
      { id: "syl-no", label: "no" },
      { id: "syl-ne", label: "ne" }
    ],
    targets: [
      {
        id: "blank-nido",
        label: "ni___",
        hint: "do / da",
        correctSyllable: "do",
        fullWord: "nido",
        coordinatesVerified: false,
        acceptsItemId: "syl-do"
      },
      {
        id: "blank-luna",
        label: "lu___",
        hint: "na / no",
        correctSyllable: "na",
        fullWord: "luna",
        coordinatesVerified: false,
        acceptsItemId: "syl-na"
      },
      {
        id: "blank-mano",
        label: "ma___",
        hint: "no / na",
        correctSyllable: "no",
        fullWord: "mano",
        coordinatesVerified: false,
        acceptsItemId: "syl-no"
      },
      {
        id: "blank-mono",
        label: "mo___",
        hint: "no / ni",
        correctSyllable: "no",
        fullWord: "mono",
        coordinatesVerified: false,
        acceptsItemId: "syl-no"
      },
      {
        id: "blank-nene",
        label: "ne___",
        hint: "ne / na",
        correctSyllable: "ne",
        fullWord: "nene",
        coordinatesVerified: false,
        acceptsItemId: "syl-ne"
      },
      {
        id: "blank-nudo",
        label: "nu___",
        hint: "do / da",
        correctSyllable: "do",
        fullWord: "nudo",
        coordinatesVerified: false,
        acceptsItemId: "syl-do"
      }
    ],
    exercises: [
      {
        partial: "ni___",
        choices: ["do","da"],
        answer: "do",
        fullWord: "nido"
      },
      {
        partial: "lu___",
        choices: ["na","no"],
        answer: "na",
        fullWord: "luna"
      },
      {
        partial: "ma___",
        choices: ["no","na"],
        answer: "no",
        fullWord: "mano"
      },
      {
        partial: "mo___",
        choices: ["no","ni"],
        answer: "no",
        fullWord: "mono"
      },
      {
        partial: "ne___",
        choices: ["ne","na"],
        answer: "ne",
        fullWord: "nene"
      },
      {
        partial: "nu___",
        choices: ["do","da"],
        answer: "do",
        fullWord: "nudo"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for N.",
    sourcePage: ""
  }
];
