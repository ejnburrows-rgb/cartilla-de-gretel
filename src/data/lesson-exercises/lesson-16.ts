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
    teacherNotes: "Students trace uppercase V and lowercase v.",
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
      "vaso", "lava", "lavamos", "nieva", "vámonos", "lavamanos",
      "venado", "venas", "ave", "velo", "vela", "nave",
      "vino", "vine", "vivo", "aviso", "vidente", "vitamina",
      "lavo", "clavo", "vivo", "volar", "pavo", "Tavo",
      "vuela", "vuelo", "vuelta", "revuelta", "vuelan", "revuelo"
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
      { id: "ra-va", label: "va" },
      { id: "ra-ve", label: "ve" },
      { id: "ra-vi", label: "vi" },
      { id: "ra-vo", label: "vo" },
      { id: "ra-vu", label: "vu" }
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
      { id: "w-vaso", label: "vaso" },
      { id: "w-vela", label: "vela" },
      { id: "w-vale", label: "vale" },
      { id: "w-vino", label: "vino" },
      { id: "w-venas", label: "venas" },
      { id: "w-avena", label: "avena" },
      { id: "w-ventana", label: "ventana" },
      { id: "w-pavo", label: "pavo" },
      { id: "w-lava", label: "lava" },
      { id: "w-lavamanos", label: "lavamanos" },
      { id: "w-vivo", label: "vivo" },
      { id: "w-vive", label: "vive" },
      { id: "w-vine", label: "vine" },
      { id: "w-vuli", label: "Vuli" },
      { id: "w-ven", label: "ven" }
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
      { id: "story-v-2", label: "las manos en el lavamanos ." },
      { id: "story-v-3", label: "Mamá lava las mesas del patio." },
      { id: "story-v-4", label: "Mamá pone unos manteles nuevos." },
      { id: "story-v-5", label: "El viento mueve los manteles de mamá y" },
      { id: "story-v-6", label: "mueve el papalote de Valentín." },
      { id: "story-v-7", label: "El papalote vuela y vuela." }
    ],
    targets: [],
    sightWords: [],
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
      { id: "syl-va", label: "va" },
      { id: "syl-ve", label: "ve" },
      { id: "syl-vi", label: "vi" },
      { id: "syl-vo", label: "vo" },
      { id: "syl-vu", label: "vu" }
    ],
    targets: [
      {
        id: "blank-nave",
        label: "na___",
        hint: "ve - vu",
        correctSyllable: "ve",
        fullWord: "nave",
        coordinatesVerified: false,
        acceptsItemId: "syl-ve"
      },
      {
        id: "blank-vaso",
        label: "___so",
        hint: "va - vo",
        correctSyllable: "va",
        fullWord: "vaso",
        coordinatesVerified: false,
        acceptsItemId: "syl-va"
      },
      {
        id: "blank-vela",
        label: "___la",
        hint: "vi - ve",
        correctSyllable: "ve",
        fullWord: "vela",
        coordinatesVerified: false,
        acceptsItemId: "syl-ve"
      },
      {
        id: "blank-pavo",
        label: "pa___",
        hint: "vo - vu",
        correctSyllable: "vo",
        fullWord: "pavo",
        coordinatesVerified: false,
        acceptsItemId: "syl-vo"
      },
      {
        id: "blank-vine",
        label: "___ne",
        hint: "va - vi",
        correctSyllable: "vi",
        fullWord: "vine",
        coordinatesVerified: false,
        acceptsItemId: "syl-vi"
      },
      {
        id: "blank-aviso",
        label: "a___so",
        hint: "vi - vo",
        correctSyllable: "vi",
        fullWord: "aviso",
        coordinatesVerified: false,
        acceptsItemId: "syl-vi"
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
    title: "Escribe oraciones…",
    prompt: "Escribe oraciones…",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(64)
  }
];
