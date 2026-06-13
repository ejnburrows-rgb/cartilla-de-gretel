import { getBookPageImage } from "@/lib/bookImages";

export const lesson13 = [
  {
    id: "l13-p49-letter-tracing",
    lessonNumber: 13,
    pageNumber: 49,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra.",
    prompt: "Haz un dibujo que represente una palabra que comienza con n.",
    items: [
      { id: "letter-N", label: "N" },
      { id: "letter-n", label: "n" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded letter tracing for N.",
    sourcePage: getBookPageImage(49)
  },
  {
    id: "l13-p50-syllable-circle",
    lessonNumber: 13,
    pageNumber: 50,
    kind: "drag-syllable-to-slot",
    title: "Encierra en un círculo la sílaba correspondiente.",
    prompt: "Encierra en un círculo la sílaba correspondiente.",
    items: [
      { id: "syl-na", label: "na" },
      { id: "syl-ne", label: "ne" },
      { id: "syl-ni", label: "ni" },
      { id: "syl-no", label: "no" },
      { id: "syl-nu", label: "nu" }
    ],
    targets: [
      { id: "slot-na", label: "na", coordinatesVerified: false, acceptsItemId: "syl-na" },
      { id: "slot-ne", label: "ne", coordinatesVerified: false, acceptsItemId: "syl-ne" },
      { id: "slot-ni", label: "ni", coordinatesVerified: false, acceptsItemId: "syl-ni" },
      { id: "slot-no", label: "no", coordinatesVerified: false, acceptsItemId: "syl-no" },
      { id: "slot-nu", label: "nu", coordinatesVerified: false, acceptsItemId: "syl-nu" }
    ],
    wordBank: [
      "nata", "nariz", "tina", "nada", "Napi", "lana",
      "Nena", "negro", "Nela", "tenedor", "negar", "Nenita",
      "nido", "niño", "poni", "sonido", "anida", "Nino",
      "mono", "Nora", "pino", "Nono", "noche", "mano",
      "nudo", "menudo", "nulo", "Anuca", "anudo", "nube"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for N.",
    sourcePage: getBookPageImage(50)
  },
  {
    id: "l13-p51-syllable-tap",
    lessonNumber: 13,
    pageNumber: 51,
    kind: "read-aloud",
    title: "Nn",
    prompt: "Nn",
    items: [
      { id: "ra-na-0", label: "na" },
      { id: "ra-ne-1", label: "ne" },
      { id: "ra-ni-2", label: "ni" },
      { id: "ra-no-3", label: "no" },
      { id: "ra-nu-4", label: "nu" },
      { id: "ra-nu-5", label: "nu" },
      { id: "ra-no-6", label: "no" },
      { id: "ra-na-7", label: "na" },
      { id: "ra-ne-8", label: "ne" },
      { id: "ra-ni-9", label: "ni" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for N.",
    sourcePage: getBookPageImage(51)
  },
  {
    id: "l13-p51-word-bank",
    lessonNumber: 13,
    pageNumber: 51,
    kind: "listen-and-tap",
    title: "Palabras",
    prompt: "Palabras",
    items: [
      { id: "w-nido-0", label: "nido" },
      { id: "w-tina-1", label: "tina" },
      { id: "w-nada-2", label: "nada" },
      { id: "w-nene-3", label: "nené" },
      { id: "w-mano-4", label: "mano" },
      { id: "w-nulo-5", label: "nulo" },
      { id: "w-nono-6", label: "Nono" },
      { id: "w-tono-7", label: "Tono" },
      { id: "w-alina-8", label: "Alina" },
      { id: "w-poni-9", label: "poni" },
      { id: "w-nena-10", label: "Nena" },
      { id: "w-nata-11", label: "nata" },
      { id: "w-mono-12", label: "mono" },
      { id: "w-luna-13", label: "luna" },
      { id: "w-neli-14", label: "Neli" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for N.",
    sourcePage: getBookPageImage(51)
  },
  {
    id: "l13-p51-mini-story",
    lessonNumber: 13,
    pageNumber: 51,
    kind: "mini-story",
    title: "Cuento",
    prompt: "Cuento",
    items: [
      { id: "story-n-1", label: "Tomás dame esa tina. La tina es de Napi." },
      { id: "story-n-2", label: "Tono y Alina aman a Napi." },
      { id: "story-n-3", label: "Napi tiene pelo." },
      { id: "story-n-4", label: "Tono le pone la tina a Napi en el piso." },
      { id: "story-n-5", label: "Nono no le pone nada a esa tina." },
      { id: "story-n-6", label: "Esa tina no tiene nada." }
    ],
    targets: [],
    sightWords: [
      "esa", "a"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for N.",
    sourcePage: getBookPageImage(51)
  },
  {
    id: "l13-p52-fill-in-blank",
    lessonNumber: 13,
    pageNumber: 52,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras con la sílaba correcta.",
    prompt: "Completa las palabras con la sílaba correcta.",
    items: [
      { id: "syl-no-0", label: "no" },
      { id: "syl-ni-1", label: "ni" },
      { id: "syl-nu-2", label: "nu" },
      { id: "syl-na-3", label: "na" },
      { id: "syl-ne-4", label: "ne" }
    ],
    targets: [
      {
        id: "blank-nido-0",
        label: "___do",
        hint: "no - ni",
        correctSyllable: "ni",
        fullWord: "nido",
        coordinatesVerified: false,
        acceptsItemId: "syl-ni-1"
      },
      {
        id: "blank-tina-1",
        label: "ti___",
        hint: "nu - na",
        correctSyllable: "na",
        fullWord: "tina",
        coordinatesVerified: false,
        acceptsItemId: "syl-na-3"
      },
      {
        id: "blank-suena-2",
        label: "sue___",
        hint: "ni - na",
        correctSyllable: "na",
        fullWord: "suena",
        coordinatesVerified: false,
        acceptsItemId: "syl-na-3"
      },
      {
        id: "blank-mono-3",
        label: "mo___",
        hint: "no - ne",
        correctSyllable: "no",
        fullWord: "mono",
        coordinatesVerified: false,
        acceptsItemId: "syl-no-0"
      },
      {
        id: "blank-sano-4",
        label: "sa___",
        hint: "no - nu",
        correctSyllable: "no",
        fullWord: "sano",
        coordinatesVerified: false,
        acceptsItemId: "syl-no-0"
      },
      {
        id: "blank-pone-5",
        label: "po___",
        hint: "ne - ni",
        correctSyllable: "ne",
        fullWord: "pone",
        coordinatesVerified: false,
        acceptsItemId: "syl-ne-4"
      }
    ],
    exercises: [
      {
        partial: "___do",
        choices: ["no", "ni"],
        answer: "ni",
        fullWord: "nido"
      },
      {
        partial: "ti___",
        choices: ["nu", "na"],
        answer: "na",
        fullWord: "tina"
      },
      {
        partial: "sue___",
        choices: ["ni", "na"],
        answer: "na",
        fullWord: "suena"
      },
      {
        partial: "mo___",
        choices: ["no", "ne"],
        answer: "no",
        fullWord: "mono"
      },
      {
        partial: "sa___",
        choices: ["no", "nu"],
        answer: "no",
        fullWord: "sano"
      },
      {
        partial: "po___",
        choices: ["ne", "ni"],
        answer: "ne",
        fullWord: "pone"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for N.",
    sourcePage: getBookPageImage(52)
  },
  {
    id: "l13-p52-write-sentences",
    lessonNumber: 13,
    pageNumber: 52,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones. Usa las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(52)
  }
];
