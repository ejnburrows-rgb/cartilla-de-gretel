import { getBookPageImage } from "@/lib/bookImages";

export const lesson06 = [
  {
    id: "l6-p22-mark-x",
    lessonNumber: 6,
    pageNumber: 22,
    kind: "listen-and-tap",
    title: "Marca con una x",
    prompt: "Marca con una x los dibujos que comienzan con U u.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for U u.",
    sourcePage: getBookPageImage(22)
  },
  {
    id: "l6-p23-draw-line",
    lessonNumber: 6,
    pageNumber: 23,
    kind: "drag-syllable-to-slot",
    title: "Traza una línea",
    prompt: "Traza una línea de la U al dibujo que le corresponde.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded exercise for U u.",
    sourcePage: getBookPageImage(23)
  },
  {
    id: "l6-p24-letter-tracing",
    lessonNumber: 6,
    pageNumber: 24,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra",
    prompt: "Traza la letra.",
    items: [
      { id: "letter-U", label: "U" },
      { id: "letter-u", label: "u" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded letter tracing for U u.",
    sourcePage: getBookPageImage(24)
  }
];
