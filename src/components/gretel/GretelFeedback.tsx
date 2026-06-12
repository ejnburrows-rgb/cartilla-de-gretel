import { type ReactNode, useEffect } from "react";
import { useGretelAnimation } from "./useGretelAnimation";

interface GretelFeedbackProps {
  isCorrect: boolean | null;
  message?: ReactNode;
  children?: ReactNode;
}

const wrapperClass = "flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-amber-50/50 border border-amber-100/50 shadow-sm w-full transition-all duration-300 mt-3";
const bubbleClass = "relative flex-1 bg-white border border-stone-200 p-4 rounded-2xl text-stone-800 text-sm shadow-sm before:absolute before:-top-2 before:left-10 sm:before:top-1/2 sm:before:-left-2 sm:before:-translate-y-1/2 before:w-4 before:h-4 before:bg-white before:border-t before:border-l sm:before:border-t-0 sm:before:border-b before:border-stone-200 before:rotate-45";

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
      <div className="w-20 h-20 shrink-0 relative animate-fade-in drop-shadow-md">
        <img
          src={currentPose}
          alt="Gretel"
          className="w-full h-full object-contain"
          draggable={false}
          onError={() => send({ type: "ASSET_ERROR" })}
        />
      </div>
      <div className={bubbleClass}>
        <div>{feedbackMessage}</div>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
