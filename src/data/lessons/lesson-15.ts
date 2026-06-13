import { getBookPageImage } from "@/lib/bookImages";

export const lesson15 = [
  {
    id: "l15-p57-letter-tracing",
    lessonNumber: 15,
    pageNumber: 57,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra.",
    prompt: "Haz un dibujo que represente una palabra que comienza con b.",
    items: [
      { id: "letter-B", label: "B" },
      { id: "letter-b", label: "b" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase B and lowercase b.",
    sourcePage: getBookPageImage(57)
  },
  {
    id: "l15-p58-syllable-circle",
    lessonNumber: 15,
    pageNumber: 58,
    kind: "drag-syllable-to-slot",
    title: "Encierra en un círculo la sílaba correspondiente.",
    prompt: "Encierra en un círculo la sílaba correspondiente.",
    items: [
      { id: "syl-ba", label: "ba" },
      { id: "syl-be", label: "be" },
      { id: "syl-bi", label: "bi" },
      { id: "syl-bo", label: "bo" },
      { id: "syl-bu", label: "bu" }
    ],
    targets: [
      { id: "slot-ba", label: "ba", coordinatesVerified: false, acceptsItemId: "syl-ba" },
      { id: "slot-be", label: "be", coordinatesVerified: false, acceptsItemId: "syl-be" },
      { id: "slot-bi", label: "bi", coordinatesVerified: false, acceptsItemId: "syl-bi" },
      { id: "slot-bo", label: "bo", coordinatesVerified: false, acceptsItemId: "syl-bo" },
      { id: "slot-bu", label: "bu", coordinatesVerified: false, acceptsItemId: "syl-bu" }
    ],
    wordBank: [
      "baño", "bala", "batir", "batea", "abanico", "loba",
      "sube", "Bebo", "bebé", "abeja", "nube", "cubeta",
      "bebida", "cabito", "bicicleta", "bisagra", "bisonte", "cubito",
      "lobo", "bonita", "tubo", "bodega", "bola", "botella",
      "burro", "aburre", "aburrido", "bulla", "abuso", "buche"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for B.",
    sourcePage: getBookPageImage(58)
  },
  {
    id: "l15-p59-syllable-tap",
    lessonNumber: 15,
    pageNumber: 59,
    kind: "read-aloud",
    title: "Sílabas con B — página Bb",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-ba", label: "ba" },
      { id: "ra-be", label: "be" },
      { id: "ra-bi", label: "bi" },
      { id: "ra-bo", label: "bo" },
      { id: "ra-bu", label: "bu" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for B.",
    sourcePage: getBookPageImage(59)
  },
  {
    id: "l15-p59-word-bank",
    lessonNumber: 15,
    pageNumber: 59,
    kind: "listen-and-tap",
    title: "Palabras con B",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-baño", label: "baño" },
      { id: "w-bota", label: "bota" },
      { id: "w-bolo", label: "bolo" },
      { id: "w-bebe", label: "bebé" },
      { id: "w-bebo", label: "Bebo" },
      { id: "w-bonito", label: "bonito" },
      { id: "w-bueno", label: "bueno" },
      { id: "w-lobo", label: "lobo" },
      { id: "w-bate", label: "bate" },
      { id: "w-bonita", label: "bonita" },
      { id: "w-sube", label: "sube" },
      { id: "w-batea", label: "batea" },
      { id: "w-cubito", label: "cubito" },
      { id: "w-bote", label: "bote" },
      { id: "w-nube", label: "nube" },
      { id: "w-alto", label: "alto" },
      { id: "w-con", label: "con" },
      { id: "w-bueno", label: "bueno" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for B.",
    sourcePage: getBookPageImage(59)
  },
  {
    id: "l15-p59-mini-story",
    lessonNumber: 15,
    pageNumber: 59,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-b-1", label: "La nube sube y sube. Es una nube bonita." },
      { id: "story-b-2", label: "Bebo, batea la bola de Pepito." },
      { id: "story-b-3", label: "La bola sube y sube alto." },
      { id: "story-b-4", label: "La bola sube a la nube." },
      { id: "story-b-5", label: "Pepito batea la bola con el bate." },
      { id: "story-b-6", label: "La bola sube y sube alto también." },
      { id: "story-b-7", label: "Pepito es bueno en la pelota." }
    ],
    targets: [],
    sightWords: [
      "alto", "con", "bueno"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for B.",
    sourcePage: getBookPageImage(59)
  },
  {
    id: "l15-p60-fill-in-blank",
    lessonNumber: 15,
    pageNumber: 60,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras con la sílaba correcta.",
    prompt: "Completa las palabras con la sílaba correcta.",
    items: [
      { id: "syl-bu", label: "bu" },
      { id: "syl-bo", label: "bo" },
      { id: "syl-be", label: "be" },
      { id: "syl-bi", label: "bi" },
      { id: "syl-ba", label: "ba" }
    ],
    targets: [
      {
        id: "blank-cubo",
        label: "cu___",
        hint: "bu - bo",
        correctSyllable: "bo",
        fullWord: "cubo",
        coordinatesVerified: false,
        acceptsItemId: "syl-bo"
      },
      {
        id: "blank-bolo",
        label: "___lo",
        hint: "bo - be",
        correctSyllable: "bo",
        fullWord: "bolo",
        coordinatesVerified: false,
        acceptsItemId: "syl-bo"
      },
      {
        id: "blank-cubito",
        label: "cu___to",
        hint: "bo - bi",
        correctSyllable: "bi",
        fullWord: "cubito",
        coordinatesVerified: false,
        acceptsItemId: "syl-bi"
      },
      {
        id: "blank-batido",
        label: "___tido",
        hint: "be - ba",
        correctSyllable: "ba",
        fullWord: "batido",
        coordinatesVerified: false,
        acceptsItemId: "syl-ba"
      },
      {
        id: "blank-burro",
        label: "___rro",
        hint: "ba - bu",
        correctSyllable: "bu",
        fullWord: "burro",
        coordinatesVerified: false,
        acceptsItemId: "syl-bu"
      },
      {
        id: "blank-nube",
        label: "nu___",
        hint: "be - bi",
        correctSyllable: "be",
        fullWord: "nube",
        coordinatesVerified: false,
        acceptsItemId: "syl-be"
      }
    ],
    exercises: [
      {
        partial: "cu___",
        choices: ["bu", "bo"],
        answer: "bo",
        fullWord: "cubo"
      },
      {
        partial: "___lo",
        choices: ["bo", "be"],
        answer: "bo",
        fullWord: "bolo"
      },
      {
        partial: "cu___to",
        choices: ["bo", "bi"],
        answer: "bi",
        fullWord: "cubito"
      },
      {
        partial: "___tido",
        choices: ["be", "ba"],
        answer: "ba",
        fullWord: "batido"
      },
      {
        partial: "___rro",
        choices: ["ba", "bu"],
        answer: "bu",
        fullWord: "burro"
      },
      {
        partial: "nu___",
        choices: ["be", "bi"],
        answer: "be",
        fullWord: "nube"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for B.",
    sourcePage: getBookPageImage(60)
  },
  {
    id: "l15-p60-write-sentences",
    lessonNumber: 15,
    pageNumber: 60,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones. Usa las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(60)
  }
];
