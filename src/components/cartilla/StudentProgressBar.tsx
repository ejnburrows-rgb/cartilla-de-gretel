/**
 * StudentProgressBar.tsx  — Lane A
 * Thin progress bar component that accepts 0–100 value and an accent colour.
 */
interface StudentProgressBarProps {
  value: number;        // 0–100
  color?: string;
  className?: string;
  label?: string;
}

export function StudentProgressBar({
  value,
  color,
  className = "",
  label,
}: StudentProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className={`student-progress-bar ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `Progreso: ${pct}%`}
    >
      <div
        className="student-progress-bar__fill"
        style={{ width: `${pct}%`, backgroundColor: color ?? "hsl(var(--primary))" }}
      />
    </div>
  );
}
