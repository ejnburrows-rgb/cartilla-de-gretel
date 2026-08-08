/**
 * Workbook audio policy — student screens are silent by owner direction.
 * The API remains stable so page navigation and exercises never fail because
 * an old component still asks for a sound.
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
