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
    const gretel = "/cartilla/images/gretel/poses/gretel-idle.webp";
    expect(isFaithfulCanonicalArt(gretel)).toBe(false);
    expect(getFaithfulDeliverySrc(gretel, 384)).toBe(gretel);
    expect(getFaithfulDeliverySrcSet(gretel)).toBeUndefined();
  });
});
