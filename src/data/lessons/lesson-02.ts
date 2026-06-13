import { getBookPageImage } from "@/lib/bookImages";

export const lesson02 = [
  {
    id: "l2-p10-mark-x",
    lessonNumber: 2,
    pageNumber: 10,
    kind: "listen-and-tap",
    title: "Marca con una x",
    prompt: "Marca con una x los dibujos que comienzan con O o.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for O o.",
    sourcePage: getBookPageImage(10)
  },
  {
    id: "l2-p11-draw-line",
    lessonNumber: 2,
    pageNumber: 11,
    kind: "drag-syllable-to-slot",
    title: "Traza una línea",
    prompt: "Traza una línea de la O al dibujo que le corresponde.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for O o.",
    sourcePage: getBookPageImage(11)
  },
  {
    id: "l2-p12-letter-tracing",
    lessonNumber: 2,
    pageNumber: 12,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra",
    prompt: "Traza la letra.",
    items: [
      { id: "letter-O", label: "O" },
      { id: "letter-o", label: "o" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded letter tracing for O o.",
    sourcePage: getBookPageImage(12)
  }
];
