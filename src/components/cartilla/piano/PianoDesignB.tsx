/**
 * Piano Hablador — design B, "Cancionero" (Gretel's songbook).
 *
 * The syllables are printed like the lyrics of a little song, each one on its
 * own colored note on the staff, with a sing-along ball over the syllable to
 * say next. Below, a five-key piano (do–sol + 3 black keys): one big key per
 * syllable, so every key is thumb-sized. Each key has a lamp in the same color
 * as its note; when the syllable is said the note fills in, the lamp lights
 * and the key plays. On phones the piano, its buttons and the feedback are
 * docked at the bottom of the screen, within thumb reach.
 */
import type { CSSProperties } from "react";
import { ArrowRight, Check, Hand, Mic, MicOff, RotateCcw, Volume2 } from "lucide-react";
import { GretelLiveAvatar } from "@/components/gretel/GretelLiveAvatar";
import { usePianoSession, PRIVACY_NOTE, type PianoDesignProps } from "./usePianoSession";
import { FIVE_BLACK, FIVE_WHITE, STATE_LABEL, SYLLABLE_COLORS, useHotkeys } from "./piano-keyboard";
import "./piano-design-b.css";

export const DESIGN_B_MAX_SYLLABLES = FIVE_WHITE.length;

// Note-head height on the staff for do, re, mi, fa, sol (0 = bottom line).
const STAFF_STEP = [0, 1, 2, 3, 4];

