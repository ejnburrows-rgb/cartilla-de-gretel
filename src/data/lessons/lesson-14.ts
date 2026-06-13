import { getBookPageImage } from "@/lib/bookImages";

export const lesson14 = [
  {
    id: "l14-p53-letter-tracing",
    lessonNumber: 14,
    pageNumber: 53,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra",
    prompt: "Traza la letra C mayúscula y la c minúscula. Luego haz un dibujo de una palabra que comienza con c.",
    items: [
      {
        id: "letter-C",
        label: "C"
      },
      {
        id: "letter-c",
        label: "c"
      }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase C and lowercase c.",
    sourcePage: getBookPageImage(53)
  },
  {
    id: "l14-p54-syllable-circle",
    lessonNumber: 14,
    pageNumber: 54,
    kind: "drag-syllable-to-slot",
    title: "Encierra en un círculo la sílaba correspondiente.",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-ca", label: "ca" },
      { id: "syl-co", label: "co" },
      { id: "syl-cu", label: "cu" }
    ],
    targets: [
      {
        id: "slot-ca",
        label: "ca",
        coordinatesVerified: false,
        acceptsItemId: "syl-ca"
      },
      {
        id: "slot-co",
        label: "co",
        coordinatesVerified: false,
        acceptsItemId: "syl-co"
      },
      {
        id: "slot-cu",
        label: "cu",
        coordinatesVerified: false,
        acceptsItemId: "syl-cu"
      }
    ],
    wordBank: [
      "cama",
      "casa",
      "coco",
      "cuna",
      "saco",
      "poco",
      "pico",
      "toca",
      "copa",
      "cola"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for C.",
    sourcePage: getBookPageImage(54)
  },
  {
    id: "l14-p54-syllable-tap",
    lessonNumber: 14,
    pageNumber: 54,
    kind: "read-aloud",
    title: "Sílabas con C — página Cc",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-ca", label: "ca" },
      { id: "ra-co", label: "co" },
      { id: "ra-cu", label: "cu" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for C.",
    sourcePage: getBookPageImage(54)
  },
  {
    id: "l14-p54-word-bank",
    lessonNumber: 14,
    pageNumber: 54,
    kind: "listen-and-tap",
    title: "Palabras con C",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-cama", label: "cama" },
      { id: "w-casa", label: "casa" },
      { id: "w-coco", label: "coco" },
      { id: "w-cuna", label: "cuna" },
      { id: "w-saco", label: "saco" },
      { id: "w-poco", label: "poco" },
      { id: "w-pico", label: "pico" },
      { id: "w-toca", label: "toca" },
      { id: "w-copa", label: "copa" },
      { id: "w-cola", label: "cola" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for C.",
    sourcePage: getBookPageImage(54)
  },
  {
    id: "l14-p54-mini-story",
    lessonNumber: 14,
    pageNumber: 54,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-c-1", label: "Paco toca el coco." },
      { id: "story-c-2", label: "La casa de Paco." },
      { id: "story-c-3", label: "Caco saca la copa." },
      { id: "story-c-4", label: "La cuna de Cuca." }
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
    teacherNotes: "Scaffolded mini-story for C.",
    sourcePage: getBookPageImage(54)
  },
  {
    id: "l14-p55-fill-in-blank",
    lessonNumber: 14,
    pageNumber: 55,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras con la sílaba correcta.",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-sa", label: "sa" },
      { id: "syl-na", label: "na" },
      { id: "syl-co", label: "co" },
      { id: "syl-ma", label: "ma" },
      { id: "syl-pa", label: "pa" },
      { id: "syl-ca", label: "ca" }
    ],
    targets: [
      {
        id: "blank-casa",
        label: "ca___",
        hint: "sa / so",
        correctSyllable: "sa",
        fullWord: "casa",
        coordinatesVerified: false,
        acceptsItemId: "syl-sa"
      },
      {
        id: "blank-cuna",
        label: "cu___",
        hint: "na / no",
        correctSyllable: "na",
        fullWord: "cuna",
        coordinatesVerified: false,
        acceptsItemId: "syl-na"
      },
      {
        id: "blank-coco",
        label: "co___",
        hint: "co / ca",
        correctSyllable: "co",
        fullWord: "coco",
        coordinatesVerified: false,
        acceptsItemId: "syl-co"
      },
      {
        id: "blank-cama",
        label: "ca___",
        hint: "ma / me",
        correctSyllable: "ma",
        fullWord: "cama",
        coordinatesVerified: false,
        acceptsItemId: "syl-ma"
      },
      {
        id: "blank-copa",
        label: "co___",
        hint: "pa / po",
        correctSyllable: "pa",
        fullWord: "copa",
        coordinatesVerified: false,
        acceptsItemId: "syl-pa"
      },
      {
        id: "blank-toca",
        label: "to___",
        hint: "ca / co",
        correctSyllable: "ca",
        fullWord: "toca",
        coordinatesVerified: false,
        acceptsItemId: "syl-ca"
      }
    ],
    exercises: [
      {
        partial: "ca___",
        choices: ["sa","so"],
        answer: "sa",
        fullWord: "casa"
      },
      {
        partial: "cu___",
        choices: ["na","no"],
        answer: "na",
        fullWord: "cuna"
      },
      {
        partial: "co___",
        choices: ["co","ca"],
        answer: "co",
        fullWord: "coco"
      },
      {
        partial: "ca___",
        choices: ["ma","me"],
        answer: "ma",
        fullWord: "cama"
      },
      {
        partial: "co___",
        choices: ["pa","po"],
        answer: "pa",
        fullWord: "copa"
      },
      {
        partial: "to___",
        choices: ["ca","co"],
        answer: "ca",
        fullWord: "toca"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for C.",
    sourcePage: getBookPageImage(55)
  }
];
