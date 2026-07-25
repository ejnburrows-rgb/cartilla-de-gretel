import { Link } from "@tanstack/react-router";
import "@/styles/welcome-splash.css";
import { getGeneratedScene } from "@/lib/generated-art";

/**
 * WelcomeSplash — the "¡Bienvenidos!" first screen at "/" (src/routes/index.tsx).
 *
 * Direction (owner decision 2026-07-25, issue #345): ONE cohesive crowded-garden
 * welcome scene, superseding both #243's "Gretel alone" and the earlier cutout
 * collage. The collage was rejected as unprofessional — the repo's faithful
 * crops come from several different print styles and no layout technique fuses
 * them into one scene — so the scene art is a single generated illustration,
 * which AGENTS.md permits for the splash and app chrome (never for lesson
 * content).
 *
 * The image is generated and approved by the OWNER; this component only wires
 * in whatever the generated-art manifest says is approved. If nothing is
 * approved yet, it falls back to the existing painted garden plate (real book
 * art) so the screen always works.
 *
 * TEXT IS NEVER BAKED INTO THE PICTURE. The headline, the subtitle and the
 * Entrar button are real HTML/CSS, so they stay selectable, screen-reader
 * readable and crisp at any zoom — and can be corrected without regenerating
 * artwork.
 */

/** Fallback: the painted garden plate already used elsewhere (real book art). */
const GARDEN_FALLBACK = "/art/hd/garden/base.jpg";

export function WelcomeSplash() {
  const scene = getGeneratedScene("welcome-splash");
  const src = scene?.src ?? GARDEN_FALLBACK;
  // Narrow screens get the smaller encoding of the same picture when one exists.
  const srcSet = scene?.srcSmall ? `${scene.srcSmall} 900w, ${scene.src} 1536w` : undefined;

  return (
    <main className="wc-splash" data-testid="welcome-splash">
      <img
        src={src}
        srcSet={srcSet}
        sizes="100vw"
        alt=""
        aria-hidden
        className="wc-splash__scene"
        draggable={false}
        fetchPriority="high"
        decoding="async"
      />
      {/* Warm scrim: lifts the headline off the busy scene without dulling it. */}
      <div className="wc-splash__scrim" aria-hidden />

      <header className="wc-splash__headline">
        <h1 className="wc-splash__title">¡Bienvenidos!</h1>
        <p className="wc-splash__subtitle">La Cartilla de Gretel</p>
      </header>

      <div className="wc-splash__cta-wrap">
        <Link to="/entrar" className="wc-splash__cta" data-testid="wc-entrar">
          Entrar
        </Link>
      </div>
    </main>
  );
}
