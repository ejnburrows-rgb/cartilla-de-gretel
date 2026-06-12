import { getBookPageImage } from "@/lib/bookImages";

export const lesson16 = [
  {
    id: "l16-p47-letter-tracing",
    lessonNumber: 16,
    pageNumber: 47,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — F f",
    prompt: "Traza la letra F mayúscula y la f minúscula. Luego haz un dibujo de una palabra que comienza con f.",
    items: [
      {
        id: "letter-F",
        label: "F"
      },
      {
        id: "letter-f",
        label: "f"
      }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase F and lowercase f.",
    sourcePage: getBookPageImage(47)
  },
  {
    id: "l16-p48-syllable-circle",
    lessonNumber: 16,
    pageNumber: 48,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — F f",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-fa", label: "fa" },
      { id: "syl-fe", label: "fe" },
      { id: "syl-fi", label: "fi" },
      { id: "syl-fo", label: "fo" },
      { id: "syl-fu", label: "fu" }
    ],
    targets: [
      {
        id: "slot-fa",
        label: "fa",
        coordinatesVerified: false,
        acceptsItemId: "syl-fa"
      },
      {
        id: "slot-fe",
        label: "fe",
        coordinatesVerified: false,
        acceptsItemId: "syl-fe"
      },
      {
        id: "slot-fi",
        label: "fi",
        coordinatesVerified: false,
        acceptsItemId: "syl-fi"
      },
      {
        id: "slot-fo",
        label: "fo",
        coordinatesVerified: false,
        acceptsItemId: "syl-fo"
      },
      {
        id: "slot-fu",
        label: "fu",
        coordinatesVerified: false,
        acceptsItemId: "syl-fu"
      }
    ],
    wordBank: [
      "foca",
      "faro",
      "foto",
      "fama",
      "rifa",
      "sofá",
      "feo",
      "café",
      "fila",
      "foso"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for F.",
    sourcePage: getBookPageImage(48)
  },
  {
    id: "l16-p48-syllable-tap",
    lessonNumber: 16,
    pageNumber: 48,
    kind: "read-aloud",
    title: "Sílabas con F — página Ff",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-fa", label: "fa" },
      { id: "ra-fe", label: "fe" },
      { id: "ra-fi", label: "fi" },
      { id: "ra-fo", label: "fo" },
      { id: "ra-fu", label: "fu" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for F.",
    sourcePage: getBookPageImage(48)
  },
  {
    id: "l16-p48-word-bank",
    lessonNumber: 16,
    pageNumber: 48,
    kind: "listen-and-tap",
    title: "Palabras con F",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-foca", label: "foca" },
      { id: "w-faro", label: "faro" },
      { id: "w-foto", label: "foto" },
      { id: "w-fama", label: "fama" },
      { id: "w-rifa", label: "rifa" },
      { id: "w-sofá", label: "sofá" },
      { id: "w-feo", label: "feo" },
      { id: "w-café", label: "café" },
      { id: "w-fila", label: "fila" },
      { id: "w-foso", label: "foso" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for F.",
    sourcePage: getBookPageImage(48)
  },
  {
    id: "l16-p48-mini-story",
    lessonNumber: 16,
    pageNumber: 48,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-f-1", label: "La foca Fifi." },
      { id: "story-f-2", label: "Fifi sale en la foto." },
      { id: "story-f-3", label: "El faro ilumina la foca." },
      { id: "story-f-4", label: "Fifi toma café en el sofá." }
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
    teacherNotes: "Scaffolded mini-story for F.",
    sourcePage: getBookPageImage(48)
  },
  {
    id: "l16-p49-fill-in-blank",
    lessonNumber: 16,
    pageNumber: 49,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — F f",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-ca", label: "ca" },
      { id: "syl-to", label: "to" },
      { id: "syl-ro", label: "ro" },
      { id: "syl-la", label: "la" },
      { id: "syl-o", label: "o" },
      { id: "syl-fé", label: "fé" }
    ],
    targets: [
      {
        id: "blank-foca",
        label: "fo___",
        hint: "ca / co",
        correctSyllable: "ca",
        fullWord: "foca",
        coordinatesVerified: false,
        acceptsItemId: "syl-ca"
      },
      {
        id: "blank-foto",
        label: "fo___",
        hint: "to / ta",
        correctSyllable: "to",
        fullWord: "foto",
        coordinatesVerified: false,
        acceptsItemId: "syl-to"
      },
      {
        id: "blank-faro",
        label: "fa___",
        hint: "ro / ra",
        correctSyllable: "ro",
        fullWord: "faro",
        coordinatesVerified: false,
        acceptsItemId: "syl-ro"
      },
      {
        id: "blank-fila",
        label: "fi___",
        hint: "la / lo",
        correctSyllable: "la",
        fullWord: "fila",
        coordinatesVerified: false,
        acceptsItemId: "syl-la"
      },
      {
        id: "blank-feo",
        label: "fe___",
        hint: "o / a",
        correctSyllable: "o",
        fullWord: "feo",
        coordinatesVerified: false,
        acceptsItemId: "syl-o"
      },
      {
        id: "blank-café",
        label: "ca___",
        hint: "fé / fá",
        correctSyllable: "fé",
        fullWord: "café",
        coordinatesVerified: false,
        acceptsItemId: "syl-fé"
      }
    ],
    exercises: [
      {
        partial: "fo___",
        choices: ["ca","co"],
        answer: "ca",
        fullWord: "foca"
      },
      {
        partial: "fo___",
        choices: ["to","ta"],
        answer: "to",
        fullWord: "foto"
      },
      {
        partial: "fa___",
        choices: ["ro","ra"],
        answer: "ro",
        fullWord: "faro"
      },
      {
        partial: "fi___",
        choices: ["la","lo"],
        answer: "la",
        fullWord: "fila"
      },
      {
        partial: "fe___",
        choices: ["o","a"],
        answer: "o",
        fullWord: "feo"
      },
      {
        partial: "ca___",
        choices: ["fé","fá"],
        answer: "fé",
        fullWord: "café"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for F.",
    sourcePage: getBookPageImage(49)
  }
];
