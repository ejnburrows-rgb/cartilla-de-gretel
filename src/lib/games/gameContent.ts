// gameContent.ts — data contract for the 8 themed Cartilla games (Payaso Chano, Mariposas, etc).
// Reconciles the Notion "8-archetype" remaster plan with the existing ExerciseSeed content
// pattern (src/content/exercise-seed.ts) so there is one mental model for lesson content.

export type GameArchetype =
  | "payaso-chano"
  | "mariposas"
  | "juego-vocal"
  | "fonetica-completar"
  | "lectura-silabas"
  | "lectura-rima"
  | "palabras-por-minuto"
  | "dibujos";

export type WordItem = {
  word: string;
  syllables: string[];
  audioUrl?: string;
  imageUrl?: string;
};

export type GameContent = {
  id: string;
  type: GameArchetype;
  letter: string;
  instructions: string[]; // verbatim Spanish, in order
  words: WordItem[];
  tiles?: string[]; // syllable tray bank, verbatim casing preserved
  assets?: {
    board?: string;
    props?: Record<string, string>;
  };
};
