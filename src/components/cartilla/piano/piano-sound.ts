/**
 * Piano Hablador — real grand piano sound with room reverb.
 *
 * Only the Piano Hablador uses this (both designs). Every other activity keeps
 * the shared synthesized `@/lib/piano-audio` sounds unchanged.
 *
 * Sound: recorded notes of a real Steinway grand (University of Iowa Musical
 * Instrument Samples — free for any use, no credit required; see
 * piano-samples.ts), one sample every three
 * semitones; a note in between re-pitches the nearest sample by at most
 * ±1.5 semitones. Each note goes through a warm tone filter, a soft damper
 * release, a generated small-hall reverb (no extra file) and a gentle limiter.
 * Respects the app's mute and volume. Until the samples have loaded (or if
 * they cannot load), the original synthesized note plays instead, so a
 * recognized syllable is never silent.
 */
import { audioEngine } from "@/lib/audio-engine";
import { playNote as playSynthNote } from "@/lib/piano-audio";

/** Embedded samples (piano-samples.ts) and the MIDI note each one holds. */
export const PIANO_SAMPLES: Readonly<Record<string, number>> = {
  C4: 60,
  Ds4: 63,
  Fs4: 66,
  A4: 69,
  C5: 72,
  Ds5: 75,
};

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/** Reverb: length of the generated hall tail and how much of it is heard. */
export const REVERB_SECONDS = 2.4;
export const REVERB_WET = 0.28;

interface Chain {
  ctx: AudioContext;
  input: GainNode;
}

let chain: Chain | null = null;
const buffers = new Map<number, AudioBuffer>();
let loading: Promise<void> | null = null;

function makeContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

/** Stereo impulse response of a small warm hall: decaying, darkening noise. */
function makeImpulse(ctx: AudioContext): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * REVERB_SECONDS);
  const impulse = ctx.createBuffer(2, length, rate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // Early reflections arrive after ~12 ms; the tail decays smoothly.
      const pre = i < rate * 0.012 ? 0 : 1;
      const white = Math.random() * 2 - 1;
      // One-pole low-pass that closes over time: the tail gets darker.
      const k = 0.55 - 0.4 * t;
      last = last + k * (white - last);
      data[i] = pre * last * Math.pow(1 - t, 3.2);
    }
  }
  return impulse;
}

function getChain(): Chain | null {
  if (chain) {
    if (chain.ctx.state === "suspended") void chain.ctx.resume().catch(() => {});
    return chain;
  }
  const ctx = makeContext();
  if (!ctx) return null;
  const input = ctx.createGain();
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 7200;
  tone.Q.value = 0.4;
  const dry = ctx.createGain();
  dry.gain.value = 1 - REVERB_WET * 0.5;
  const wet = ctx.createGain();
  wet.gain.value = REVERB_WET;
  const reverb = ctx.createConvolver();
  reverb.buffer = makeImpulse(ctx);
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -10;
  limiter.knee.value = 8;
  limiter.ratio.value = 4;
  limiter.attack.value = 0.004;
  limiter.release.value = 0.25;
  input.connect(tone);
  tone.connect(dry);
  tone.connect(reverb);
  reverb.connect(wet);
  dry.connect(limiter);
  wet.connect(limiter);
  limiter.connect(ctx.destination);
  chain = { ctx, input };
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return chain;
}

/** Start loading the grand piano samples (safe to call many times). */
export function preloadPianoSound(): Promise<void> {
  if (loading) return loading;
  const current = getChain();
  if (!current) return Promise.resolve();
  // Separate chunk: the ~300 KB of notes load only when a piano is on screen.
  loading = import("./piano-samples")
    .then(({ PIANO_SAMPLE_DATA }) =>
      Promise.all(
        Object.entries(PIANO_SAMPLES).map(async ([name, midi]) => {
          const data = PIANO_SAMPLE_DATA[name];
          if (!data) return;
          try {
            const buffer = await current.ctx.decodeAudioData(base64ToArrayBuffer(data));
            buffers.set(midi, buffer);
          } catch {
            /* this sample stays missing; the nearest other one or the synth is used */
          }
        }),
      ),
    )
    .then(
      () => undefined,
      () => undefined,
    );
  return loading;
}

export function midiFromFrequency(freq: number): number {
  return 69 + 12 * Math.log2(freq / 440);
}

/** Nearest loaded sample for a note, with the playback rate that re-pitches it. */
export function nearestSample(
  midi: number,
  available: Iterable<number>,
): { midi: number; rate: number } | null {
  let best: number | null = null;
  for (const candidate of available) {
    if (best === null || Math.abs(candidate - midi) < Math.abs(best - midi)) best = candidate;
  }
  if (best === null) return null;
  return { midi: best, rate: Math.pow(2, (midi - best) / 12) };
}

/**
 * Play one piano note. `duration` is how long the key is held before the
 * damper falls (the reverb rings a little after); `velocity` 0..1 is how hard.
 */
export function playNote(freq: number, duration = 0.8, velocity = 0.75): void {
  if (audioEngine.isMuted()) return;
  const current = getChain();
  if (!current) return;
  void preloadPianoSound();
  const midi = midiFromFrequency(freq);
  const pick = nearestSample(midi, buffers.keys());
  const buffer = pick ? buffers.get(pick.midi) : undefined;
  if (!pick || !buffer) {
    playSynthNote(freq, duration);
    return;
  }
  const { ctx, input } = current;
  const now = ctx.currentTime + 0.005;
  const volume = Math.max(0, Math.min(1, audioEngine.getVolume()));
  const level = volume * (0.35 + 0.65 * velocity) * 0.9;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = pick.rate;
  const gain = ctx.createGain();
  const held = Math.max(0.25, duration);
  const release = 0.45;
  gain.gain.setValueAtTime(level, now);
  gain.gain.setValueAtTime(level, now + held);
  gain.gain.setTargetAtTime(0.0001, now + held, release / 4);
  source.connect(gain);
  gain.connect(input);
  source.start(now);
  source.stop(now + held + release + 0.1);
  source.onended = () => {
    try {
      source.disconnect();
      gain.disconnect();
    } catch {
      /* already disconnected */
    }
  };
}

/** The «¡Muy bien!» chord: a rolled C major (do–mi–sol–do), like a pianist. */
export function playCorrectChord(): void {
  if (audioEngine.isMuted()) return;
  const notes = [261.63, 329.63, 392.0, 523.25];
  notes.forEach((freq, index) => {
    const play = () => playNote(freq, 1.6, index === notes.length - 1 ? 0.8 : 0.65);
    if (index === 0) play();
    else setTimeout(play, index * 70);
  });
}
