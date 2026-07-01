import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";
import { PdfPage } from "@/components/cartilla/PdfPage";
import type { PageRegion } from "@/lib/book-faithful";
import pilotLayouts from "@/data/page-layouts.pilot.json";

const PILOT_PAGES = [1, 2, 3, 4, 5, 6];

const pilotPages = (pilotLayouts as { pages: Record<string, { regions: PageRegion[] }> }).pages;

export const Route = createFileRoute("/cartilla/pilot-faithful/$n")({
  component: PilotFaithfulPage,
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isFinite(n) || !PILOT_PAGES.includes(n)) {
      throw redirect({ to: "/cartilla/pilot-faithful/$n", params: { n: "1" } });
    }
  },
});

function PilotFaithfulPage() {
  const { n } = Route.useParams();
  const pageNumber = Number(n);

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
          Pilot: faithful-HTML vs. original scan — página {pageNumber}
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          Placeholder content, not yet transcribed from the corrected source files.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {PILOT_PAGES.map((p) => (
            <Link
              key={p}
              to="/cartilla/pilot-faithful/$n"
              params={{ n: String(p) }}
              className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${
                p === pageNumber
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-foreground/15 hover:bg-secondary"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-foreground/50">
              Faithful HTML (new)
            </h2>
            <div className="overflow-hidden rounded-xl border border-foreground/10">
              <FaithfulPageRenderer
                pageNumber={pageNumber}
                lessonNumber={pageNumber <= 1 ? 1 : 2}
                regions={pilotPages[String(pageNumber)]?.regions}
              />
            </div>
          </div>
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-foreground/50">
              Original scan
            </h2>
            <div className="aspect-[2550/3301] overflow-hidden rounded-xl border border-foreground/10">
              <PdfPage pageNumber={pageNumber} className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
