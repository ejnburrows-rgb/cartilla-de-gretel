import { useCallback, useRef } from "react";
import { feelBus } from "../lib/feel-bus";

export interface UseDragWithGhostOptions {
  onDragStart?: () => void;
  onDragEnd?: (success: boolean) => void;
  ghostClassName?: string;
}

export function useDragWithGhost(options: UseDragWithGhostOptions = {}) {
  const ghostRef = useRef<HTMLElement | null>(null);
  const startCoords = useRef<{ x: number; y: number } | null>(null);

  const cleanupGhost = useCallback(() => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
    startCoords.current = null;
  }, []);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const target = event.currentTarget;
    if (!target) return;

    event.preventDefault();
    target.setPointerCapture(event.pointerId);

    const rect = target.getBoundingClientRect();
    startCoords.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    // Emit event for drag start
    feelBus.emit("drag-pick");
    options.onDragStart?.();

    // Create custom ghost element
    const ghost = target.cloneNode(true) as HTMLElement;
    ghost.className = `${ghost.className} ${options.ghostClassName || "drag-ghost-active"}`;
    
    // Style directly on DOM properties (JSX ban safe)
    ghost.style.position = "fixed";
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.left = `${rect.left}px`;
    ghost.style.top = `${rect.top}px`;
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "999999";
    ghost.style.opacity = "0.75";
    ghost.style.transform = "scale(1.08)";

    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  }, [options]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (!ghostRef.current || !startCoords.current) return;

    const x = event.clientX - startCoords.current.x;
    const y = event.clientY - startCoords.current.y;

    ghostRef.current.style.left = `${x}px`;
    ghostRef.current.style.top = `${y}px`;
  }, []);

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (!ghostRef.current) return;

    const target = event.currentTarget;
    if (target) {
      target.releasePointerCapture(event.pointerId);
    }

    // Emit event for drag end
    feelBus.emit("drag-drop");
    options.onDragEnd?.(true);

    cleanupGhost();
  }, [cleanupGhost, options]);

  const onPointerCancel = useCallback(() => {
    options.onDragEnd?.(false);
    cleanupGhost();
  }, [cleanupGhost, options]);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}

export type UseDragWithGhost = typeof useDragWithGhost;
