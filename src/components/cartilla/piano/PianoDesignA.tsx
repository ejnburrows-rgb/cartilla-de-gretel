/**
 * Piano Hablador — design A, "Piano" (the original, refined).
 *
 * The original Piano Hablador kept at the same size and build: stone card,
 * title, helper text, wooden cabinet with the brass bar, mic + progress below.
 * The keyboard is a real octave (8 white + 5 black, do → do); the syllables sit
 * ABOVE the keys on a little staff, and a key lights up in its syllable's color
 * and plays its note when that syllable is recognized through the microphone.
 */
import type { CSSProperties } from "react";
import { ArrowRight, Check, Mic, MicOff, RotateCcw, Volume2 } from "lucide-react";
import { GretelLiveAvatar } from "@/components/gretel/GretelLiveAvatar";
import { usePianoSession, PRIVACY_NOTE, type PianoDesignProps } from "./usePianoSession";
import { OCTAVE_BLACK, OCTAVE_WHITE, STATE_LABEL, SYLLABLE_COLORS } from "./piano-keyboard";
import "./piano-design-a.css";

export const DESIGN_A_MAX_SYLLABLES = OCTAVE_WHITE.length;

export function PianoDesignA({ syllables, words, lessonId, onComplete, locale }: PianoDesignProps) {
  const s = usePianoSession({
    syllables,
    words,
    lessonId,
    onComplete,
    locale,
    maxSyllables: DESIGN_A_MAX_SYLLABLES,
    noteFor: (index) => OCTAVE_WHITE[index % OCTAVE_WHITE.length].freq,
  });

  if (!s.item) return null;
  const total = s.keys.length;
  const isFlashing = (id: string) => s.flash?.key === id;

  return (
    <div
      className="piano-hablador pa"
      data-design="piano"
      data-piano-word={s.item.word}
      data-confirmed={s.confirmed}
      data-done={s.done ? "true" : "false"}
      data-mic-status={s.status}
      data-recognition-processing={s.processing}
    >
      <h3 className="pa__title">El Piano Hablador</h3>
      <p className="pa__subtitle">Di las sílabas y el piano las toca</p>

      {s.wordMode && (
        <div className="pa__word" aria-label={`Palabra ${s.itemIndex + 1} de ${s.items.length}`}>
          <span className="pa__word-count">
            Palabra {s.itemIndex + 1} de {s.items.length}
          </span>
          <span className="pa__word-text" lang="es">
            {s.item.word}
          </span>
        </div>
      )}

      <div className="pa__message" role="status" aria-live="polite" data-testid="piano-message">
        {s.message}
      </div>

      {/* TOP — learning area: the syllables as notes on a little staff. */}
      <div className="pa__staff" role="list" aria-label="Sílabas para decir">
        <div className="pa__staff-lines" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((line) => (
            <span key={line} />
          ))}
        </div>
        <span className="pa__clef" aria-hidden="true">
          ♪
        </span>
        <div className="pa__notes">
          {s.keys.map((syllable, index) => {
            const state = s.keyStateFor(index);
            const color = SYLLABLE_COLORS[index % SYLLABLE_COLORS.length];
            return (
              <div
                key={`${s.itemIndex}-${index}`}
                role="listitem"
                className={`pa__note pa__note--${state} ${isFlashing(`s${index}`) ? "pa__note--flash" : ""}`}
                style={{ "--c": color, "--rise": `${Math.min(index, 4) * 7}px` } as CSSProperties}
                aria-label={`${syllable}, ${STATE_LABEL[state]}`}
                data-testid={`piano-note-${index}`}
              >
                <span className="pa__note-head" lang="es">
                  {syllable}
                  {state === "confirmed" && <Check className="pa__note-check" aria-hidden="true" />}
                </span>
                <button
                  type="button"
                  className="pa__note-listen"
                  aria-label={`Escuchar ${syllable}`}
                  onClick={() => s.listenToSyllable(index)}
                >
                  <Volume2 aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM — the piano: wooden cabinet, brass bar, one octave. */}
      <div className="pa__cabinet">
        <div className="pa__brass" aria-hidden="true" />
        {s.celebrating && (
          <span
            key={`spark-${s.itemIndex}`}
            className="pa__sparkle"
            aria-hidden="true"
            data-testid="piano-sparkle"
          />
        )}
        <div
          className={`pa__keys piano-hablador__bed ${total > 5 ? "pa__keys--full" : ""}`}
          role="img"
          aria-label="Teclado visual: las teclas se iluminan al reconocer la voz"
        >
          {OCTAVE_WHITE.map((key, index) => {
            const carries = index < total;
            const state = carries ? s.keyStateFor(index) : "free";
            const color = carries ? SYLLABLE_COLORS[index % SYLLABLE_COLORS.length] : "#f5d38a";
            return (
              <span
                key={key.id}
                aria-hidden="true"
                className={`pa__white pa__white--${state} ${carries ? "piano-hablador__slot" : ""} ${!carries && index >= 5 ? "pa__key--extra" : ""} ${isFlashing(carries ? `s${index}` : key.id) ? "pa__white--flash" : ""}`}
                style={{ "--c": color } as CSSProperties}
                data-key-state={carries ? state : undefined}
                data-testid={`piano-key-${index}`}
              >
                {carries && state === "confirmed" && (
                  <Check className="pa__white-check" aria-hidden="true" />
                )}
              </span>
            );
          })}
          {OCTAVE_BLACK.map((key, index) => (
            <span
              key={key.id}
              aria-hidden="true"
              className={`pa__black ${key.after >= 4 ? "pa__key--extra" : ""} ${isFlashing(key.id) ? "pa__black--flash" : ""}`}
              style={{ "--pos": key.after + 1 } as CSSProperties}
            />
          ))}
        </div>
      </div>

      <div className="pa__controls">
        <button
          type="button"
          className="pa__control"
          onClick={s.listenToWord}
          disabled={s.exampleActive}
          data-testid="piano-escuchar"
        >
          <Volume2 aria-hidden="true" /> Escuchar
        </button>
        <div className="pa__mic-wrap">
          <button
            type="button"
            onClick={s.toggleMic}
            disabled={s.micDisabled}
            aria-pressed={s.micOpen}
            aria-label={s.micOpen ? "Detener micrófono" : "Comenzar micrófono"}
            className={`pa__mic ${s.micOpen ? "pa__mic--open" : ""}`}
            data-testid="piano-mic"
          >
            {s.micOpen ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
          </button>
          <span className="pa__mic-label">
            {s.status === "hearing"
              ? "Te oigo…"
              : s.micOpen
                ? "Escuchando…"
                : s.exampleActive
                  ? "Escucha el ejemplo"
                  : "Toca para hablar"}
          </span>
        </div>
        <button
          type="button"
          className="pa__control"
          onClick={s.restartWord}
          data-testid="piano-reset"
        >
          <RotateCcw aria-hidden="true" /> Otra vez
        </button>
      </div>

      {s.done && (
        <div className="pa__success" data-testid="piano-success">
          <GretelLiveAvatar ref={s.gretelRef} managed size="sm" bubblePosition="right" />
          <button type="button" onClick={s.nextWord} className="pa__next" data-testid="piano-next">
            {s.isLastItem
              ? s.items.length > 1
                ? "Empezar de nuevo"
                : "Otra vez"
              : "Siguiente palabra"}
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="pa__progress" aria-label={`Progreso: ${s.confirmed} de ${total}`}>
        <div className="pa__progress-row">
          <span>Progreso</span>
          <span>
            {s.confirmed} de {total}
          </span>
        </div>
        <div className="pa__progress-bar">
          <span style={{ width: `${total ? (s.confirmed / total) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="pa__footer">
        <p className="pa__privacy" data-testid="piano-privacy">
          {PRIVACY_NOTE[s.processing]}
        </p>
      </div>
    </div>
  );
}
