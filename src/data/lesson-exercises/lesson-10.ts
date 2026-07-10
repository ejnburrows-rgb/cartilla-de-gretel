import { getBookPageImage } from "@/lib/bookImages";

export const lesson10 = [
  {
    id: "l10-p37-letter-tracing",
    lessonNumber: 10,
    pageNumber: 37,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — T t",
    prompt: "Traza la letra T mayúscula y la t minúscula. Luego haz un dibujo de una palabra que comienza con t.",
    items: [
      { id: "letter-T", label: "T" },
      { id: "letter-t", label: "t" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase T and lowercase t.",
    sourcePage: getBookPageImage(37)
  },
  {
    id: "l10-p38-syllable-circle",
    lessonNumber: 10,
    pageNumber: 38,
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
      { id: "slot-ta", label: "ta", coordinatesVerified: false, acceptsItemId: "syl-ta" },
      { id: "slot-te", label: "te", coordinatesVerified: false, acceptsItemId: "syl-te" },
      { id: "slot-ti", label: "ti", coordinatesVerified: false, acceptsItemId: "syl-ti" },
      { id: "slot-to", label: "to", coordinatesVerified: false, acceptsItemId: "syl-to" },
      { id: "slot-tu", label: "tu", coordinatesVerified: false, acceptsItemId: "syl-tu" }
    ],
    wordBank: [
      "tapa", "Mota", "Tota", "seta", "peseta", "pata",
      "tema", "tomate", "mete", "teme", "Teté", "tapete",
      "Tito", "Piti", "timón", "tina", "Poti", "tipi",
      "topo", "moto", "pato", "toma", "sapito",
      "tupe", "tubo", "tulipán", "tuna", "tuba", "Matute"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for T.",
    sourcePage: getBookPageImage(38)
  },
  {
    id: "l10-p39-syllable-tap",
    lessonNumber: 10,
    pageNumber: 39,
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
    sourcePage: getBookPageImage(39)
  },
  {
    id: "l10-p39-word-bank",
    lessonNumber: 10,
    pageNumber: 39,
    kind: "listen-and-tap",
    title: "Palabras con T",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-toma", label: "toma" },
      { id: "w-teme", label: "teme" },
      { id: "w-seta", label: "seta" },
      { id: "w-tute", label: "tute" },
      { id: "w-titi", label: "Titi" },
      { id: "w-pata", label: "pata" },
      { id: "w-soto", label: "Soto" },
      { id: "w-tupe", label: "tupe" },
      { id: "w-tapa", label: "tapa" },
      { id: "w-mete", label: "mete" },
      { id: "w-mota", label: "Mota" },
      { id: "w-piti", label: "Piti" },
      { id: "w-topo", label: "topo" },
      { id: "w-sapito", label: "sapito" },
      { id: "w-peseta", label: "peseta" },
      { id: "w-tomate", label: "tomate" },
      { id: "w-poti", label: "Poti" },
      { id: "w-pato", label: "pato" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for T.",
    sourcePage: getBookPageImage(39)
  },
  {
    id: "l10-p39-mini-story",
    lessonNumber: 10,
    pageNumber: 39,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-t-1", label: "La mesa tiene un tapete." },
      { id: "story-t-2", label: "El pomo está en la mesa." },
      { id: "story-t-3", label: "La mesa está en el patio." },
      { id: "story-t-4", label: "El pomo tiene sopa. El pomo tiene tapa." },
      { id: "story-t-5", label: "Tito tapa el pomo." },
      { id: "story-t-6", label: "—¡No Tito, no, no tapes el pomo!" },
      { id: "story-t-7", label: "Papá tapa la sopa." }
    ],
    targets: [],
    sightWords: [
      "tiene", "patio", "no"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for T.",
    sourcePage: getBookPageImage(39)
  },
  {
    id: "l10-p40-fill-in-blank",
    lessonNumber: 10,
    pageNumber: 40,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — T t",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-to", label: "to" },
      { id: "syl-ta", label: "ta" },
      { id: "syl-tu", label: "tu" },
      { id: "syl-ti", label: "ti" },
      { id: "syl-pe", label: "pe" },
      { id: "syl-pi", label: "pi" }
    ],
    targets: [
      {
        id: "blank-toma",
        label: "___ma",
        hint: "to - ta",
        correctSyllable: "to",
        fullWord: "toma",
        coordinatesVerified: false,
        acceptsItemId: "syl-to"
      },
      {
        id: "blank-mata",
        label: "ma___",
        hint: "ta - ti",
        correctSyllable: "ta",
        fullWord: "mata",
        coordinatesVerified: false,
        acceptsItemId: "syl-ta"
      },
      {
        id: "blank-topo",
        label: "___po",
        hint: "tu - to",
        correctSyllable: "to",
        fullWord: "topo",
        coordinatesVerified: false,
        acceptsItemId: "syl-to"
      },
      {
        id: "blank-tomate",
        label: "___mate",
        hint: "to - tu",
        correctSyllable: "to",
        fullWord: "tomate",
        coordinatesVerified: false,
        acceptsItemId: "syl-to"
      },
      {
        id: "blank-tupe",
        label: "___pe",
        hint: "ti - tu",
        correctSyllable: "tu",
        fullWord: "tupe",
        coordinatesVerified: false,
        acceptsItemId: "syl-tu"
      },
      {
        id: "blank-tipi",
        label: "___pi",
        hint: "to - ti",
        correctSyllable: "ti",
        fullWord: "tipi",
        coordinatesVerified: false,
        acceptsItemId: "syl-ti"
      }
    ],
    exercises: [
      {
        partial: "___ma",
        choices: ["to", "ta"],
        answer: "to",
        fullWord: "toma"
      },
      {
        partial: "ma___",
        choices: ["ta", "ti"],
        answer: "ta",
        fullWord: "mata"
      },
      {
        partial: "___po",
        choices: ["tu", "to"],
        answer: "to",
        fullWord: "topo"
      },
      {
        partial: "___mate",
        choices: ["to", "tu"],
        answer: "to",
        fullWord: "tomate"
      },
      {
        partial: "___pe",
        choices: ["ti", "tu"],
        answer: "tu",
        fullWord: "tupe"
      },
      {
        partial: "___pi",
        choices: ["to", "ti"],
        answer: "ti",
        fullWord: "tipi"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for T.",
    sourcePage: getBookPageImage(40)
  },
  {
    id: "l10-p40-write-sentences",
    lessonNumber: 10,
    pageNumber: 40,
    kind: "letter-tracing",
    title: "Escribe oraciones…",
    prompt: "Escribe oraciones…",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(40)
  }
];
