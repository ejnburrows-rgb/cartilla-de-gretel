/** One owner for recorded picture audio, browser speech and Gretel speech. */
export type SpeechOwner = 'picture' | 'gretel' | 'reading';
let generation = 0;
let owner: SpeechOwner | undefined;
let cleanup: (() => void) | undefined;
export function stopSpeech(requestedOwner?: SpeechOwner): void {
  if (requestedOwner && owner !== requestedOwner) return;
  generation += 1;
  const finish = cleanup; cleanup = undefined; owner = undefined;
  finish?.();
  try { if (typeof window !== 'undefined') window.speechSynthesis?.cancel(); } catch { /* unsupported device */ }
}
export function claimSpeech(nextOwner: SpeechOwner): number { stopSpeech(); owner = nextOwner; return generation; }
export function speechIsCurrent(token: number): boolean { return token === generation && owner !== undefined; }
export function registerSpeechCleanup(token: number, finish: () => void): void {
  if (!speechIsCurrent(token)) { finish(); return; }
  cleanup = finish;
}
export function releaseSpeech(token: number): void { if (speechIsCurrent(token)) { cleanup = undefined; owner = undefined; } }
