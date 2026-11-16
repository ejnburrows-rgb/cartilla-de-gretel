import { useEffect, useState } from "react";

/**
 * normal = current main (system cursor + flying wooden pencil);
 * tip = #1305 photo-tip candidate (not offered for approval);
 * contract = November 1 contract candidate (single close-up tip of the existing pencil).
 */
export type CursorMode = "normal" | "tip" | "contract";
export const CURSOR_MODE_KEY = "cartilla:cursor-mode";
export const PENCIL_TIP_SRC = "/cartilla/images/ui/owner-pencil-tip.svg";
let lastPointer: { x: number; y: number } | null = null;
export function recordPointer(x: number, y: number) { lastPointer = { x, y }; }
export function getLastPointer() { return lastPointer; }
export function toolSize(kind: "tip" | "eraser") {
  const coarse = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  return kind === "tip" ? (coarse ? 160 : 240) : (coarse ? 48 : 64);
}
export function readCursorMode(): CursorMode {
  if (typeof window === "undefined") return "normal";
  try {
    const requested = new URLSearchParams(window.location.search).get("cursor");
    if (requested === "tip" || requested === "normal" || requested === "contract") {
      localStorage.setItem(CURSOR_MODE_KEY, requested);
      return requested;
    }
    const saved = localStorage.getItem(CURSOR_MODE_KEY);
    return saved === "tip" || saved === "contract" ? saved : "normal";
  } catch { return "normal"; }
}
/** Accessibility settings and forced colors always keep the standard cursor and tool. */
export function useCursorMode(): CursorMode {
  const [mode, setMode] = useState<CursorMode>(readCursorMode);
  useEffect(() => {
    const media = window.matchMedia?.("(forced-colors: active)");
    const refresh = () => {
      const root = document.documentElement;
      const accessible = ["a11y-contrast", "a11y-dyslexia", "a11y-large", "a11y-xlarge"].some(c => root.classList.contains(c));
      setMode(accessible || media?.matches ? "normal" : readCursorMode());
    };
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    media?.addEventListener?.("change", refresh);
    window.addEventListener("popstate", refresh);
    refresh();
    return () => { observer.disconnect(); media?.removeEventListener?.("change", refresh); window.removeEventListener("popstate", refresh); };
  }, []);
  return mode;
}
