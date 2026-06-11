export const lesson09 = [
  {
    id: "l9-p26-letter-tracing",
    lessonNumber: 9,
    pageNumber: 26,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — T t",
    prompt: "Traza la letra T mayúscula y la t minúscula. Luego haz un dibujo de una palabra que comienza con t.",
    items: [
      {
        id: "letter-T",
        label: "T"
      },
      {
        id: "letter-t",
        label: "t"
      }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase T (2-stroke) and lowercase t (2-stroke).",
    sourcePage: ""
  },
  {
    id: "l9-p27-syllable-circle",
    lessonNumber: 9,
    pageNumber: 27,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — T t",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-ta", label: "ta" },
      { id: "syl-te", label: "te" },
      { id: "syl-ti", label: "ti" },
      { id: "syl-to", label: "to" },
      { id: "syl-tu", label: "tu" }
    ],
    targets: [
      {
        id: "slot-ta",
        label: "ta",
        coordinatesVerified: false,
        acceptsItemId: "syl-ta"
      },
      {
        id: "slot-te",
        label: "te",
        coordinatesVerified: false,
        acceptsItemId: "syl-te"
      },
      {
        id: "slot-ti",
        label: "ti",
        coordinatesVerified: false,
        acceptsItemId: "syl-ti"
      },
      {
        id: "slot-to",
        label: "to",
        coordinatesVerified: false,
        acceptsItemId: "syl-to"
      },
      {
        id: "slot-tu",
        label: "tu",
        coordinatesVerified: false,
        acceptsItemId: "syl-tu"
      }
    ],
    wordBank: [
      "tomate",
      "moto",
      "pato",
      "tapa",
      "topo",
      "tía",
      "tío",
      "meta",
      "toma",
      "patata"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for T. Need to map slot coordinates.",
    sourcePage: ""
  },
  {
    id: "l9-p27-syllable-tap",
    lessonNumber: 9,
    pageNumber: 27,
    kind: "read-aloud",
    title: "Sílabas con T — página Tt",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-ta", label: "ta" },
      { id: "ra-te", label: "te" },
      { id: "ra-ti", label: "ti" },
      { id: "ra-to", label: "to" },
      { id: "ra-tu", label: "tu" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for T.",
    sourcePage: ""
  },
  {
    id: "l9-p27-word-bank",
    lessonNumber: 9,
    pageNumber: 27,
    kind: "listen-and-tap",
    title: "Palabras con T",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-tomate", label: "tomate" },
      { id: "w-moto", label: "moto" },
      { id: "w-pato", label: "pato" },
      { id: "w-tapa", label: "tapa" },
      { id: "w-topo", label: "topo" },
      { id: "w-tia", label: "tía" },
      { id: "w-tio", label: "tío" },
      { id: "w-meta", label: "meta" },
      { id: "w-toma", label: "toma" },
      { id: "w-patata", label: "patata" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for T.",
    sourcePage: ""
  },
  {
    id: "l9-p27-mini-story",
    lessonNumber: 9,
    pageNumber: 27,
    kind: "mini-story",
    title: "Mini-cuento: Mi pato Tito",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-t-1", label: "Mi pato Tito." },
      { id: "story-t-2", label: "Tito, mi pato." },
      { id: "story-t-3", label: "Yo mimo a Tito." },
      { id: "story-t-4", label: "Tito me ama a mí." },
      { id: "story-t-5", label: "Tito patea tu tomate." },
      { id: "story-t-6", label: "¡Tito, mi tomate!" }
    ],
    targets: [],
    sightWords: [
      "yo",
      "y"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for T using M, P, T and sight words.",
    sourcePage: ""
  },
  {
    id: "l9-p28-fill-in-blank",
    lessonNumber: 9,
    pageNumber: 28,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — T t",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-to", label: "to" },
      { id: "syl-ta", label: "ta" },
      { id: "syl-ti", label: "tí" }
    ],
    targets: [
      {
        id: "blank-tomate",
        label: "___mate",
        hint: "to / tu",
        correctSyllable: "to",
        fullWord: "tomate",
        coordinatesVerified: false,
        acceptsItemId: "syl-to"
      },
      {
        id: "blank-moto",
        label: "mo___",
        hint: "to / ta",
        correctSyllable: "to",
        fullWord: "moto",
        coordinatesVerified: false,
        acceptsItemId: "syl-to"
      },
      {
        id: "blank-pato",
        label: "pa___",
        hint: "to / ti",
        correctSyllable: "to",
        fullWord: "pato",
        coordinatesVerified: false,
        acceptsItemId: "syl-to"
      },
      {
        id: "blank-tapa",
        label: "___pa",
        hint: "ta / te",
        correctSyllable: "ta",
        fullWord: "tapa",
        coordinatesVerified: false,
        acceptsItemId: "syl-ta"
      },
      {
        id: "blank-meta",
        label: "me___",
        hint: "ta / to",
        correctSyllable: "ta",
        fullWord: "meta",
        coordinatesVerified: false,
        acceptsItemId: "syl-ta"
      },
      {
        id: "blank-tia",
        label: "___a",
        hint: "tí / tú",
        correctSyllable: "tí",
        fullWord: "tía",
        coordinatesVerified: false,
        acceptsItemId: "syl-ti"
      }
    ],
    exercises: [
      {
        partial: "___mate",
        choices: ["to", "tu"],
        answer: "to",
        fullWord: "tomate"
      },
      {
        partial: "mo___",
        choices: ["to", "ta"],
        answer: "to",
        fullWord: "moto"
      },
      {
        partial: "pa___",
        choices: ["to", "ti"],
        answer: "to",
        fullWord: "pato"
      },
      {
        partial: "___pa",
        choices: ["ta", "te"],
        answer: "ta",
        fullWord: "tapa"
      },
      {
        partial: "me___",
        choices: ["ta", "to"],
        answer: "ta",
        fullWord: "meta"
      },
      {
        partial: "___a",
        choices: ["tí", "tú"],
        answer: "tí",
        fullWord: "tía"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for T.",
    sourcePage: ""
  }
];
