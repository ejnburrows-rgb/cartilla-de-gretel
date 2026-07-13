import { getBookPageImage } from "@/lib/bookImages";

export const lesson17 = [
  {
    id: "l17-p59-picture-vocab",
    lessonNumber: 17,
    pageNumber: 59,
    kind: "listen-and-tap",
    title: "Rr",
    prompt: "Presiona el dibujo de la palabra que escuchas.",
    items: [
      { id: "img-rana", label: "rana" },
      { id: "img-remos", label: "remos" },
      { id: "img-rita", label: "Rita" },
      { id: "img-rosa", label: "rosa" },
      { id: "img-rueda", label: "rueda" }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Transcribed verbatim from public/cartilla/images/source/r/r-page-37.jpg (real scan).",
    sourcePage: getBookPageImage(59)
  },
  {
    id: "l17-p60-syllable-tap",
    lessonNumber: 17,
    pageNumber: 60,
    kind: "read-aloud",
    title: "Rr",
    prompt: "ra re ri ro ru",
    items: [
      { id: "ra-ra", label: "ra" },
      { id: "ra-re", label: "re" },
      { id: "ra-ri", label: "ri" },
      { id: "ra-ro", label: "ro" },
      { id: "ra-ru", label: "ru" }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Transcribed verbatim from public/cartilla/images/source/r/r-page-38.jpg (real scan).",
    sourcePage: getBookPageImage(60)
  },
  {
    id: "l17-p60-word-bank",
    lessonNumber: 17,
    pageNumber: 60,
    kind: "listen-and-tap",
    title: "Palabras",
    prompt: "Palabras",
    items: [
      { id: "w-ramo", label: "ramo" },
      { id: "w-rosa", label: "rosa" },
      { id: "w-risa", label: "risa" },
      { id: "w-rata", label: "rata" },
      { id: "w-roto", label: "roto" },
      { id: "w-remo", label: "remo" },
      { id: "w-rana", label: "rana" },
      { id: "w-ruta", label: "ruta" },
      { id: "w-rita", label: "Rita" },
      { id: "w-roma", label: "Roma" },
      { id: "w-ropa", label: "ropa" },
      { id: "w-rosado", label: "rosado" },
      { id: "w-rulo", label: "rulo" },
      { id: "w-rolo", label: "Rolo" },
      { id: "w-rebano", label: "rebaño" }
    ],
    targets: [],
    sightWords: ["bien"],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Word list + sight word 'bien' transcribed verbatim from public/cartilla/images/source/r/r-page-38.jpg (real scan).",
    sourcePage: getBookPageImage(60)
  },
  {
    id: "l17-p60-mini-story",
    lessonNumber: 17,
    pageNumber: 60,
    kind: "mini-story",
    title: "Cuento",
    prompt: "Cuento",
    items: [
      { id: "story-r-1", label: "La bola de Roberto rueda bien. Rolo" },
      { id: "story-r-2", label: "patea la bola. La bola rueda y le da a" },
      { id: "story-r-3", label: "un bolo. El bolo se rompe y Roberto se" },
      { id: "story-r-4", label: "ríe. Rolo se ríe también." },
      { id: "story-r-5", label: "Rita le da al bolo. Rita se ríe." },
      { id: "story-r-6", label: "Rolo y Roberto se ríen también." }
    ],
    targets: [],
    sightWords: ["bien"],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Reading passage transcribed verbatim from public/cartilla/images/source/r/r-page-38.jpg (real scan).",
    sourcePage: getBookPageImage(60)
  },
  {
    id: "l17-p61-rhyme",
    lessonNumber: 17,
    pageNumber: 61,
    kind: "mini-story",
    title: "La rosca de Manolo",
    prompt: "Rima",
    items: [
      { id: "rhyme-r-1", label: "La r para la rama" },
      { id: "rhyme-r-2", label: "para el roer del ratón" },
      { id: "rhyme-r-3", label: "y para el rabo del mono" },
      { id: "rhyme-r-4", label: "risueño y remolón." },
      { id: "rhyme-r-5", label: "Para la rueda redonda" },
      { id: "rhyme-r-6", label: "la risa de tío Rolo" },
      { id: "rhyme-r-7", label: "la rana, el remo, la rosa" },
      { id: "rhyme-r-8", label: "y la rosca de Manolo." }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Rhyme transcribed verbatim from public/cartilla/images/source/r/r-page-39.jpg (real scan).",
    sourcePage: getBookPageImage(61)
  },
  {
    id: "l17-p62-fill-in-blank",
    lessonNumber: 17,
    pageNumber: 62,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras con la sílaba correcta.",
    prompt: "Completa las palabras con la sílaba correcta.",
    items: [
      { id: "syl-ra", label: "ra" },
      { id: "syl-re", label: "re" },
      { id: "syl-ri", label: "ri" },
      { id: "syl-ro", label: "ro" },
      { id: "syl-ru", label: "ru" }
    ],
    targets: [
      { id: "blank-rana", label: "___na", hint: "ru - ra", correctSyllable: "ra", fullWord: "rana", coordinatesVerified: false, acceptsItemId: "syl-ra" },
      { id: "blank-rita", label: "___ta", hint: "Ri - re", correctSyllable: "ri", fullWord: "Rita", coordinatesVerified: false, acceptsItemId: "syl-ri" },
      { id: "blank-ruta", label: "___ta", hint: "ru - ra", correctSyllable: "ru", fullWord: "ruta", coordinatesVerified: false, acceptsItemId: "syl-ru" },
      { id: "blank-remo", label: "___mo", hint: "re - ro", correctSyllable: "re", fullWord: "remo", coordinatesVerified: false, acceptsItemId: "syl-re" },
      { id: "blank-rosa", label: "___sa", hint: "ro - ri", correctSyllable: "ro", fullWord: "rosa", coordinatesVerified: false, acceptsItemId: "syl-ro" },
      { id: "blank-rubio", label: "___bio", hint: "re - ru", correctSyllable: "ru", fullWord: "rubio", coordinatesVerified: false, acceptsItemId: "syl-ru" }
    ],
    exercises: [
      { partial: "___na", choices: ["ru", "ra"], answer: "ra", fullWord: "rana" },
      { partial: "___ta", choices: ["Ri", "re"], answer: "Ri", fullWord: "Rita" },
      { partial: "___ta", choices: ["ru", "ra"], answer: "ru", fullWord: "ruta" },
      { partial: "___mo", choices: ["re", "ro"], answer: "re", fullWord: "remo" },
      { partial: "___sa", choices: ["ro", "ri"], answer: "ro", fullWord: "rosa" },
      { partial: "___bio", choices: ["re", "ru"], answer: "ru", fullWord: "rubio" }
    ],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Fill-in-blank transcribed verbatim from public/cartilla/images/source/r/r-page-40.jpg (real scan; physical page 62 confirmed printed on the page).",
    sourcePage: getBookPageImage(62)
  },
  {
    id: "l17-p62-write-sentences",
    lessonNumber: 17,
    pageNumber: 62,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones. Usa las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Sentence writing lines, confirmed present on public/cartilla/images/source/r/r-page-40.jpg (real scan).",
    sourcePage: getBookPageImage(62)
  }
];
