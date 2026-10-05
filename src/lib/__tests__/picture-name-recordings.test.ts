import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import recordings from "@/content/picture-name-recordings.json";
import vocabulary from "@/content/picture-vocabulary.json";
import { approvedPictureRecording } from "@/lib/picture-vocabulary";

const approved = recordings.approved as Array<{ key: string; src: string; approval: string }>;
const keys = new Set(vocabulary.map(entry => entry.key));

describe("owner-approved picture-name recordings", () => {
  it("registers the 154 approved recordings once each, with provenance and a real file", () => {
    expect(approved).toHaveLength(154);
    expect(new Set(approved.map(entry => entry.key)).size).toBe(approved.length);
    for (const entry of approved) {
      expect(keys.has(entry.key), entry.key).toBe(true);
      expect(entry.approval.length).toBeGreaterThan(0);
      expect(entry.src.startsWith("/audio/voz/vocabulario/")).toBe(true);
      expect(existsSync(join(process.cwd(), "public", entry.src)), entry.src).toBe(true);
    }
  });

  it("keeps accented and ñ names distinct and resolvable", () => {
    expect(approvedPictureRecording("ñuno")).toBe("/audio/voz/vocabulario/ñuno.mp3");
    expect(approvedPictureRecording("árbol")).toBe("/audio/voz/vocabulario/árbol.mp3");
    expect(approvedPictureRecording("mamá")).toBe("/audio/voz/vocabulario/mamá.mp3");
  });

  it("does not invent recordings for unrecorded names", () => {
    expect(approvedPictureRecording("gato")).toBeUndefined();
    expect(approvedPictureRecording("a la fiesta scene")).toBeUndefined();
  });
});
