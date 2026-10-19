// completar-palabras.ts — "Completar palabras" activity, letter Mm first.
//
// Source of truth: teacher file
// `public/teacher/2-Fon_tica_Completar_palabras_con_Mm_5_t925.docx`
// (teacher source branch `teacher/metodos-lectura-20261018`; the file is not on
// `main` yet). Every printed word, blank card, syllable tile and instruction
// line below is copied verbatim from that file — nothing is invented.
//
// IMPORTANT — the teacher file does NOT say which syllable completes each
// blank card or which complete word each blank card forms. That mapping is
// intentionally left `null` here (`fullWord`, `answerSyllable`). Until the
// owner fills it in, the activity renders visible "pendiente" placeholders in
// every blank and never validates answers. Do not guess this mapping.
//
// Voice/audio for this activity is PENDIENTE per the owner's standing rule:
// no generated or device audio; audioUrl stays unset everywhere.
import type { GameContent } from "@/lib/games/gameContent";

/** One incomplete word card exactly as the teacher file prints it. */
export interface CompletarBlankCard {
  id: string;
  /** Printed text before the blank ("" when the blank comes first). */
  before: string;
  /** Printed text after the blank ("" when the blank comes last). */
  after: string;
  /**
   * Syllable tile the teacher file itself shows sitting in this card's blank
   * (part of the author's artwork), or null. Display only — never an answer
   * key; the official mapping still needs the owner's confirmation.
   */
  shownTile: string | null;
  /** MISSING from the teacher file. Must stay null until the owner fills it. */
  fullWord: null;
  /** MISSING from the teacher file. Must stay null until the owner fills it. */
  answerSyllable: null;
}

/** One printed block of the teacher file. */
export interface CompletarPalabrasSection {
  id: string;
  /** Words the file prints complete, verbatim, in file order. */
  completeCards: string[];
  /** Incomplete cards the file prints with a blank, verbatim, in file order. */
  blankCards: CompletarBlankCard[];
  /** Syllable tiles the file prints as a reading row, verbatim casing. */
  syllableBoxes: string[];
}

export type CompletarPalabrasContent = GameContent & {
  /** Title printed in the teacher file's banner. */
  title: string;
  sections: CompletarPalabrasSection[];
};

export const COMPLETAR_PALABRAS_M: CompletarPalabrasContent = {
  id: "completar-palabras",
  type: "completar-palabras",
  letter: "m",
  title: "Fonética: Sílabas con Mm",
  instructions: [
    "Presiona el símbolo de audio para escuchar las instrucciones.",
    "¡A completar las palabras!",
    "Presiona cada caja para escuchar la palabra.",
    "Arrastra la sílaba correcta para completar la palabra.",
  ],
  // Words the teacher file prints complete. The file does not print syllable
  // splits for them, so syllables stays empty — do not derive any.
  words: [
    { word: "Momi", syllables: [] },
    { word: "Memo", syllables: [] },
    { word: "amo", syllables: [] },
    { word: "Mumi", syllables: [] },
    { word: "mima", syllables: [] },
    { word: "mamá", syllables: [] },
  ],
  tiles: ["ma", "me", "mi", "mo", "mu"],
  sections: [
    {
      id: "seccion-1",
      completeCards: ["Momi", "Memo", "amo"],
      blankCards: [
        {
          id: "seccion-1-caja-1",
          before: "",
          after: "mi",
          shownTile: null,
          fullWord: null,
          answerSyllable: null,
        },
        {
          id: "seccion-1-caja-2",
          before: "",
          after: "mo",
          shownTile: null,
          fullWord: null,
          answerSyllable: null,
        },
        {
          id: "seccion-1-caja-3",
          before: "a",
          after: "",
          // The file prints this card with the red "mo" tile sitting in the
          // blank (a worked example). Still needs owner confirmation.
          shownTile: "mo",
          fullWord: null,
          answerSyllable: null,
        },
      ],
      syllableBoxes: [],
    },
    {
      id: "seccion-2",
      completeCards: ["Mumi", "mima", "mamá"],
      blankCards: [],
      syllableBoxes: ["Ma", "Me", "Mi", "Mo", "Mu"],
    },
    {
      id: "seccion-3",
      completeCards: [],
      blankCards: [
        {
          id: "seccion-3-caja-1",
          before: "",
          after: "mi",
          shownTile: null,
          fullWord: null,
          answerSyllable: null,
        },
        {
          id: "seccion-3-caja-2",
          before: "",
          after: "ma",
          shownTile: null,
          fullWord: null,
          answerSyllable: null,
        },
        {
          id: "seccion-3-caja-3",
          before: "ma",
          after: "",
          shownTile: null,
          fullWord: null,
          answerSyllable: null,
        },
      ],
      syllableBoxes: [],
    },
  ],
};
