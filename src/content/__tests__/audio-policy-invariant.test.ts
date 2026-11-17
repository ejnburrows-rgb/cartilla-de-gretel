import { describe, expect, it } from "vitest";
import { AUDIO_POLICY } from "@/content/audio-manifest";
import { SOURCE_BLOCKED_WORKBOOK_PAGES, isWorkbookPageSourceBlocked } from "@/lib/workbook-pages";

describe("project invariants (unmocked)", () => {
  it("keeps AUDIO_POLICY.allowTts strictly false with no synthesized or cloned voice", () => {
    expect(AUDIO_POLICY.allowTts).toBe(false);
    expect(AUDIO_POLICY.allowSynthesizedVoice).toBe(false);
    expect(AUDIO_POLICY.allowAiVoiceClone).toBe(false);
  });

  it("keeps workbook pages 86 and 87 source-blocked", () => {
    expect(SOURCE_BLOCKED_WORKBOOK_PAGES).toEqual([86, 87]);
    expect(isWorkbookPageSourceBlocked(86)).toBe(true);
    expect(isWorkbookPageSourceBlocked(87)).toBe(true);
    expect(isWorkbookPageSourceBlocked(7)).toBe(false);
  });
});
