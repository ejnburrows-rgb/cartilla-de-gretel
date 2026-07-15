import { triggerHaptic, HapticKind } from "./haptic-patterns";

export interface FeelEventDetail {
  kind: string;
  meta?: unknown;
}

export const feelBus = {
  emit(kind: string, meta?: unknown) {
    if (typeof window === "undefined") return;
    const event = new CustomEvent("cartilla:feel", {
      detail: { kind, meta },
    });
    window.dispatchEvent(event);
  },

  onFeel(handler: (detail: FeelEventDetail) => void) {
    if (typeof window === "undefined") return () => {};

    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<FeelEventDetail>;
      handler(customEvent.detail);
    };

    window.addEventListener("cartilla:feel", listener);
    return () => {
      window.removeEventListener("cartilla:feel", listener);
    };
  },
};

// Automatic subscription to trigger sound and vibration
if (typeof window !== "undefined") {
  feelBus.onFeel(async (detail) => {
    // 1. Vibration
    triggerHaptic(detail.kind as HapticKind);

    // 2. Audio playback
    const isMuted = localStorage.getItem("cartilla:audio:muted") === "true";
    if (isMuted) return;

    const volume = Number(localStorage.getItem("cartilla:audio:volume") ?? "0.8");

    try {
      const src = `/audio/feel/${detail.kind}.mp3`;
      // Fetch headers to check content-length
      const res = await fetch(src, { method: "HEAD" }).catch(() => null);
      if (res) {
        const len = res.headers.get("content-length");
        if (len && parseInt(len, 10) < 100) return;
      }

      const audio = new Audio(src);
      audio.volume = volume;
      audio.play().catch(() => {
        /* ignore */
      });
    } catch {
      // ignore
    }
  });
}
