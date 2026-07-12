import { getBookPageImage } from "@/lib/bookImages";

export const lesson23 = [
  {
    id: "l23-p89-letter-tracing",
    lessonNumber: 23,
    pageNumber: 89,
    kind: "letter-tracing",
    title: "Escribe con tu mejor letra — Y y",
    prompt: "Traza la letra Y mayúscula y la y minúscula. Luego haz un dibujo de una palabra que comienza con y.",
    items: [
      { id: "letter-Y", label: "Y" },
      { id: "letter-y", label: "y" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Students trace uppercase and lowercase y.",
    sourcePage: getBookPageImage(89)
  },
  {
    id: "l23-p90-syllable-circle",
    lessonNumber: 23,
    pageNumber: 90,
    kind: "drag-syllable-to-slot",
    title: "Encierra la sílaba — Y y",
    prompt: "Encierra en un círculo la sílaba que corresponde a cada palabra. Toca la sílaba correcta.",
    items: [
      { id: "syl-ya", label: "ya" },
      { id: "syl-ye", label: "ye" },
      { id: "syl-yi", label: "yi" },
      { id: "syl-yo", label: "yo" },
      { id: "syl-yu", label: "yu" }
    ],
    targets: [
      { id: "slot-ya", label: "ya", coordinatesVerified: false, acceptsItemId: "syl-ya" },
      { id: "slot-ye", label: "ye", coordinatesVerified: false, acceptsItemId: "syl-ye" },
      { id: "slot-yi", label: "yi", coordinatesVerified: false, acceptsItemId: "syl-yi" },
      { id: "slot-yo", label: "yo", coordinatesVerified: false, acceptsItemId: "syl-yo" },
      { id: "slot-yu", label: "yu", coordinatesVerified: false, acceptsItemId: "syl-yu" }
    ],
    wordBank: [
      "yate", "Yara", "payaso", "yana", "yagua", "maya", "yegua", "enyesado", "yema", "Yesenia", "Yeyo", "yeso", "Mayito", "Yayita", "Yayi", "Yigüiro", "Yoyita", "Mayita", "cayo", "yoyo", "rayo", "coyote", "yo", "Yayo", "Yucatán", "Cayuco", "ayudar", "yuca", "ayuda", "desayuno"
    ],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded syllable circle for y.",
    sourcePage: getBookPageImage(90)
  },
  {
    id: "l23-p91-syllable-tap",
    lessonNumber: 23,
    pageNumber: 91,
    kind: "read-aloud",
    title: "Sílabas con Y — página Yy",
    prompt: "Toca cada sílaba para escucharla. Repite en voz alta.",
    items: [
      { id: "ra-ya", label: "ya" },
      { id: "ra-ye", label: "ye" },
      { id: "ra-yi", label: "yi" },
      { id: "ra-yo", label: "yo" },
      { id: "ra-yu", label: "yu" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded syllable tap for y.",
    sourcePage: getBookPageImage(91)
  },
  {
    id: "l23-p91-word-bank",
    lessonNumber: 23,
    pageNumber: 91,
    kind: "listen-and-tap",
    title: "Palabras con Y",
    prompt: "Toca cada palabra para escucharla.",
    items: [
      { id: "w-yuca-0", label: "yuca" },
      { id: "w-ayer-1", label: "ayer" },
      { id: "w-cayo-2", label: "cayo" },
      { id: "w-yema-3", label: "yema" },
      { id: "w-payaso-4", label: "payaso" },
      { id: "w-mayito-5", label: "Mayito" },
      { id: "w-yate-6", label: "yate" },
      { id: "w-yute-7", label: "yute" },
      { id: "w-joya-8", label: "joya" },
      { id: "w-yegua-9", label: "yegua" },
      { id: "w-yoyo-10", label: "yoyo" },
      { id: "w-yucateco-11", label: "yucateco" },
      { id: "w-yagua-12", label: "yagua" },
      { id: "w-yucatan-13", label: "Yucatán" },
      { id: "w-yeso-14", label: "yeso" }
    ],
    targets: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded word bank for y.",
    sourcePage: getBookPageImage(91)
  },
  {
    id: "l23-p91-mini-story",
    lessonNumber: 23,
    pageNumber: 91,
    kind: "mini-story",
    title: "Mini-cuento",
    prompt: "Lee el mini-cuento del cuaderno con tu maestro.",
    items: [
      { id: "story-y-1", label: "El yate de Yayo está en Yateras. Yayo fue" },
      { id: "story-y-2", label: "a los cayos a pescar con sus amigas" },
      { id: "story-y-3", label: "yucatecas. Yayo tiene una soga de yute" },
      { id: "story-y-4", label: "para amarrar su yate. Yayo comió yuca y" },
      { id: "story-y-5", label: "guacamole. A Yayo le gusta el arroz con" },
      { id: "story-y-6", label: "yemas de huevos también. Su mamá le" },
      { id: "story-y-7", label: "dio el arroz con yemas de huevos ayer." },
      { id: "story-y-8", label: "Yayo se lo comió todo." }
    ],
    targets: [],
    sightWords: [],
    sourceStatus: "scaffold",
    transcriptionStatus: "needs-source-verification",
    studentFacingStatus: "pending",
    teacherNotes: "[NEEDS_CONTENT_REVIEW] Scaffolded mini-story for y.",
    sourcePage: getBookPageImage(91)
  }
];
