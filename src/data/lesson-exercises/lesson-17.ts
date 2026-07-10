import { getBookPageImage } from "@/lib/bookImages";

export const lesson17 = [
  {
    id: "l17-p65-letter-tracing",
    lessonNumber: 17,
    pageNumber: 65,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — R r",
    prompt: "Traza la letra R mayúscula y la r minúscula. Luego haz un dibujo de una palabra que comienza con r.",
    items: [
      { id: "letter-R", label: "R" },
      { id: "letter-r", label: "r" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase and lowercase r.",
    sourcePage: getBookPageImage(65)
  },
  {
    id: "l17-p66-syllable-circle",
    lessonNumber: 17,
    pageNumber: 66,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — R r",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-ra", label: "ra" },
      { id: "syl-re", label: "re" },
      { id: "syl-ri", label: "ri" },
      { id: "syl-ro", label: "ro" },
      { id: "syl-ru", label: "ru" }
    ],
    targets: [
      { id: "slot-ra", label: "ra", coordinatesVerified: false, acceptsItemId: "syl-ra" },
      { id: "slot-re", label: "re", coordinatesVerified: false, acceptsItemId: "syl-re" },
      { id: "slot-ri", label: "ri", coordinatesVerified: false, acceptsItemId: "syl-ri" },
      { id: "slot-ro", label: "ro", coordinatesVerified: false, acceptsItemId: "syl-ro" },
      { id: "slot-ru", label: "ru", coordinatesVerified: false, acceptsItemId: "syl-ru" }
    ],
    wordBank: [
      "rana", "rama", "ratón", "rata", "raso", "remo", "reloj", "relevo", "rezo", "revista", "rema", "riña", "rima", "rimamos", "Rita", "risa", "rizo", "rosa", "roto", "Rolo", "roca", "rota", "Roberto", "ruta", "Rufino", "rubio", "ruso", "rutina", "rudo"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for r.",
    sourcePage: getBookPageImage(66)
  },
  {
    id: "l17-p67-syllable-tap",
    lessonNumber: 17,
    pageNumber: 67,
    kind: "read-aloud",
    title: "Sílabas con R — página Rr",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-ra", label: "ra" },
      { id: "ra-re", label: "re" },
      { id: "ra-ri", label: "ri" },
      { id: "ra-ro", label: "ro" },
      { id: "ra-ru", label: "ru" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for r.",
    sourcePage: getBookPageImage(67)
  },
  {
    id: "l17-p67-word-bank",
    lessonNumber: 17,
    pageNumber: 67,
    kind: "listen-and-tap",
    title: "Palabras con R",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-ramo-0", label: "ramo" },
      { id: "w-rosa-1", label: "rosa" },
      { id: "w-risa-2", label: "risa" },
      { id: "w-rata-3", label: "rata" },
      { id: "w-roto-4", label: "roto" },
      { id: "w-remo-5", label: "remo" },
      { id: "w-rana-6", label: "rana" },
      { id: "w-ruta-7", label: "ruta" },
      { id: "w-rita-8", label: "Rita" },
      { id: "w-roma-9", label: "Roma" },
      { id: "w-ropa-10", label: "ropa" },
      { id: "w-rosado-11", label: "rosado" },
      { id: "w-rulo-12", label: "rulo" },
      { id: "w-rolo-13", label: "Rolo" },
      { id: "w-rebano-14", label: "rebaño" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for r.",
    sourcePage: getBookPageImage(67)
  },
  {
    id: "l17-p67-mini-story",
    lessonNumber: 17,
    pageNumber: 67,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-r-1", label: "La bola de Roberto rueda bien." },
      { id: "story-r-2", label: "Rolo patea la bola. La bola rueda y" },
      { id: "story-r-3", label: "le da a un bolo. El bolo se rompe y" },
      { id: "story-r-4", label: "Roberto se ríe. Rolo se ríe también." },
      { id: "story-r-5", label: "Rita le da al bolo. Rita se ríe." },
      { id: "story-r-6", label: "Rolo y Roberto se ríen también." }
    ],
    targets: [],
    sightWords: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for r.",
    sourcePage: getBookPageImage(67)
  },
  {
    id: "l17-p68-fill-in-blank",
    lessonNumber: 17,
    pageNumber: 68,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — R r",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-ru-0", label: "ru" },
      { id: "syl-ra-1", label: "ra" },
      { id: "syl-Ri-2", label: "Ri" },
      { id: "syl-re-3", label: "re" },
      { id: "syl-ro-4", label: "ro" },
      { id: "syl-ri-5", label: "ri" }
    ],
    targets: [
      {
        id: "blank-rana-0",
        label: "___na",
        hint: "ru - ra",
        correctSyllable: "ra",
        fullWord: "rana",
        coordinatesVerified: false,
        acceptsItemId: "syl-ra-1"
      },
      {
        id: "blank-rita-1",
        label: "___ta",
        hint: "Ri - re",
        correctSyllable: "Ri",
        fullWord: "Rita",
        coordinatesVerified: false,
        acceptsItemId: "syl-Ri-2"
      },
      {
        id: "blank-ruta-2",
        label: "___ta",
        hint: "ru - ra",
        correctSyllable: "ru",
        fullWord: "ruta",
        coordinatesVerified: false,
        acceptsItemId: "syl-ru-0"
      },
      {
        id: "blank-remo-3",
        label: "___mo",
        hint: "re - ro",
        correctSyllable: "re",
        fullWord: "remo",
        coordinatesVerified: false,
        acceptsItemId: "syl-re-3"
      },
      {
        id: "blank-rosa-4",
        label: "___sa",
        hint: "ro - ri",
        correctSyllable: "ro",
        fullWord: "rosa",
        coordinatesVerified: false,
        acceptsItemId: "syl-ro-4"
      },
      {
        id: "blank-rubio-5",
        label: "___bio",
        hint: "re - ru",
        correctSyllable: "ru",
        fullWord: "rubio",
        coordinatesVerified: false,
        acceptsItemId: "syl-ru-0"
      }
    ],
    exercises: [
      {
        partial: "___na",
        choices: ["ru","ra"],
        answer: "ra",
        fullWord: "rana"
      },
      {
        partial: "___ta",
        choices: ["Ri","re"],
        answer: "Ri",
        fullWord: "Rita"
      },
      {
        partial: "___ta",
        choices: ["ru","ra"],
        answer: "ru",
        fullWord: "ruta"
      },
      {
        partial: "___mo",
        choices: ["re","ro"],
        answer: "re",
        fullWord: "remo"
      },
      {
        partial: "___sa",
        choices: ["ro","ri"],
        answer: "ro",
        fullWord: "rosa"
      },
      {
        partial: "___bio",
        choices: ["re","ru"],
        answer: "ru",
        fullWord: "rubio"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for r.",
    sourcePage: getBookPageImage(68)
  },
  {
    id: "l17-p68-write-sentences",
    lessonNumber: 17,
    pageNumber: 68,
    kind: "letter-tracing",
    title: "Escribe oraciones…",
    prompt: "Escribe oraciones…",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(68)
  }
];
