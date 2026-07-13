import { getBookPageImage } from "@/lib/bookImages";

export const lesson24 = [
  {
    id: "l24-p87-picture-vocab",
    lessonNumber: 24,
    pageNumber: 87,
    kind: "listen-and-tap",
    title: "Zz",
    prompt: "Presiona el dibujo de la palabra que escuchas.",
    items: [
      { id: "img-zapato", label: "zapato" },
      { id: "img-zigzag", label: "zig-zag" },
      { id: "img-zorro", label: "zorro" },
      { id: "img-zepelin", label: "zepelín" },
      { id: "img-zulema", label: "Zulema" }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Transcribed verbatim from public/cartilla/images/source/z/z-page-58.jpg (real scan).",
    sourcePage: getBookPageImage(87)
  },
  {
    id: "l24-p88-syllable-tap",
    lessonNumber: 24,
    pageNumber: 88,
    kind: "read-aloud",
    title: "Zz",
    prompt: "za ze zi zo zu",
    items: [
      { id: "ra-za", label: "za" },
      { id: "ra-ze", label: "ze" },
      { id: "ra-zi", label: "zi" },
      { id: "ra-zo", label: "zo" },
      { id: "ra-zu", label: "zu" }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Transcribed verbatim from public/cartilla/images/source/z/z-page-59.jpg (real scan).",
    sourcePage: getBookPageImage(88)
  },
  {
    id: "l24-p88-word-bank",
    lessonNumber: 24,
    pageNumber: 88,
    kind: "listen-and-tap",
    title: "Palabras",
    prompt: "Palabras",
    items: [
      { id: "w-zorro", label: "zorro" },
      { id: "w-zapato", label: "zapato" },
      { id: "w-azul", label: "azul" },
      { id: "w-zigzag", label: "zig-zag" },
      { id: "w-zila", label: "Zila" },
      { id: "w-zeta", label: "zeta" },
      { id: "w-taza", label: "taza" },
      { id: "w-lazo", label: "lazo" },
      { id: "w-zapote", label: "zapote" },
      { id: "w-zulema", label: "Zulema" },
      { id: "w-calabaza", label: "calabaza" },
      { id: "w-zumo", label: "zumo" },
      { id: "w-azucar", label: "azúcar" },
      { id: "w-zepelin", label: "zepelín" },
      { id: "w-azucarado", label: "azucarado" }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Word list transcribed verbatim from public/cartilla/images/source/z/z-page-59.jpg (real scan).",
    sourcePage: getBookPageImage(88)
  },
  {
    id: "l24-p88-mini-story",
    lessonNumber: 24,
    pageNumber: 88,
    kind: "mini-story",
    title: "Cuento",
    prompt: "Cuento",
    items: [
      { id: "story-z-1", label: "Zulema toma zumo de melón." },
      { id: "story-z-2", label: "A Zulema le gusta el zumo con azúcar." },
      { id: "story-z-3", label: "Ella bebe el zumo y se pone sus zapatos" },
      { id: "story-z-4", label: "azules." },
      { id: "story-z-5", label: "Zila va con Zulema, van en un carro con" },
      { id: "story-z-6", label: "ruedas de calabazas." }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Reading passage transcribed verbatim from public/cartilla/images/source/z/z-page-59.jpg (real scan).",
    sourcePage: getBookPageImage(88)
  },
  {
    id: "l24-p89-rhyme",
    lessonNumber: 24,
    pageNumber: 89,
    kind: "mini-story",
    title: "El carro-calabaza",
    prompt: "Rima",
    items: [
      { id: "rhyme-z-1", label: "En su carro-calabaza" },
      { id: "rhyme-z-2", label: "con timón azucarado" },
      { id: "rhyme-z-3", label: "Zulema se va a la plaza" },
      { id: "rhyme-z-4", label: "a la plaza del mercado." },
      { id: "rhyme-z-5", label: "Compra ricas zarzamoras" },
      { id: "rhyme-z-6", label: "zumo de zapote y miel" },
      { id: "rhyme-z-7", label: "en su carro-calabaza" },
      { id: "rhyme-z-8", label: "Zulema rueda muy bien." }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Rhyme transcribed verbatim from public/cartilla/images/source/z/z-page-60.jpg (real scan).",
    sourcePage: getBookPageImage(89)
  },
  {
    id: "l24-p90-fill-in-blank",
    lessonNumber: 24,
    pageNumber: 90,
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
      { id: "blank-zapato-0", label: "___pato", hint: "za - zo", correctSyllable: "za", fullWord: "zapato", coordinatesVerified: false, acceptsItemId: "syl-za-0" },
      { id: "blank-zeta-1", label: "___ta", hint: "za - ze", correctSyllable: "ze", fullWord: "zeta", coordinatesVerified: false, acceptsItemId: "syl-ze-2" },
      { id: "blank-zumo-2", label: "___mo", hint: "zo - zu", correctSyllable: "zu", fullWord: "zumo", coordinatesVerified: false, acceptsItemId: "syl-zu-3" },
      { id: "blank-lazo-3", label: "la___", hint: "zo - zú", correctSyllable: "zo", fullWord: "lazo", coordinatesVerified: false, acceptsItemId: "syl-zo-1" },
      { id: "blank-azules-4", label: "a___les", hint: "zu - za", correctSyllable: "zu", fullWord: "azules", coordinatesVerified: false, acceptsItemId: "syl-zu-3" },
      { id: "blank-zita-5", label: "___ta", hint: "Zo - Zi", correctSyllable: "Zi", fullWord: "Zita", coordinatesVerified: false, acceptsItemId: "syl-Zi-6" }
    ],
    exercises: [
      { partial: "___pato", choices: ["za", "zo"], answer: "za", fullWord: "zapato" },
      { partial: "___ta", choices: ["za", "ze"], answer: "ze", fullWord: "zeta" },
      { partial: "___mo", choices: ["zo", "zu"], answer: "zu", fullWord: "zumo" },
      { partial: "la___", choices: ["zo", "zú"], answer: "zo", fullWord: "lazo" },
      { partial: "a___les", choices: ["zu", "za"], answer: "zu", fullWord: "azules" },
      { partial: "___ta", choices: ["Zo", "Zi"], answer: "Zi", fullWord: "Zita" }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "UNREADABLE-SCAN — no source scan was provided for this lesson's fill-in-blank page (physical page 90, per consonants.json's pages \"87-90\"); only 3 scans exist for z/ (page-58, 59, 60). This entry is unverified scaffold content carried over as-is; left pending, not promoted to ready.",
    sourcePage: getBookPageImage(90)
  },
  {
    id: "l24-p90-write-sentences",
    lessonNumber: 24,
    pageNumber: 90,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones usando las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "UNREADABLE-SCAN — no source scan was provided for physical page 90 (see fill-in-blank entry above for the same lesson/page).",
    sourcePage: getBookPageImage(90)
  }
];
