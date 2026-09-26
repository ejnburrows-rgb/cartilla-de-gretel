import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
      expect(image.getAttribute("srcset")).toBe(
        `/cartilla/art/delivery/faithful/384/${src.split("/faithful/")[1]} 1x, /cartilla/art/delivery/faithful/768/${src.split("/faithful/")[1]} 2x`,
      );
      expect(image.parentElement?.getAttribute("data-ambient-motion")).toBe(
        src.endsWith("oruga.webp") ? "sway" : "none",
      );
      expect(screen.queryByText(/pendiente de color/i)).toBeNull();
    });
  }

  it("keeps gallery art static unless its exact source is allow-listed", () => {
    for (const animal of ANIMAL_GALLERY) {
      const { unmount } = render(
        <LivingIllustration src={animal.illustrationSrc} alt={animal.word} />,
      );
      const wrapper = screen.getByRole("img", { name: animal.word }).parentElement;
      const approved = animal.illustrationSrc === "/cartilla/art/faithful/vocal-o/oso.webp";
      expect(wrapper?.getAttribute("data-ambient-motion"), animal.word).toBe(
        approved ? "breathe" : "none",
      );
      expect(wrapper?.className.includes("living-illustration--creature-life"), animal.word).toBe(approved);
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

  it("keeps an explicitly approved source animated and tap-reactive", () => {
    render(
      <LivingIllustration
        src="/cartilla/art/faithful/vocal-o/oruga.webp"
        alt="oruga"
      />,
    );
    const wrapper = screen.getByRole("img", { name: "oruga" }).parentElement;
    expect(wrapper?.getAttribute("data-blink-mode")).toBe("none");
    expect(wrapper?.getAttribute("data-interactive")).toBe("true");
    expect(wrapper?.querySelectorAll(".living-illustration__eyelid")).toHaveLength(0);
    expect(wrapper?.className).toContain("living-illustration--sway");
    if (!wrapper) throw new Error("missing living illustration wrapper");
    fireEvent.pointerDown(wrapper);
    expect(wrapper.className).toContain("living-illustration--reacting");
  });

  it("preserves the approved source but suppresses motion when reduced motion is requested", async () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    try {
      render(<LivingIllustration src="/cartilla/art/faithful/vocal-o/oso.webp" alt="oso quieto" />);
      const wrapper = screen.getByRole("img", { name: "oso quieto" }).parentElement;
      await waitFor(() => expect(wrapper?.getAttribute("data-ambient-motion")).toBe("none"));
      expect(screen.getByRole("img", { name: "oso quieto" }).getAttribute("src")).toContain("oso.webp");
    } finally {
      window.matchMedia = original;
    }
  });
});
