import { getBookPageImage } from "@/lib/bookImages";

export const lesson11 = [
  {
    id: "l11-p32-letter-tracing",
    lessonNumber: 11,
    pageNumber: 32,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — D d",
    prompt: "Traza la letra D mayúscula y la d minúscula. Luego haz un dibujo de una palabra que comienza con d.",
    items: [
      {
        id: "letter-D",
        label: "D"
      },
      {
        id: "letter-d",
        label: "d"
      }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase D and lowercase d.",
    sourcePage: getBookPageImage(32)
  },
  {
    id: "l11-p33-syllable-circle",
    lessonNumber: 11,
    pageNumber: 33,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — D d",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-da", label: "da" },
      { id: "syl-de", label: "de" },
      { id: "syl-di", label: "di" },
      { id: "syl-do", label: "do" },
      { id: "syl-du", label: "du" }
    ],
    targets: [
      {
        id: "slot-da",
        label: "da",
        coordinatesVerified: false,
        acceptsItemId: "syl-da"
      },
      {
        id: "slot-de",
        label: "de",
        coordinatesVerified: false,
        acceptsItemId: "syl-de"
      },
      {
        id: "slot-di",
        label: "di",
        coordinatesVerified: false,
        acceptsItemId: "syl-di"
      },
      {
        id: "slot-do",
        label: "do",
        coordinatesVerified: false,
        acceptsItemId: "syl-do"
      },
      {
        id: "slot-du",
        label: "du",
        coordinatesVerified: false,
        acceptsItemId: "syl-du"
      }
    ],
    wordBank: [
      "dado",
      "dedo",
      "duda",
      "dama",
      "lodo",
      "todo",
      "mido",
      "pido",
      "dote",
      "ludo"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for D.",
    sourcePage: getBookPageImage(33)
  },
  {
    id: "l11-p33-syllable-tap",
    lessonNumber: 11,
    pageNumber: 33,
    kind: "read-aloud",
    title: "Sílabas con D — página Dd",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-da", label: "da" },
      { id: "ra-de", label: "de" },
      { id: "ra-di", label: "di" },
      { id: "ra-do", label: "do" },
      { id: "ra-du", label: "du" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for D.",
    sourcePage: getBookPageImage(33)
  },
  {
    id: "l11-p33-word-bank",
    lessonNumber: 11,
    pageNumber: 33,
    kind: "listen-and-tap",
    title: "Palabras con D",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-dado", label: "dado" },
      { id: "w-dedo", label: "dedo" },
      { id: "w-duda", label: "duda" },
      { id: "w-dama", label: "dama" },
      { id: "w-lodo", label: "lodo" },
      { id: "w-todo", label: "todo" },
      { id: "w-mido", label: "mido" },
      { id: "w-pido", label: "pido" },
      { id: "w-dote", label: "dote" },
      { id: "w-ludo", label: "ludo" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for D.",
    sourcePage: getBookPageImage(33)
  },
  {
    id: "l11-p33-mini-story",
    lessonNumber: 11,
    pageNumber: 33,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-d-1", label: "El dado de papá." },
      { id: "story-d-2", label: "Mamá me da el dedo." },
      { id: "story-d-3", label: "Dido duda de todo." },
      { id: "story-d-4", label: "El lodo de Lalo." }
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
    teacherNotes: "Scaffolded mini-story for D.",
    sourcePage: getBookPageImage(33)
  },
  {
    id: "l11-p34-fill-in-blank",
    lessonNumber: 11,
    pageNumber: 34,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — D d",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-do", label: "do" },
      { id: "syl-da", label: "da" },
      { id: "syl-ma", label: "ma" }
    ],
    targets: [
      {
        id: "blank-dado",
        label: "da___",
        hint: "do / da",
        correctSyllable: "do",
        fullWord: "dado",
        coordinatesVerified: false,
        acceptsItemId: "syl-do"
      },
      {
        id: "blank-dedo",
        label: "de___",
        hint: "do / de",
        correctSyllable: "do",
        fullWord: "dedo",
        coordinatesVerified: false,
        acceptsItemId: "syl-do"
      },
      {
        id: "blank-duda",
        label: "du___",
        hint: "da / do",
        correctSyllable: "da",
        fullWord: "duda",
        coordinatesVerified: false,
        acceptsItemId: "syl-da"
      },
      {
        id: "blank-dama",
        label: "da___",
        hint: "ma / me",
        correctSyllable: "ma",
        fullWord: "dama",
        coordinatesVerified: false,
        acceptsItemId: "syl-ma"
      },
      {
        id: "blank-lodo",
        label: "lo___",
        hint: "do / da",
        correctSyllable: "do",
        fullWord: "lodo",
        coordinatesVerified: false,
        acceptsItemId: "syl-do"
      },
      {
        id: "blank-todo",
        label: "to___",
        hint: "do / du",
        correctSyllable: "do",
        fullWord: "todo",
        coordinatesVerified: false,
        acceptsItemId: "syl-do"
      }
    ],
    exercises: [
      {
        partial: "da___",
        choices: ["do","da"],
        answer: "do",
        fullWord: "dado"
      },
      {
        partial: "de___",
        choices: ["do","de"],
        answer: "do",
        fullWord: "dedo"
      },
      {
        partial: "du___",
        choices: ["da","do"],
        answer: "da",
        fullWord: "duda"
      },
      {
        partial: "da___",
        choices: ["ma","me"],
        answer: "ma",
        fullWord: "dama"
      },
      {
        partial: "lo___",
        choices: ["do","da"],
        answer: "do",
        fullWord: "lodo"
      },
      {
        partial: "to___",
        choices: ["do","du"],
        answer: "do",
        fullWord: "todo"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for D.",
    sourcePage: getBookPageImage(34)
  }
];
