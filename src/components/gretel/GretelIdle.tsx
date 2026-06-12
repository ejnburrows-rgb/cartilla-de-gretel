import type { GretelOutcome } from "@/hooks/useGretel";

interface GretelIdleProps {
  currentOutcome: GretelOutcome;
  setOutcome: (o: GretelOutcome) => void;
}

export function GretelIdle({ currentOutcome, setOutcome }: GretelIdleProps) {
  // Obsolete: idle micro-animations are now managed internally by GretelAvatar's FSM
  return null;
}
