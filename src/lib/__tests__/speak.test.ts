/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { getVoice, speak, speakVowel } from "../speak";

describe("silent student workbook speech policy", () => {
  it("never selects a browser voice", () => {
    expect(getVoice()).toBeNull();
  });

  it("cancels any already-running browser speech instead of starting new speech", async () => {
    const cancel = vi.fn();
    Object.defineProperty(window, "speechSynthesis", {
      value: { cancel },
      configurable: true,
    });

    await speak("No debe sonar");
    await speakVowel("a");

    expect(cancel).toHaveBeenCalledTimes(2);
  });
});
