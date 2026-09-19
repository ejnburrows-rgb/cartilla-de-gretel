import { useEffect } from "react";

interface KeyboardShortcuts {
  onPrevPage: () => void;
  onNextPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onToggleFullscreen: () => void;
  onToggleDrawer: () => void;
  onTogglePointer: () => void;
  onExit: () => void;
}

export function useKeyboardShortcuts({
  onPrevPage,
  onNextPage,
  onFirstPage,
  onLastPage,
  onToggleFullscreen,
  onToggleDrawer,
  onTogglePointer,
  onExit,
}: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          onPrevPage();
          break;
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          onNextPage();
          break;
        case "Home":
          e.preventDefault();
          onFirstPage();
          break;
        case "End":
          e.preventDefault();
          onLastPage();
          break;
        case "f":
        case "F":
          e.preventDefault();
          onToggleFullscreen();
          break;
        case "n":
        case "N":
          e.preventDefault();
          onToggleDrawer();
          break;
        case "p":
        case "P":
          e.preventDefault();
          onTogglePointer();
          break;
        case "Escape":
          e.preventDefault();
          onExit();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    onPrevPage,
    onNextPage,
    onFirstPage,
    onLastPage,
    onToggleFullscreen,
    onToggleDrawer,
    onTogglePointer,
    onExit,
  ]);
}
