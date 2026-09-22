import { useState, useEffect } from "react";
import { playObjectAudio, type InteractionProps } from "./shared";
import { LivingIllustration } from "@/components/living/LivingIllustration";

/**
 * "Presiona para escuchar" — tap any object to hear it. Not graded (there's
 * no right/wrong answer to explore audio), so `onComplete` fires once every
 * object has been tapped at least once, letting a parent page still track
 * "did the student engage with this page" without inventing a pass/fail.
 * `playObjectAudio` (shared.ts) plays a recorded cue when one exists and
 * falls back to real TTS otherwise — tapping is always audible, never a
 * silent no-op.
 */
export function TapToHear({ objects, onComplete, onAudioPlayed, reducedMotion }: InteractionProps) {
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (objects.length > 0 && playedIds.size === objects.length && !completed) {
      setCompleted(true);
      onComplete?.();
    }
  }, [playedIds, objects.length, completed, onComplete]);

  const handleTap = (objectId: string) => {
    const object = objects.find((o) => o.id === objectId);
    if (!object) return;
    if (playObjectAudio(object)) onAudioPlayed?.(objectId);
    setActiveId(objectId);
    setTimeout(() => setActiveId((prev) => (prev === objectId ? null : prev)), 600);
    setPlayedIds((prev) => new Set(prev).add(objectId));
  };

  return (
    <>
      {objects.map((object) => (
        <button
          key={object.id}
          type="button"
          className={`lwp-tap-to-hear${activeId === object.id && !reducedMotion ? " is-playing" : ""}`}
          style={{
            position: "absolute",
            left: `${object.box.xPct}%`,
            top: `${object.box.yPct}%`,
            width: `${object.box.wPct}%`,
            height: `${object.box.hPct}%`,
          }}
          onClick={() => handleTap(object.id)}
          aria-label={object.audio?.label ?? object.alt ?? object.text ?? "escuchar"}
        >
          {object.src && (
            <LivingIllustration
              src={object.src}
              alt=""
              className="lwp-tap-to-hear__img"
              loading="lazy"
            />
          )}
          {object.text && <span className="lwp-tap-to-hear__text">{object.text}</span>}
          <span className="lwp-tap-to-hear__badge" aria-hidden="true" />
        </button>
      ))}
    </>
  );
}
