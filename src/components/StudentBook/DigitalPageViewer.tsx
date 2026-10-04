import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import type { WorkbookPageEntry } from "./SimplePageViewer";
import { gretelEvent } from "@/lib/gretel-bus";
import {
  ELEGANT_EASE,
  STUDENT_PAGE_TURN_MS,
  prefersReducedMotion,
  studentFlipTransforms,
} from "@/lib/living-motion";
import "@/styles/digital-workbook.css";

export function DigitalPageViewer({
  pages,
  bookCompanion,
}: {
  pages: WorkbookPageEntry[];
  bookCompanion?: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [flipTransform, setFlipTransform] = useState("rotateY(0deg)");
  const [isTurning, setIsTurning] = useState(false);
  const touchStart = useRef<number | null>(null);
  const firstReveal = useRef(true);
  const revealTimer = useRef<number | undefined>(undefined);
  const turnTimer = useRef<number | undefined>(undefined);
  const turningRef = useRef(false);

  useEffect(() => {
    revealTimer.current = window.setTimeout(() => {
      if (!firstReveal.current) return;
      firstReveal.current = false;
      gretelEvent("page:revealed", {
        pageNumber: pages[0]?.pageNumber,
        text: pages[0]?.gretelLine,
      });
    }, 180);
    return () => {
      window.clearTimeout(revealTimer.current);
      window.clearTimeout(turnTimer.current);
    };
  }, [pages]);

  const settle = useCallback((target: number) => {
    setIndex(target);
    setTargetIndex(null);
    setIsTurning(false);
    turningRef.current = false;
    gretelEvent("page:revealed", {
      pageNumber: pages[target]?.pageNumber,
      text: pages[target]?.gretelLine,
    });
    gretelEvent("page-flip");
  }, [pages]);

  const goTo = useCallback((target: number) => {
    if (target < 0 || target >= pages.length || target === index || turningRef.current) return;

    turningRef.current = true;
    firstReveal.current = false;
    window.clearTimeout(revealTimer.current);
    gretelEvent("page-turn:start");
    const nextDirection: "next" | "prev" = target > index ? "next" : "prev";
    setDirection(nextDirection);
    setIsTurning(true);

    if (prefersReducedMotion()) {
      setTargetIndex(target);
      turnTimer.current = window.setTimeout(() => settle(target), 80);
      return;
    }

    const { start, end } = studentFlipTransforms(nextDirection);
    setTargetIndex(target);
    setFlipTransform(start);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFlipTransform(end));
    });
    turnTimer.current = window.setTimeout(() => settle(target), STUDENT_PAGE_TURN_MS);
  }, [index, pages.length, settle]);

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

  const page = pages[index];
  if (!page) return null;

  const destination = targetIndex === null ? undefined : pages[targetIndex];
  const flipFront = direction === "next" ? page : destination;
  const flipBack = direction === "next" ? destination : page;
  const pageLabel = page.pageNumber === index + 1
    ? `Página ${page.pageNumber} de ${pages.length}`
    : `Página ${page.pageNumber} · hoja ${index + 1} de ${pages.length}`;

  return (
    <div
      className="digital-reader"
      aria-label="Cuaderno interactivo de La Cartilla de Gretel"
      data-physical-workbook="true"
      data-page-turn-ms={STUDENT_PAGE_TURN_MS}
    >
      <div className="digital-reader__toolbar">
        <button type="button" className="digital-reader__nav-toggle" aria-expanded={navigatorOpen} onClick={() => setNavigatorOpen((open) => !open)}>
          <List size={18} /> Páginas
        </button>
        <span aria-live="polite">{pageLabel}</span>
      </div>

      <div className="digital-reader__content">
        {navigatorOpen && (
          <nav className="digital-reader__page-list" aria-label="Navegación vertical de páginas">
            {pages.map((entry, target) => (
              <button
                type="button"
                key={entry.id}
                className={target === index ? "is-current" : ""}
                aria-current={target === index ? "page" : undefined}
                disabled={isTurning}
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
            <div className="relative h-full w-full overflow-hidden rounded-lg" style={{ perspective: "1800px" }}>
              <div className="h-full w-full">
                {(isTurning && destination ? destination : page).content}
              </div>
              {isTurning && destination && !prefersReducedMotion() && (
                <div
                  className="absolute inset-0 z-30 pointer-events-none"
                  data-testid="workbook-turn-leaf"
                  style={{ transformStyle: "preserve-3d", perspective: "1800px" }}
                >
                  <div
                    className="workbook-flip-wrapper"
                    style={{
                      transform: flipTransform,
                      transition: `transform ${STUDENT_PAGE_TURN_MS}ms ${ELEGANT_EASE}`,
                    }}
                  >
                    <div className="workbook-page-front">
                      {flipFront?.content}
                      <div className="workbook-shadow-overlay" style={{ opacity: direction === "next" ? 1 : 0 }} />
                    </div>
                    <div className="workbook-page-back">
                      {flipBack?.content}
                      <div className="workbook-shadow-overlay" style={{ opacity: direction === "prev" ? 1 : 0 }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {bookCompanion && <aside className="digital-reader__companion" aria-label="Gretel, guía del cuaderno">{bookCompanion}</aside>}
        </div>
      </div>

      <div className="digital-reader__controls">
        <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0 || isTurning} aria-label="Página anterior"><ChevronLeft size={20} /> Anterior</button>
        <span>{pageLabel}</span>
        <button type="button" onClick={() => goTo(index + 1)} disabled={index === pages.length - 1 || isTurning} aria-label="Página siguiente">Siguiente <ChevronRight size={20} /></button>
      </div>
    </div>
  );
}
