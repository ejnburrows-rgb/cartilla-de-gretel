import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookHeroGretel } from "@/components/intro/BookHeroGretel";
import { HOME_GREETING } from "@/lib/gretel-voice";
import { GretelCinematic } from "@/components/gretel/GretelCinematic";
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
  const [onboardingStep, setOnboardingStep] = useState<0 | 1 | 2>(2);

  useEffect(() => {
    try {
      setOnboardingStep(localStorage.getItem("cartilla.gretel.onboarding.v1") === "done" ? 2 : 0);
    } catch {
      setOnboardingStep(0);
    }
  }, []);

  const finishOnboarding = () => {
    try {
      localStorage.setItem("cartilla.gretel.onboarding.v1", "done");
    } catch {
      /* onboarding still completes for this visit */
    }
    setOnboardingStep(2);
  };

  const welcome = getCinematicById("master-welcome");
  const howTo = getCinematicById("how-to");

  return (
    <main className="home-landing" data-testid="cartilla-splash">
      {onboardingStep === 0 && welcome && (
        <GretelCinematic cinematic={welcome} onComplete={() => setOnboardingStep(1)} />
      )}
      {onboardingStep === 1 && howTo && (
        <GretelCinematic cinematic={howTo} onComplete={finishOnboarding} />
      )}
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
            {HOME_GREETING}
          </p>

          <div
            className="home-landing__hero-col"
            style={{ marginTop: "1.15rem" }}
          >
            <BookHeroGretel
              size="md"
              objectPosition="center 18%"
              autoIntro={false}
            />
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
              Entrar como estudiante
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
