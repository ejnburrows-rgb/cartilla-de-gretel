import { getBookPageImage } from "@/lib/bookImages";

export const lesson22 = [
  {
    id: "l22-p79-picture-vocab",
    lessonNumber: 22,
    pageNumber: 79,
    kind: "listen-and-tap",
    title: "Cc",
    prompt: "Presiona el dibujo de la palabra que escuchas.",
    items: [
      { id: "img-cuna", label: "cuna" },
      { id: "img-conejo", label: "conejo" },
      { id: "img-casa", label: "casa" },
      { id: "img-cubo", label: "cubo" },
      { id: "img-catalina", label: "Catalina" }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Transcribed verbatim from public/cartilla/images/source/c/c-page-52.jpg (real scan).",
    sourcePage: getBookPageImage(79)
  },
  {
    id: "l22-p80-syllable-tap",
    lessonNumber: 22,
    pageNumber: 80,
    kind: "read-aloud",
    title: "Cc",
    prompt: "ca co cu",
    items: [
      { id: "ra-ca", label: "ca" },
      { id: "ra-co", label: "co" },
      { id: "ra-cu", label: "cu" }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Transcribed verbatim from public/cartilla/images/source/c/c-page-53.jpg (real scan).",
    sourcePage: getBookPageImage(80)
  },
  {
    id: "l22-p80-word-bank",
    lessonNumber: 22,
    pageNumber: 80,
    kind: "listen-and-tap",
    title: "Palabras",
    prompt: "Palabras",
    items: [
      { id: "w-carro", label: "carro" },
      { id: "w-coco", label: "coco" },
      { id: "w-casa", label: "casa" },
      { id: "w-cuba", label: "Cuba" },
      { id: "w-camisa", label: "camisa" },
      { id: "w-boca", label: "boca" },
      { id: "w-colombia", label: "Colombia" },
      { id: "w-poco", label: "poco" },
      { id: "w-pico", label: "pico" },
      { id: "w-cuco", label: "Cuco" },
      { id: "w-cuna", label: "cuna" },
      { id: "w-saco", label: "saco" },
      { id: "w-roca", label: "roca" },
      { id: "w-cumbia", label: "cumbia" },
      { id: "w-colonia", label: "colonia" }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Word list transcribed verbatim from public/cartilla/images/source/c/c-page-53.jpg (real scan).",
    sourcePage: getBookPageImage(80)
  },
  {
    id: "l22-p80-mini-story",
    lessonNumber: 22,
    pageNumber: 80,
    kind: "mini-story",
    title: "Cuento",
    prompt: "Cuento",
    items: [
      { id: "story-c-1", label: "Cuco Casanova es un buen amigo del" },
      { id: "story-c-2", label: "papá y de la mamá de Paco. El señor" },
      { id: "story-c-3", label: "Casanova es cubano. El vive en el" },
      { id: "story-c-4", label: "campo, vive con Doña María, su mamá." },
      { id: "story-c-5", label: "Cuco Casanova juega con los niños y" },
      { id: "story-c-6", label: "los cuida también. Todos en la casa de" },
      { id: "story-c-7", label: "Paco aman a Cuco." }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Reading passage transcribed verbatim from public/cartilla/images/source/c/c-page-53.jpg (real scan).",
    sourcePage: getBookPageImage(80)
  },
  {
    id: "l22-p81-rhyme",
    lessonNumber: 22,
    pageNumber: 81,
    kind: "mini-story",
    title: "Los caramelos",
    prompt: "Rima",
    items: [
      { id: "rhyme-c-1", label: "Cuco tiene caramelos" },
      { id: "rhyme-c-2", label: "caramelitos de miel" },
      { id: "rhyme-c-3", label: "Cuco reparte cariño" },
      { id: "rhyme-c-4", label: "y caramelos también." }
    ],
    targets: [],
    sourceStatus: "verified",
    transcriptionStatus: "verified",
    studentFacingStatus: "ready",
    teacherNotes: "Rhyme transcribed verbatim from public/cartilla/images/source/c/c-page-54.jpg (real scan).",
    sourcePage: getBookPageImage(81)
  },
  {
    id: "l22-p82-fill-in-blank",
    lessonNumber: 22,
    pageNumber: 82,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — C c",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-co-0", label: "co" },
      { id: "syl-cu-1", label: "cu" },
      { id: "syl-ca-2", label: "ca" }
    ],
    targets: [
      { id: "blank-coma-0", label: "___ma", hint: "co - cu", correctSyllable: "co", fullWord: "coma", coordinatesVerified: false, acceptsItemId: "syl-co-0" },
      { id: "blank-cosa-1", label: "___sa", hint: "co - ca", correctSyllable: "co", fullWord: "cosa", coordinatesVerified: false, acceptsItemId: "syl-co-0" },
      { id: "blank-saca-2", label: "sa___", hint: "ca - co", correctSyllable: "ca", fullWord: "saca", coordinatesVerified: false, acceptsItemId: "syl-ca-2" },
      { id: "blank-cola-3", label: "___la", hint: "ca - co", correctSyllable: "co", fullWord: "cola", coordinatesVerified: false, acceptsItemId: "syl-co-0" },
      { id: "blank-loca-4", label: "lo___", hint: "co - ca", correctSyllable: "ca", fullWord: "loca", coordinatesVerified: false, acceptsItemId: "syl-ca-2" },
      { id: "blank-cubo-5", label: "___bo", hint: "co - cu", correctSyllable: "cu", fullWord: "cubo", coordinatesVerified: false, acceptsItemId: "syl-cu-1" }
    ],
    exercises: [
      { partial: "___ma", choices: ["co", "cu"], answer: "co", fullWord: "coma" },
      { partial: "___sa", choices: ["co", "ca"], answer: "co", fullWord: "cosa" },
      { partial: "sa___", choices: ["ca", "co"], answer: "ca", fullWord: "saca" },
      { partial: "___la", choices: ["ca", "co"], answer: "co", fullWord: "cola" },
      { partial: "lo___", choices: ["co", "ca"], answer: "ca", fullWord: "loca" },
      { partial: "___bo", choices: ["co", "cu"], answer: "cu", fullWord: "cubo" }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "UNREADABLE-SCAN — no source scan was provided for this lesson's fill-in-blank page (physical page 82, per consonants.json's pages \"79-82\"); only 3 scans exist for c/ (page-52, 53, 54). This entry is unverified scaffold content carried over as-is; left pending, not promoted to ready.",
    sourcePage: getBookPageImage(82)
  },
  {
    id: "l22-p82-write-sentences",
    lessonNumber: 22,
    pageNumber: 82,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones usando las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "UNREADABLE-SCAN — no source scan was provided for physical page 82 (see fill-in-blank entry above for the same lesson/page).",
    sourcePage: getBookPageImage(82)
  }
];
