import type { CSSProperties } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, MonitorPlay, Play } from "lucide-react";
import { KioskoShell } from "@/components/cartilla/KioskoShell";
import { CATALOG, TOTAL_LESSONS } from "@/lib/lesson-catalog";

const PRESENTAR_ROUTE = "/cartilla/presentar/$n" as any;

export const Route = createFileRoute("/cartilla/kiosko" as any)({
  component: KioskoRoute,
});

function KioskoRoute() {
  const navigate = useNavigate();

  const goToLesson = (n: number) => {
    navigate({ to: PRESENTAR_ROUTE, params: { n: String(n) } });
  };

  return (
    <KioskoShell
      title="La Cartilla de Gretel"
      subtitle="Vista de salon para presentar lecciones en pantalla grande."
      progressLabel={`${TOTAL_LESSONS} lecciones`}
      backTo="/cartilla"
      backLabel="Inicio"
      previousLabel="Libro"
      nextLabel="Empezar"
      onPrevious={() => navigate({ to: "/cartilla/lecciones" })}
      onNext={() => goToLesson(1)}
    >
      <section className="kiosko-overview" aria-label="Lecciones para presentar">
        <div className="kiosko-hero-panel">
          <div>
            <div className="kiosko-hero-kicker">
              <MonitorPlay aria-hidden />
              <span>Smartboard</span>
            </div>
            <h2>Texto grande, alto contraste y controles por flechas.</h2>
            <p>
              Usa las flechas, Page Up/Page Down, Enter, espacio o un click remoto para avanzar.
              Presiona F para pantalla completa.
            </p>
          </div>
          <button type="button" className="kiosko-start-button" onClick={() => goToLesson(1)}>
            <Play aria-hidden />
            Presentar leccion 1
          </button>
        </div>

        <div className="kiosko-lesson-grid">
          {CATALOG.map((lesson) => (
            <button
              key={lesson.n}
              type="button"
              className="kiosko-lesson-card"
              onClick={() => goToLesson(lesson.n)}
              style={{ "--lesson-accent": lesson.color } as CSSProperties}
            >
              <span className="kiosko-lesson-number">{lesson.n}</span>
              <span className="kiosko-lesson-copy">
                <strong>{lesson.title}</strong>
                <small>{lesson.pages ? `Paginas ${lesson.pages}` : lesson.subtitle}</small>
              </span>
              <BookOpen aria-hidden />
            </button>
          ))}
        </div>
      </section>
    </KioskoShell>
  );
}
