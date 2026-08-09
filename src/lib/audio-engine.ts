/**
 * Student-reader audio is disabled by owner direction.
 * These stable no-op methods prevent page-turn, ambient, and feedback audio.
 */
export const audioEngine = {
  getVolume(): number {
    return 0;
  },
  setVolume(_value: number): void {},
  isMuted(): boolean {
    return true;
  },
  setMuted(_muted: boolean): void {},
  playPageTurn(_soft = false): void {},
  toggleAmbient(_active: boolean): void {},
  isAmbientPlaying(): boolean {
    return false;
  },
};
export type AudioEngine = typeof audioEngine;
