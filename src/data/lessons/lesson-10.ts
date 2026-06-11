export const lesson10 = [
  {
    id: "l10-p29-letter-tracing",
    lessonNumber: 10,
    pageNumber: 29,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — L l",
    prompt: "Traza la letra L mayúscula y la l minúscula. Luego haz un dibujo de una palabra que comienza con l.",
    items: [
      {
        id: "letter-L",
        label: "L"
      },
      {
        id: "letter-l",
        label: "l"
      }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase L and lowercase l.",
    sourcePage: ""
  },
  {
    id: "l10-p30-syllable-circle",
    lessonNumber: 10,
    pageNumber: 30,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — L l",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-la", label: "la" },
      { id: "syl-le", label: "le" },
      { id: "syl-li", label: "li" },
      { id: "syl-lo", label: "lo" },
      { id: "syl-lu", label: "lu" }
    ],
    targets: [
      {
        id: "slot-la",
        label: "la",
        coordinatesVerified: false,
        acceptsItemId: "syl-la"
      },
      {
        id: "slot-le",
        label: "le",
        coordinatesVerified: false,
        acceptsItemId: "syl-le"
      },
      {
        id: "slot-li",
        label: "li",
        coordinatesVerified: false,
        acceptsItemId: "syl-li"
      },
      {
        id: "slot-lo",
        label: "lo",
        coordinatesVerified: false,
        acceptsItemId: "syl-lo"
      },
      {
        id: "slot-lu",
        label: "lu",
        coordinatesVerified: false,
        acceptsItemId: "syl-lu"
      }
    ],
    wordBank: [
      "pelo",
      "lima",
      "loma",
      "lupa",
      "lata",
      "loto",
      "malo",
      "palo",
      "tala",
      "tela"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for L.",
    sourcePage: ""
  },
  {
    id: "l10-p30-syllable-tap",
    lessonNumber: 10,
    pageNumber: 30,
    kind: "read-aloud",
    title: "Sílabas con L — página Ll",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-la", label: "la" },
      { id: "ra-le", label: "le" },
      { id: "ra-li", label: "li" },
      { id: "ra-lo", label: "lo" },
      { id: "ra-lu", label: "lu" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for L.",
    sourcePage: ""
  },
  {
    id: "l10-p30-word-bank",
    lessonNumber: 10,
    pageNumber: 30,
    kind: "listen-and-tap",
    title: "Palabras con L",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-pelo", label: "pelo" },
      { id: "w-lima", label: "lima" },
      { id: "w-loma", label: "loma" },
      { id: "w-lupa", label: "lupa" },
      { id: "w-lata", label: "lata" },
      { id: "w-loto", label: "loto" },
      { id: "w-malo", label: "malo" },
      { id: "w-palo", label: "palo" },
      { id: "w-tala", label: "tala" },
      { id: "w-tela", label: "tela" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for L.",
    sourcePage: ""
  },
  {
    id: "l10-p30-mini-story",
    lessonNumber: 10,
    pageNumber: 30,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-l-1", label: "Lalo y Lulú." },
      { id: "story-l-2", label: "Lalo pela la lima." },
      { id: "story-l-3", label: "Lulú pule la lata." },
      { id: "story-l-4", label: "El palo de Lalo." }
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
    teacherNotes: "Scaffolded mini-story for L.",
    sourcePage: ""
  },
  {
    id: "l10-p31-fill-in-blank",
    lessonNumber: 10,
    pageNumber: 31,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — L l",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-pa", label: "pa" },
      { id: "syl-ma", label: "ma" },
      { id: "syl-lo", label: "lo" },
      { id: "syl-ta", label: "ta" },
      { id: "syl-la", label: "la" }
    ],
    targets: [
      {
        id: "blank-lupa",
        label: "lu___",
        hint: "pa / ta",
        correctSyllable: "pa",
        fullWord: "lupa",
        coordinatesVerified: false,
        acceptsItemId: "syl-pa"
      },
      {
        id: "blank-lima",
        label: "li___",
        hint: "ma / me",
        correctSyllable: "ma",
        fullWord: "lima",
        coordinatesVerified: false,
        acceptsItemId: "syl-ma"
      },
      {
        id: "blank-pelo",
        label: "pe___",
        hint: "lo / la",
        correctSyllable: "lo",
        fullWord: "pelo",
        coordinatesVerified: false,
        acceptsItemId: "syl-lo"
      },
      {
        id: "blank-lata",
        label: "la___",
        hint: "ta / te",
        correctSyllable: "ta",
        fullWord: "lata",
        coordinatesVerified: false,
        acceptsItemId: "syl-ta"
      },
      {
        id: "blank-malo",
        label: "ma___",
        hint: "lo / lu",
        correctSyllable: "lo",
        fullWord: "malo",
        coordinatesVerified: false,
        acceptsItemId: "syl-lo"
      },
      {
        id: "blank-tela",
        label: "te___",
        hint: "la / le",
        correctSyllable: "la",
        fullWord: "tela",
        coordinatesVerified: false,
        acceptsItemId: "syl-la"
      }
    ],
    exercises: [
      {
        partial: "lu___",
        choices: ["pa","ta"],
        answer: "pa",
        fullWord: "lupa"
      },
      {
        partial: "li___",
        choices: ["ma","me"],
        answer: "ma",
        fullWord: "lima"
      },
      {
        partial: "pe___",
        choices: ["lo","la"],
        answer: "lo",
        fullWord: "pelo"
      },
      {
        partial: "la___",
        choices: ["ta","te"],
        answer: "ta",
        fullWord: "lata"
      },
      {
        partial: "ma___",
        choices: ["lo","lu"],
        answer: "lo",
        fullWord: "malo"
      },
      {
        partial: "te___",
        choices: ["la","le"],
        answer: "la",
        fullWord: "tela"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for L.",
    sourcePage: ""
  }
];
