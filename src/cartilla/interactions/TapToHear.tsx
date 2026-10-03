import { useState } from "react";
import { type InteractionProps } from "./shared";
import { LivingIllustration } from "@/components/living/LivingIllustration";

/** Passive picture vocabulary. The shared listener plays verified names;
 * taps never emit progress/help or require exploration before navigation. */
export function TapToHear({ objects, reducedMotion }: InteractionProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleTap = (objectId: string) => {
    const object = objects.find((o) => o.id === objectId);
    if (!object) return;
    setActiveId(objectId);
    setTimeout(() => setActiveId((prev) => (prev === objectId ? null : prev)), 600);
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
              alt={object.audio?.label ?? object.alt ?? object.text ?? ""}
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
