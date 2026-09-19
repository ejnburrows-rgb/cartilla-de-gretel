import { useState, useEffect } from "react";
import { audioEngine } from "@/lib/audio-engine";
import { Volume2, VolumeX, Music } from "lucide-react";

// Hoisted Styles for double-brace JSX styling ban compliance
const flexContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  backgroundColor: "#ffffff",
  border: "2px solid #ecdac3",
  padding: "0.4rem 0.85rem",
  borderRadius: "1rem",
  pointerEvents: "auto",
};

const iconBtnStyle = (active: boolean, color: string): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.35rem",
  borderRadius: "0.5rem",
  border: `1.5px solid ${active ? color : "#e7e5e4"}`,
  backgroundColor: active ? `${color}12` : "#ffffff",
  color: active ? color : "#78716c",
  cursor: "pointer",
  transition: "all 0.1s ease",
});

const labelStyle: React.CSSProperties = {
  fontSize: "0.65rem",
  fontWeight: "bold",
  color: "#44403c",
};

interface AmbientToggleProps {
  color?: string;
}

export function AmbientToggle({ color = "#78350f" }: AmbientToggleProps) {
  const [isAmbient, setIsAmbient] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsAmbient(audioEngine.isAmbientPlaying());
    setIsMuted(audioEngine.isMuted());
  }, []);

  const handleToggleAmbient = () => {
    const next = !isAmbient;
    setIsAmbient(next);
    audioEngine.toggleAmbient(next);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioEngine.setMuted(next);
  };

  const muteBtn = iconBtnStyle(isMuted, "#ef4444");
  const ambientBtn = iconBtnStyle(isAmbient && !isMuted, color);

  return (
    <div style={flexContainerStyle} className="shadow-sm no-print">
      {/* 1. Mute Toggle */}
      <button
        onClick={handleToggleMute}
        style={muteBtn}
        aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
        title={isMuted ? "Activar audio" : "Silenciar audio"}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* 2. Ambient Toggle */}
      <button
        onClick={handleToggleAmbient}
        style={ambientBtn}
        disabled={isMuted}
        aria-label={isAmbient ? "Pausar sonido ambiental" : "Activar sonido ambiental"}
        title={isAmbient ? "Pausar sonido ambiental" : "Activar sonido ambiental"}
      >
        <Music className="w-4 h-4" />
      </button>

      <span style={labelStyle}>Sonidos del Aula</span>
    </div>
  );
}
