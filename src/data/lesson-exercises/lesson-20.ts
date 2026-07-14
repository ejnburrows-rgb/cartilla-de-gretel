import { getBookPageImage } from "@/lib/bookImages";

export const lesson20 = [
  {
    id: "l20-p71-picture-vocab",
    lessonNumber: 20,
    pageNumber: 71,
    kind: "listen-and-tap",
    title: "Ff",
    prompt: "Presiona el dibujo de la palabra que escuchas.",
    items: [
      { id: "img-foto", label: "foto" },
      { id: "img-fideos", label: "fideos" },
      { id: "img-familia", label: "familia" },
      { id: "img-felo", label: "Felo" },
      { id: "img-funda", label: "funda" }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Transcribed verbatim from public/cartilla/images/source/f/f-page-46.jpg (real scan).",
    sourcePage: getBookPageImage(71)
  },
  {
    id: "l20-p72-syllable-tap",
    lessonNumber: 20,
    pageNumber: 72,
    kind: "read-aloud",
    title: "Ff",
    prompt: "fa fe fi fo fu",
    items: [
      { id: "ra-fa", label: "fa" },
      { id: "ra-fe", label: "fe" },
      { id: "ra-fi", label: "fi" },
      { id: "ra-fo", label: "fo" },
      { id: "ra-fu", label: "fu" }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Transcribed verbatim from public/cartilla/images/source/f/f-page-47.jpg (real scan).",
    sourcePage: getBookPageImage(72)
  },
  {
    id: "l20-p72-word-bank",
    lessonNumber: 20,
    pageNumber: 72,
    kind: "listen-and-tap",
    title: "Palabras",
    prompt: "Palabras",
    items: [
      { id: "w-familia", label: "familia" },
      { id: "w-figaro", label: "Fígaro" },
      { id: "w-fama", label: "fama" },
      { id: "w-famoso", label: "famoso" },
      { id: "w-foto", label: "foto" },
      { id: "w-fino", label: "fino" },
      { id: "w-fusta", label: "fusta" },
      { id: "w-fumiga", label: "fumiga" },
      { id: "w-telefono", label: "teléfono" },
      { id: "w-feo", label: "feo" },
      { id: "w-fila", label: "fila" },
      { id: "w-falso", label: "falso" },
      { id: "w-fortuna", label: "fortuna" },
      { id: "w-ofelia", label: "Ofelia" },
      { id: "w-foca", label: "foca" }
    ],
    targets: [],
    sightWords: ["hay"],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Word list + sight word 'hay' transcribed verbatim from public/cartilla/images/source/f/f-page-47.jpg (real scan).",
    sourcePage: getBookPageImage(72)
  },
  {
    id: "l20-p72-mini-story",
    lessonNumber: 20,
    pageNumber: 72,
    kind: "mini-story",
    title: "Cuento",
    prompt: "Cuento",
    items: [
      { id: "story-f-1", label: "La familia de Ofelia va a la finca de" },
      { id: "story-f-2", label: "Felo. En la finca de Felo hay aves y" },
      { id: "story-f-3", label: "ganado. Felo arrea el ganado con" },
      { id: "story-f-4", label: "una fusta. El ganado vale una fortuna." },
      { id: "story-f-5", label: "Es un ganado de fama. Felo pone" },
      { id: "story-f-6", label: "todo el ganado en fila." }
    ],
    targets: [],
    sightWords: ["hay"],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Reading passage transcribed verbatim from public/cartilla/images/source/f/f-page-47.jpg (real scan).",
    sourcePage: getBookPageImage(72)
  },
  {
    id: "l20-p73-rhyme",
    lessonNumber: 20,
    pageNumber: 73,
    kind: "mini-story",
    title: "A la fiesta",
    prompt: "Rima",
    items: [
      { id: "rhyme-f-1", label: "A la fiesta de familia" },
      { id: "rhyme-f-2", label: "tía Fela va a invitar" },
      { id: "rhyme-f-3", label: "las velitas del pastel" },
      { id: "rhyme-f-4", label: "Fefita va a apagar." },
      { id: "rhyme-f-5", label: "Fu, fu... apaga la vela" },
      { id: "rhyme-f-6", label: "fa, fa... la vela no es mía" },
      { id: "rhyme-f-7", label: "fe, fe... apaga la vela" },
      { id: "rhyme-f-8", label: "fi, fi... la vela es de tía." }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Rhyme transcribed verbatim from public/cartilla/images/source/f/f-page-48.jpg (real scan).",
    sourcePage: getBookPageImage(73)
  },
  {
    id: "l20-p74-fill-in-blank",
    lessonNumber: 20,
    pageNumber: 74,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras con la sílaba correcta.",
    prompt: "Completa las palabras con la sílaba correcta.",
    items: [
      { id: "syl-fa", label: "fa" },
      { id: "syl-fe", label: "fe" },
      { id: "syl-fi", label: "fi" },
      { id: "syl-fo", label: "fo" },
      { id: "syl-fu", label: "fu" }
    ],
    targets: [
      { id: "blank-fama", label: "___ma", hint: "fa - fo", correctSyllable: "fa", fullWord: "fama", coordinatesVerified: false, acceptsItemId: "syl-fa" },
      { id: "blank-fila", label: "___la", hint: "fi - fe", correctSyllable: "fi", fullWord: "fila", coordinatesVerified: false, acceptsItemId: "syl-fi" },
      { id: "blank-telefono", label: "telé___no", hint: "fo - fu", correctSyllable: "fo", fullWord: "teléfono", coordinatesVerified: false, acceptsItemId: "syl-fo" },
      { id: "blank-foca", label: "___ca", hint: "fo - fi", correctSyllable: "fo", fullWord: "foca", coordinatesVerified: false, acceptsItemId: "syl-fo" },
      { id: "blank-fecha", label: "___cha", hint: "fe - fu", correctSyllable: "fe", fullWord: "fecha", coordinatesVerified: false, acceptsItemId: "syl-fe" },
      { id: "blank-foto", label: "___to", hint: "fo - fi", correctSyllable: "fo", fullWord: "foto", coordinatesVerified: false, acceptsItemId: "syl-fo" }
    ],
    exercises: [
      { partial: "___ma", choices: ["fa", "fo"], answer: "fa", fullWord: "fama" },
      { partial: "___la", choices: ["fi", "fe"], answer: "fi", fullWord: "fila" },
      { partial: "telé___no", choices: ["fo", "fu"], answer: "fo", fullWord: "teléfono" },
      { partial: "___ca", choices: ["fo", "fi"], answer: "fo", fullWord: "foca" },
      { partial: "___cha", choices: ["fe", "fu"], answer: "fe", fullWord: "fecha" },
      { partial: "___to", choices: ["fo", "fi"], answer: "fo", fullWord: "foto" }
    ],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Fill-in-blank transcribed verbatim from public/cartilla/images/source/f/f-page-49.jpg (real scan; physical page 74, 'Lección 2[0]' confirmed printed on the page).",
    sourcePage: getBookPageImage(74)
  },
  {
    id: "l20-p74-write-sentences",
    lessonNumber: 20,
    pageNumber: 74,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones. Usa las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Sentence writing lines, confirmed present on public/cartilla/images/source/f/f-page-49.jpg (real scan).",
    sourcePage: getBookPageImage(74)
  }
];
