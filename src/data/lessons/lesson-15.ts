export const lesson15 = [
  {
    id: "l15-p44-letter-tracing",
    lessonNumber: 15,
    pageNumber: 44,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — R r",
    prompt: "Traza la letra R mayúscula y la r minúscula. Luego haz un dibujo de una palabra que comienza con r.",
    items: [
      {
        id: "letter-R",
        label: "R"
      },
      {
        id: "letter-r",
        label: "r"
      }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase R and lowercase r.",
    sourcePage: ""
  },
  {
    id: "l15-p45-syllable-circle",
    lessonNumber: 15,
    pageNumber: 45,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — R r",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-ra", label: "ra" },
      { id: "syl-re", label: "re" },
      { id: "syl-ri", label: "ri" },
      { id: "syl-ro", label: "ro" },
      { id: "syl-ru", label: "ru" }
    ],
    targets: [
      {
        id: "slot-ra",
        label: "ra",
        coordinatesVerified: false,
        acceptsItemId: "syl-ra"
      },
      {
        id: "slot-re",
        label: "re",
        coordinatesVerified: false,
        acceptsItemId: "syl-re"
      },
      {
        id: "slot-ri",
        label: "ri",
        coordinatesVerified: false,
        acceptsItemId: "syl-ri"
      },
      {
        id: "slot-ro",
        label: "ro",
        coordinatesVerified: false,
        acceptsItemId: "syl-ro"
      },
      {
        id: "slot-ru",
        label: "ru",
        coordinatesVerified: false,
        acceptsItemId: "syl-ru"
      }
    ],
    wordBank: [
      "rana",
      "rama",
      "rosa",
      "roto",
      "toro",
      "cara",
      "poro",
      "ropa",
      "rico",
      "muro"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for R.",
    sourcePage: ""
  },
  {
    id: "l15-p45-syllable-tap",
    lessonNumber: 15,
    pageNumber: 45,
    kind: "read-aloud",
    title: "Sílabas con R — página Rr",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-ra", label: "ra" },
      { id: "ra-re", label: "re" },
      { id: "ra-ri", label: "ri" },
      { id: "ra-ro", label: "ro" },
      { id: "ra-ru", label: "ru" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for R.",
    sourcePage: ""
  },
  {
    id: "l15-p45-word-bank",
    lessonNumber: 15,
    pageNumber: 45,
    kind: "listen-and-tap",
    title: "Palabras con R",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-rana", label: "rana" },
      { id: "w-rama", label: "rama" },
      { id: "w-rosa", label: "rosa" },
      { id: "w-roto", label: "roto" },
      { id: "w-toro", label: "toro" },
      { id: "w-cara", label: "cara" },
      { id: "w-poro", label: "poro" },
      { id: "w-ropa", label: "ropa" },
      { id: "w-rico", label: "rico" },
      { id: "w-muro", label: "muro" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for R.",
    sourcePage: ""
  },
  {
    id: "l15-p45-mini-story",
    lessonNumber: 15,
    pageNumber: 45,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-r-1", label: "Rita mira la rosa." },
      { id: "story-r-2", label: "El toro corre a la rama." },
      { id: "story-r-3", label: "La rana pasa a la rama." },
      { id: "story-r-4", label: "La ropa de Rita." }
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
    teacherNotes: "Scaffolded mini-story for R.",
    sourcePage: ""
  },
  {
    id: "l15-p46-fill-in-blank",
    lessonNumber: 15,
    pageNumber: 46,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — R r",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-na", label: "na" },
      { id: "syl-ro", label: "ro" },
      { id: "syl-ra", label: "ra" },
      { id: "syl-sa", label: "sa" },
      { id: "syl-pa", label: "pa" }
    ],
    targets: [
      {
        id: "blank-rana",
        label: "ra___",
        hint: "na / no",
        correctSyllable: "na",
        fullWord: "rana",
        coordinatesVerified: false,
        acceptsItemId: "syl-na"
      },
      {
        id: "blank-toro",
        label: "to___",
        hint: "ro / ra",
        correctSyllable: "ro",
        fullWord: "toro",
        coordinatesVerified: false,
        acceptsItemId: "syl-ro"
      },
      {
        id: "blank-cara",
        label: "ca___",
        hint: "ra / ro",
        correctSyllable: "ra",
        fullWord: "cara",
        coordinatesVerified: false,
        acceptsItemId: "syl-ra"
      },
      {
        id: "blank-rosa",
        label: "ro___",
        hint: "sa / so",
        correctSyllable: "sa",
        fullWord: "rosa",
        coordinatesVerified: false,
        acceptsItemId: "syl-sa"
      },
      {
        id: "blank-ropa",
        label: "ro___",
        hint: "pa / po",
        correctSyllable: "pa",
        fullWord: "ropa",
        coordinatesVerified: false,
        acceptsItemId: "syl-pa"
      },
      {
        id: "blank-muro",
        label: "mu___",
        hint: "ro / ra",
        correctSyllable: "ro",
        fullWord: "muro",
        coordinatesVerified: false,
        acceptsItemId: "syl-ro"
      }
    ],
    exercises: [
      {
        partial: "ra___",
        choices: ["na","no"],
        answer: "na",
        fullWord: "rana"
      },
      {
        partial: "to___",
        choices: ["ro","ra"],
        answer: "ro",
        fullWord: "toro"
      },
      {
        partial: "ca___",
        choices: ["ra","ro"],
        answer: "ra",
        fullWord: "cara"
      },
      {
        partial: "ro___",
        choices: ["sa","so"],
        answer: "sa",
        fullWord: "rosa"
      },
      {
        partial: "ro___",
        choices: ["pa","po"],
        answer: "pa",
        fullWord: "ropa"
      },
      {
        partial: "mu___",
        choices: ["ro","ra"],
        answer: "ro",
        fullWord: "muro"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for R.",
    sourcePage: ""
  }
];
