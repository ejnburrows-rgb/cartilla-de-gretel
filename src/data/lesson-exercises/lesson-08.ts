import { getBookPageImage } from "@/lib/bookImages";

export const lesson08 = [
  {
    id: "l8-p29-letter-tracing",
    lessonNumber: 8,
    pageNumber: 29,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — P p",
    prompt: "Traza la letra P mayúscula y la p minúscula. Luego haz un dibujo de una palabra que comienza con p.",
    items: [
      { id: "letter-P", label: "P" },
      { id: "letter-p", label: "p" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase P and lowercase p.",
    sourcePage: getBookPageImage(29)
  },
  {
    id: "l8-p30-syllable-circle",
    lessonNumber: 8,
    pageNumber: 30,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — P p",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra.",
    items: [
      { id: "syl-pa", label: "pa" },
      { id: "syl-pe", label: "pe" },
      { id: "syl-pi", label: "pi" },
      { id: "syl-po", label: "po" },
      { id: "syl-pu", label: "pu" }
    ],
    targets: [
      { id: "slot-pa", label: "pa", coordinatesVerified: false, acceptsItemId: "syl-pa" },
      { id: "slot-pe", label: "pe", coordinatesVerified: false, acceptsItemId: "syl-pe" },
      { id: "slot-pi", label: "pi", coordinatesVerified: false, acceptsItemId: "syl-pi" },
      { id: "slot-po", label: "po", coordinatesVerified: false, acceptsItemId: "syl-po" },
      { id: "slot-pu", label: "pu", coordinatesVerified: false, acceptsItemId: "syl-pu" }
    ],
    wordBank: [
      "papá", "pupa", "mapa", "Papo", "¡upa!", "pala",
      "Pepe", "pelo", "tapete", "pesa", "pelota", "chupete",
      "pipo", "Pupi", "Mupi", "papi", "Mapi", "pío",
      "pomo", "polo", "sapo", "mapo", "tapo", "Pepo",
      "puso", "Pupa", "puma", "apura", "Pupi", "púa"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for P.",
    sourcePage: getBookPageImage(30)
  },
  {
    id: "l8-p31-syllable-tap",
    lessonNumber: 8,
    pageNumber: 31,
    kind: "read-aloud",
    title: "Sílabas con P — página Pp",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-pa", label: "pa" },
      { id: "ra-pe", label: "pe" },
      { id: "ra-pi", label: "pi" },
      { id: "ra-po", label: "po" },
      { id: "ra-pu", label: "pu" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for P.",
    sourcePage: getBookPageImage(31)
  },
  {
    id: "l8-p31-word-bank",
    lessonNumber: 8,
    pageNumber: 31,
    kind: "listen-and-tap",
    title: "Palabras con P",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-papa", label: "papá" },
      { id: "w-papi", label: "papi" },
      { id: "w-pepe", label: "Pepe" },
      { id: "w-pipo", label: "pipo" },
      { id: "w-pupi", label: "Pupi" },
      { id: "w-mapo", label: "mapo" },
      { id: "w-puma", label: "puma" },
      { id: "w-mupi", label: "Mupi" },
      { id: "w-mapa", label: "mapa" },
      { id: "w-upa", label: "¡upa!" },
      { id: "w-mapi", label: "Mapi" },
      { id: "w-pie", label: "pie" },
      { id: "w-pua", label: "púa" },
      { id: "w-pomo", label: "pomo" },
      { id: "w-pepo", label: "Pepo" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for P.",
    sourcePage: getBookPageImage(31)
  },
  {
    id: "l8-p31-mini-story",
    lessonNumber: 8,
    pageNumber: 31,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-p-1", label: "Papá y Pepe aman a mamá." },
      { id: "story-p-2", label: "Pupi ama a papá." },
      { id: "story-p-3", label: "Yo amo a mamá y a papá." },
      { id: "story-p-4", label: "Mi papá ama a Pupi." },
      { id: "story-p-5", label: "Papá y mamá me aman." }
    ],
    targets: [],
    sightWords: [
      "yo", "y", "a", "me", "Mi"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for P.",
    sourcePage: getBookPageImage(31)
  },
  {
    id: "l8-p32-fill-in-blank",
    lessonNumber: 8,
    pageNumber: 32,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — P p",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-pa", label: "pa" },
      { id: "syl-pa-accent", label: "pá" },
      { id: "syl-pe", label: "pe" },
      { id: "syl-Pe-cap", label: "Pe" },
      { id: "syl-pi", label: "pi" },
      { id: "syl-pi-accent", label: "pí" },
      { id: "syl-po", label: "po" },
      { id: "syl-pu", label: "pu" },
      { id: "syl-Ma-cap", label: "Ma" }
    ],
    targets: [
      {
        id: "blank-papa",
        label: "pa___",
        hint: "pa - pá",
        correctSyllable: "pá",
        fullWord: "papá",
        coordinatesVerified: false,
        acceptsItemId: "syl-pa-accent"
      },
      {
        id: "blank-mapa",
        label: "ma___",
        hint: "pa - po",
        correctSyllable: "pa",
        fullWord: "mapa",
        coordinatesVerified: false,
        acceptsItemId: "syl-pa"
      },
      {
        id: "blank-puma",
        label: "___ma",
        hint: "pe - pu",
        correctSyllable: "pu",
        fullWord: "puma",
        coordinatesVerified: false,
        acceptsItemId: "syl-pu"
      },
      {
        id: "blank-mapi",
        label: "Ma___",
        hint: "pi - po",
        correctSyllable: "pi",
        fullWord: "Mapi",
        coordinatesVerified: false,
        acceptsItemId: "syl-pi"
      },
      {
        id: "blank-pio",
        label: "___o",
        hint: "pí - po",
        correctSyllable: "pí",
        fullWord: "pío",
        coordinatesVerified: false,
        acceptsItemId: "syl-pi-accent"
      },
      {
        id: "blank-pepe",
        label: "___pe",
        hint: "Pe - pe",
        correctSyllable: "Pe",
        fullWord: "Pepe",
        coordinatesVerified: false,
        acceptsItemId: "syl-Pe-cap"
      }
    ],
    exercises: [
      {
        partial: "pa___",
        choices: ["pa", "pá"],
        answer: "pá",
        fullWord: "papá"
      },
      {
        partial: "ma___",
        choices: ["pa", "po"],
        answer: "pa",
        fullWord: "mapa"
      },
      {
        partial: "___ma",
        choices: ["pe", "pu"],
        answer: "pu",
        fullWord: "puma"
      },
      {
        partial: "Ma___",
        choices: ["pi", "po"],
        answer: "pi",
        fullWord: "Mapi"
      },
      {
        partial: "___o",
        choices: ["pí", "po"],
        answer: "pí",
        fullWord: "pío"
      },
      {
        partial: "___pe",
        choices: ["Pe", "pe"],
        answer: "Pe",
        fullWord: "Pepe"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for P.",
    sourcePage: getBookPageImage(32)
  },
  {
    id: "l8-p32-write-sentences",
    lessonNumber: 8,
    pageNumber: 32,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones usando las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(32)
  }
];
