import { type ReactNode, useEffect } from "react";
import { GretelLiveAvatar } from "./GretelLiveAvatar";
import { gretelEvent } from "@/lib/gretel-bus";

interface GretelFeedbackProps {
  isCorrect: boolean | null;
  message?: ReactNode;
  children?: ReactNode;
}

const wrapperClass =
  "flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-amber-50/50 border border-amber-100/50 shadow-sm w-full transition-all duration-300 mt-3";

export function GretelFeedback({ isCorrect, message, children }: GretelFeedbackProps) {
  useEffect(() => {
    if (isCorrect === null) return;
    gretelEvent(isCorrect ? "answer:correct" : "answer:wrong");
  }, [isCorrect]);

  if (isCorrect === null) return null;

  const feedbackMessage =
    message ||
    (isCorrect
      ? "¡Excelente trabajo! ¡Sigue así, lo estás haciendo de maravilla!"
      : "Buen intento. ¡No te rindas, inténtalo de nuevo y lo lograrás!");

  return (
    <div className={wrapperClass}>
      <div className="shrink-0 relative animate-fade-in drop-shadow-md">
        <GretelLiveAvatar size="sm" bubblePosition="right" />
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {feedbackMessage}
      </span>
      {children && <div className="mt-3 w-full">{children}</div>}
    </div>
  );
}
