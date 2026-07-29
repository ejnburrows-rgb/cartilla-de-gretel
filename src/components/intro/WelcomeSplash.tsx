import { Link } from "@tanstack/react-router";
import "@/styles/welcome-splash.css";

/**
 * WelcomeSplash — the pre-login first screen at "/" (src/routes/index.tsx).
 *
 * Direction (owner decision 2026-07-29): the PRE-LOGIN screen is a clean,
 * professional gateway — no mascots, no collage, no scene art, no kid-themed
 * creative before login. Child-appropriate illustration remains correct and
 * expected INSIDE the app (lessons, workbook, flipchart); this rule applies
 * to the pre-login gateway only.
 *
 * This supersedes the 2026-07-25 crowded-garden generated-scene direction
 * for this screen. The generated-art files and manifest are left in place,
 * untouched (repo rule: never delete files) — this component simply no
 * longer renders them.
 *
 * Everything on screen is real HTML/CSS text. No images load here at all,
 * which also makes this the fastest possible first paint on a slow school
 * network.
 */
export function WelcomeSplash() {
  return (
    <main className="wc-splash" data-testid="welcome-splash">
      <section className="wc-splash__panel">
        <p className="wc-splash__eyebrow">Método de lectoescritura</p>
        <h1 className="wc-splash__title">La Cartilla de Gretel</h1>
        <div className="wc-splash__rule" aria-hidden />
        <p className="wc-splash__subtitle">
          Cuaderno de trabajo digital y panel para docentes
        </p>
        <p className="wc-splash__byline">
          Edición digital del cuaderno de Leonor Lopetegui
        </p>
        <div className="wc-splash__cta-wrap">
          <Link to="/entrar" className="wc-splash__cta" data-testid="wc-entrar">
            Entrar
          </Link>
        </div>
      </section>
    </main>
  );
}
