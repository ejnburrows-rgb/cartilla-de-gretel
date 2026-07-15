import { useState, useEffect, useCallback } from "react";
import { announceToScreenReader } from "@/components/a11y/LiveRegion";

export type GretelOutcome =
  | "correct"
  | "streak"
  | "lesson-complete"
  | "start"
  | "try-again"
  | "thinking"
  | "happy"
  | "idle";

export interface GretelSpeakDetail {
  outcome: GretelOutcome;
  phrase: string;
  subtitle?: string;
  duration?: number;
}

export function useGretel() {
  const [lastPhrase, setLastPhrase] = useState<{ phrase: string; subtitle?: string } | null>(null);
  const [outcome, setOutcomeState] = useState<GretelOutcome>("happy");
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const trigger = useCallback(
    (
      newOutcome: GretelOutcome,
      opts?: { phrase: string; subtitle?: string; duration?: number },
    ) => {
      setOutcomeState(newOutcome);
      if (opts?.phrase) {
        setLastPhrase({ phrase: opts.phrase, subtitle: opts.subtitle });

        // Auto screen reader announcements
        announceToScreenReader(opts.phrase);

        const duration = opts.duration ?? 3500;
        const timer = setTimeout(() => {
          setLastPhrase(null);
        }, duration);
        return () => clearTimeout(timer);
      }
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleGretelSpeak = (e: Event) => {
      const detail = (e as CustomEvent)?.detail as GretelSpeakDetail;
      if (!detail) return;

      trigger(detail.outcome, {
        phrase: detail.phrase,
        subtitle: detail.subtitle,
        duration: detail.duration,
      });
    };

    window.addEventListener("cartilla:gretel-speak", handleGretelSpeak);
    return () => {
      window.removeEventListener("cartilla:gretel-speak", handleGretelSpeak);
    };
  }, [trigger]);

  return { trigger, lastPhrase, outcome, isVisible, setIsVisible, setOutcomeState };
}
