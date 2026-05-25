import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RefreshCw, Sparkles, X } from "lucide-react";

const feedbackInitial = { opacity: 0, y: 32, scale: 0.96 };
const feedbackExit = { opacity: 0, y: 24, scale: 0.96 };
const feedbackTransition = { duration: 0.22, ease: "easeOut" as const };
const okPanelAnimate = { opacity: 1, y: 0, scale: 1 };
const retryPanelAnimate = {
  opacity: 1,
  y: 0,
  scale: 1,
  x: [0, -8, 7, -4, 0],
};

function panelStyle(state: "ok" | "x"): CSSProperties {
  return state === "ok"
    ? {
        backgroundColor: "rgba(240,253,244,0.94)",
        borderColor: "#34d399",
        color: "#064e3b",
      }
    : {
        backgroundColor: "rgba(255,241,242,0.94)",
        borderColor: "#fb7185",
        color: "#881337",
      };
}

function titleStyle(state: "ok" | "x"): CSSProperties {
  return { color: state === "ok" ? "#047857" : "#be123c" };
}

function bodyStyle(state: "ok" | "x"): CSSProperties {
  return { color: state === "ok" ? "rgba(6,78,59,0.78)" : "rgba(136,19,55,0.78)" };
}

function retryButtonStyle(state: "ok" | "x"): CSSProperties {
  return { backgroundColor: state === "ok" ? "#059669" : "#e11d48" };
}

function avatarStyle(mood: "ok" | "x"): CSSProperties {
  return {
    backgroundColor: mood === "ok" ? "#a7f3d0" : "#fecdd3",
    borderColor: mood === "ok" ? "#34d399" : "#fb7185",
  };
}

function avatarIconStyle(mood: "ok" | "x"): CSSProperties {
  return { color: mood === "ok" ? "#047857" : "#be123c" };
}

export function GretelFeedback({
  state,
  onRetry,
}: {
  state: "ok" | "x" | null;
  onRetry: () => void;
}) {
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          key={state}
          initial={feedbackInitial}
          animate={state === "ok" ? okPanelAnimate : retryPanelAnimate}
          exit={feedbackExit}
          transition={state === "ok" ? { type: "spring", stiffness: 260, damping: 20 } : { ...feedbackTransition, x: { duration: 0.34 } }}
          className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none px-4 pb-6 sm:pb-0"
        >
          <motion.div
            className="pointer-events-auto relative overflow-hidden rounded-[2rem] border-4 px-5 py-4 shadow-2xl max-w-md w-full flex items-center gap-4 backdrop-blur"
            style={panelStyle(state)}
            initial={{ rotate: state === "ok" ? -1.2 : 0 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.78),transparent_27%),linear-gradient(135deg,rgba(255,255,255,0.46),transparent_45%)]" />
            {state === "ok" && <CelebrationBurst />}
            <GretelAvatar mood={state} />
            <div className="relative z-10 flex-1 min-w-0">
              <div
                className="font-bold text-xl sm:text-2xl leading-tight"
                style={titleStyle(state)}
              >
                {state === "ok" ? "¡Muy bien!" : "Intenta otra vez"}
              </div>
              <div
                className="text-sm sm:text-base mt-0.5 font-semibold"
                style={bodyStyle(state)}
              >
                {state === "ok"
                  ? "Lo hiciste con cuidado. Sigue con la siguiente."
                  : "No pasa nada. Limpia los espacios y prueba otra vez."}
              </div>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="relative z-10 shrink-0 inline-flex min-h-12 items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-sm text-white shadow-sm hover:-translate-y-px active:scale-95 transition"
              style={retryButtonStyle(state)}
            >
              <RefreshCw className="w-4 h-4" /> {state === "ok" ? "Otra" : "Intentar"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GretelAvatar({ mood }: { mood: "ok" | "x" }) {
  return (
    <motion.div
      className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 flex items-center justify-center shrink-0 shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
      style={avatarStyle(mood)}
      aria-hidden
      initial={{ scale: 0.7, rotate: mood === "ok" ? -8 : 8 }}
      animate={{
        scale: mood === "ok" ? [0.9, 1.12, 1] : [1, 0.94, 1],
        rotate: mood === "ok" ? [0, -6, 4, 0] : [0, 7, -7, 0],
      }}
      transition={{ duration: mood === "ok" ? 0.5 : 0.36, ease: "easeOut" }}
    >
      <motion.div
        className="absolute -inset-2 rounded-full border-2 border-white/70"
        animate={{ scale: mood === "ok" ? [0.8, 1.25, 1.05] : [1, 1.08, 1], opacity: [0.7, 0.2, 0.35] }}
        transition={{ duration: 0.72, ease: "easeOut" }}
      />
      {mood === "ok" ? (
        <Check className="w-7 h-7 sm:w-8 sm:h-8" style={avatarIconStyle(mood)} strokeWidth={3} />
      ) : (
        <X className="w-7 h-7 sm:w-8 sm:h-8" style={avatarIconStyle(mood)} strokeWidth={3} />
      )}
    </motion.div>
  );
}

function CelebrationBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="absolute text-emerald-500/70"
          style={{
            left: `${18 + i * 17}%`,
            top: `${18 + (i % 2) * 48}%`,
          }}
          initial={{ opacity: 0, scale: 0.4, y: 12, rotate: -20 }}
          animate={{ opacity: [0, 1, 0], scale: [0.45, 1, 0.82], y: [12, -10, -20], rotate: 18 }}
          transition={{ duration: 0.9, delay: i * 0.06, ease: "easeOut" }}
        >
          <Sparkles className="h-5 w-5" />
        </motion.span>
      ))}
    </div>
  );
}
