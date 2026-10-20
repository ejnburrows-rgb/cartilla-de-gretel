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
let memoryVolume = 0.8;
let memoryMuted: boolean | undefined;
let volumeWriteFailed = false;
let muteWriteFailed = false;

export const audioEngine = {
  getVolume(): number {
    if (typeof window === "undefined") return 0.8;
    try {
      if (volumeWriteFailed) return memoryVolume;
      const value = Number(localStorage.getItem(VOL_KEY) ?? "0.8");
      return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
    } catch { return 0; }
  },

  setVolume(val: number) {
    if (typeof window === "undefined") return;
    val = Number.isFinite(val) ? Math.max(0, Math.min(1, val)) : 0;
    memoryVolume = val;
    if (val <= 0) stopSpeech();
    try { localStorage.setItem(VOL_KEY, String(val)); volumeWriteFailed = false; }
    catch { volumeWriteFailed = true; }
    window.dispatchEvent(new Event("cartilla:audio-settings"));
    if (ambientAudio) {
      ambientAudio.volume = val * 0.4; // Keep ambient background soft
    }
  },

  isMuted(): boolean {
    if (typeof window === "undefined") return false;
    try { return muteWriteFailed ? memoryMuted ?? true : localStorage.getItem(MUTE_KEY) === "true"; }
    catch { return memoryMuted ?? true; }
  },

  setMuted(muted: boolean) {
    if (typeof window === "undefined") return;
    memoryMuted = muted;
    if (muted) stopSpeech();
    try { localStorage.setItem(MUTE_KEY, String(muted)); muteWriteFailed = false; }
    catch { muteWriteFailed = true; }
    window.dispatchEvent(new Event("cartilla:audio-settings"));
    if (ambientAudio) {
      if (muted) {
        ambientAudio.pause();
      } else {
        try { if (localStorage.getItem(AMBIENT_ACTIVE_KEY) === "true") ambientAudio.play().catch(() => {}); }
        catch { /* no ambient playback when persisted settings are unavailable */ }
      }
    }
  },

  playPageTurn(soft = false) {
    if (typeof window === "undefined" || this.isMuted()) return;
    try {
      // Pause ambient audio briefly during flip
      const ambientWasPlaying = ambientAudio && !ambientAudio.paused;
      if (ambientWasPlaying && ambientAudio) {
        ambientAudio.pause();
      }

      const src = soft ? "/audio/page-turn-soft.mp3" : "/audio/page-turn.mp3";
      const audio = new Audio(src);
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
