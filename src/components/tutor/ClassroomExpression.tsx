import { useEffect, useState } from "react";

type Reaction = "attentive" | "thinking" | "acknowledging";
type IdleExpression = "still" | "blink" | "glance";

/** Silent facial movement on the original classroom plate. The voice owns the mouth. */
export function ClassroomExpression({ reaction, speaking, board }: {
  reaction: Reaction;
  speaking: boolean;
  board: boolean;
}) {
  const [idle, setIdle] = useState<IdleExpression>("still");

  useEffect(() => {
    setIdle("still");
    if (board || reaction !== "attentive") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number;
    let beat = 0;

    function schedule() {
      timer = window.setTimeout(() => {
        const glance = ++beat % 4 === 3;
        setIdle(glance ? "glance" : "blink");
        timer = window.setTimeout(() => {
          setIdle("still");
          schedule();
        }, glance ? 980 : 250);
      }, 2800 + Math.random() * 4700);
    }

    function resume() {
      window.clearTimeout(timer);
      setIdle("still");
      if (!reducedMotion.matches && !document.hidden) schedule();
    }

    resume();
    reducedMotion.addEventListener("change", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      window.clearTimeout(timer);
      reducedMotion.removeEventListener("change", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [board, reaction]);

  const expression = reaction === "attentive" ? idle : reaction;
  return (
    <span
      aria-hidden="true"
      className="tutor-classroom-expression"
      data-classroom-expression={expression}
      data-classroom-speaking={speaking || undefined}
    />
  );
}
