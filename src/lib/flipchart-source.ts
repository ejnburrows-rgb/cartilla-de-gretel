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
