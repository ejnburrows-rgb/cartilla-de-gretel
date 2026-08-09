/**
 * Student-reader audio is intentionally disabled.
 *
 * Workbook reading, grading, and progress remain active; no browser speech is
 * started from these compatibility functions.
 */
export function getVoice(): SpeechSynthesisVoice | null {
  return null;
}

export async function speak(_text: string): Promise<void> {}

export async function speakVowel(_vowel: string): Promise<void> {}
