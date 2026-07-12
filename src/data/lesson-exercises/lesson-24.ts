import { getBookPageImage } from "@/lib/bookImages";

export const lesson24 = [
  {
    id: "l24-p92-syllable-circle",
    lessonNumber: 24,
    pageNumber: 92,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — Z z",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-za", label: "za" },
      { id: "syl-ze", label: "ze" },
      { id: "syl-zi", label: "zi" },
      { id: "syl-zo", label: "zo" },
      { id: "syl-zu", label: "zu" }
    ],
    targets: [
      { id: "slot-za", label: "za", coordinatesVerified: false, acceptsItemId: "syl-za" },
      { id: "slot-ze", label: "ze", coordinatesVerified: false, acceptsItemId: "syl-ze" },
      { id: "slot-zi", label: "zi", coordinatesVerified: false, acceptsItemId: "syl-zi" },
      { id: "slot-zo", label: "zo", coordinatesVerified: false, acceptsItemId: "syl-zo" },
      { id: "slot-zu", label: "zu", coordinatesVerified: false, acceptsItemId: "syl-zu" }
    ],
    wordBank: [
      "taza", "caza", "zapatero", "plaza", "zapato", "zapote", "zepelín", "zebra", "Zenaida", "zeta", "Zegrí", "Zema", "zig-zag", "Zimba", "Zila", "Zita", "zorro", "portazo", "zocato", "azotes", "zopilote", "lazo", "azúcar", "zurra", "azucarado", "azules", "Zulema", "azulado"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded syllable circle for z.",
    sourcePage: getBookPageImage(92)
  },
  {
    id: "l24-p93-syllable-tap",
    lessonNumber: 24,
    pageNumber: 93,
    kind: "read-aloud",
    title: "Sílabas con Z — página Zz",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-za", label: "za" },
      { id: "ra-ze", label: "ze" },
      { id: "ra-zi", label: "zi" },
      { id: "ra-zo", label: "zo" },
      { id: "ra-zu", label: "zu" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded syllable tap for z.",
    sourcePage: getBookPageImage(93)
  },
  {
    id: "l24-p93-word-bank",
    lessonNumber: 24,
    pageNumber: 93,
    kind: "listen-and-tap",
    title: "Palabras con Z",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-zorro-0", label: "zorro" },
      { id: "w-zeta-1", label: "zeta" },
      { id: "w-calabaza-2", label: "calabaza" },
      { id: "w-zapato-3", label: "zapato" },
      { id: "w-taza-4", label: "taza" },
      { id: "w-zumo-5", label: "zumo" },
      { id: "w-azul-6", label: "azul" },
      { id: "w-lazo-7", label: "lazo" },
      { id: "w-azucar-8", label: "azúcar" },
      { id: "w-zig-zag-9", label: "zig-zag" },
      { id: "w-zapote-10", label: "zapote" },
      { id: "w-zepelin-11", label: "zepelín" },
      { id: "w-zila-12", label: "Zila" },
      { id: "w-zulema-13", label: "Zulema" },
      { id: "w-azucarado-14", label: "azucarado" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded word bank for z.",
    sourcePage: getBookPageImage(93)
  },
  {
    id: "l24-p93-mini-story",
    lessonNumber: 24,
    pageNumber: 93,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-z-1", label: "Zulema toma zumo de melón." },
      { id: "story-z-2", label: "A Zulema le gusta el zumo con azúcar." },
      { id: "story-z-3", label: "Ella se bebe el zumo y se pone sus zapatos" },
      { id: "story-z-4", label: "azules." },
      { id: "story-z-5", label: "Zila va con Zulema, van en un carro con" },
      { id: "story-z-6", label: "ruedas de calabazas." }
    ],
    targets: [],
    sightWords: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded mini-story for z.",
    sourcePage: getBookPageImage(93)
  },
  {
    id: "l24-p94-fill-in-blank",
    lessonNumber: 24,
    pageNumber: 94,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — Z z",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-za-0", label: "za" },
      { id: "syl-zo-1", label: "zo" },
      { id: "syl-ze-2", label: "ze" },
      { id: "syl-zu-3", label: "zu" },
      { id: "syl-zu-4", label: "zú" },
      { id: "syl-Zo-5", label: "Zo" },
      { id: "syl-Zi-6", label: "Zi" }
    ],
    targets: [
      {
        id: "blank-zapato-0",
        label: "___pato",
        hint: "za - zo",
        correctSyllable: "za",
        fullWord: "zapato",
        coordinatesVerified: false,
        acceptsItemId: "syl-za-0"
      },
      {
        id: "blank-zeta-1",
        label: "___ta",
        hint: "za - ze",
        correctSyllable: "ze",
        fullWord: "zeta",
        coordinatesVerified: false,
        acceptsItemId: "syl-ze-2"
      },
      {
        id: "blank-zumo-2",
        label: "___mo",
        hint: "zo - zu",
        correctSyllable: "zu",
        fullWord: "zumo",
        coordinatesVerified: false,
        acceptsItemId: "syl-zu-3"
      },
      {
        id: "blank-lazo-3",
        label: "la___",
        hint: "zo - zú",
        correctSyllable: "zo",
        fullWord: "lazo",
        coordinatesVerified: false,
        acceptsItemId: "syl-zo-1"
      },
      {
        id: "blank-azules-4",
        label: "a___les",
        hint: "zu - za",
        correctSyllable: "zu",
        fullWord: "azules",
        coordinatesVerified: false,
        acceptsItemId: "syl-zu-3"
      },
      {
        id: "blank-zita-5",
        label: "___ta",
        hint: "Zo - Zi",
        correctSyllable: "Zi",
        fullWord: "Zita",
        coordinatesVerified: false,
        acceptsItemId: "syl-Zi-6"
      }
    ],
    exercises: [
      {
        partial: "___pato",
        choices: ["za","zo"],
        answer: "za",
        fullWord: "zapato"
      },
      {
        partial: "___ta",
        choices: ["za","ze"],
        answer: "ze",
        fullWord: "zeta"
      },
      {
        partial: "___mo",
        choices: ["zo","zu"],
        answer: "zu",
        fullWord: "zumo"
      },
      {
        partial: "la___",
        choices: ["zo","zú"],
        answer: "zo",
        fullWord: "lazo"
      },
      {
        partial: "a___les",
        choices: ["zu","za"],
        answer: "zu",
        fullWord: "azules"
      },
      {
        partial: "___ta",
        choices: ["Zo","Zi"],
        answer: "Zi",
        fullWord: "Zita"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded fill-in-the-blank for z.",
    sourcePage: getBookPageImage(94)
  },
  {
    id: "l24-p94-write-sentences",
    lessonNumber: 24,
    pageNumber: 94,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones usando las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Sentence writing lines.",
    sourcePage: getBookPageImage(94)
  }
];
