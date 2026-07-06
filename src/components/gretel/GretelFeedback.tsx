import { type ReactNode, useEffect } from "react";
import { useGretelAnimation } from "./useGretelAnimation";

interface GretelFeedbackProps {
  isCorrect: boolean | null;
  message?: ReactNode;
  children?: ReactNode;
}

const wrapperClass =
  "flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-amber-50/50 border border-amber-100/50 shadow-sm w-full transition-all duration-300 mt-3";

/**
 * SUPPRESSED visual speech bubble per owner directive (CLAUDE.md
 * "Characters must be ALIVE"): Gretel speaks via TTS audio. The visible text
 * bubble that overlaid and blocked page content is removed. If a message is
 * passed, it renders as a screen-reader-only live region for a11y.
 *
 * The `bubbleClass` const and the visual bubble JSX are removed. If the
 * owner ever approves visible captions, re-add the bubble block.
 */
export function GretelFeedback({ isCorrect, message, children }: GretelFeedbackProps) {
  const { currentPose, send } = useGretelAnimation();

  useEffect(() => {
    if (isCorrect === null) return;
    if (isCorrect) {
      send({ type: "CHEER" });
    } else {
      send({ type: "POINT" });
    }
  }, [isCorrect, send]);

  if (isCorrect === null) return null;

  const feedbackMessage = message || (isCorrect
    ? "¡Excelente trabajo! ¡Sigue así, lo estás haciendo de maravilla!"
    : "Buen intento. ¡No te rindas, inténtalo de nuevo y lo lograrás!");

  return (
    <div className={wrapperClass}>
      {/* Gretel avatar — feedback is spoken via TTS, not shown as text */}
      <div className="w-20 h-20 shrink-0 relative animate-fade-in drop-shadow-md">
        <img
          src={currentPose}
          alt="Gretel"
          className="w-full h-full object-contain"
          draggable={false}
          onError={() => send({ type: "ASSET_ERROR" })}
        />
      </div>
      {/* Screen-reader-only feedback text — no visual overlay */}
      <span className="sr-only" role="status" aria-live="polite">
        {feedbackMessage}
      </span>
      {children && <div className="mt-3 w-full">{children}</div>}
    </div>
  );
}
