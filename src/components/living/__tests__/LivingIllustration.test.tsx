import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LivingIllustration } from "../LivingIllustration";

describe("LivingIllustration faithful recovered art", () => {
  for (const [word, src] of [
    ["abrigo", "/cartilla/art/faithful/leccion-1/abrigo.webp"],
    ["globo", "/cartilla/art/faithful/leccion-1/globo.webp"],
    ["oruga", "/cartilla/art/faithful/vocal-o/oruga.webp"],
  ] as const) {
    it(`renders QA-PASS authentic ${word} art instead of a pending placeholder`, () => {
      render(<LivingIllustration src={src} alt={word} />);
      const image = screen.getByRole("img", { name: word });
      expect(image.getAttribute("src")).toBe(src);
      expect(image.getAttribute("srcset")).toContain("/cartilla/art/delivery/faithful/384/");
      expect(screen.queryByText(/pendiente de color/i)).toBeNull();
    });
  }
});
