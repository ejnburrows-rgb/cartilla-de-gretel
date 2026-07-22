import { describe, it, expect } from "vitest";
import { encodeShareToken, decodeShareToken, shareUrl, isShareToken } from "../url-share";

describe("url-share tokens", () => {
  it("round-trips kind + id through encode/decode", () => {
    for (const kind of ["report", "page", "lesson", "badge"] as const) {
      const token = encodeShareToken(kind, "student-42");
      expect(decodeShareToken(token)).toEqual({ kind, id: "student-42" });
    }
  });

  it("produces a stable token for the same (kind, id)", () => {
    expect(encodeShareToken("report", "abc")).toBe(encodeShareToken("report", "abc"));
  });

  it("produces lowercase base32 tokens (a-z, 2-7)", () => {
    const token = encodeShareToken("lesson", "7");
    expect(token).toMatch(/^[a-z2-7]+$/);
  });

  it("rejects a token whose decoded kind is not a known ShareKind", () => {
    const bogus = encodeShareToken("report", "x").replace(/^./, "z"); // corrupt the kind byte
    const decoded = decodeShareToken(bogus);
    // Either it no longer parses to a known kind, or the split fails -> null
    if (decoded) expect(["report", "page", "lesson", "badge"]).toContain(decoded.kind);
    else expect(decoded).toBeNull();
  });

  it("shareUrl embeds the token under /r/ using the given origin", () => {
    const url = shareUrl("report", "abc", "https://example.test");
    expect(url).toBe(`https://example.test/r/${encodeShareToken("report", "abc")}`);
  });

  describe("isShareToken", () => {
    it("accepts base32 strings of length >= 4", () => {
      expect(isShareToken(encodeShareToken("report", "abc"))).toBe(true);
      expect(isShareToken("abcd")).toBe(true);
    });
    it("rejects too-short or out-of-alphabet strings", () => {
      expect(isShareToken("ab")).toBe(false);
      expect(isShareToken("ABC1!")).toBe(false); // uppercase/8/9/! not in base32
    });
  });
});
