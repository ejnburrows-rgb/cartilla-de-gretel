import React, { useEffect, useRef, useState } from "react";
import "@/styles/student-kernel.css";
import { gretelEvent } from "@/lib/gretel-bus";
import { playCorrectChord } from "@/lib/piano-audio";
import { speakGretelPhrase } from "@/lib/gretel-tts";

export type KernelMarkState =
  | "idle"
  | "marking"
  | "neutral-hold"
  | "success"
  | "retry-erase";

export interface ClassicPencilActorProps {
  mode?: "pencil" | "eraser";
  animating?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Classic wooden pencil + matching school eraser actor component.
 * Rendered during active workbook marking and erasing choreographies. */
export function ClassicPencilActor({
  mode = "pencil",
  animating = false,
  className = "",
  style,
}: ClassicPencilActorProps) {
  const isEraser = mode === "eraser";

  return (
    <div
      className={`pencil-actor ${isEraser ? "pencil-actor--eraser" : "pencil-actor--pencil"} ${
        animating ? "pencil-actor--animating" : ""
      } ${className}`}
      style={style}
      aria-hidden="true"
      data-testid="classic-pencil-actor"
      data-mode={mode}
    >
      <svg
        viewBox="0 0 40 140"
        className="pencil-actor__svg"
        style={{
          width: "36px",
          height: "126px",
          transformOrigin: isEraser ? "20px 15px" : "20px 135px",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: isEraser ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        {/* Graphite tip */}
        <polygon points="20,138 15,124 25,124" fill="#374151" />
        {/* Wood cone */}
        <polygon points="15,124 25,124 28,105 12,105" fill="#e3a857" />
        {/* Yellow pencil body */}
        <rect x="12" y="25" width="16" height="80" rx="1" fill="#f59e0b" />
        {/* Body facet highlights */}
        <line x1="17" y1="25" x2="17" y2="105" stroke="#fbbf24" strokeWidth="1.5" />
        <line x1="23" y1="25" x2="23" y2="105" stroke="#d97706" strokeWidth="1.5" />
        {/* Silver ferrule */}
        <rect x="11" y="13" width="18" height="12" rx="1" fill="#9ca3af" />
        <line x1="11" y1="17" x2="29" y2="17" stroke="#d1d5db" strokeWidth="1" />
        <line x1="11" y1="21" x2="29" y2="21" stroke="#6b7280" strokeWidth="1" />
        {/* Nostalgic muted red school eraser */}
        <path
          d="M 12 13 L 12 5 C 12 2 28 2 28 5 L 28 13 Z"
          fill="#e11d48"
        />
      </svg>
    </div>
  );
}

export interface RealWorkbookMarkProps {
  type?: "circle" | "x";
  state: KernelMarkState;
  reducedMotion?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** SVG mark component that renders the classic graphite / green mark
 * with smooth pencil draw & eraser wipe animations. */
export function RealWorkbookMark({
  type = "circle",
  state,
  reducedMotion = false,
  className = "",
  style,
}: RealWorkbookMarkProps) {
  if (state === "idle") return null;

  const isGreen = state === "success";
  const isErasing = state === "retry-erase";

  const markColor = isGreen ? "var(--color-correct, #2f7d4a)" : "#4b5563"; // Graphite pencil color

  return (
    <div
      className={`real-workbook-mark real-workbook-mark--${state} ${className}`}
      style={style}
      aria-hidden="true"
      data-testid="real-workbook-mark"
      data-state={state}
      data-type={type}
    >
      <svg
        viewBox="0 0 100 100"
        className="real-workbook-mark__svg"
        style={{
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        {type === "x" ? (
          <g
            stroke={markColor}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            style={{
              transition: isErasing
                ? "opacity 0.4s ease 0.3s"
                : "stroke 0.3s ease",
              opacity: isErasing ? 0 : 1,
            }}
          >
            <path
              d="M 20 20 L 80 80"
              className={!reducedMotion && state === "marking" ? "draw-path-1" : ""}
            />
            <path
              d="M 80 20 L 20 80"
              className={!reducedMotion && state === "marking" ? "draw-path-2" : ""}
            />
          </g>
        ) : (
          <ellipse
            cx="50"
            cy="50"
            rx="44"
            ry="40"
            fill="none"
            stroke={markColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="270"
            style={{
              transition: isErasing
                ? "opacity 0.4s ease 0.3s, stroke-dashoffset 0.5s ease"
                : "stroke 0.4s ease, opacity 0.2s ease",
              opacity: isErasing ? 0 : 1,
            }}
            className={!reducedMotion && state === "marking" ? "draw-ellipse" : ""}
          />
        )}
      </svg>
    </div>
  );
}

/** Perform pencil retry / success choreography for an attempt.
 * Handled with standard timing tokens or immediate state for reduced motion. */
export function runKernelMarkChoreography({
  isCorrect,
  reducedMotion,
  onStateChange,
  onComplete,
}: {
  isCorrect: boolean;
  reducedMotion?: boolean;
  onStateChange: (state: KernelMarkState) => void;
  onComplete?: (correct: boolean) => void;
}): () => void {
  let timer1: NodeJS.Timeout | null = null;
  let timer2: NodeJS.Timeout | null = null;

  if (reducedMotion) {
    if (isCorrect) {
      onStateChange("success");
      playCorrectChord();
      speakGretelPhrase("Buen trabajo.");
      gretelEvent("answer:correct");
      if (onComplete) onComplete(true);
    } else {
      onStateChange("retry-erase");
      speakGretelPhrase("Inténtalo otra vez.");
      gretelEvent("answer:wrong");
      timer1 = setTimeout(() => {
        onStateChange("idle");
        if (onComplete) onComplete(false);
      }, 300);
    }
    return () => {
      if (timer1) clearTimeout(timer1);
    };
  }

  // Normal motion sequence:
  // 1. "marking" -> draw graphite mark
  onStateChange("marking");

  timer1 = setTimeout(() => {
    // 2. "neutral-hold" (~3 seconds hold)
    onStateChange("neutral-hold");

    timer2 = setTimeout(() => {
      if (isCorrect) {
        // 3a. Success: turn green + Gretel "Buen trabajo"
        onStateChange("success");
        playCorrectChord();
        speakGretelPhrase("Buen trabajo.");
        gretelEvent("answer:correct");
        if (onComplete) onComplete(true);
      } else {
        // 3b. Wrong answer — Pencil Retry: rotate to eraser, erase mark, Gretel "Inténtalo otra vez."
        // No punitive buzzer or red X per owner spec.
        onStateChange("retry-erase");
        speakGretelPhrase("Inténtalo otra vez.");
        gretelEvent("answer:wrong");

        setTimeout(() => {
          onStateChange("idle");
          if (onComplete) onComplete(false);
        }, 800);
      }
    }, 3000); // ~3 seconds neutral hold
  }, 450); // marking stroke duration

  return () => {
    if (timer1) clearTimeout(timer1);
    if (timer2) clearTimeout(timer2);
  };
}
