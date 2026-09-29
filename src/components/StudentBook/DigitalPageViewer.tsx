import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import type { WorkbookPageEntry } from "./SimplePageViewer";
import { gretelEvent } from "@/lib/gretel-bus";
import "@/styles/digital-workbook.css";

const TURN_MS = 740;

export function DigitalPageViewer({
  pages,
  bookCompanion,
  exactReplica = false,
}: {
  pages: WorkbookPageEntry[];
  bookCompanion?: ReactNode;
  exactReplica?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const touchStart = useRef<number | null>(null);
  const firstReveal = useRef(true);

  const goTo = useCallback((target: number) => {
    if (target < 0 || target >= pages.length || target === index) return;
    gretelEvent("page-turn:start");
    setDirection(target > index ? "next" : "prev");
    setIndex(target);
  }, [index, pages.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable], .digital-page-canvas button")) return;
      if (event.key === "ArrowRight") { event.preventDefault(); goTo(index + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); goTo(index - 1); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, index]);

  useEffect(() => {
    const delay = firstReveal.current ? 180 : TURN_MS;
    firstReveal.current = false;
    const timer = window.setTimeout(() => {
      gretelEvent("page:revealed", {
        pageNumber: pages[index]?.pageNumber,
        text: pages[index]?.gretelLine,
      });
      gretelEvent("page-flip");
    }, delay);
    return () => window.clearTimeout(timer);
  }, [index, pages]);

  const page = pages[index];
  if (!page) return null;

  const pageLabel = page.pageNumber === index + 1
    ? `Página ${page.pageNumber} de ${pages.length}`
    : `Página ${page.pageNumber} · hoja ${index + 1} de ${pages.length}`;

  return (
    <div
      className={`digital-reader${exactReplica ? " digital-reader--exact" : ""}`}
      aria-label="Cuaderno interactivo de La Cartilla de Gretel"
      data-exact-replica={exactReplica || undefined}
    >
      {!exactReplica && (
        <div className="digital-reader__toolbar">
          <button type="button" className="digital-reader__nav-toggle" aria-expanded={navigatorOpen} onClick={() => setNavigatorOpen((open) => !open)}>
            <List size={18} /> Páginas
          </button>
          <span aria-live="polite">{pageLabel}</span>
        </div>
      )}

      <div className="digital-reader__content">
        {!exactReplica && navigatorOpen && (
          <nav className="digital-reader__page-list" aria-label="Navegación vertical de páginas">
            {pages.map((entry, target) => (
              <button
                type="button"
                key={entry.id}
                className={target === index ? "is-current" : ""}
                aria-current={target === index ? "page" : undefined}
                onClick={() => { goTo(target); setNavigatorOpen(false); }}
              >
                Página {entry.pageNumber}
              </button>
            ))}
          </nav>
        )}

        <div className="digital-reader__stage">
          <div
            className="digital-reader__page-slot"
            data-exact-page-slot={exactReplica || undefined}
            onClick={(event) => {
              if (!exactReplica) return;
              if (event.target instanceof HTMLElement && event.target.closest("button, input, textarea, select, [contenteditable], [data-interactive]")) return;
              const rect = event.currentTarget.getBoundingClientRect();
              const target = event.clientX - rect.left < rect.width / 2 ? index - 1 : index + 1;
              goTo(target);
            }}
            onTouchStart={(event) => {
              if (event.target instanceof HTMLElement && event.target.closest(".digital-region--grid, button, canvas, [data-interactive]")) {
                touchStart.current = null;
                return;
              }
              touchStart.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              if (touchStart.current === null) return;
              const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
              if (Math.abs(distance) > 55) goTo(index + (distance < 0 ? 1 : -1));
              touchStart.current = null;
            }}
          >
            <div key={page.id} className={`digital-reader__page-motion digital-reader__page-motion--${direction}`} style={{ ["--turn-ms" as string]: `${TURN_MS}ms` }}>
              {page.content}
            </div>
          </div>
          {!exactReplica && bookCompanion && <aside className="digital-reader__companion" aria-label="Gretel, guía del cuaderno">{bookCompanion}</aside>}
        </div>
      </div>

      {!exactReplica && (
        <div className="digital-reader__controls">
          <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Página anterior"><ChevronLeft size={20} /> Anterior</button>
          <span>{pageLabel}</span>
          <button type="button" onClick={() => goTo(index + 1)} disabled={index === pages.length - 1} aria-label="Página siguiente">Siguiente <ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  );
}
