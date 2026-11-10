import { useEffect, useRef, useState } from "react";
import type { WorkbookObject } from "@/content/workbook/types";
import { fireCorrectFeedback, fireWrongFeedback, type InteractionProps } from "./shared";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import { WorkbookPencilMark } from "@/components/cartilla/WorkbookPencilMark";

/**
 * "Presiona el dibujo correcto" — a row of choices, exactly one correct.
 * Expects each object's `interaction.data` to be `{ correct: boolean }`.
 * Follows the approved Real Workbook Mark sequence:
 * 1. Learner taps choice.
 * 2. Big wooden pencil draws circle in ash pencil (gray).
 * 3. Page zooms in subtly (1.5x) toward the tapped picture.
 * 4. Resolves:
 *    - Correct: slowly turns green, Gretel says "Buen trabajo", stays.
 *    - Wrong: turns red, eraser comes in, scrubs with crumbs, Gretel says "Inténtalo otra vez", retry-ready.
 */
export function TapSelect({ objects, onResult, onComplete }: InteractionProps) {
  const [solved, setSolved] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [pending, setPending] = useState<{ objectId: string; correct: boolean } | null>(null);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (wrongTimerRef.current) {
        clearTimeout(wrongTimerRef.current);
      }
    };
  }, []);

  const handleTap = (object: WorkbookObject) => {
    if (solved) return;
    if (wrongTimerRef.current) {
      clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = null;
    }
    const correct = Boolean(
      (object.interaction?.data as { correct?: boolean } | undefined)?.correct,
    );
    if (correct) {
      setWrongId(null);
      setSolved(true);
      setPending({ objectId: object.id, correct: true });
      fireCorrectFeedback();
      onResult?.({ objectId: object.id, result: "correct" });
      onComplete?.();
    } else {
      setWrongId(object.id);
      setPending({ objectId: object.id, correct: false });
      fireWrongFeedback();
      onResult?.({ objectId: object.id, result: "wrong" });
      wrongTimerRef.current = setTimeout(() => {
        setWrongId(null);
        wrongTimerRef.current = null;
      }, 400);
    }
  };

  const handleSuccess = () => {
    setPending(null);
  };

  const handleRetry = () => {
    setPending(null);
    setWrongId(null);
  };

  return (
    <>
      {objects.map((object) => {
        const data = object.interaction?.data as { correct?: boolean } | undefined;
        const isCorrectChoice = Boolean(data?.correct);
        const showCorrect = solved && isCorrectChoice;
        const showWrong = wrongId === object.id;
        const isPending = pending?.objectId === object.id;

        return (
          <button
            key={object.id}
            type="button"
            className={`lwp-tap-select__choice relative${showCorrect ? " is-correct" : ""}${showWrong ? " is-wrong" : ""}`}
            style={{
              position: "absolute",
              left: `${object.box.xPct}%`,
              top: `${object.box.yPct}%`,
              width: `${object.box.wPct}%`,
              height: `${object.box.hPct}%`,
            }}
            onClick={() => handleTap(object)}
            disabled={solved}
            aria-pressed={showCorrect}
            aria-label={object.alt ?? object.text ?? "opción"}
          >
            {object.src && (
              <LivingIllustration
                src={object.src}
                alt=""
                className="lwp-tap-select__img"
                loading="lazy"
              />
            )}
            {object.text && <span className="lwp-tap-select__text">{object.text}</span>}

            {/* Approved Real Workbook Pencil Mark */}
            {isPending && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-1 z-10">
                <WorkbookPencilMark
                  key={`pending-${object.id}-${pending.correct}`}
                  round
                  markType="circle"
                  isCorrect={pending.correct}
                  itemId={object.id}
                  onSuccess={handleSuccess}
                  onRetry={handleRetry}
                />
              </div>
            )}
            {showCorrect && !isPending && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-1 z-10">
                <WorkbookPencilMark
                  round
                  markType="circle"
                  status="correct"
                  itemId={`${object.id}-solved`}
                />
              </div>
            )}
          </button>
        );
      })}
    </>
  );
}
