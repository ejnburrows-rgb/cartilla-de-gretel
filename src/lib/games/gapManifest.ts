import {
  AUTHOR_REFERENCES,
  authorContentGaps,
  authorGameContents,
} from "@/content/games/author-games";
import { STICKERS, BADGES } from "@/lib/rewards";
import { recordedWordUrl, GAME_INSTRUCTION_RECORDINGS, GAME_REWARD_RECORDINGS } from "./wordAudio";

export function gameGapManifest() {
  const recording: { kind: "recording"; surface: string; slot: string; text: string }[] = [];
  for (const game of [...AUTHOR_REFERENCES, ...authorGameContents()]) {
    game.words.forEach((word, index) => {
      if (!word.audioUrl && !recordedWordUrl(word.word))
        recording.push({
          kind: "recording",
          surface: game.id,
          slot: `words[${index}].audioUrl`,
          text: word.word,
        });
    });
    game.instructions.forEach((text, index) => {
      if (!game.instructionAudioUrls?.[index] && !GAME_INSTRUCTION_RECORDINGS[text])
        recording.push({
          kind: "recording",
          surface: game.id,
          slot: `instructionAudioUrls[${index}]`,
          text,
        });
    });
  }
  for (const [surface, items, prefix] of [
    ["StickerReel", STICKERS, "Pegatina"],
    ["BadgeGrid", BADGES, "Insignia"],
  ] as const) {
    for (const item of items) {
      const text = `¡${prefix} ${item.name}! ${item.description}`;
      if (!GAME_REWARD_RECORDINGS[text])
        recording.push({ kind: "recording", surface, slot: item.id, text });
    }
  }
  return {
    baseCommit: "85ba2863fe2d7d8711ff42e4468f8f1c45b1b55c",
    snapshotDate: "2026-10-19",
    content: authorContentGaps(),
    recording,
  };
}
