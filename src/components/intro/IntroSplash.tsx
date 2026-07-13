import { motion } from "framer-motion";
import { type CSSProperties, type ReactNode } from "react";

export interface PastelStop {
  hex: string;
  name: string;
}

/**
 * Hardcoded pastel palette pulled from the Cartilla cover. Order matches
 * how the colors appear visually: cream → butter → peach → soft pink → mint.
 */
export const CARTILLA_PASTEL_PALETTE: PastelStop[] = [
  { hex: "#fff8ed", name: "Crema" },
  { hex: "#f7efe1", name: "Mantequilla" },
  { hex: "#f8dfb7", name: "Durazno" },
  { hex: "#fadcd0", name: "Rosa suave" },
  { hex: "#d5ebe2", name: "Menta" },
];

const heroVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const heroTransition = { duration: 0.8, ease: [0.2, 0.7, 0.2, 1] as const };
const fadeUpTransition = {
  duration: 0.6,
  ease: [0.2, 0.7, 0.2, 1] as const,
  delay: 0.3,
};
const ctaTransition = {
  duration: 0.5,
  ease: [0.2, 0.7, 0.2, 1] as const,
  delay: 0.7,
};

const splashBackgroundStyle: CSSProperties = {
  background:
    "radial-gradient(circle at 20% 15%, #fadcd0 0%, transparent 35%), radial-gradient(circle at 80% 10%, #d5ebe2 0%, transparent 35%), radial-gradient(circle at 50% 90%, #f8dfb7 0%, transparent 40%), linear-gradient(180deg, #fff8ed 0%, #f7efe1 100%)",
};

type BubbleSlot = {
  size: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

const BUBBLE_SLOTS: BubbleSlot[] = [
  { size: "18rem", top: "8%", left: "12%" },
  { size: "14rem", top: "18%", right: "8%" },
  { size: "20rem", bottom: "20%", left: "5%" },
  { size: "16rem", bottom: "12%", right: "12%" },
];

function makeBubbleStyle(index: number, hex: string): CSSProperties {
  const slot = BUBBLE_SLOTS[index % BUBBLE_SLOTS.length];
  return {
    width: slot.size,
    height: slot.size,
    top: slot.top,
    bottom: slot.bottom,
    left: slot.left,
    right: slot.right,
    backgroundColor: hex,
  };
}

function makeSwatchStyle(hex: string): CSSProperties {
  return { backgroundColor: hex, boxShadow: "0 2px 0 rgba(0,0,0,0.06)" };
}

export interface IntroSplashProps {
  onContinue?: () => void;
  ctaLabel?: string;
  children?: ReactNode;
}

/**
 * Pastel welcome splash inspired by the Cartilla cover.
 * - Renders 4 soft blurred bubbles in the corners.
 * - Hero title + subtitle fade up in sequence.
 * - CTA button calls `onContinue` (typically navigates into /workbook or /).
 *
 * Lane-lock note: does NOT touch Reader.tsx, _authenticated/**, or supabase/**.
 */
export function IntroSplash({
  onContinue,
  ctaLabel = "Continuar",
  children,
}: IntroSplashProps) {
  return (
    <main
      className="relative min-h-screen overflow-hidden px-4 py-10"
      style={splashBackgroundStyle}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {CARTILLA_PASTEL_PALETTE.slice(1).map((stop, i) => (
          <span
            key={stop.hex}
            className="absolute block rounded-full opacity-60 blur-2xl"
            style={makeBubbleStyle(i, stop.hex)}
          />
        ))}
      </div>

      <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col items-center justify-center text-center">
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          transition={heroTransition}
        >
          <img src="/cartilla/images/gretel/poses/gretel-wave.webp" alt="Gretel" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[hsl(24,98%,50%)]">
            Bienvenidos a
          </p>
          <h1 className="mt-4 text-6xl font-black leading-[0.95] text-[hsl(200,98%,39%)] sm:text-7xl md:text-8xl">
            La Cartilla
            <br />
            <span className="text-[hsl(24,98%,50%)]">de Gretel</span>
          </h1>
        </motion.div>

        <motion.p
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          transition={fadeUpTransition}
          className="mt-8 max-w-xl text-lg font-semibold leading-relaxed text-[hsl(28,30%,18%)]/72"
        >
          Un libro de lectura para los más pequeños — colores suaves, letras
          grandes y mucha imaginación.
        </motion.p>

        {children ? (
          <div className="mt-6 w-full max-w-xl">{children}</div>
        ) : null}

        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          transition={ctaTransition}
          className="mt-12"
        >
          <button
            type="button"
            onClick={onContinue}
            className="min-h-14 rounded-full bg-[hsl(24,98%,50%)] px-10 py-4 text-base font-black uppercase tracking-widest text-white shadow-[0_18px_36px_hsl(24_98%_50%/0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_hsl(24_98%_50%/0.34)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[hsl(200,98%,39%)]"
>
             {ctaLabel}
           </button>
        </motion.div>

        <div
          aria-label="Paleta de la Cartilla"
          className="mt-16 flex gap-2"
        >
          {CARTILLA_PASTEL_PALETTE.map((stop) => (
            <span
              key={stop.hex}
              className="h-2 w-10 rounded-full"
              style={makeSwatchStyle(stop.hex)}
              title={stop.name}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
