import { describe, expect, it } from "vitest";
import {
  pictureNameKey,
  resolvePictureName,
  resolvePictureNameByLabel,
  resolveRecordedPictureName,
} from "../picture-vocabulary";
import vocabulary from "@/content/picture-vocabulary.json";

describe("picture-vocabulary", () => {
  describe("pictureNameKey", () => {
    it("normalizes to NFC, trims, collapses spaces, and lowercases in Spanish", () => {
      expect(pictureNameKey("  Árbol  Grande  ")).toBe("árbol grande");
      expect(pictureNameKey("Niño")).toBe("niño");
      expect(pictureNameKey(" OSO ")).toBe("oso");
    });
  });

  describe("resolvePictureName", () => {
    it("returns null for unknown image sources", () => {
      expect(resolvePictureName("/not/a/real/image.png")).toBeNull();
    });

    it("resolves unique images without authoredLabel", () => {
      const entry = vocabulary.find((e) => e.images.length > 0);
      expect(entry).toBeDefined();
      if (entry) {
        const src = entry.images[0];
        const resolved = resolvePictureName(src);
        expect(resolved).not.toBeNull();
        expect(resolved?.images).toContain(src);
      }
    });

    it("uses authoredLabel to disambiguate if provided and matching", () => {
      const entry = vocabulary.find((e) => e.key === "abeja");
      const src = entry?.images[0];
      expect(src).toBeDefined();
      if (src) {
        const resolved = resolvePictureName(src, "abeja");
        expect(resolved).not.toBeNull();
        expect(resolved?.key).toBe("abeja");

        // mismatched label returns null because candidates.find(...) doesn't match
        const notFound = resolvePictureName(src, "avión");
        expect(notFound).toBeNull();
      }
    });

    it("returns null if authoredLabel is provided but does not match any candidates", () => {
      const entry = vocabulary.find((e) => e.key === "abeja");
      const src = entry?.images[0];
      expect(src).toBeDefined();
      if (src) {
        expect(resolvePictureName(src, "wrong label")).toBeNull();
      }
    });
  });

  describe("resolvePictureNameByLabel", () => {
    it("resolves exact canonical labels only", () => {
      expect(resolvePictureNameByLabel("  abeja ")?.key).toBe("abeja");
      expect(resolvePictureNameByLabel("arbitrary syllable")).toBeNull();
    });
  });

  describe("resolveRecordedPictureName", () => {
    it("accepts an exact catalog word only when it has an approved recording", () => {
      expect(resolveRecordedPictureName(" OSO ")?.key).toBe("oso");
      expect(resolveRecordedPictureName("ma")).toBeNull();
      expect(resolveRecordedPictureName("unknown word")).toBeNull();
    });
  });
});
