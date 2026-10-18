// lectura-letras.ts — data for the "Lectura de palabras" activity.
//
// Source: teacher method files (owner-supplied DOCX, 2026-10-18):
//   public/teacher/3-Cu_ntas_palabras_puedo_leer_por_minuto_Mm_6_1vmi.docx
//   public/teacher/5-Lectura_de_palabras_con_s_labas_Mm__vocales_8_engg.docx
// Every Spanish string below is VERBATIM from those files: titles,
// instructions, word lists, casing, accents, and order are unchanged.
//
// The teacher file for "Vamos a leer palabras con las sílabas:" contains the
// title and four EMPTY bordered boxes after it — the syllable list itself is
// missing from the source document. It is NOT invented here: the activity
// renders labeled placeholders where the missing list goes, and
// `missingSyllables: true` marks the gap so the UI can label it "Pendiente"
// until the owner supplies the real syllables.
//
// Word audio does not exist yet (voice work is "pendiente" by owner rule);
// no audioUrl is invented. The drawings are the source document's own images
// (256-color quantized PNG, no redraw, wrapped in SVG for GitHub text push).

/**
 * Letter families in the Cartilla's own teaching order
 * (src/data/lessons.json `consonantOrder`). Only Mm has a source file today.
 */
export const LECTURA_LETTERS: Array<{ letter: string; available: boolean }> = [
  "Mm",
  "Pp",
  "Ss",
  "Tt",
  "Dd",
  "Ll",
  "Nn",
  "Ññ",
  "Bb",
  "Vv",
  "Rr",
  "Gg",
  "Ff",
  "Jj",
  "Cc",
  "Yy",
  "Zz",
].map((letter) => ({ letter, available: letter === "Mm" }));

export type LecturaMatchWord = {
  /** Verbatim word label from the source page, exact casing. */
  word: string;
  /** The source document's own drawing for this word (unchanged pixels). */
  drawing: string;
};

export type LecturaLetterActivity = {
  letter: string;
  /** File 5 section: "Vamos a leer palabras con las sílabas:" */
  syllablesSection: {
    title: string;
    /** The syllable list is absent from the source document; do not invent it. */
    missingSyllables: true;
    /** Number of empty bordered boxes left after the title in the source. */
    placeholderCount: number;
    /** Verbatim instructions 1-3 from the source page. */
    instructions: string[];
    /** Word labels in the source page's own left-to-right order. */
    words: LecturaMatchWord[];
    /** Drawings in the arrangement the source page places them (scrambled on purpose). */
    drawingOrder: string[];
  };
  /** File 3 section: "¿Cuántas palabras puedo leer por minuto?" */
  perMinuteSection: {
    title: string;
    instruction: string;
    /** The 18 words in the source grid's exact reading order (row by row). */
    words: string[];
  };
};

const ART = "/games/lectura-palabras";

export const LECTURA_M: LecturaLetterActivity = {
  letter: "Mm",
  syllablesSection: {
    title: "Vamos a leer palabras con las sílabas:",
    missingSyllables: true,
    placeholderCount: 4,
    instructions: [
      "Haz click en el dibujo, escucha la palabra",
      "Arrastra el dibujo hasta la palabra que representa el dibujo",
      "Si está correcto el dibujo se queda con la palabra y escuchas “muy bien”, si está incorrecto el dibujo sube a su lugar y escuchas: “trátalo de nuevo” (Puedes tratar tantas veces como quieras hasta hacerlo correctamente",
    ],
    words: [
      { word: "Mumi", drawing: `${ART}/draw-mumi.svg` },
      { word: "mamá", drawing: `${ART}/draw-mama.svg` },
      { word: "Meme", drawing: `${ART}/draw-meme.svg` },
      { word: "amo", drawing: `${ART}/draw-amo.svg` },
      { word: "mima", drawing: `${ART}/draw-mima.svg` },
    ],
    // Arrangement of the drawings across the source page (left to right).
    drawingOrder: ["mamá", "amo", "mima", "Meme", "Mumi"],
  },
  perMinuteSection: {
    title: "¿Cuántas palabras puedo leer por minuto?",
    instruction: "Lee cada palabra. Antes de comenzar ajusta el cronómetro.",
    words: [
      "mamá",
      "mami",
      "Mimo",
      "mío",
      "me",
      "mímame",
      "Momi",
      "Meme",
      "mi",
      "Meme",
      "ama",
      "mía",
      "Mumi",
      "Memo",
      "mima",
      "amo",
      "Mimí",
      "ámame",
    ],
  },
};

/** All letter activities that have source material, keyed by route param. */
export const LECTURA_ACTIVITIES: Record<string, LecturaLetterActivity> = {
  m: LECTURA_M,
};
