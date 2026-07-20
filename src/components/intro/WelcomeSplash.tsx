import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import "@/styles/welcome-splash.css";

/**
 * WelcomeSplash — "¡Bienvenidos!" first screen (src/routes/index.tsx).
 *
 * Self-contained: does not import GretelLiveAvatar/gretelMachine/gretelPoses
 * (the shared animation state machine) or GretelPresence. All motion here is
 * built from scratch, scoped to this component, using only real cutout
 * pixels + CSS transforms/opacity — never a redraw or new art.
 *
 * Art sources:
 *  - Gretel: public/cartilla/images/gretel/poses/ — only the clean-alpha,
 *    matching-outfit frames (idle, closed-idle, talk, point) are used. The
 *    other delivered frames (gretel-blink/wave-1/wave-2/cheer-1/talk-1/
 *    talk-2/wave-exit) were found to have an opaque baked-in black or
 *    checkerboard canvas instead of real transparency (verified with sharp
 *    pixel sampling) — real pixels, but not usable as a free-floating
 *    cutout without inventing a matte, so this component avoids them.
 *  - Animal crowd: 16 of the 18 PASS crops curated in
 *    src/content/animal-gallery.ts, plus 2 substitutes (burro, catalina —
 *    also PASS in qa-results.json, just not in that curated file) swapped
 *    in for perro/jicotea, whose real book crops are full-bleed painted
 *    scenes (their own sky/grass background baked in), not white-paper
 *    cutouts — wrong style for a free-floating crowd here, so this
 *    splash uses different real animal words instead of stretching those
 *    two to fit. White-paper corners on every other crop drop out via the
 *    existing global art-blend.ts multiply safety net (src/main.tsx),
 *    same as every other faithful crop on the site — no new blending
 *    code needed here.
 *  - Background: public/art/hd/garden/base.jpg, the existing soft garden
 *    wash already used for page backgrounds (src/components/intro/
 *    BookHeroGretel.tsx's GRETEL_GARDEN_WASH) — real derived book art, not
 *    invented.
 */

const GRETEL_POSES_DIR = "/cartilla/images/gretel/poses";
const GRETEL_IDLE = `${GRETEL_POSES_DIR}/gretel-idle.webp`;
const GRETEL_BLINK = `${GRETEL_POSES_DIR}/gretel-closed-idle.webp`;
const GRETEL_TALK = `${GRETEL_POSES_DIR}/gretel-talk.webp`;
const GRETEL_POINT = `${GRETEL_POSES_DIR}/gretel-point.webp`;

const MEADOW_BG = "/art/hd/garden/base.jpg";

type Zone = "bg" | "left" | "right" | "fg";

interface Critter {
  word: string;
  src: string;
  zone: Zone;
  /** Left position, percent of stage width. */
  left: number;
  /** Bottom position, percent of stage height (depth cue — bg sits high near the tree line, fg sits low at the very edge). */
  bottom: number;
  /** Height, percent of stage height (each critter scales by height, not width, so a tall giraffe and a squat frog both read at a believable size). */
  height: number;
  /** Stacking order within its zone. */
  z: number;
  /** Seconds before this critter's breathing loop starts, so the crowd never moves in sync. */
  breathDelay: number;
  flip?: boolean;
  /** Percent to crop off the bottom of the source image (e.g. mono.webp prints the word "mono" under the illustration in the book — real pixels, just not meant to float in a meadow, so it's cropped via CSS rather than shown or swapped for an invented asset). */
  clipBottomPct?: number;
}

/* 18 real animal crops, every one PASS in qa-results.json (16 from the
 * curated src/content/animal-gallery.ts, plus burro + catalina — see the
 * file header for why those two stand in for perro/jicotea). Positions
 * are hand-placed in four depth zones: small far background, left/right
 * clusters flanking Gretel, and two close foreground critters low in the
 * frame. */
