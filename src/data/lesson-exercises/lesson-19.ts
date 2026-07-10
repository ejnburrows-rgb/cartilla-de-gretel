import { getBookPageImage } from "@/lib/bookImages";

export const lesson19 = [
  {
    id: "l19-p73-letter-tracing",
    lessonNumber: 19,
    pageNumber: 73,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — G g",
    prompt: "Traza la letra G mayúscula y la g minúscula. Luego haz un dibujo de una palabra que comienza con g.",
    items: [
      { id: "letter-G", label: "G" },
      { id: "letter-g", label: "g" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase and lowercase g.",
    sourcePage: getBookPageImage(73)
  },
  {
    id: "l19-p74-syllable-circle",
    lessonNumber: 19,
    pageNumber: 74,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — G g",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-ga", label: "ga" },
      { id: "syl-go", label: "go" },
      { id: "syl-gu", label: "gu" }
    ],
    targets: [
      { id: "slot-ga", label: "ga", coordinatesVerified: false, acceptsItemId: "syl-ga" },
      { id: "slot-go", label: "go", coordinatesVerified: false, acceptsItemId: "syl-go" },
      { id: "slot-gu", label: "gu", coordinatesVerified: false, acceptsItemId: "syl-gu" }
    ],
    wordBank: [
      "garras", "gasolina", "gato", "paga", "ganas", "maga", "goma", "gorra", "lago", "gota", "mago", "goloso", "gusano", "gula", "agudo", "mangú", "laguna", "aguja"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for g.",
    sourcePage: getBookPageImage(74)
  },
  {
    id: "l19-p75-syllable-tap",
    lessonNumber: 19,
    pageNumber: 75,
    kind: "read-aloud",
    title: "Sílabas con G — página Gg",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-ga", label: "ga" },
      { id: "ra-go", label: "go" },
      { id: "ra-gu", label: "gu" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for g.",
    sourcePage: getBookPageImage(75)
  },
  {
    id: "l19-p75-word-bank",
    lessonNumber: 19,
    pageNumber: 75,
    kind: "listen-and-tap",
    title: "Palabras con G",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-gato-0", label: "gato" },
      { id: "w-gustavo-1", label: "Gustavo" },
      { id: "w-gotero-2", label: "gotero" },
      { id: "w-goma-3", label: "goma" },
      { id: "w-mago-4", label: "mago" },
      { id: "w-laguna-5", label: "laguna" },
      { id: "w-magali-6", label: "Magali" },
      { id: "w-lago-7", label: "lago" },
      { id: "w-golosina-8", label: "golosina" },
      { id: "w-ganas-9", label: "ganas" },
      { id: "w-agua-10", label: "agua" },
      { id: "w-gorra-11", label: "gorra" },
      { id: "w-gusta-12", label: "gusta" },
      { id: "w-gusano-13", label: "gusano" },
      { id: "w-gondola-14", label: "góndola" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for g.",
    sourcePage: getBookPageImage(75)
  },
  {
    id: "l19-p75-mini-story",
    lessonNumber: 19,
    pageNumber: 75,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-g-1", label: "El gato de Magali bebe agua en el lago." },
      { id: "story-g-2", label: "Magali le pone una gorra a su gato Goloso." },
      { id: "story-g-3", label: "Goloso ve a Musulunga, la gata gordita." },
      { id: "story-g-4", label: "Magali y Gustavo van al lago. En el lago" },
      { id: "story-g-5", label: "ven el agua. A Magali le gusta el agua." },
      { id: "story-g-6", label: "Goloso y Musulunga van a la laguna." },
      { id: "story-g-7", label: "Goloso le regala un gusanito rosadito a" },
      { id: "story-g-8", label: "Musulunga." }
    ],
    targets: [],
    sightWords: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for g.",
    sourcePage: getBookPageImage(75)
  },
  {
    id: "l19-p76-fill-in-blank",
    lessonNumber: 19,
    pageNumber: 76,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — G g",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-gu-0", label: "gu" },
      { id: "syl-go-1", label: "go" },
      { id: "syl-ga-2", label: "ga" }
    ],
    targets: [
      {
        id: "blank-aguja-0",
        label: "a___ja",
        hint: "gu - go",
        correctSyllable: "gu",
        fullWord: "aguja",
        coordinatesVerified: false,
        acceptsItemId: "syl-gu-0"
      },
      {
        id: "blank-ganas-1",
        label: "___nas",
        hint: "ga - go",
        correctSyllable: "ga",
        fullWord: "ganas",
        coordinatesVerified: false,
        acceptsItemId: "syl-ga-2"
      },
      {
        id: "blank-mago-2",
        label: "ma___",
        hint: "go - gu",
        correctSyllable: "go",
        fullWord: "mago",
        coordinatesVerified: false,
        acceptsItemId: "syl-go-1"
      },
      {
        id: "blank-gato-3",
        label: "___to",
        hint: "ga - gu",
        correctSyllable: "ga",
        fullWord: "gato",
        coordinatesVerified: false,
        acceptsItemId: "syl-ga-2"
      },
      {
        id: "blank-goma-4",
        label: "___ma",
        hint: "gu - go",
        correctSyllable: "go",
        fullWord: "goma",
        coordinatesVerified: false,
        acceptsItemId: "syl-go-1"
      },
      {
        id: "blank-lago-5",
        label: "la___",
        hint: "go - ga",
        correctSyllable: "go",
        fullWord: "lago",
        coordinatesVerified: false,
        acceptsItemId: "syl-go-1"
      }
    ],
    exercises: [
      {
        partial: "a___ja",
        choices: ["gu","go"],
        answer: "gu",
        fullWord: "aguja"
      },
      {
        partial: "___nas",
        choices: ["ga","go"],
        answer: "ga",
        fullWord: "ganas"
      },
      {
        partial: "ma___",
        choices: ["go","gu"],
        answer: "go",
        fullWord: "mago"
      },
      {
        partial: "___to",
        choices: ["ga","gu"],
        answer: "ga",
        fullWord: "gato"
      },
      {
        partial: "___ma",
        choices: ["gu","go"],
        answer: "go",
        fullWord: "goma"
      },
      {
        partial: "la___",
        choices: ["go","ga"],
        answer: "go",
        fullWord: "lago"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for g.",
    sourcePage: getBookPageImage(76)
  },
  {
    id: "l19-p76-write-sentences",
    lessonNumber: 19,
    pageNumber: 76,
    kind: "letter-tracing",
    title: "Escribe oraciones…",
    prompt: "Escribe oraciones…",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(76)
  }
];
