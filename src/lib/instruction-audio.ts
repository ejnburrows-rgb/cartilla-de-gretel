import manifest from '@/content/instruction-recordings.json';
import { audioEngine } from './audio-engine';
import { isGretelVoiceMuted } from './gretel-voice';
import { claimSpeech, registerSpeechCleanup, releaseSpeech, speechIsCurrent, stopSpeech } from './speech-playback';

export function normalizeInstruction(text: string): string {
  return text.toLocaleLowerCase('es').replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
}
/** Only explicit printed-text mappings. No fuzzy text or filename inference. */
export function instructionRecordings(text: string): string[] {
  const entry = manifest.mappings.find(m => normalizeInstruction(m.text) === normalizeInstruction(text));
  if (entry?.overrideSrc) return [entry.overrideSrc];
  return entry?.lines.map(line => manifest.recordings.find(r => r.line === line)!.src) ?? [];
}
export function instructionAudioMuted(): boolean {
  return isGretelVoiceMuted() || audioEngine.isMuted() || audioEngine.getVolume() <= 0;
}
export function stopInstructionAudio(): void { stopSpeech('reading'); }
export async function playInstruction(text: string): Promise<void> {
  const sources = instructionRecordings(text);
  if (!sources.length || typeof Audio === 'undefined' || instructionAudioMuted()) return;
  const token = claimSpeech('reading');
  try {
    for (const src of sources) {
      if (!speechIsCurrent(token) || instructionAudioMuted()) break;
      await new Promise<void>(resolve => {
        const audio = new Audio(src);
        audio.volume = audioEngine.getVolume();
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          audio.onended = null; audio.onerror = null;
          audio.pause(); audio.removeAttribute('src'); resolve();
        };
        registerSpeechCleanup(token, finish);
        audio.onended = audio.onerror = finish;
        void audio.play().catch(finish);
      });
    }
  } finally { releaseSpeech(token); }
}
