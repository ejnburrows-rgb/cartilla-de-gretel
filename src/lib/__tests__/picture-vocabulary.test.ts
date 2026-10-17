import { describe, expect, it } from "vitest";
import { pictureNameKey, resolvePictureName } from "../picture-vocabulary";
import vocabulary from "@/content/picture-vocabulary.json";

describe("picture-vocabulary", () => {
  describe("pictureNameKey", () => {
    it("normalizes, trims, squashes spaces, and lowercase", () => {
      expect(pictureNameKey("  Árbol  ")).toBe("árbol");
      expect(pictureNameKey("niño")).toBe("niño");
      expect(pictureNameKey("A   la   fiesta")).toBe("a la fiesta");
    });
  });

  describe("resolvePictureName", () => {
    it("resolves a unique image to its vocabulary entry", () => {
      // Find an image that maps to exactly one vocabulary item
      const entry = vocabulary.find((e) => e.key === "abeja");
      const src = entry?.images[0];
      expect(src).toBeDefined();
      if (src) {
        const resolved = resolvePictureName(src);
        expect(resolved).not.toBeNull();
        expect(resolved?.key).toBe("abeja");
        expect(resolved?.name).toBe("abeja");
      }
    });

    it("returns null for an unknown image src", () => {
      expect(resolvePictureName("/unknown/image.png")).toBeNull();
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
});
