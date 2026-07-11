import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";
import "@/styles/living-workbook.css";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { PhysicalPage, WorkbookObject } from "@/content/workbook/types";
import { TapSelect } from "@/cartilla/interactions/TapSelect";
import { TapToHear } from "@/cartilla/interactions/TapToHear";
import { DragPlace } from "@/cartilla/interactions/DragPlace";
import { PairMatch } from "@/cartilla/interactions/PairMatch";
import { MarkCircle } from "@/cartilla/interactions/MarkCircle";
import { emitProgressEvent } from "@/lib/progress-events";

export type InteractionResult = { objectId: string; result: "correct" | "wrong" };

export interface LivingWorkbookPageProps {
  page: PhysicalPage;
  onInteractionResult?: (r: InteractionResult) => void;
  onComplete?: () => void;
  className?: string;
}

function boxStyle(
  box: WorkbookObject["box"],
  zIndex: number | undefined,
  motionOn: boolean,
  motion: WorkbookObject["motion"],
): CSSProperties {
  const style: CSSProperties = {
    position: "absolute",
    left: `${box.xPct}%`,
    top: `${box.yPct}%`,
    width: `${box.wPct}%`,
    height: `${box.hPct}%`,
    zIndex,
  };
  if (motionOn && motion && motion.kind !== "none") {
    style.animationName = `lwp-${motion.kind}`;
    style.animationDuration = `${motion.durationMs ?? 3000}ms`;
    style.animationDelay = `${motion.delayMs ?? 0}ms`;
    style.animationIterationCount = "infinite";
    style.animationTimingFunction = "ease-in-out";
  }
  return style;
}

/** A plain, non-interactive object: image + real web text, percent-positioned. */
function StaticObject({ object, motionOn }: { object: WorkbookObject; motionOn: boolean }) {
  return (
    <div
      className="lwp-object"
      style={boxStyle(object.box, object.zIndex, motionOn, object.motion)}
      aria-hidden={!object.text && !object.alt ? true : undefined}
    >
      {object.src && (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img
          src={object.src}
          alt={object.alt ?? ""}
          className="lwp-object__img"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      )}
      {object.text && <div className="lwp-object__text">{object.text}</div>}
    </div>
  );
}

/** Empty, honestly-labeled placeholder — used when a page has no
 * backgroundSrc yet. Never a substitute for real art. */
function BackgroundPendingPlaceholder() {
  return (
    <div className="lwp-bg-pending" role="img" aria-label="Fondo de la página aún no disponible">
      <span>fondo pendiente</span>
    </div>
  );
}

/**
 * Renders one living workbook page from a data record: background canvas,
 * layered objects (percent-positioned, real web text, optional ambient
 * motion), and — if the page declares one — a single page-level interaction
 * slot (matching the real book's one-exercise-per-page pattern). Every
 * interaction is mouse + touch + keyboard accessible, and every drag has a
 * tap alternative (see src/cartilla/interactions/*). Ambient motion is fully
 * disabled under prefers-reduced-motion; graded interaction feedback is not
 * decorative and stays on regardless.
 */
export function LivingWorkbookPage({
  page,
  onInteractionResult,
  onComplete,
  className,
}: LivingWorkbookPageProps) {
  const reducedMotion = useReducedMotion();
  const motionOn = !reducedMotion;

  const interactionKind = page.interaction?.kind ?? "none";
  const staticObjects = page.objects.filter((o) => (o.interaction?.kind ?? "none") === "none");
  const interactiveObjects = page.objects.filter((o) => (o.interaction?.kind ?? "none") !== "none");

  const attemptCount = useRef(0);

  // page_opened on mount / whenever the page changes; page_completed when
  // the student navigates away from having had it open.
  useEffect(() => {
    if (page.pageNumber === null) return; // sandbox/dev records without a real page number aren't tracked
    emitProgressEvent({
      type: "page_opened",
      physicalPage: page.pageNumber,
      lesson: page.lessonNumber,
      mechanic: interactionKind,
    });
    return () => {
      emitProgressEvent({
        type: "page_completed",
        physicalPage: page.pageNumber as number,
        lesson: page.lessonNumber,
        mechanic: interactionKind,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.pageNumber]);

  const handleResult = (r: InteractionResult) => {
    attemptCount.current += 1;
    if (page.pageNumber !== null) {
      emitProgressEvent({
        type: r.result === "correct" ? "answer_correct" : "answer_incorrect",
        physicalPage: page.pageNumber,
        lesson: page.lessonNumber,
        mechanic: interactionKind,
        attempt: attemptCount.current,
      });
    }
    onInteractionResult?.(r);
  };

  const handleComplete = () => {
    if (page.pageNumber !== null) {
      emitProgressEvent({
        type: "activity_completed",
        physicalPage: page.pageNumber,
        lesson: page.lessonNumber,
        mechanic: interactionKind,
      });
    }
    onComplete?.();
  };

  const handleAudioPlayed = (objectId: string) => {
    if (page.pageNumber !== null) {
      emitProgressEvent({
        type: "audio_played",
        physicalPage: page.pageNumber,
        lesson: page.lessonNumber,
        mechanic: interactionKind,
        attempt: undefined,
      });
    }
    void objectId;
  };

  let interactionSlot: ReactNode = null;
  if (interactionKind !== "none" && interactiveObjects.length > 0) {
    const shared = {
      objects: interactiveObjects,
      onResult: handleResult,
      onComplete: handleComplete,
      onAudioPlayed: handleAudioPlayed,
      reducedMotion,
    };
    switch (interactionKind) {
      case "tap-select":
        interactionSlot = <TapSelect {...shared} />;
        break;
      case "tap-to-hear":
        interactionSlot = <TapToHear {...shared} />;
        break;
      case "drag-place":
        interactionSlot = <DragPlace {...shared} />;
        break;
      case "pair-match":
        interactionSlot = <PairMatch {...shared} />;
        break;
      case "mark-circle":
        interactionSlot = <MarkCircle {...shared} />;
        break;
    }
  }

  return (
    <div className={`lwp-page${className ? ` ${className}` : ""}`} data-status={page.status}>
      {page.instruction && <p className="lwp-page__instruction">{page.instruction}</p>}
      <div className="lwp-page__canvas">
        {page.backgroundSrc ? (
          <img
            src={page.backgroundSrc}
            alt=""
            className="lwp-page__bg"
            draggable={false}
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <BackgroundPendingPlaceholder />
        )}
        {staticObjects.map((object) => (
          <StaticObject key={object.id} object={object} motionOn={motionOn} />
        ))}
        {interactionSlot}
      </div>
    </div>
  );
}
