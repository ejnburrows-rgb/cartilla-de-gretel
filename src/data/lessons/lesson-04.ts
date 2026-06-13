import { getBookPageImage } from "@/lib/bookImages";

export const lesson04 = [
  {
    id: "l4-p16-mark-x",
    lessonNumber: 4,
    pageNumber: 16,
    kind: "listen-and-tap",
    title: "Marca con una x",
    prompt: "Marca con una x los dibujos que comienzan con E e.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for E e.",
    sourcePage: getBookPageImage(16)
  },
  {
    id: "l4-p17-draw-line",
    lessonNumber: 4,
    pageNumber: 17,
    kind: "drag-syllable-to-slot",
    title: "Traza una línea",
    prompt: "Traza una línea de la E al dibujo que le corresponde.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for E e.",
    sourcePage: getBookPageImage(17)
  },
  {
    id: "l4-p18-letter-tracing",
    lessonNumber: 4,
    pageNumber: 18,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra",
    prompt: "Traza la letra.",
    items: [
      { id: "letter-E", label: "E" },
      { id: "letter-e", label: "e" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded letter tracing for E e.",
    sourcePage: getBookPageImage(18)
  }
];
