import { getBookPageImage } from "@/lib/bookImages";

export const lesson03 = [
  {
    id: "l3-p13-mark-x",
    lessonNumber: 3,
    pageNumber: 13,
    kind: "listen-and-tap",
    title: "Marca con una x",
    prompt: "Marca con una x los dibujos de las palabras que comienzan con A a.",
    items: [
      { id: "img-abanico-0", label: "abanico" },
      { id: "img-abeja-1", label: "abeja" },
      { id: "img-arbol-2", label: "árbol" },
      { id: "img-avion-3", label: "avión" },
      { id: "img-anillo-4", label: "anillo" },
      { id: "img-elefante-5", label: "elefante" },
      { id: "img-estrella-6", label: "estrella" },
      { id: "img-uno-7", label: "uno" },
      { id: "img-iman-8", label: "imán" },
      { id: "img-ardilla-9", label: "ardilla" },
      { id: "img-oso-10", label: "oso" }
    ],
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
    prompt: "Traza una línea desde la vocal Aa hasta el dibujo de la palabra que comienza con Aa.",
    items: [
      { id: "img-oso-0", label: "oso" },
      { id: "img-iglu-1", label: "iglú" },
      { id: "img-alas-2", label: "alas" },
      { id: "img-abeja-3", label: "abeja" },
      { id: "img-avion-4", label: "avión" },
      { id: "img-anillo-5", label: "anillo" },
      { id: "img-aguja-6", label: "aguja" },
      { id: "img-elote-7", label: "elote" }
    ],
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
    title: "Escribe con tu mejor letra.",
    prompt: "Haz un dibujo que represente una palabra que comienza con a.",
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
