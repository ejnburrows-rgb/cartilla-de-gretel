import { useEffect, useState } from "react";

/**
 * normal = previous main (system cursor + flying wooden pencil, override `?cursor=normal`);
 * tip = #1305 photo-tip candidate (not offered for approval);
 * contract = Locked Option B default (November 1 contract: single close-up wooden tip).
 */
export type CursorMode = "normal" | "tip" | "contract";
export const DEFAULT_CURSOR_MODE: CursorMode = "contract";
export const CURSOR_MODE_KEY = "cartilla:cursor-mode";
export const PENCIL_TIP_SRC = "/cartilla/images/ui/owner-pencil-tip.svg";
export const PENCIL_TIP_VIEWBOX = { width: 388, height: 322 } as const;
export const ERASER_CURSOR_SRC = "/cartilla/images/ui/owner-eraser.svg";
export const ERASER_VIEWBOX = { width: 388, height: 322 } as const;
let lastPointer: { x: number; y: number } | null = null;
export function recordPointer(x: number, y: number) { lastPointer = { x, y }; }
export function getLastPointer() { return lastPointer; }
export function toolSize(kind: "tip" | "eraser" = "tip") {
  const coarse = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  return coarse ? 160 : 240;
}
export function readCursorMode(): CursorMode {
  if (typeof window === "undefined") return DEFAULT_CURSOR_MODE;
  try {
    const requested = new URLSearchParams(window.location.search).get("cursor");
    if (requested === "tip" || requested === "normal" || requested === "contract") {
      localStorage.setItem(CURSOR_MODE_KEY, requested);
      return requested;
    }
    const saved = localStorage.getItem(CURSOR_MODE_KEY);
    return saved === "tip" || saved === "normal" || saved === "contract" ? saved : DEFAULT_CURSOR_MODE;
  } catch { return DEFAULT_CURSOR_MODE; }
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
