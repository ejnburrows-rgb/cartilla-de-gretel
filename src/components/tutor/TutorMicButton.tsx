/**
 * TutorMicButton — the tutor's one real button (spec §9).
 *
 * A real `<button>` (Space/Enter come for free), at least 96×96 px, with
 * `aria-pressed` for the capturing (mic open) state. While the mic is open
 * the red recording dot + "Escuchando…" is ALWAYS visible next to it, and
 * the button shows the recording state. The mic stays OFF until the child
 * taps; the gentle pulse invites the tap only during the LISTEN phase and
 * disappears under reduced motion.
 */
import { forwardRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface TutorMicButtonProps {
  /** True while the mic is open for this attempt (aria-pressed). */
  capturing: boolean;
  /** True during the LISTEN phase with the mic off: the gentle invite pulse. */
  inviting: boolean;
  disabled: boolean;
  /** Accessible label, Spanish, from the caller. */
  label: string;
  onTap: () => void;
}

export const MIC_BUTTON_MIN_PX = 96;

export const TutorMicButton = forwardRef<HTMLButtonElement, TutorMicButtonProps>(
  function TutorMicButton({ capturing, inviting, disabled, label, onTap }, ref) {
    const reducedMotion = useReducedMotion();

    return (
      <div className="flex flex-col items-center gap-2">
        <button
          ref={ref}
          type="button"
          data-tutor-mic=""
          data-capturing={capturing ? "true" : "false"}
          aria-pressed={capturing}
          aria-disabled={disabled || undefined}
          onClick={onTap}
          disabled={disabled}
          className={[
            "grid place-items-center rounded-full border-4 border-stone-700/20 bg-white shadow-[0_6px_0_rgba(45,32,20,0.15)]",
            "transition-transform active:translate-y-1 active:shadow-none",
            "focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-stone-700",
            capturing ? "bg-red-50" : "",
            inviting && !reducedMotion ? "animate-pulse" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            width: MIC_BUTTON_MIN_PX,
            height: MIC_BUTTON_MIN_PX,
            minWidth: MIC_BUTTON_MIN_PX,
            minHeight: MIC_BUTTON_MIN_PX,
          }}
        >
          {disabled && !capturing ? (
            <MicOff className="h-10 w-10 text-stone-400" aria-hidden="true" />
          ) : (
            <Mic className="h-10 w-10 text-stone-800" aria-hidden="true" />
          )}
          <span className="sr-only">{label}</span>
        </button>

        {/* Red recording dot + "Escuchando…" — always visible while the mic is open (spec §9). */}
        {capturing ? (
          <p
            role="status"
            aria-live="polite"
            data-tutor-listening-indicator=""
            className="flex items-center gap-2 text-lg font-black text-stone-800"
          >
            <span aria-hidden="true" className="inline-block h-3.5 w-3.5 rounded-full bg-red-600" />
            {/* Spec §9 approved string. */}
            Escuchando…
          </p>
        ) : null}
      </div>
    );
  },
);

export default TutorMicButton;
