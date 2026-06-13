import { getBookPageImage } from "@/lib/bookImages";

export const lesson12 = [
  {
    id: "l12-p45-letter-tracing",
    lessonNumber: 12,
    pageNumber: 45,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra.",
    prompt: "Haz un dibujo que represente una palabra que comienza con l.",
    items: [
      { id: "letter-L", label: "L" },
      { id: "letter-l", label: "l" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded letter tracing for L.",
    sourcePage: getBookPageImage(45)
  },
  {
    id: "l12-p46-syllable-circle",
    lessonNumber: 12,
    pageNumber: 46,
    kind: "drag-syllable-to-slot",
    title: "Encierra en un círculo la sílaba correspondiente.",
    prompt: "Encierra en un círculo la sílaba correspondiente.",
    items: [
      { id: "syl-la", label: "la" },
      { id: "syl-le", label: "le" },
      { id: "syl-li", label: "li" },
      { id: "syl-lo", label: "lo" },
      { id: "syl-lu", label: "lu" }
    ],
    targets: [
      { id: "slot-la", label: "la", coordinatesVerified: false, acceptsItemId: "syl-la" },
      { id: "slot-le", label: "le", coordinatesVerified: false, acceptsItemId: "syl-le" },
      { id: "slot-li", label: "li", coordinatesVerified: false, acceptsItemId: "syl-li" },
      { id: "slot-lo", label: "lo", coordinatesVerified: false, acceptsItemId: "syl-lo" },
      { id: "slot-lu", label: "lu", coordinatesVerified: false, acceptsItemId: "syl-lu" }
    ],
    wordBank: [
      "lata", "mala", "pala", "Lamas", "mula", "pila",
      "Leo", "aleta", "saleta", "maleta", "sale", "paleta",
      "lima", "Lila", "alita", "liso", "palito", "limón",
      "pelota", "palo", "Lolo", "Polo", "Lola", "paloma",
      "lupa", "pelusa", "Luli", "luna", "saluda", "Lupe"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for L.",
    sourcePage: getBookPageImage(46)
  },
  {
    id: "l12-p47-syllable-tap",
    lessonNumber: 12,
    pageNumber: 47,
    kind: "read-aloud",
    title: "Ll",
    prompt: "Ll",
    items: [
      { id: "ra-la-0", label: "la" },
      { id: "ra-le-1", label: "le" },
      { id: "ra-li-2", label: "li" },
      { id: "ra-lo-3", label: "lo" },
      { id: "ra-lu-4", label: "lu" },
      { id: "ra-lu-5", label: "lu" },
      { id: "ra-lo-6", label: "lo" },
      { id: "ra-la-7", label: "la" },
      { id: "ra-le-8", label: "le" },
      { id: "ra-li-9", label: "li" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for L.",
    sourcePage: getBookPageImage(47)
  },
  {
    id: "l12-p47-word-bank",
    lessonNumber: 12,
    pageNumber: 47,
    kind: "listen-and-tap",
    title: "Palabras",
    prompt: "Palabras",
    items: [
      { id: "w-lima-0", label: "lima" },
      { id: "w-lata-1", label: "lata" },
      { id: "w-aleta-2", label: "aleta" },
      { id: "w-maleta-3", label: "maleta" },
      { id: "w-lupa-4", label: "lupa" },
      { id: "w-sale-5", label: "sale" },
      { id: "w-paloma-6", label: "paloma" },
      { id: "w-pala-7", label: "pala" },
      { id: "w-lomo-8", label: "lomo" },
      { id: "w-pelusa-9", label: "pelusa" },
      { id: "w-lilo-10", label: "Lilo" },
      { id: "w-lola-11", label: "Lola" },
      { id: "w-luli-12", label: "Luli" },
      { id: "w-tela-13", label: "tela" },
      { id: "w-tula-14", label: "Tula" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for L.",
    sourcePage: getBookPageImage(47)
  },
  {
    id: "l12-p47-mini-story",
    lessonNumber: 12,
    pageNumber: 47,
    kind: "mini-story",
    title: "Cuento",
    prompt: "Cuento",
    items: [
      { id: "story-l-1", label: "La maleta de Luli está en la mesa." },
      { id: "story-l-2", label: "La tela de la maleta tiene pelusas." },
      { id: "story-l-3", label: "La maleta de Polo es de tela." },
      { id: "story-l-4", label: "Mamá le da la maleta a Polo." },
      { id: "story-l-5", label: "Polo toma su maleta de tela." },
      { id: "story-l-6", label: "Lalo tiene una maleta de tela también." }
    ],
    targets: [],
    sightWords: [
      "también"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for L.",
    sourcePage: getBookPageImage(47)
  },
  {
    id: "l12-p48-fill-in-blank",
    lessonNumber: 12,
    pageNumber: 48,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras con la sílaba correcta.",
    prompt: "Completa las palabras con la sílaba correcta.",
    items: [
      { id: "syl-le-0", label: "le" },
      { id: "syl-lo-1", label: "lo" },
      { id: "syl-li-2", label: "li" },
      { id: "syl-la-3", label: "la" },
      { id: "syl-lu-4", label: "lu" }
    ],
    targets: [
      {
        id: "blank-paleta-0",
        label: "pa___ta",
        hint: "le - lo",
        correctSyllable: "le",
        fullWord: "paleta",
        coordinatesVerified: false,
        acceptsItemId: "syl-le-0"
      },
      {
        id: "blank-solo-1",
        label: "so___",
        hint: "li - lo",
        correctSyllable: "lo",
        fullWord: "solo",
        coordinatesVerified: false,
        acceptsItemId: "syl-lo-1"
      },
      {
        id: "blank-pala-2",
        label: "pa___",
        hint: "la - lu",
        correctSyllable: "la",
        fullWord: "pala",
        coordinatesVerified: false,
        acceptsItemId: "syl-la-3"
      },
      {
        id: "blank-lata-3",
        label: "___ta",
        hint: "la - le",
        correctSyllable: "la",
        fullWord: "lata",
        coordinatesVerified: false,
        acceptsItemId: "syl-la-3"
      },
      {
        id: "blank-maleta-4",
        label: "ma___ta",
        hint: "le - li",
        correctSyllable: "le",
        fullWord: "maleta",
        coordinatesVerified: false,
        acceptsItemId: "syl-le-0"
      },
      {
        id: "blank-lupa-5",
        label: "___pa",
        hint: "lu - la",
        correctSyllable: "lu",
        fullWord: "lupa",
        coordinatesVerified: false,
        acceptsItemId: "syl-lu-4"
      }
    ],
    exercises: [
      {
        partial: "pa___ta",
        choices: ["le", "lo"],
        answer: "le",
        fullWord: "paleta"
      },
      {
        partial: "so___",
        choices: ["li", "lo"],
        answer: "lo",
        fullWord: "solo"
      },
      {
        partial: "pa___",
        choices: ["la", "lu"],
        answer: "la",
        fullWord: "pala"
      },
      {
        partial: "___ta",
        choices: ["la", "le"],
        answer: "la",
        fullWord: "lata"
      },
      {
        partial: "ma___ta",
        choices: ["le", "li"],
        answer: "le",
        fullWord: "maleta"
      },
      {
        partial: "___pa",
        choices: ["lu", "la"],
        answer: "lu",
        fullWord: "lupa"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for L.",
    sourcePage: getBookPageImage(48)
  },
  {
    id: "l12-p48-write-sentences",
    lessonNumber: 12,
    pageNumber: 48,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones. Usa las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(48)
  }
];
