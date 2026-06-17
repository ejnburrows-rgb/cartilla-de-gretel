/**
 * flipchart-source.ts
 *
 * Verified content from the corrected Teacher Flip Chart source PDFs
 * (public/book/flipchart-source/), transcribed directly off the rendered
 * master images since the source PDFs have no embedded text layer.
 */

import flipchartSourceData from "@/data/flipchart-source-pages.json";
import type { PageRegion } from "@/lib/book-faithful";

export type FlipchartSourceCard = {
  id: string;
  section: string;
  masterImage: string;
  regions: PageRegion[];
};

type RawFlipchartSourceData = {
  cards: FlipchartSourceCard[];
};

const raw = flipchartSourceData as unknown as RawFlipchartSourceData;

export const FLIPCHART_SOURCE_CARDS: ReadonlyArray<FlipchartSourceCard> = raw.cards;

/** Look up a flipchart source card by its file id (e.g. "10Mm", "1Portada"). */
export function getFlipchartSourceCard(id: string): FlipchartSourceCard | null {
  return raw.cards.find((card) => card.id === id) ?? null;
}

/** Ordered list of card ids, matching the order they appear in the flip chart. */
export function getFlipchartSourceCardIds(): string[] {
  return raw.cards.map((card) => card.id);
}

/**
 * Maps lesson-catalog numbers (src/lib/lesson-catalog.ts) to the corrected
 * Teacher Flip Chart card ids that belong to that lesson. Only lessons with
 * a verified, transcribed source card are listed here — every other lesson
 * keeps projecting the workbook page scans (see flipchart.$n.tsx).
 */
const LESSON_FLIPCHART_CARD_IDS: Record<number, string[]> = {
  1: ["1Portada", "2Las_hermanitas_vocales_Rima"],
  7: ["10Mm"],
  8: ["11Pp", "12Pp", "13Pp"],
  9: ["14Ss", "15Ss", "16Ss"],
  10: ["17Tt", "18Tt"],
  11: ["19Dd", "20Dd", "21Dd"],
  12: ["22Ll", "23Ll", "24Ll"],
  13: ["25Nn", "26Nn"],
};

/** Ordered flipchart source cards to project for a given lesson, or [] if none exist yet. */
export function getFlipchartSourceCardsForLesson(lessonNumber: number): FlipchartSourceCard[] {
  const ids = LESSON_FLIPCHART_CARD_IDS[lessonNumber] ?? [];
  return ids
    .map((id) => getFlipchartSourceCard(id))
    .filter((card): card is FlipchartSourceCard => card !== null);
}
