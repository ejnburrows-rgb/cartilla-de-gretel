import { getBookPageImage } from "@/lib/bookImages";

export const lesson22 = [
  {
    id: "l22-p85-letter-tracing",
    lessonNumber: 22,
    pageNumber: 85,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — C c",
    prompt: "Traza la letra C mayúscula y la c minúscula. Luego haz un dibujo de una palabra que comienza con c.",
    items: [
      { id: "letter-C", label: "C" },
      { id: "letter-c", label: "c" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Students trace uppercase and lowercase c.",
    sourcePage: getBookPageImage(85)
  },
  {
    id: "l22-p86-syllable-circle",
    lessonNumber: 22,
    pageNumber: 86,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — C c",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-ca", label: "ca" },
      { id: "syl-co", label: "co" },
      { id: "syl-cu", label: "cu" }
    ],
    targets: [
      { id: "slot-ca", label: "ca", coordinatesVerified: false, acceptsItemId: "syl-ca" },
      { id: "slot-co", label: "co", coordinatesVerified: false, acceptsItemId: "syl-co" },
      { id: "slot-cu", label: "cu", coordinatesVerified: false, acceptsItemId: "syl-cu" }
    ],
    wordBank: [
      "cama", "cala", "casa", "cana", "loca", "saca", "coma", "cosa", "poco", "cola", "copa", "saco", "cuna", "Cuba", "acuna", "acuso", "acumula", "cubo"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded syllable circle for c.",
    sourcePage: getBookPageImage(86)
  },
  {
    id: "l22-p87-syllable-tap",
    lessonNumber: 22,
    pageNumber: 87,
    kind: "read-aloud",
    title: "Sílabas con C — página Cc",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-ca", label: "ca" },
      { id: "ra-co", label: "co" },
      { id: "ra-cu", label: "cu" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded syllable tap for c.",
    sourcePage: getBookPageImage(87)
  },
  {
    id: "l22-p87-word-bank",
    lessonNumber: 22,
    pageNumber: 87,
    kind: "listen-and-tap",
    title: "Palabras con C",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-carro-0", label: "carro" },
      { id: "w-boca-1", label: "boca" },
      { id: "w-cuna-2", label: "cuna" },
      { id: "w-coco-3", label: "coco" },
      { id: "w-colombia-4", label: "Colombia" },
      { id: "w-saco-5", label: "saco" },
      { id: "w-casa-6", label: "casa" },
      { id: "w-poco-7", label: "poco" },
      { id: "w-roca-8", label: "roca" },
      { id: "w-cuba-9", label: "Cuba" },
      { id: "w-pico-10", label: "pico" },
      { id: "w-cumbia-11", label: "cumbia" },
      { id: "w-camisa-12", label: "camisa" },
      { id: "w-cuco-13", label: "Cuco" },
      { id: "w-colonia-14", label: "colonia" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded word bank for c.",
    sourcePage: getBookPageImage(87)
  },
  {
    id: "l22-p87-mini-story",
    lessonNumber: 22,
    pageNumber: 87,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-c-1", label: "Cuco Casanova es un buen amigo del" },
      { id: "story-c-2", label: "papá y de la mamá de Paco. El señor" },
      { id: "story-c-3", label: "Casanova es cubano. Él vive en el" },
      { id: "story-c-4", label: "campo, vive con Doña María, su mamá." },
      { id: "story-c-5", label: "Cuco Casanova juega con los niños y los" },
      { id: "story-c-6", label: "cuida también. Todos en la casa de" },
      { id: "story-c-7", label: "Paco aman a Cuco." }
    ],
    targets: [],
    sightWords: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded mini-story for c.",
    sourcePage: getBookPageImage(87)
  },
  {
    id: "l22-p88-fill-in-blank",
    lessonNumber: 22,
    pageNumber: 88,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — C c",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-co-0", label: "co" },
      { id: "syl-cu-1", label: "cu" },
      { id: "syl-ca-2", label: "ca" }
    ],
    targets: [
      {
        id: "blank-coma-0",
        label: "___ma",
        hint: "co - cu",
        correctSyllable: "co",
        fullWord: "coma",
        coordinatesVerified: false,
        acceptsItemId: "syl-co-0"
      },
      {
        id: "blank-cosa-1",
        label: "___sa",
        hint: "co - ca",
        correctSyllable: "co",
        fullWord: "cosa",
        coordinatesVerified: false,
        acceptsItemId: "syl-co-0"
      },
      {
        id: "blank-saca-2",
        label: "sa___",
        hint: "ca - co",
        correctSyllable: "ca",
        fullWord: "saca",
        coordinatesVerified: false,
        acceptsItemId: "syl-ca-2"
      },
      {
        id: "blank-cola-3",
        label: "___la",
        hint: "ca - co",
        correctSyllable: "co",
        fullWord: "cola",
        coordinatesVerified: false,
        acceptsItemId: "syl-co-0"
      },
      {
        id: "blank-loca-4",
        label: "lo___",
        hint: "co - ca",
        correctSyllable: "ca",
        fullWord: "loca",
        coordinatesVerified: false,
        acceptsItemId: "syl-ca-2"
      },
      {
        id: "blank-cubo-5",
        label: "___bo",
        hint: "co - cu",
        correctSyllable: "cu",
        fullWord: "cubo",
        coordinatesVerified: false,
        acceptsItemId: "syl-cu-1"
      }
    ],
    exercises: [
      {
        partial: "___ma",
        choices: ["co","cu"],
        answer: "co",
        fullWord: "coma"
      },
      {
        partial: "___sa",
        choices: ["co","ca"],
        answer: "co",
        fullWord: "cosa"
      },
      {
        partial: "sa___",
        choices: ["ca","co"],
        answer: "ca",
        fullWord: "saca"
      },
      {
        partial: "___la",
        choices: ["ca","co"],
        answer: "co",
        fullWord: "cola"
      },
      {
        partial: "lo___",
        choices: ["co","ca"],
        answer: "ca",
        fullWord: "loca"
      },
      {
        partial: "___bo",
        choices: ["co","cu"],
        answer: "cu",
        fullWord: "cubo"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded fill-in-the-blank for c.",
    sourcePage: getBookPageImage(88)
  },
  {
    id: "l22-p88-write-sentences",
    lessonNumber: 22,
    pageNumber: 88,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones usando las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Sentence writing lines.",
    sourcePage: getBookPageImage(88)
  }
];
