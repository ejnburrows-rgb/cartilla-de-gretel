import React from "react";
import { useTheme } from "@/hooks/useTheme";

interface GretelSpeechBubbleProps {
  phrase: string;
  subtitle?: string;
  onDismiss: () => void;
}

// Hoisted Styles for double-brace JSX styling ban compliance
const phraseStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: "bold",
  lineHeight: "1.35",
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "var(--muted-color)",
  lineHeight: "1.3",
  marginTop: "0.25rem",
  fontStyle: "italic",
};

export function GretelSpeechBubble({ phrase, subtitle, onDismiss }: GretelSpeechBubbleProps) {
  const { lang } = useTheme();

  return (
    <div
      onClick={onDismiss}
      className="gretel-speech-bubble no-print"
      role="alert"
      aria-label={`Gretel dice: ${phrase}`}
      title="Toca para descartar"
    >
      <p style={phraseStyle}>{phrase}</p>
      {lang === "en" && subtitle && (
        <p style={subtitleStyle}>{subtitle}</p>
      )}
    </div>
  );
}
export type GretelSpeechBubble = typeof GretelSpeechBubble;
