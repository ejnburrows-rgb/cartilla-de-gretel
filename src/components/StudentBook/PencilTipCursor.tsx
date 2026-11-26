import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PENCIL_TIP_VIEWBOX, recordPointer, toolSize } from "@/lib/cursor-mode";
import { OwnerPhotoPencilSvg } from "./OwnerPhotoPencilSvg";

/** Visual pointer only: events continue to reach the real controls underneath. */
export function PencilTipCursor() {
  const image = useRef<SVGSVGElement>(null);
  const width = toolSize("tip");
  const height = Math.round(width * (PENCIL_TIP_VIEWBOX.height / PENCIL_TIP_VIEWBOX.width));
  useEffect(() => {
    const root = document.documentElement;
    let hideTimer = 0;
    root.classList.add("cartilla-cursor-tip");
    const hide = () => root.classList.remove("cartilla-cursor-tip-visible");
    const move = (event: PointerEvent) => {
      recordPointer(event.clientX, event.clientY);
      const target = event.target instanceof Element ? event.target : null;
      const eligible = !!target?.closest('.native-lesson-viewer, [data-pencil-cursor-host="true"]') && !target.closest("input, textarea, select, [contenteditable=true]");
      if (image.current) image.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      if (event.pointerType !== "touch" || event.buttons) root.classList.toggle("cartilla-cursor-tip-visible", eligible);
    };
    const down = (event: PointerEvent) => { window.clearTimeout(hideTimer); move(event); };
    const up = (event: PointerEvent) => { if (event.pointerType === "touch") hideTimer = window.setTimeout(hide, 450); };
    const leave = () => hide();
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", leave, true);
    window.addEventListener("blur", leave);
    return () => {
      window.clearTimeout(hideTimer); root.classList.remove("cartilla-cursor-tip", "cartilla-cursor-tip-visible");
      window.removeEventListener("pointermove", move, true); window.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointerup", up, true); window.removeEventListener("pointercancel", leave, true); window.removeEventListener("blur", leave);
    };
  }, []);
  return createPortal(
    <OwnerPhotoPencilSvg
      ref={image}
      className="pencil-tip-cursor"
      width={width}
      height={height}
      style={{ width: `${width}px`, height: `${height}px`, transformOrigin: "0px 0px" }}
    />,
    document.body,
  );
}
