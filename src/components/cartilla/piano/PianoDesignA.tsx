/**
 * Piano Hablador — design A, "Piano" (the original, refined).
 *
 * Stone card, title, wooden cabinet with the brass bar, mic + progress below.
 * Owner-approved 2026-10-23: the keyboard has nine white keys in three groups
 * of three — one group per syllable, left to right. The syllables sit ABOVE
 * their groups on a little staff. For the group being practiced, the first key
 * presses red when the microphone picks up sound, the second presses yellow
 * while the voice continues, and the third presses green only when the
 * syllable is recognized; then the whole group stays green (see
 * `usePianoGroups`). A small switch chooses Palabras (book words) or Sílabas
 * (the lesson's syllables, three at a time) when both exist.
 */
import type { CSSProperties } from "react";
import { ArrowRight, Check, Mic, MicOff, RotateCcw, Volume2 } from "lucide-react";
import { GretelLiveAvatar } from "@/components/gretel/GretelLiveAvatar";
import { PRIVACY_NOTE, type PianoDesignProps } from "./usePianoSession";
import { usePianoGroups, type PianoMode } from "./usePianoGroups";
import {
  CONFIRMED_GREEN,
  GROUP_COUNT,
  GROUP_RED,
  GROUP_SIZE,
  GROUP_STATE_LABEL,
  GROUP_YELLOW,
} from "./piano-keyboard";
import "./piano-design-a.css";

export const DESIGN_A_MAX_SYLLABLES = GROUP_COUNT;

const MODE_LABEL: Record<PianoMode, string> = { palabras: "Palabras", silabas: "Sílabas" };

/** The color a key shows in each state (white keys stay ivory until pressed). */
function keyColor(state: string): string {
  if (state === "confirmed") return CONFIRMED_GREEN;
  if (state === "red") return GROUP_RED;
  if (state === "yellow") return GROUP_YELLOW;
  return "#fffdf8";
}

export function PianoDesignA({ syllables, words, lessonId, onComplete, locale }: PianoDesignProps) {
  const s = usePianoGroups({ syllables, words, lessonId, onComplete, locale });

  if (!s.item) return null;
  const total = s.keys.length;
  const groups = Array.from({ length: GROUP_COUNT }, (_, group) => group);

  return (
    <div
      className="piano-hablador pa"
      data-design="piano"
      data-piano-mode={s.mode}
      data-piano-word={s.item.word}
      data-confirmed={s.confirmed}
      data-done={s.done ? "true" : "false"}
      data-mic-status={s.status}
      data-recognition-processing={s.processing}
    >
      <h3 className="pa__title">El Piano Hablador</h3>
      <p className="pa__subtitle">Di cada sílaba y el piano la toca</p>

      {s.modes.length > 1 && (
        <div className="pa__modes" role="group" aria-label="Qué practicar">
          {s.modes.map((mode) => (
            <button
              key={mode}
              type="button"
              className="pa__mode"
              aria-pressed={s.mode === mode}
              onClick={() => s.chooseMode(mode)}
              data-testid={`piano-mode-${mode}`}
            >
              {MODE_LABEL[mode]}
            </button>
          ))}
        </div>
      )}

      {s.items.length > 1 && (
        <div
          className="pa__word"
          aria-label={`${s.wordMode ? "Palabra" : "Ronda"} ${s.itemIndex + 1} de ${s.items.length}`}
        >
          <span className="pa__word-count">
            {s.wordMode ? "Palabra" : "Ronda"} {s.itemIndex + 1} de {s.items.length}
          </span>
          {s.wordMode && (
            <span className="pa__word-text" lang="es">
              {s.item.word}
            </span>
          )}
        </div>
      )}
      {s.items.length === 1 && s.wordMode && (
        <div className="pa__word">
          <span className="pa__word-text" lang="es">
            {s.item.word}
          </span>
        </div>
      )}

      <div className="pa__message" role="status" aria-live="polite" data-testid="piano-message">
        {s.message}
      </div>

      {/* TOP — one note on the staff over each group of three keys. */}
      <div className="pa__staff" role="list" aria-label="Sílabas para decir">
        <div className="pa__staff-lines" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((line) => (
            <span key={line} />
          ))}
        </div>
        <span className="pa__clef" aria-hidden="true">
          ♪
        </span>
        <div className="pa__notes pa__notes--groups">
          {groups.map((group) => {
            const syllable = s.keys[group];
            if (!syllable)
              return (
                <div key={`free-${group}`} className="pa__note pa__note--free" aria-hidden="true" />
              );
            const state = s.groupStateFor(group);
            return (
              <div
                key={`${s.itemIndex}-${group}`}
                role="listitem"
                className={`pa__note pa__note--${state}`}
                style={
                  { "--c": state === "confirmed" ? CONFIRMED_GREEN : "#a8a29e" } as CSSProperties
                }
                aria-label={`${syllable}, ${GROUP_STATE_LABEL[state]}`}
                data-testid={`piano-note-${group}`}
                data-group-state={state}
              >
                <span className="pa__note-head" lang="es">
                  {syllable}
                  {state === "confirmed" && <Check className="pa__note-check" aria-hidden="true" />}
                </span>
                <button
                  type="button"
                  className="pa__note-listen"
                  aria-label={`Escuchar ${syllable}`}
                  onClick={() => s.listenToSyllable(group)}
                >
                  <Volume2 aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM — the piano: nine keys, three groups of three. */}
      <div className="pa__cabinet">
        <div className="pa__brass" aria-hidden="true" />
        <div
          className="pa__keys pa__keys--groups piano-hablador__bed"
          role="img"
          aria-label="Teclado visual: tres teclas por sílaba que se iluminan con la voz"
        >
          {groups.map((group) => {
            const carries = group < total;
            return (
              <div
                key={group}
                className={`pa__group pa__group--${carries ? s.groupStateFor(group) : "free"}`}
                data-testid={`piano-group-${group}`}
                data-group-state={carries ? s.groupStateFor(group) : "free"}
              >
                {Array.from({ length: GROUP_SIZE }, (_, step) => {
                  const index = group * GROUP_SIZE + step;
                  const state = s.keyStateFor(index);
                  const pressed = state === "red" || state === "yellow" || s.flash?.key === index;
                  return (
                    <span
                      key={index}
                      aria-hidden="true"
                      className={`pa__white pa__white--${state} ${carries ? "piano-hablador__slot" : ""} ${pressed ? "pa__white--pressed" : ""}`}
                      style={{ "--c": keyColor(state) } as CSSProperties}
                      data-key-state={carries ? state : undefined}
                      data-testid={`piano-key-${index}`}
                    >
                      {state === "confirmed" && step === GROUP_SIZE - 1 && (
                        <Check className="pa__white-check" aria-hidden="true" />
                      )}
                    </span>
                  );
                })}
                <span className="pa__black pa__black--g1" aria-hidden="true" />
                <span className="pa__black pa__black--g2" aria-hidden="true" />
                {carries && s.sparkle?.group === group && (
                  <span
                    key={`spark-${s.sparkle.n}`}
                    className="pa__sparkle pa__sparkle--group"
                    aria-hidden="true"
                    data-testid="piano-sparkle"
                    data-sparkle-for={group}
                  />
                )}
              </div>
            );
          })}
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
              : s.wordMode
                ? "Siguiente palabra"
                : "Siguiente ronda"}
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
