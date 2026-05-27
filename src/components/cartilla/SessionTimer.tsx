import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";

const timerWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  backgroundColor: "#fcf8f2",
  borderRadius: "1.5rem",
  border: "2px solid #ecdac3",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
};

const circleBgStyle: React.CSSProperties = {
  stroke: "#e5e7eb",
};

const circleProgressStyle: React.CSSProperties = {
  stroke: "#8B5A2B",
  transition: "stroke-dashoffset 0.5s ease",
  transform: "rotate(-90deg)",
  transformOrigin: "50% 50%",
};

function playChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Play a nice double-tone clean chime
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playTone(523.25, 0, 0.8);   // C5
    playTone(659.25, 0.15, 1.0); // E5
  } catch {
    /* ignore fallback */
  }
}

export function SessionTimer() {
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes default
  const [initialSeconds, setInitialSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const togglePlay = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(initialSeconds);
  };

  const addMinute = () => {
    setSecondsLeft((p) => p + 60);
    setInitialSeconds((p) => p + 60);
  };

  const subtractMinute = () => {
    setSecondsLeft((p) => Math.max(0, p - 60));
    setInitialSeconds((p) => Math.max(60, p - 60));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // SVG Progress Ring calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = initialSeconds > 0 ? (initialSeconds - secondsLeft) / initialSeconds : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div style={timerWrapperStyle}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
        Tiempo de Clase
      </h3>
      
      <div className="relative w-36 h-36 flex items-center justify-center mb-3">
        <svg className="w-full h-full">
          <circle
            cx="72"
            cy="72"
            r={radius}
            strokeWidth="8"
            fill="transparent"
            style={circleBgStyle}
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={circleProgressStyle}
          />
        </svg>
        <div className="absolute text-2xl font-bold font-mono text-stone-800">
          {formatTime(secondsLeft)}
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={subtractMinute}
          className="p-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-600 transition"
          aria-label="Restar 1 minuto"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="flex items-center justify-center p-3 rounded-full bg-amber-800 hover:bg-amber-900 text-white shadow-md active:scale-95 transition"
          aria-label={isRunning ? "Pausar cronómetro" : "Iniciar cronómetro"}
        >
          {isRunning ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
        </button>

        <button
          onClick={addMinute}
          className="p-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-600 transition"
          aria-label="Sumar 1 minuto"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Reset Control */}
      <button
        onClick={resetTimer}
        className="flex items-center gap-1 text-[11px] font-bold text-stone-500 hover:text-stone-800 transition"
      >
        <RotateCcw className="w-3 h-3" /> Reiniciar tiempo
      </button>
    </div>
  );
}
