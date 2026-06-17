import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { FlipchartSourceCardRenderer } from "@/components/cartilla/FlipchartSourceCardRenderer";
import { getFlipchartSourceCard, getFlipchartSourceCardIds } from "@/lib/flipchart-source";

export const Route = createFileRoute("/cartilla/flipchart-source/$id")({
  component: FlipchartSourcePage,
  beforeLoad: ({ params }) => {
    if (!getFlipchartSourceCard(params.id)) {
      throw redirect({ to: "/cartilla/flipchart-source/$id", params: { id: "1Portada" } });
    }
  },
});

function FlipchartSourcePage() {
  const { id } = Route.useParams();
  const card = getFlipchartSourceCard(id);
  const ids = getFlipchartSourceCardIds();

  if (!card) return null;

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/cartilla"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Cartilla
        </Link>

        <h1 className="mt-3 text-2xl font-black">
          Flip Chart source — {card.section} ({card.id})
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          Verified transcription from the corrected source PDF, vs. the master scan.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {ids.map((cardId) => (
            <Link
              key={cardId}
              to="/cartilla/flipchart-source/$id"
              params={{ id: cardId }}
              className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${
                cardId === id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-foreground/15 hover:bg-secondary"
              }`}
            >
              {cardId}
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-foreground/50">
              Transcribed HTML (live text)
            </h2>
            <div className="aspect-[2454/3128] overflow-hidden rounded-xl border border-foreground/10">
              <FlipchartSourceCardRenderer cardId={id} />
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-foreground/50">
              Master scan (faithful extraction)
            </h2>
            <div className="aspect-[2454/3128] overflow-hidden rounded-xl border border-foreground/10">
              <img
                src={card.masterImage}
                alt={`${card.section} master scan`}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
