/** Gretel stays expressive on screen, but never speaks aloud in the student book. */
export function speakGretelPhrase(_phrase: string): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
