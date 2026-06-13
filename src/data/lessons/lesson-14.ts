import { getBookPageImage } from "@/lib/bookImages";

export const lesson14 = [
  {
    id: "l14-p53-letter-tracing",
    lessonNumber: 14,
    pageNumber: 53,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra.",
    prompt: "Haz un dibujo que represente una palabra que comienza con ñ.",
    items: [
      { id: "letter-Ñ", label: "Ñ" },
      { id: "letter-ñ", label: "ñ" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded letter tracing for Ñ.",
    sourcePage: getBookPageImage(53)
  },
  {
    id: "l14-p54-syllable-circle",
    lessonNumber: 14,
    pageNumber: 54,
    kind: "drag-syllable-to-slot",
    title: "Encierra en un círculo la sílaba correspondiente.",
    prompt: "Encierra en un círculo la sílaba correspondiente.",
    items: [
      { id: "syl-ña", label: "ña" },
      { id: "syl-ñe", label: "ñe" },
      { id: "syl-ñi", label: "ñi" },
      { id: "syl-ño", label: "ño" },
      { id: "syl-ñu", label: "ñu" }
    ],
    targets: [
      { id: "slot-ña", label: "ña", coordinatesVerified: false, acceptsItemId: "syl-ña" },
      { id: "slot-ñe", label: "ñe", coordinatesVerified: false, acceptsItemId: "syl-ñe" },
      { id: "slot-ñi", label: "ñi", coordinatesVerified: false, acceptsItemId: "syl-ñi" },
      { id: "slot-ño", label: "ño", coordinatesVerified: false, acceptsItemId: "syl-ño" },
      { id: "slot-ñu", label: "ñu", coordinatesVerified: false, acceptsItemId: "syl-ñu" }
    ],
    wordBank: [
      "maña", "mañana", "montaña", "ñame", "araña", "caña",
      "Meñe", "añejo", "sueñe", "adueñe", "cañengo", "apañe",
      "añico", "pañito", "cañita", "niñito", "arañita", "reñido",
      "moño", "niño", "sueño", "Ñoña", "año", "Ñuco",
      "Ñuto", "cañuto", "moñudo", "ceñudo", "pañuelo", "puño"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for Ñ.",
    sourcePage: getBookPageImage(54)
  },
  {
    id: "l14-p55-syllable-tap",
    lessonNumber: 14,
    pageNumber: 55,
    kind: "read-aloud",
    title: "Ññ",
    prompt: "Ññ",
    items: [
      { id: "ra-ña-0", label: "ña" },
      { id: "ra-ñe-1", label: "ñe" },
      { id: "ra-ñi-2", label: "ñi" },
      { id: "ra-ño-3", label: "ño" },
      { id: "ra-ñu-4", label: "ñu" },
      { id: "ra-ñu-5", label: "ñu" },
      { id: "ra-ño-6", label: "ño" },
      { id: "ra-ña-7", label: "ña" },
      { id: "ra-ñe-8", label: "ñe" },
      { id: "ra-ñi-9", label: "ñi" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for Ñ.",
    sourcePage: getBookPageImage(55)
  },
  {
    id: "l14-p55-word-bank",
    lessonNumber: 14,
    pageNumber: 55,
    kind: "listen-and-tap",
    title: "Palabras",
    prompt: "Palabras",
    items: [
      { id: "w-name-0", label: "ñame" },
      { id: "w-ano-1", label: "año" },
      { id: "w-monudo-2", label: "moñudo" },
      { id: "w-mono-3", label: "moño" },
      { id: "w-nina-4", label: "niña" },
      { id: "w-suena-5", label: "sueña" },
      { id: "w-mene-6", label: "Meñe" },
      { id: "w-pano-7", label: "paño" },
      { id: "w-pina-8", label: "piña" },
      { id: "w-ninito-9", label: "niñito" },
      { id: "w-sueno-10", label: "sueño" },
      { id: "w-puno-11", label: "puño" },
      { id: "w-una-12", label: "uña" },
      { id: "w-anitos-13", label: "añitos" },
      { id: "w-panuelo-14", label: "pañuelo" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for Ñ.",
    sourcePage: getBookPageImage(55)
  },
  {
    id: "l14-p55-mini-story",
    lessonNumber: 14,
    pageNumber: 55,
    kind: "mini-story",
    title: "Cuento",
    prompt: "Cuento",
    items: [
      { id: "story-ñ-1", label: "Meñe es dueña de esa piñata." },
      { id: "story-ñ-2", label: "La piñata es del año pasado." },
      { id: "story-ñ-3", label: "La piñata está en el patio." },
      { id: "story-ñ-4", label: "Noña tiene una niña." },
      { id: "story-ñ-5", label: "La niña tiene sueño." },
      { id: "story-ñ-6", label: "Noña le pone el pañal a la niña." }
    ],
    targets: [],
    sightWords: [
      "del"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for Ñ.",
    sourcePage: getBookPageImage(55)
  },
  {
    id: "l14-p56-fill-in-blank",
    lessonNumber: 14,
    pageNumber: 56,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras con la sílaba correcta.",
    prompt: "Completa las palabras con la sílaba correcta.",
    items: [
      { id: "syl-ne-0", label: "ñe" },
      { id: "syl-na-1", label: "ña" },
      { id: "syl-no-2", label: "ño" },
      { id: "syl-ni-3", label: "ñi" },
      { id: "syl-nu-4", label: "ñu" }
    ],
    targets: [
      {
        id: "blank-mana-0",
        label: "ma___",
        hint: "ñe - ña",
        correctSyllable: "ña",
        fullWord: "maña",
        coordinatesVerified: false,
        acceptsItemId: "syl-na-1"
      },
      {
        id: "blank-panito-1",
        label: "pa___to",
        hint: "ño - ñi",
        correctSyllable: "ñi",
        fullWord: "pañito",
        coordinatesVerified: false,
        acceptsItemId: "syl-ni-3"
      },
      {
        id: "blank-nino-2",
        label: "ni___",
        hint: "ñi - ño",
        correctSyllable: "ño",
        fullWord: "niño",
        coordinatesVerified: false,
        acceptsItemId: "syl-no-2"
      },
      {
        id: "blank-mono-3",
        label: "mo___",
        hint: "ño - ñe",
        correctSyllable: "ño",
        fullWord: "moño",
        coordinatesVerified: false,
        acceptsItemId: "syl-no-2"
      },
      {
        id: "blank-ano-4",
        label: "a___",
        hint: "ña - ño",
        correctSyllable: "ño",
        fullWord: "año",
        coordinatesVerified: false,
        acceptsItemId: "syl-no-2"
      },
      {
        id: "blank-puno-5",
        label: "pu___",
        hint: "ño - ñu",
        correctSyllable: "ño",
        fullWord: "puño",
        coordinatesVerified: false,
        acceptsItemId: "syl-no-2"
      }
    ],
    exercises: [
      {
        partial: "ma___",
        choices: ["ñe", "ña"],
        answer: "ña",
        fullWord: "maña"
      },
      {
        partial: "pa___to",
        choices: ["ño", "ñi"],
        answer: "ñi",
        fullWord: "pañito"
      },
      {
        partial: "ni___",
        choices: ["ñi", "ño"],
        answer: "ño",
        fullWord: "niño"
      },
      {
        partial: "mo___",
        choices: ["ño", "ñe"],
        answer: "ño",
        fullWord: "moño"
      },
      {
        partial: "a___",
        choices: ["ña", "ño"],
        answer: "ño",
        fullWord: "año"
      },
      {
        partial: "pu___",
        choices: ["ño", "ñu"],
        answer: "ño",
        fullWord: "puño"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for Ñ.",
    sourcePage: getBookPageImage(56)
  },
  {
    id: "l14-p56-write-sentences",
    lessonNumber: 14,
    pageNumber: 56,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones. Usa las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(56)
  }
];
