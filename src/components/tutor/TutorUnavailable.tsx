/**
 * TutorUnavailable — gentle "can't listen right now" states (spec §9).
 *
 * No voice, no scary errors. Shown for: no microphone, denied permission,
 * and no on-device recognizer. Gretel keeps talking (the model lines still
 * play), only the listening part pauses. All child-facing sentences below
 * are DRAFT — owner wording to approve (they are minimal and gentle on
 * purpose).
 */
import { MicOff } from "lucide-react";
import type { EarsProblem } from "@/lib/tutor-ears";

export interface TutorUnavailableProps {
  problem: EarsProblem | null;
}

/** DRAFT wording — owner to approve (kept minimal and gentle). */
const GENTLE_TEXT: Record<EarsProblem, string> = {
  "no-microphone": "El micrófono no está listo en este aparato.",
  denied: "El micrófono necesita permiso para escuchar.",
  unsupported: "Este aparato no puede escuchar por ahora.",
  "no-local": "Este aparato no puede escuchar por ahora.",
  "no-speech": "Gretel no escuchó nada. Toca el micrófono otra vez.",
  failed: "El micrófono se detuvo un momento.",
};

/** DRAFT wording — owner to approve. */
const REASSURANCE = "Puedes seguir escuchando a Gretel.";

export function TutorUnavailable({ problem }: TutorUnavailableProps) {
  if (!problem) return null;
  return (
    <section
      data-tutor-unavailable=""
      data-problem={problem}
      role="status"
      aria-live="polite"
      className="flex max-w-md items-center gap-3 rounded-2xl border-2 border-stone-200 bg-white/80 px-5 py-4"
    >
      <MicOff className="h-8 w-8 shrink-0 text-stone-400" aria-hidden="true" />
      <div>
        <p className="text-lg font-bold text-stone-800">{GENTLE_TEXT[problem]}</p>
        <p className="mt-1 text-sm font-medium text-stone-600">{REASSURANCE}</p>
      </div>
    </section>
  );
}

export default TutorUnavailable;
