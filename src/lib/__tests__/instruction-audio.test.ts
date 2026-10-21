import { describe, expect, it, vi, afterEach } from 'vitest';
import manifest from '@/content/instruction-recordings.json';
import { instructionRecordings, playInstruction, stopInstructionAudio } from '../instruction-audio';
vi.mock('../audio-engine', () => ({ audioEngine: { isMuted: () => false, getVolume: () => 1 } }));
vi.mock('../gretel-voice', () => ({ isGretelVoiceMuted: () => false }));
afterEach(() => vi.unstubAllGlobals());
describe('owner instruction recordings', () => {
  it('has 40 numbered phrases and maps all 109 printed instruction regions', () => {
    expect(manifest.recordings).toHaveLength(40);
    expect(manifest.mappings).toHaveLength(109);
    for (const mapping of manifest.mappings) expect(instructionRecordings(mapping.text).length).toBeGreaterThan(0);
  });
  it('does not guess unknown instructions', () => { expect(instructionRecordings('Texto inventado')).toEqual([]); });
  it('sequences 17 and 18 without joining speech fragments', () => {
    expect(instructionRecordings('Escribe oraciones. Usa las sílabas que aprendiste.')).toEqual(['/audio/instrucciones/line-17.mp3', '/audio/instrucciones/line-18.mp3']);
  });
  it('plays real recordings without speech synthesis', async () => {
    const played: string[] = [];
    class FakeAudio {
      volume=1; onended: (() => void) | null=null; onerror: (() => void) | null=null;
      constructor(public src: string) {}
      play() { played.push(this.src); queueMicrotask(() => this.onended?.()); return Promise.resolve(); }
      pause() {} removeAttribute() {}
    }
    vi.stubGlobal('Audio', FakeAudio);
    await playInstruction('Escribe oraciones. Usa las sílabas que aprendiste.');
    expect(played).toHaveLength(2);
  });
  it('cancellation settles playback and prevents the second clip', async () => {
    const played: string[]=[];
    class FakeAudio {
      volume=1; onended: (() => void) | null=null; onerror: (() => void) | null=null;
      constructor(public src:string){}
      play(){played.push(this.src);return Promise.resolve();} pause(){} removeAttribute(){}
    }
    vi.stubGlobal('Audio',FakeAudio);
    const pending=playInstruction('Escribe oraciones. Usa las sílabas que aprendiste.');
    stopInstructionAudio(); await pending;
    expect(played).toHaveLength(1);
  });
});
