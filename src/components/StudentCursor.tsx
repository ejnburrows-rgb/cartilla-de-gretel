import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { isStudentPath, STUDENT_CURSOR_CLASS } from "@/lib/student-cursor";

type PointerPosition = { x: number; y: number; visible: boolean };

/** A visible pencil cursor for mouse/trackpad student reading only. */
export function StudentCursor() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const studentScreen = isStudentPath(pathname);
  const [pointer, setPointer] = useState<PointerPosition>({ x: -80, y: -80, visible: false });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(STUDENT_CURSOR_CLASS, studentScreen);
    return () => root.classList.remove(STUDENT_CURSOR_CLASS);
  }, [studentScreen]);

  useEffect(() => {
    if (!studentScreen) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      setPointer({ x: event.clientX, y: event.clientY, visible: true });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [studentScreen]);

  if (!studentScreen) return null;
  return (
    <span
      className={`student-pencil-cursor${pointer.visible ? " is-visible" : ""}`}
      style={{ left: pointer.x, top: pointer.y }}
      aria-hidden="true"
    >
      <span className="student-pencil-cursor__eraser" />
      <span className="student-pencil-cursor__band" />
      <span className="student-pencil-cursor__barrel" />
      <span className="student-pencil-cursor__wood" />
      <span className="student-pencil-cursor__lead" />
    </span>
  );
}
