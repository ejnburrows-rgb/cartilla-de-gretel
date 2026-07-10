import { getBookPageImage } from "@/lib/bookImages";

export const lesson21 = [
  {
    id: "l21-p81-letter-tracing",
    lessonNumber: 21,
    pageNumber: 81,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — J j",
    prompt: "Traza la letra J mayúscula y la j minúscula. Luego haz un dibujo de una palabra que comienza con j.",
    items: [
      { id: "letter-J", label: "J" },
      { id: "letter-j", label: "j" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase and lowercase j.",
    sourcePage: getBookPageImage(81)
  },
  {
    id: "l21-p82-syllable-circle",
    lessonNumber: 21,
    pageNumber: 82,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — J j",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-ja", label: "ja" },
      { id: "syl-je", label: "je" },
      { id: "syl-ji", label: "ji" },
      { id: "syl-jo", label: "jo" },
      { id: "syl-ju", label: "ju" }
    ],
    targets: [
      { id: "slot-ja", label: "ja", coordinatesVerified: false, acceptsItemId: "syl-ja" },
      { id: "slot-je", label: "je", coordinatesVerified: false, acceptsItemId: "syl-je" },
      { id: "slot-ji", label: "ji", coordinatesVerified: false, acceptsItemId: "syl-ji" },
      { id: "slot-jo", label: "jo", coordinatesVerified: false, acceptsItemId: "syl-jo" },
      { id: "slot-ju", label: "ju", coordinatesVerified: false, acceptsItemId: "syl-ju" }
    ],
    wordBank: [
      "jaba", "jabón", "jamás", "jarra", "jamón", "baja", "Jesús", "jefe", "baje", "jefatura", "jerez", "ajeno", "jicotea", "jíbaro", "jirafa", "ají", "ajillo", "jinete", "jobo", "José", "bajo", "ajo", "jota", "jorobado", "júbilo", "Julio", "jutía", "juventud", "jugo", "jugar"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for j.",
    sourcePage: getBookPageImage(82)
  },
  {
    id: "l21-p83-syllable-tap",
    lessonNumber: 21,
    pageNumber: 83,
    kind: "read-aloud",
    title: "Sílabas con J — página Jj",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-ja", label: "ja" },
      { id: "ra-je", label: "je" },
      { id: "ra-ji", label: "ji" },
      { id: "ra-jo", label: "jo" },
      { id: "ra-ju", label: "ju" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for j.",
    sourcePage: getBookPageImage(83)
  },
  {
    id: "l21-p83-word-bank",
    lessonNumber: 21,
    pageNumber: 83,
    kind: "listen-and-tap",
    title: "Palabras con J",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-jaba-0", label: "jaba" },
      { id: "w-jicotea-1", label: "jicotea" },
      { id: "w-aji-2", label: "ají" },
      { id: "w-baja-3", label: "baja" },
      { id: "w-jura-4", label: "jura" },
      { id: "w-jinete-5", label: "jinete" },
      { id: "w-jabon-6", label: "jabón" },
      { id: "w-vieja-7", label: "vieja" },
      { id: "w-jefe-8", label: "jefe" },
      { id: "w-jesus-9", label: "Jesús" },
      { id: "w-jamon-10", label: "jamón" },
      { id: "w-jose-11", label: "José" },
      { id: "w-julia-12", label: "Julia" },
      { id: "w-jarro-13", label: "jarro" },
      { id: "w-joven-14", label: "joven" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for j.",
    sourcePage: getBookPageImage(83)
  },
  {
    id: "l21-p83-mini-story",
    lessonNumber: 21,
    pageNumber: 83,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-j-1", label: "Jesús y Julia son amigos. A José le gusta" },
      { id: "story-j-2", label: "el jamón y a Julia le gusta el jugo de" },
      { id: "story-j-3", label: "tomate. Juan tiene una jutía y la baña con" },
      { id: "story-j-4", label: "jabón. José y Josefa juegan en la" },
      { id: "story-j-5", label: "laguna. Jabela es una jicotea." },
      { id: "story-j-6", label: "A Jabela le gusta la laguna. A Jabela" },
      { id: "story-j-7", label: "no le gusta la espuma de jabón." }
    ],
    targets: [],
    sightWords: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for j.",
    sourcePage: getBookPageImage(83)
  },
  {
    id: "l21-p84-fill-in-blank",
    lessonNumber: 21,
    pageNumber: 84,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — J j",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-ja-0", label: "ja" },
      { id: "syl-jo-1", label: "jo" },
      { id: "syl-ju-2", label: "ju" },
      { id: "syl-je-3", label: "je" },
      { id: "syl-ji-4", label: "ji" }
    ],
    targets: [
      {
        id: "blank-jaba-0",
        label: "___ba",
        hint: "ja - jo",
        correctSyllable: "ja",
        fullWord: "jaba",
        coordinatesVerified: false,
        acceptsItemId: "syl-ja-0"
      },
      {
        id: "blank-jugo-1",
        label: "___go",
        hint: "ju - je",
        correctSyllable: "ju",
        fullWord: "jugo",
        coordinatesVerified: false,
        acceptsItemId: "syl-ju-2"
      },
      {
        id: "blank-jamon-2",
        label: "___món",
        hint: "ja - ju",
        correctSyllable: "ja",
        fullWord: "jamón",
        coordinatesVerified: false,
        acceptsItemId: "syl-ja-0"
      },
      {
        id: "blank-jefe-3",
        label: "___fe",
        hint: "je - ja",
        correctSyllable: "je",
        fullWord: "jefe",
        coordinatesVerified: false,
        acceptsItemId: "syl-je-3"
      },
      {
        id: "blank-jugar-4",
        label: "___gar",
        hint: "ju - je",
        correctSyllable: "ju",
        fullWord: "jugar",
        coordinatesVerified: false,
        acceptsItemId: "syl-ju-2"
      },
      {
        id: "blank-jutia-5",
        label: "___tía",
        hint: "ju - ji",
        correctSyllable: "ju",
        fullWord: "jutía",
        coordinatesVerified: false,
        acceptsItemId: "syl-ju-2"
      }
    ],
    exercises: [
      {
        partial: "___ba",
        choices: ["ja","jo"],
        answer: "ja",
        fullWord: "jaba"
      },
      {
        partial: "___go",
        choices: ["ju","je"],
        answer: "ju",
        fullWord: "jugo"
      },
      {
        partial: "___món",
        choices: ["ja","ju"],
        answer: "ja",
        fullWord: "jamón"
      },
      {
        partial: "___fe",
        choices: ["je","ja"],
        answer: "je",
        fullWord: "jefe"
      },
      {
        partial: "___gar",
        choices: ["ju","je"],
        answer: "ju",
        fullWord: "jugar"
      },
      {
        partial: "___tía",
        choices: ["ju","ji"],
        answer: "ju",
        fullWord: "jutía"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for j.",
    sourcePage: getBookPageImage(84)
  },
  {
    id: "l21-p84-write-sentences",
    lessonNumber: 21,
    pageNumber: 84,
    kind: "letter-tracing",
    title: "Escribe oraciones…",
    prompt: "Escribe oraciones…",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(84)
  }
];
