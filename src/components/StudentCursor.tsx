import { useEffect, useSyncExternalStore } from "react";
import { useRouterState } from "@tanstack/react-router";
import { isStudentPath, STUDENT_CURSOR_CLASS } from "@/lib/student-cursor";
import { getWorkbookPointer, hoverWorkbookPointer, subscribeWorkbookPointer } from "@/lib/workbook-pointer";
import { PencilShape } from "@/components/cartilla/WorkbookPencilMark";

/** The root route mounts the single fixed tool used for hover, marks and erasure. */
export function StudentCursor() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pointer = useSyncExternalStore(subscribeWorkbookPointer, getWorkbookPointer, getWorkbookPointer);
  const enabled = isStudentPath(pathname);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(STUDENT_CURSOR_CLASS, isStudentPath(pathname));
    return () => root.classList.remove(STUDENT_CURSOR_CLASS);
  }, [pathname]);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      const editing = (e.target as Element | null)?.closest?.('input, textarea, [contenteditable="true"], :disabled');
      hoverWorkbookPointer(e.clientX, e.clientY, e.pointerType !== "touch" && !editing);
    };
    const leave = () => { const at = getWorkbookPointer(); hoverWorkbookPointer(at.x, at.y, false); };
    const release = (e: PointerEvent) => { if (e.pointerType === "touch") leave(); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", move);
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    window.addEventListener("pointerup", release); window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", move);
      document.documentElement.removeEventListener("pointerleave", leave); window.removeEventListener("blur", leave);
      window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release);
      hoverWorkbookPointer(0, 0, false);
    };
  }, [enabled]);

  useEffect(() => {
    document.documentElement.classList.toggle("workbook-pointer-visible", enabled && pointer.visible);
    return () => document.documentElement.classList.remove("workbook-pointer-visible");
  }, [enabled, pointer.visible]);

  return enabled ? <svg className="workbook-pointer" aria-hidden="true" data-tool={pointer.eraser ? "eraser" : "pencil"}
    style={{ visibility: pointer.visible ? "visible" : "hidden" }}>
    <defs>{["charcoal-paper-grain", "connector-charcoal-paper-grain"].map(id => <filter key={id} id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="7" result="grain" />
      <feDisplacementMap in="SourceGraphic" in2="grain" scale="0.8" xChannelSelector="R" yChannelSelector="G" />
    </filter>)}</defs>
    <g transform={`translate(${pointer.x} ${pointer.y}) rotate(60) scale(3.2)`}>
      <g transform={pointer.eraser ? "rotate(180) translate(0 79.5)" : undefined}>
        <PencilShape uid="single-workbook-pointer" />
      </g>
    </g>
  </svg> : null;
}
