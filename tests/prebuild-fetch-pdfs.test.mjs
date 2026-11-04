import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { redactBookPdfUrl, validateBookPdf } from "../scripts/prebuild-fetch-pdfs.mjs";

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

describe("prebuild Workbook PDF validation", () => {
  it("accepts bytes only when signature, size and digest all match", () => {
    const pdf = Buffer.from("%PDF-1.7\ncanonical test bytes");
    expect(() =>
      validateBookPdf(pdf, {
        expectedSha256: sha256(pdf),
        expectedBytes: pdf.length,
        minBytes: 5,
      }),
    ).not.toThrow();
  });

  it("rejects an HTML/auth response even when it was returned successfully", () => {
    const html = Buffer.from("<!doctype html><title>Sign in</title>");
    expect(() =>
      validateBookPdf(html, {
        expectedSha256: sha256(html),
        expectedBytes: html.length,
        minBytes: 5,
      }),
    ).toThrow(/PDF signature/);
  });

  it("rejects a different valid PDF by digest", () => {
    const pdf = Buffer.from("%PDF-1.7\nwrong document");
    expect(() =>
      validateBookPdf(pdf, {
        expectedSha256: "0".repeat(64),
        expectedBytes: pdf.length,
        minBytes: 5,
      }),
    ).toThrow(/SHA-256/);
  });

  it("rejects undersized or truncated PDF bytes", () => {
    const pdf = Buffer.from("%PDF-");
    expect(() =>
      validateBookPdf(pdf, {
        expectedSha256: sha256(pdf),
        expectedBytes: pdf.length,
        minBytes: 100,
      }),
    ).toThrow(/too small/);
  });

  it("redacts URL credentials and query tokens from build logs", () => {
    const safe = redactBookPdfUrl("https://user:secret@example.com/private/book.pdf?token=abc#fragment");
    expect(safe).toBe("https://example.com/private/book.pdf");
    expect(safe).not.toContain("secret");
    expect(safe).not.toContain("token");
  });
});
