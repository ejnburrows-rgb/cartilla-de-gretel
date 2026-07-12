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

type DragPlaceData = { role: "draggable" | "target"; targetId?: string };

function Draggable({
  object,
  locked,
  selected,
  onSelect,
}: {
  object: WorkbookObject;
  locked: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: object.id,
    disabled: locked,
  });
  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`lwp-drag-place__draggable${isDragging ? " is-dragging" : ""}${selected ? " is-selected" : ""}`}
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
        opacity: locked ? 0.35 : 1,
      }}
      disabled={locked}
      aria-pressed={selected}
      aria-label={`${object.alt ?? object.text ?? "elemento"}. Arrástralo o presiónalo y luego presiona el destino`}
      onClick={onSelect}
    >
      {object.src && (
        <img
          src={object.src}
          alt=""
          className="lwp-drag-place__img"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      )}
      {object.text && <span className="lwp-drag-place__text">{object.text}</span>}
    </button>
  );
}

function Target({
  object,
  filled,
  wrong,
  disabled,
  onTap,
}: {
  object: WorkbookObject;
  filled: boolean;
  wrong: boolean;
  disabled: boolean;
  onTap: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: object.id });
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`lwp-drag-place__target${isOver ? " is-over" : ""}${filled ? " is-filled" : ""}${wrong ? " is-wrong" : ""}`}
      style={{
        position: "absolute",
        left: `${object.box.xPct}%`,
        top: `${object.box.yPct}%`,
        width: `${object.box.wPct}%`,
        height: `${object.box.hPct}%`,
      }}
      disabled={disabled}
      onClick={onTap}
      aria-label={object.alt ?? object.text ?? "destino"}
    >
      {object.src && (
        <img
          src={object.src}
          alt=""
          className="lwp-drag-place__img"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      )}
      {object.text && <span className="lwp-drag-place__text">{object.text}</span>}
    </button>
  );
}

/**
 * "Arrastra cada elemento a su lugar" — real drag-and-drop (dnd-kit, mouse +
 * touch), with a tap-to-select-then-tap-to-place fallback so keyboard users
 * and touch-without-drag get an identical graded interaction. Every
 * placement grades immediately. Expects each draggable object's
 * `interaction.data` to be `{ role: "draggable", targetId: string }` and
 * each target's to be `{ role: "target" }`, where `targetId` matches the
 * target object's `id`.
 */
export function DragPlace({ objects, onResult, onComplete, reducedMotion }: InteractionProps) {
  const draggables = objects.filter(
    (o) => (o.interaction?.data as DragPlaceData | undefined)?.role === "draggable",
  );
  const targets = objects.filter(
    (o) => (o.interaction?.data as DragPlaceData | undefined)?.role === "target",
  );

  const [placed, setPlaced] = useState<Record<string, string>>({}); // draggableId -> targetId
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongTargetId, setWrongTargetId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // Mouse + touch only: dnd-kit's KeyboardSensor would hijack Enter/Space to
  // start its own arrow-key drag simulation, which is impractical across a
  // percent-positioned layout and would swallow the Enter press before it
  // ever reaches our own tap-to-select-then-tap-to-place onClick handlers
  // below. Keyboard users get the identical graded interaction through
  // those plain buttons' native Enter/Space-triggers-click behavior instead.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
  );

  const attempt = (draggableId: string, targetId: string) => {
    if (placed[draggableId]) return;
    const draggable = draggables.find((d) => d.id === draggableId);
    const wantsTarget = (draggable?.interaction?.data as DragPlaceData | undefined)?.targetId;
    if (wantsTarget === targetId) {
      const next = { ...placed, [draggableId]: targetId };
      setPlaced(next);
      setSelected(null);
      fireCorrectFeedback();
      onResult?.({ objectId: draggableId, result: "correct" });
      if (Object.keys(next).length === draggables.length && !completed) {
        setCompleted(true);
        onComplete?.();
      }
    } else {
      setWrongTargetId(targetId);
      fireWrongFeedback();
      onResult?.({ objectId: draggableId, result: "wrong" });
      setTimeout(() => setWrongTargetId(null), 400);
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id;
    if (!overId) return;
    attempt(String(e.active.id), String(overId));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {targets.map((target) => (
        <Target
          key={target.id}
          object={target}
          filled={Object.values(placed).includes(target.id)}
          wrong={wrongTargetId === target.id}
          disabled={Object.values(placed).includes(target.id)}
          onTap={() => {
            if (selected) attempt(selected, target.id);
          }}
        />
      ))}
      {draggables.map((draggable) => (
        <Draggable
          key={draggable.id}
          object={draggable}
          locked={Boolean(placed[draggable.id])}
          selected={selected === draggable.id}
          onSelect={() => setSelected((prev) => (prev === draggable.id ? null : draggable.id))}
        />
      ))}
    </DndContext>
  );
}
