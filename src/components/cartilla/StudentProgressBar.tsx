import type { CSSProperties } from "react";

type StudentProgressBarProps = {
  current: number;
  total: number;
  accent: string;
};

function progressStyle(current: number, total: number, accent: string): CSSProperties {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return { width: `${pct}%`, backgroundColor: accent };
}

export function StudentProgressBar({ current, total, accent }: StudentProgressBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-black text-[#3A281E]/70">
        <span>Progreso</span>
        <span>
          {current} / {total}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full border border-amber-900/15 bg-white/70">
        <div className="h-full transition-all duration-300" style={progressStyle(current, total, accent)} />
      </div>
    </div>
  );
}
