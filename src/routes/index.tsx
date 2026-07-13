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

function Landing() {
  useEffect(() => {
    gretelEvent("lesson:start");
  }, []);

  return (
    <main className="home-landing" data-testid="home-landing">
      <div className="home-landing__wash" aria-hidden />

      <div className="home-landing__inner">
        {/* Copy + entry paths */}
        <section className="home-landing__panel" aria-labelledby="home-title">
          <p className="home-landing__eyebrow">La Cartilla de Gretel</p>
          <h1 id="home-title" className="home-landing__title">
            Leer juntos
            <br />
            <span>con Gretel</span>
          </h1>
          <p className="home-landing__lead">
            Un libro de lectura cálido y profesional para los más pequeños — letras
            claras, arte fiel y mucha imaginación.
          </p>

          <div className="home-landing__actions">
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
              Portal para maestros
            </Link>
          </div>
        </section>

        {/* Full painted scene — not a transparent PNG sticker */}
        <div className="home-landing__hero-col">
          <BookHeroGretel
            size="lg"
            caption="Gretel te espera en el jardín de las letras"
            objectPosition="center 22%"
          />
        </div>
      </div>
    </main>
  );
}
