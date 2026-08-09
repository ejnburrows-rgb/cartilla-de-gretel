/** Audio feedback is disabled in the silent student reader. */
export function playNote(_freq: number, _duration = 0.8): void {}
export function playCorrectChord(): void {}
export function playWrongBuzz(): void {}

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

export function playUiTick(): void {}
