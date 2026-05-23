import { AnimatePresence, motion } from "framer-motion";
import { Check, RefreshCw, X } from "lucide-react";

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
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none px-4 pb-6 sm:pb-0"
        >
          <div
            className="pointer-events-auto rounded-3xl border-4 px-5 py-4 shadow-2xl max-w-md w-full flex items-center gap-4 backdrop-blur"
            style={{
              backgroundColor:
                state === "ok" ? "rgba(236,253,245,0.95)" : "rgba(255,241,242,0.95)",
              borderColor: state === "ok" ? "#34d399" : "#fb7185",
            }}
          >
            <GretelAvatar mood={state} />
            <div className="flex-1 min-w-0">
              <div
                className="font-bold text-xl sm:text-2xl leading-tight"
                style={{ color: state === "ok" ? "#064e3b" : "#881337" }}
              >
                {state === "ok" ? "¡Muy bien!" : "Intenta otra vez"}
              </div>
              <div
                className="text-xs sm:text-sm mt-0.5"
                style={{
                  color: state === "ok" ? "rgba(6,78,59,0.7)" : "rgba(136,19,55,0.7)",
                }}
              >
                {state === "ok"
                  ? "Formaste la palabra correctamente."
                  : "Vuelve a arrastrar las piezas a su lugar."}
              </div>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-sm text-white shadow-sm hover:-translate-y-px transition"
              style={{ backgroundColor: state === "ok" ? "#059669" : "#e11d48" }}
            >
              <RefreshCw className="w-4 h-4" /> Otra
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Placeholder Gretel avatar. To be swapped with Estela's original drawings
 * (happy and sad expressions) once the art crops are wired in from
 * Notion: Teacher Presentation Book — Images.
 */
function GretelAvatar({ mood }: { mood: "ok" | "x" }) {
  const bg = mood === "ok" ? "#a7f3d0" : "#fecdd3";
  const border = mood === "ok" ? "#34d399" : "#fb7185";
  const icon = mood === "ok" ? "#047857" : "#be123c";
  return (
    <div
      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 flex items-center justify-center shrink-0"
      style={{ backgroundColor: bg, borderColor: border }}
      aria-hidden
    >
      {mood === "ok" ? (
        <Check className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: icon }} strokeWidth={3} />
      ) : (
        <X className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: icon }} strokeWidth={3} />
      )}
    </div>
  );
}
