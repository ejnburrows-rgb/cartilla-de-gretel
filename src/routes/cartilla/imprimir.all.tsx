import type { CSSProperties } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { getWorkbookPagesForLesson } from "@/lib/book-faithful";
import { getCartillaCrmCssVars, getCartillaCrmTheme } from "@/lib/cartilla-crm-theme";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";
import { PolishedPage } from "@/components/cartilla/PolishedPage";
import "@/styles/student-print.css";

export const Route = createFileRoute("/cartilla/imprimir/all")({
  component: PrintableBinderRoute,
  head: () => ({
    meta: [
      { title: "Imprimir libro completo - La Cartilla de Gretel" },
      {
        name: "description",
        content: "Binder imprimible con las 24 lecciones completas de La Cartilla de Gretel.",
      },
    ],
  }),
});

function PrintableBinderRoute() {
  const lessons = CATALOG.slice(0, TOTAL_LESSONS);

  return (
    <main className="student-print-binder">
      <div className="student-print-actions">
        <Link to="/cartilla/libro" className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Libro
        </Link>
        <button type="button" className="inline-flex items-center gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Imprimir binder
        </button>
      </div>

      <div className="student-print-stack">
        <section className="student-print-cover" style={{ "--lesson-accent": "#2a9d8f" } as CSSProperties}>
          <p>La Cartilla de Gretel</p>
          <h1>Libro completo del estudiante</h1>
          <p>24 lecciones · paginas originales del cuaderno · listo para carpeta imprimible</p>
        </section>

        {lessons.map((entry) => {
          const theme = getCartillaCrmTheme(entry.n);
          const pages = getWorkbookPagesForLesson(entry.n);
          const cssVars = getCartillaCrmCssVars(entry.n) as CSSProperties;
          const style = { ...cssVars, "--lesson-accent": theme.accent } as CSSProperties;

          return (
            <section key={entry.n} className="student-print-lesson" style={style}>
              <div className="student-print-cover">
                <p>Leccion {entry.n} de {TOTAL_LESSONS}</p>
                <h1>{entry.title}</h1>
                {entry.subtitle ? <p>{entry.subtitle}</p> : null}
                <p>Paginas {entry.pages}</p>
              </div>

              {pages.map((page) => (
                <article key={`${entry.n}-${page.pageNumber}`} className="student-print-page">
                  <PolishedPage pageNumber={page.pageNumber} lessonN={entry.n} hideBadge />
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </main>
  );
}
