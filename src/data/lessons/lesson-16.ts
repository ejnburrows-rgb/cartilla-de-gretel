import { getBookPageImage } from "@/lib/bookImages";

export const lesson16 = [
  {
    id: "l16-p61-letter-tracing",
    lessonNumber: 16,
    pageNumber: 61,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra.",
    prompt: "Haz un dibujo que represente una palabra que comienza con v.",
    items: [
      { id: "letter-V", label: "V" },
      { id: "letter-v", label: "v" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded letter tracing for V.",
    sourcePage: getBookPageImage(61)
  },
  {
    id: "l16-p62-syllable-circle",
    lessonNumber: 16,
    pageNumber: 62,
    kind: "drag-syllable-to-slot",
    title: "Encierra en un círculo la sílaba correspondiente.",
    prompt: "Encierra en un círculo la sílaba correspondiente.",
    items: [
      { id: "syl-va", label: "va" },
      { id: "syl-ve", label: "ve" },
      { id: "syl-vi", label: "vi" },
      { id: "syl-vo", label: "vo" },
      { id: "syl-vu", label: "vu" }
    ],
    targets: [
      { id: "slot-va", label: "va", coordinatesVerified: false, acceptsItemId: "syl-va" },
      { id: "slot-ve", label: "ve", coordinatesVerified: false, acceptsItemId: "syl-ve" },
      { id: "slot-vi", label: "vi", coordinatesVerified: false, acceptsItemId: "syl-vi" },
      { id: "slot-vo", label: "vo", coordinatesVerified: false, acceptsItemId: "syl-vo" },
      { id: "slot-vu", label: "vu", coordinatesVerified: false, acceptsItemId: "syl-vu" }
    ],
    wordBank: [
      "vaso", "lavamos", "vámonos", "lava", "nieva", "lavamanos",
      "venado", "ave", "vela", "venas", "velo", "nave",
      "vino", "vivo", "vidente", "vine", "aviso", "vitamina",
      "lavo", "vivo", "pavo", "clavo", "volar", "Tavo",
      "vuela", "vuelta", "vuelan", "vuelo", "revuelta", "revuelo"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for V.",
    sourcePage: getBookPageImage(62)
  },
  {
    id: "l16-p63-syllable-tap",
    lessonNumber: 16,
    pageNumber: 63,
    kind: "read-aloud",
    title: "Vv",
    prompt: "Vv",
    items: [
      { id: "ra-va-0", label: "va" },
      { id: "ra-ve-1", label: "ve" },
      { id: "ra-vi-2", label: "vi" },
      { id: "ra-vo-3", label: "vo" },
      { id: "ra-vu-4", label: "vu" },
      { id: "ra-vu-5", label: "vu" },
      { id: "ra-vo-6", label: "vo" },
      { id: "ra-va-7", label: "va" },
      { id: "ra-ve-8", label: "ve" },
      { id: "ra-vi-9", label: "vi" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for V.",
    sourcePage: getBookPageImage(63)
  },
  {
    id: "l16-p63-word-bank",
    lessonNumber: 16,
    pageNumber: 63,
    kind: "listen-and-tap",
    title: "Palabras",
    prompt: "Palabras",
    items: [
      { id: "w-vaso-0", label: "vaso" },
      { id: "w-avena-1", label: "avena" },
      { id: "w-vivo-2", label: "vivo" },
      { id: "w-vela-3", label: "vela" },
      { id: "w-ventana-4", label: "ventana" },
      { id: "w-vive-5", label: "vive" },
      { id: "w-vale-6", label: "vale" },
      { id: "w-pavo-7", label: "pavo" },
      { id: "w-vine-8", label: "vine" },
      { id: "w-vino-9", label: "vino" },
      { id: "w-lava-10", label: "lava" },
      { id: "w-vuli-11", label: "Vuli" },
      { id: "w-venas-12", label: "venas" },
      { id: "w-lavamanos-13", label: "lavamanos" },
      { id: "w-ven-14", label: "ven" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for V.",
    sourcePage: getBookPageImage(63)
  },
  {
    id: "l16-p63-mini-story",
    lessonNumber: 16,
    pageNumber: 63,
    kind: "mini-story",
    title: "Cuento",
    prompt: "Cuento",
    items: [
      { id: "story-v-1", label: "La nieve se va. Vita se lava" },
      { id: "story-v-2", label: "las manos en el lavamanos." },
      { id: "story-v-3", label: "Mamá lava las mesas del patio." },
      { id: "story-v-4", label: "Mamá pone unos manteles nuevos." },
      { id: "story-v-5", label: "El viento mueve los manteles de mamá y mueve el papalote de Valentín." },
      { id: "story-v-6", label: "El papalote vuela y vuela." }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for V.",
    sourcePage: getBookPageImage(63)
  },
  {
    id: "l16-p64-fill-in-blank",
    lessonNumber: 16,
    pageNumber: 64,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras con la sílaba correcta.",
    prompt: "Completa las palabras con la sílaba correcta.",
    items: [
      { id: "syl-ve-0", label: "ve" },
      { id: "syl-vu-1", label: "vu" },
      { id: "syl-va-2", label: "va" },
      { id: "syl-vo-3", label: "vo" },
      { id: "syl-vi-4", label: "vi" }
    ],
    targets: [
      {
        id: "blank-nave-0",
        label: "na___",
        hint: "ve - vu",
        correctSyllable: "ve",
        fullWord: "nave",
        coordinatesVerified: false,
        acceptsItemId: "syl-ve-0"
      },
      {
        id: "blank-vaso-1",
        label: "___so",
        hint: "va - vo",
        correctSyllable: "va",
        fullWord: "vaso",
        coordinatesVerified: false,
        acceptsItemId: "syl-va-2"
      },
      {
        id: "blank-vela-2",
        label: "___la",
        hint: "vi - ve",
        correctSyllable: "ve",
        fullWord: "vela",
        coordinatesVerified: false,
        acceptsItemId: "syl-ve-0"
      },
      {
        id: "blank-pavo-3",
        label: "pa___",
        hint: "vo - vu",
        correctSyllable: "vo",
        fullWord: "pavo",
        coordinatesVerified: false,
        acceptsItemId: "syl-vo-3"
      },
      {
        id: "blank-vine-4",
        label: "___ne",
        hint: "va - vi",
        correctSyllable: "vi",
        fullWord: "vine",
        coordinatesVerified: false,
        acceptsItemId: "syl-vi-4"
      },
      {
        id: "blank-aviso-5",
        label: "a___so",
        hint: "vi - vo",
        correctSyllable: "vi",
        fullWord: "aviso",
        coordinatesVerified: false,
        acceptsItemId: "syl-vi-4"
      }
    ],
    exercises: [
      {
        partial: "na___",
        choices: ["ve", "vu"],
        answer: "ve",
        fullWord: "nave"
      },
      {
        partial: "___so",
        choices: ["va", "vo"],
        answer: "va",
        fullWord: "vaso"
      },
      {
        partial: "___la",
        choices: ["vi", "ve"],
        answer: "ve",
        fullWord: "vela"
      },
      {
        partial: "pa___",
        choices: ["vo", "vu"],
        answer: "vo",
        fullWord: "pavo"
      },
      {
        partial: "___ne",
        choices: ["va", "vi"],
        answer: "vi",
        fullWord: "vine"
      },
      {
        partial: "a___so",
        choices: ["vi", "vo"],
        answer: "vi",
        fullWord: "aviso"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for V.",
    sourcePage: getBookPageImage(64)
  },
  {
    id: "l16-p64-write-sentences",
    lessonNumber: 16,
    pageNumber: 64,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones. Usa las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(64)
  }
];
