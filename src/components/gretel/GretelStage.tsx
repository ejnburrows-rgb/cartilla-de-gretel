import React, { useState, useEffect } from "react";
import { useGretel } from "@/hooks/useGretel";
import { GretelAvatar } from "./GretelAvatar";
import { GretelSpeechBubble } from "./GretelSpeechBubble";
import { GretelIdle } from "./GretelIdle";
import { GretelReaction } from "./GretelReaction";
import "@/styles/gretel.css";

export function GretelStage() {
  const { lastPhrase, outcome, isVisible, setOutcomeState, trigger } = useGretel();
  const [reactionId, setReactionId] = useState<number>(0);

  // We want to trigger a visual sparkle reaction on positive dynamic triggers
  useEffect(() => {
    if (outcome === "correct" || outcome === "streak" || outcome === "lesson-complete") {
      setReactionId((prev) => prev + 1);
    }
  }, [outcome]);

  const handleDismissBubble = () => {
    // Manually clear current speaking phrase
    trigger(outcome, { phrase: "", duration: 0 });
  };

  if (!isVisible) return null;

  return (
    <div className="gretel-stage no-print" aria-label="Gretel Asistente de Lectura">
      {/* 1. Speech Bubble Overlay */}
      {lastPhrase && (
        <GretelSpeechBubble
          phrase={lastPhrase.phrase}
          subtitle={lastPhrase.subtitle}
          onDismiss={handleDismissBubble}
        />
      )}

      {/* 2. Avatar illustration container */}
      <div className="gretel-avatar-container" onClick={() => trigger("happy", { phrase: "¡Hola! Estoy lista para leer contigo.", subtitle: "Hello! I am ready to read with you." })}>
        <GretelAvatar outcome={outcome} />
        
        {/* Sparkle explosion reaction mount */}
        {reactionId > 0 && <GretelReaction key={reactionId} />}
      </div>

      {/* 3. Idle micro-animations pose cycler */}
      <GretelIdle currentOutcome={outcome} setOutcome={setOutcomeState} />
    </div>
  );
}
export type GretelStage = typeof GretelStage;
