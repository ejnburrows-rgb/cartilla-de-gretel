import { getFlipchartSourceCard, type FlipchartSourceCard } from "@/lib/flipchart-source";
import type { PageRegion } from "@/lib/book-faithful";

const fontRoleClass: Record<PageRegion["fontRole"], string> = {
  heading: "font-[var(--font-book-faithful)] font-black text-2xl text-stone-800",
  body: "font-[var(--font-book-faithful)] text-sm text-stone-600",
  tracing: "font-[var(--font-book-faithful)] text-3xl tracking-[0.4em] text-stone-400",
};

function FlipchartRegionView({ region }: { region: PageRegion }) {
  return <p className={fontRoleClass[region.fontRole]}>{region.text}</p>;
}

interface FlipchartSourceCardRendererProps {
  cardId: string;
}

/**
 * Renders the verified, transcribed text content for a Teacher Flip Chart
 * source card as live HTML (font-swappable via --font-book-faithful).
 * Returns null if the card id isn't found in flipchart-source-pages.json.
 */
export function FlipchartSourceCardRenderer({ cardId }: FlipchartSourceCardRendererProps) {
  const card: FlipchartSourceCard | null = getFlipchartSourceCard(cardId);
  if (!card) return null;

  const ordered = [...card.regions].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-8 bg-stone-50 border border-stone-200/50 rounded-2xl">
      {ordered.map((region) => (
        <FlipchartRegionView key={region.id} region={region} />
      ))}
    </div>
  );
}
