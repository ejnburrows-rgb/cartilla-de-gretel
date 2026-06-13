import { getBookPageImage } from "@/lib/bookImages";

export const lesson05 = [
  {
    id: "l5-p19-mark-x",
    lessonNumber: 5,
    pageNumber: 19,
    kind: "listen-and-tap",
    title: "Marca con una x",
    prompt: "Marca con una x los dibujos que comienzan con I i.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for I i.",
    sourcePage: getBookPageImage(19)
  },
  {
    id: "l5-p20-draw-line",
    lessonNumber: 5,
    pageNumber: 20,
    kind: "drag-syllable-to-slot",
    title: "Traza una línea",
    prompt: "Traza una línea de la I al dibujo que le corresponde.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for I i.",
    sourcePage: getBookPageImage(20)
  },
  {
    id: "l5-p21-letter-tracing",
    lessonNumber: 5,
    pageNumber: 21,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra",
    prompt: "Traza la letra.",
    items: [
      { id: "letter-I", label: "I" },
      { id: "letter-i", label: "i" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded letter tracing for I i.",
    sourcePage: getBookPageImage(21)
  }
];
