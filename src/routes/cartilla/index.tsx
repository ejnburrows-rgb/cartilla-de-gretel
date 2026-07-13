import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getStudentSession } from "@/lib/student-session";
import { BookHeroGretel } from "@/components/intro/BookHeroGretel";
import "@/styles/home-hero.css";

export const Route = createFileRoute("/cartilla/")({
  beforeLoad: () => {
    const session = getStudentSession();
    if (session) {
      throw redirect({ to: "/cartilla/lecciones" });
    }
  },
  component: CartillaSplash,
  head: () => ({
    meta: [{ title: "Entrar — La Cartilla de Gretel" }],
  }),
});

function CartillaSplash() {
  return (
    <main className="home-landing" data-testid="cartilla-splash">
      <div className="home-landing__wash" aria-hidden />

      <div className="home-landing__inner" style={{ maxWidth: 720 }}>
        <section className="home-landing__panel" style={{ textAlign: "center" }}>
          <p className="home-landing__eyebrow">¡Bienvenidos!</p>
          <h1 className="home-landing__title" style={{ textAlign: "center" }}>
            La Cartilla
            <br />
            <span>de Gretel</span>
          </h1>
          <p
            className="home-landing__lead"
            style={{ marginInline: "auto", textAlign: "center" }}
          >
            El mundo mágico de las letras — listo para leer en clase o en casa.
          </p>

          <div className="home-landing__hero-col" style={{ marginTop: "1.15rem" }}>
            <BookHeroGretel
              size="md"
              objectPosition="center 18%"
              alt="Gretel te da la bienvenida en el jardín"
            />
          </div>

          <div
            className="home-landing__actions home-landing__actions--stack"
            style={{ maxWidth: 400, marginInline: "auto" }}
          >
            <Link
              to="/cartilla/unirse"
              className="home-landing__cta home-landing__cta--student"
              data-testid="cartilla-splash-enter"
            >
              ¡Entrar como estudiante!
            </Link>
            <Link
              to="/login"
              className="home-landing__cta home-landing__cta--teacher"
              data-testid="cartilla-splash-teacher"
            >
              Entrar como maestro
            </Link>
          </div>
        </section>
      </div>

      <div className="home-landing__dock">
        <Link to="/cartilla/ayuda" aria-label="Ayuda">
          Ayuda
        </Link>
        <Link to="/login" aria-label="Acceso maestros" title="Acceso maestros">
          Maestro
        </Link>
      </div>
    </main>
  );
}
