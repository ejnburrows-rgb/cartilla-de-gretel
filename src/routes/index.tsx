import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { gretelEvent } from "@/lib/gretel-bus";
import { BookHeroGretel } from "@/components/intro/BookHeroGretel";
import { HOME_GREETING } from "@/lib/gretel-voice";
import "@/styles/home-hero.css";
import "@/styles/gretel-presence.css";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "La Cartilla de Gretel" },
      {
        name: "description",
        content: "La Cartilla de Gretel — aprendamos a leer juntos.",
      },
    ],
  }),
});

/**
 * Public home — GretelPresence (real living host) + sole approved greeting
 * + high-contrast dual Entrar cards.
 *
 * Hero copy lock (operator): ONLY HOME_GREETING. No fabricated captions,
 * poetry, publisher credits, or sticker Gretel.
 */
function Landing() {
  useEffect(() => {
    gretelEvent("lesson:start");
  }, []);

  return (
    <main className="home-landing" data-testid="home-landing">
      <div className="home-landing__wash" aria-hidden />

      <div className="home-landing__inner">
        <section className="home-landing__panel" aria-labelledby="home-greeting">
          <p id="home-greeting" className="home-landing__greeting" data-testid="home-greeting">
            {HOME_GREETING}
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
          <BookHeroGretel size="lg" objectPosition="center 20%" autoIntro />
        </div>
      </div>
    </main>
  );
}
