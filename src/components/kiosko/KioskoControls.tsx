import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Play, Pause, RotateCcw, Volume2, VolumeX, LogOut, Clock } from "lucide-react";
import { audioEngine } from "@/lib/audio-engine";

interface KioskoControlsProps {
  accentColor?: string;
  onExit?: () => void;
}

// Hoisted Styles for double-brace JSX styling ban compliance
const controlsContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.85rem",
  backgroundColor: "rgba(20, 18, 16, 0.85)",
  backdropFilter: "blur(12px)",
  padding: "0.5rem 1rem",
  borderRadius: "1.25rem",
  border: "1.5px solid rgba(255, 248, 222, 0.15)",
  pointerEvents: "auto",
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
};

const timerBoxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  paddingRight: "0.85rem",
  borderRight: "1px solid rgba(255, 248, 222, 0.15)",
};

const timerDigitsStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "1.1rem",
  fontWeight: "bold",
  color: "#ffd43b",
  minWidth: "3.2rem",
  textAlign: "center",
};

const roundBtnStyle = (active: boolean, color: string): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  border: active ? `2px solid ${color}` : "1.5px solid rgba(255, 248, 222, 0.3)",
  backgroundColor: active ? `${color}30` : "transparent",
  color: active ? color : "#fff8de",
  cursor: "pointer",
  transition: "all 0.15s ease",
});

const exitBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  padding: "0.4rem 0.85rem",
  borderRadius: "0.85rem",
  backgroundColor: "rgba(239, 68, 68, 0.15)",
  border: "1.5px solid rgba(239, 68, 68, 0.4)",
  color: "#fca5a5",
  fontSize: "0.75rem",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

export function KioskoControls({ accentColor = "#ff922b", onExit }: KioskoControlsProps) {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);

  // Timer State (Stopwatch)
  const [timeSecs, setTimeSecs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    setIsMuted(audioEngine.isMuted());
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeSecs((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioEngine.setMuted(next);
  };

  const handleToggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimeSecs(0);
  };

  const handleExitClick = () => {
    if (onExit) {
      onExit();
    } else {
      navigate({ to: "/cartilla/lecciones" });
    }
  };

  // Formatting helper
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const muteBtn = roundBtnStyle(isMuted, "#ef4444");
  const playBtn = roundBtnStyle(timerRunning, accentColor);
  const resetBtn = roundBtnStyle(false, "#868e96");

  return (
    <div style={controlsContainerStyle} className="kiosko-controls-overlay shadow-lg no-print">
      {/* Timer Section */}
      <div style={timerBoxStyle}>
        <Clock className="w-4 h-4 text-stone-400" />
        <span style={timerDigitsStyle}>{formatTime(timeSecs)}</span>
        <button
          onClick={handleToggleTimer}
          style={playBtn}
          title={timerRunning ? "Pausar cronómetro" : "Iniciar cronómetro"}
          aria-label={timerRunning ? "Pausar cronómetro" : "Iniciar cronómetro"}
        >
          {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>
        <button
          onClick={handleResetTimer}
          style={resetBtn}
          title="Reiniciar cronómetro"
          aria-label="Reiniciar cronómetro"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mute Section */}
      <button
        onClick={handleToggleMute}
        style={muteBtn}
        title={isMuted ? "Activar sonido" : "Silenciar sonido"}
        aria-label={isMuted ? "Activar sonido" : "Silenciar sonido"}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Exit CRM */}
      <button
        onClick={handleExitClick}
        style={exitBtnStyle}
        className="hover:bg-red-500/20 active:scale-95"
        title="Salir del Modo Kiosko"
        aria-label="Salir del Modo Kiosko"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Salir</span>
      </button>
    </div>
  );
}
