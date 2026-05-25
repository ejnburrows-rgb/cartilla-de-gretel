import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RefreshCw, X } from "lucide-react";

const feedbackInitial = { opacity: 0, y: 32, scale: 0.96 };
const feedbackAnimate = { opacity: 1, y: 0, scale: 1 };
const feedbackExit = { opacity: 0, y: 24, scale: 0.96 };
const feedbackTransition = { duration: 0.22, ease: "easeOut" as const };

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
          animate={feedbackAnimate}
          exit={feedbackExit}
          transition={feedbackTransition}
          className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none px-4 pb-6 sm:pb-0"
        >
          <div
            className="pointer-events-auto rounded-[2rem] border-4 px-5 py-4 shadow-2xl max-w-md w-full flex items-center gap-4 backdrop-blur"
            style={panelStyle(state)}
          >
            <GretelAvatar mood={state} />
            <div className="flex-1 min-w-0">
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
              className="shrink-0 inline-flex min-h-12 items-center gap-1.5 px-4 py-2 rounded-2xl font-black text-sm text-white shadow-sm hover:-translate-y-px transition"
              style={retryButtonStyle(state)}
            >
              <RefreshCw className="w-4 h-4" /> {state === "ok" ? "Otra" : "Intentar"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GretelAvatar({ mood }: { mood: "ok" | "x" }) {
  return (
    <div
      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 flex items-center justify-center shrink-0"
      style={avatarStyle(mood)}
      aria-hidden
    >
      {mood === "ok" ? (
        <Check className="w-7 h-7 sm:w-8 sm:h-8" style={avatarIconStyle(mood)} strokeWidth={3} />
      ) : (
        <X className="w-7 h-7 sm:w-8 sm:h-8" style={avatarIconStyle(mood)} strokeWidth={3} />
      )}
    </div>
  );
}
