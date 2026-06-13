import { getBookPageImage } from "@/lib/bookImages";

export const lesson01 = [
  {
    id: "l1-p7-circle",
    lessonNumber: 1,
    pageNumber: 7,
    kind: "listen-and-tap",
    title: "Circula los dibujos",
    prompt: "Circula los dibujos de las palabras en cada línea horizontal que comienzan con el mismo sonido.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for Lesson 1.",
    sourcePage: getBookPageImage(7)
  },
  {
    id: "l1-p8-circle-vowel",
    lessonNumber: 1,
    pageNumber: 8,
    kind: "listen-and-tap",
    title: "Circula el dibujo",
    prompt: "Circula el dibujo que comienza con la vocal del recuadro.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for Lesson 1.",
    sourcePage: getBookPageImage(8)
  },
  {
    id: "l1-p9-draw-line",
    lessonNumber: 1,
    pageNumber: 9,
    kind: "drag-syllable-to-slot",
    title: "Traza una línea",
    prompt: "Traza una línea de la vocal al dibujo que le corresponde.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for Lesson 1.",
    sourcePage: getBookPageImage(9)
  }
];
