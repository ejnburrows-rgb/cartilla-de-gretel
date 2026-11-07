import { lessonForWorkbookPage } from "@/lib/workbook-pages";
import type { GameContent } from "@/lib/games/gameContent";

/**
 * "Une la palabra con su dibujo" practice game.
 *
 * Source: the verified Student Workbook scan data
 * (`src/data/page-layouts.json` → printed page 5, Lección 2, letter Oo,
 * region `p5-match`). These five entries are that page's graded word/picture
 * cells, in printed order, with the page's pre-drawn example ("ola") removed.
 *
 * The pairs live here as a small explicit list instead of being imported from
 * the 200 KB page-layouts source, so the game route does not drag that whole
 * file into the first-paint bundle. `palabras-parejas.test.ts` re-derives the
 * same pairs from page-layouts.json and fails if this list drifts.
 */
export const PALABRAS_PAREJAS_PAGE = 5;
export const PALABRAS_PAREJAS_LESSON = lessonForWorkbookPage(PALABRAS_PAREJAS_PAGE);
export const PALABRAS_PAREJAS_PAIR_COUNT = 5;

export const PALABRAS_PAREJAS_O: GameContent = {
  id: "parejas-palabras-o",
  type: "unir-palabras",
  letter: "o",
  instructions: ["Une cada palabra con su dibujo: arrastra el lápiz de la palabra al dibujo."],
  words: [
    {
      word: "oveja",
      syllables: ["oveja"],
      imageUrl: "/cartilla/art/faithful/vocal-o/oveja.webp",
    },
    {
      word: "ojos",
      syllables: ["ojos"],
      imageUrl: "/cartilla/art/faithful/leccion-1/ojos.webp",
    },
    {
      word: "oreja",
      syllables: ["oreja"],
      imageUrl: "/cartilla/art/faithful/vocal-o/oreja.webp",
    },
    {
      word: "olla",
      syllables: ["olla"],
      imageUrl: "/cartilla/art/faithful/vocal-o/olla.webp",
    },
    {
      word: "oso",
      syllables: ["oso"],
      imageUrl: "/cartilla/art/faithful/vocal-o/oso.webp",
    },
  ],
};
