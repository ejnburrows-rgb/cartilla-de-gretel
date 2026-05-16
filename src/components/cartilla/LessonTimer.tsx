import { useEffect, useState } from "react";
import { Timer, AlertTriangle } from "lucide-react";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** Visible lesson timer. If `limitSeconds` is set, counts down; otherwise counts up. */
export function LessonTimer({ limitSeconds }: { limitSeconds?: number | null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (limitSeconds && limitSeconds > 0) {
    const remaining = Math.max(0, limitSeconds - elapsed);
    const over = elapsed > limitSeconds;
    const warn = remaining < 30 && remaining > 0;
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg border-2 ${
          over
            ? "bg-destructive/10 border-destructive/30 text-destructive"
            : warn
              ? "bg-vowel-o/10 border-vowel-o/30 text-vowel-o"
              : "bg-secondary border-foreground/10 text-foreground/70"
        }`}
        aria-live="polite"
      >
        {over ? <AlertTriangle className="w-3.5 h-3.5" /> : <Timer className="w-3.5 h-3.5" />}
        {over ? `Tiempo vencido +${fmt(elapsed - limitSeconds)}` : `Quedan ${fmt(remaining)}`}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg border-2 border-foreground/10 bg-secondary text-foreground/70">
      <Timer className="w-3.5 h-3.5" /> {fmt(elapsed)}
    </div>
  );
}
