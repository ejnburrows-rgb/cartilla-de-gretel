import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { speakAsGretel, setGretelVoiceProviderConfig, getGretelVoiceProviderConfig, resetGretelVoiceProviderConfig, getAvailableGretelVoices, pickVoice, scoreVoice, setGretelVoiceMuted, cancelGretelSpeech } from '../gretel-voice';
import { speakGretelPhrase } from '../gretel-tts';
import { claimSpeech, speechIsCurrent, stopSpeech } from '../speech-playback';

describe('recording-only voice boundary', () => {
 beforeEach(() => { localStorage.clear(); setGretelVoiceMuted(false); resetGretelVoiceProviderConfig(); });
 afterEach(() => { stopSpeech(); vi.unstubAllGlobals(); });
 it('defaults to recordings and ignores all injected provider callbacks, including a recorded label', async () => {
   const synth = vi.fn(); const custom = vi.fn();
   vi.stubGlobal('SpeechSynthesisUtterance', synth);
   for (const type of ['browser-tts','cloud-tts','custom','recorded-audio'] as const) {
     setGretelVoiceProviderConfig({ type, name: 'cannot bypass files', speakFn: custom });
     expect(getGretelVoiceProviderConfig().type).toBe('recorded-audio');
     const onStart = vi.fn(), onEnd = vi.fn();
     await speakAsGretel('Una frase sin grabación exacta', { onStart, onEnd });
     expect(onStart).not.toHaveBeenCalled(); expect(onEnd).toHaveBeenCalledOnce();
   }
   speakGretelPhrase('Otra frase sin grabación exacta');
   expect(custom).not.toHaveBeenCalled(); expect(synth).not.toHaveBeenCalled();
   expect(getAvailableGretelVoices()).toEqual([]); expect(pickVoice()).toBeNull();
   expect(scoreVoice({ name:'any', lang:'es-MX' } as SpeechSynthesisVoice)).toBe(-1);
 });
 it('one shared owner invalidates earlier tokens and explicit stop releases ownership', () => {
   const first = claimSpeech('gretel'), second = claimSpeech('reading');
   expect(speechIsCurrent(first)).toBe(false); expect(speechIsCurrent(second)).toBe(true);
   cancelGretelSpeech(); expect(speechIsCurrent(second)).toBe(false);
 });
});
