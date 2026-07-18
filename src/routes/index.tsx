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

      <div className="home-splash__inner">
        <div className="home-splash__hero-wrap">
          <BookHeroGretel size="lg" objectPosition="center 20%" autoIntro />
        </div>

        <section className="home-landing__panel home-splash__panel" aria-labelledby="home-greeting">
          <p id="home-greeting" className="home-landing__greeting" data-testid="home-greeting">
            {HOME_GREETING}
          </p>

          <div className="home-landing__actions--stack" role="navigation" aria-label="Entrar">
            <Link
              to="/cartilla/unirse"
              className="home-landing__cta home-landing__cta--student"
              data-testid="home-cta-student"
            >
              Entrar como estudiante
            </Link>

            <Link
              to="/login"
              className="home-landing__cta home-landing__cta--teacher"
              data-testid="home-cta-teacher"
            >
              Entrar como maestro
            </Link>
          </div>

          <Link
            to="/cartilla/animales"
            className="home-landing__animals-link"
            data-testid="home-link-animals"
          >
            Conoce a los animales 🐾
          </Link>
        </section>
      </div>
    </main>
  );
}