const CRITTERS: Critter[] = [
  // ── mid-background (small, up near the tree line) ──
  {
    word: "águila",
    src: "/cartilla/art/faithful/leccion-1/aguila.webp",
    zone: "bg",
    left: 10,
    bottom: 46,
    height: 12,
    z: 1,
    breathDelay: 0.2,
  },
  {
    word: "araña",
    src: "/cartilla/art/faithful/vocal-a/arana.webp",
    zone: "bg",
    left: 20,
    bottom: 40,
    height: 9,
    z: 1,
    breathDelay: 1.4,
  },
  {
    word: "elefante",
    src: "/cartilla/art/faithful/vocal-e/elefante.webp",
    zone: "bg",
    left: 30.5,
    bottom: 37,
    height: 13,
    z: 1,
    breathDelay: 2.1,
  },
  {
    word: "iguana",
    src: "/cartilla/art/faithful/vocal-i/iguana.webp",
    zone: "bg",
    left: 68,
    bottom: 44,
    height: 10,
    z: 1,
    breathDelay: 0.7,
  },
  {
    word: "mono",
    src: "/cartilla/art/faithful/leccion-7-m/mono.webp",
    zone: "bg",
    left: 77,
    bottom: 41,
    height: 12.5,
    z: 1,
    breathDelay: 1.9,
    clipBottomPct: 18,
  },
  {
    word: "pez",
    src: "/cartilla/art/faithful/leccion-1/pez.webp",
    zone: "bg",
    left: 87,
    bottom: 39,
    height: 9,
    z: 1,
    breathDelay: 3.0,
    flip: true,
  },

  // ── left cluster ──
  {
    word: "oso",
    src: "/cartilla/art/faithful/vocal-o/oso.webp",
    zone: "left",
    left: 8,
    bottom: 9,
    height: 18,
    z: 3,
    breathDelay: 0.4,
  },
  {
    word: "oveja",
    src: "/cartilla/art/faithful/vocal-o/oveja.webp",
    zone: "left",
    left: 19,
    bottom: 5,
    height: 14,
    z: 4,
    breathDelay: 1.7,
  },
  {
    word: "conejo",
    src: "/cartilla/art/faithful/leccion-19-c/conejo.webp",
    zone: "left",
    left: 2,
    bottom: 2,
    height: 11,
    z: 5,
    breathDelay: 2.6,
  },
  {
    word: "ardilla",
    src: "/cartilla/art/faithful/vocal-a/ardilla.webp",
    zone: "left",
    left: 27,
    bottom: 14,
    height: 11,
    z: 4,
    breathDelay: 0.9,
    flip: true,
  },
  {
    word: "erizo",
    src: "/cartilla/art/faithful/vocal-e/erizo.webp",
    zone: "left",
    left: 14,
    bottom: 15,
    height: 8,
    z: 5,
    breathDelay: 3.3,
  },

  // ── right cluster ──
  {
    word: "zorro",
    src: "/cartilla/art/faithful/leccion-23-z/zorro.webp",
    zone: "right",
    left: 85,
    bottom: 9,
    height: 16,
    z: 3,
    breathDelay: 0.6,
    flip: true,
  },
  {
    word: "burro",
    src: "/cartilla/art/faithful/leccion-18-rr/burro.webp",
    zone: "right",
    left: 66,
    bottom: 4,
    height: 14,
    z: 4,
    breathDelay: 2.2,
  },
  {
    word: "jirafa",
    src: "/cartilla/art/faithful/leccion-21-j/jirafa.webp",
    zone: "right",
    left: 94,
    bottom: 12,
    height: 21,
    z: 2,
    breathDelay: 1.1,
  },
  {
    word: "sapo",
    src: "/cartilla/art/faithful/leccion-9-s/sapo.webp",
    zone: "right",
    left: 58,
    bottom: 3,
    height: 9,
    z: 5,
    breathDelay: 3.6,
  },
  {
    word: "catalina",
    src: "/cartilla/art/faithful/leccion-19-c/catalina.webp",
    zone: "right",
    left: 77,
    bottom: 15,
    height: 8,
    z: 5,
    breathDelay: 2.8,
  },

  // ── foreground (close, low in frame) ──
  {
    word: "rana",
    src: "/cartilla/art/faithful/leccion-17-r/rana.webp",
    zone: "fg",
    left: 5,
    bottom: -1,
    height: 12,
    z: 6,
    breathDelay: 0.3,
  },
  {
    word: "gusano",
    src: "/cartilla/art/faithful/leccion-19-g/gusano.webp",
    zone: "fg",
    left: 84,
    bottom: -1,
    height: 7,
    z: 6,
    breathDelay: 1.6,
    flip: true,
  },
];

/** True while the user has NOT asked the OS for reduced motion. */
function useMotionAllowed(): boolean {
  const [allowed, setAllowed] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setAllowed(!mq.matches);
    const onChange = () => setAllowed(!mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return allowed;
}

/**
 * Fires `trigger` (bumps a counter to retrigger a CSS animation) at random
 * natural intervals between minMs and maxMs. No-ops entirely when motion is
 * not allowed, so reduced-motion users never pay even the timer cost.
 */
function useRandomPulse(minMs: number, maxMs: number, enabled: boolean, initialDelayMs = 0) {
  const [tick, setTick] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const schedule = (delay: number) => {
      timeoutRef.current = setTimeout(() => {
        if (cancelled) return;
        setTick((t) => t + 1);
        schedule(minMs + Math.random() * (maxMs - minMs));
      }, delay);
    };
    schedule(initialDelayMs || minMs + Math.random() * (maxMs - minMs));

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, minMs, maxMs]);

  return tick;
}

