import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getStudentSession } from "@/lib/student-session";
import { BookHeroGretel } from "@/components/intro/BookHeroGretel";
import { HOME_GREETING } from "@/lib/gretel-voice";
import "@/styles/home-hero.css";
import "@/styles/gretel-presence.css";

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
        <section className="home-landing__panel" style={{ textAlign: "center" }} aria-labelledby="cartilla-greeting">
          <p
            id="cartilla-greeting"
            className="home-landing__greeting"
            style={{ marginInline: "auto", textAlign: "center" }}
            data-testid="cartilla-greeting"
          >
            {HOME_GREETING}
          </p>

          <div className="home-landing__hero-col" style={{ marginTop: "1.15rem" }}>
            <BookHeroGretel size="md" objectPosition="center 18%" autoIntro={false} />
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
              Entrar como estudiante
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
