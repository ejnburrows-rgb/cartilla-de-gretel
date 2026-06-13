import { getBookPageImage } from "@/lib/bookImages";

export const lesson11 = [
  {
    id: "l11-p41-letter-tracing",
    lessonNumber: 11,
    pageNumber: 41,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra.",
    prompt: "Haz un dibujo que represente una palabra que comienza con d.",
    items: [
      { id: "letter-D", label: "D" },
      { id: "letter-d", label: "d" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded letter tracing for D.",
    sourcePage: getBookPageImage(41)
  },
  {
    id: "l11-p42-syllable-circle",
    lessonNumber: 11,
    pageNumber: 42,
    kind: "drag-syllable-to-slot",
    title: "Encierra en un círculo la sílaba correspondiente.",
    prompt: "Encierra en un círculo la sílaba correspondiente.",
    items: [
      { id: "syl-da", label: "da" },
      { id: "syl-de", label: "de" },
      { id: "syl-di", label: "di" },
      { id: "syl-do", label: "do" },
      { id: "syl-du", label: "du" }
    ],
    targets: [
      { id: "slot-da", label: "da", coordinatesVerified: false, acceptsItemId: "syl-da" },
      { id: "slot-de", label: "de", coordinatesVerified: false, acceptsItemId: "syl-de" },
      { id: "slot-di", label: "di", coordinatesVerified: false, acceptsItemId: "syl-di" },
      { id: "slot-do", label: "do", coordinatesVerified: false, acceptsItemId: "syl-do" },
      { id: "slot-du", label: "du", coordinatesVerified: false, acceptsItemId: "syl-du" }
    ],
    wordBank: [
      "dame", "Ada", "Made", "duda", "dado", "poda",
      "dedo", "además", "deme", "modelo", "pide", "debajo",
      "dime", "Adi", "dice", "dinero", "día", "Didi",
      "dado", "podo", "doce", "dedo", "modo", "mudo",
      "Duma", "duro", "duda", "durazno", "maduro", "ducha"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for D.",
    sourcePage: getBookPageImage(42)
  },
  {
    id: "l11-p43-syllable-tap",
    lessonNumber: 11,
    pageNumber: 43,
    kind: "read-aloud",
    title: "Dd",
    prompt: "Dd",
    items: [
      { id: "ra-da-0", label: "da" },
      { id: "ra-de-1", label: "de" },
      { id: "ra-di-2", label: "di" },
      { id: "ra-do-3", label: "do" },
      { id: "ra-du-4", label: "du" },
      { id: "ra-du-5", label: "du" },
      { id: "ra-do-6", label: "do" },
      { id: "ra-da-7", label: "da" },
      { id: "ra-de-8", label: "de" },
      { id: "ra-di-9", label: "di" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for D.",
    sourcePage: getBookPageImage(43)
  },
  {
    id: "l11-p43-word-bank",
    lessonNumber: 11,
    pageNumber: 43,
    kind: "listen-and-tap",
    title: "Palabras",
    prompt: "Palabras",
    items: [
      { id: "w-dedo-0", label: "dedo" },
      { id: "w-donde-1", label: "dónde" },
      { id: "w-deme-2", label: "deme" },
      { id: "w-dame-3", label: "dame" },
      { id: "w-duma-4", label: "Duma" },
      { id: "w-de-5", label: "de" },
      { id: "w-dia-6", label: "día" },
      { id: "w-dime-7", label: "dime" },
      { id: "w-duda-8", label: "duda" },
      { id: "w-ada-9", label: "Ada" },
      { id: "w-pide-10", label: "pide" },
      { id: "w-mudo-11", label: "mudo" },
      { id: "w-moneda-12", label: "moneda" },
      { id: "w-mide-13", label: "mide" },
      { id: "w-dunia-14", label: "Dunia" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for D.",
    sourcePage: getBookPageImage(43)
  },
  {
    id: "l11-p43-mini-story",
    lessonNumber: 11,
    pageNumber: 43,
    kind: "mini-story",
    title: "Cuento",
    prompt: "Cuento",
    items: [
      { id: "story-d-1", label: "Dime si Ada tiene dados." },
      { id: "story-d-2", label: "Los dados son de Dunia." },
      { id: "story-d-3", label: "– ¿Dónde están los dados?" },
      { id: "story-d-4", label: "Dunia pone los dados en el pomo." },
      { id: "story-d-5", label: "– Dunia dame el pomo." },
      { id: "story-d-6", label: "El pomo de Dunia está en la mesa." },
      { id: "story-d-7", label: "– Ada, ¿Dónde está Dunia?" }
    ],
    targets: [],
    sightWords: [
      "son", "están"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for D.",
    sourcePage: getBookPageImage(43)
  },
  {
    id: "l11-p44-fill-in-blank",
    lessonNumber: 11,
    pageNumber: 44,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras con la sílaba correcta.",
    prompt: "Completa las palabras con la sílaba correcta.",
    items: [
      { id: "syl-di-0", label: "di" },
      { id: "syl-de-1", label: "de" },
      { id: "syl-do-2", label: "do" },
      { id: "syl-du-3", label: "du" },
      { id: "syl-da-4", label: "da" },
      { id: "syl-Du-5", label: "Du" }
    ],
    targets: [
      {
        id: "blank-dedo-0",
        label: "___do",
        hint: "di - de",
        correctSyllable: "de",
        fullWord: "dedo",
        coordinatesVerified: false,
        acceptsItemId: "syl-de-1"
      },
      {
        id: "blank-mide-1",
        label: "mi___",
        hint: "di - de",
        correctSyllable: "de",
        fullWord: "mide",
        coordinatesVerified: false,
        acceptsItemId: "syl-de-1"
      },
      {
        id: "blank-mudo-2",
        label: "mu___",
        hint: "do - du",
        correctSyllable: "do",
        fullWord: "mudo",
        coordinatesVerified: false,
        acceptsItemId: "syl-do-2"
      },
      {
        id: "blank-ada-3",
        label: "A___",
        hint: "de - da",
        correctSyllable: "da",
        fullWord: "Ada",
        coordinatesVerified: false,
        acceptsItemId: "syl-da-4"
      },
      {
        id: "blank-pide-4",
        label: "pi___",
        hint: "de - di",
        correctSyllable: "de",
        fullWord: "pide",
        coordinatesVerified: false,
        acceptsItemId: "syl-de-1"
      },
      {
        id: "blank-duma-5",
        label: "___ma",
        hint: "Du - do",
        correctSyllable: "Du",
        fullWord: "Duma",
        coordinatesVerified: false,
        acceptsItemId: "syl-Du-5"
      }
    ],
    exercises: [
      {
        partial: "___do",
        choices: ["di", "de"],
        answer: "de",
        fullWord: "dedo"
      },
      {
        partial: "mi___",
        choices: ["di", "de"],
        answer: "de",
        fullWord: "mide"
      },
      {
        partial: "mu___",
        choices: ["do", "du"],
        answer: "do",
        fullWord: "mudo"
      },
      {
        partial: "A___",
        choices: ["de", "da"],
        answer: "da",
        fullWord: "Ada"
      },
      {
        partial: "pi___",
        choices: ["de", "di"],
        answer: "de",
        fullWord: "pide"
      },
      {
        partial: "___ma",
        choices: ["Du", "do"],
        answer: "Du",
        fullWord: "Duma"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for D.",
    sourcePage: getBookPageImage(44)
  },
  {
    id: "l11-p44-write-sentences",
    lessonNumber: 11,
    pageNumber: 44,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones. Usa las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(44)
  }
];
