import { useEffect, useRef, useState } from "react";
import { storage } from "@/lib/storage";

export type TimerMode = "up" | "down";

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

type WindowWithWebkitAudioContext = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function beep(times = 3) {
  try {
    const Ctx = window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      const start = ctx.currentTime + i * 0.22;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.3, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      o.start(start);
      o.stop(start + 0.2);
    }
    setTimeout(() => ctx.close(), times * 250 + 200);
  } catch {
    /* ignore */
  }
}

export function LessonTimer({
  unitKey,
  mode,
  countdownMinutes,
  onElapsed,
}: {
  unitKey: string;
  mode: TimerMode;
  countdownMinutes: number;
  onElapsed?: () => void;
}) {
  const storeKey = `reader.timer.${unitKey}`;
  const [seconds, setSeconds] = useState<number>(() => storage.get(storeKey, 0));
  const [running, setRunning] = useState(true);
  const firedRef = useRef(false);

  useEffect(() => {
    setSeconds(storage.get(storeKey, 0));
    firedRef.current = false;
  }, [storeKey]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    storage.set(storeKey, seconds);
  }, [seconds, storeKey]);

  const total = countdownMinutes * 60;
  const display = mode === "up" ? seconds : Math.max(0, total - seconds);
  const pct = mode === "down" && total > 0 ? Math.min(100, (seconds / total) * 100) : 0;
  const overtime = mode === "down" && seconds >= total;

  useEffect(() => {
    if (mode === "down" && overtime && !firedRef.current) {
      firedRef.current = true;
      beep();
      onElapsed?.();
    }
  }, [overtime, mode, onElapsed]);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`tabular-nums font-mono text-sm font-bold px-2 py-1 rounded-md ${overtime ? "bg-destructive/20 text-destructive" : "bg-accent text-accent-foreground"}`}
      >
        {mode === "down" ? "⏱ " : "⏲ "}
        {fmt(display)}
      </div>
      {mode === "down" && (
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full ${overtime ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <button
        onClick={() => setRunning((r) => !r)}
        className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted"
      >
        {running ? "Pausar" : "Reanudar"}
      </button>
      <button
        onClick={() => setSeconds(0)}
        className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted"
      >
        Reiniciar
      </button>
    </div>
  );
}