export function PianoDesignB({ syllables, words, lessonId, onComplete, locale }: PianoDesignProps) {
  const s = usePianoSession({
    syllables,
    words,
    lessonId,
    onComplete,
    locale,
    maxSyllables: DESIGN_B_MAX_SYLLABLES,
    noteFor: (index) => FIVE_WHITE[index % FIVE_WHITE.length].freq,
  });

  const pressWhite = (index: number) => {
    if (index < s.keys.length) s.pressSyllableKey(index);
    else s.pressFreeKey(FIVE_WHITE[index].id, FIVE_WHITE[index].freq);
  };
  const pressBlack = (index: number) =>
    s.pressFreeKey(FIVE_BLACK[index].id, FIVE_BLACK[index].freq);
  const hotkeys: Record<string, () => void> = {};
  FIVE_WHITE.forEach((key, index) =>
    key.hotkeys.forEach((h) => (hotkeys[h] = () => pressWhite(index))),
  );
  FIVE_BLACK.forEach((key, index) =>
    key.hotkeys.forEach((h) => (hotkeys[h] = () => pressBlack(index))),
  );
  useHotkeys(hotkeys);

  if (!s.item) return null;
  const total = s.keys.length;
  const isFlashing = (id: string) => s.flash?.key === id;
  const title = s.wordMode ? s.item.word : "Di las sílabas";

  return (
    <section
      className="piano-hablador pb"
      data-design="cancionero"
      data-piano-word={s.item.word}
      data-confirmed={s.confirmed}
      data-done={s.done ? "true" : "false"}
      data-mic-status={s.status}
      data-recognition-processing={s.processing}
      aria-label="El Piano Hablador"
    >
      <div className="pb__sheet">
        <header className="pb__header">
          <span className="pb__eyebrow">El Piano Hablador</span>
          <span className="pb__count">
            {s.wordMode ? `Palabra ${s.itemIndex + 1} de ${s.items.length}` : "Canción de sílabas"}
          </span>
        </header>
        <h3 className="pb__title" lang="es">
          {title}
        </h3>

        {/* TOP — the song: one column per syllable, ball over the next one. */}
        <div
          className="pb__song"
          role="list"
          aria-label="Sílabas para decir"
          style={{ "--n": Math.max(total, 1) } as CSSProperties}
        >
          <div className="pb__staff" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((line) => (
              <span key={line} />
            ))}
          </div>
          {s.keys.map((syllable, index) => {
            const state = s.keyStateFor(index);
            const color = SYLLABLE_COLORS[index % SYLLABLE_COLORS.length];
            return (
              <div
                key={`${s.itemIndex}-${index}`}
                role="listitem"
                className={`pb__col pb__col--${state} ${isFlashing(`s${index}`) ? "pb__col--flash" : ""}`}
                style={
                  { "--c": color, "--step": STAFF_STEP[index % STAFF_STEP.length] } as CSSProperties
                }
                aria-label={`${syllable}, ${STATE_LABEL[state]}`}
                data-testid={`piano-note-${index}`}
              >
                <span className="pb__ball-slot" aria-hidden="true">
                  {(state === "next" || state === "hearing") && <span className="pb__ball" />}
                </span>
                <button
                  type="button"
                  className="pb__syllable"
                  lang="es"
                  onClick={() => s.listenToSyllable(index)}
                  aria-label={`Escuchar ${syllable}`}
                >
                  {syllable}
                </button>
                <span className="pb__note" aria-hidden="true">
                  <span className="pb__note-head">{state === "confirmed" && <Check />}</span>
                  <span className="pb__note-stem" />
                </span>
              </div>
            );
          })}
        </div>

        <div className="pb__progress" aria-label={`Progreso: ${s.confirmed} de ${total}`}>
          {s.keys.map((_, index) => (
            <span
              key={index}
              aria-hidden="true"
              className={index < s.confirmed ? "pb__dot pb__dot--done" : "pb__dot"}
              style={{ "--c": SYLLABLE_COLORS[index % SYLLABLE_COLORS.length] } as CSSProperties}
            />
          ))}
          <span className="pb__progress-text">
            {s.confirmed} de {total}
          </span>
        </div>
      </div>

      {/* BOTTOM — docked piano (sticks to the bottom of the screen on phones). */}
      <div className="pb__dock">
        <div className="pb__message" role="status" aria-live="polite" data-testid="piano-message">
          {s.message}
        </div>
        {s.done && (
          <div className="pb__success" data-testid="piano-success">
            {/* The message bar above is Gretel's words here; a bubble would cover it. */}
            <GretelLiveAvatar ref={s.gretelRef} managed size="sm" showBubble={false} />
            <button
              type="button"
              onClick={s.nextWord}
              className="pb__next"
              data-testid="piano-next"
            >
              {s.isLastItem
                ? s.items.length > 1
                  ? "Empezar de nuevo"
                  : "Otra vez"
                : "Siguiente palabra"}
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        )}
        <div className="pb__controls">
          <button
            type="button"
            className="pb__control"
            onClick={s.listenToWord}
            disabled={s.exampleActive}
            data-testid="piano-escuchar"
          >
            <Volume2 aria-hidden="true" /> <span>Escuchar</span>
          </button>
          <button
            type="button"
            onClick={s.toggleMic}
            disabled={s.micDisabled}
            aria-pressed={s.micOpen}
            aria-label={s.micOpen ? "Detener micrófono" : "Comenzar micrófono"}
            className={`pb__mic ${s.micOpen ? "pb__mic--open" : ""}`}
            data-testid="piano-mic"
          >
            {s.micOpen ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
            <span className="pb__mic-label">
              {s.touchMode
                ? "Tocar"
                : s.status === "hearing"
                  ? "Te oigo"
                  : s.micOpen
                    ? "Escucho"
                    : "Hablar"}
            </span>
          </button>
          <button
            type="button"
            className="pb__control"
            onClick={s.restartWord}
            data-testid="piano-reset"
          >
            <RotateCcw aria-hidden="true" /> <span>Otra vez</span>
          </button>
        </div>

        <div className="pb__piano">
          {s.celebrating && (
            <span
              key={`spark-${s.itemIndex}`}
              className="pb__sparkle"
              aria-hidden="true"
              data-testid="piano-sparkle"
            />
          )}
          <div className="pb__keys piano-hablador__bed" role="group" aria-label="Teclado del piano">
            {FIVE_WHITE.map((key, index) => {
              const carries = index < total;
              const state = carries ? s.keyStateFor(index) : "free";
              const color = carries ? SYLLABLE_COLORS[index % SYLLABLE_COLORS.length] : "#d6d3d1";
              const label = carries
                ? `Tecla ${s.keys[index]}, ${STATE_LABEL[state as keyof typeof STATE_LABEL]}`
                : `Nota ${key.name}`;
              return (
                <button
                  key={key.id}
                  type="button"
                  className={`pb__white pb__white--${state} ${carries ? "piano-hablador__slot" : ""} ${isFlashing(carries ? `s${index}` : key.id) ? "pb__white--flash" : ""}`}
                  style={{ "--c": color } as CSSProperties}
                  aria-label={label}
                  aria-pressed={carries ? state === "confirmed" : undefined}
                  data-key-state={carries ? state : undefined}
                  onClick={() => pressWhite(index)}
                  data-testid={`piano-key-${index}`}
                >
                  <span className="pb__lamp" aria-hidden="true">
                    {carries ? s.keys[index] : ""}
                  </span>
                  {carries && state === "confirmed" && (
                    <Check className="pb__white-check" aria-hidden="true" />
                  )}
                  <span className="pb__hotkey" aria-hidden="true">
                    {key.hotkeys[0].toUpperCase()}
                  </span>
                </button>
              );
            })}
            {FIVE_BLACK.map((key, index) => (
              <button
                key={key.id}
                type="button"
                tabIndex={-1}
                className={`pb__black ${isFlashing(key.id) ? "pb__black--flash" : ""}`}
                style={{ "--pos": key.after + 1 } as CSSProperties}
                aria-label={`Nota ${key.name}`}
                onClick={() => pressBlack(index)}
              >
                <span className="pb__hotkey pb__hotkey--black" aria-hidden="true">
                  {key.hotkeys[0].toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pb__footer">
        {s.supported && (
          <button
            type="button"
            onClick={s.toggleTouchMode}
            aria-pressed={s.touchMode}
            className="pb__touch"
            data-testid="piano-touch-mode"
          >
            <Hand aria-hidden="true" /> {s.touchMode ? "Usar el micrófono" : "Tocar sin micrófono"}
          </button>
        )}
        <p className="pb__privacy" data-testid="piano-privacy">
          {PRIVACY_NOTE[s.processing]}
        </p>
      </div>
    </section>
  );
}
