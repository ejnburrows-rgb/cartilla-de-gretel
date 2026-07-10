import { getBookPageImage } from "@/lib/bookImages";

export const lesson18 = [
  {
    id: "l18-p69-letter-tracing",
    lessonNumber: 18,
    pageNumber: 69,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — rr",
    prompt: "Traza la letra rr mayúscula y la rr minúscula. Luego haz un dibujo de una palabra que comienza con rr.",
    items: [
      { id: "letter-rr", label: "rr" },
      { id: "letter-rr", label: "rr" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase and lowercase rr.",
    sourcePage: getBookPageImage(69)
  },
  {
    id: "l18-p70-syllable-circle",
    lessonNumber: 18,
    pageNumber: 70,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — rr",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-rra", label: "rra" },
      { id: "syl-rre", label: "rre" },
      { id: "syl-rri", label: "rri" },
      { id: "syl-rro", label: "rro" },
      { id: "syl-rru", label: "rru" }
    ],
    targets: [
      { id: "slot-rra", label: "rra", coordinatesVerified: false, acceptsItemId: "syl-rra" },
      { id: "slot-rre", label: "rre", coordinatesVerified: false, acceptsItemId: "syl-rre" },
      { id: "slot-rri", label: "rri", coordinatesVerified: false, acceptsItemId: "syl-rri" },
      { id: "slot-rro", label: "rro", coordinatesVerified: false, acceptsItemId: "syl-rro" },
      { id: "slot-rru", label: "rru", coordinatesVerified: false, acceptsItemId: "syl-rru" }
    ],
    wordBank: [
      "barra", "amarra", "pizarra", "Porra", "arrasar", "perra", "torre", "amarre", "arrebatado", "barre", "arrebatar", "arrepiente", "arriba", "arrima", "parrilla", "perrita", "barril", "carrito", "carro", "arroyo", "burro", "perro", "amarro", "tarro", "arruga", "arrugado", "arrullo", "verruga", "arrullar", "arrullador"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for rr.",
    sourcePage: getBookPageImage(70)
  },
  {
    id: "l18-p71-syllable-tap",
    lessonNumber: 18,
    pageNumber: 71,
    kind: "read-aloud",
    title: "Sílabas con RR — página rr",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-rra", label: "rra" },
      { id: "ra-rre", label: "rre" },
      { id: "ra-rri", label: "rri" },
      { id: "ra-rro", label: "rro" },
      { id: "ra-rru", label: "rru" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for rr.",
    sourcePage: getBookPageImage(71)
  },
  {
    id: "l18-p71-word-bank",
    lessonNumber: 18,
    pageNumber: 71,
    kind: "listen-and-tap",
    title: "Palabras con RR",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-tarro-0", label: "tarro" },
      { id: "w-perro-1", label: "perro" },
      { id: "w-barro-2", label: "barro" },
      { id: "w-arroba-3", label: "arroba" },
      { id: "w-arriba-4", label: "arriba" },
      { id: "w-burro-5", label: "burro" },
      { id: "w-amarro-6", label: "amarro" },
      { id: "w-arrebato-7", label: "arrebato" },
      { id: "w-parra-8", label: "parra" },
      { id: "w-arruina-9", label: "arruina" },
      { id: "w-tierra-10", label: "tierra" },
      { id: "w-carrusel-11", label: "carrusel" },
      { id: "w-torre-12", label: "torre" },
      { id: "w-burrito-13", label: "burrito" },
      { id: "w-carro-14", label: "carro" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for rr.",
    sourcePage: getBookPageImage(71)
  },
  {
    id: "l18-p71-mini-story",
    lessonNumber: 18,
    pageNumber: 71,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-rr-1", label: "Rode tiene un perro. Es un perro alemán." },
      { id: "story-rr-2", label: "El perro de Rode tiene una tina de barro." },
      { id: "story-rr-3", label: "La tina de barro está en el piso." },
      { id: "story-rr-4", label: "Rosi amarra el perro en la mata." },
      { id: "story-rr-5", label: "El perro no muerde. El perro Tito mueve el" },
      { id: "story-rr-6", label: "rabo. Tito arruinó el carro de rosas." }
    ],
    targets: [],
    sightWords: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for rr.",
    sourcePage: getBookPageImage(71)
  },
  {
    id: "l18-p72-fill-in-blank",
    lessonNumber: 18,
    pageNumber: 72,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — rr",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-rra-0", label: "rra" },
      { id: "syl-rro-1", label: "rro" },
      { id: "syl-rre-2", label: "rre" },
      { id: "syl-rri-3", label: "rri" },
      { id: "syl-rru-4", label: "rru" }
    ],
    targets: [
      {
        id: "blank-perro-0",
        label: "pe___",
        hint: "rra - rro",
        correctSyllable: "rro",
        fullWord: "perro",
        coordinatesVerified: false,
        acceptsItemId: "syl-rro-1"
      },
      {
        id: "blank-barre-1",
        label: "ba___",
        hint: "rre - rri",
        correctSyllable: "rre",
        fullWord: "barre",
        coordinatesVerified: false,
        acceptsItemId: "syl-rre-2"
      },
      {
        id: "blank-torre-2",
        label: "to___",
        hint: "rro - rre",
        correctSyllable: "rre",
        fullWord: "torre",
        coordinatesVerified: false,
        acceptsItemId: "syl-rre-2"
      },
      {
        id: "blank-burro-3",
        label: "bu___",
        hint: "rro - rru",
        correctSyllable: "rro",
        fullWord: "burro",
        coordinatesVerified: false,
        acceptsItemId: "syl-rro-1"
      },
      {
        id: "blank-carro-4",
        label: "ca___",
        hint: "rro - rru",
        correctSyllable: "rro",
        fullWord: "carro",
        coordinatesVerified: false,
        acceptsItemId: "syl-rro-1"
      },
      {
        id: "blank-amarro-5",
        label: "ama___",
        hint: "rru - rro",
        correctSyllable: "rro",
        fullWord: "amarro",
        coordinatesVerified: false,
        acceptsItemId: "syl-rro-1"
      }
    ],
    exercises: [
      {
        partial: "pe___",
        choices: ["rra","rro"],
        answer: "rro",
        fullWord: "perro"
      },
      {
        partial: "ba___",
        choices: ["rre","rri"],
        answer: "rre",
        fullWord: "barre"
      },
      {
        partial: "to___",
        choices: ["rro","rre"],
        answer: "rre",
        fullWord: "torre"
      },
      {
        partial: "bu___",
        choices: ["rro","rru"],
        answer: "rro",
        fullWord: "burro"
      },
      {
        partial: "ca___",
        choices: ["rro","rru"],
        answer: "rro",
        fullWord: "carro"
      },
      {
        partial: "ama___",
        choices: ["rru","rro"],
        answer: "rro",
        fullWord: "amarro"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for rr.",
    sourcePage: getBookPageImage(72)
  },
  {
    id: "l18-p72-write-sentences",
    lessonNumber: 18,
    pageNumber: 72,
    kind: "letter-tracing",
    title: "Escribe oraciones…",
    prompt: "Escribe oraciones…",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(72)
  }
];
