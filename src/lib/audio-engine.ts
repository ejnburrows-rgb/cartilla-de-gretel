import { stopSpeech } from "./speech-playback";
/**
 * audio-engine.ts
 *
 * Lightweight browser Audio helper to play page-turns and looping ambient tracks.
 * Mutability and volume variables are persisted inside localStorage.
 */

const VOL_KEY = "cartilla:audio:volume";
const MUTE_KEY = "cartilla:audio:muted";
const AMBIENT_ACTIVE_KEY = "cartilla:audio:ambient-active";

let ambientAudio: HTMLAudioElement | null = null;
let pageTurnAudio: HTMLAudioElement | null = null;

export const audioEngine = {
  getVolume(): number {
    if (typeof window === "undefined") return 0.8;
    return Number(localStorage.getItem(VOL_KEY) ?? "0.8");
  },

  setVolume(val: number) {
    if (typeof window === "undefined") return;
    localStorage.setItem(VOL_KEY, String(val));
    if (val <= 0) stopSpeech("picture");
    window.dispatchEvent(new Event("cartilla:audio-settings"));
    if (ambientAudio) {
      ambientAudio.volume = val * 0.4; // Keep ambient background soft
    }
  },

  isMuted(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(MUTE_KEY) === "true";
  },

  setMuted(muted: boolean) {
    if (typeof window === "undefined") return;
    localStorage.setItem(MUTE_KEY, String(muted));
    if (muted) stopSpeech("picture");
    window.dispatchEvent(new Event("cartilla:audio-settings"));
    if (ambientAudio) {
      if (muted) {
        ambientAudio.pause();
      } else if (localStorage.getItem(AMBIENT_ACTIVE_KEY) === "true") {
        ambientAudio.play().catch(() => {});
      }
    }
  },

  playPageTurn(_soft = false) {
    if (typeof window === "undefined" || this.isMuted()) return;
    try {
      // Pause ambient audio briefly during flip
      const ambientWasPlaying = ambientAudio && !ambientAudio.paused;
      if (ambientWasPlaying && ambientAudio) {
        ambientAudio.pause();
      }

      // Always route to /audio/page-turn-soft.mp3 (43.5 KB; /audio/page-turn.mp3 is an 84-byte stub)
      // and stop any in-flight page-turn clip so rapid turns never overlap.
      if (pageTurnAudio) {
        pageTurnAudio.pause();
        pageTurnAudio.currentTime = 0;
      }
      const audio = new Audio("/audio/page-turn-soft.mp3");
      pageTurnAudio = audio;
      audio.volume = this.getVolume();
      audio.play().catch(() => {
        /* ignore */
      });

      // Resume ambient after short flip timeout
      if (ambientWasPlaying && ambientAudio) {
        setTimeout(() => {
          if (!this.isMuted()) {
            ambientAudio?.play().catch(() => {
              /* ignore */
            });
          }
        }, 600);
      }
    } catch {
      // ignore
    }
  },

  toggleAmbient(active: boolean) {
    if (typeof window === "undefined") return;
    try {
      if (!ambientAudio) {
        ambientAudio = new Audio("/audio/ambient-classroom.mp3");
        ambientAudio.loop = true;
      }

      ambientAudio.volume = this.getVolume() * 0.4;
      localStorage.setItem(AMBIENT_ACTIVE_KEY, String(active));

      if (active && !this.isMuted()) {
        ambientAudio.play().catch(() => {
          /* ignore */
        });
      } else {
        ambientAudio.pause();
      }
    } catch {
      // ignore
    }
  },

  isAmbientPlaying(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(AMBIENT_ACTIVE_KEY) === "true" && !this.isMuted();
  },
};
export type AudioEngine = typeof audioEngine;
