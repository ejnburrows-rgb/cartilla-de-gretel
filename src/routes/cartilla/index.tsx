import { createFileRoute, Link } from "@tanstack/react-router";
import { GretelSceneMedia } from "@/components/gretel/GretelSceneMedia";
import { GRETEL_APPROVED_MASTER_SRC } from "@/lib/gretel-master";
import { getCinematicById } from "@/content/gretel-cinematics";
import "@/styles/home-hero.css";
import "@/styles/gretel-presence.css";

export const Route = createFileRoute("/cartilla/")({
  component: CartillaSplash,
  head: () => ({
    meta: [{ title: "Entrar — La Cartilla de Gretel" }],
  }),
});

function CartillaSplash() {
  const welcome = getCinematicById("master-welcome");

  return (
    <main className="home-landing" data-testid="cartilla-splash">
      <div className="home-landing__wash" aria-hidden />

      <div className="home-landing__inner" style={{ maxWidth: 720 }}>
        <section
          className="home-landing__panel"
          style={{ textAlign: "center" }}
          aria-labelledby="cartilla-greeting"
        >
          <p
            id="cartilla-greeting"
            className="home-landing__greeting"
            style={{ marginInline: "auto", textAlign: "center" }}
            data-testid="cartilla-greeting"
          >
            ¡Bienvenido a La Cartilla de Gretel!
          </p>

          <div
            className="home-landing__hero-col"
            style={{ marginTop: "1.15rem" }}
          >
            <GretelSceneMedia video={welcome?.video} fallback={GRETEL_APPROVED_MASTER_SRC}
              durationSeconds={6} loop />
          </div>

          <div
            className="home-landing__actions home-landing__actions--stack"
            style={{ maxWidth: 400, marginInline: "auto" }}
          >
            <Link
              to="/cartilla/lecciones"
              className="home-landing__cta home-landing__cta--student"
              data-testid="cartilla-splash-enter"
            >
              Comenzar
            </Link>
            <Link
              to="/cartilla/practica"
              className="home-landing__cta home-landing__cta--student"
              data-testid="cartilla-splash-games"
            >
              Juegos interactivos
            </Link>
            <Link
              to="/cartilla/cuaderno"
              className="home-landing__cta home-landing__cta--student"
              data-testid="cartilla-splash-workbook"
            >
              Ver cuaderno completo
            </Link>
            <Link
              to="/cartilla/teacher/crm"
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
        <Link
          to="/cartilla/teacher/crm"
          aria-label="Acceso maestros"
          title="Acceso maestros"
        >
          Maestro
        </Link>
      </div>
    </main>
  );
}
