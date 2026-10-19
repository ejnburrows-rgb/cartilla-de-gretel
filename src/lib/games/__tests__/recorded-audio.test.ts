import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { playInstruction, playWord, playReward, recordedWordUrl, stopGameAudio, GAME_INSTRUCTION_RECORDINGS, GAME_REWARD_RECORDINGS } from "../wordAudio";
import { render, fireEvent, screen } from "@testing-library/react";
import { createElement } from "react";
import { StickerReel } from "@/components/rewards/StickerReel";
import { BadgeGrid } from "@/components/rewards/BadgeGrid";
import { STICKERS, BADGES } from "@/lib/rewards";
const instances: { src: string; pause: ReturnType<typeof vi.fn> }[] = [];
const speak = vi.fn();
beforeEach(() => {
  instances.length = 0; localStorage.clear(); speak.mockClear();
  vi.stubGlobal("speechSynthesis", { speak, cancel: vi.fn() });
  vi.stubGlobal("Audio", class {
    src: string; pause = vi.fn(); play = vi.fn().mockResolvedValue(undefined);
    constructor(src: string) { this.src = src; instances.push(this); }
  });
});
afterEach(() => { stopGameAudio(); vi.unstubAllGlobals(); delete GAME_INSTRUCTION_RECORDINGS.test; delete GAME_REWARD_RECORDINGS.test; });
describe("recordings only", () => {
  it("stays silent for empty slots and never invokes synthesis", () => {
    playWord(); playInstruction(); playReward("test"); playWord(undefined, "missing-word-not-in-content");
    expect(instances).toHaveLength(0); expect(speak).not.toHaveBeenCalled();
  });
  it("plays exact URLs and stops the previous recording", () => {
    playWord("/word.mp3"); playInstruction("/instruction.mp3");
    expect(instances.map(item => item.src)).toEqual(["/word.mp3", "/instruction.mp3"]);
    expect(instances[0].pause).toHaveBeenCalledOnce();
    stopGameAudio(); expect(instances[1].pause).toHaveBeenCalledOnce();
  });
  it("resolves approved whole-word recordings and obeys mute", () => {
    const url = recordedWordUrl("oso"); expect(url).toBeTruthy();
    playWord(undefined, "oso"); expect(instances[0].src).toBe(url);
    localStorage.setItem("cartilla:audio:muted", "true"); playWord("/muted.mp3"); expect(instances).toHaveLength(1);
  });
  it("earned rewards stay silent without their own exact recording", () => {
    render(createElement(StickerReel, { earnedIds: STICKERS.map(item => item.lessonId) }));
    render(createElement(BadgeGrid, { earnedIds: BADGES.map(item => item.id) }));
    for (const button of screen.getAllByRole("button")) fireEvent.click(button);
    expect(speak).not.toHaveBeenCalled();
    expect(instances.filter(item => !item.src.startsWith("/audio/feel/"))).toHaveLength(0);
  });
});
