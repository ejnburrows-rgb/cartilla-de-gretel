/**
 * Student workbook audio is intentionally disabled.
 *
 * The reading, answer, and progress logic remains intact, but the product no
 * longer speaks through the browser or triggers hidden audio fallbacks.
 */
export function getVoice(): SpeechSynthesisVoice | null {
  return null;
}

export async function speak(_text: string): Promise<void> {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export async function speakVowel(_vowel: string): Promise<void> {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
