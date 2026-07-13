import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { gretelEvent } from "@/lib/gretel-bus";
import { BookHeroGretel } from "@/components/intro/BookHeroGretel";
import "@/styles/home-hero.css";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel" },
      {
        name: "description",
        content: "Libro de lectura para estudiantes de K-2 en Miami-Dade.",
      },
    ],
  }),
});

/**
 * Public home face-lift — book pastel wash, full-scene Gretel hero,
 * high-contrast dual Entrar cards (student / teacher).
 *
 * Contrast pairs (primary CTAs):
 * - Student: #ffffff on #e11d48 (rose-600) — solid saturated fill
 * - Teacher: #ffffff on #0369a1 (sky-700) — solid saturated fill
 * Never light-gray-on-cream ghost buttons.
 */
function Landing() {
  useEffect(() => {
    gretelEvent("lesson:start");
  }, []);

  return (
    <main className="home-landing" data-testid="home-landing">
      <div className="home-landing__wash" aria-hidden />

      <div className="home-landing__inner">
        <section className="home-landing__panel" aria-labelledby="home-title">
          <p className="home-landing__eyebrow">Bienvenidos</p>
          <h1 id="home-title" className="home-landing__title">
            La Cartilla
            <br />
            <span>de Gretel</span>
          </h1>
          <p className="home-landing__lead">
            Un libro de lectura cálido y colorido para los más pequeños — letras
            claras, arte fiel y mucha imaginación.
          </p>

          <div className="home-landing__actions" role="navigation" aria-label="Entrar">
            <Link
              to="/cartilla/unirse"
              className="home-entry-card home-entry-card--student"
              data-testid="home-cta-student"
            >
              <span className="home-entry-card__label">Estudiantes</span>
              <p className="home-entry-card__title">Código de clase y lecciones</p>
              <span className="home-landing__cta home-landing__cta--student">
                Entrar como estudiante
              </span>
            </Link>

            <Link
              to="/login"
              className="home-entry-card home-entry-card--teacher"
              data-testid="home-cta-teacher"
            >
              <span className="home-entry-card__label">Maestros</span>
              <p className="home-entry-card__title">Portal, clases y flipchart</p>
              <span className="home-landing__cta home-landing__cta--teacher">
                Entrar como maestro
              </span>
            </Link>
          </div>
        </section>

        <div className="home-landing__hero-col">
          <BookHeroGretel
            size="lg"
            caption="Gretel te espera en el jardín de las letras"
            objectPosition="center 20%"
          />
        </div>
      </div>

      <p className="home-landing__footer" data-testid="home-footer-credits">
        <strong>Leonor Lopetegui</strong>
        {" · "}
        LANY Books
      </p>
    </main>
  );
}
