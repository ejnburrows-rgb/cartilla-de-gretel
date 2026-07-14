import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LivingWorkbookPage } from "@/components/cartilla/LivingWorkbookPage";
import {
  getWorkbookPage,
  listAvailablePhysicalPages,
  getWorkbookManifest,
} from "@/content/workbook/loader";

export const Route = createFileRoute("/cartilla/student/libro-vivo")({
  component: LibroVivoPage,
  head: () => ({
    meta: [
      { title: "Libro vivo — La Cartilla de Gretel" },
      {
        name: "description",
        content:
          "Páginas del manifiesto oficial renderizadas con el motor LivingWorkbookPage.",
      },
    ],
  }),
});

/**
 * Production student route for the living workbook engine.
 * Uses only real manifest pages (never invents content). Navigation is
 * refresh-safe via the `?p=` query param.
 */
function LibroVivoPage() {
  const available = useMemo(() => listAvailablePhysicalPages(), []);
  const manifest = useMemo(() => getWorkbookManifest(), []);
  const [pageNumber, setPageNumber] = useState(() => {
    if (typeof window === "undefined") return available[0] ?? 1;
    const q = new URLSearchParams(window.location.search).get("p");
    const n = Number(q);
    return Number.isFinite(n) && available.includes(n) ? n : available[0] ?? 1;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("p", String(pageNumber));
    window.history.replaceState({}, "", url.toString());
  }, [pageNumber]);

  const page = getWorkbookPage(pageNumber);
  const idx = available.indexOf(pageNumber);
  const prev = idx > 0 ? available[idx - 1] : null;
  const next = idx >= 0 && idx < available.length - 1 ? available[idx + 1] : null;

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      <header className="px-4 py-3 border-b border-stone-200 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/cartilla/student/libro"
            className="inline-flex items-center gap-2 min-h-12 px-4 py-3 rounded-2xl border-2 border-stone-300 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            Libro clásico
          </Link>
          <div className="text-sm font-bold text-stone-600">
            Manifiesto {manifest.version} · {available.length} páginas
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-3xl w-full mx-auto space-y-4">
        <h1 className="text-2xl font-black">Libro vivo</h1>
        <p className="text-stone-600 text-sm">
          Motor canónico LivingWorkbookPage con las páginas reales del manifiesto.
          Las interacciones declaradas como «none» se muestran sin ejercicio inventado.
        </p>

        <label className="block text-sm font-bold">
          Página física
          <select
            className="mt-1 w-full min-h-12 rounded-2xl border-2 border-stone-300 px-3 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400"
            value={pageNumber}
            onChange={(e) => setPageNumber(Number(e.target.value))}
            aria-label="Seleccionar página del libro"
          >
            {available.map((p) => (
              <option key={p} value={p}>
                Página {p}
              </option>
            ))}
          </select>
        </label>

        {page ? (
          <LivingWorkbookPage page={page} />
        ) : (
          <div
            className="rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 p-8 text-center font-bold text-amber-900"
            role="status"
          >
            No hay datos de censo para la página {pageNumber}. No se inventa contenido.
          </div>
        )}
      </main>

      <nav className="sticky bottom-0 border-t border-stone-200 bg-white/95 backdrop-blur p-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={prev == null}
            onClick={() => prev != null && setPageNumber(prev)}
            className="min-h-12 min-w-12 px-5 py-3 rounded-2xl border-2 border-stone-300 font-bold disabled:opacity-40 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400"
            aria-label="Página anterior"
          >
            <ArrowLeft className="w-5 h-5 inline" aria-hidden="true" /> Anterior
          </button>
          <span className="text-sm font-bold">
            {idx + 1} / {available.length}
          </span>
          <button
            type="button"
            disabled={next == null}
            onClick={() => next != null && setPageNumber(next)}
            className="min-h-12 min-w-12 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold disabled:opacity-40 focus-visible:outline focus-visible:outline-4 focus-visible:outline-amber-400"
            aria-label="Página siguiente"
          >
            Siguiente <ArrowRight className="w-5 h-5 inline" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </div>
  );
}
