import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Printer, ArrowLeft } from "lucide-react";
import { CATALOG } from "@/lib/lesson-catalog";
import { parsePageRange } from "@/lib/workbook-source";
import { getBookPageImage } from "@/lib/bookImages";
import { hasPageLayout } from "@/lib/book-faithful";
import { FaithfulPageRenderer } from "@/components/cartilla/FaithfulPageRenderer";
import { PdfPage } from "@/components/cartilla/PdfPage";
import "@/styles/student-print.css";

/** Print all of the selected book's pages, without invented substitute exercises. */
export function PrintableWorkbook({ lesson }: { lesson?: number }) {
  const entries = lesson ? CATALOG.filter(entry => entry.n === lesson) : CATALOG;
  const pages = [...new Set(entries.flatMap(entry => parsePageRange(entry.pages)))];
  const [status, setStatus] = useState<Record<number, boolean>>({});
  const structured = (page: number) => !getBookPageImage(page) && hasPageLayout(page);
  const ready = pages.every(page => structured(page) || status[page] === true);
  const missing = pages.filter(page => status[page] === false);
  return <div className="workbook-print-view min-h-screen bg-white">
    <header className="no-print max-w-3xl mx-auto p-4 space-y-4">
      <Link to="/cartilla/teacher" className="inline-flex items-center gap-2 font-bold"><ArrowLeft size={20} /> Panel del docente</Link>
      <h1 className="text-2xl font-black">{lesson ? `Cuaderno · Lección ${lesson}` : "Cuaderno completo"}</h1>
      <div className="flex flex-wrap items-center gap-3">
        <label className="font-bold">Imprimir
          <select aria-label="Seleccionar páginas para imprimir" value={lesson ?? "all"} className="block rounded-xl border p-3 mt-1" onChange={event => window.location.assign(`/cartilla/imprimir/${event.target.value}`)}>
            <option value="all">Todas las lecciones</option>
            {CATALOG.map(entry => <option key={entry.n} value={entry.n}>{entry.n} · {entry.title}</option>)}
          </select>
        </label>
        <button disabled={!ready} onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-amber-900 text-white font-bold p-3 disabled:opacity-50"><Printer size={20} /> Imprimir {pages.length} páginas</button>
      </div>
      <p role="status">{missing.length ? `No se pudieron cargar las páginas ${missing.join(", ")}. Recarga antes de imprimir.` : ready ? "Todas las páginas listas. También puedes guardar como PDF en el diálogo de impresión." : "Cargando las páginas antes de imprimir…"}</p>
    </header>
    <main className="max-w-3xl mx-auto">
      {pages.map(page => <section key={page} className="workbook-print-sheet" aria-label={`Hoja ${page}`}>
        {structured(page) ? <FaithfulPageRenderer pageNumber={page} interactive={false} /> : <PdfPage pageNumber={page} eager onStatus={loaded => setStatus(previous => previous[page] === loaded ? previous : { ...previous, [page]: loaded })} />}
      </section>)}
    </main>
  </div>;
}
