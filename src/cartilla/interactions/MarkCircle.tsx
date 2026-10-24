import { useState, useEffect } from "react";
import type { WorkbookObject } from "@/content/workbook/types";
import { fireCorrectFeedback, fireWrongFeedback, type InteractionProps } from "./shared";
import { LivingIllustration } from "@/components/living/LivingIllustration";
import { WorkbookPencilMark } from "@/components/cartilla/WorkbookPencilMark";

type MarkCircleData = { correct?: boolean; markType?: "circle" | "x" };

export interface MarkCircleProps extends InteractionProps {
  markType?: "circle" | "x";
  instruction?: string;
}

/**
 * "Encierra en un círculo" / "Marca con una x" — Real Workbook Pencil Mark.
 * Starts in ash pencil (gray), then resolves to green (correct, stays) or
 * red-then-erased with eraser crumbs (wrong, retry-ready).
 */
export function MarkCircle({
  objects,
  onResult,
  onComplete,
  markType: markTypeProp,
  instruction,
}: MarkCircleProps) {
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [pendingMark, setPendingMark] = useState<{ objectId: string; correct: boolean } | null>(null);
  const [completed, setCompleted] = useState(false);

  const defaultMarkType: "circle" | "x" =
    markTypeProp ??
    (instruction && /marca con una x/i.test(instruction)
      ? "x"
      : objects.some((o) => (o.interaction?.data as MarkCircleData | undefined)?.markType === "x")
        ? "x"
        : "circle");

  const totalCorrect = objects.filter((o) =>
    Boolean((o.interaction?.data as MarkCircleData | undefined)?.correct),
  ).length;

  useEffect(() => {
    if (totalCorrect > 0 && marked.size === totalCorrect && !completed) {
      setCompleted(true);
      onComplete?.();
    }
  }, [marked, totalCorrect, completed, onComplete]);

  const handleTap = (object: WorkbookObject) => {
    if (marked.has(object.id) || pendingMark !== null) return;
    const correct = Boolean((object.interaction?.data as MarkCircleData | undefined)?.correct);
    setPendingMark({ objectId: object.id, correct });
  };

  const handleSuccess = (objectId: string) => {
    setMarked((prev) => new Set(prev).add(objectId));
    setPendingMark(null);
    fireCorrectFeedback();
    onResult?.({ objectId, result: "correct" });
  };

  const handleRetry = (objectId: string) => {
    setPendingMark(null);
    fireWrongFeedback();
    onResult?.({ objectId, result: "wrong" });
  };

  return (
    <>
      {objects.map((object) => {
        const isMarked = marked.has(object.id);
        const isPending = pendingMark?.objectId === object.id;
        const isWrong = isPending && !pendingMark.correct;
        const itemMarkType =
          (object.interaction?.data as MarkCircleData | undefined)?.markType ?? defaultMarkType;

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
            disabled={isMarked || (pendingMark !== null && !isPending)}
          >
            {object.src && (
              <LivingIllustration
                src={object.src}
                alt=""
                className="lwp-mark-circle__img"
                loading="lazy"
              />
            )}
            {object.text && <span className="lwp-mark-circle__text">{object.text}</span>}
            
            {/* Real Workbook Mark — Ash pencil first, then resolves to green or red-then-erased */}
            {isPending && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-1 z-10">
                <WorkbookPencilMark
                  round
                  markType={itemMarkType}
                  isCorrect={pendingMark.correct}
                  itemId={object.id}
                  onSuccess={() => handleSuccess(object.id)}
                  onRetry={() => handleRetry(object.id)}
                />
              </div>
            )}
            {isMarked && !isPending && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-1 z-10">
                <WorkbookPencilMark
                  round
                  markType={itemMarkType}
                  status="correct"
                  itemId={`${object.id}-saved`}
                />
              </div>
            )}
            {!isPending && !isMarked && (
              <span className="lwp-mark-circle__ring" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </>
  );
}
