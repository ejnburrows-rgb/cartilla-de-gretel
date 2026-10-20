import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { speak, speakVowel, getVoice } from '../speak';
import { setGretelVoiceMuted } from '../gretel-voice';
import { stopSpeech } from '../speech-playback';
import { audioEngine } from '../audio-engine';

class Recording {
 static instances: Recording[] = [];
 src: string; volume = 1; onplaying: (() => void) | null = null; onended: (() => void) | null = null; onerror: (() => void) | null = null;
 play = vi.fn(() => Promise.resolve()); pause = vi.fn(); removeAttribute = vi.fn();
 constructor(src: string) { this.src = src; Recording.instances.push(this); }
}
beforeEach(() => { localStorage.clear(); setGretelVoiceMuted(false); Recording.instances = []; vi.stubGlobal('Audio', Recording); });
afterEach(() => { stopSpeech(); vi.unstubAllGlobals(); });
it('plays exact approved vocabulary files and settles on end', async () => {
 const pending = speak('oso'); const clip = Recording.instances[0]!;
 expect(clip.src).toBe('/audio/voz/vocabulario/oso.mp3'); expect(clip.play).toHaveBeenCalledOnce();
 clip.onplaying?.(); clip.onended?.(); await pending; expect(clip.pause).toHaveBeenCalled();
});
it('leaves unmapped phrases and vowels silent, never synthesizes or guesses paths', async () => {
 const synth = vi.fn(); vi.stubGlobal('SpeechSynthesisUtterance', synth);
 await speak('No existe esta frase'); await speakVowel('O');
 expect(Recording.instances).toHaveLength(0); expect(synth).not.toHaveBeenCalled(); expect(getVoice()).toBeNull();
});
it('silent missing slots emit pending status, not a speaking animation', async () => {
 const events: string[] = []; const pending = vi.fn();
 window.addEventListener('gretel:speak_start', () => events.push('start'), { once: true });
 window.addEventListener('cartilla:recorded-speech-status', pending, { once: true });
 await speak('Una frase pendiente');
 expect(events).toEqual([]); expect(pending.mock.calls[0]![0].detail.status).toBe('missing-recording');
});
it('mute, zero volume, interruption and failed files never fall back to synthesis', async () => {
 const first = speak('oso'); const clip = Recording.instances[0]!;
 const second = speak('olla'); expect(clip.pause).toHaveBeenCalled(); await first;
 audioEngine.setMuted(true); await second;
 await speak('oso'); expect(Recording.instances).toHaveLength(2);
 audioEngine.setMuted(false); audioEngine.setVolume(0); await speak('oso'); expect(Recording.instances).toHaveLength(2);
 audioEngine.setVolume(.8); const failure = speak('oso'); Recording.instances[2]!.onerror?.(); await failure;
 expect(Recording.instances).toHaveLength(3);
});
it('Gretel mute prevents reading recordings too', async () => {
 setGretelVoiceMuted(true); await speak('oso'); expect(Recording.instances).toHaveLength(0);
});
it('storage-denied browsers settle handlers and release the claimed owner without playback', async () => {
 const { playRecordedSpeech } = await import('../recorded-speech');
 const { claimSpeech, speechIsCurrent } = await import('../speech-playback');
 const prior = claimSpeech('picture'); const onStart = vi.fn(), onEnd = vi.fn();
 const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')!;
 Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new DOMException('Denied', 'SecurityError'); } });
 try {
   await playRecordedSpeech('oso', 'gretel', { onStart, onEnd });
   expect(onStart).not.toHaveBeenCalled(); expect(onEnd).toHaveBeenCalledOnce();
   expect(Recording.instances).toHaveLength(0); expect(speechIsCurrent(prior)).toBe(false);
 } finally { Object.defineProperty(globalThis, 'localStorage', original); }
});
