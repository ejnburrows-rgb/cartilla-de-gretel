export const lesson13 = [
  {
    id: "l13-p38-letter-tracing",
    lessonNumber: 13,
    pageNumber: 38,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — S s",
    prompt: "Traza la letra S mayúscula y la s minúscula. Luego haz un dibujo de una palabra que comienza con s.",
    items: [
      {
        id: "letter-S",
        label: "S"
      },
      {
        id: "letter-s",
        label: "s"
      }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase S and lowercase s.",
    sourcePage: ""
  },
  {
    id: "l13-p39-syllable-circle",
    lessonNumber: 13,
    pageNumber: 39,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — S s",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-sa", label: "sa" },
      { id: "syl-se", label: "se" },
      { id: "syl-si", label: "si" },
      { id: "syl-so", label: "so" },
      { id: "syl-su", label: "su" }
    ],
    targets: [
      {
        id: "slot-sa",
        label: "sa",
        coordinatesVerified: false,
        acceptsItemId: "syl-sa"
      },
      {
        id: "slot-se",
        label: "se",
        coordinatesVerified: false,
        acceptsItemId: "syl-se"
      },
      {
        id: "slot-si",
        label: "si",
        coordinatesVerified: false,
        acceptsItemId: "syl-si"
      },
      {
        id: "slot-so",
        label: "so",
        coordinatesVerified: false,
        acceptsItemId: "syl-so"
      },
      {
        id: "slot-su",
        label: "su",
        coordinatesVerified: false,
        acceptsItemId: "syl-su"
      }
    ],
    wordBank: [
      "sapo",
      "sopa",
      "suma",
      "piso",
      "peso",
      "paso",
      "oso",
      "mesa",
      "misa",
      "seta"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for S.",
    sourcePage: ""
  },
  {
    id: "l13-p39-syllable-tap",
    lessonNumber: 13,
    pageNumber: 39,
    kind: "read-aloud",
    title: "Sílabas con S — página Ss",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-sa", label: "sa" },
      { id: "ra-se", label: "se" },
      { id: "ra-si", label: "si" },
      { id: "ra-so", label: "so" },
      { id: "ra-su", label: "su" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for S.",
    sourcePage: ""
  },
  {
    id: "l13-p39-word-bank",
    lessonNumber: 13,
    pageNumber: 39,
    kind: "listen-and-tap",
    title: "Palabras con S",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-sapo", label: "sapo" },
      { id: "w-sopa", label: "sopa" },
      { id: "w-suma", label: "suma" },
      { id: "w-piso", label: "piso" },
      { id: "w-peso", label: "peso" },
      { id: "w-paso", label: "paso" },
      { id: "w-oso", label: "oso" },
      { id: "w-mesa", label: "mesa" },
      { id: "w-misa", label: "misa" },
      { id: "w-seta", label: "seta" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for S.",
    sourcePage: ""
  },
  {
    id: "l13-p39-mini-story",
    lessonNumber: 13,
    pageNumber: 39,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-s-1", label: "Ese oso pisa la sopa." },
      { id: "story-s-2", label: "Susi suma en la mesa." },
      { id: "story-s-3", label: "Susi pasea su sapo." },
      { id: "story-s-4", label: "La masa en la mesa." }
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
    teacherNotes: "Scaffolded mini-story for S.",
    sourcePage: ""
  },
  {
    id: "l13-p40-fill-in-blank",
    lessonNumber: 13,
    pageNumber: 40,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — S s",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-po", label: "po" },
      { id: "syl-pa", label: "pa" },
      { id: "syl-sa", label: "sa" },
      { id: "syl-so", label: "so" },
      { id: "syl-ma", label: "ma" }
    ],
    targets: [
      {
        id: "blank-sapo",
        label: "sa___",
        hint: "po / pa",
        correctSyllable: "po",
        fullWord: "sapo",
        coordinatesVerified: false,
        acceptsItemId: "syl-po"
      },
      {
        id: "blank-sopa",
        label: "so___",
        hint: "pa / po",
        correctSyllable: "pa",
        fullWord: "sopa",
        coordinatesVerified: false,
        acceptsItemId: "syl-pa"
      },
      {
        id: "blank-mesa",
        label: "me___",
        hint: "sa / se",
        correctSyllable: "sa",
        fullWord: "mesa",
        coordinatesVerified: false,
        acceptsItemId: "syl-sa"
      },
      {
        id: "blank-oso",
        label: "o___",
        hint: "so / su",
        correctSyllable: "so",
        fullWord: "oso",
        coordinatesVerified: false,
        acceptsItemId: "syl-so"
      },
      {
        id: "blank-piso",
        label: "pi___",
        hint: "so / sa",
        correctSyllable: "so",
        fullWord: "piso",
        coordinatesVerified: false,
        acceptsItemId: "syl-so"
      },
      {
        id: "blank-suma",
        label: "su___",
        hint: "ma / me",
        correctSyllable: "ma",
        fullWord: "suma",
        coordinatesVerified: false,
        acceptsItemId: "syl-ma"
      }
    ],
    exercises: [
      {
        partial: "sa___",
        choices: ["po","pa"],
        answer: "po",
        fullWord: "sapo"
      },
      {
        partial: "so___",
        choices: ["pa","po"],
        answer: "pa",
        fullWord: "sopa"
      },
      {
        partial: "me___",
        choices: ["sa","se"],
        answer: "sa",
        fullWord: "mesa"
      },
      {
        partial: "o___",
        choices: ["so","su"],
        answer: "so",
        fullWord: "oso"
      },
      {
        partial: "pi___",
        choices: ["so","sa"],
        answer: "so",
        fullWord: "piso"
      },
      {
        partial: "su___",
        choices: ["ma","me"],
        answer: "ma",
        fullWord: "suma"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for S.",
    sourcePage: ""
  }
];
