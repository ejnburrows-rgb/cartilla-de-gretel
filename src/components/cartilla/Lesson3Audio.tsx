import vocabulary from "@/content/picture-vocabulary.json";

/**
 * Lesson 3 (Vocal A) audio — SILENT by owner decision.
 *
 * Forensics (2026-10-16) proved ZERO usable owner recordings exist for any of the
 * five Lesson 3 lines (p7-instr, p8-instr, p9-instr1, p9-instr2, muy-bien): the only
 * upload on the VM is a voice-model demo, not the owner's voice. Per the owner's
 * Step 5 voice-authenticity rule, all five lines stay SILENT until the owner supplies
 * real recordings. Generated/synthesized voice is forbidden here.
 */
export function playLesson3Audio(_key: string): void {
  // SILENT no-op: owner recordings pending; generated voice forbidden.
  // Intentionally constructs no Audio and references no /audio/ path.
}

/** While Lesson 3 is silent there is no listen button. Signature kept for importers. */
export function Lesson3InstructionAudio(_props: { instructionKey: string; text: string }) {
  return null;
}

/** Keep approved recorded word playback when Lesson 3 art is missing or replaced. */
export function lesson3PictureAudioProps(label?: string) {
  const entry = vocabulary.find((item) => item.name === label);
  return entry ? { "data-picture-name": entry.name, "data-picture-src": entry.images[0] } : {};
}
