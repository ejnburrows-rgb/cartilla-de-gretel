import { expect, it, vi, beforeEach, afterEach } from "vitest";
import { Lesson3InstructionAudio, lesson3PictureAudioProps, playLesson3Audio } from "../Lesson3Audio";

// Lesson 3 is SILENT by owner decision: no usable owner recordings exist for any
// Lesson 3 line, and generated/synthesized voice is forbidden.
class RecordingAudio {
  static instances: RecordingAudio[] = [];
  play = vi.fn();
  constructor(public src: string) {
    RecordingAudio.instances.push(this);
  }
}
beforeEach(() => {
  RecordingAudio.instances = [];
  vi.stubGlobal("Audio", RecordingAudio);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

it("playLesson3Audio constructs no Audio and plays nothing for all five keys", () => {
  for (const key of ["p7-instr", "p8-instr", "p9-instr1", "p9-instr2", "muy-bien"]) {
    playLesson3Audio(key);
  }
  expect(RecordingAudio.instances).toHaveLength(0);
});

it("Lesson3InstructionAudio renders null (no listen button while silent)", () => {
  expect(Lesson3InstructionAudio({ instructionKey: "p7-instr", text: "Traza la a." })).toBeNull();
});

it("lesson3PictureAudioProps still resolves a known vocabulary entry", () => {
  expect(lesson3PictureAudioProps("abeja")).toEqual({
    "data-picture-name": "abeja",
    "data-picture-src": "/cartilla/art/optimized/workbook/leccion-1/abeja.png",
  });
  expect(lesson3PictureAudioProps("not-a-word")).toEqual({});
  expect(lesson3PictureAudioProps()).toEqual({});
});
