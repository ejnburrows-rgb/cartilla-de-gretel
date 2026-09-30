import { useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";
import { lessonForWorkbookPage, SOURCE_BLOCKED_WORKBOOK_PAGES } from "@/lib/workbook-pages";

/** Every printed instructional Workbook page (1–90) can be opened here for
 * source-vs-digital QA. The left column is exactly what the student sees in the
 * lesson (native interactive renderer); the right column is the raw book scan. */
const QA_PAGES = Array.from({ length: 90 }, (_, i) => i + 1);

export const Route = createFileRoute("/cartilla/pilot-faithful/$n")({
  component: PilotFaithfulPage,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  beforeLoad: ({ params }) => {
    const n = Number(params.n);
    if (!Number.isInteger(n) || !QA_PAGES.includes(n)) {
      throw redirect({ to: "/cartilla/pilot-faithful/$n", params: { n: "1" } });
    }
  },
});

function SourceScan({ pageNumber }: { pageNumber: number }) {
  const [failed, setFailed] = useState(false);
  if (SOURCE_BLOCKED_WORKBOOK_PAGES.includes(pageNumber) || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-stone-50 p-8 text-center text-sm font-bold text-stone-500" role="status">
        Escaneo fuente no disponible para la página {pageNumber} — la página no se inventa.
      </div>
    );
  }
  return (
    <img
      key={pageNumber}
      src={`/cartilla/art/source/workbook/page-${String(pageNumber).padStart(3, "0")}.jpg`}
      alt={`Escaneo del libro, página ${pageNumber}`}
      className="h-full w-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function PilotFaithfulPage() {
  const { n } = Route.useParams();
  const pageNumber = Number(n);
  const lesson = lessonForWorkbookPage(pageNumber);

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/cartilla"
          className="inline-flex items-center gap-2 text-sm font-bold text-foreground/70 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Cartilla
        </Link>

        <h1 className="mt-3 text-2xl font-black">
          Libro vs. digital — página {pageNumber} · Lección {lesson}
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          Control de calidad: a la izquierda la página tal como la ve el estudiante; a la derecha
          el escaneo del libro del alumno.
        </p>

        <nav className="mt-4 flex flex-wrap gap-1.5" aria-label="Páginas del cuaderno">
          {QA_PAGES.map((p) => (
            <Link
              key={p}
              to="/cartilla/pilot-faithful/$n"
              params={{ n: String(p) }}
              className={`min-w-10 rounded-lg border px-2.5 py-1.5 text-center text-sm font-bold ${
                p === pageNumber
                  ? "border-primary bg-primary text-primary-foreground"
                  : SOURCE_BLOCKED_WORKBOOK_PAGES.includes(p)
                    ? "border-amber-400 text-amber-700 hover:bg-amber-50"
                    : "border-foreground/15 hover:bg-secondary"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section data-qa="digital">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-foreground/50">
              Digital (estudiante)
            </h2>
            {/* Same container the student lesson viewer uses, so this shows exactly what the child sees. */}
            <div className="native-lesson-viewer__content overflow-hidden rounded-xl border border-foreground/10 bg-[#fffaf0] p-4">
              <FaithfulPageRenderer key={pageNumber} pageNumber={pageNumber} lessonNumber={lesson} interactive native />
            </div>
          </section>
          <section data-qa="source">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-foreground/50">
              Libro del alumno (escaneo)
            </h2>
            <div className="aspect-[935/1210] overflow-hidden rounded-xl border border-foreground/10 bg-white">
              <SourceScan pageNumber={pageNumber} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
