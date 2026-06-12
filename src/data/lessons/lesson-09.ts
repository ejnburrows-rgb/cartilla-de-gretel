import { getBookPageImage } from "@/lib/bookImages";

export const lesson09 = [
  {
    id: "l9-p26-syllable-circle",
    lessonNumber: 9,
    pageNumber: 26,
    kind: "drag-syllable-to-slot",
    title: "Encierra en un círculo la sílaba correspondiente.",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra.",
    items: [
      { id: "syl-ma", label: "ma" },
      { id: "syl-me", label: "me" },
      { id: "syl-mi", label: "mi" },
      { id: "syl-mo", label: "mo" },
      { id: "syl-mu", label: "mu" }
    ],
    targets: [
      {
        id: "slot-ma",
        label: "ma",
        coordinatesVerified: false,
        acceptsItemId: "syl-ma"
      },
      {
        id: "slot-me",
        label: "me",
        coordinatesVerified: false,
        acceptsItemId: "syl-me"
      },
      {
        id: "slot-mi",
        label: "mi",
        coordinatesVerified: false,
        acceptsItemId: "syl-mi"
      },
      {
        id: "slot-mo",
        label: "mo",
        coordinatesVerified: false,
        acceptsItemId: "syl-mo"
      },
      {
        id: "slot-mu",
        label: "mu",
        coordinatesVerified: false,
        acceptsItemId: "syl-mu"
      }
    ],
    wordBank: [
      "mami", "ama", "mamá", "mima", "Coloma", "Manolo",
      "media", "Memo", "melón", "mesa", "meta", "Meme",
      "mío", "amigo", "mima", "mira", "misa", "Mimí",
      "amo", "Memo", "mono", "como", "moneda", "moto",
      "mulo", "muleta", "muro", "mudo", "mujer", "Mumi"
    ],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Verified syllable circle for Mm. Need to map slot coordinates.",
    sourcePage: getBookPageImage(26)
  },
  {
    id: "l9-p27-syllable-tap",
    lessonNumber: 9,
    pageNumber: 27,
    kind: "read-aloud",
    title: "Mm",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-ma", label: "ma" },
      { id: "ra-me", label: "me" },
      { id: "ra-mi", label: "mi" },
      { id: "ra-mo", label: "mo" },
      { id: "ra-mu", label: "mu" }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Verified syllable tap for Mm.",
    sourcePage: getBookPageImage(27)
  },
  {
    id: "l9-p27-word-bank",
    lessonNumber: 9,
    pageNumber: 27,
    kind: "listen-and-tap",
    title: "Palabras con M",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-mama", label: "mamá" },
      { id: "w-mio", label: "mío" },
      { id: "w-meme", label: "Meme" },
      { id: "w-mumi", label: "Mumi" },
      { id: "w-amo", label: "amo" },
      { id: "w-mami", label: "mami" },
      { id: "w-me", label: "me" },
      { id: "w-ama", label: "ama" },
      { id: "w-memo", label: "Memo" },
      { id: "w-mimi", label: "Mimí" },
      { id: "w-mimo", label: "Mimo" },
      { id: "w-mimame", label: "mímame" },
      { id: "w-mia", label: "mía" },
      { id: "w-mima", label: "mima" },
      { id: "w-amame", label: "ámame" },
      { id: "w-y", label: "y" }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Verified word bank for Mm.",
    sourcePage: getBookPageImage(27)
  },
  {
    id: "l9-p27-mini-story",
    lessonNumber: 9,
    pageNumber: 27,
    kind: "mini-story",
    title: "Oraciones con M",
    prompt: "Lee las oraciones del cuaderno con tu maestro.",
    items: [
      { id: "story-m-1", label: "Mi mamá me ama." },
      { id: "story-m-2", label: "Amo a mami. Mamá mía." },
      { id: "story-m-3", label: "Mamá ama a Meme y a Mimí." },
      { id: "story-m-4", label: "Memo ama a Mumi." },
      { id: "story-m-5", label: "Mamá mía ámame. Mímame a mí." },
      { id: "story-m-6", label: "Mi mamá me mima." }
    ],
    targets: [],
    sightWords: [
      "y"
    ],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Verified mini-story for Mm.",
    sourcePage: getBookPageImage(27)
  },
  {
    id: "l9-p28-fill-in-blank",
    lessonNumber: 9,
    pageNumber: 28,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras con la sílaba correcta.",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-ma", label: "ma" },
      { id: "syl-me", label: "Me" },
      { id: "syl-mi", label: "mi" },
      { id: "syl-mo", label: "mo" },
      { id: "syl-mu", label: "mu" },
      { id: "syl-mi-accent", label: "mí" }
    ],
    targets: [
      {
        id: "blank-amo",
        label: "a___",
        hint: "mo - mu",
        correctSyllable: "mo",
        fullWord: "amo",
        coordinatesVerified: false,
        acceptsItemId: "syl-mo"
      },
      {
        id: "blank-memo",
        label: "Me___",
        hint: "mo - mu",
        correctSyllable: "mo",
        fullWord: "Memo",
        coordinatesVerified: false,
        acceptsItemId: "syl-mo"
      },
      {
        id: "blank-mama",
        label: "ma___",
        hint: "mi - má",
        correctSyllable: "má",
        fullWord: "mamá",
        coordinatesVerified: false,
        acceptsItemId: "syl-ma-accent"
      },
      {
        id: "blank-mima",
        label: "mi___",
        hint: "ma-mu",
        correctSyllable: "ma",
        fullWord: "mima",
        coordinatesVerified: false,
        acceptsItemId: "syl-ma"
      },
      {
        id: "blank-mumi",
        label: "___mi",
        hint: "mi - Mu",
        correctSyllable: "Mu",
        fullWord: "Mumi",
        coordinatesVerified: false,
        acceptsItemId: "syl-mu-cap"
      },
      {
        id: "blank-mio",
        label: "___o",
        hint: "mí - mo",
        correctSyllable: "mí",
        fullWord: "mío",
        coordinatesVerified: false,
        acceptsItemId: "syl-mi-accent"
      }
    ],
    exercises: [
      {
        partial: "a___",
        choices: ["mo", "mu"],
        answer: "mo",
        fullWord: "amo"
      },
      {
        partial: "Me___",
        choices: ["mo", "mu"],
        answer: "mo",
        fullWord: "Memo"
      },
      {
        partial: "ma___",
        choices: ["mi", "má"],
        answer: "má",
        fullWord: "mamá"
      },
      {
        partial: "mi___",
        choices: ["ma", "mu"],
        answer: "ma",
        fullWord: "mima"
      },
      {
        partial: "___mi",
        choices: ["mi", "Mu"],
        answer: "Mu",
        fullWord: "Mumi"
      },
      {
        partial: "___o",
        choices: ["mí", "mo"],
        answer: "mí",
        fullWord: "mío"
      }
    ],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Verified fill-in-the-blank for Mm.",
    sourcePage: getBookPageImage(28)
  },
  {
    id: "l9-p28-write-sentences",
    lessonNumber: 9,
    pageNumber: 28,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones usando las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(28)
  }
];
