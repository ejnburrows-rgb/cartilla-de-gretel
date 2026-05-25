import type { CSSProperties } from "react";

type Bar = { label: string; value: number; color?: string; sub?: string };

function chartStyle(height: number): CSSProperties {
  return { height };
}

function barStyle(height: number, color?: string): CSSProperties {
  return {
    height,
    backgroundColor: color ?? "hsl(var(--primary))",
  };
}

export function SimpleBarChart({
  bars,
  max,
  height = 160,
  formatValue,
}: {
  bars: Bar[];
  max?: number;
  height?: number;
  formatValue?: (v: number) => string;
}) {
  const top = Math.max(max ?? 0, ...bars.map((b) => b.value), 1);
  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5" style={chartStyle(height)}>
        {bars.map((b, i) => {
          const h = Math.max(2, Math.round((b.value / top) * height));
          return (
            <div
              key={i}
              className="flex-1 min-w-0 flex flex-col items-center justify-end gap-1"
              title={`${b.label}: ${b.value}`}
            >
              <span className="text-[10px] font-bold text-foreground/60 truncate w-full text-center">
                {formatValue ? formatValue(b.value) : b.value}
              </span>
              <div
                className="w-full rounded-t-md transition-all"
                style={barStyle(h, b.color)}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 min-w-0 text-center">
            <div className="text-[10px] font-bold text-foreground/60 truncate">{b.label}</div>
            {b.sub && <div className="text-[9px] text-foreground/40 truncate">{b.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
