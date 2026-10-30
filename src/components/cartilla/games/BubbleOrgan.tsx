// BubbleOrgan — self-contained, touch-friendly version of the existing Lovable
// prototype. Original artwork stays archived until its exact binary files
// can be recovered. No browser speech synthesis or invented recordings.
import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { recordEvent } from "@/lib/student-session";
import type { GameContent } from "@/lib/games/gameContent";
import "./bubble-organ.css";

const SYLLABLES = ["ma", "me", "mi", "mo", "mu"] as const;
type Syllable = (typeof SYLLABLES)[number];
type Bubble = { id: number; label: string; pipe: number; };

interface BubbleOrganProps {
  content: GameContent;
}

export function BubbleOrgan({ content }: BubbleOrganProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [wordFormed, setWordFormed] = useState(false);
  const [successes, setSuccesses] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [merging, setMerging] = useState(false);
  const nextId = useRef(0);
  const active = useRef(new Set<number>());
  const pendingMa = useRef<number | null>(null);
  const timers = useRef(new Set<number>());
  const soundContext = useRef<AudioContext | null>(null);

  const schedule = useCallback((callback: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      callback();
    }, ms);
    timers.current.add(id);
  }, []);

  const tone = useCallback((kind: "tap" | "pop" | "merge") => {
    if (!soundOn || typeof window.AudioContext === "undefined") return;
    try {
      const ctx = soundContext.current ?? new window.AudioContext();
      soundContext.current = ctx;
      if (ctx.state === "suspended") void ctx.resume();
      const now = ctx.currentTime;
      const notes = kind === "merge" ? [392, 494, 587] : [kind === "pop" ? 410 : 680];
      notes.forEach((frequency, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + index * 0.11;
        osc.type = kind === "tap" ? "triangle" : "sine";
        osc.frequency.setValueAtTime(frequency, start);
        if (kind === "pop") {
          osc.frequency.exponentialRampToValueAtTime(180, start + 0.12);
        }
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.12, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.26);
      });
    } catch {
      // Audio is optional; touch and reading stay usable offline and silently.
    }
  }, [soundOn]);

  const removeBubble = useCallback((id: number) => {
    if (!active.current.delete(id)) return;
    if (pendingMa.current === id) pendingMa.current = null;
    setBubbles((current) => current.filter((bubble) => bubble.id !== id));
  }, []);

  const spawn = useCallback((label: string, pipe: number) => {
    const id = ++nextId.current;
    active.current.add(id);
    setBubbles((current) => [...current, { id, label, pipe }]);
    return id;
  }, []);

  const reset = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current.clear();
    active.current.clear();
    pendingMa.current = null;
    setBubbles([]);
    setWordFormed(false);
    setMerging(false);
  }, []);

  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout);
    timers.current.clear();
    active.current.clear();
    void soundContext.current?.close();
  }, []);

  const tapPipe = (syllable: Syllable, pipe: number) => {
    if (merging || wordFormed) return;
    tone("tap");

    if (syllable === "ma" && pendingMa.current !== null) {
      const first = pendingMa.current;
      pendingMa.current = null;
      const second = spawn("má", pipe);
      setMerging(true);
      schedule(() => {
        if (!active.current.has(first) || !active.current.has(second)) {
          setMerging(false);
          return;
        }
        removeBubble(first);
        removeBubble(second);
        setMerging(false);
        setWordFormed(true);
        setSuccesses((n) => n + 1);
        tone("merge");
        recordEvent({
          lessonId: "leccion-7",
          kind: "exercise",
          score: 1,
          total: 1,
          meta: { exercise: content.id, word: "mamá", completed: true },
        });
      }, 950);
      return;
    }

    const id = spawn(syllable, pipe);
    if (syllable === "ma") pendingMa.current = id;
    schedule(() => removeBubble(id), syllable === "ma" ? 9000 : 4200);
  };

  const pop = (id: number) => {
    if (merging) return;
    if (!active.current.has(id)) return;
    tone("pop");
    removeBubble(id);
  };

  return (
    <section className="bo-game" aria-label="Órgano de burbujas">
      <header className="bo-heading">
        <div>
          <p className="bo-eyebrow">Lección 7 · Mm</p>
          <h2>Órgano de burbujas</h2>
          <p>Escucha las sílabas con tus propios ojos: toca, une y lee.</p>
        </div>
        <div className="bo-controls">
          <button type="button" className="bo-control" onClick={() => setSoundOn((on) => !on)}
            aria-label={soundOn ? "Silenciar efectos" : "Activar efectos"}
            aria-pressed={!soundOn}>
            {soundOn ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
            <span>{soundOn ? "Sonido" : "Silencio"}</span>
          </button>
          <button type="button" className="bo-control" onClick={reset}>
            <RotateCcw aria-hidden="true" /> <span>Otra vez</span>
          </button>
        </div>
      </header>

      <div className="bo-progress" aria-live="polite">
        <span>Palabra: <strong>mamá</strong></span>
        <span>Formadas: <strong>{successes}</strong></span>
      </div>

      <div className="bo-stage">
        <div className="bo-feedback" aria-live="polite" role="status">
          {wordFormed ? <strong>¡Formaste mamá!</strong> : merging
            ? <span>Las sílabas se unen…</span>
            : <span>Toca <strong>ma</strong> dos veces para formar <strong>mamá</strong>.</span>}
        </div>
        <div className="bo-air" aria-label="Burbujas de sílabas">
          {bubbles.map(({ id, label, pipe }) => (
            <button key={id} type="button" className="bo-bubble"
              style={{ left: `${10 + pipe * 20}%`, bottom: `${12 + (id % 3) * 20}%` }}
              aria-label={`Explotar burbuja ${label}`} disabled={merging} onClick={() => pop(id)}>
              {label}
            </button>
          ))}
          {wordFormed && <div className="bo-complete" aria-label="Palabra formada">mamá</div>}
        </div>
        <div className="bo-organ" role="group" aria-label="Tubos de sílabas">
          {SYLLABLES.map((syllable, index) => (
            <button key={syllable} type="button" className="bo-pipe"
              aria-label={`Tubo ${syllable}`}
              disabled={merging || wordFormed}
              onClick={() => tapPipe(syllable, index)}>
              <span className="bo-pipe-cap" aria-hidden="true" />
              <span className="bo-pipe-label">{syllable}</span>
            </button>
          ))}
        </div>
      </div>

      {wordFormed && (
        <button type="button" className="bo-play-again" onClick={reset}>
          <RotateCcw aria-hidden="true" /> Formar otra palabra
        </button>
      )}
      <p className="bo-audio-note">Las voces grabadas de Gretel se incorporarán cuando estén aprobadas. No se usa voz del dispositivo.</p>
    </section>
  );
}
