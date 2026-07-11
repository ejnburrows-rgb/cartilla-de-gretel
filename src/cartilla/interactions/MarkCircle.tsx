import { useState, useEffect } from "react";
import type { WorkbookObject } from "@/content/workbook/types";
import { fireCorrectFeedback, fireWrongFeedback, type InteractionProps } from "./shared";

type MarkCircleData = { correct?: boolean };

/**
 * "Encierra en un círculo los dibujos correctos" — tap to toggle a circle
 * mark on each object; every tap grades immediately against that object's
 * own `interaction.data.correct`. Fires `onComplete` once every correct
 * object has been marked (extra wrong taps don't block completion — they
 * just don't count, matching the printed exercise's forgiving grading).
 */
export function MarkCircle({ objects, onResult, onComplete }: InteractionProps) {
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const totalCorrect = objects.filter((o) => Boolean((o.interaction?.data as MarkCircleData | undefined)?.correct)).length;

  useEffect(() => {
    if (totalCorrect > 0 && marked.size === totalCorrect && !completed) {
      setCompleted(true);
      onComplete?.();
    }
  }, [marked, totalCorrect, completed, onComplete]);

  const handleTap = (object: WorkbookObject) => {
    if (marked.has(object.id)) return;
    const correct = Boolean((object.interaction?.data as MarkCircleData | undefined)?.correct);
    if (correct) {
      setMarked((prev) => new Set(prev).add(object.id));
      fireCorrectFeedback();
      onResult?.({ objectId: object.id, result: "correct" });
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
        const isMarked = marked.has(object.id);
        const isWrong = wrongId === object.id;
        return (
          <button
            key={object.id}
            type="button"
            className={`lwp-mark-circle${isMarked ? " is-marked" : ""}${isWrong ? " is-wrong" : ""}`}
            style={{
              position: "absolute",
              left: `${object.box.xPct}%`,
              top: `${object.box.yPct}%`,
              width: `${object.box.wPct}%`,
              height: `${object.box.hPct}%`,
            }}
            onClick={() => handleTap(object)}
            aria-pressed={isMarked}
            aria-label={object.alt ?? object.text ?? "marcar"}
          >
            {object.src && <img src={object.src} alt="" className="lwp-mark-circle__img" draggable={false} />}
            {object.text && <span className="lwp-mark-circle__text">{object.text}</span>}
            <span className="lwp-mark-circle__ring" aria-hidden="true" />
          </button>
        );
      })}
    </>
  );
}
