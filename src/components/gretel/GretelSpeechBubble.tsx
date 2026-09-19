import React from "react";
import { useTheme } from "@/hooks/useTheme";

interface GretelSpeechBubbleProps {
  phrase: string;
  subtitle?: string;
  onDismiss: () => void;
}

/**
 * SUPPRESSED per owner directive (CLAUDE.md "Characters must be ALIVE"):
 * Gretel speaks via TTS audio only. No visible text bubble overlay that
 * blocks page content. This component now renders a screen-reader-only
 * live region so the phrase is still accessible to assistive tech.
 *
 * NOT deleted — file preserved per CLAUDE.md "never delete files" rule.
 * If the owner ever approves visible captions, re-add the visual JSX here.
 */
export function GretelSpeechBubble({ phrase, onDismiss }: GretelSpeechBubbleProps) {
  useTheme(); // keep hook call for compat even though lang is unused now

  return (
    <span
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-label={`Gretel dice: ${phrase}`}
      onClick={onDismiss}
    >
      {phrase}
    </span>
  );
}
export type GretelSpeechBubble = typeof GretelSpeechBubble;
