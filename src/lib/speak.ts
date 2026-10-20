import { playRecordedSpeech } from "./recorded-speech";
import { isGretelVoiceMuted } from "./gretel-voice";
/** Compatibility selector: synthesized voices are never offered or used. */
export function getVoice(): SpeechSynthesisVoice | null { return null; }
/** Exact recorded vocabulary, otherwise silence with a pending state. */
export async function speak(text: string): Promise<void> {
  if (isGretelVoiceMuted()) return;
  return playRecordedSpeech(text, "reading");
}
export async function speakVowel(v: string): Promise<void> {
  return speak(v.toLocaleLowerCase("es"));
}
