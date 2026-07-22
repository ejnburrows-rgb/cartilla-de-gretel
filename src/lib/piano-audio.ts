let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!
    )();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

import { audioEngine } from "./audio-engine";

export function playNote(freq: number, duration = 0.8) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Master Gain to prevent clipping
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  // Quick attack strike (10ms)
  masterGain.gain.linearRampToValueAtTime(0.25, now + 0.01);
  // Exponential decay
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  masterGain.connect(ctx.destination);

  const activeNodes: AudioNode[] = [masterGain];

  // Rich harmonic setup to synthesize a pleasant piano timbre:
  // - 1st: Fundamental (sine) -> strong
  // - 2nd: Octave (triangle) -> medium-low
  // - 3rd: Octave + Fifth (sine) -> subtle
  // - 4th: Double Octave (sine) -> very subtle
  const harmonics = [
    { freqMult: 1, type: "sine" as OscillatorType, gainVal: 0.5, decayMult: 1.0 },
    { freqMult: 2, type: "triangle" as OscillatorType, gainVal: 0.15, decayMult: 0.7 },
    { freqMult: 3, type: "sine" as OscillatorType, gainVal: 0.08, decayMult: 0.5 },
    { freqMult: 4, type: "sine" as OscillatorType, gainVal: 0.04, decayMult: 0.3 },
  ];

  harmonics.forEach(({ freqMult, type, gainVal, decayMult }) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq * freqMult, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gainVal, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration * decayMult);

    osc.connect(gainNode);
    gainNode.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration);

    activeNodes.push(osc, gainNode);
  });

  // Explicitly disconnect all nodes after playback finishes to prevent memory/audio leaks
  setTimeout(
    () => {
      activeNodes.forEach((node) => {
        try {
          node.disconnect();
        } catch (e) {
          // Ignore if already disconnected
        }
      });
    },
    duration * 1000 + 100,
  );
}

export function playCorrectChord() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Play C Major arpeggio/chord
  const frequencies = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
  frequencies.forEach((freq, index) => {
    setTimeout(() => {
      playNote(freq, 1.2);
    }, index * 80);
  });
}

export function playWrongBuzz() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(120, now); // Low buzz freq
  osc.frequency.linearRampToValueAtTime(80, now + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  // Lowpass filter to make it sound warm/soft rather than harsh
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(300, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);

  setTimeout(() => {
    try {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    } catch {
      /* node already stopped/disconnected - safe to ignore */
    }
  }, 400);
}

// Frequency helpers for piano notes (ma, me, mi, mo, mu mapped notes)
export const NOTE_FREQS = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88,
  C5: 523.25,
};

export function playUiTick() {
  if (typeof window === "undefined" || audioEngine.isMuted()) return;
  // A soft, short tick using a high note (e.g., C6)
  playNote(1046.5, 0.15);
}
