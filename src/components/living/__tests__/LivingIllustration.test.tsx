import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LivingIllustration } from "../LivingIllustration";
import { ANIMAL_GALLERY } from "@/content/animal-gallery";

describe("LivingIllustration faithful recovered art", () => {
  for (const [word, src] of [
    ["abrigo", "/cartilla/art/faithful/leccion-1/abrigo.webp"],
    ["globo", "/cartilla/art/faithful/leccion-1/globo.webp"],
    ["oruga", "/cartilla/art/faithful/vocal-o/oruga.webp"],
  ] as const) {
    it(`keeps canonical ${word} art as fallback and wires clean responsive delivery derivatives`, () => {
      render(<LivingIllustration src={src} alt={word} />);
      const image = screen.getByRole("img", { name: word });
      expect(image.getAttribute("src")).toBe(src);
      expect(image.getAttribute("srcset")).toBe(\n        `/cartilla/art/delivery/faithful/384/${src.split("/faithful/")[1]} 1x, /cartilla/art/delivery/faithful/768/${src.split("/faithful/")[1]} 2x`,\n      );
      expect(image.parentElement?.getAttribute("data-ambient-motion")).not.toBe("none");
      expect(screen.queryByText(/pendiente de color/i)).toBeNull();
    });
  }

  it("makes every verified animal in the gallery visibly blink and move", () => {
    for (const animal of ANIMAL_GALLERY) {
      const { unmount } = render(
        <LivingIllustration src={animal.illustrationSrc} alt={animal.word} />,
      );
      const wrapper = screen.getByRole("img", { name: animal.word }).parentElement;
      expect(wrapper?.getAttribute("data-blink-mode"), animal.word).not.toBe("none");
      expect(wrapper?.className, animal.word).toContain("living-illustration--creature-life");
      unmount();
    }
  });

  it("uses a true closed-eye frame when one exists", () => {
    render(
      <LivingIllustration
        src="/cartilla/art/faithful/vocal-o/oso.webp"
        alt="oso"
      />,
    );
    const wrapper = screen.getByRole("img", { name: "oso" }).parentElement;
    expect(wrapper?.getAttribute("data-blink-mode")).toBe("frame");
  });

  it("keeps unmapped living creatures animated and tap-reactive", () => {
    render(
      <LivingIllustration
        src="/cartilla/art/faithful/vocal-o/oruga.webp"
        alt="oruga"
      />,
    );
    const wrapper = screen.getByRole("img", { name: "oruga" }).parentElement;
    expect(wrapper?.getAttribute("data-blink-mode")).toBe("fallback");
    expect(wrapper?.getAttribute("data-interactive")).toBe("true");
    expect(wrapper?.querySelectorAll(".living-illustration__eyelid")).toHaveLength(2);
    expect(wrapper?.className).toContain("living-illustration--creature-life");
    if (!wrapper) throw new Error("missing living illustration wrapper");
    fireEvent.pointerDown(wrapper);
    expect(wrapper.className).toContain("living-illustration--reacting");
  });
});
