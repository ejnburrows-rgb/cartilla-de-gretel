import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import "@/styles/living-workbook.css";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { PhysicalPage, WorkbookObject } from "@/content/workbook/types";
import { TapSelect } from "@/cartilla/interactions/TapSelect";
import { TapToHear } from "@/cartilla/interactions/TapToHear";
import { DragPlace } from "@/cartilla/interactions/DragPlace";
import { LassoConnectFromWorkbook } from "@/cartilla/interactions/LassoConnect";
import { PaintCanvas } from "@/cartilla/interactions/PaintCanvas";
import { DibujaHost } from "@/cartilla/interactions/DibujaHost";
import { emitProgressEvent } from "@/lib/progress-events";
import { getWorkbookPageFallbackChain } from "@/lib/bookImages";

/** Known non-page placeholders that must NOT stand in for real page art. */
const PLACEHOLDER_BACKGROUNDS = new Set([
  "/art/hd/gretel-authentic.jpg",
  "art/hd/gretel-authentic.jpg",
  "/cartilla/images/gretel/gretel-authentic.jpg",
]);

function isPlaceholderBackground(src: string | null | undefined): boolean {
  if (!src) return true;
  const clean = src.replace(/^\//, "");
  return (
    PLACEHOLDER_BACKGROUNDS.has(src) ||
    PLACEHOLDER_BACKGROUNDS.has(`/${clean}`) ||
    clean.includes("gretel-authentic")
  );
}

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
 * Page background with HD → lineart → source-scan fallback.
 * Rejects known non-page placeholders (e.g. gretel-authentic garden photo)
 * so unscanned pages never show invented/wrong art as if they were the page.
 */
function PageBackground({
  pageNumber,
  preferred,
  contentStrength,
}: {
  pageNumber: number | null;
  preferred: string | null;
  contentStrength: boolean;
}) {
  const chain = useMemo(() => {
    const fallback =
      pageNumber !== null ? getWorkbookPageFallbackChain(pageNumber) : [];
    const preferredOk = preferred && !isPlaceholderBackground(preferred) ? preferred : null;
    const ordered = preferredOk
      ? [preferredOk, ...fallback.filter((p) => p !== preferredOk)]
      : fallback;
    return Array.from(new Set(ordered));
  }, [pageNumber, preferred]);

  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(0);
  }, [pageNumber, preferred]);

  const src = index < chain.length ? chain[index]! : null;
  if (!src) return <BackgroundPendingPlaceholder />;

  return (
    <img
      key={src}
      src={src}
      alt=""
      className={`lwp-page__bg${contentStrength ? " lwp-page__bg--content" : ""}`}
      draggable={false}
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      onError={() => setIndex((i) => i + 1)}
    />
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
  const pageKey = `lwp-${page.pageNumber ?? page.id}`;
  const lessonId = page.lessonNumber != null ? String(page.lessonNumber) : undefined;

  if (interactionKind === "paint") {
    const art = interactiveObjects.find((o) => o.src) ?? page.objects.find((o) => o.src);
    interactionSlot = (
      <PaintCanvas
        pageKey={pageKey}
        illustrationSrc={art?.src}
        illustrationAlt={art?.alt ?? art?.text ?? ""}
        verbLabel="Colorea"
        lessonId={lessonId}
        onComplete={handleComplete}
      />
    );
  } else if (interactionKind === "dibuja") {
    const picks = interactiveObjects.map((o, i) => ({
      id: o.id,
      caption: o.alt ?? o.text ?? o.id,
      illustrationSrc: o.src,
      correct: Boolean((o.interaction?.data as { correct?: boolean } | undefined)?.correct) || i === 0,
    }));
    interactionSlot = (
      <DibujaHost
        pageKey={pageKey}
        hint={page.instruction}
        lessonId={lessonId}
        pickOptions={picks}
        onComplete={handleComplete}
      />
    );
  } else if (interactionKind !== "none" && interactiveObjects.length > 0) {
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
        // Production default: cinematic Gretel lasso (PairMatch kept in repo as fallback)
        interactionSlot = (
          <LassoConnectFromWorkbook
            {...shared}
            pageKey={pageKey}
            mode="pair"
            instruction={page.instruction}
            lessonId={lessonId}
          />
        );
        break;
      case "mark-circle":
        interactionSlot = (
          <LassoConnectFromWorkbook
            {...shared}
            pageKey={pageKey}
            mode="mark"
            instruction={page.instruction}
            lessonId={lessonId}
          />
        );
        break;
    }
  }

  return (
    <div className={`lwp-page${className ? ` ${className}` : ""}`} data-status={page.status}>
      {page.instruction && <p className="lwp-page__instruction">{page.instruction}</p>}
      <div className="lwp-page__canvas">
        <PageBackground
          pageNumber={page.pageNumber}
          preferred={page.backgroundSrc}
          // A page with no separate objects has nothing else to show —
          // the background IS the real content (e.g. a full-page scan
          // fallback), so it renders at full strength. Pages that layer
          // real illustration objects on top get the soft, blurred
          // ambient treatment so those objects stay legible.
          contentStrength={page.objects.length === 0}
        />
        {staticObjects.map((object) => (
          <StaticObject key={object.id} object={object} motionOn={motionOn} />
        ))}
        {interactionSlot}
      </div>
    </div>
  );
}
