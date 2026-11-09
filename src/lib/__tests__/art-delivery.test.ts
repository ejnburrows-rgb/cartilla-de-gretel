import { describe, expect, it } from "vitest";
import {
  getFaithfulDeliverySrc,
  getFaithfulDeliverySrcSet,
  isFaithfulCanonicalArt,
} from "../art-delivery";

describe("faithful art delivery paths", () => {
  const src = "/cartilla/art/faithful/vocal-a/abanico.webp";

  it("maps canonical faithful art to disposable responsive tiers", () => {
    expect(getFaithfulDeliverySrc(src, 384)).toBe(
      "/cartilla/art/delivery/faithful/384/vocal-a/abanico.webp",
    );
    expect(getFaithfulDeliverySrc(src, 768)).toBe(
      "/cartilla/art/delivery/faithful/768/vocal-a/abanico.webp",
    );
    expect(getFaithfulDeliverySrcSet(src)).toContain("384/vocal-a/abanico.webp 1x");
    expect(getFaithfulDeliverySrcSet(src)).toContain("768/vocal-a/abanico.webp 2x");
  });

  it("leaves non-faithful sources untouched", () => {
    const gretel = "/cartilla/images/gretel/gretel-approved-master.png";
    expect(isFaithfulCanonicalArt(gretel)).toBe(false);
    expect(getFaithfulDeliverySrc(gretel, 384)).toBe(gretel);
    expect(getFaithfulDeliverySrcSet(gretel)).toBeUndefined();
  });

  it("serves the owner-approved bee and single eye from their canonical masters, never stale derivatives", () => {
    for (const approved of [
      "/cartilla/art/faithful/vocal-a/abeja.webp",
      "/cartilla/art/faithful/leccion-1/ojos.webp",
    ]) {
      expect(isFaithfulCanonicalArt(approved)).toBe(true);
      expect(getFaithfulDeliverySrc(approved, 384)).toBe(approved);
      expect(getFaithfulDeliverySrc(approved, 768)).toBe(approved);
      expect(getFaithfulDeliverySrcSet(approved)).toBeUndefined();
    }
  });
});