/** One critter in the meadow: breathing loop + a brief head-band squash-blink. */
function CritterFigure({ critter, motionOn }: { critter: Critter; motionOn: boolean }) {
  const blinkTick = useRandomPulse(2600, 6200, motionOn, 800 + Math.random() * 4000);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (blinkTick === 0) return;
    setBlinking(true);
    const t = setTimeout(() => setBlinking(false), 170);
    return () => clearTimeout(t);
  }, [blinkTick]);

  // When clipBottomPct is set, the source image is rendered taller than the
  // visible box and the overflow is clipped, so a printed word baked under
  // an illustration (real pixels) never floats loose in the meadow.
  const oversizeHeight = critter.clipBottomPct ? `${100 / (1 - critter.clipBottomPct / 100)}%` : "100%";
  const flipTransform = critter.flip ? "scaleX(-1)" : undefined;

  return (
    <div
      className={`wc-critter wc-critter--${critter.zone}`}
      style={
        {
          left: `${critter.left}%`,
          bottom: `${critter.bottom}%`,
          height: `${critter.height}%`,
          zIndex: critter.z,
          "--wc-breath-delay": `${critter.breathDelay}s`,
        } as React.CSSProperties
      }
      data-testid={`wc-critter-${critter.word}`}
    >
      <div
        className={`wc-critter__breath${motionOn ? " wc-critter__breath--live" : ""}`}
        style={critter.clipBottomPct ? { overflow: "hidden" } : undefined}
      >
        <img
          src={critter.src}
          alt=""
          aria-hidden
          draggable={false}
          loading="lazy"
          decoding="async"
          className="wc-critter__img"
          style={{ height: oversizeHeight, transform: flipTransform }}
        />
        <div
          className={`wc-critter__blinkband${blinking ? " wc-critter__blinkband--closed" : ""}`}
          style={{
            backgroundImage: `url(${critter.src})`,
            height: oversizeHeight,
            transform: flipTransform,
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}

type GretelMoment = "idle" | "talk" | "point";

/** Gretel, front and center: breathing, blinking, and a periodic small welcome gesture. */
function GretelFigure({ motionOn }: { motionOn: boolean }) {
  const blinkTick = useRandomPulse(3000, 6500, motionOn, 1800);
  const [blinking, setBlinking] = useState(false);
  useEffect(() => {
    if (blinkTick === 0) return;
    setBlinking(true);
    const t = setTimeout(() => setBlinking(false), 160);
    return () => clearTimeout(t);
  }, [blinkTick]);

  const gestureTick = useRandomPulse(6500, 10500, motionOn, 2600);
  const [moment, setMoment] = useState<GretelMoment>("idle");
  useEffect(() => {
    if (gestureTick === 0) return;
    setMoment("talk");
    const toPoint = setTimeout(() => setMoment("point"), 420);
    const toIdle = setTimeout(() => setMoment("idle"), 980);
    return () => {
      clearTimeout(toPoint);
      clearTimeout(toIdle);
    };
  }, [gestureTick]);

  const greeting = moment !== "idle";

  return (
    <div
      className={`wc-gretel${motionOn ? " wc-gretel--live" : ""}${greeting ? " wc-gretel--greet" : ""}`}
      data-testid="wc-gretel"
    >
      <img src={GRETEL_IDLE} alt="Gretel" className="wc-gretel__layer wc-gretel__layer--idle" draggable={false} />
      <img
        src={GRETEL_BLINK}
        alt=""
        aria-hidden
        className={`wc-gretel__layer wc-gretel__layer--blink${blinking ? " wc-gretel__layer--on" : ""}`}
        draggable={false}
      />
      <img
        src={GRETEL_TALK}
        alt=""
        aria-hidden
        className={`wc-gretel__layer wc-gretel__layer--gesture${moment === "talk" ? " wc-gretel__layer--on" : ""}`}
        draggable={false}
      />
      <img
        src={GRETEL_POINT}
        alt=""
        aria-hidden
        className={`wc-gretel__layer wc-gretel__layer--gesture${moment === "point" ? " wc-gretel__layer--on" : ""}`}
        draggable={false}
      />
    </div>
  );
}

export function WelcomeSplash() {
  const motionOn = useMotionAllowed();

  return (
    <main className="wc-splash" data-testid="welcome-splash">
      <img src={MEADOW_BG} alt="" aria-hidden className="wc-splash__bg" draggable={false} />
      <div className="wc-splash__sky-wash" aria-hidden />

      <header className="wc-splash__headline">
        <h1 className="wc-splash__title">¡Bienvenidos!</h1>
        <p className="wc-splash__subtitle">La Cartilla de Gretel</p>
      </header>

      <div className="wc-splash__stage">
        {CRITTERS.map((c) => (
          <CritterFigure key={c.word} critter={c} motionOn={motionOn} />
        ))}
        <div className="wc-gretel-slot">
          <GretelFigure motionOn={motionOn} />
        </div>
      </div>

      <div className="wc-splash__cta-wrap">
        <Link to="/entrar" className="wc-splash__cta" data-testid="wc-entrar">
          Entrar
        </Link>
      </div>
    </main>
  );
}
