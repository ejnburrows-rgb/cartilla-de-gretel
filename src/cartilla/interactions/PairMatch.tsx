import { useState } from "react";
import type { WorkbookObject } from "@/content/workbook/types";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { fireCorrectFeedback, fireWrongFeedback, type InteractionProps } from "./shared";

type PairMatchData = { role: "left" | "right"; pairId: string };

function LeftItem({
  object,
  matched,
  selected,
  onSelect,
}: {
  object: WorkbookObject;
  matched: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: object.id,
    disabled: matched,
  });
  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`lwp-pair-match__left${isDragging ? " is-dragging" : ""}${selected ? " is-selected" : ""}${matched ? " is-matched" : ""}`}
      style={{
        position: "absolute",
        left: `${object.box.xPct}%`,
        top: `${object.box.yPct}%`,
        width: `${object.box.wPct}%`,
        height: `${object.box.hPct}%`,
        transform: transform
          ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
          : undefined,
        zIndex: isDragging ? 999 : object.zIndex,
        opacity: matched ? 0.35 : 1,
      }}
      disabled={matched}
      aria-pressed={selected}
      aria-label={`${object.alt ?? object.text ?? "elemento"}. Arrástralo o presiónalo y luego presiona su pareja`}
      onClick={onSelect}
    >
      {object.src && (
        <img
          src={object.src}
          alt=""
          className="lwp-pair-match__img"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      )}
      {object.text && <span className="lwp-pair-match__text">{object.text}</span>}
    </button>
  );
}

function RightItem({
  object,
  matched,
  wrong,
  disabled,
  onTap,
}: {
  object: WorkbookObject;
  matched: boolean;
  wrong: boolean;
  disabled: boolean;
  onTap: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: object.id });
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`lwp-pair-match__right${isOver ? " is-over" : ""}${matched ? " is-matched" : ""}${wrong ? " is-wrong" : ""}`}
      style={{
        position: "absolute",
        left: `${object.box.xPct}%`,
        top: `${object.box.yPct}%`,
        width: `${object.box.wPct}%`,
        height: `${object.box.hPct}%`,
      }}
      disabled={disabled}
      onClick={onTap}
      aria-label={object.alt ?? object.text ?? "pareja"}
    >
      {object.src && (
        <img
          src={object.src}
          alt=""
          className="lwp-pair-match__img"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      )}
      {object.text && <span className="lwp-pair-match__text">{object.text}</span>}
    </button>
  );
}

/**
 * "Une cada elemento con su pareja" — drag a left-column item onto its
 * matching right-column item (dnd-kit, mouse + touch), with a
 * tap-to-select-then-tap-to-place fallback for keyboard/touch-without-drag.
 * Expects objects tagged `interaction.data` = `{ role: "left" | "right",
 * pairId: string }`; a left and right object with the same `pairId` are the
 * correct match.
 */
export function PairMatch({ objects, onResult, onComplete, reducedMotion }: InteractionProps) {
  const lefts = objects.filter(
    (o) => (o.interaction?.data as PairMatchData | undefined)?.role === "left",
  );
  const rights = objects.filter(
    (o) => (o.interaction?.data as PairMatchData | undefined)?.role === "right",
  );

  const [matched, setMatched] = useState<Record<string, string>>({}); // leftId -> rightId
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongRightId, setWrongRightId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // Mouse + touch only — see DragPlace.tsx's identical comment: dnd-kit's
  // KeyboardSensor would swallow Enter/Space before it reaches our own
  // tap-to-select-then-tap-to-place buttons below, which already give
  // keyboard users the same graded interaction via native button behavior.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
  );

  const attempt = (leftId: string, rightId: string) => {
    if (matched[leftId]) return;
    const left = lefts.find((l) => l.id === leftId);
    const right = rights.find((r) => r.id === rightId);
    const leftPairId = (left?.interaction?.data as PairMatchData | undefined)?.pairId;
    const rightPairId = (right?.interaction?.data as PairMatchData | undefined)?.pairId;
    if (leftPairId && leftPairId === rightPairId) {
      const next = { ...matched, [leftId]: rightId };
      setMatched(next);
      setSelected(null);
      fireCorrectFeedback();
      onResult?.({ objectId: leftId, result: "correct" });
      if (Object.keys(next).length === lefts.length && !completed) {
        setCompleted(true);
        onComplete?.();
      }
    } else {
      setWrongRightId(rightId);
      fireWrongFeedback();
      onResult?.({ objectId: leftId, result: "wrong" });
      setTimeout(() => setWrongRightId(null), 400);
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id;
    if (!overId) return;
    attempt(String(e.active.id), String(overId));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {rights.map((right) => (
        <RightItem
          key={right.id}
          object={right}
          matched={Object.values(matched).includes(right.id)}
          wrong={wrongRightId === right.id}
          disabled={Object.values(matched).includes(right.id)}
          onTap={() => {
            if (selected) attempt(selected, right.id);
          }}
        />
      ))}
      {lefts.map((left) => (
        <LeftItem
          key={left.id}
          object={left}
          matched={Boolean(matched[left.id])}
          selected={selected === left.id}
          onSelect={() => setSelected((prev) => (prev === left.id ? null : left.id))}
        />
      ))}
    </DndContext>
  );
}
