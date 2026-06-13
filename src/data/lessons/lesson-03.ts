import { getBookPageImage } from "@/lib/bookImages";

export const lesson03 = [
  {
    id: "l3-p13-mark-x",
    lessonNumber: 3,
    pageNumber: 13,
    kind: "listen-and-tap",
    title: "Marca con una x",
    prompt: "Marca con una x los dibujos que comienzan con A a.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for A a.",
    sourcePage: getBookPageImage(13)
  },
  {
    id: "l3-p14-draw-line",
    lessonNumber: 3,
    pageNumber: 14,
    kind: "drag-syllable-to-slot",
    title: "Traza una línea",
    prompt: "Traza una línea de la A al dibujo que le corresponde.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for A a.",
    sourcePage: getBookPageImage(14)
  },
  {
    id: "l3-p15-letter-tracing",
    lessonNumber: 3,
    pageNumber: 15,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra",
    prompt: "Traza la letra.",
    items: [
      { id: "letter-A", label: "A" },
      { id: "letter-a", label: "a" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded letter tracing for A a.",
    sourcePage: getBookPageImage(15)
  }
];
