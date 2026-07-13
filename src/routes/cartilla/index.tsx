import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Lock } from "lucide-react";
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
          <p className="home-landing__lead" style={{ marginInline: "auto", textAlign: "center" }}>
            El mundo mágico de las letras — listo para leer en clase o en casa.
          </p>

          <div className="home-landing__hero-col" style={{ marginTop: "1.25rem" }}>
            <BookHeroGretel
              size="md"
              objectPosition="center 20%"
              alt="Gretel te da la bienvenida en el jardín"
            />
          </div>

          <div className="home-landing__actions" style={{ maxWidth: 360, marginInline: "auto" }}>
            <Link
              to="/cartilla/unirse"
              className="home-landing__cta home-landing__cta--student"
              data-testid="cartilla-splash-enter"
            >
              ¡Entrar!
            </Link>
          </div>
        </section>
      </div>

      <div className="absolute bottom-6 inset-x-0 z-20 flex items-center justify-between px-6">
        <Link
          to="/cartilla/ayuda"
          className="min-h-12 px-4 py-3 rounded-full bg-white/80 hover:bg-white border border-[rgba(23,49,59,0.12)] text-[color:var(--home-ink,#17313b)] font-bold shadow-sm transition"
          aria-label="Ayuda"
        >
          Ayuda
        </Link>
        <Link
          to="/cartilla/teacher"
          className="min-h-12 min-w-12 p-3 rounded-full bg-white/80 hover:bg-white border border-[rgba(23,49,59,0.12)] text-[color:var(--home-ink,#17313b)] transition shadow-sm inline-flex items-center justify-center"
          aria-label="Acceso profesores"
          title="Acceso profesores"
        >
          <Lock className="w-5 h-5" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
