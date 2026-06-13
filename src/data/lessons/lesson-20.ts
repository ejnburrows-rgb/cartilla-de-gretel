import { getBookPageImage } from "@/lib/bookImages";

export const lesson20 = [
  {
    id: "l20-p77-letter-tracing",
    lessonNumber: 20,
    pageNumber: 77,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — F f",
    prompt: "Traza la letra F mayúscula y la f minúscula. Luego haz un dibujo de una palabra que comienza con f.",
    items: [
      { id: "letter-F", label: "F" },
      { id: "letter-f", label: "f" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Students trace uppercase and lowercase f.",
    sourcePage: getBookPageImage(77)
  },
  {
    id: "l20-p78-syllable-circle",
    lessonNumber: 20,
    pageNumber: 78,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — F f",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-fa", label: "fa" },
      { id: "syl-fe", label: "fe" },
      { id: "syl-fi", label: "fi" },
      { id: "syl-fo", label: "fo" },
      { id: "syl-fu", label: "fu" }
    ],
    targets: [
      { id: "slot-fa", label: "fa", coordinatesVerified: false, acceptsItemId: "syl-fa" },
      { id: "slot-fe", label: "fe", coordinatesVerified: false, acceptsItemId: "syl-fe" },
      { id: "slot-fi", label: "fi", coordinatesVerified: false, acceptsItemId: "syl-fi" },
      { id: "slot-fo", label: "fo", coordinatesVerified: false, acceptsItemId: "syl-fo" },
      { id: "slot-fu", label: "fu", coordinatesVerified: false, acceptsItemId: "syl-fu" }
    ],
    wordBank: [
      "fama", "familia", "faro", "famoso", "fatiga", "afanado", "feo", "fecha", "Felo", "feliz", "felino", "Felicia", "fila", "filo", "afinado", "afina", "fino", "afilar", "foto", "sofoca", "fosa", "foso", "teléfono", "foca", "furia", "funda", "futuro", "furor", "perfume", "fuga"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable circle for f.",
    sourcePage: getBookPageImage(78)
  },
  {
    id: "l20-p79-syllable-tap",
    lessonNumber: 20,
    pageNumber: 79,
    kind: "read-aloud",
    title: "Sílabas con F — página Ff",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-fa", label: "fa" },
      { id: "ra-fe", label: "fe" },
      { id: "ra-fi", label: "fi" },
      { id: "ra-fo", label: "fo" },
      { id: "ra-fu", label: "fu" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded syllable tap for f.",
    sourcePage: getBookPageImage(79)
  },
  {
    id: "l20-p79-word-bank",
    lessonNumber: 20,
    pageNumber: 79,
    kind: "listen-and-tap",
    title: "Palabras con F",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-familia-0", label: "familia" },
      { id: "w-fino-1", label: "fino" },
      { id: "w-fila-2", label: "fila" },
      { id: "w-figaro-3", label: "Fígaro" },
      { id: "w-fusta-4", label: "fusta" },
      { id: "w-falso-5", label: "falso" },
      { id: "w-fama-6", label: "fama" },
      { id: "w-fumiga-7", label: "fumiga" },
      { id: "w-fortuna-8", label: "fortuna" },
      { id: "w-famoso-9", label: "famoso" },
      { id: "w-telefono-10", label: "teléfono" },
      { id: "w-ofelia-11", label: "Ofelia" },
      { id: "w-foto-12", label: "foto" },
      { id: "w-feo-13", label: "feo" },
      { id: "w-foca-14", label: "foca" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded word bank for f.",
    sourcePage: getBookPageImage(79)
  },
  {
    id: "l20-p79-mini-story",
    lessonNumber: 20,
    pageNumber: 79,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-f-1", label: "La familia de Ofelia va a la finca de Felo." },
      { id: "story-f-2", label: "En la finca de Felo hay aves y ganado." },
      { id: "story-f-3", label: "Felo arrea el ganado con una fusta. El" },
      { id: "story-f-4", label: "ganado vale una fortuna. Es un ganado" },
      { id: "story-f-5", label: "de fama. Felo pone todo el ganado" },
      { id: "story-f-6", label: "en fila." }
    ],
    targets: [],
    sightWords: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded mini-story for f.",
    sourcePage: getBookPageImage(79)
  },
  {
    id: "l20-p80-fill-in-blank",
    lessonNumber: 20,
    pageNumber: 80,
    kind: "drag-syllable-to-slot",
    title: "Completa las palabras — F f",
    prompt: "Arrastra la sílaba correcta para completar cada palabra.",
    items: [
      { id: "syl-fa-0", label: "fa" },
      { id: "syl-fo-1", label: "fo" },
      { id: "syl-fi-2", label: "fi" },
      { id: "syl-fe-3", label: "fe" },
      { id: "syl-fu-4", label: "fu" }
    ],
    targets: [
      {
        id: "blank-fama-0",
        label: "___ma",
        hint: "fa - fo",
        correctSyllable: "fa",
        fullWord: "fama",
        coordinatesVerified: false,
        acceptsItemId: "syl-fa-0"
      },
      {
        id: "blank-fila-1",
        label: "___la",
        hint: "fi - fe",
        correctSyllable: "fi",
        fullWord: "fila",
        coordinatesVerified: false,
        acceptsItemId: "syl-fi-2"
      },
      {
        id: "blank-telefono-2",
        label: "telé___no",
        hint: "fo - fu",
        correctSyllable: "fo",
        fullWord: "teléfono",
        coordinatesVerified: false,
        acceptsItemId: "syl-fo-1"
      },
      {
        id: "blank-foca-3",
        label: "___ca",
        hint: "fo - fi",
        correctSyllable: "fo",
        fullWord: "foca",
        coordinatesVerified: false,
        acceptsItemId: "syl-fo-1"
      },
      {
        id: "blank-fecha-4",
        label: "___cha",
        hint: "fe - fu",
        correctSyllable: "fe",
        fullWord: "fecha",
        coordinatesVerified: false,
        acceptsItemId: "syl-fe-3"
      },
      {
        id: "blank-foto-5",
        label: "___to",
        hint: "fo - fi",
        correctSyllable: "fo",
        fullWord: "foto",
        coordinatesVerified: false,
        acceptsItemId: "syl-fo-1"
      }
    ],
    exercises: [
      {
        partial: "___ma",
        choices: ["fa","fo"],
        answer: "fa",
        fullWord: "fama"
      },
      {
        partial: "___la",
        choices: ["fi","fe"],
        answer: "fi",
        fullWord: "fila"
      },
      {
        partial: "telé___no",
        choices: ["fo","fu"],
        answer: "fo",
        fullWord: "teléfono"
      },
      {
        partial: "___ca",
        choices: ["fo","fi"],
        answer: "fo",
        fullWord: "foca"
      },
      {
        partial: "___cha",
        choices: ["fe","fu"],
        answer: "fe",
        fullWord: "fecha"
      },
      {
        partial: "___to",
        choices: ["fo","fi"],
        answer: "fo",
        fullWord: "foto"
      }
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Scaffolded fill-in-the-blank for f.",
    sourcePage: getBookPageImage(80)
  },
  {
    id: "l20-p80-write-sentences",
    lessonNumber: 20,
    pageNumber: 80,
    kind: "letter-tracing",
    title: "Escribe oraciones. Usa las sílabas que aprendiste.",
    prompt: "Escribe oraciones usando las sílabas que aprendiste.",
    items: [],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "Sentence writing lines.",
    sourcePage: getBookPageImage(80)
  }
];
