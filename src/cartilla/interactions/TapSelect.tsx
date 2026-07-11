import { useState } from "react";
import type { WorkbookObject } from "@/content/workbook/types";
import { fireCorrectFeedback, fireWrongFeedback, type InteractionProps } from "./shared";

/**
 * "Presiona el dibujo correcto" — a row of choices, exactly one correct.
 * Expects each object's `interaction.data` to be `{ correct: boolean }`.
 * Mouse, touch, and keyboard all use the same plain tap target — there is
 * no drag involved, so no separate fallback is needed.
 */
export function TapSelect({ objects, onResult, onComplete }: InteractionProps) {
  const [solved, setSolved] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);

  const handleTap = (object: WorkbookObject) => {
    if (solved) return;
    const correct = Boolean(
      (object.interaction?.data as { correct?: boolean } | undefined)?.correct,
    );
    if (correct) {
      setSolved(true);
      fireCorrectFeedback();
      onResult?.({ objectId: object.id, result: "correct" });
      onComplete?.();
    } else {
      setWrongId(object.id);
      fireWrongFeedback();
      onResult?.({ objectId: object.id, result: "wrong" });
      setTimeout(() => setWrongId(null), 400);
    }
  };

  return (
    <>
      {objects.map((object) => {
        const data = object.interaction?.data as { correct?: boolean } | undefined;
        const isCorrectChoice = Boolean(data?.correct);
        const showCorrect = solved && isCorrectChoice;
        const showWrong = wrongId === object.id;
        return (
          <button
            key={object.id}
            type="button"
            className={`lwp-tap-select__choice${showCorrect ? " is-correct" : ""}${showWrong ? " is-wrong" : ""}`}
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
              <img
                src={object.src}
                alt=""
                className="lwp-tap-select__img"
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            )}
            {object.text && <span className="lwp-tap-select__text">{object.text}</span>}
          </button>
        );
      })}
    </>
  );
}
